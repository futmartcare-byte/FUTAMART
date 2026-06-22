import React from 'react'
import ReactDOM from 'react-dom/client'
import App from '@/App.jsx'
import '@/index.css'

// Apply saved theme BEFORE rendering to prevent flash
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

// Register service worker for PWA install support and offline caching
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').then(
      (registration) => {
        console.log('Service worker registered:', registration.scope);
      },
      (error) => {
        console.log('Service worker registration failed:', error);
      }
    );
  });
}