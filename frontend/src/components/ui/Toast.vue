<template>
  <Teleport to="body">
    <div
      v-if="notifications.length > 0"
      class="fixed top-4 right-4 z-50 space-y-2 w-96 max-w-[calc(100vw-2rem)]"
      aria-live="polite"
      aria-label="Notifications"
    >
      <TransitionGroup
        enter-active-class="transition-all duration-300 ease-out"
        enter-from-class="opacity-0 translate-x-full scale-95"
        enter-to-class="opacity-100 translate-x-0 scale-100"
        leave-active-class="transition-all duration-200 ease-in"
        leave-from-class="opacity-100 translate-x-0 scale-100"
        leave-to-class="opacity-0 translate-x-full scale-95"
        move-class="transition-transform duration-300"
      >
        <div
          v-for="notification in notifications"
          :key="notification.id"
          :class="getNotificationClasses(notification)"
          role="alert"
          :aria-describedby="`toast-${notification.id}-description`"
        >
          <!-- Icon -->
          <div class="flex-shrink-0">
            <Icon
              :name="getNotificationIcon(notification.type)"
              :variant="notification.type === 'info' ? 'outline' : 'solid'"
              :class="getIconClasses(notification.type)"
              size="md"
            />
          </div>

          <!-- Content -->
          <div class="flex-1 min-w-0">
            <div v-if="notification.title" class="font-semibold text-gray-900 dark:text-gray-100">
              {{ notification.title }}
            </div>
            <div
              :id="`toast-${notification.id}-description`"
              class="text-sm text-gray-600 dark:text-gray-300 mt-1"
            >
              {{ notification.message }}
            </div>
          </div>

          <!-- Actions -->
          <div v-if="notification.actions && notification.actions.length > 0" class="flex-shrink-0 flex space-x-2">
            <BaseButton
              v-for="action in notification.actions"
              :key="action.label"
              :variant="action.variant || 'ghost'"
              size="sm"
              @click="handleAction(notification, action)"
            >
              {{ action.label }}
            </BaseButton>
          </div>

          <!-- Close button -->
          <div v-if="notification.closable !== false" class="flex-shrink-0 ml-2">
            <BaseButton
              variant="ghost"
              size="sm"
              icon="x-mark"
              icon-only
              :aria-label="`Close ${notification.type} notification`"
              @click="removeNotification(notification.id)"
            />
          </div>

          <!-- Progress bar for auto-dismiss -->
          <div
            v-if="notification.duration && notification.duration > 0"
            class="absolute bottom-0 left-0 h-1 bg-current opacity-20 rounded-bl-lg transition-all duration-100"
            :style="{ width: `${getProgressPercentage(notification)}%` }"
          ></div>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import Icon from './Icon.vue';
import BaseButton from './BaseButton.vue';

export interface ToastNotification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title?: string;
  message: string;
  duration?: number; // 0 for persistent
  closable?: boolean;
  actions?: Array<{
    label: string;
    variant?: 'primary' | 'secondary' | 'ghost';
    handler: () => void;
  }>;
  createdAt: Date;
}

const notifications = ref<ToastNotification[]>([]);
const timers = ref<Map<string, number>>(new Map());

// Auto-cleanup timer
let cleanupInterval: number;

onMounted(() => {
  // Update progress every 100ms
  cleanupInterval = window.setInterval(() => {
    notifications.value.forEach(notification => {
      if (notification.duration && notification.duration > 0) {
        const elapsed = Date.now() - notification.createdAt.getTime();
        if (elapsed >= notification.duration) {
          removeNotification(notification.id);
        }
      }
    });
  }, 100);
});

onUnmounted(() => {
  if (cleanupInterval) {
    clearInterval(cleanupInterval);
  }
  
  // Clear all timers
  timers.value.forEach(timer => clearTimeout(timer));
  timers.value.clear();
});

const getNotificationClasses = (notification: ToastNotification) => {
  const baseClasses = [
    'relative flex items-start p-4 rounded-lg shadow-lg border',
    'bg-white dark:bg-gray-800 backdrop-blur-sm',
    'max-w-full overflow-hidden'
  ];

  const typeClasses = {
    success: 'border-green-200 dark:border-green-800',
    error: 'border-red-200 dark:border-red-800',
    warning: 'border-yellow-200 dark:border-yellow-800',
    info: 'border-blue-200 dark:border-blue-800'
  };

  return [...baseClasses, typeClasses[notification.type]].join(' ');
};

const getNotificationIcon = (type: ToastNotification['type']) => {
  const icons = {
    success: 'check-circle',
    error: 'x-circle',
    warning: 'exclamation-triangle',
    info: 'information-circle'
  };
  
  return icons[type];
};

const getIconClasses = (type: ToastNotification['type']) => {
  const classes = {
    success: 'text-green-500',
    error: 'text-red-500',
    warning: 'text-yellow-500',
    info: 'text-blue-500'
  };
  
  return classes[type];
};

const getProgressPercentage = (notification: ToastNotification) => {
  if (!notification.duration || notification.duration === 0) return 0;
  
  const elapsed = Date.now() - notification.createdAt.getTime();
  const percentage = Math.max(0, 100 - (elapsed / notification.duration) * 100);
  
  return percentage;
};

const addNotification = (notification: Omit<ToastNotification, 'id' | 'createdAt'>) => {
  const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  const newNotification: ToastNotification = {
    id,
    createdAt: new Date(),
    closable: true,
    duration: 5000, // Default 5 seconds
    ...notification
  };

  notifications.value.push(newNotification);

  // Auto-remove if duration is set
  if (newNotification.duration && newNotification.duration > 0) {
    const timer = window.setTimeout(() => {
      removeNotification(id);
    }, newNotification.duration);
    
    timers.value.set(id, timer);
  }

  return id;
};

const removeNotification = (id: string) => {
  const index = notifications.value.findIndex(n => n.id === id);
  if (index > -1) {
    notifications.value.splice(index, 1);
  }

  // Clear timer
  const timer = timers.value.get(id);
  if (timer) {
    clearTimeout(timer);
    timers.value.delete(id);
  }
};

const handleAction = (notification: ToastNotification, action: NonNullable<ToastNotification['actions']>[0]) => {
  action.handler();
  
  // Remove notification after action
  removeNotification(notification.id);
};

const clearAll = () => {
  notifications.value.splice(0);
  timers.value.forEach(timer => clearTimeout(timer));
  timers.value.clear();
};

// Expose methods for global usage
defineExpose({
  addNotification,
  removeNotification,
  clearAll,
  notifications: computed(() => notifications.value)
});
</script>