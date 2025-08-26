import { ref, onMounted, onUnmounted, nextTick } from 'vue';

export interface LazyImageOptions {
  src: string;
  placeholder?: string;
  rootMargin?: string;
  threshold?: number;
  retryAttempts?: number;
  retryDelay?: number;
  onLoad?: (event: Event) => void;
  onError?: (error: Event) => void;
}

export function useLazyImage(options: LazyImageOptions) {
  const {
    src,
    placeholder = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjI0IiBoZWlnaHQ9IjI0IiBmaWxsPSIjZjNmNGY2Ii8+CjxwYXRoIGQ9Im0xNSA5LTYgNi02LTYiIHN0cm9rZT0iIzlDQTNBRiIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz4KPC9zdmc+',
    rootMargin = '50px',
    threshold = 0.1,
    retryAttempts = 3,
    retryDelay = 1000,
    onLoad,
    onError
  } = options;

  // State
  const imageRef = ref<HTMLImageElement>();
  const isLoaded = ref(false);
  const isLoading = ref(false);
  const hasError = ref(false);
  const currentSrc = ref(placeholder);
  const retryCount = ref(0);

  // Intersection Observer
  let observer: IntersectionObserver | null = null;

  // Load image with retry logic
  const loadImage = async (): Promise<void> => {
    if (isLoaded.value || isLoading.value) return;

    isLoading.value = true;
    hasError.value = false;

    return new Promise((resolve, reject) => {
      const img = new Image();
      
      img.onload = (event) => {
        isLoaded.value = true;
        isLoading.value = false;
        currentSrc.value = src;
        onLoad?.(event);
        resolve();
      };

      img.onerror = (event) => {
        isLoading.value = false;
        
        if (retryCount.value < retryAttempts) {
          retryCount.value++;
          console.log(`Image load failed, retrying... (${retryCount.value}/${retryAttempts})`);
          
          setTimeout(() => {
            loadImage().then(resolve).catch(reject);
          }, retryDelay);
        } else {
          hasError.value = true;
          onError?.(event);
          reject(new Error('Image loading failed after retries'));
        }
      };

      img.src = src;
    });
  };

  // Setup intersection observer
  const setupObserver = () => {
    if (!imageRef.value || !('IntersectionObserver' in window)) {
      // Fallback: load immediately if no IntersectionObserver support
      loadImage();
      return;
    }

    observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            loadImage();
            observer?.unobserve(entry.target);
          }
        });
      },
      {
        rootMargin,
        threshold
      }
    );

    observer.observe(imageRef.value);
  };

  // Force load image
  const forceLoad = () => {
    if (observer && imageRef.value) {
      observer.unobserve(imageRef.value);
    }
    loadImage();
  };

  // Retry loading
  const retry = () => {
    retryCount.value = 0;
    hasError.value = false;
    loadImage();
  };

  onMounted(() => {
    nextTick(() => {
      setupObserver();
    });
  });

  onUnmounted(() => {
    if (observer) {
      observer.disconnect();
    }
  });

  return {
    // Refs
    imageRef,
    
    // State
    isLoaded,
    isLoading,
    hasError,
    currentSrc,
    retryCount,
    
    // Methods
    forceLoad,
    retry
  };
}

// Utility function to generate optimized image URLs
export function getOptimizedImageUrl(
  originalUrl: string,
  options: {
    width?: number;
    height?: number;
    quality?: number;
    format?: 'webp' | 'jpeg' | 'png';
    fit?: 'cover' | 'contain' | 'fill';
  } = {}
): string {
  const {
    width,
    height,
    quality = 85,
    format,
    fit = 'cover'
  } = options;

  // If it's a blob URL or data URL, return as-is
  if (originalUrl.startsWith('blob:') || originalUrl.startsWith('data:')) {
    return originalUrl;
  }

  // For external image optimization services (like Cloudinary, ImageKit, etc.)
  // This is a placeholder - replace with your actual service
  const baseUrl = originalUrl;
  const params = new URLSearchParams();

  if (width) params.set('w', width.toString());
  if (height) params.set('h', height.toString());
  if (quality) params.set('q', quality.toString());
  if (format) params.set('f', format);
  if (fit) params.set('fit', fit);

  // For now, return original URL
  // In production, you'd integrate with an image optimization service
  return baseUrl;
}

// Generate responsive image srcset
export function generateSrcSet(
  originalUrl: string,
  sizes: number[] = [480, 768, 1024, 1280, 1920]
): string {
  return sizes
    .map(size => `${getOptimizedImageUrl(originalUrl, { width: size })} ${size}w`)
    .join(', ');
}

// Generate placeholder blur data URL
export function generatePlaceholder(
  width: number = 20,
  height: number = 20,
  color: string = '#f3f4f6'
): string {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  
  if (!ctx) return placeholder;
  
  canvas.width = width;
  canvas.height = height;
  
  // Fill with color
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, width, height);
  
  // Add subtle gradient
  const gradient = ctx.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, 'rgba(255,255,255,0.1)');
  gradient.addColorStop(1, 'rgba(0,0,0,0.1)');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);
  
  return canvas.toDataURL('image/jpeg', 0.1);
}

// Default placeholder SVG
const placeholder = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjI0IiBoZWlnaHQ9IjI0IiBmaWxsPSIjZjNmNGY2Ii8+CjxwYXRoIGQ9Im0xNSA5LTYgNi02LTYiIHN0cm9rZT0iIzlDQTNBRiIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz4KPC9zdmc+';