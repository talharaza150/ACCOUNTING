import { ref, onMounted, onUnmounted } from 'vue';

export interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
}

export function usePWA() {
  const isInstallable = ref(false);
  const isInstalled = ref(false);
  const isOnline = ref(navigator.onLine);
  const isUpdateAvailable = ref(false);
  
  let deferredPrompt: BeforeInstallPromptEvent | null = null;
  let registration: ServiceWorkerRegistration | null = null;

  // Check if app is installed
  const checkInstallStatus = () => {
    // Check if running in standalone mode (installed PWA)
    isInstalled.value = window.matchMedia('(display-mode: standalone)').matches ||
                        (window.navigator as any).standalone ||
                        document.referrer.includes('android-app://');
  };

  // Install PWA
  const installPWA = async (): Promise<boolean> => {
    if (!deferredPrompt) {
      return false;
    }

    try {
      await deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      
      if (choiceResult.outcome === 'accepted') {
        console.log('PWA: User accepted installation');
        isInstallable.value = false;
        deferredPrompt = null;
        return true;
      } else {
        console.log('PWA: User dismissed installation');
        return false;
      }
    } catch (error) {
      console.error('PWA: Installation failed', error);
      return false;
    }
  };

  // Register service worker
  const registerServiceWorker = async (): Promise<boolean> => {
    if (!('serviceWorker' in navigator)) {
      console.warn('PWA: Service Worker not supported');
      return false;
    }

    try {
      registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/'
      });

      console.log('PWA: Service Worker registered', registration);

      // Check for updates
      registration.addEventListener('updatefound', () => {
        const newWorker = registration!.installing;
        
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              console.log('PWA: New version available');
              isUpdateAvailable.value = true;
            }
          });
        }
      });

      return true;
    } catch (error) {
      console.error('PWA: Service Worker registration failed', error);
      return false;
    }
  };

  // Update PWA
  const updatePWA = async (): Promise<boolean> => {
    if (!registration || !registration.waiting) {
      return false;
    }

    try {
      // Tell the waiting service worker to take control
      registration.waiting.postMessage({ type: 'SKIP_WAITING' });
      
      // Listen for the controlling service worker change
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        window.location.reload();
      });

      return true;
    } catch (error) {
      console.error('PWA: Update failed', error);
      return false;
    }
  };

  // Add to home screen (iOS)
  const addToHomeScreen = (): boolean => {
    // For iOS, we can only show instructions
    if (/iPad|iPhone|iPod/.test(navigator.userAgent)) {
      // Show iOS-specific instructions
      alert('To install this app on your iOS device, tap the Share button and then "Add to Home Screen"');
      return true;
    }
    
    // For other platforms, try the install prompt
    return installPWA() as any;
  };

  // Handle online/offline status
  const handleOnlineStatus = () => {
    isOnline.value = navigator.onLine;
  };

  // Listen for PWA events
  const setupEventListeners = () => {
    // Install prompt
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      deferredPrompt = e as BeforeInstallPromptEvent;
      isInstallable.value = true;
      console.log('PWA: Install prompt captured');
    });

    // App installed
    window.addEventListener('appinstalled', () => {
      console.log('PWA: App installed');
      isInstalled.value = true;
      isInstallable.value = false;
      deferredPrompt = null;
    });

    // Online/offline status
    window.addEventListener('online', handleOnlineStatus);
    window.addEventListener('offline', handleOnlineStatus);

    // Service worker messages
    navigator.serviceWorker?.addEventListener('message', (event) => {
      if (event.data && event.data.type === 'BACKGROUND_SYNC_COMPLETE') {
        console.log('PWA: Background sync completed');
        // Could emit an event or update UI
      }
    });
  };

  // Remove event listeners
  const removeEventListeners = () => {
    window.removeEventListener('online', handleOnlineStatus);
    window.removeEventListener('offline', handleOnlineStatus);
  };

  // Get PWA capabilities
  const capabilities = {
    get canInstall() {
      return isInstallable.value && !isInstalled.value;
    },
    get supportsServiceWorker() {
      return 'serviceWorker' in navigator;
    },
    get supportsNotifications() {
      return 'Notification' in window;
    },
    get supportsPushNotifications() {
      return 'PushManager' in window;
    },
    get supportsBackgroundSync() {
      return 'serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype;
    }
  };

  // Request notification permission
  const requestNotificationPermission = async (): Promise<NotificationPermission> => {
    if (!('Notification' in window)) {
      return 'denied';
    }

    if (Notification.permission === 'granted') {
      return 'granted';
    }

    const permission = await Notification.requestPermission();
    return permission;
  };

  // Show notification
  const showNotification = (title: string, options?: NotificationOptions) => {
    if (Notification.permission === 'granted') {
      new Notification(title, {
        icon: '/icons/icon-192x192.png',
        badge: '/icons/badge-72x72.png',
        ...options
      });
    }
  };

  // Initialize PWA
  onMounted(() => {
    checkInstallStatus();
    setupEventListeners();
    registerServiceWorker();
  });

  onUnmounted(() => {
    removeEventListeners();
  });

  return {
    // State
    isInstallable,
    isInstalled,
    isOnline,
    isUpdateAvailable,
    capabilities,

    // Methods
    installPWA,
    addToHomeScreen,
    updatePWA,
    requestNotificationPermission,
    showNotification,
    registerServiceWorker
  };
}