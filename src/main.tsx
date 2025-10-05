import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { registerServiceWorker, setupBackgroundSync } from "./utils/pwa";

// Pull-to-refresh implementation for mobile
const setupPullToRefresh = () => {
  let startY = 0;
  let pulling = false;
  const threshold = 80; // pixels to trigger refresh

  // Create indicator element
  const indicator = document.createElement('div');
  indicator.id = 'ptr-indicator';
  Object.assign(indicator.style, {
    position: 'fixed',
    top: '8px',
    left: '50%',
    transform: 'translateX(-50%)',
    zIndex: '9999',
    padding: '8px 12px',
    background: 'rgba(0,0,0,0.7)',
    color: '#fff',
    borderRadius: '20px',
    fontSize: '14px',
    display: 'none',
    alignItems: 'center',
  });
  indicator.innerText = 'Release to refresh';
  document.body.appendChild(indicator);

  document.addEventListener('touchstart', (e) => {
    if (window.scrollY === 0) {
      startY = e.touches[0].pageY;
      pulling = true;
    }
  }, { passive: true });

  // Use passive: false so we can call preventDefault() and stop the native pull-to-refresh
  document.addEventListener('touchmove', (e) => {
    if (!pulling) return;
    const currentY = e.touches[0].pageY;
    const diff = currentY - startY;

    // If user is pulling down, prevent native overscroll to allow our indicator
    if (diff > 0 && window.scrollY === 0) {
      // Prevent the browser's native pull-to-refresh
      e.preventDefault();
    }

    if (diff > 10) {
      // show indicator
      indicator.style.display = 'flex';
      indicator.style.opacity = `${Math.min(1, diff / threshold)}`;
      if (diff > threshold) {
        indicator.innerText = 'Release to refresh';
      } else {
        indicator.innerText = 'Pull to refresh';
      }
    }
  }, { passive: false });

  document.addEventListener('touchend', (e) => {
    if (!pulling) return;
    pulling = false;
    const endY = e.changedTouches[0].pageY;
    const diff = endY - startY;
    indicator.style.display = 'none';
    if (diff > threshold) {
      // trigger refresh - soft reload
      window.location.reload();
    }
  }, { passive: true });
};

setupPullToRefresh();

// Register service worker for PWA functionality
registerServiceWorker().then(() => setupBackgroundSync());

createRoot(document.getElementById("root")!).render(<App />);
