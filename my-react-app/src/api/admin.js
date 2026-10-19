import axiosClient from './axiosClient';

export const getSystemOverview = async () => {
  const { data } = await axiosClient.get('/admin/overview');
  return data;
};

export const getRecentActivity = async (limit = 10) => {
  const { data } = await axiosClient.get('/admin/recent-activity', { params: { limit } });
  return data;
};

export const getSettings = async () => {
  const { data } = await axiosClient.get('/admin/settings');
  return data;
};

export const saveSettings = async (settings) => {
  const { data } = await axiosClient.put('/admin/settings', settings);
  return data;
};

export const getAccessRules = async () => {
  const { data } = await axiosClient.get('/admin/access-rules');
  return data;
};

export const saveAccessRules = async (rules) => {
  const { data } = await axiosClient.put('/admin/access-rules', { rules });
  return data;
};

export const deleteAdminAssessment = async (id) => {
  const { data } = await axiosClient.delete(`/admin/assessments/${id}`);
  return data;
};