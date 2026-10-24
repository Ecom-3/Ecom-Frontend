import { serviceBaseUrl } from '../config/serviceRoutes.js';
import { apiRequest } from './apiClient.js';

const BASE_URL = serviceBaseUrl('order', import.meta.env || {});
const request = (path, options) => apiRequest(BASE_URL, path, options);

export const getAdminReviews = ({ status = '', page = 0, size = 20 } = {}) => {
  const params = new URLSearchParams({ page: String(page), size: String(size) });
  if (status) params.set('status', status.toUpperCase());
  return request(`/api/v1/reviews/admin?${params}`);
};

export const moderateReview = (reviewId, { status, adminReply = '' }) => request(`/api/v1/reviews/admin/${encodeURIComponent(reviewId)}`, {
  method: 'PATCH', body: JSON.stringify({ status: String(status).toUpperCase(), adminReply }),
});

export const getMyReviews = () => request('/api/v1/reviews/mine');
export const getProductReviews = (productId) => request(`/api/v1/reviews/products/${encodeURIComponent(productId)}`);

export const getProductReviewsBatch = async (productIds = []) => {
  const ids = [...new Set(productIds.filter(Boolean).map(String))];
  if (!ids.length) return [];
  const batches = [];
  for (let index = 0; index < ids.length; index += 100) {
    const params = new URLSearchParams();
    ids.slice(index, index + 100).forEach((id) => params.append('productIds', id));
    batches.push(request(`/api/v1/reviews/products?${params}`));
  }
  return (await Promise.all(batches)).flat();
};
