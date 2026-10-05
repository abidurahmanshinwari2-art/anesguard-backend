// src/api/users.js
import axiosClient from './axiosClient';

// Call this once, right after a successful login/signup. On signup, pass
// the extra fields collected on that form so they're saved immediately
// instead of being lost; on login, call with no arguments.
export const syncUser = async (extra = {}) => {
  const { data } = await axiosClient.post('/users/sync', extra);
  return data;
};

// Used by ProfileScreen.jsx to load the current user's saved profile fields
// (displayName, phone, department, employeeId, photoURL).
export const getMe = async () => {
  const { data } = await axiosClient.get('/users/me');
  return data;
};

// Used by ProfileScreen.jsx's "Save" button. Only send the fields that
// changed — the backend only updates whatever keys are present.
export const updateMe = async (updates) => {
  const { data } = await axiosClient.put('/users/me', updates);
  return data;
};

// Used by AdminPanel.jsx's user management table. Only works for accounts
// with role "admin" — the backend returns a 403 for anyone else.
export const getAllUsers = async () => {
  const { data } = await axiosClient.get('/users');
  return data;
};

export const createUser = async (payload) => {
  const { data } = await axiosClient.post('/users', payload);
  return data;
};

export const updateUserStatus = async (id, status) => {
  const { data } = await axiosClient.patch(`/users/${id}/status`, { status });
  return data;
};

export const deleteUser = async (id) => {
  const { data } = await axiosClient.delete(`/users/${id}`);
  return data;
};

export const changePassword = async (currentPassword, newPassword) => {
  const { data } = await axiosClient.put('/users/me/password', { currentPassword, newPassword });
  return data;
};