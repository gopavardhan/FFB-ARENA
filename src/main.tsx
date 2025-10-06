import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { registerServiceWorker, setupBackgroundSync } from "./utils/pwa";

// Professional Pull-to-refresh implementation
const setupPullToRefresh = () => {
  let startY = 0;
  let pulling = false;
  let refreshing = false;
  const threshold = 100; // pixels to trigger refresh

  // Create container
  const container = document.createElement('div');
  container.id = 'ptr-container';
  Object.assign(container.style, {
    position: 'fixed',
    top: '0',
    left: '50%',
    transform: 'translateX(-50%)',
    zIndex: '9999',
    width: '100%',
    maxWidth: '400px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '20px',
    pointerEvents: 'none',
    transition: 'opacity 0.3s ease',
    opacity: '0',
  });

  // Create indicator with spinner
  const indicator = document.createElement('div');
  indicator.id = 'ptr-indicator';
  Object.assign(indicator.style, {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 20px',
    background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.95), rgba(147, 51, 234, 0.95))',
    backdropFilter: 'blur(10px)',
    color: '#fff',
    borderRadius: '30px',
    fontSize: '14px',
    fontWeight: '600',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
    transform: 'scale(0.9)',
    transition: 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
  });

  // Create spinner
  const spinner = document.createElement('div');
  spinner.className = 'ptr-spinner';
  Object.assign(spinner.style, {
    width: '20px',
    height: '20px',
    border: '3px solid rgba(255, 255, 255, 0.3)',
    borderTop: '3px solid #fff',
    borderRadius: '50%',
    animation: 'ptr-spin 0.8s linear infinite',
    display: 'none',
  });

  // Create text element
  const text = document.createElement('span');
  text.innerText = 'Pull to refresh';

  // Create arrow icon
  const arrow = document.createElement('div');
  arrow.innerHTML = '↓';
  Object.assign(arrow.style, {
    fontSize: '20px',
    fontWeight: 'bold',
    transition: 'transform 0.3s ease',
  });

  indicator.appendChild(arrow);
  indicator.appendChild(text);
  indicator.appendChild(spinner);
  container.appendChild(indicator);
  document.body.appendChild(container);

  // Add spinner animation
  const style = document.createElement('style');
  style.textContent = `
    @keyframes ptr-spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    @keyframes ptr-pulse {
      0%, 100% { transform: scale(0.95); }
      50% { transform: scale(1.05); }
    }
  `;
  document.head.appendChild(style);

  document.addEventListener('touchstart', (e) => {
    if (window.scrollY === 0 && !refreshing) {
      startY = e.touches[0].pageY;
      pulling = true;
    }
  }, { passive: true });

  document.addEventListener('touchmove', (e) => {
    if (!pulling || refreshing) return;
    const currentY = e.touches[0].pageY;
    const diff = currentY - startY;

    if (diff > 0 && window.scrollY === 0) {
      e.preventDefault();
    }

    if (diff > 10) {
      const progress = Math.min(diff / threshold, 1);
      container.style.opacity = `${progress}`;
      indicator.style.transform = `scale(${0.9 + progress * 0.1})`;
      
      if (diff > threshold) {
        text.innerText = 'Release to refresh';
        arrow.style.transform = 'rotate(180deg)';
        indicator.style.background = 'linear-gradient(135deg, rgba(34, 197, 94, 0.95), rgba(59, 130, 246, 0.95))';
      } else {
        text.innerText = 'Pull to refresh';
        arrow.style.transform = 'rotate(0deg)';
        indicator.style.background = 'linear-gradient(135deg, rgba(59, 130, 246, 0.95), rgba(147, 51, 234, 0.95))';
      }
    }
  }, { passive: false });

  document.addEventListener('touchend', (e) => {
    if (!pulling || refreshing) return;
    pulling = false;
    const endY = e.changedTouches[0].pageY;
    const diff = endY - startY;
    
    if (diff > threshold) {
      // Trigger refresh
      refreshing = true;
      arrow.style.display = 'none';
      spinner.style.display = 'block';
      text.innerText = 'Refreshing...';
      indicator.style.background = 'linear-gradient(135deg, rgba(34, 197, 94, 0.95), rgba(16, 185, 129, 0.95))';
      indicator.style.animation = 'ptr-pulse 1.5s ease-in-out infinite';
      
      // Reload after animation
      setTimeout(() => {
        window.location.reload();
      }, 500);
    } else {
      // Reset
      container.style.opacity = '0';
      indicator.style.transform = 'scale(0.9)';
      setTimeout(() => {
        arrow.style.transform = 'rotate(0deg)';
        text.innerText = 'Pull to refresh';
        indicator.style.background = 'linear-gradient(135deg, rgba(59, 130, 246, 0.95), rgba(147, 51, 234, 0.95))';
      }, 300);
    }
  }, { passive: true });
};

setupPullToRefresh();

// Register service worker for PWA functionality
registerServiceWorker().then(() => setupBackgroundSync());

createRoot(document.getElementById("root")!).render(<App />);
