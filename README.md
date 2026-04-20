# AI-Powered Trading Assistant

A production-ready MVP for an AI-powered automated trading assistant web application consisting of a React frontend, Node Express backend, and Python FastAPI AI service.

## Project Structure

- `/frontend` - React + Vite + Tailwind CSS dashboard
- `/backend` - Node.js Express server with Supabase integration
- `/ai-service` - Python FastAPI returning market analysis

## First-Time Setup

1. **Supabase Database**: Go to your Supabase project's SQL editor and execute the query found in `implementation_plan.md` to create the `signals` table with proper RLS policies.
2. **Environment Variables**: Add your `SUPABASE_URL`, `SUPABASE_ANON_KEY`, and `JWT_SECRET` in `backend/.env`. Add your `AI_SERVICE_URL` if not testing locally.

### Running Locally

**AI Service (Python 3):**

```bash
cd ai-service
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --port 8000 --reload
```

**Backend Service (Node.js):**

```bash
cd backend
npm install
npm run dev # or `npx ts-node src/index.ts`
```

**Frontend App (React):**

```bash
cd frontend
npm install
npm run dev
```

## Deployment

**Frontend (Vercel):**

- Import the repository to Vercel.
- Select the `frontend` directory as the Root Directory.
- Framework Preset: Vite.

**Backend & AI Service (Railway):**

- Import the repository to Railway.
- Create 2 separate services:
  - **Service 1 (Node Backend):** Root directory `backend` -> Set start command `npx tsc && node dist/index.js` (you may need to add `"build": "tsc"` script to package.json). Add Supabase environment variables.
  - **Service 2 (AI Service):** Root directory `ai-service` -> Set start command `uvicorn main:app --host 0.0.0.0 --port $PORT`.

## Note

This system provides mock AI data. Ensure that you do not perform real trades yet. Integration with real exchanges like Binance requires securing API keys and real-time sockets.
