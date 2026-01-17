# Ficabot - Assistant Vétérinaire IA

> Application de gestion de santé animale propulsée par l'intelligence artificielle multi-modèles

## Le Pitch

**Ficabot** révolutionne la santé animale en combinant un carnet de santé digital complet avec la puissance de l'IA. Les propriétaires d'animaux peuvent obtenir une **pré-analyse de symptômes** basée sur 3 modèles IA indépendants (Claude, GPT, Gemini), puis partager ces informations avec leur vétérinaire pour un suivi professionnel.

**Problème résolu** : Les propriétaires s'inquiètent souvent pour la santé de leur animal mais hésitent à consulter. Ficabot offre une première analyse intelligente qui aide à évaluer l'urgence, tout en maintenant le lien essentiel avec les vétérinaires.

**Points forts** :
- Pré-diagnostic par consensus de 3 IA (réduit les erreurs d'un modèle unique)
- Carnet de santé digital complet (vaccins, traitements, allergies, chirurgies...)
- Double interface : propriétaires + vétérinaires
- Chat IA pour questions quotidiennes
- Gamification pour encourager les bonnes pratiques

---

## Fonctionnalités

### Pour les Propriétaires

| Fonctionnalité | Description |
|----------------|-------------|
| **Gestion des Animaux** | Profils chiens/chats avec photos, poids, identification |
| **Carnet de Santé Digital** | Vaccins, antiparasitaires, vermifuges, chirurgies, allergies, médicaments |
| **Pré-Diagnostic IA** | Envoyez photos + symptômes, obtenez une analyse par 3 modèles IA avec synthèse |
| **Chat IA** | Assistant conversationnel pour vos questions santé |
| **Suivi Santé** | Poids, alimentation, symptômes, activités physiques |
| **Rendez-vous & Rappels** | Planification et notifications automatiques |
| **Dépenses** | Suivi des frais vétérinaires et achats |
| **Badges** | Gamification pour encourager les soins réguliers |

### Pour les Vétérinaires

| Fonctionnalité | Description |
|----------------|-------------|
| **Dashboard Pré-Diagnostics** | Vue des analyses en attente avec indicateurs d'urgence |
| **Accès Carnets de Santé** | Consultation des dossiers patients connectés |
| **Réponses Professionnelles** | Envoi de recommandations aux propriétaires |
| **Chat Clients** | Communication directe avec les propriétaires |
| **Gestion Clinique** | Rendez-vous, employés, facturation |

---

## Stack Technique

| Composant | Technologie |
|-----------|-------------|
| **Frontend** | Nuxt 3, Vue 3, TailwindCSS, Pinia |
| **Backend** | AdonisJS 6, Lucid ORM, TypeScript |
| **Base de données** | PostgreSQL (compatible Supabase) |
| **IA** | Claude (Anthropic), GPT-4 (OpenAI), Gemini (Google) |
| **Auth** | JWT Access Tokens |
| **Monorepo** | pnpm workspaces |

---

## Structure du Projet

```
ficabot/
├── apps/
│   ├── backend/        # API AdonisJS (port 3333)
│   ├── frontend/       # App utilisateur (port 3000)
│   ├── vet-frontend/   # Portail vétérinaire (port 3001)
│   └── landing/        # Page marketing (port 3002)
└── packages/
    └── shared/         # Types et utilitaires partagés
```

---

## Installation

### Prérequis
- Node.js 18+
- pnpm 8+
- PostgreSQL

### Setup

```bash
# Cloner et installer
pnpm install

# Configurer le backend
cd apps/backend
cp .env.example .env
# Renseigner : DATABASE_URL, ANTHROPIC_API_KEY, OPENAI_API_KEY

# Migrations
pnpm migration:run

# Build shared
cd packages/shared && pnpm build

# Lancer
pnpm dev:all
```

### Variables d'Environnement

```env
# Base de données
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=***
DB_DATABASE=ficabot

# IA
ANTHROPIC_API_KEY=sk-ant-***
OPENAI_API_KEY=sk-***
GOOGLE_AI_API_KEY=*** (optionnel)
```

---

## URLs de Développement

| Service | URL |
|---------|-----|
| Frontend | http://localhost:3000 |
| API Backend | http://localhost:3333 |
| Portail Vétérinaire | http://localhost:3001 |
| Landing Page | http://localhost:3002 |

---

## Licence

Projet privé - Tous droits réservés

---

Développé par l'équipe Ficana
