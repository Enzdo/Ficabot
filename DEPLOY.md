# 🐾 Ficabot - Deployment Guide

This guide details the steps to deploy the full Ficabot stack:
1. **Database:** Supabase
2. **Backend:** Railway (NestJS)
3. **Frontend:** Vercel (Nuxt 3)

## 1. Database Setup (Supabase)

1.  **Create Project:**
    *   Go to [Supabase](https://supabase.com/) and create a new project.
    *   Note down your `Project URL` and `anon public key`.
    *   Go to Project Settings -> Database to get your Connection String (URI). It will look like `postgresql://postgres:[PASSWORD]@db.[PROJECT_ID].supabase.co:5432/postgres`.

2.  **Auth Configuration:**
    *   Go to Authentication -> Providers.
    *   Ensure "Email" is enabled.
    *   (Optional) Configure Google/Apple auth if needed.

3.  **Environment Variables for Backend:**
    *   You will need the `DATABASE_URL` for the backend.
    *   You will need `SUPABASE_URL` and `SUPABASE_KEY` (service_role key for backend admin tasks if implemented, or anon key for client-side ops).

## 2. Backend Deployment (Railway)

1.  **Connect GitHub:**
    *   Go to [Railway](https://railway.app/).
    *   Create a new project -> Deploy from GitHub repo.
    *   Select the `Ficabot` repository.

2.  **Configure Monorepo:**
    *   Railway needs to know it's a monorepo.
    *   **Root Directory:** `apps/backend`
    *   **Build Command:** `pnpm build` (or leave default if Railway auto-detects NestJS, but it's safer to specify). *Note: Since this is a pnpm monorepo, you might need a custom start command.*
    *   **Start Command:** `node dist/main`

    *Alternative Strategy (Docker):*
    *   If the default build fails due to monorepo structure, add a `Dockerfile` in `apps/backend` that copies necessary packages.

3.  **Environment Variables:**
    Add the following variables in Railway:
    *   `DATABASE_URL`: Your Supabase connection string.
    *   `PORT`: `8080` (or let Railway assign one and bind to `0.0.0.0`).
    *   `SUPABASE_URL`: Your Supabase Project URL.
    *   `SUPABASE_KEY`: Your Supabase Anon Key (or Service Role if needed).

4.  **Generate Domain:**
    *   In Railway settings, generate a domain (e.g., `ficabot-backend.up.railway.app`). You'll need this for the frontend.

## 3. Frontend Deployment (Vercel)

1.  **Connect GitHub:**
    *   Go to [Vercel](https://vercel.com/).
    *   Add New -> Project -> Import `Ficabot` repo.

2.  **Configure Monorepo:**
    *   **Root Directory:** Edit this to `apps/frontend`.
    *   **Framework Preset:** Nuxt.js
    *   **Build Command:** `pnpm build` (Vercel usually handles this well).

3.  **Environment Variables:**
    *   `NUXT_PUBLIC_API_BASE`: The URL of your backend on Railway (e.g., `https://ficabot-backend.up.railway.app`).
    *   `NUXT_PUBLIC_SUPABASE_URL`: Your Supabase Project URL.
    *   `NUXT_PUBLIC_SUPABASE_KEY`: Your Supabase Anon Key.

4.  **Deploy:**
    *   Click Deploy. Vercel will build the Nuxt app and provide a URL.

## 4. Post-Deployment Checks

*   **CORS:** Ensure your NestJS backend allows CORS from your Vercel frontend domain.
    *   In `apps/backend/src/main.ts`, update `app.enableCors()` to include your Vercel domain.
*   **Redirect URLs:** In Supabase Authentication -> URL Configuration, add your Vercel production URL to "Site URL" and "Redirect URLs" to ensure auth redirects work correctly.

## Local Development

To run the full stack locally:

```bash
# Install dependencies
pnpm install

# Start backend
pnpm --filter @ficabot/backend dev

# Start frontend
pnpm --filter @ficabot/frontend dev
```
