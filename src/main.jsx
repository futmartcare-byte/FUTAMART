import React from 'react'
import ReactDOM from 'react-dom/client'
import App from '@/App.jsx'
import '@/index.css'

;(function initTheme() {
  const saved = localStorage.getItem("futmart-theme") || "dark";
  const root = document.documentElement;
  root.classList.remove("light", "dark");
  if (saved === "system") {
    root.classList.add(window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
  } else {
    root.classList.add(saved);
  }
})();

ReactDOM.createRoot(document.getElementById('root')).render(
  <App />
)

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').then((registration) => {
      // Auto-activate any waiting worker immediately
      if (registration.waiting) {
        registration.waiting.postMessage({ type: 'SKIP_WAITING' });
      }
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        newWorker?.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            newWorker.postMessage({ type: 'SKIP_WAITING' });
          }
        });
      });
      // Silent reload once the new SW takes control
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        window.location.reload();
      });
    });
  });
}
