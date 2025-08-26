<template>
  <div class="relative">
    <!-- Pull to refresh indicator - less intrusive -->
    <div 
      v-if="(isPulling && pullDistance > 30) || isRefreshing"
      class="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-full flex items-center justify-center transition-all duration-200 ease-out z-10"
      :style="{ 
        transform: `translateX(-50%) translateY(${Math.min(pullDistance - 80, -10)}px)`,
        opacity: pullDistance > 40 ? Math.min(pullDistance / 80, 1) : 0
      }"
      role="status"
      :aria-label="isRefreshing ? 'Refreshing content' : 'Pull to refresh'"
    >
      <div class="bg-white dark:bg-gray-800 rounded-full p-2 shadow-md border border-gray-200 dark:border-gray-700 flex items-center justify-center">
        <Icon 
          v-if="!isRefreshing"
          name="arrow-down" 
          :class="{
            'text-gray-400 dark:text-gray-500': pullDistance < threshold,
            'text-blue-500 dark:text-blue-400 transform rotate-180': pullDistance >= threshold,
            'transition-transform duration-150': true
          }"
          size="xs"
          aria-hidden="true"
        />
        <Icon
          v-else
          name="arrow-path"
          class="text-blue-500 dark:text-blue-400 animate-spin"
          size="xs"
          aria-hidden="true"
        />
      </div>
    </div>

    <!-- Content slot -->
    <div 
      ref="contentRef"
      :style="{ 
        transform: isPulling ? `translateY(${Math.min(pullDistance * 0.1, 10)}px)` : 'translateY(0)',
        transition: isPulling ? 'none' : 'transform 200ms ease-out'
      }"
    >
      <slot />
    </div>

    <!-- Screen reader announcement -->
    <div 
      v-if="isRefreshing" 
      class="sr-only" 
      aria-live="polite"
    >
      Refreshing content, please wait
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { usePullToRefresh } from '@/composables/usePullToRefresh';
import Icon from './Icon.vue';

interface Props {
  onRefresh?: () => Promise<void> | void;
  threshold?: number;
  maxDistance?: number;
  disabled?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  threshold: 60,
  maxDistance: 120,
  disabled: false
});

const contentRef = ref<HTMLElement>();

const {
  isPulling,
  isRefreshing,
  pullDistance,
  bindEvents,
  unbindEvents
} = usePullToRefresh({
  threshold: props.threshold,
  maxDistance: props.maxDistance,
  onRefresh: props.onRefresh,
  disabled: props.disabled
});

onMounted(() => {
  if (contentRef.value) {
    bindEvents(contentRef.value);
  }
});
</script>