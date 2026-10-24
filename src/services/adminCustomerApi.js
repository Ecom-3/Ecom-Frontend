import { serviceBaseUrl } from '../config/serviceRoutes.js';
import { apiRequest } from './apiClient.js';

const baseUrl = serviceBaseUrl('customerProfile', import.meta.env);

export const getCustomers = ({ page = 0, size = 25 } = {}) => {
  const query = new URLSearchParams({ page: String(page), size: String(size) });
  return apiRequest(baseUrl, `/api/v1/admin/customers?${query}`);
};

export const getCustomerTotal = async () => {
  const response = await getCustomers({ page: 0, size: 1 });
  const total = Number(response?.totalElements);
  if (!Number.isInteger(total) || total < 0) {
    throw new Error('Customer service returned an invalid total.');
  }
  return total;
};

export const getAllCustomers = async ({ size = 100 } = {}) => {
  const first = await getCustomers({ page: 0, size });
  if (!Array.isArray(first?.content) || !Number.isInteger(Number(first.totalElements))
      || !Number.isInteger(Number(first.totalPages))) {
    throw new Error('Customer service returned an invalid paginated response.');
  }
  const totalElements = Number(first.totalElements);
  const totalPages = Number(first.totalPages);
  const pages = [first];
  for (let page = 1; page < totalPages; page += 1) pages.push(await getCustomers({ page, size }));

  const customers = new Map();
  pages.forEach((response, page) => {
    if (!Array.isArray(response?.content) || Number(response.page) !== page) {
      throw new Error('Customer service returned an incomplete paginated response. Refresh and retry.');
    }
    response.content.forEach((customer) => {
      if (customer?.id != null) customers.set(String(customer.id), customer);
    });
  });
  if (customers.size !== totalElements) {
    throw new Error('Customer list changed while loading pages. Refresh and retry to avoid showing incomplete results.');
  }
  return [...customers.values()];
};
