<template>
  <div 
    class="fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center"
    @click="handleBackdropClick"
    @keydown="handleKeydown"
    tabindex="0"
    role="dialog"
    aria-label="Image viewer"
    aria-modal="true"
  >
    <!-- Close button -->
    <button
      @click="$emit('close')"
      class="absolute top-4 right-4 z-10 p-2 text-white hover:text-gray-300 transition-colors bg-black bg-opacity-50 rounded-full"
      aria-label="Close image viewer"
    >
      <Icon name="x-mark" size="lg" />
    </button>

    <!-- Controls -->
    <div class="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex items-center space-x-4 bg-black bg-opacity-70 rounded-lg p-3">
      <!-- Zoom out -->
      <button
        @click="zoomOut"
        :disabled="scale <= minScale"
        class="p-2 text-white hover:text-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed transition-colors"
        aria-label="Zoom out"
      >
        <Icon name="minus" size="sm" />
      </button>

      <!-- Zoom level -->
      <span class="text-white text-sm font-medium min-w-[60px] text-center">
        {{ Math.round(scale * 100) }}%
      </span>

      <!-- Zoom in -->
      <button
        @click="zoomIn"
        :disabled="scale >= maxScale"
        class="p-2 text-white hover:text-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed transition-colors"
        aria-label="Zoom in"
      >
        <Icon name="plus" size="sm" />
      </button>

      <!-- Reset -->
      <button
        @click="resetTransform"
        class="p-2 text-white hover:text-gray-300 transition-colors"
        aria-label="Reset zoom and position"
      >
        <Icon name="arrow-path" size="sm" />
      </button>

      <!-- Fit to screen -->
      <button
        @click="fitToScreen"
        class="p-2 text-white hover:text-gray-300 transition-colors"
        aria-label="Fit to screen"
      >
        <Icon name="arrows-pointing-in" size="sm" />
      </button>
    </div>

    <!-- Loading indicator -->
    <div v-if="loading" class="flex items-center justify-center">
      <div class="animate-spin rounded-full h-12 w-12 border-2 border-white border-t-transparent"></div>
    </div>

    <!-- Image container -->
    <div
      ref="containerRef"
      class="relative w-full h-full overflow-hidden cursor-grab active:cursor-grabbing"
      :class="{ 'cursor-zoom-in': scale === 1, 'cursor-zoom-out': scale > 1 }"
      @mousedown="handleMouseDown"
      @mousemove="handleMouseMove"
      @mouseup="handleMouseUp"
      @mouseleave="handleMouseUp"
      @wheel="handleWheel"
      @touchstart="handleTouchStart"
      @touchmove="handleTouchMove"
      @touchend="handleTouchEnd"
    >
      <img
        ref="imageRef"
        :src="imageSrc"
        :alt="imageAlt"
        class="select-none transition-transform duration-300 ease-out"
        :style="imageStyle"
        @load="handleImageLoad"
        @error="handleImageError"
        @click="handleImageClick"
        draggable="false"
      />
    </div>

    <!-- Error message -->
    <div v-if="error" class="text-white text-center">
      <Icon name="exclamation-triangle" size="xl" class="mx-auto mb-2" />
      <p class="text-lg">Failed to load image</p>
      <button
        @click="$emit('close')"
        class="mt-4 px-4 py-2 bg-white text-black rounded hover:bg-gray-100 transition-colors"
      >
        Close
      </button>
    </div>

    <!-- Instructions for screen readers -->
    <div class="sr-only" aria-live="polite">
      {{ ariaInstructions }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue';
import Icon from './Icon.vue';

interface Props {
  imageSrc: string;
  imageAlt?: string;
}

const props = withDefaults(defineProps<Props>(), {
  imageAlt: 'Image'
});

const emit = defineEmits<{
  close: [];
}>();

// Refs
const containerRef = ref<HTMLElement>();
const imageRef = ref<HTMLImageElement>();

// State
const loading = ref(true);
const error = ref(false);
const scale = ref(1);
const translateX = ref(0);
const translateY = ref(0);
const isDragging = ref(false);
const dragStart = ref({ x: 0, y: 0 });
const lastTap = ref(0);

// Constants
const minScale = 0.1;
const maxScale = 10;
const zoomStep = 0.25;

// Touch handling for pinch-to-zoom
const initialTouchDistance = ref(0);
const initialScale = ref(1);

// Computed
const imageStyle = computed(() => ({
  transform: `scale(${scale.value}) translate(${translateX.value}px, ${translateY.value}px)`,
  transformOrigin: 'center center'
}));

const ariaInstructions = computed(() => {
  if (loading.value) return 'Loading image...';
  if (error.value) return 'Error loading image';
  return `Image viewer. Current zoom: ${Math.round(scale.value * 100)}%. Use mouse wheel or touch gestures to zoom. Click and drag to pan.`;
});

// Methods
const zoomIn = () => {
  scale.value = Math.min(scale.value + zoomStep, maxScale);
};

const zoomOut = () => {
  scale.value = Math.max(scale.value - zoomStep, minScale);
};

const resetTransform = () => {
  scale.value = 1;
  translateX.value = 0;
  translateY.value = 0;
};

const fitToScreen = () => {
  if (!containerRef.value || !imageRef.value) return;

  const container = containerRef.value.getBoundingClientRect();
  const image = imageRef.value;
  
  const containerRatio = container.width / container.height;
  const imageRatio = image.naturalWidth / image.naturalHeight;
  
  if (imageRatio > containerRatio) {
    // Image is wider
    scale.value = (container.width * 0.9) / image.naturalWidth;
  } else {
    // Image is taller
    scale.value = (container.height * 0.9) / image.naturalHeight;
  }
  
  translateX.value = 0;
  translateY.value = 0;
};

const handleImageLoad = () => {
  loading.value = false;
  error.value = false;
  nextTick(() => {
    fitToScreen();
  });
};

const handleImageError = () => {
  loading.value = false;
  error.value = true;
};

const handleBackdropClick = (e: MouseEvent) => {
  if (e.target === e.currentTarget) {
    emit('close');
  }
};

const handleImageClick = (e: MouseEvent) => {
  const now = Date.now();
  const timeSinceLastTap = now - lastTap.value;
  lastTap.value = now;

  // Double-click to zoom
  if (timeSinceLastTap < 300) {
    if (scale.value === 1) {
      // Zoom in to cursor position
      const rect = (e.target as HTMLElement).getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      
      scale.value = 2;
      translateX.value = (centerX - e.clientX) / scale.value;
      translateY.value = (centerY - e.clientY) / scale.value;
    } else {
      resetTransform();
    }
  }
};

const handleMouseDown = (e: MouseEvent) => {
  if (e.button !== 0) return; // Only handle left click
  
  isDragging.value = true;
  dragStart.value = {
    x: e.clientX - translateX.value,
    y: e.clientY - translateY.value
  };
  e.preventDefault();
};

const handleMouseMove = (e: MouseEvent) => {
  if (!isDragging.value || scale.value <= 1) return;
  
  translateX.value = e.clientX - dragStart.value.x;
  translateY.value = e.clientY - dragStart.value.y;
};

const handleMouseUp = () => {
  isDragging.value = false;
};

const handleWheel = (e: WheelEvent) => {
  e.preventDefault();
  
  const delta = e.deltaY > 0 ? -zoomStep : zoomStep;
  const newScale = Math.max(minScale, Math.min(scale.value + delta, maxScale));
  
  if (newScale !== scale.value) {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    // Calculate zoom point
    const zoomPointX = (e.clientX - centerX) / scale.value;
    const zoomPointY = (e.clientY - centerY) / scale.value;
    
    scale.value = newScale;
    
    // Adjust translation to zoom at cursor position
    if (newScale > 1) {
      translateX.value -= zoomPointX * (newScale - 1) / newScale;
      translateY.value -= zoomPointY * (newScale - 1) / newScale;
    } else {
      translateX.value = 0;
      translateY.value = 0;
    }
  }
};

// Touch handling
const getTouchDistance = (touches: TouchList) => {
  if (touches.length < 2) return 0;
  
  const touch1 = touches[0];
  const touch2 = touches[1];
  
  return Math.sqrt(
    Math.pow(touch2.clientX - touch1.clientX, 2) + 
    Math.pow(touch2.clientY - touch1.clientY, 2)
  );
};

const handleTouchStart = (e: TouchEvent) => {
  if (e.touches.length === 2) {
    // Pinch to zoom
    initialTouchDistance.value = getTouchDistance(e.touches);
    initialScale.value = scale.value;
  } else if (e.touches.length === 1) {
    // Pan
    const touch = e.touches[0];
    isDragging.value = true;
    dragStart.value = {
      x: touch.clientX - translateX.value,
      y: touch.clientY - translateY.value
    };
  }
  e.preventDefault();
};

const handleTouchMove = (e: TouchEvent) => {
  if (e.touches.length === 2) {
    // Pinch to zoom
    const currentDistance = getTouchDistance(e.touches);
    const scaleChange = currentDistance / initialTouchDistance.value;
    const newScale = Math.max(minScale, Math.min(initialScale.value * scaleChange, maxScale));
    
    scale.value = newScale;
  } else if (e.touches.length === 1 && isDragging.value && scale.value > 1) {
    // Pan
    const touch = e.touches[0];
    translateX.value = touch.clientX - dragStart.value.x;
    translateY.value = touch.clientY - dragStart.value.y;
  }
  e.preventDefault();
};

const handleTouchEnd = () => {
  isDragging.value = false;
  initialTouchDistance.value = 0;
  initialScale.value = 1;
};

const handleKeydown = (e: KeyboardEvent) => {
  switch (e.key) {
    case 'Escape':
      emit('close');
      break;
    case '+':
    case '=':
      e.preventDefault();
      zoomIn();
      break;
    case '-':
      e.preventDefault();
      zoomOut();
      break;
    case '0':
      e.preventDefault();
      resetTransform();
      break;
    case 'f':
    case 'F':
      e.preventDefault();
      fitToScreen();
      break;
  }
};

// Lifecycle
onMounted(() => {
  // Focus the container for keyboard navigation
  nextTick(() => {
    containerRef.value?.focus();
  });
  
  // Prevent body scrolling
  document.body.style.overflow = 'hidden';
});

onUnmounted(() => {
  // Restore body scrolling
  document.body.style.overflow = '';
});
</script>