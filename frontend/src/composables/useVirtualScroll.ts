import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue';

export interface VirtualScrollOptions {
  itemHeight: number;
  containerHeight?: number;
  overscan?: number;
  estimateSize?: boolean;
}

export function useVirtualScroll<T>(
  items: T[],
  options: VirtualScrollOptions
) {
  const {
    itemHeight,
    containerHeight = 400,
    overscan = 5,
    estimateSize = false
  } = options;

  // Refs
  const scrollElement = ref<HTMLElement>();
  const scrollTop = ref(0);
  const containerRef = ref<HTMLElement>();
  
  // Computed values
  const totalHeight = computed(() => items.length * itemHeight);
  
  const startIndex = computed(() => 
    Math.max(0, Math.floor(scrollTop.value / itemHeight) - overscan)
  );
  
  const endIndex = computed(() => 
    Math.min(
      items.length - 1,
      Math.ceil((scrollTop.value + containerHeight) / itemHeight) + overscan
    )
  );
  
  const visibleItems = computed(() => {
    const start = startIndex.value;
    const end = endIndex.value;
    
    return items.slice(start, end + 1).map((item, index) => ({
      item,
      index: start + index,
      top: (start + index) * itemHeight
    }));
  });
  
  const offsetY = computed(() => startIndex.value * itemHeight);

  // Methods
  const handleScroll = (event: Event) => {
    const target = event.target as HTMLElement;
    scrollTop.value = target.scrollTop;
  };

  const scrollToIndex = (index: number, behavior: ScrollBehavior = 'smooth') => {
    if (!scrollElement.value) return;
    
    const top = index * itemHeight;
    scrollElement.value.scrollTo({
      top,
      behavior
    });
  };

  const scrollToTop = (behavior: ScrollBehavior = 'smooth') => {
    scrollToIndex(0, behavior);
  };

  const scrollToItem = (item: T, behavior: ScrollBehavior = 'smooth') => {
    const index = items.findIndex(i => i === item);
    if (index !== -1) {
      scrollToIndex(index, behavior);
    }
  };

  // Resize observer for dynamic container sizing
  const resizeObserver = ref<ResizeObserver>();
  
  const observeContainer = () => {
    if (!containerRef.value || !ResizeObserver) return;
    
    resizeObserver.value = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { height } = entry.contentRect;
        options.containerHeight = height;
      }
    });
    
    resizeObserver.value.observe(containerRef.value);
  };

  // Lifecycle
  onMounted(() => {
    nextTick(() => {
      observeContainer();
    });
  });

  onUnmounted(() => {
    if (resizeObserver.value) {
      resizeObserver.value.disconnect();
    }
  });

  return {
    // Refs
    scrollElement,
    containerRef,
    
    // Computed
    totalHeight,
    visibleItems,
    offsetY,
    startIndex,
    endIndex,
    
    // Methods
    handleScroll,
    scrollToIndex,
    scrollToTop,
    scrollToItem
  };
}

// Enhanced virtual scroll with dynamic item heights
export function useVirtualScrollDynamic<T>(
  items: T[],
  options: Omit<VirtualScrollOptions, 'itemHeight'> & {
    estimateHeight: (item: T, index: number) => number;
    minHeight?: number;
    maxHeight?: number;
  }
) {
  const {
    estimateHeight,
    containerHeight = 400,
    overscan = 5,
    minHeight = 50,
    maxHeight = 200
  } = options;

  // Item height cache
  const itemHeights = ref<Map<number, number>>(new Map());
  const itemOffsets = ref<number[]>([]);
  
  // Refs
  const scrollElement = ref<HTMLElement>();
  const scrollTop = ref(0);
  const containerRef = ref<HTMLElement>();
  
  // Calculate item offsets
  const updateOffsets = () => {
    let offset = 0;
    const offsets = [];
    
    for (let i = 0; i < items.length; i++) {
      offsets[i] = offset;
      const height = itemHeights.value.get(i) || estimateHeight(items[i], i);
      offset += Math.max(minHeight, Math.min(maxHeight, height));
    }
    
    itemOffsets.value = offsets;
  };

  // Find item index by scroll position
  const findIndexByOffset = (offset: number): number => {
    let start = 0;
    let end = itemOffsets.value.length - 1;
    
    while (start <= end) {
      const mid = Math.floor((start + end) / 2);
      const midOffset = itemOffsets.value[mid];
      
      if (midOffset === offset) return mid;
      if (midOffset < offset) start = mid + 1;
      else end = mid - 1;
    }
    
    return Math.max(0, end);
  };

  const totalHeight = computed(() => {
    if (itemOffsets.value.length === 0) return 0;
    const lastIndex = items.length - 1;
    const lastOffset = itemOffsets.value[lastIndex] || 0;
    const lastHeight = itemHeights.value.get(lastIndex) || estimateHeight(items[lastIndex], lastIndex);
    return lastOffset + lastHeight;
  });
  
  const startIndex = computed(() => 
    Math.max(0, findIndexByOffset(scrollTop.value) - overscan)
  );
  
  const endIndex = computed(() => {
    const viewportBottom = scrollTop.value + containerHeight;
    return Math.min(items.length - 1, findIndexByOffset(viewportBottom) + overscan);
  });
  
  const visibleItems = computed(() => {
    updateOffsets();
    const start = startIndex.value;
    const end = endIndex.value;
    
    return items.slice(start, end + 1).map((item, index) => ({
      item,
      index: start + index,
      top: itemOffsets.value[start + index] || 0,
      height: itemHeights.value.get(start + index) || estimateHeight(item, start + index)
    }));
  });
  
  const offsetY = computed(() => itemOffsets.value[startIndex.value] || 0);

  // Methods
  const handleScroll = (event: Event) => {
    const target = event.target as HTMLElement;
    scrollTop.value = target.scrollTop;
  };

  const setItemHeight = (index: number, height: number) => {
    itemHeights.value.set(index, height);
    updateOffsets();
  };

  const scrollToIndex = (index: number, behavior: ScrollBehavior = 'smooth') => {
    if (!scrollElement.value) return;
    
    const top = itemOffsets.value[index] || 0;
    scrollElement.value.scrollTo({
      top,
      behavior
    });
  };

  return {
    // Refs
    scrollElement,
    containerRef,
    
    // Computed
    totalHeight,
    visibleItems,
    offsetY,
    startIndex,
    endIndex,
    
    // Methods
    handleScroll,
    scrollToIndex,
    setItemHeight,
    scrollToTop: () => scrollToIndex(0),
    scrollToItem: (item: T, behavior: ScrollBehavior = 'smooth') => {
      const index = items.findIndex(i => i === item);
      if (index !== -1) {
        scrollToIndex(index, behavior);
      }
    }
  };
}