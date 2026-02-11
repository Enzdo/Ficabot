# 🚀 Guide de déploiement Render

## Configuration automatique

Le fichier `render.yaml` à la racine du projet configure automatiquement :
- ✅ Service Web (Backend API)
- ✅ Redis (pour les jobs Bull)

## 📝 Étapes de déploiement

### 1. Créer un compte Render
1. Allez sur https://render.com
2. Connectez-vous avec GitHub

### 2. Créer un nouveau Blueprint
1. Dashboard → **"New +"** → **"Blueprint"**
2. Sélectionnez votre repository GitHub
3. Render détectera automatiquement le fichier `render.yaml`
4. Cliquez sur **"Apply"**

### 3. Configurer les variables d'environnement sensibles

Render créera les services mais vous devez ajouter les valeurs pour ces variables :

#### Variables à configurer sur le service Web :

```bash
# App Key (générez-en un nouveau)
APP_KEY=zKXHe-Ahdb7aPK1ylAJlRgTefktEaACi

# Database Supabase
DB_HOST=<votre-projet>.supabase.co
DB_PASSWORD=<votre-mot-de-passe>

# AI Services (REQUIS)
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
GOOGLE_AI_API_KEY=AI...

# Encryption (générez une nouvelle clé)
# Commande: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
ENCRYPTION_KEY=e7ae50e8936a5d2108208ce1f39ffea7f8a69cc40f7f4615f5ac2715ece7ae60

# Frontend URL
VET_FRONTEND_URL=https://votre-app.vercel.app
```

#### Comment récupérer les infos Supabase :
1. Dashboard Supabase → Settings → Database
2. Connection string → Host (sans le port)
3. Database password (celui que vous avez créé)

### 4. Déployer

Une fois les variables configurées :
1. Render démarrera automatiquement le build
2. Surveillez les logs
3. Votre API sera disponible sur : `https://ficabot-backend.onrender.com`

### 5. Connecter le Frontend (Vercel)

Ajoutez dans Vercel → Settings → Environment Variables :
```bash
NUXT_PUBLIC_API_URL=https://ficabot-backend.onrender.com
```

Puis redéployez le frontend.

## ⚠️ Important

### Plan gratuit Render :
- **Cold starts** : L'API s'endort après 15 min d'inactivité
- Premier appel = 30-60 secondes de délai
- Redis gratuit = 25 MB max

### Vérifier la santé de l'API :
```bash
curl https://ficabot-backend.onrender.com/
```

### Auto-deploy :
Chaque `git push` sur `main` redéploie automatiquement.

## 🆘 En cas de problème

1. **Erreur de build** : Vérifiez les logs Render
2. **Erreur de connexion DB** : Vérifiez les variables Supabase
3. **Erreur Redis** : Le service Redis doit être créé en premier

### Logs en temps réel :
Dashboard Render → Votre service → **"Logs"**

## 📚 Ressources

- [Documentation Render](https://render.com/docs)
- [Blueprint Spec](https://render.com/docs/blueprint-spec)
- [AdonisJS Deployment](https://docs.adonisjs.com/guides/deployment)
