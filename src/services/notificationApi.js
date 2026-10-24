<<<<<<< Updated upstream
import { serviceBaseUrl } from './apiConfig.js';
=======
import { serviceBaseUrl } from '../config/serviceRoutes.js';
>>>>>>> Stashed changes
import { apiRequest } from './apiClient';

export const NOTIFICATION_STATUSES = ['PENDING', 'SENT', 'FAILED', 'CANCELLED'];
export const NOTIFICATION_CHANNELS = ['EMAIL', 'SMS', 'PUSH'];
export const NOTIFICATION_TYPES = [
  'ORDER_CREATED',
  'ORDER_STATUS_UPDATED',
  'ORDER_CANCELLED',
  'PAYMENT_SUCCESS',
  'PAYMENT_FAILED',
  'PAYMENT_REFUNDED',
  'FULFILLMENT_CREATED',
  'SHIPMENT_CREATED',
  'SHIPMENT_DELIVERED',
];

<<<<<<< Updated upstream
const NOTIFICATION_BASE_URL = serviceBaseUrl(import.meta.env, 'VITE_NOTIFICATION_URL', '/notification-service');
=======
const NOTIFICATION_BASE_URL = serviceBaseUrl('notification', import.meta.env);
>>>>>>> Stashed changes

const request = (path, options = {}) => apiRequest(NOTIFICATION_BASE_URL, path, options);

export const isNotificationServiceUnavailable = (error) => error?.name === 'TypeError' || Number(error?.status) >= 500;

export const createNotification = async (data) =>
  request('/api/v1/notifications', {
    method: 'POST',
    body: JSON.stringify(data),
  });

export const getNotificationsByOrder = async (orderId, page = 0, size = 20) =>
  request(`/api/v1/notifications/order/${encodeURIComponent(orderId)}?page=${page}&size=${size}`);

export const getNotificationsByCustomer = async (customerId, page = 0, size = 20) =>
  request(`/api/v1/notifications/customer/${encodeURIComponent(customerId)}?page=${page}&size=${size}`);

export const getAllCustomerNotifications = async (customerId) => {
  const first = await getNotificationsByCustomer(customerId, 0, 100);
  if (Array.isArray(first)) return first;
  const notifications = [...(first?.content || first?.items || [])];
  const totalPages = Math.max(1, Number(first?.totalPages || 1));
  for (let page = 1; page < totalPages; page += 1) {
    const result = await getNotificationsByCustomer(customerId, page, 100);
    notifications.push(...(Array.isArray(result) ? result : result?.content || result?.items || []));
  }
  return notifications;
};

export const markNotificationRead = async (notificationId) =>
  request(`/api/v1/notifications/${encodeURIComponent(notificationId)}/read`, { method: 'PATCH' });

export const clearCustomerNotifications = async (customerId) =>
  request(`/api/v1/notifications/customer/${encodeURIComponent(customerId)}/clear`, { method: 'DELETE' });

export const getNotificationHistory = async (page = 0, size = 20) =>
  request(`/api/v1/notifications/history?page=${page}&size=${size}`);

export const getNotificationTemplates = async (page = 0, size = 20) =>
  request(`/api/v1/notification-templates?page=${page}&size=${size}`);

export const sendNotification = async (notificationId, data = {}) =>
  request(`/api/v1/notifications/${encodeURIComponent(notificationId)}/send`, {
    method: 'POST',
    body: JSON.stringify(data),
  });

export const normalizeNotification = (notification = {}) => ({
  ...notification,
  id: notification.id || notification.notificationId || '',
  customerId: notification.customerId || '',
  orderId: notification.orderId || '',
  notificationType: NOTIFICATION_TYPES.includes(notification.notificationType) ? notification.notificationType : notification.notificationType || '',
  channel: NOTIFICATION_CHANNELS.includes(notification.channel) ? notification.channel : notification.channel || '',
  recipient: notification.recipient || '',
  subject: notification.subject || '',
  message: notification.message || '',
  status: NOTIFICATION_STATUSES.includes(notification.status) ? notification.status : notification.status || 'PENDING',
  readAt: notification.readAt || null,
  clearedAt: notification.clearedAt || null,
  read: notification.read === true || Boolean(notification.readAt),
  sentAt: notification.sentAt || null,
  createdAt: notification.createdAt || '',
});
