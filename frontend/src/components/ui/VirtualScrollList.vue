<template>
  <div 
    ref="containerRef"
    class="relative overflow-hidden"
    :style="{ height: `${height}px` }"
  >
    <div 
      ref="scrollElement"
      class="overflow-auto h-full custom-scrollbar"
      @scroll="handleScroll"
      :aria-label="ariaLabel"
      role="list"
    >
      <!-- Total height spacer -->
      <div 
        class="relative"
        :style="{ height: `${totalHeight}px` }"
      >
        <!-- Visible items -->
        <div 
          class="absolute top-0 left-0 right-0"
          :style="{ transform: `translateY(${offsetY}px)` }"
        >
          <div
            v-for="{ item, index, top, height } in visibleItems"
            :key="getItemKey ? getItemKey(item, index) : index"
            class="absolute left-0 right-0"
            :style="{ 
              top: dynamicHeight ? 0 : `${top - offsetY}px`,
              height: dynamicHeight ? `${height}px` : `${itemHeight}px`,
              transform: dynamicHeight ? `translateY(${top - offsetY}px)` : undefined
            }"
            :data-index="index"
            role="listitem"
          >
            <slot 
              :item="item" 
              :index="index"
              :active="activeIndex === index"
              :selected="selectedItems?.has?.(getItemKey ? getItemKey(item, index) : index)"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Loading indicator -->
    <div 
      v-if="loading" 
      class="absolute inset-0 flex items-center justify-center bg-white dark:bg-gray-900 bg-opacity-75 dark:bg-opacity-75"
    >
      <div class="flex flex-col items-center space-y-2">
        <div class="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent"></div>
        <span class="text-sm text-gray-600 dark:text-gray-400">Loading...</span>
      </div>
    </div>

    <!-- Empty state -->
    <div 
      v-if="!loading && items.length === 0" 
      class="absolute inset-0 flex items-center justify-center"
    >
      <div class="text-center">
        <div class="text-gray-400 dark:text-gray-600 mb-2">
          <Icon :name="emptyIcon || 'folder'" size="xl" />
        </div>
        <p class="text-gray-600 dark:text-gray-400 text-sm">
          {{ emptyMessage || 'No items found' }}
        </p>
      </div>
    </div>

    <!-- Scroll to top button -->
    <Transition
      enter-active-class="transition-all duration-300"
      enter-from-class="opacity-0 scale-95 translate-y-2"
      enter-to-class="opacity-100 scale-100 translate-y-0"
      leave-active-class="transition-all duration-200"
      leave-from-class="opacity-100 scale-100 translate-y-0"
      leave-to-class="opacity-0 scale-95 translate-y-2"
    >
      <button
        v-if="showScrollToTop && startIndex > 10"
        class="absolute bottom-4 right-4 p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg transition-colors z-10"
        @click="scrollToTop"
        aria-label="Scroll to top"
      >
        <Icon name="arrow-up" size="sm" />
      </button>
    </Transition>
  </div>
</template>

<script setup lang="ts" generic="T">
import { ref, computed, watch, nextTick } from 'vue';
import { useVirtualScroll, useVirtualScrollDynamic } from '@/composables/useVirtualScroll';
import Icon from './Icon.vue';

interface Props {
  items: T[];
  height: number;
  itemHeight?: number;
  dynamicHeight?: boolean;
  estimateHeight?: (item: T, index: number) => number;
  overscan?: number;
  loading?: boolean;
  activeIndex?: number;
  selectedItems?: Set<any>;
  getItemKey?: (item: T, index: number) => string | number;
  showScrollToTop?: boolean;
  emptyIcon?: string;
  emptyMessage?: string;
  ariaLabel?: string;
}

const props = withDefaults(defineProps<Props>(), {
  itemHeight: 60,
  overscan: 5,
  loading: false,
  dynamicHeight: false,
  showScrollToTop: true,
  ariaLabel: 'Virtual scroll list'
});

const emit = defineEmits<{
  'scroll': [{ scrollTop: number; startIndex: number; endIndex: number }];
  'item-resize': [{ index: number; height: number }];
}>();

// Use appropriate virtual scroll composable
const virtualScroll = computed(() => {
  if (props.dynamicHeight && props.estimateHeight) {
    return useVirtualScrollDynamic(props.items, {
      containerHeight: props.height,
      overscan: props.overscan,
      estimateHeight: props.estimateHeight
    });
  } else {
    return useVirtualScroll(props.items, {
      itemHeight: props.itemHeight,
      containerHeight: props.height,
      overscan: props.overscan
    });
  }
});

// Destructure virtual scroll properties
const {
  scrollElement,
  containerRef,
  totalHeight,
  visibleItems,
  offsetY,
  startIndex,
  endIndex,
  handleScroll: baseHandleScroll,
  scrollToIndex,
  scrollToTop,
  scrollToItem
} = virtualScroll.value;

// Enhanced scroll handler
const handleScroll = (event: Event) => {
  baseHandleScroll(event);
  
  emit('scroll', {
    scrollTop: (event.target as HTMLElement).scrollTop,
    startIndex: startIndex.value,
    endIndex: endIndex.value
  });
};

// Watch for item changes and maintain scroll position if needed
const lastScrollTop = ref(0);
watch(() => props.items.length, (newLength, oldLength) => {
  if (newLength < oldLength) {
    // Items were removed, maintain relative position
    nextTick(() => {
      if (scrollElement.value) {
        scrollElement.value.scrollTop = lastScrollTop.value;
      }
    });
  }
});

// Expose methods for parent components
defineExpose({
  scrollToIndex,
  scrollToTop,
  scrollToItem,
  getScrollElement: () => scrollElement.value,
  getCurrentRange: () => ({ start: startIndex.value, end: endIndex.value })
});
</script>