// Reads VITE_API_URL from .env (local) or Vercel environment variables (production).
// Falls back to localhost for local development.
const API_BASE = (
  import.meta.env.VITE_API_URL ?? "http://localhost:4000"
).replace(/\/$/, "");

export default API_BASE;
