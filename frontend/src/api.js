import axios from 'axios';

// In production (Vercel), VITE_API_URL points to your Railway backend.
// In local dev, leave it empty — Vite proxies /api → localhost:3000 automatically.
const BASE_URL = import.meta.env.VITE_API_URL || '';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
});

export default api;
