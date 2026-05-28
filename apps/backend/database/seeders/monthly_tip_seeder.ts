import { BaseSeeder } from '@adonisjs/lucid/seeders'
import MonthlyTip from '#models/monthly_tip'

type Tip = { species: 'dog' | 'cat' | 'nac'; month: number; emoji: string; title: string; body: string }

const TIPS: Tip[] = [
  // ─── JANVIER ───
  { species: 'dog', month: 1, emoji: '❄️', title: 'Protégez les coussinets du froid', body: "Le sel de déneigement et le gel agressent les coussinets. Rincez-les à l'eau tiède au retour de balade et inspectez régulièrement la présence de crevasses. Une noisette de baume protecteur avant la sortie aide les chiens à pattes sensibles." },
  { species: 'cat', month: 1, emoji: '🌡️', title: 'Surveillez la déshydratation en intérieur', body: "Le chauffage assèche l'air et réduit la consommation d'eau du chat. Multipliez les points d'eau et envisagez une fontaine — l'eau qui coule attire naturellement. Une fontaine bien placée peut doubler l'hydratation quotidienne." },
  { species: 'nac', month: 1, emoji: '🐰', title: 'Lapins en hiver : baisse d\'activité normale', body: "Les lapins peuvent dormir davantage en hiver, c'est normal. Maintenez la température entre 15 et 20°C, évitez les courants d'air. Ils continuent à manger : tout arrêt d'appétit de plus de 12 h reste une urgence vétérinaire." },

  // ─── FÉVRIER ───
  { species: 'dog', month: 2, emoji: '🦷', title: 'Mois de la santé dentaire', body: "Février est le mois international de la santé dentaire vétérinaire. Profitez-en pour faire un bilan : tartre, mauvaise haleine, dents cassées. Un détartrage préventif coûte 4× moins cher qu'une extraction." },
  { species: 'cat', month: 2, emoji: '💕', title: 'Stress des chats : signes à repérer', body: "L'hiver confine — léchage excessif, malpropreté, agressivité peuvent traduire de l'ennui ou du stress. Enrichissez l'environnement : griffoirs en hauteur, jouets puzzle, cachettes." },
  { species: 'nac', month: 2, emoji: '🥕', title: 'Apport en vitamine C pour le cochon d\'Inde', body: "Le cochon d'Inde ne synthétise pas la vitamine C. En hiver, ajoutez quotidiennement poivron rouge, persil ou complément alimentaire. Carence = scorbut en 2 à 3 semaines." },

  // ─── MARS ───
  { species: 'dog', month: 3, emoji: '🌷', title: 'Reprise des promenades : prudence', body: "Le retour des beaux jours pousse à allonger les balades. Allez-y progressivement, surtout pour les chiens âgés ou en surpoids. Visez +10 min par jour sur 2 semaines plutôt qu'un grand bond." },
  { species: 'cat', month: 3, emoji: '🌸', title: 'Allergies printanières chez le chat', body: "Si votre chat se gratte plus, éternue ou se lèche les pattes, il peut faire une allergie aux pollens. Brossez quotidiennement pour limiter l'accumulation, parlez-en au vétérinaire si les démangeaisons persistent." },
  { species: 'nac', month: 3, emoji: '☀️', title: 'Sortie au jardin : transition douce', body: "Premiers extérieurs après l'hiver : exposez les NAC progressivement, 15 min puis 30 min, à l'ombre. Vérifiez qu'aucune plante toxique n'est accessible (lierre, rhododendron, bulbes de printemps)." },

  // ─── AVRIL ───
  { species: 'dog', month: 4, emoji: '🐛', title: 'Tiques : la saison commence', body: "Dès 7°C, les tiques sont actives. Renouvelez l'antiparasitaire (spot-on, comprimé ou collier). Au retour de balade, inspectez systématiquement aisselles, oreilles, entre les doigts. Une tique retirée en moins de 24 h transmet peu de maladies." },
  { species: 'cat', month: 4, emoji: '🌿', title: 'Herbe à chat : pourquoi et comment', body: "L'herbe à chat (orge, blé) aide à régurgiter les boules de poils. Proposez un bac d'herbe fraîche, surtout aux chats d'intérieur. Évitez les sprays au cataire si votre chat y devient hyper-réactif." },
  { species: 'nac', month: 4, emoji: '🌱', title: 'Foin de printemps de qualité', body: "Le foin est 80% de l'alimentation du lapin et du cochon d'Inde. Privilégiez un foin de printemps vert clair, parfumé, sans poussière. Un foin jaune et cassant signale du vieux stock — appétence et nutrition diminuées." },

  // ─── MAI ───
  { species: 'dog', month: 5, emoji: '🌾', title: 'Épillets : ennemi numéro 1', body: "Mai-juillet, les épillets pénètrent oreilles, narines, entre les coussinets. Vérifiez votre chien après chaque balade en herbes hautes. Symptômes : éternuement brutal, secouage de tête, boiterie soudaine — consultez le jour même." },
  { species: 'cat', month: 5, emoji: '🪟', title: 'Syndrome du chat parachutiste', body: "Avec les fenêtres ouvertes, les chutes depuis balcon/fenêtre explosent. Installez des filets de protection. Une chute du 2ème étage est souvent plus dangereuse que du 6ème (pas le temps de se retourner)." },
  { species: 'nac', month: 5, emoji: '🌡️', title: 'Coups de chaleur précoces', body: "Les NAC supportent mal au-dessus de 25°C. Placez les cages à l'ombre, jamais en plein soleil. Une bouteille d'eau congelée dans un linge offre un point de fraîcheur. Au-delà de 28°C : vétérinaire en urgence si halètement." },

  // ─── JUIN ───
  { species: 'dog', month: 6, emoji: '🌡️', title: 'Coups de chaleur : reconnaître l\'urgence', body: "Halètement intense, langue violette, salivation, vomissements = urgence absolue. Mouillez le chien à l'eau tiède (pas froide), ventilez et filez chez le vétérinaire. Ne jamais laisser dans une voiture, même 5 min, même fenêtre entrouverte." },
  { species: 'cat', month: 6, emoji: '🌞', title: 'Cancer des oreilles chez les chats blancs', body: "Les chats blancs (et truffe rose) ont un risque élevé de carcinome cutané sur les oreilles et la truffe. Un écran solaire vétérinaire (sans zinc) appliqué avant exposition réduit le risque." },
  { species: 'nac', month: 6, emoji: '💧', title: 'Hydratation : eau toujours fraîche', body: "Changez l'eau 2× par jour minimum en été. Les biberons goutte-à-goutte chauffent vite — préférez une gamelle lourde et stable. Lavez le contenant à l'eau chaude tous les jours pour éviter les biofilms." },

  // ─── JUILLET ───
  { species: 'dog', month: 7, emoji: '🏖️', title: 'Voyage : passeport et antiparasitaires', body: "Pour voyager en UE, vérifiez : passeport européen, rage à jour (validité variable), traitement échinocoque obligatoire pour FI/IE/NO/MT. Lancez les démarches au moins 21 jours avant le départ." },
  { species: 'cat', month: 7, emoji: '🛋️', title: 'Garde pendant les vacances', body: "Le chat préfère rester chez lui : un pet-sitter à domicile (1 visite/jour minimum, 30 min) stresse moins qu'une pension. Si pension : visitez avant, vérifiez les vaccins exigés (typhus, coryza, leucose)." },
  { species: 'nac', month: 7, emoji: '🌬️', title: 'Ventilation sans courant d\'air', body: "Un ventilateur orienté indirectement vers le mur permet de brasser l'air sans souffler directement sur l'animal (risque d'otite, conjonctivite, refroidissement). Évitez aussi la clim soufflant sur la cage." },

  // ─── AOÛT ───
  { species: 'dog', month: 8, emoji: '🌊', title: 'Baignade : pas tous égaux', body: "Tous les chiens ne savent pas nager (bouledogues, carlins se noient vite). Toujours un gilet de sauvetage pour les premières fois. Rincez le poil après baignade en mer ou en piscine pour éviter les irritations." },
  { species: 'cat', month: 8, emoji: '🐍', title: 'Risque morsure de serpent', body: "Chez le chat de campagne, la vipère mord souvent à la patte ou au museau. Symptômes : gonflement rapide, abattement. Pas de garrot, pas d'aspiration : vétérinaire immédiat avec sérum antivipérin." },
  { species: 'nac', month: 8, emoji: '🥬', title: 'Verdure : laver, sécher, modérer', body: "Les verdures (salades, herbes) doivent être lavées à l'eau froide et bien séchées : excès d'eau = diarrhée. Introduisez chaque nouveau légume sur 4-5 jours en petite quantité pour vérifier la tolérance digestive." },

  // ─── SEPTEMBRE ───
  { species: 'dog', month: 9, emoji: '🍂', title: 'Rentrée : reprise des cours', body: "Profitez de septembre pour relancer l'éducation (clubs, cours collectifs). C'est aussi le moment idéal pour faire un bilan vétérinaire annuel : vaccins, vermifuge, contrôle du poids avant l'hiver." },
  { species: 'cat', month: 9, emoji: '😼', title: 'Chasse aux rongeurs : vermifuge', body: "À la rentrée, les campagnols envahissent les caves et greniers. Un chat chasseur doit être vermifugé tous les 1-2 mois (vs 4× par an pour un chat d'intérieur strict). Les ténias se transmettent via la proie." },
  { species: 'nac', month: 9, emoji: '🦷', title: 'Contrôle dentaire annuel', body: "Les dents des lapins, cochons d'Inde, chinchillas poussent en continu. Une mauvaise usure cause des malocclusions (refus alimentaire, salivation). Bilan dentaire annuel chez un vétérinaire NAC, même sans symptôme." },

  // ─── OCTOBRE ───
  { species: 'dog', month: 10, emoji: '🍁', title: 'Champignons et glands : toxiques', body: "Sortie en forêt : surveillez ce que votre chien renifle/avale. Glands (chêne), marrons, certains champignons (amanite) sont gravement toxiques. Symptômes 6-24 h après : vomissements, abattement → vétérinaire." },
  { species: 'cat', month: 10, emoji: '🕯️', title: 'Halloween : décorations dangereuses', body: "Bougies (brûlures), guirlandes électriques (électrocution), chocolat (mortel), petites décos (ingestion). Une citrouille découpée laissée au sol fermente vite : intoxication possible." },
  { species: 'nac', month: 10, emoji: '🌰', title: 'Préparer la cage pour l\'hiver', body: "Avant que les températures baissent, ajoutez du foin supplémentaire pour le nid, isolez le fond avec un tapis épais. Vérifiez l'absence de courants d'air. Pour les NAC en extérieur : caisson isolé hors gel obligatoire." },

  // ─── NOVEMBRE ───
  { species: 'dog', month: 11, emoji: '🦴', title: 'Articulations : arrivée du froid', body: "L'humidité aggrave l'arthrose. Pour les chiens âgés : massez délicatement avant la balade, couchage moelleux loin du sol, compléments chondroprotecteurs (glucosamine, oméga-3) après avis vétérinaire." },
  { species: 'cat', month: 11, emoji: '🛏️', title: 'Couchage chaud pour les seniors', body: "Un chat senior (>10 ans) cherche la chaleur. Installez un panier sur une couverture chauffante (réglage doux uniquement) ou près d'un radiateur. Une couverture en polaire améliore aussi le confort articulaire." },
  { species: 'nac', month: 11, emoji: '🍠', title: 'Légumes-racines de saison', body: "Carotte, panais, navet, betterave crue : à donner en petites quantités (riches en sucre). Le fenouil et les fanes de carotte sont d'excellents apports. Évitez choux et pomme de terre (toxique pour la plupart des NAC)." },

  // ─── DÉCEMBRE ───
  { species: 'dog', month: 12, emoji: '🎄', title: 'Sapin et décorations : précautions', body: "Eau du sapin (engrais toxique), boules en verre (coupures), guirlandes (occlusion). Privilégiez les décorations en haut. Le poinsettia et le houx sont toxiques en cas d'ingestion." },
  { species: 'cat', month: 12, emoji: '🎁', title: 'Stress du chat aux fêtes', body: "Visites, bruits, sapin : tout perturbe. Aménagez une pièce calme avec litière, eau, gamelle, panier. Les diffuseurs Feliway 15 j avant les fêtes apaisent. Évitez les os de volaille (esquilles)." },
  { species: 'nac', month: 12, emoji: '🌟', title: 'Pas de chocolat, pas de table', body: "Le chocolat est toxique pour tous les NAC. Les restes de table (gras, sel, épices) provoquent des diarrhées sévères. Cadeau : un cube de foin de luxe ou un nouveau jouet à ronger, pas de friandises sucrées." },
]

export default class extends BaseSeeder {
  async run() {
    const records = TIPS.map((t) => ({
      species: t.species,
      month: t.month,
      title: t.title,
      body: t.body,
      emoji: t.emoji,
      imageUrl: null,
    }))

    // Upsert by composite key (species, month) via raw approach: delete + insert is safer
    for (const r of records) {
      await MonthlyTip.updateOrCreate({ species: r.species, month: r.month }, r)
    }
    console.log(`[monthly_tip_seeder] Seeded ${records.length} monthly tips`)
  }
}
