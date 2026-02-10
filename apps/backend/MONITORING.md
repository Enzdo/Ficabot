# Monitoring & Logging Setup

This document explains how to configure monitoring and logging for the Ficabot backend API.

## Built-in Health Checks

The application provides several health check endpoints:

- `GET /health` - Basic health check
- `GET /health/detailed` - Detailed health check with dependency status
- `GET /health/ready` - Kubernetes readiness probe
- `GET /health/live` - Kubernetes liveness probe

### Example Response

```json
{
  "status": "healthy",
  "timestamp": "2026-02-10T10:30:00.000Z",
  "uptime": 3600,
  "environment": "production"
}
```

## Logging

The application uses AdonisJS's built-in logger with structured logging.

### Log Levels

- `fatal` - Critical errors that require immediate attention
- `error` - Errors that need investigation
- `warn` - Warning messages (slow queries, failed login attempts)
- `info` - Informational messages (successful operations)
- `debug` - Debug information (development only)
- `trace` - Detailed trace information (development only)

### Log Types

All logs include a `type` field for easy filtering:

- `http_request` - HTTP request/response logging
- `http_request_error` - Failed HTTP requests
- `endpoint_performance` - API endpoint performance metrics
- `slow_request` - Requests taking >5 seconds
- `ai_usage` - AI model usage tracking
- `database_query` - Database query logging
- `slow_query` - Queries taking >1 second
- `email_delivery` - Email delivery tracking
- `auth_event` - Authentication events
- `security_event` - Security-related events
- `application_error` - Application errors
- `critical_error` - Critical errors
- `business_event` - Business logic events

### Configuration

Set `LOG_LEVEL` in your `.env` file:

```env
LOG_LEVEL=info
```

## Request Logging Middleware

The `RequestLoggerMiddleware` automatically logs:
- HTTP method and URL
- Response status code
- Response time
- Client IP and User-Agent
- Errors with stack traces

Enable it by adding to your middleware stack in `start/kernel.ts`.

## Monitoring Service

The `MonitoringService` provides methods to track:

### API Performance
```typescript
import MonitoringService from '#services/monitoring_service'

const monitoring = new MonitoringService()
monitoring.trackEndpointPerformance({
  endpoint: '/pets',
  method: 'GET',
  duration: 150,
  statusCode: 200,
  userId: 1
})
```

### AI Usage
```typescript
monitoring.trackAIUsage({
  model: 'claude',
  operation: 'pre_diagnosis',
  duration: 3500,
  tokensUsed: 2500,
  userId: 1,
  success: true
})
```

### Database Performance
```typescript
monitoring.trackDatabaseQuery({
  query: 'SELECT * FROM pets WHERE user_id = ?',
  duration: 45,
  success: true
})
```

### Email Delivery
```typescript
monitoring.trackEmailDelivery({
  type: 'urgent_notification',
  recipientEmail: 'vet@example.com',
  success: true,
  duration: 250
})
```

### Authentication Events
```typescript
monitoring.trackAuthEvent({
  event: 'login',
  userId: 1,
  email: 'user@example.com',
  ip: '192.168.1.1',
  success: true
})
```

### Error Tracking
```typescript
monitoring.trackError({
  errorType: 'DatabaseError',
  message: 'Connection timeout',
  stack: error.stack,
  severity: 'high',
  context: { userId: 1, operation: 'fetchPets' }
})
```

### Business Events
```typescript
monitoring.trackBusinessEvent({
  event: 'pet_created',
  userId: 1,
  metadata: { petName: 'Buddy', species: 'dog' }
})
```

## External Monitoring Services

### Sentry (Error Tracking)

1. Install Sentry:
```bash
pnpm add @sentry/node
```

2. Initialize Sentry in `start/app.ts`:
```typescript
import * as Sentry from '@sentry/node'

if (env.get('SENTRY_DSN')) {
  Sentry.init({
    dsn: env.get('SENTRY_DSN'),
    environment: env.get('NODE_ENV'),
    tracesSampleRate: 1.0,
  })
}
```

3. Add to `.env`:
```env
SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id
```

4. Create error handler middleware to send errors to Sentry.

### DataDog (APM & Metrics)

1. Install DataDog APM:
```bash
pnpm add dd-trace
```

2. Initialize at the very top of `bin/server.ts`:
```typescript
import tracer from 'dd-trace'

tracer.init({
  service: 'ficabot-api',
  env: process.env.NODE_ENV,
})
```

3. Add to `.env`:
```env
DD_AGENT_HOST=localhost
DD_TRACE_AGENT_PORT=8126
```

4. DataDog will automatically track:
   - HTTP requests
   - Database queries
   - External API calls
   - Custom metrics

### Prometheus (Metrics)

1. Install Prometheus client:
```bash
pnpm add prom-client
```

2. Create metrics endpoint:
```typescript
import client from 'prom-client'

const register = new client.Registry()
client.collectDefaultMetrics({ register })

// Custom metrics
const httpRequestDuration = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  registers: [register]
})

// Expose metrics
router.get('/metrics', async ({ response }) => {
  response.header('Content-Type', register.contentType)
  return register.metrics()
})
```

### Grafana (Visualization)

1. Connect Grafana to your data sources (Prometheus, PostgreSQL, etc.)
2. Import pre-built dashboards or create custom ones
3. Set up alerts for critical metrics

### CloudWatch (AWS)

If deployed on AWS:

```typescript
import { CloudWatchClient, PutMetricDataCommand } from '@aws-sdk/client-cloudwatch'

const cloudwatch = new CloudWatchClient({ region: 'us-east-1' })

await cloudwatch.send(new PutMetricDataCommand({
  Namespace: 'Ficabot/API',
  MetricData: [
    {
      MetricName: 'ResponseTime',
      Value: duration,
      Unit: 'Milliseconds',
      Timestamp: new Date()
    }
  ]
}))
```

## Production Best Practices

### 1. Structured Logging
Always use structured logs with consistent fields:
```typescript
logger.info({
  type: 'user_action',
  action: 'pet_created',
  userId: 1,
  petId: 5,
  timestamp: DateTime.now().toISO()
})
```

### 2. Log Aggregation
Use a log aggregation service:
- ELK Stack (Elasticsearch, Logstash, Kibana)
- Loki + Grafana
- CloudWatch Logs
- DataDog Logs

### 3. Alert Configuration
Set up alerts for:
- Error rate spikes
- Slow response times (>5s)
- High memory usage (>80%)
- Database connection failures
- Failed email deliveries
- Repeated failed login attempts

### 4. Metrics Dashboard
Track key metrics:
- Request rate (requests/second)
- Error rate (errors/requests)
- Response time (p50, p95, p99)
- Active users
- Database query time
- AI API usage & cost
- Email delivery success rate

### 5. Performance Monitoring
- Set up APM (Application Performance Monitoring)
- Track slow queries and optimize
- Monitor memory leaks
- Profile CPU usage

### 6. Security Monitoring
- Failed login attempts
- Unusual access patterns
- API rate limit violations
- Suspicious user behavior

## Docker/Kubernetes Integration

### Health Check Configuration

Docker Compose:
```yaml
services:
  api:
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3333/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
```

Kubernetes:
```yaml
apiVersion: v1
kind: Pod
spec:
  containers:
  - name: ficabot-api
    livenessProbe:
      httpGet:
        path: /health/live
        port: 3333
      initialDelaySeconds: 30
      periodSeconds: 10
    readinessProbe:
      httpGet:
        path: /health/ready
        port: 3333
      initialDelaySeconds: 5
      periodSeconds: 5
```

## Troubleshooting

### High Error Rate
1. Check `/health/detailed` endpoint
2. Review error logs with `type: "application_error"`
3. Check external service status (database, AI APIs)

### Slow Performance
1. Check for slow requests: `type: "slow_request"`
2. Review slow queries: `type: "slow_query"`
3. Check AI API response times
4. Monitor database connection pool

### Memory Leaks
1. Monitor memory usage trends
2. Check for unclosed database connections
3. Review event listeners (potential leaks)
4. Use Node.js profiling tools

## Useful Commands

```bash
# View live logs
tail -f logs/app.log

# Filter error logs
grep '"type":"application_error"' logs/app.log

# Count requests by endpoint
grep '"type":"http_request"' logs/app.log | jq -r '.url' | sort | uniq -c

# Find slow requests
grep '"type":"slow_request"' logs/app.log | jq '{endpoint, duration}'

# Monitor AI usage
grep '"type":"ai_usage"' logs/app.log | jq '{model, duration, tokensUsed}'
```
