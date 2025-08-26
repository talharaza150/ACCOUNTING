<template>
  <div 
    class="relative overflow-hidden"
    :class="containerClass"
    :style="containerStyle"
  >
    <!-- Main image -->
    <img
      ref="imageRef"
      :src="currentSrc"
      :alt="alt"
      :class="[
        'transition-all duration-300',
        imageClass,
        {
          'opacity-0': !isLoaded && !hasError,
          'opacity-100': isLoaded || hasError,
          'blur-sm': isLoading && showPlaceholder,
          'filter-none': isLoaded
        }
      ]"
      :style="imageStyle"
      :loading="eager ? 'eager' : 'lazy'"
      :decoding="async ? 'async' : 'sync'"
      :sizes="sizes"
      :srcset="srcset"
      @load="handleLoad"
      @error="handleError"
    />

    <!-- Loading placeholder -->
    <div
      v-if="isLoading && showLoadingIndicator"
      class="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800"
      :class="placeholderClass"
    >
      <div class="animate-pulse">
        <Icon 
          :name="loadingIcon" 
          :size="iconSize" 
          class="text-gray-400 dark:text-gray-600"
        />
      </div>
    </div>

    <!-- Error state -->
    <div
      v-if="hasError && showErrorState"
      class="absolute inset-0 flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400"
      :class="placeholderClass"
    >
      <Icon 
        :name="errorIcon" 
        :size="iconSize" 
        class="mb-2"
      />
      <span v-if="showErrorText" class="text-xs text-center px-2">
        {{ errorText || 'Failed to load image' }}
      </span>
      <button
        v-if="showRetryButton"
        @click="retry"
        class="mt-2 text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
      >
        Retry
      </button>
    </div>

    <!-- Loading progress indicator -->
    <div
      v-if="isLoading && showProgress"
      class="absolute bottom-0 left-0 right-0 h-1 bg-gray-200 dark:bg-gray-700"
    >
      <div 
        class="h-full bg-blue-600 dark:bg-blue-500 transition-all duration-300"
        :style="{ width: `${loadingProgress}%` }"
      ></div>
    </div>

    <!-- Overlay slot -->
    <div
      v-if="$slots.overlay"
      class="absolute inset-0"
    >
      <slot 
        name="overlay" 
        :loaded="isLoaded" 
        :loading="isLoading" 
        :error="hasError"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useLazyImage, getOptimizedImageUrl, generateSrcSet } from '@/composables/useLazyImage';
import Icon from './Icon.vue';

interface Props {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  quality?: number;
  format?: 'webp' | 'jpeg' | 'png';
  fit?: 'cover' | 'contain' | 'fill';
  placeholder?: string;
  eager?: boolean;
  async?: boolean;
  showPlaceholder?: boolean;
  showLoadingIndicator?: boolean;
  showErrorState?: boolean;
  showErrorText?: boolean;
  showRetryButton?: boolean;
  showProgress?: boolean;
  loadingIcon?: string;
  errorIcon?: string;
  errorText?: string;
  iconSize?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  containerClass?: string;
  imageClass?: string;
  placeholderClass?: string;
  rootMargin?: string;
  threshold?: number;
  retryAttempts?: number;
  responsiveSizes?: number[];
  sizes?: string;
}

const props = withDefaults(defineProps<Props>(), {
  quality: 85,
  fit: 'cover',
  eager: false,
  async: true,
  showPlaceholder: true,
  showLoadingIndicator: true,
  showErrorState: true,
  showErrorText: false,
  showRetryButton: true,
  showProgress: false,
  loadingIcon: 'photo',
  errorIcon: 'exclamation-triangle',
  iconSize: 'md',
  rootMargin: '50px',
  threshold: 0.1,
  retryAttempts: 3,
  responsiveSizes: () => [480, 768, 1024, 1280, 1920]
});

const emit = defineEmits<{
  load: [event: Event];
  error: [event: Event];
  'retry-attempt': [attempt: number];
}>();

// Computed optimized image URL
const optimizedSrc = computed(() => 
  getOptimizedImageUrl(props.src, {
    width: props.width,
    height: props.height,
    quality: props.quality,
    format: props.format,
    fit: props.fit
  })
);

// Generate responsive srcset
const srcset = computed(() => 
  props.responsiveSizes ? generateSrcSet(props.src, props.responsiveSizes) : undefined
);

// Use lazy image composable
const {
  imageRef,
  isLoaded,
  isLoading,
  hasError,
  currentSrc,
  retryCount,
  forceLoad,
  retry: retryImage
} = useLazyImage({
  src: optimizedSrc.value,
  placeholder: props.placeholder,
  rootMargin: props.rootMargin,
  threshold: props.threshold,
  retryAttempts: props.retryAttempts,
  onLoad: (event) => emit('load', event),
  onError: (event) => emit('error', event)
});

// Loading progress simulation
const loadingProgress = ref(0);

// Simulate loading progress
watch(isLoading, (loading) => {
  if (loading) {
    loadingProgress.value = 0;
    const interval = setInterval(() => {
      loadingProgress.value += Math.random() * 30;
      if (loadingProgress.value >= 90 || !isLoading.value) {
        clearInterval(interval);
        if (isLoaded.value) {
          loadingProgress.value = 100;
        }
      }
    }, 100);
  }
});

// Container and image styles
const containerStyle = computed(() => {
  const styles: Record<string, string> = {};
  
  if (props.width) {
    styles.width = typeof props.width === 'number' ? `${props.width}px` : props.width;
  }
  
  if (props.height) {
    styles.height = typeof props.height === 'number' ? `${props.height}px` : props.height;
  }
  
  return styles;
});

const imageStyle = computed(() => {
  const styles: Record<string, string> = {
    objectFit: props.fit
  };
  
  return styles;
});

// Retry with event emission
const retry = () => {
  emit('retry-attempt', retryCount.value + 1);
  retryImage();
};

// Force load method
const load = () => {
  forceLoad();
};

// Watch src changes
watch(() => props.src, (newSrc, oldSrc) => {
  if (newSrc !== oldSrc) {
    // Reset state and reload
    retry();
  }
});

// Expose methods
defineExpose({
  load,
  retry,
  isLoaded,
  isLoading,
  hasError
});
</script>