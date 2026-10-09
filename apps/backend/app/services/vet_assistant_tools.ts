import { DateTime } from 'luxon'
import ClinicAppointment, { APPOINTMENT_TYPE_LABELS } from '#models/clinic_appointment'
import VetInventoryItem from '#models/vet_inventory_item'
import VetInvoice from '#models/vet_invoice'
import VetPayment from '#models/vet_payment'
import VetReminder from '#models/vet_reminder'
import Veterinarian from '#models/veterinarian'
import { balanceOf, round2 } from '#services/vet_accounting'
import { scopedPets } from '#services/vet_patient_scope'
import type { Capability } from '#services/vet_permissions'

/**
 * Ce que l'assistant peut consulter dans les données du cabinet.
 *
 * Trois principes, et ils ne se négocient pas :
 *
 * 1. **Jamais de SQL écrit par le modèle.** Chaque interrogation est une
 *    fonction figée, aux paramètres validés. Un modèle qui compose des
 *    requêtes compose aussi, tôt ou tard, celle qu'on ne voulait pas.
 * 2. **Le cabinet est imposé par le serveur**, jamais passé en paramètre. Le
 *    modèle n'a aucun moyen d'exprimer « les rendez-vous d'un confrère » :
 *    l'identifiant ne fait pas partie de ce qu'il peut remplir.
 * 3. **Lecture seule.** Aucun outil n'écrit. Une phrase mal comprise ne doit
 *    pas pouvoir annuler un rendez-vous ou solder une facture.
 *
 * S'y ajoute la grille de permissions : une secrétaire sans accès à la
 * facturation n'obtient pas le chiffre d'affaires en passant par l'assistant.
 */

/** Plafond de lignes rendues. Au-delà, on résume plutôt que de tout verser. */
const MAX_LIGNES = 40

export interface OutilAssistant {
  nom: string
  description: string
  /** Domaine requis ; `null` quand l'outil est ouvert à tous. */
  capability: Capability | null
  /** Absent quand l'outil n'attend aucun paramètre. */
  parametres?: Record<string, unknown>
  executer: (vet: Veterinarian, args: Record<string, any>) => Promise<unknown>
}

/* ───────────────────────────── Dates ───────────────────────────── */

/**
 * Interprète une borne de date.
 *
 * Le modèle tend à écrire « ce mois-ci » ou à inventer un format : on accepte
 * l'ISO et quelques mots courants, et on refuse le reste plutôt que de laisser
 * `new Date()` produire silencieusement une date fausse.
 */
function borne(valeur: unknown, defaut: DateTime): string {
  const brut = String(valeur ?? '').trim().toLowerCase()
  if (!brut) return defaut.toISODate()!

  const raccourcis: Record<string, DateTime> = {
    "aujourd'hui": DateTime.now(),
    aujourdhui: DateTime.now(),
    demain: DateTime.now().plus({ days: 1 }),
    hier: DateTime.now().minus({ days: 1 }),
    'debut du mois': DateTime.now().startOf('month'),
    'début du mois': DateTime.now().startOf('month'),
    'fin du mois': DateTime.now().endOf('month'),
  }
  if (raccourcis[brut]) return raccourcis[brut].toISODate()!

  const iso = DateTime.fromISO(brut)
  return iso.isValid ? iso.toISODate()! : defaut.toISODate()!
}

/** Par défaut, le mois en cours : c'est la fenêtre qu'on interroge le plus. */
function periode(args: Record<string, any>) {
  const now = DateTime.now()
  return {
    du: borne(args.du, now.startOf('month')),
    au: borne(args.au, now.endOf('month')),
  }
}

const PERIODE_PARAMS = {
  du: { type: 'string', description: 'Date de début, au format AAAA-MM-JJ. Par défaut le 1er du mois en cours.' },
  au: { type: 'string', description: 'Date de fin, au format AAAA-MM-JJ. Par défaut la fin du mois en cours.' },
}

/* ───────────────────────────── Outils ───────────────────────────── */

export const OUTILS: OutilAssistant[] = [
  {
    nom: 'rendez_vous',
    description:
      'Liste ou dénombre les rendez-vous du cabinet sur une période, avec filtres facultatifs ' +
      'par type et par statut. ' +
      'À utiliser pour toute question sur le planning, les consultations, les chirurgies ou les vaccinations prévues.',
    capability: 'agenda',
    parametres: {
      ...PERIODE_PARAMS,
      type: {
        type: 'string',
        enum: Object.keys(APPOINTMENT_TYPE_LABELS),
        description: 'Type de rendez-vous. Omettre pour tous les types.',
      },
      statut: {
        type: 'string',
        enum: ['pending', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show'],
        description: 'Statut du rendez-vous. Omettre pour tous les statuts.',
      },
    },
    async executer(vet, args) {
      const { du, au } = periode(args)

      let q = ClinicAppointment.query()
        .where('veterinarian_id', vet.id)
        .whereBetween('date', [du, au])

      if (args.type && APPOINTMENT_TYPE_LABELS[args.type]) q = q.where('type', args.type)
      if (args.statut) q = q.where('status', args.statut)

      const tous = await q.orderBy('date', 'asc').orderBy('start_time', 'asc')

      // Le décompte porte sur l'ensemble, la liste seulement sur ce qui tient :
      // sinon un mois chargé ferait répondre « 40 » au lieu du vrai total.
      const parType: Record<string, number> = {}
      for (const r of tous) {
        const label = APPOINTMENT_TYPE_LABELS[r.type] ?? r.type
        parType[label] = (parType[label] ?? 0) + 1
      }

      return {
        periode: { du, au },
        total: tous.length,
        repartitionParType: parType,
        rendezVous: tous.slice(0, MAX_LIGNES).map((r) => ({
          date: r.date,
          heure: r.startTime,
          type: APPOINTMENT_TYPE_LABELS[r.type] ?? r.type,
          statut: r.status,
          animal: r.petName,
          client: r.clientName,
          motif: r.reason,
        })),
        tronque: tous.length > MAX_LIGNES,
      }
    },
  },

  {
    nom: 'factures_impayees',
    description:
      'Liste ou dénombre les factures encore dues, avec le reste à encaisser et le retard éventuel. ' +
      'À utiliser pour les questions sur les impayés, les créances ou les relances.',
    capability: 'billing',
    async executer(vet) {
      const factures = await VetInvoice.query()
        .where('veterinarian_id', vet.id)
        .whereNot('status', 'draft')
        .where('type', 'invoice')
        .orderBy('due_date', 'asc')

      const avoirs = await VetInvoice.query()
        .where('veterinarian_id', vet.id)
        .where('type', 'credit_note')
        .whereNotNull('cancels_invoice_id')
        .select('cancels_invoice_id')

      const annulees = new Set(avoirs.map((a) => a.cancelsInvoiceId as number))

      const reglements = await VetPayment.query().where('veterinarian_id', vet.id)
      const parFacture = new Map<number, VetPayment[]>()
      for (const p of reglements) {
        parFacture.set(p.invoiceId, [...(parFacture.get(p.invoiceId) ?? []), p])
      }

      const today = DateTime.now().toISODate()!
      const dues = factures
        .filter((f) => !annulees.has(f.id))
        .map((f) => ({ f, reste: balanceOf(f, parFacture.get(f.id) ?? []) }))
        .filter(({ reste }) => reste > 0.009)

      return {
        total: dues.length,
        montantTotalDu: round2(dues.reduce((s, d) => s + d.reste, 0)),
        montantEnRetard: round2(
          dues.filter(({ f }) => String(f.dueDate) < today).reduce((s, d) => s + d.reste, 0)
        ),
        factures: dues.slice(0, MAX_LIGNES).map(({ f, reste }) => ({
          numero: f.number,
          client: f.clientName,
          date: f.date,
          echeance: f.dueDate,
          total: Number(f.total),
          resteDu: reste,
          enRetard: String(f.dueDate) < today,
        })),
        tronque: dues.length > MAX_LIGNES,
      }
    },
  },

  {
    nom: 'chiffre_affaires',
    description:
      'Chiffre d’affaires et encaissements sur une période, avec la ventilation de TVA par taux. ' +
      'À utiliser pour les questions de recettes, de TVA ou de comparaison entre mois.',
    capability: 'billing',
    parametres: { ...PERIODE_PARAMS },
    async executer(vet, args) {
      const { du, au } = periode(args)

      const pieces = await VetInvoice.query()
        .where('veterinarian_id', vet.id)
        .whereNot('status', 'draft')
        .whereBetween('date', [du, au])
        .preload('items')

      // Un avoir se soustrait : l'additionner compterait la recette deux fois
      // au lieu de la neutraliser.
      const ht = round2(
        pieces.reduce((s, f) => s + (f.type === 'credit_note' ? -1 : 1) * Number(f.subtotal), 0)
      )
      const tva = round2(
        pieces.reduce((s, f) => s + (f.type === 'credit_note' ? -1 : 1) * Number(f.tax), 0)
      )

      const encaisse = await VetPayment.query()
        .where('veterinarian_id', vet.id)
        .whereBetween('date', [du, au])

      return {
        periode: { du, au },
        piecesEmises: pieces.length,
        totalHT: ht,
        totalTVA: tva,
        totalTTC: round2(ht + tva),
        encaissementsSurLaPeriode: round2(
          encaisse.reduce((s, p) => s + Number(p.amount), 0)
        ),
        nombreReglements: encaisse.length,
      }
    },
  },

  {
    nom: 'rappels',
    description:
      'Liste ou dénombre les rappels de soins à venir ou en retard : vaccins, vermifuges, contrôles. ' +
      'À utiliser pour savoir qui doit être recontacté.',
    capability: 'reminders',
    parametres: {
      ...PERIODE_PARAMS,
      inclureTermines: {
        type: 'boolean',
        description: 'Inclure les rappels déjà effectués. Faux par défaut.',
      },
    },
    async executer(vet, args) {
      const { du, au } = periode(args)

      let q = VetReminder.query()
        .where('veterinarian_id', vet.id)
        .whereBetween('due_date', [du, au])

      if (!args.inclureTermines) q = q.where('is_completed', false)

      const tous = await q.orderBy('due_date', 'asc')
      const today = DateTime.now().toISODate()!

      return {
        periode: { du, au },
        total: tous.length,
        enRetard: tous.filter((r) => String(r.dueDate) < today).length,
        rappels: tous.slice(0, MAX_LIGNES).map((r) => ({
          echeance: r.dueDate,
          type: r.type,
          intitule: r.title,
          animal: r.petName,
          client: r.clientName,
          enRetard: String(r.dueDate) < today,
        })),
        tronque: tous.length > MAX_LIGNES,
      }
    },
  },

  {
    nom: 'stock',
    description:
      'État du stock : articles sous le seuil d’alerte, ou recherche d’un article par son nom. ' +
      'À utiliser pour savoir ce qui manque ou ce qu’il reste d’un produit.',
    capability: 'stock',
    parametres: {
      recherche: {
        type: 'string',
        description: 'Fragment du nom d’un article. Omettre pour n’obtenir que les alertes.',
      },
    },
    async executer(vet, args) {
      let q = VetInventoryItem.query().where('veterinarian_id', vet.id).where('is_active', true)

      const recherche = String(args.recherche ?? '').trim()
      if (recherche) {
        q = q.whereILike('name', `%${recherche}%`)
      } else {
        // Sans recherche, seules les alertes intéressent : verser tout le stock
        // noierait la réponse.
        q = q.whereRaw('quantity <= min_stock')
      }

      const items = await q.orderBy('name', 'asc')

      return {
        filtre: recherche || 'articles sous le seuil d’alerte',
        total: items.length,
        articles: items.slice(0, MAX_LIGNES).map((i) => ({
          nom: i.name,
          categorie: i.category,
          quantite: Number(i.quantity),
          unite: i.unit,
          seuilAlerte: Number(i.minStock),
          sousLeSeuil: Number(i.quantity) <= Number(i.minStock),
          prix: Number(i.price),
        })),
        tronque: items.length > MAX_LIGNES,
      }
    },
  },

  {
    nom: 'patients',
    description:
      'Liste ou dénombre les patients du cabinet. Filtres facultatifs par nom d’animal, ' +
      'espèce ou nom du propriétaire ; sans filtre, rend tous les patients. ' +
      'À utiliser aussi bien pour « combien de chats ai-je » que pour « le chien de M. Durand ».',
    capability: 'patients',
    parametres: {
      recherche: {
        type: 'string',
        description:
          'Nom de l’animal ou de son propriétaire, ou fragment. Les deux sont cherchés.',
      },
      proprietaire: { type: 'string', description: 'Nom ou prénom du propriétaire seulement.' },
      espece: { type: 'string', enum: ['dog', 'cat', 'nac'], description: 'Espèce.' },
    },
    async executer(vet, args) {
      let q = scopedPets(vet.id).preload('externalClient').preload('user')

      const recherche = String(args.recherche ?? '').trim()
      const proprietaire = String(args.proprietaire ?? '').trim()

      if (args.espece) q = q.where('pets.species', args.espece)

      /**
       * Les animaux dont le propriétaire porte ce nom, inscrit ou non.
       *
       * La comparaison porte sur le nom complet reconstitué, et non sur chaque
       * champ pris à part : « Marc Delaunay » ne figure ni dans `first_name`
       * ni dans `last_name`, et la recherche ne rendait rien alors que le
       * client existait. Reconstitué, le libellé répond aussi bien au prénom
       * seul qu'au nom seul.
       *
       * Les deux clauses sont en `orWhere` : dans un groupe où tout doit
       * s'additionner, un `where` ordinaire vaut ET et annule les alternatives.
       */
      const parProprietaire = (groupe: any, terme: string) => {
        const motif = `%${terme}%`
        const nomComplet = "COALESCE(first_name, '') || ' ' || COALESCE(last_name, '')"

        groupe.orWhereIn('pets.external_client_id', (sub: any) =>
          sub
            .from('vet_external_clients')
            .select('id')
            .where('veterinarian_id', vet.id)
            .whereRaw(`${nomComplet} ILIKE ?`, [motif])
        )
        groupe.orWhereIn('pets.user_id', (sub: any) =>
          sub.from('users').select('id').whereRaw(`${nomComplet} ILIKE ?`, [motif])
        )
      }

      /**
       * « Le chien de Marc Delaunay » : le modèle met la phrase tantôt dans le
       * nom de l'animal, tantôt dans celui du propriétaire. On cherche donc des
       * deux côtés plutôt que de dépendre du bon choix de paramètre.
       */
      if (recherche) {
        q = q.where((sur) => {
          sur.whereILike('pets.name', `%${recherche}%`)
          parProprietaire(sur, recherche)
        })
      }

      if (proprietaire) q = q.where((sur) => parProprietaire(sur, proprietaire))

      const pets = await q.orderBy('pets.name', 'asc')

      const nomProprietaire = (p: any) => {
        const c = p.externalClient ?? p.user
        return c ? [c.firstName, c.lastName].filter(Boolean).join(' ') || c.email : null
      }

      return {
        total: pets.length,
        patients: pets.slice(0, MAX_LIGNES).map((p) => ({
          nom: p.name,
          espece: p.species,
          race: p.breed,
          naissance: p.birthDate ? p.birthDate.toISODate() : null,
          poids: p.weight ? Number(p.weight) : null,
          proprietaire: nomProprietaire(p),
        })),
        tronque: pets.length > MAX_LIGNES,
      }
    },
  },
]

/**
 * Les outils ouverts à cet utilisateur.
 *
 * La grille de permissions s'applique ici aussi : sans elle, l'assistant
 * deviendrait le chemin de contournement de tout le cloisonnement — une
 * secrétaire demanderait le chiffre d'affaires et l'obtiendrait.
 */
export function outilsAutorises(peut: (c: Capability) => boolean): OutilAssistant[] {
  return OUTILS.filter((o) => !o.capability || peut(o.capability))
}

/** Les définitions au format attendu par l'API de complétion. */
export function definitionsOutils(outils: OutilAssistant[]) {
  return outils.map((o) => ({
    type: 'function' as const,
    function: {
      name: o.nom,
      description: o.description,
      parameters: {
        type: 'object',
        properties: o.parametres ?? {},
        required: [],
        additionalProperties: false,
      },
    },
  }))
}
