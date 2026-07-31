# Fiche Play Store — Ficabot (fr-FR)

Contenu à coller dans la Play Console. Les descriptions ne mentionnent aucune
fonctionnalité absente de l'app : le Règlement sur les métadonnées interdit de
décrire des fonctions non implémentées, et l'abonnement est actuellement masqué
(`PAYWALL_VISIBLE = false`), donc rien n'est dit sur un quelconque paiement.

---

## Nom de l'application (30 max)

```
Ficabot : carnet santé animal
```

29 caractères. Le nom seul (« Ficabot », 7 caractères) n'apporte aucun mot-clé :
personne ne cherche « Ficabot » tant que la marque est inconnue. Les mots
« carnet santé animal » sont indexés par Play et captent la recherche réelle.

## Brève description (80 max)

```
Le carnet de santé de vos animaux : vaccins, rappels, poids et conseils.
```

72 caractères.

## Description complète (4000 max)

```
Ficabot réunit en un seul endroit tout ce qui concerne la santé de vos animaux. Fini le carnet papier égaré et les rappels de vaccin oubliés.

UN CARNET DE SANTÉ COMPLET
• Une fiche par animal : chien, chat, rongeur, oiseau…
• Vaccins, traitements et antécédents, conservés au même endroit
• Documents médicaux et photos rattachés à chaque animal
• Tout l'historique consultable d'un coup d'œil

NE RIEN OUBLIER
• Rappels pour les vaccins, les traitements et les rendez-vous
• Notifications déclenchées au moment que vous avez choisi
• Agenda des rendez-vous vétérinaires à venir

SUIVRE LE QUOTIDIEN
• Courbe de poids et objectifs à atteindre
• Repas et habitudes alimentaires
• Activités et sorties
• Symptômes observés, pour en garder une trace datée

UN ASSISTANT DISPONIBLE À TOUTE HEURE
Posez vos questions sur l'alimentation, le comportement, l'hygiène ou les gestes du quotidien. Les réponses tiennent compte de l'espèce, de la race et de l'âge de votre animal.

DES CONSEILS ADAPTÉS À LA MÉTÉO
Chaleur, froid, pluie : Ficabot ajuste ses recommandations de sortie, d'hydratation et de prévention en fonction du temps qu'il fait chez vous.

DES ARTICLES POUR MIEUX COMPRENDRE
Une bibliothèque de conseils sur la nutrition, le comportement, l'hygiène, les urgences et le vieillissement, avec une sélection adaptée à vos animaux.

LE BUDGET DE VOS ANIMAUX
Enregistrez les dépenses vétérinaires, l'alimentation et les accessoires, et gardez une vision claire de ce que représente votre compagnon chaque mois.

VOS DONNÉES VOUS APPARTIENNENT
Aucune publicité, aucune revente de données. Vos informations sont hébergées dans l'Union européenne et vous pouvez supprimer votre compte et l'intégralité de vos données à tout moment, directement depuis l'application.

IMPORTANT
Ficabot est un outil de suivi et d'information. Il ne pose aucun diagnostic et ne remplace en aucun cas la consultation d'un vétérinaire. En cas de doute, de symptôme inhabituel ou d'urgence, contactez immédiatement un professionnel de santé animale.
```

Environ 2 100 caractères. Le paragraphe IMPORTANT n'est pas optionnel : Play
applique une vigilance particulière aux applis touchant à la santé, et l'absence
d'avertissement explicite sur l'absence de diagnostic est un motif de rejet
classique.

---

## Éléments visuels

| Élément | Fichier | État |
|---|---|---|
| Icône 512×512 | `play-icon-512.png` | ✅ prêt |
| Image de présentation 1024×500 | `play-feature-graphic-1024x500.png` | ✅ prêt |
| Captures téléphone (2 à 8) | — | ❌ à produire |
| Captures tablette 7" et 10" | — | ❌ à produire |

Les deux visuels sont générés par `generate.py`, à partir du vert de charte
(`#7EB13F`, primary-500) et de la patte du logo de marque. L'icône fournie dans
`apps/mobile/assets/images/icon.png` était un aplat bleu sans logo — un
placeholder, refusé tel quel par Play et sans rapport avec la charte.

Pour régénérer après modification : `python3 store-assets/generate.py`

### Captures d'écran

Elles ne peuvent pas être générées ici : il faut lancer l'app sur un appareil ou
un émulateur. Contraintes Play : PNG ou JPEG, format 9:16 ou 16:9, chaque côté
entre 320 et 3 840 px. Pour être éligible aux mises en avant, au moins 4 captures
d'au moins 1 080 px.

Écrans à privilégier, dans cet ordre :

1. Accueil avec un animal renseigné — météo, prochain rendez-vous, rappels
2. Fiche animal avec le carnet de santé et les vaccins
3. Assistant, avec une question et sa réponse
4. Courbe de poids
5. Agenda des rendez-vous

Utilisez un compte contenant de vraies données : une capture d'écran vide donne
une mauvaise impression et n'illustre rien.

### Tablettes

Les captures tablette sont marquées obligatoires. Deux options : les produire sur
un émulateur tablette, ou restreindre la distribution aux téléphones dans
Production → Appareils. Ne laissez pas des captures téléphone étirées faire
office de captures tablette, c'est explicitement sanctionné.

## Vidéo

Facultative. À laisser vide plutôt que d'y mettre une vidéo bâclée.
