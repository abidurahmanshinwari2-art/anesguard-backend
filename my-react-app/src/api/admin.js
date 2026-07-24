import axiosClient from './axiosClient';

export const getSystemOverview = async () => {
  const { data } = await axiosClient.get('/admin/overview');
  return data;
};

export const getRecentActivity = async (limit = 10) => {
  const { data } = await axiosClient.get('/admin/recent-activity', { params: { limit } });
  return data;
};