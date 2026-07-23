// src/api/assessments.js
import axiosClient from './axiosClient';

export const createAssessment = async (formData) => {
  const { data } = await axiosClient.post('/assessments', formData);
  return data; // includes calculated riskLevel/riskScore/riskFactors
};

export const getAssessments = async (params = {}) => {
  const { data } = await axiosClient.get('/assessments', { params });
  return data; // { data: [...], total, page, limit }
};

export const getAssessmentById = async (id) => {
  const { data } = await axiosClient.get(`/assessments/${id}`);
  return data;
};

export const updateAssessment = async (id, formData) => {
  const { data } = await axiosClient.put(`/assessments/${id}`, formData);
  return data;
};

export const saveDosage = async (id, dosagePayload) => {
  const { data } = await axiosClient.patch(`/assessments/${id}/dosage`, dosagePayload);
  return data;
};

export const deleteAssessment = async (id) => {
  const { data } = await axiosClient.delete(`/assessments/${id}`);
  return data;
};

export const bulkDeleteAssessments = async (ids) => {
  const { data } = await axiosClient.delete('/assessments', { data: { ids } });
  return data;
};

export const getStatsSummary = async () => {
  const { data } = await axiosClient.get('/assessments/stats/summary');
  return data; // { total, low, moderate, high }
};