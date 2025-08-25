import { ref, type App } from 'vue';
import type { ToastNotification } from '@/components/ui/Toast.vue';

// Global toast instance
const toastRef = ref<{
  addNotification: (notification: Omit<ToastNotification, 'id' | 'createdAt'>) => string;
  removeNotification: (id: string) => void;
  clearAll: () => void;
} | null>(null);

export function useToast() {
  const setToastRef = (ref: any) => {
    toastRef.value = ref;
  };

  const toast = {
    success: (message: string, options?: Partial<Omit<ToastNotification, 'id' | 'createdAt' | 'type' | 'message'>>) => {
      return toastRef.value?.addNotification({
        type: 'success',
        message,
        ...options
      });
    },

    error: (message: string, options?: Partial<Omit<ToastNotification, 'id' | 'createdAt' | 'type' | 'message'>>) => {
      return toastRef.value?.addNotification({
        type: 'error',
        message,
        duration: 0, // Errors persist by default
        ...options
      });
    },

    warning: (message: string, options?: Partial<Omit<ToastNotification, 'id' | 'createdAt' | 'type' | 'message'>>) => {
      return toastRef.value?.addNotification({
        type: 'warning',
        message,
        duration: 7000, // Warnings stay longer
        ...options
      });
    },

    info: (message: string, options?: Partial<Omit<ToastNotification, 'id' | 'createdAt' | 'type' | 'message'>>) => {
      return toastRef.value?.addNotification({
        type: 'info',
        message,
        ...options
      });
    },

    custom: (notification: Omit<ToastNotification, 'id' | 'createdAt'>) => {
      return toastRef.value?.addNotification(notification);
    },

    remove: (id: string) => {
      toastRef.value?.removeNotification(id);
    },

    clear: () => {
      toastRef.value?.clearAll();
    }
  };

  return {
    toast,
    setToastRef
  };
}

// Plugin for Vue app
export const ToastPlugin = {
  install(app: App) {
    const { toast } = useToast();
    
    app.config.globalProperties.$toast = toast;
    app.provide('toast', toast);
  }
};

declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    $toast: ReturnType<typeof useToast>['toast'];
  }
}