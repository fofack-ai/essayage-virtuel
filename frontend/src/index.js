import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';
import './index.css';
import './App.css';
import './i18n';

// ─── IGNORER L'ERREUR RESIZEOBSERVER (une seule fois) ───
const originalConsoleError = console.error;
console.error = (...args) => {
  if (args[0]?.includes?.('ResizeObserver loop completed with undelivered notifications')) {
    return;
  }
  if (args[0]?.includes?.('ResizeObserver loop limit exceeded')) {
    return;
  }
  originalConsoleError(...args);
};

// Ignorer également l'erreur au niveau global
window.addEventListener('error', (e) => {
  if (e.message?.includes?.('ResizeObserver loop completed with undelivered notifications')) {
    e.stopPropagation();
    e.preventDefault();
    return false;
  }
  if (e.message?.includes?.('ResizeObserver loop limit exceeded')) {
    e.stopPropagation();
    e.preventDefault();
    return false;
  }
});

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    <AuthProvider>
      <CartProvider>
        <App />
      </CartProvider>
    </AuthProvider>
  </React.StrictMode>
);

reportWebVitals();