import { serviceBaseUrl } from '../config/serviceRoutes.js';
import { apiRequest } from './apiClient.js';

const baseUrl = serviceBaseUrl('orgAccess', import.meta.env);

export const getAuditLogs = ({ page = 0, size = 25, actor, action, from, to, sortBy = 'createdAt', direction = 'desc' } = {}) => {
  const params = new URLSearchParams({ page: String(page), size: String(size), sortBy, direction });
  Object.entries({ actor, action, from, to }).forEach(([key, value]) => {
    if (value !== undefined && value !== null && String(value).trim()) params.set(key, String(value).trim());
  });
  return apiRequest(baseUrl, `/api/audit-logs?${params}`);
};
