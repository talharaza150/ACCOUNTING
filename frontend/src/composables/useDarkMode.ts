import { ref, watch, onMounted } from 'vue';

export function useDarkMode() {
  const isDark = ref(false);
  const isSystemDark = ref(false);
  const preference = ref<'light' | 'dark' | 'system'>('system');

  // Check system preference
  const updateSystemPreference = () => {
    isSystemDark.value = window.matchMedia('(prefers-color-scheme: dark)').matches;
  };

  // Apply dark mode
  const applyDarkMode = (dark: boolean) => {
    if (dark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    isDark.value = dark;
  };

  // Set preference
  const setPreference = (pref: 'light' | 'dark' | 'system') => {
    preference.value = pref;
    localStorage.setItem('theme-preference', pref);

    if (pref === 'system') {
      applyDarkMode(isSystemDark.value);
    } else {
      applyDarkMode(pref === 'dark');
    }
  };

  // Toggle between light and dark
  const toggle = () => {
    if (preference.value === 'system') {
      setPreference(isSystemDark.value ? 'light' : 'dark');
    } else {
      setPreference(preference.value === 'dark' ? 'light' : 'dark');
    }
  };

  // Initialize
  onMounted(() => {
    // Get saved preference
    const saved = localStorage.getItem('theme-preference') as 'light' | 'dark' | 'system' | null;
    preference.value = saved || 'system';

    // Update system preference
    updateSystemPreference();

    // Listen for system changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    mediaQuery.addEventListener('change', updateSystemPreference);

    // Apply initial theme
    if (preference.value === 'system') {
      applyDarkMode(isSystemDark.value);
    } else {
      applyDarkMode(preference.value === 'dark');
    }

    // Watch for system changes
    watch(isSystemDark, (newValue) => {
      if (preference.value === 'system') {
        applyDarkMode(newValue);
      }
    });
  });

  return {
    isDark,
    isSystemDark,
    preference,
    setPreference,
    toggle
  };
}