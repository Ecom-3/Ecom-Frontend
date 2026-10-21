import { serviceBaseUrl } from '../config/serviceRoutes.js';

export const inventoryBaseUrl = (env = {}) => serviceBaseUrl('inventory', env);
