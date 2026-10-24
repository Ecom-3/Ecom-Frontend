import { StrictMode } from 'react'
import { createTheme, ThemeProvider } from '@mui/material/styles';

const brandTheme = createTheme({ palette: { primary: { main: '#087454', dark: '#065d43' }, secondary: { main: '#087454' } } });
import { createRoot } from 'react-dom/client'
import { RouterProvider } from "react-router-dom";
import './index.css'
import router from './router.jsx';

import { AppProvider } from './context/AppContext';
import { languageCode } from './i18n/index';
import { readLanguage } from './i18n/preferences';

document.documentElement.lang = languageCode(readLanguage());

// Business records and persistent preferences belong in backend services and
// MySQL. Clear browser-local state left by older builds on this app origin.
localStorage.clear();
for (const key of Object.keys(sessionStorage)) {
  if (key !== 'authToken') sessionStorage.removeItem(key);
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeProvider theme={brandTheme}><AppProvider>
      <RouterProvider router={router} />
    </AppProvider></ThemeProvider>
  </StrictMode>,
)
