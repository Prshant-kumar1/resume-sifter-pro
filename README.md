# Resume Sifter Pro

AI-powered resume screening frontend built with Vite + React + TanStack Router.

## Local Development

1. Copy the environment template and fill in your values:

   ```bash
   cp .env.example .env.local
   ```

   | Variable | Description | Example |
   |---|---|---|
   | `VITE_API_BASE_URL` | Backend API base URL (no trailing slash) | `http://localhost:8000/api/v1` |
   | `VITE_SUPABASE_URL` | Supabase project URL | `https://xxxx.supabase.co` |
   | `VITE_SUPABASE_PUBLISHABLE_KEY` | Supabase anon/public key | `eyJ...` |

2. Install dependencies and start the dev server:

   ```bash
   npm install
   npm run dev
   ```

## Production Deployment

### Backend on Render

1. Create a new **Web Service** on [Render](https://render.com) from the backend repo.
2. **Build Command:** `pip install -r requirements.txt`
3. **Start Command:** `uvicorn main:app --host 0.0.0.0 --port $PORT`
4. Set the following **Environment Variables** in Render → Service → Environment:
   - `FRONTEND_URL` = your Vercel deployment URL (e.g. `https://resume-sifter-pro.vercel.app`)
   - Any other backend-specific secrets (database URL, API keys, etc.)

After deploy, Render gives you a service URL such as:
`https://<your-render-service>.onrender.com`

Your API base will be:
`https://<your-render-service>.onrender.com/api/v1`

### Frontend on Vercel

1. Import the repo into [Vercel](https://vercel.com).
2. Vercel auto-detects Vite — accept the defaults.
3. In **Vercel → Project → Settings → Environment Variables** add:

   | Variable | Value |
   |---|---|
   | `VITE_API_BASE_URL` | `https://<your-render-service>.onrender.com/api/v1` |
   | `VITE_SUPABASE_URL` | `https://<your-project-id>.supabase.co` |
   | `VITE_SUPABASE_PUBLISHABLE_KEY` | `<your-supabase-anon-public-key>` |

4. Trigger a new deployment (or it deploys automatically on push).

> **Note:** `VITE_API_BASE_URL` is read at **build time** by Vite, so you must redeploy the frontend whenever you change it.

## Build

```bash
npm run build
```

Output is written to `dist/`.
