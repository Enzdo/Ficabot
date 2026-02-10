# Queue System avec Bull

## Vue d'ensemble

Le système de queue utilise Bull (basé sur Redis) pour traiter les tâches lourdes en arrière-plan, notamment l'analyse IA des pré-diagnostics.

## Prérequis

### Installation Redis

**macOS (Homebrew):**
```bash
brew install redis
brew services start redis
```

**Linux (Ubuntu/Debian):**
```bash
sudo apt-get install redis-server
sudo systemctl start redis
```

**Docker:**
```bash
docker run -d -p 6379:6379 --name redis redis:alpine
```

### Configuration

Ajouter à votre `.env`:
```env
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
```

## Utilisation

### Démarrer le Worker

Le worker traite les jobs en arrière-plan. Il doit tourner en parallèle du serveur web.

**En développement:**
```bash
pnpm worker
```

**En production:**
```bash
# Avec PM2
pm2 start pnpm --name "ficabot-worker" -- worker

# Ou avec le build
node build/bin/worker.js
```

### Démarrer l'API

Dans un autre terminal:
```bash
pnpm dev
```

## Architecture

```
┌─────────────────────┐
│  HTTP Request       │
│  POST /pre-diagnosis│
└──────────┬──────────┘
           │
           v
┌──────────────────────────────┐
│  PreDiagnosesController      │
│  - Validate input            │
│  - Create record (pending)   │
│  - Enqueue job               │
│  - Return 201 immediately    │
└──────────┬───────────────────┘
           │
           v
┌──────────────────────────────┐
│  Bull Queue (Redis)          │
│  - Job stored                │
│  - Auto retry (3x)           │
└──────────┬───────────────────┘
           │
           v
┌──────────────────────────────┐
│  Worker Process              │
│  PreDiagnosisJob.process()   │
│  - Call 3 AI services        │
│  - Synthesize results        │
│  - Update DB                 │
│  - Notify vet                │
└──────────────────────────────┘
```

## Jobs Disponibles

### PreDiagnosisJob

Traite l'analyse IA multi-modèles d'un pré-diagnostic.

**Enqueue:**
```typescript
import PreDiagnosisJob from '#jobs/pre_diagnosis_job'

await PreDiagnosisJob.enqueue({
  preDiagnosisId: 123,
  userId: 1,
  petId: 45
})
```

**Caractéristiques:**
- **Timeout:** Aucun (peut prendre 2-3 minutes)
- **Retries:** 3 tentatives avec backoff exponentiel (2s, 4s, 8s)
- **Priority:** Normal (peut être ajusté selon urgence)
- **Concurrency:** 1 job à la fois par worker

## Monitoring

### Via Code

```typescript
import QueueService from '#services/queue_service'

const stats = await QueueService.getQueueStats('pre-diagnosis')
console.log(stats)
// {
//   waiting: 2,
//   active: 1,
//   completed: 150,
//   failed: 3,
//   delayed: 0
// }
```

### Via Bull Board (recommandé)

Installer Bull Board pour une interface web:

```bash
pnpm add @bull-board/express @bull-board/api
```

Ajouter une route:
```typescript
import { createBullBoard } from '@bull-board/api'
import { BullAdapter } from '@bull-board/api/bullAdapter'
import { ExpressAdapter } from '@bull-board/express'
import QueueService from '#services/queue_service'

const serverAdapter = new ExpressAdapter()
serverAdapter.setBasePath('/admin/queues')

createBullBoard({
  queues: [
    new BullAdapter(QueueService.getQueue('pre-diagnosis'))
  ],
  serverAdapter
})

// Dans routes.ts
router.use('/admin/queues', serverAdapter.getRouter())
```

Accéder à: `http://localhost:3333/admin/queues`

### Logs

Les jobs loggent automatiquement:
- ✅ **Success:** `[PreDiagnosisJob] Successfully completed job X`
- ❌ **Failure:** `[PreDiagnosisJob] Job X failed: [error]`
- ⚠️ **Retry:** `[PreDiagnosisJob] Starting job X (attempt 2/3)`

## Gestion des Erreurs

### Retry Strategy

- **Tentative 1:** Immédiate
- **Tentative 2:** Après 2 secondes
- **Tentative 3:** Après 4 secondes

Si toutes les tentatives échouent:
- Le job est marqué `failed`
- Le pre_diagnosis status → `'failed'`
- Une notification est envoyée (TODO)

### Jobs Bloqués (Stalled)

Si un worker crash pendant le traitement:
- Bull détecte automatiquement après 30s
- Le job est marqué `stalled`
- Il sera retenté automatiquement

## Nettoyage

Les jobs sont automatiquement nettoyés:
- **Completed:** Conservés 24h, max 1000
- **Failed:** Conservés 7 jours

Nettoyage manuel:
```typescript
await PreDiagnosisJob.cleanOldJobs()
```

## Production

### PM2 Ecosystem

Créer `ecosystem.config.js`:
```javascript
module.exports = {
  apps: [
    {
      name: 'ficabot-api',
      script: 'build/bin/server.js',
      instances: 2,
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 3333
      }
    },
    {
      name: 'ficabot-worker',
      script: 'build/bin/worker.js',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production'
      }
    }
  ]
}
```

Lancer:
```bash
pm2 start ecosystem.config.js
```

### Docker Compose

```yaml
version: '3.8'

services:
  redis:
    image: redis:alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

  api:
    build: .
    command: node build/bin/server.js
    ports:
      - "3333:3333"
    environment:
      REDIS_HOST: redis
      REDIS_PORT: 6379
    depends_on:
      - redis

  worker:
    build: .
    command: node build/bin/worker.js
    environment:
      REDIS_HOST: redis
      REDIS_PORT: 6379
    depends_on:
      - redis

volumes:
  redis_data:
```

### Scaling Workers

Pour augmenter la capacité:
```bash
# Avec PM2
pm2 scale ficabot-worker +2  # Ajoute 2 workers

# Avec Docker
docker-compose up --scale worker=3
```

## Troubleshooting

### Worker ne démarre pas

**Erreur:** `Cannot connect to Redis`

**Solution:**
```bash
# Vérifier Redis
redis-cli ping
# Devrait retourner: PONG

# Vérifier config
echo $REDIS_HOST
echo $REDIS_PORT
```

### Jobs restent en waiting

**Causes possibles:**
1. Worker pas démarré
2. Worker crashé
3. Problème de connexion Redis

**Diagnostic:**
```bash
# Vérifier worker
ps aux | grep worker

# Vérifier Redis
redis-cli -h localhost -p 6379 keys "bull:pre-diagnosis:*"

# Vérifier logs
tail -f logs/app.log | grep PreDiagnosisJob
```

### Jobs échouent systématiquement

**Vérifier:**
1. Clés API AI configurées (OPENAI_API_KEY, ANTHROPIC_API_KEY)
2. Limites de rate API
3. Logs d'erreur pour stack trace

```bash
# Voir jobs failed
redis-cli -h localhost -p 6379 lrange "bull:pre-diagnosis:failed" 0 -1
```

## Performance

### Benchmarks

Sur une machine moyenne (8GB RAM, 4 cores):
- **Throughput:** ~20 pré-diagnostics/heure (1 worker)
- **Scaling:** Linéaire jusqu'à 3 workers
- **Latence:** 2-3 minutes par pre-diagnosis

### Optimisations

1. **Augmenter workers:** Plus de workers = plus de jobs en parallèle
2. **Redis persistence:** Désactiver si pas critique
3. **Concurrency:** Augmenter dans job options (attention aux limites API)

```typescript
this.queue.process(3, async (job) => {
  // Process up to 3 jobs concurrently
})
```

## Références

- [Bull Documentation](https://github.com/OptimalBits/bull)
- [Redis Documentation](https://redis.io/documentation)
- [Bull Board](https://github.com/felixmosh/bull-board)
