import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { registerServiceWorker } from "./utils/pwa";

// Prevent pull-to-refresh on mobile
const preventPullToRefresh = () => {
  let startY = 0;
  document.addEventListener('touchstart', (e) => {
    startY = e.touches[0].pageY;
  }, { passive: true });

  document.addEventListener('touchmove', (e) => {
    const y = e.touches[0].pageY;
    // Only prevent if scrolling down and at the top of the page
    if (y > startY && window.scrollY === 0) {
      e.preventDefault();
    }
  }, { passive: false });
};

preventPullToRefresh();

// Register service worker for PWA functionality
registerServiceWorker();

createRoot(document.getElementById("root")!).render(<App />);
