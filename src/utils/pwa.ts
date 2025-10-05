// PWA Installation and Update Management

export const registerServiceWorker = async () => {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      console.log('Service Worker registered:', registration);

      // Check for updates
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // New service worker available
              console.log('New service worker available');
              // You can show a notification to the user here
            }
          });
        }
      });

      return registration;
    } catch (error) {
      console.error('Service Worker registration failed:', error);
    }
  }
};

// Request periodic sync (if available) and a one-off background sync tag
export const setupBackgroundSync = async () => {
  if ('serviceWorker' in navigator && 'periodicSync' in (navigator as any)) {
    try {
      const registration = await navigator.serviceWorker.ready;
      // Request periodic sync every 24 hours
      await (registration as any).periodicSync.register('ffb-periodic-sync', {
        minInterval: 24 * 60 * 60 * 1000,
      });
      console.log('Periodic background sync registered');
    } catch (err) {
      console.warn('Periodic sync registration failed', err);
    }
  }

  if ('serviceWorker' in navigator && 'sync' in (navigator as any)) {
    try {
      const registration = await navigator.serviceWorker.ready;
      await (registration as any).sync.register('ffb-sync');
      console.log('One-off background sync registered');
    } catch (err) {
      console.warn('Background sync registration failed', err);
    }
  }
};

export const unregisterServiceWorker = async () => {
  if ('serviceWorker' in navigator) {
    const registrations = await navigator.serviceWorker.getRegistrations();
    for (const registration of registrations) {
      await registration.unregister();
    }
  }
};

// Request push notification permission
export const requestNotificationPermission = async () => {
  if ('Notification' in window) {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }
  return false;
};

// Check if app is installed as PWA
export const isPWA = () => {
  return window.matchMedia('(display-mode: standalone)').matches ||
         (window.navigator as any).standalone === true;
};

// Prompt user to install PWA
export const promptPWAInstall = () => {
  let deferredPrompt: any;

  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
  });

  return async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      console.log(`User response to install prompt: ${outcome}`);
      deferredPrompt = null;
    }
  };
};
