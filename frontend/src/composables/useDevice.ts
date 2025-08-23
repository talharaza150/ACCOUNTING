import { ref, onMounted } from 'vue';
import { Capacitor } from '@capacitor/core';

export function useDevice() {
  const isNative = ref(false);
  const platform = ref('web');
  const isIOS = ref(false);
  const isAndroid = ref(false);

  onMounted(() => {
    isNative.value = Capacitor.isNativePlatform();
    platform.value = Capacitor.getPlatform();
    isIOS.value = platform.value === 'ios';
    isAndroid.value = platform.value === 'android';
  });

  return {
    isNative,
    platform,
    isIOS,
    isAndroid
  };
}