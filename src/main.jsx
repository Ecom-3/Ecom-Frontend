import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from "react-router-dom";
import './index.css'
import router from './router.jsx';

import { AppProvider } from './context/AppContext';
import { languageCode } from './i18n/index';
import { readLanguage } from './i18n/preferences';

document.documentElement.lang = languageCode(readLanguage(localStorage));

// Remove the legacy demo fixture written by earlier builds. Customer-owned
// browser state (guest cart, addresses, wishlist and preferences) is preserved.
if (localStorage.getItem('demo-data-version')) {
  [
    'demo-data-version', 'local:locations', 'local:stores', 'local:users',
    'local:delivery', 'local:customers', 'local:reviews', 'local:coupons',
    'local:orders', 'orders', 'notifications',
  ].forEach((key) => localStorage.removeItem(key));
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AppProvider>
      <RouterProvider router={router} />
    </AppProvider>
  </StrictMode>,
)
