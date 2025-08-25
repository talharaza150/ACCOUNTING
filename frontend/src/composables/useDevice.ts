import { ref, onMounted } from 'vue';

export function useDevice() {
  const isNative = ref(false);
  const platform = ref('web');
  const isIOS = ref(false);
  const isAndroid = ref(false);
  const isMobile = ref(false);

  onMounted(() => {
    // Detect mobile using user agent
    const userAgent = navigator.userAgent || navigator.vendor;
    
    isIOS.value = /iPad|iPhone|iPod/.test(userAgent);
    isAndroid.value = /android/i.test(userAgent);
    isMobile.value = isIOS.value || isAndroid.value || /Mobi|Android/i.test(userAgent);
    
    if (isIOS.value) {
      platform.value = 'ios';
    } else if (isAndroid.value) {
      platform.value = 'android';  
    } else {
      platform.value = 'web';
    }
  });

  return {
    isNative,
    platform,
    isIOS,
    isAndroid,
    isMobile
  };
}