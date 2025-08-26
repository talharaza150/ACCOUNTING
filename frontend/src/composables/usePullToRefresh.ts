import { ref, onMounted, onUnmounted } from 'vue';
import { useDevice } from './useDevice';

interface PullToRefreshOptions {
  threshold?: number;
  maxDistance?: number;
  onRefresh?: () => Promise<void> | void;
  disabled?: boolean;
}

export function usePullToRefresh(options: PullToRefreshOptions = {}) {
  const {
    threshold = 80, // Increased from 60 to 80
    maxDistance = 100, // Reduced from 120 to 100
    onRefresh,
    disabled = false
  } = options;

  const { isMobile } = useDevice();
  
  const isPulling = ref(false);
  const isRefreshing = ref(false);
  const pullDistance = ref(0);
  const canPull = ref(false);

  let startY = 0;
  let currentY = 0;
  let scrollElement: HTMLElement | null = null;

  const handleTouchStart = (e: TouchEvent) => {
    if (disabled || !isMobile.value || isRefreshing.value) return;
    
    startY = e.touches[0].clientY;
    // More restrictive - only allow pull-to-refresh at the very top and with minimal scroll
    const scrollTop = scrollElement ? scrollElement.scrollTop : window.scrollY;
    canPull.value = scrollTop <= 2; // Allow 2px tolerance for scroll position
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (disabled || !isMobile.value || !canPull.value || isRefreshing.value) return;

    currentY = e.touches[0].clientY;
    const diff = currentY - startY;

    // More restrictive conditions and less aggressive pull
    const scrollTop = scrollElement ? scrollElement.scrollTop : window.scrollY;
    if (diff > 10 && scrollTop <= 2) { // Minimum 10px pull and strict scroll position
      // Only prevent default if we're actually pulling
      if (diff > 20) {
        e.preventDefault();
      }
      isPulling.value = true;
      pullDistance.value = Math.min(diff * 0.3, maxDistance); // Reduced multiplier from 0.5 to 0.3
    }
  };

  const handleTouchEnd = async () => {
    if (disabled || !isMobile.value || !isPulling.value) return;

    if (pullDistance.value >= threshold && onRefresh) {
      isRefreshing.value = true;
      try {
        await onRefresh();
      } catch (error) {
        console.error('Pull to refresh error:', error);
      } finally {
        isRefreshing.value = false;
      }
    }

    // Reset state
    isPulling.value = false;
    pullDistance.value = 0;
    canPull.value = false;
  };

  const bindEvents = (element?: HTMLElement) => {
    const target = element || document;
    scrollElement = element || null;

    target.addEventListener('touchstart', handleTouchStart, { passive: false });
    target.addEventListener('touchmove', handleTouchMove, { passive: false });
    target.addEventListener('touchend', handleTouchEnd, { passive: true });
  };

  const unbindEvents = (element?: HTMLElement) => {
    const target = element || document;

    target.removeEventListener('touchstart', handleTouchStart);
    target.removeEventListener('touchmove', handleTouchMove);
    target.removeEventListener('touchend', handleTouchEnd);
  };

  onMounted(() => {
    if (isMobile.value) {
      bindEvents();
    }
  });

  onUnmounted(() => {
    unbindEvents();
  });

  return {
    isPulling,
    isRefreshing,
    pullDistance,
    bindEvents,
    unbindEvents
  };
}