# 🤖 Votre Assistant Virtuel by Ficana

Monorepo complet pour votre assistant virtuel IA avec gestion intégrée.

## 📁 Structure du projet

```
votre-assistant-virtuel-by-ficana/
├── apps/
│   ├── frontend/          # Nuxt 3 (SSR)
│   └── backend/           # AdonisJS (API REST)
├── packages/
│   └── shared/            # Types, schemas, utils partagés
├── package.json           # Workspaces pnpm
└── pnpm-workspace.yaml
```

## 🛠️ Stack technique

- **Frontend**: Nuxt 3, Vue 3, Pinia, TailwindCSS
- **Backend**: AdonisJS 6, Lucid ORM
- **Base de données**: PostgreSQL (compatible Supabase)
- **Auth**: JWT (Access Tokens)
- **IA**: OpenAI GPT-4o-mini
- **Monorepo**: pnpm workspaces

## 🚀 Installation

### Prérequis

- Node.js 18+
- pnpm 8+
- PostgreSQL (ou compte Supabase)
- Clé API OpenAI

### 1. Cloner et installer les dépendances

```bash
cd votre-assistant-virtuel-by-ficana
pnpm install
```

### 2. Configurer le backend

```bash
cd apps/backend
cp .env.example .env
```

Éditer `.env` avec vos valeurs :

```env
NODE_ENV=development
PORT=3333
HOST=0.0.0.0
APP_KEY=votre-cle-secrete-min-32-caracteres

# Base de données PostgreSQL
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=votre-mot-de-passe
DB_DATABASE=votre-assistant-virtuel-by-ficana
DB_SSL=false

# Pour Supabase, utilisez :
# DB_HOST=db.xxxxx.supabase.co
# DB_SSL=true

# OpenAI
OPENAI_API_KEY=sk-votre-cle-openai
```

### 3. Créer la base de données

```bash
# Créer la base de données PostgreSQL
createdb votre-assistant-virtuel-by-ficana

# Exécuter les migrations
cd apps/backend
pnpm migration:run
```

### 4. Configurer le frontend

```bash
cd apps/frontend
cp .env.example .env
```

Le fichier `.env` par défaut pointe vers `http://localhost:3333`.

### 5. Build du package shared

```bash
cd packages/shared
pnpm build
```

## 🏃 Lancement

### Développement (tous les services)

```bash
# Depuis la racine du projet
pnpm dev
```

Ou séparément :

```bash
# Terminal 1 - Backend
pnpm dev:backend

# Terminal 2 - Frontend
pnpm dev:frontend
```

### URLs

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3333

## 📡 API Endpoints

### Auth
- `POST /auth/register` - Inscription
- `POST /auth/login` - Connexion
- `GET /auth/me` - Utilisateur courant (auth)
- `POST /auth/logout` - Déconnexion (auth)

### Pets
- `GET /pets` - Liste des animaux (auth)
- `POST /pets` - Créer un animal (auth)
- `GET /pets/:id` - Détails d'un animal (auth)
- `PUT /pets/:id` - Modifier un animal (auth)
- `DELETE /pets/:id` - Supprimer un animal (auth)

### Medical Records
- `GET /pets/:id/medical-records` - Liste des enregistrements (auth)
- `POST /pets/:id/medical-records` - Créer un enregistrement (auth)
- `PUT /medical-records/:recordId` - Modifier (auth)
- `DELETE /medical-records/:recordId` - Supprimer (auth)

### Chat IA
- `GET /chat` - Historique des messages (auth)
- `POST /chat` - Envoyer un message (auth)
- `DELETE /chat` - Effacer l'historique (auth)

## 🗄️ Base de données

### Tables

- **users** - Utilisateurs (id, email, password, timestamps)
- **pets** - Animaux (id, user_id, name, species, breed, birth_date, weight, avatar_url)
- **medical_records** - Carnet de santé (id, pet_id, type, title, description, date, next_due_date, vet_name)
- **chat_messages** - Messages IA (id, user_id, pet_id, role, message)
- **auth_access_tokens** - Tokens JWT

## 🎨 Pages Frontend

- `/` - Page d'accueil
- `/login` - Connexion
- `/register` - Inscription
- `/dashboard` - Tableau de bord
- `/pets` - Liste des animaux
- `/pets/:id` - Détails d'un animal
- `/pets/:id/medical` - Carnet de santé
- `/chat` - Assistant IA

## 🔧 Scripts utiles

```bash
# Depuis la racine
pnpm dev              # Lancer tous les services
pnpm build            # Build de production
pnpm lint             # Linter

# Backend
pnpm --filter @votre-assistant-virtuel/backend migration:run      # Migrations
pnpm --filter @votre-assistant-virtuel/backend migration:rollback # Rollback

# Frontend
pnpm --filter @votre-assistant-virtuel/frontend generate  # Générer site statique
```

## 📝 Configuration Supabase

Pour utiliser Supabase comme base de données :

1. Créer un projet sur [supabase.com](https://supabase.com)
2. Récupérer les informations de connexion dans Settings > Database
3. Configurer le `.env` du backend :

```env
DB_HOST=db.xxxxx.supabase.co
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=votre-mot-de-passe-supabase
DB_DATABASE=postgres
DB_SSL=true
```

## 🤖 Configuration OpenAI

1. Créer un compte sur [platform.openai.com](https://platform.openai.com)
2. Générer une clé API
3. Ajouter la clé dans le `.env` du backend

## 📄 Licence

MIT
