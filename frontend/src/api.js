import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_URL,
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Батч API
export const getBatches = () => api.get('/batches/');
export const getBatch = (id) => api.get(`/batches/${id}/`);
export const startProduction = () => api.post('/batches/start_production/');
export const stopProduction = (id) => api.post(`/batches/${id}/stop_production/`);
export const simulateParameter = (id) => api.post(`/batches/${id}/simulate_parameter/`);

// Параметры API
export const getParameters = (batchId) => api.get('/parameters/', { params: { batch_id: batchId } });
export const getCurrentParameters = () => api.get('/parameters/current_parameters/');

// Настройки API
export const getSettings = () => api.get('/settings/');
export const getSetting = (id) => api.get(`/settings/${id}/`);
export const createSetting = (data) => api.post('/settings/', data);
export const updateSetting = (id, data) => api.put(`/settings/${id}/`, data);
export const deleteSetting = (id) => api.delete(`/settings/${id}/`);
export const activateSetting = (id) => api.post(`/settings/${id}/activate/`);
export const getActiveSetting = () => api.get('/settings/active/');

// Уведомления API
export const getNotifications = () => api.get('/notifications/');
export const markAllRead = () => api.post('/notifications/mark_all_read/');

export default api; 