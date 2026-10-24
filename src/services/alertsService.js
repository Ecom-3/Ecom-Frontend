<<<<<<< Updated upstream
import { serviceBaseUrl } from './apiConfig.js';
import { apiRequest } from './apiClient';
const ALERTS_BASE_URL = serviceBaseUrl(import.meta.env, 'VITE_ALERTS_URL', '/alerts-service');
=======
import { serviceBaseUrl } from '../config/serviceRoutes.js';
import { apiRequest } from './apiClient';
const ALERTS_BASE_URL = serviceBaseUrl('alerts', import.meta.env);
>>>>>>> Stashed changes
export const alertsService = {
  health: () => apiRequest(ALERTS_BASE_URL, '/api/alerts/health', { auth:false }),
  sendTestEmail: (emailTo, subject, message) => apiRequest(ALERTS_BASE_URL, '/api/alerts/test-email', { method:'POST', body:JSON.stringify({ emailTo, subject, message }) }),
};
