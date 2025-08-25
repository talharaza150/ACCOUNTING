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
    threshold = 60,
    maxDistance = 120,
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
    canPull.value = scrollElement ? scrollElement.scrollTop === 0 : window.scrollY === 0;
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (disabled || !isMobile.value || !canPull.value || isRefreshing.value) return;

    currentY = e.touches[0].clientY;
    const diff = currentY - startY;

    if (diff > 0 && (scrollElement ? scrollElement.scrollTop === 0 : window.scrollY === 0)) {
      e.preventDefault();
      isPulling.value = true;
      pullDistance.value = Math.min(diff * 0.5, maxDistance);
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