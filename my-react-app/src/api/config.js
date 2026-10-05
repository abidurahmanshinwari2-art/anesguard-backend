const LOCAL_API = 'http://localhost:5000/api';
const PRODUCTION_API = 'https://anesguard-backend.onrender.com/api';

export const API_URL = import.meta.env.VITE_API_BASE_URL
  || (import.meta.env.DEV ? LOCAL_API : PRODUCTION_API);

export function authHeaders() {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}
