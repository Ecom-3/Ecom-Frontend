<<<<<<< Updated upstream
import { serviceBaseUrl } from './apiConfig.js';

export const inventoryBaseUrl = (env = {}) => serviceBaseUrl(env, 'VITE_INVENTORY_URL', '/inventory-service');
=======
import { serviceBaseUrl } from '../config/serviceRoutes.js';

export const inventoryBaseUrl = (env = {}) => serviceBaseUrl('inventory', env);
>>>>>>> Stashed changes
