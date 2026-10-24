<<<<<<< Updated upstream
import { serviceBaseUrl } from './apiConfig.js';

export const catalogBaseUrl = (env = {}) => serviceBaseUrl(env, 'VITE_CATALOG_URL', '/catalog-service');
=======
import { serviceBaseUrl } from '../config/serviceRoutes.js';

export const catalogBaseUrl = (env = {}) => serviceBaseUrl('catalog', env);
>>>>>>> Stashed changes
