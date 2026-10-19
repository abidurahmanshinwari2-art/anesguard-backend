const KEYS = ['token', 'user', 'anesguard_user', 'anesguard_user_data', 'sessionExpiresAt', 'sessionTimeoutMinutes'];

export const sessionMinutes = (value) => {
  const minutes = Number(value);
  if (!Number.isFinite(minutes) || minutes < 1) return 30;
  return Math.min(1440, Math.round(minutes));
};

export const startSessionClock = (value) => {
  const minutes = sessionMinutes(value);
  localStorage.setItem('sessionTimeoutMinutes', String(minutes));
  localStorage.setItem('sessionExpiresAt', String(Date.now() + minutes * 60 * 1000));
  return minutes;
};

export const clearSession = () => {
  KEYS.forEach((key) => localStorage.removeItem(key));
};

export const sessionHasExpired = () => {
  if (!localStorage.getItem('token')) return false;
  let expiresAt = Number(localStorage.getItem('sessionExpiresAt') || 0);
  if (!expiresAt) {
    expiresAt = Date.now() + sessionMinutes(localStorage.getItem('sessionTimeoutMinutes')) * 60 * 1000;
    localStorage.setItem('sessionExpiresAt', String(expiresAt));
  }
  return Date.now() >= expiresAt;
};
