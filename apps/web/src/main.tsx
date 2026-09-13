import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';
import { AppProvider } from './store/AppContext';
import './styles/global.css';
import './styles/components.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AppProvider>
      <App />
    </AppProvider>
  </React.StrictMode>
);

// Register Progressive Web App Service Worker with aggressive update checks
if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then((registration) => {
        // Explicitly check for new service worker on load
        registration.update();
      })
      .catch((err) => {
        console.warn('ServiceWorker registration error:', err);
      });

    // Auto-reload window if a new service worker version took over
    navigator.serviceWorker.addEventListener('message', (event) => {
      if (event.data && event.data.type === 'NEW_VERSION_ACTIVATED') {
        window.location.reload();
      }
    });
  });
}
