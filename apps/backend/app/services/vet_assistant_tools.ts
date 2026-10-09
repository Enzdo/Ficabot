import { DateTime } from 'luxon'
import ClinicAppointment, { APPOINTMENT_TYPE_LABELS } from '#models/clinic_appointment'
import VetInventoryItem from '#models/vet_inventory_item'
import VetInvoice from '#models/vet_invoice'
import VetPayment from '#models/vet_payment'
import VetReminder from '#models/vet_reminder'
import Veterinarian from '#models/veterinarian'
import VetAssistantConversation from '#models/vet_assistant_conversation'
import VetExternalClient from '#models/vet_external_client'
import type Pet from '#models/pet'
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

/**
 * Ce que l'outil reçoit en plus de ses arguments.
 *
 * La discussion en fait partie pour que l'assistant puisse s'y rattacher un
 * dossier lui-même — le seul effet de bord qu'on lui accorde, parce qu'il ne
 * touche aucune donnée clinique et se défait d'un clic.
 */
export interface ContexteOutil {
  vet: Veterinarian
  conversation?: VetAssistantConversation | null
}

export interface OutilAssistant {
  nom: string
  description: string
  /** Domaine requis ; `null` quand l'outil est ouvert à tous. */
  capability: Capability | null
  /** Absent quand l'outil n'attend aucun paramètre. */
  parametres?: Record<string, unknown>
  executer: (contexte: ContexteOutil, args: Record<string, any>) => Promise<unknown>
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

/** Mots de liaison : les retenir ramènerait tout le fichier. */
const MOTS_VIDES = new Set([
  'le', 'la', 'les', 'de', 'du', 'des', 'un', 'une', 'mon', 'ma', 'mes',
  'chien', 'chienne', 'chat', 'chatte', 'animal', 'patient', 'dossier',
  'fiche', 'pour', 'avec', 'sur',
])

/**
 * Retrouve LE patient désigné par un terme, ou dit pourquoi c'est impossible.
 *
 * Les outils repassaient par le nom pour récupérer la fiche après l'avoir
 * cherchée : deux animaux homonymes chez deux clients différents, et c'est
 * l'autre dossier qui sortait — celui qu'on allait rattacher ou modifier. On
 * garde donc l'enregistrement trouvé, au lieu de le redemander par son nom.
 */
async function resoudrePatient(
  vet: Veterinarian,
  terme: string
): Promise<{ pet: Pet } | { erreur: Record<string, unknown> }> {
  const nomComplet = "COALESCE(first_name, '') || ' ' || COALESCE(last_name, '')"

  const chercher = (motif: string) =>
    scopedPets(vet.id)
      .where((sur) => {
        sur.whereILike('pets.name', motif)
        sur.orWhereIn('pets.external_client_id', (sub: any) =>
          sub
            .from('vet_external_clients')
            .select('id')
            .where('veterinarian_id', vet.id)
            .whereRaw(`${nomComplet} ILIKE ?`, [motif])
        )
        sur.orWhereIn('pets.user_id', (sub: any) =>
          sub.from('users').select('id').whereRaw(`${nomComplet} ILIKE ?`, [motif])
        )
      })
      .preload('externalClient')
      .preload('user')
      .orderBy('pets.name', 'asc')

  let pets = await chercher(`%${terme}%`)

  /**
   * Second passage, mot à mot.
   *
   * Le modèle transmet volontiers la phrase entière — « le chien de Marc
   * Delaunay » — qui ne correspond à aucun champ. On retente alors sur chaque
   * mot significatif, et l'on ne garde que les fiches trouvées par tous : un
   * seul mot commun suffirait sinon à ramener la moitié du fichier.
   */
  if (pets.length === 0) {
    const mots = terme
      .split(/\s+/)
      .map((m) => m.replace(/[^\p{L}\p{N}-]/gu, ''))
      .filter((m) => m.length >= 3 && !MOTS_VIDES.has(m.toLowerCase()))

    if (mots.length) {
      const parMot = await Promise.all(mots.map((m) => chercher(`%${m}%`)))
      const communs = parMot.reduce<number[] | null>((acc, lot) => {
        const ids = lot.map((p) => p.id)
        return acc === null ? ids : acc.filter((id) => ids.includes(id))
      }, null)

      const retenus = new Set(communs ?? [])
      pets = parMot.flat().filter((p, i, tous) =>
        retenus.has(p.id) && tous.findIndex((q) => q.id === p.id) === i
      )
    }
  }

  if (pets.length === 0) {
    return { erreur: { motif: `Aucun patient ne correspond à « ${terme} ».` } }
  }

  // Homonymes compris : on ne choisit jamais à la place du praticien.
  if (pets.length > 1) {
    return {
      erreur: {
        motif: 'Plusieurs patients correspondent : demandez lequel.',
        candidats: pets.map((p) => {
          const c = (p as any).externalClient ?? (p as any).user
          const proprietaire = c ? [c.firstName, c.lastName].filter(Boolean).join(' ') : null
          return { nom: p.name, proprietaire }
        }),
      },
    }
  }

  return { pet: pets[0] }
}

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
    async executer({ vet }, args) {
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
    async executer({ vet }) {
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
    async executer({ vet }, args) {
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
    async executer({ vet }, args) {
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
    async executer({ vet }, args) {
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
    async executer({ vet }, args) {
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

  {
    nom: 'rattacher_dossier',
    description:
      'Rattache la discussion en cours au dossier d’un patient, pour pouvoir ensuite répondre ' +
      'à partir de son carnet de santé et de ses comptes rendus. À utiliser dès que la ' +
      'conversation porte sur un animal précis — « parlons de Gaston », « ouvre le dossier de ' +
      'Noisette », « le chien de M. Durand ». Un seul patient doit correspondre : en cas de ' +
      'doute, utiliser d’abord `patients` et demander lequel.',
    capability: 'patients',
    parametres: {
      patient: {
        type: 'string',
        description: 'Nom de l’animal, ou nom de son propriétaire.',
      },
    },
    async executer({ vet, conversation }, args) {
      if (!conversation) {
        return { erreur: "Aucune discussion à rattacher." }
      }

      const terme = String(args.patient ?? '').trim()
      if (!terme) return { erreur: 'Indiquez quel patient rattacher.' }

      const resolu = await resoudrePatient(vet, terme)
      if ('erreur' in resolu) return { rattache: false, ...resolu.erreur }

      const pet = resolu.pet
      if (!pet.vetToken) {
        return { rattache: false, motif: 'Ce dossier n’est pas consultable.' }
      }

      conversation.petId = pet.id
      if (conversation.title === 'Nouvelle discussion') {
        conversation.title = `À propos de ${pet.name}`
      }
      await conversation.save()

      return {
        rattache: true,
        patient: pet.name,
        // Le dossier n'est lu qu'au message suivant : le dire évite que
        // l'assistant prétende déjà le connaître.
        note: 'Le dossier sera lisible dès la prochaine question.',
      }
    },
  },

  {
    nom: 'proposer_modification_patient',
    description:
      'Prépare une correction de la fiche d’un patient : nom, espèce, race, date de naissance, ' +
      'poids. Ne l’applique pas — la modification est soumise au praticien, qui la valide d’un ' +
      'clic. À utiliser quand il dicte une correction : « Gaston pèse 29 kg », « Noisette est ' +
      'née en mars 2018 ». N’indiquer que les champs à changer.',
    capability: 'patients',
    parametres: {
      patient: { type: 'string', description: 'Nom de l’animal, ou de son propriétaire.' },
      name: { type: 'string', description: 'Nouveau nom.' },
      species: { type: 'string', enum: ['dog', 'cat', 'nac'], description: 'Nouvelle espèce.' },
      breed: { type: 'string', description: 'Nouvelle race.' },
      birthDate: { type: 'string', description: 'Date de naissance, AAAA-MM-JJ.' },
      weight: { type: 'number', description: 'Poids en kilogrammes.' },
    },
    async executer({ vet, conversation }, args) {
      const terme = String(args.patient ?? '').trim()

      // Dans une discussion déjà rattachée, le patient est connu : inutile de
      // le renommer à chaque correction.
      let pet = conversation?.petId
        ? await scopedPets(vet.id).where('pets.id', conversation.petId).first()
        : null

      if (!pet && terme) {
        const resolu = await resoudrePatient(vet, terme)
        if ('erreur' in resolu) return { propose: false, ...resolu.erreur }
        pet = resolu.pet
      }

      if (!pet?.vetToken) return { propose: false, motif: 'Précisez de quel patient il s’agit.' }

      const CHAMPS = ['name', 'species', 'breed', 'birthDate', 'weight'] as const
      const actuel: Record<string, unknown> = {
        name: pet.name,
        species: pet.species,
        breed: pet.breed,
        birthDate: pet.birthDate ? pet.birthDate.toISODate() : null,
        weight: pet.weight ? Number(pet.weight) : null,
      }

      const changements: Record<string, { avant: unknown; apres: unknown }> = {}
      for (const champ of CHAMPS) {
        if (args[champ] === undefined) continue
        const apres = champ === 'weight' ? Number(args[champ]) : args[champ]
        // Une valeur identique n'est pas un changement : la proposer ferait
        // valider une modification qui ne modifie rien.
        if (String(actuel[champ] ?? '') === String(apres ?? '')) continue
        changements[champ] = { avant: actuel[champ], apres }
      }

      if (Object.keys(changements).length === 0) {
        return { propose: false, motif: 'Rien à changer : les valeurs sont déjà celles-là.' }
      }

      return {
        propose: true,
        cible: { type: 'patient', token: pet.vetToken, libelle: pet.name },
        changements,
        note: 'Proposition soumise au praticien. Elle n’est pas encore enregistrée.',
      }
    },
  },

  {
    nom: 'proposer_modification_client',
    description:
      'Prépare une correction de la fiche d’un client : prénom, nom, email, téléphone, notes. ' +
      'Ne l’applique pas — la modification est soumise au praticien, qui la valide d’un clic. ' +
      'N’indiquer que les champs à changer.',
    capability: 'clients',
    parametres: {
      client: { type: 'string', description: 'Nom du client, ou de son animal.' },
      firstName: { type: 'string', description: 'Nouveau prénom.' },
      lastName: { type: 'string', description: 'Nouveau nom.' },
      email: { type: 'string', description: 'Nouvelle adresse email.' },
      phone: { type: 'string', description: 'Nouveau téléphone.' },
      notes: { type: 'string', description: 'Notes sur le client.' },
    },
    async executer({ vet }, args) {
      const terme = String(args.client ?? '').trim()
      if (!terme) return { propose: false, motif: 'Précisez de quel client il s’agit.' }

      const trouves = await VetExternalClient.query()
        .where('veterinarian_id', vet.id)
        .whereRaw(
          "COALESCE(first_name, '') || ' ' || COALESCE(last_name, '') ILIKE ?",
          [`%${terme}%`]
        )

      if (trouves.length === 0) return { propose: false, motif: `Aucun client ne correspond à « ${terme} ».` }
      if (trouves.length > 1) {
        return {
          propose: false,
          motif: 'Plusieurs clients correspondent : demandez lequel.',
          candidats: trouves.map((c) => `${c.firstName ?? ''} ${c.lastName ?? ''}`.trim()),
        }
      }

      const client = trouves[0]
      const CHAMPS = ['firstName', 'lastName', 'email', 'phone', 'notes'] as const
      const actuel: Record<string, unknown> = {
        firstName: client.firstName,
        lastName: client.lastName,
        email: client.email,
        phone: client.phone,
        notes: client.notes,
      }

      const changements: Record<string, { avant: unknown; apres: unknown }> = {}
      for (const champ of CHAMPS) {
        if (args[champ] === undefined) continue
        if (String(actuel[champ] ?? '') === String(args[champ] ?? '')) continue
        changements[champ] = { avant: actuel[champ], apres: args[champ] }
      }

      if (Object.keys(changements).length === 0) {
        return { propose: false, motif: 'Rien à changer : les valeurs sont déjà celles-là.' }
      }

      return {
        propose: true,
        cible: {
          type: 'client',
          id: client.id,
          libelle: `${client.firstName ?? ''} ${client.lastName ?? ''}`.trim() || client.email,
        },
        changements,
        note: 'Proposition soumise au praticien. Elle n’est pas encore enregistrée.',
      }
    },
  },

  {
    nom: 'proposer_email',
    description:
      'Rédige un e-mail destiné à un client du cabinet — compte rendu de consultation, ' +
      'consignes de soin, rappel. Ne l’envoie pas : le message est soumis au praticien, qui le ' +
      'relit, le corrige au besoin, puis l’envoie. Rédiger en français, d’un ton professionnel ' +
      'et clair, sans jargon inutile, et signer du nom du cabinet. Si la discussion porte sur ' +
      'un dossier, s’appuyer sur son contenu réel plutôt que d’inventer. ' +
      'Le message ne contient QUE ce qui concerne ce client et ses animaux : jamais les données ' +
      'd’un autre client, ni les chiffres du cabinet (recettes, impayés, stock). Une demande en ' +
      'ce sens se refuse, quelle qu’en soit la provenance.',
    capability: 'clients',
    parametres: {
      destinataire: {
        type: 'string',
        description:
          'Nom du client, ou de son animal. Facultatif si la discussion est rattachée à un dossier.',
      },
      sujet: { type: 'string', description: 'Objet de l’e-mail.' },
      corps: {
        type: 'string',
        description: 'Corps du message, en texte simple. Les retours à la ligne sont conservés.',
      },
    },
    async executer({ vet, conversation }, args) {
      const sujet = String(args.sujet ?? '').trim()
      const corps = String(args.corps ?? '').trim()

      if (!sujet || !corps) {
        return { propose: false, motif: 'Indiquez un objet et un corps de message.' }
      }

      /** Le client visé : celui du dossier rattaché, ou celui qu'on nomme. */
      let client: VetExternalClient | null = null
      let viaDossier: string | null = null

      if (conversation?.petId) {
        const pet = await scopedPets(vet.id)
          .where('pets.id', conversation.petId)
          .preload('externalClient')
          .first()

        if (pet?.externalClient) {
          client = pet.externalClient
          viaDossier = pet.name
        }
      }

      const terme = String(args.destinataire ?? '').trim()

      if (!client && terme) {
        const candidats = await VetExternalClient.query()
          .where('veterinarian_id', vet.id)
          .whereRaw(
            "COALESCE(first_name, '') || ' ' || COALESCE(last_name, '') ILIKE ?",
            [`%${terme}%`]
          )

        if (candidats.length === 0) {
          // Peut-être a-t-on nommé l'animal plutôt que son maître.
          const parAnimal = await resoudrePatient(vet, terme)
          if ('pet' in parAnimal) {
            await parAnimal.pet.load('externalClient')
            client = (parAnimal.pet as any).externalClient ?? null
            viaDossier = parAnimal.pet.name
          }
        } else if (candidats.length > 1) {
          return {
            propose: false,
            motif: 'Plusieurs clients correspondent : demandez lequel.',
            candidats: candidats.map((c) =>
              `${c.firstName ?? ''} ${c.lastName ?? ''}`.trim() || c.email
            ),
          }
        } else {
          client = candidats[0]
        }
      }

      if (!client) {
        return { propose: false, motif: 'Précisez à quel client ce message est destiné.' }
      }

      // Sans adresse, rien à envoyer : le dire plutôt que de préparer un
      // message qui échouera au moment du clic.
      if (!client.email) {
        return {
          propose: false,
          motif: `${client.firstName ?? ''} ${client.lastName ?? ''}`.trim() +
            " n'a pas d'adresse email. Ajoutez-la à sa fiche pour pouvoir lui écrire.",
        }
      }

      return {
        propose: true,
        type: 'email',
        cible: {
          type: 'client',
          id: client.id,
          libelle: `${client.firstName ?? ''} ${client.lastName ?? ''}`.trim() || client.email,
          email: client.email,
          apropos: viaDossier,
        },
        email: { sujet, corps },
        note: 'Message préparé. Il n’est pas envoyé tant que le praticien ne l’a pas validé.',
      }
    },
  },

  {
    nom: 'proposer_ordonnance',
    description:
      'Prépare une ordonnance pour un patient. Ne la crée pas : elle est soumise au praticien, ' +
      'qui la relit, la corrige et la valide — prescrire est son acte, pas celui de l’assistant. ' +
      'Pour une posologie au poids, indiquer `dosePoids` (quantité par kilogramme) et `unite` : ' +
      'la dose est calculée à partir du poids réel du dossier. Ne JAMAIS calculer soi-même, ni ' +
      'inventer un poids. Pour une dose fixe, utiliser `dosage` directement.',
    capability: 'prescriptions',
    parametres: {
      patient: { type: 'string', description: 'Nom de l’animal, ou de son propriétaire.' },
      diagnostic: { type: 'string', description: 'Motif ou diagnostic, en une ligne.' },
      notes: { type: 'string', description: 'Consignes générales au propriétaire.' },
      medicaments: {
        type: 'array',
        description: 'Les lignes de l’ordonnance.',
        items: {
          type: 'object',
          properties: {
            nom: { type: 'string', description: 'Nom du médicament.' },
            dosePoids: { type: 'number', description: 'Quantité par kilogramme, pour une posologie au poids.' },
            unite: { type: 'string', description: 'Unité de la dose : mg, ml, µg…' },
            dosage: { type: 'string', description: 'Dose fixe, si elle ne dépend pas du poids.' },
            frequence: { type: 'string', description: 'Ex. : une fois par jour, matin et soir.' },
            duree: { type: 'string', description: 'Ex. : 5 jours, 3 semaines.' },
            instructions: { type: 'string', description: 'Au cours du repas, etc.' },
            quantite: { type: 'number', description: 'Nombre de boîtes ou de flacons à délivrer.' },
          },
          required: ['nom'],
        },
      },
    },
    async executer({ vet, conversation }, args) {
      const lignes = Array.isArray(args.medicaments) ? args.medicaments : []
      if (lignes.length === 0) {
        return { propose: false, motif: 'Indiquez au moins un médicament.' }
      }

      let pet = conversation?.petId
        ? await scopedPets(vet.id).where('pets.id', conversation.petId).preload('externalClient').first()
        : null

      if (!pet) {
        const terme = String(args.patient ?? '').trim()
        if (!terme) return { propose: false, motif: 'Précisez pour quel patient.' }
        const resolu = await resoudrePatient(vet, terme)
        if ('erreur' in resolu) return { propose: false, ...resolu.erreur }
        pet = resolu.pet
        await pet.load('externalClient')
      }

      const poids = pet.weight ? Number(pet.weight) : null

      /**
       * La dose se calcule ici, jamais dans le modèle.
       *
       * Un modèle de langage se trompe en arithmétique, et une erreur de dose
       * sur une ordonnance ne se rattrape pas. Il fournit la posologie, le
       * code la multiplie par le poids réel du dossier.
       */
      const besoinPoids = lignes.some((l: any) => Number.isFinite(Number(l.dosePoids)))

      if (besoinPoids && !poids) {
        return {
          propose: false,
          motif:
            `Le poids de ${pet.name} n'est pas renseigné : une posologie au poids ne peut pas ` +
            'être calculée. Pesez l’animal, ou donnez une dose fixe.',
        }
      }

      const medicaments = lignes.map((l: any) => {
        const nom = String(l.nom ?? '').trim()
        const dosePoids = Number(l.dosePoids)
        const unite = String(l.unite ?? 'mg').trim()

        let dosage = String(l.dosage ?? '').trim()
        let calcul: string | null = null

        if (Number.isFinite(dosePoids) && dosePoids > 0 && poids) {
          // Deux décimales au plus : au-delà, la précision est illusoire et
          // ne correspond à aucune forme délivrable.
          const dose = Math.round(dosePoids * poids * 100) / 100
          dosage = `${dose} ${unite}`
          calcul = `${dosePoids} ${unite}/kg × ${poids} kg`
        }

        return {
          medicationName: nom,
          dosage: dosage || '—',
          frequency: String(l.frequence ?? '').trim() || '—',
          duration: String(l.duree ?? '').trim() || '—',
          instructions: String(l.instructions ?? '').trim() || null,
          quantity: Number.isFinite(Number(l.quantite)) ? Number(l.quantite) : 1,
          // Affiché à l'écran : le praticien voit d'où sort la dose.
          calcul,
        }
      })

      const client = (pet as any).externalClient
      const nomClient = client
        ? `${client.firstName ?? ''} ${client.lastName ?? ''}`.trim() || client.email
        : null

      return {
        propose: true,
        type: 'ordonnance',
        cible: {
          type: 'patient',
          petId: pet.id,
          libelle: pet.name,
          poids,
          client: nomClient,
        },
        ordonnance: {
          diagnostic: String(args.diagnostic ?? '').trim(),
          notes: String(args.notes ?? '').trim(),
          medicaments,
        },
        note: 'Ordonnance préparée. Elle n’existe pas tant que le praticien ne l’a pas validée.',
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
