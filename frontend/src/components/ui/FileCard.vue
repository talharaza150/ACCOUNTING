<template>
  <div
    :class="cardClasses"
    :style="swipeStyle"
    @touchstart="handleTouchStart"
    @touchmove="handleTouchMove"
    @touchend="handleTouchEnd"
    @click="handleClick"
    role="article"
    :aria-label="`File: ${file.original_name}`"
    :tabindex="selectable ? 0 : undefined"
    @keydown="handleKeydown"
  >
    <!-- Selection checkbox -->
    <div v-if="selectable" class="absolute top-1.5 left-1.5 sm:top-2 sm:left-2 z-10">
      <label class="flex items-center cursor-pointer">
        <input
          type="checkbox"
          :checked="isSelected"
          @change="handleSelectionChange"
          @click.stop
          class="rounded border-gray-300 text-blue-600 focus:ring-blue-500 w-5 h-5 touch-manipulation"
          :aria-label="`Select ${file.original_name}`"
        />
      </label>
    </div>

    <!-- File icon/preview -->
    <div class="flex-shrink-0 mb-3 sm:mb-0 sm:mr-4">
      <div :class="iconContainerClasses">
        <!-- Image preview with lazy loading -->
        <LazyImage
          v-if="isImage && previewUrl"
          :src="previewUrl"
          :alt="file.original_name"
          :width="layout === 'grid' ? 200 : 80"
          :height="layout === 'grid' ? 150 : 80"
          fit="cover"
          container-class="w-full h-full rounded"
          image-class="w-full h-full object-cover rounded"
          :show-error-text="false"
          :show-progress="true"
          @error="handleImageError"
        />
        
        <!-- File type icon -->
        <Icon
          v-else
          :name="getFileIcon(file.mime_type)"
          :class="getIconClasses(file.mime_type)"
          size="lg"
          aria-hidden="true"
        />
        
        <!-- File size badge -->
        <div class="absolute -top-0.5 -right-0.5 bg-gray-500 text-white text-2xs px-1.5 py-0.5 rounded text-center min-w-[2rem] text-xs sm:text-2xs">
          {{ formatFileSize(file.file_size) }}
        </div>
      </div>
    </div>

    <!-- File info -->
    <div class="flex-1 min-w-0">
      <!-- File name -->
      <h3 class="font-medium text-gray-900 dark:text-gray-100 truncate mb-0.5 sm:mb-1 text-sm sm:text-base">
        {{ file.original_name }}
      </h3>
      
      <!-- Metadata -->
      <div class="space-y-0.5 sm:space-y-1 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
        <div class="flex items-center space-x-2">
          <Icon name="tag" size="sm" aria-hidden="true" />
          <span>{{ file.category_name || 'Uncategorized' }}</span>
        </div>
        
        <div class="flex items-center space-x-2">
          <Icon name="clock" size="sm" aria-hidden="true" />
          <time :datetime="file.created_at" :title="new Date(file.created_at).toLocaleString()">
            {{ formatDate(file.created_at) }}
          </time>
        </div>
        
        <div v-if="file.assigned_to_username" class="flex items-center space-x-2">
          <Icon name="user" size="sm" aria-hidden="true" />
          <span>{{ file.assigned_to_username }}</span>
        </div>
      </div>
      
      <!-- Description -->
      <p v-if="file.description" class="text-xs sm:text-sm text-gray-700 dark:text-gray-300 mt-1 sm:mt-2 line-clamp-2">
        {{ file.description }}
      </p>
    </div>

    <!-- Actions -->
    <div class="flex-shrink-0 mt-2 sm:mt-3 sm:mt-0 sm:ml-4">
      <div :class="actionsClasses">
        <BaseButton
          v-for="action in actions"
          :key="action.id"
          :variant="action.variant || 'ghost'"
          :size="compact ? 'sm' : 'md'"
          :icon="action.icon"
          :icon-only="compact"
          :aria-label="action.ariaLabel || action.label"
          @click.stop="handleAction(action)"
        >
          <span v-if="!compact">{{ action.label }}</span>
        </BaseButton>
      </div>
    </div>

    <!-- Swipe indicator -->
    <div v-if="swipeOffset !== 0" class="absolute inset-y-0 right-0 flex items-center pr-4">
      <div :class="swipeIndicatorClasses">
        <Icon :name="swipeOffset > 0 ? 'trash' : 'eye'" size="md" class="text-white" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import BaseButton from './BaseButton.vue';
import Icon from './Icon.vue';
import LazyImage from './LazyImage.vue';

interface FileData {
  id: string;
  original_name: string;
  mime_type: string;
  file_size: number;
  category_name?: string;
  assigned_to_username?: string;
  description?: string;
  created_at: string;
}

interface FileAction {
  id: string;
  label: string;
  icon: string;
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'ghost';
  ariaLabel?: string;
  handler: (file: FileData) => void;
}

interface Props {
  file: FileData;
  actions?: FileAction[];
  layout?: 'list' | 'grid';
  compact?: boolean;
  selectable?: boolean;
  isSelected?: boolean;
  previewUrl?: string;
  swipeEnabled?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  actions: () => [],
  layout: 'list',
  compact: false,
  selectable: false,
  isSelected: false,
  swipeEnabled: true
});

const emit = defineEmits<{
  click: [file: FileData];
  select: [file: FileData, selected: boolean];
  swipeAction: [file: FileData, action: 'view' | 'delete'];
}>();

// Swipe functionality
const swipeOffset = ref(0);
const isDragging = ref(false);
const startX = ref(0);
const startY = ref(0);

const cardClasses = computed(() => [
  'relative bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm transition-all duration-200 hover:shadow-md cursor-pointer',
  'overflow-hidden select-none touch-manipulation',
  props.layout === 'grid' 
    ? 'p-3 sm:p-4' 
    : 'p-3 sm:p-4 flex items-center space-x-3 sm:space-x-4',
  props.selectable && props.isSelected ? 'ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-900/20' : '',
  isDragging.value ? 'transition-none' : ''
]);

const iconContainerClasses = computed(() => [
  'relative',
  props.layout === 'grid' ? 'w-14 h-14 sm:w-16 sm:h-16 mx-auto' : 'w-10 h-10 sm:w-12 sm:h-12',
  'bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center overflow-hidden'
]);

const actionsClasses = computed(() => [
  'flex',
  props.layout === 'grid' ? 'justify-center space-x-1 mt-1.5 sm:mt-2' : 'space-x-1.5 sm:space-x-2'
]);

const swipeStyle = computed(() => ({
  transform: `translateX(${swipeOffset.value}px)`,
}));

const swipeIndicatorClasses = computed(() => [
  'w-8 h-8 rounded-full flex items-center justify-center',
  swipeOffset.value > 0 ? 'bg-red-500' : 'bg-blue-500'
]);

const isImage = computed(() => props.file.mime_type?.startsWith('image/'));

// File type mapping
const getFileIcon = (mimeType: string) => {
  if (mimeType?.startsWith('image/')) return 'photo';
  if (mimeType?.startsWith('video/')) return 'video-camera';
  if (mimeType?.startsWith('audio/')) return 'musical-note';
  if (mimeType === 'application/pdf') return 'document';
  if (mimeType?.includes('spreadsheet') || mimeType?.includes('csv')) return 'clipboard-document';
  if (mimeType?.includes('text/') || mimeType?.includes('code')) return 'code-bracket';
  if (mimeType?.includes('zip') || mimeType?.includes('archive')) return 'archive-box';
  return 'document';
};

const getIconClasses = (mimeType: string) => {
  if (mimeType?.startsWith('image/')) return 'text-green-500';
  if (mimeType?.startsWith('video/')) return 'text-purple-500';
  if (mimeType?.startsWith('audio/')) return 'text-yellow-500';
  if (mimeType === 'application/pdf') return 'text-red-500';
  if (mimeType?.includes('spreadsheet')) return 'text-emerald-500';
  if (mimeType?.includes('text/')) return 'text-blue-500';
  return 'text-gray-500';
};

// Utility functions
const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + sizes[i];
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 1) return 'Today';
  if (diffDays === 2) return 'Yesterday';
  if (diffDays <= 7) return `${diffDays} days ago`;
  return date.toLocaleDateString();
};

// Event handlers
const handleClick = () => {
  if (!isDragging.value && swipeOffset.value === 0) {
    emit('click', props.file);
  }
};

const handleAction = (action: FileAction) => {
  action.handler(props.file);
};

const handleSelectionChange = (event: Event) => {
  const target = event.target as HTMLInputElement;
  emit('select', props.file, target.checked);
};

const handleKeydown = (event: KeyboardEvent) => {
  if (props.selectable && event.key === ' ') {
    event.preventDefault();
    emit('select', props.file, !props.isSelected);
  } else if (event.key === 'Enter') {
    event.preventDefault();
    emit('click', props.file);
  }
};

const handleImageError = () => {
  // Handle image loading error by removing preview
};

// Touch/swipe handlers
const handleTouchStart = (event: TouchEvent) => {
  if (!props.swipeEnabled) return;
  
  const touch = event.touches[0];
  startX.value = touch.clientX;
  startY.value = touch.clientY;
  isDragging.value = false;
};

const handleTouchMove = (event: TouchEvent) => {
  if (!props.swipeEnabled) return;
  
  const touch = event.touches[0];
  const deltaX = touch.clientX - startX.value;
  const deltaY = Math.abs(touch.clientY - startY.value);
  
  // Only allow horizontal swipes
  if (deltaY > 30) return;
  
  isDragging.value = true;
  
  // Limit swipe distance
  const maxSwipe = 100;
  swipeOffset.value = Math.max(-maxSwipe, Math.min(maxSwipe, deltaX));
  
  if (Math.abs(deltaX) > 10) {
    event.preventDefault();
  }
};

const handleTouchEnd = () => {
  if (!props.swipeEnabled || !isDragging.value) {
    swipeOffset.value = 0;
    isDragging.value = false;
    return;
  }
  
  const threshold = 50;
  
  if (swipeOffset.value > threshold) {
    // Swipe right - delete action
    emit('swipeAction', props.file, 'delete');
  } else if (swipeOffset.value < -threshold) {
    // Swipe left - view action
    emit('swipeAction', props.file, 'view');
  }
  
  // Reset
  swipeOffset.value = 0;
  isDragging.value = false;
};
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>