import { serviceBaseUrl } from '../config/serviceRoutes.js';

export const catalogBaseUrl = (env = {}) => serviceBaseUrl('catalog', env);
