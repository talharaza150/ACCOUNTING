<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900 dark:text-gray-100">Settings</h1>
        <p class="mt-2 text-gray-600 dark:text-gray-400">
          Customize your application preferences and system settings
        </p>
      </div>

      <div class="space-y-8">
        <!-- Appearance Settings -->
        <div class="bg-white dark:bg-gray-800 shadow-sm rounded-lg">
          <div class="p-6">
            <h2 class="text-lg font-medium text-gray-900 dark:text-gray-100 mb-6">
              <Icon name="sun" size="sm" class="inline mr-2" />
              Appearance
            </h2>

            <div class="space-y-6">
              <!-- Theme Selection -->
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Theme
                </label>
                <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <button
                    v-for="theme in themes"
                    :key="theme.value"
                    @click="setTheme(theme.value)"
                    class="flex items-center p-3 border rounded-lg transition-colors hover:bg-gray-50 dark:hover:bg-gray-700"
                    :class="currentTheme === theme.value 
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                      : 'border-gray-200 dark:border-gray-700'"
                  >
                    <Icon :name="theme.icon" size="sm" class="mr-3" />
                    <div class="text-left">
                      <div class="font-medium text-gray-900 dark:text-gray-100">
                        {{ theme.name }}
                      </div>
                      <div class="text-sm text-gray-500 dark:text-gray-400">
                        {{ theme.description }}
                      </div>
                    </div>
                    <Icon 
                      v-if="currentTheme === theme.value"
                      name="check-circle" 
                      size="sm" 
                      class="ml-auto text-blue-500" 
                    />
                  </button>
                </div>
              </div>

              <!-- Font Size -->
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Font Size
                </label>
                <div class="flex items-center space-x-4">
                  <button
                    v-for="size in fontSizes"
                    :key="size.value"
                    @click="setFontSize(size.value)"
                    class="px-3 py-2 text-sm border rounded-md transition-colors"
                    :class="currentFontSize === size.value
                      ? 'border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400'
                      : 'border-gray-200 text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-700'"
                  >
                    {{ size.name }}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Notifications Settings -->
        <div class="bg-white dark:bg-gray-800 shadow-sm rounded-lg">
          <div class="p-6">
            <h2 class="text-lg font-medium text-gray-900 dark:text-gray-100 mb-6">
              <Icon name="bell" size="sm" class="inline mr-2" />
              Notifications
            </h2>

            <div class="space-y-4">
              <div v-for="notification in notificationSettings" :key="notification.key">
                <div class="flex items-center justify-between">
                  <div class="flex-1">
                    <h3 class="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {{ notification.title }}
                    </h3>
                    <p class="text-sm text-gray-500 dark:text-gray-400">
                      {{ notification.description }}
                    </p>
                  </div>
                  
                  <label class="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      class="sr-only peer"
                      :checked="notification.enabled"
                      @change="toggleNotification(notification.key)"
                    />
                    <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- File Management Settings -->
        <div class="bg-white dark:bg-gray-800 shadow-sm rounded-lg">
          <div class="p-6">
            <h2 class="text-lg font-medium text-gray-900 dark:text-gray-100 mb-6">
              <Icon name="folder" size="sm" class="inline mr-2" />
              File Management
            </h2>

            <div class="space-y-6">
              <!-- Auto-download -->
              <div class="flex items-center justify-between">
                <div class="flex-1">
                  <h3 class="text-sm font-medium text-gray-900 dark:text-gray-100">
                    Auto-download Files
                  </h3>
                  <p class="text-sm text-gray-500 dark:text-gray-400">
                    Automatically download files when clicked instead of previewing
                  </p>
                </div>
                
                <label class="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    class="sr-only peer"
                    v-model="fileSettings.autoDownload"
                    @change="saveFileSettings"
                  />
                  <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <!-- Default View -->
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Default File View
                </label>
                <select
                  v-model="fileSettings.defaultView"
                  @change="saveFileSettings"
                  class="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="grid">Grid View</option>
                  <option value="list">List View</option>
                  <option value="table">Table View</option>
                </select>
              </div>

              <!-- Files per page -->
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Files per Page
                </label>
                <select
                  v-model="fileSettings.itemsPerPage"
                  @change="saveFileSettings"
                  class="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option :value="10">10 files</option>
                  <option :value="25">25 files</option>
                  <option :value="50">50 files</option>
                  <option :value="100">100 files</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <!-- Language & Region Settings -->
        <div class="bg-white dark:bg-gray-800 shadow-sm rounded-lg">
          <div class="p-6">
            <h2 class="text-lg font-medium text-gray-900 dark:text-gray-100 mb-6">
              <Icon name="globe-alt" size="sm" class="inline mr-2" />
              Language & Region
            </h2>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <!-- Language -->
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Language
                </label>
                <select
                  v-model="regionSettings.language"
                  @change="saveRegionSettings"
                  class="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="en">English</option>
                  <option value="es">Español</option>
                  <option value="fr">Français</option>
                  <option value="de">Deutsch</option>
                </select>
              </div>

              <!-- Timezone -->
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Timezone
                </label>
                <select
                  v-model="regionSettings.timezone"
                  @change="saveRegionSettings"
                  class="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="UTC">UTC (GMT+0)</option>
                  <option value="America/New_York">Eastern Time (GMT-5)</option>
                  <option value="America/Chicago">Central Time (GMT-6)</option>
                  <option value="America/Denver">Mountain Time (GMT-7)</option>
                  <option value="America/Los_Angeles">Pacific Time (GMT-8)</option>
                  <option value="Europe/London">London (GMT+0)</option>
                  <option value="Europe/Paris">Paris (GMT+1)</option>
                </select>
              </div>

              <!-- Date Format -->
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Date Format
                </label>
                <select
                  v-model="regionSettings.dateFormat"
                  @change="saveRegionSettings"
                  class="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                  <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                  <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                </select>
              </div>

              <!-- Number Format -->
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Number Format
                </label>
                <select
                  v-model="regionSettings.numberFormat"
                  @change="saveRegionSettings"
                  class="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="US">1,234.56 (US)</option>
                  <option value="EU">1.234,56 (European)</option>
                  <option value="IN">1,23,456.78 (Indian)</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <!-- Admin-only Settings -->
        <div v-if="authStore.isAdmin" class="bg-white dark:bg-gray-800 shadow-sm rounded-lg">
          <div class="p-6">
            <h2 class="text-lg font-medium text-gray-900 dark:text-gray-100 mb-6">
              <Icon name="cog-6-tooth" size="sm" class="inline mr-2" />
              System Settings
            </h2>

            <div class="space-y-6">
              <!-- System Maintenance -->
              <div class="flex items-center justify-between">
                <div class="flex-1">
                  <h3 class="text-sm font-medium text-gray-900 dark:text-gray-100">
                    Maintenance Mode
                  </h3>
                  <p class="text-sm text-gray-500 dark:text-gray-400">
                    Enable maintenance mode to restrict access during updates
                  </p>
                </div>
                
                <label class="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    class="sr-only peer"
                    v-model="adminSettings.maintenanceMode"
                    @change="saveAdminSettings"
                  />
                  <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <!-- Auto-approve registrations -->
              <div class="flex items-center justify-between">
                <div class="flex-1">
                  <h3 class="text-sm font-medium text-gray-900 dark:text-gray-100">
                    Auto-approve Registrations
                  </h3>
                  <p class="text-sm text-gray-500 dark:text-gray-400">
                    Automatically approve new user registration requests
                  </p>
                </div>
                
                <label class="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    class="sr-only peer"
                    v-model="adminSettings.autoApproveRegistrations"
                    @change="saveAdminSettings"
                  />
                  <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <!-- Max file size -->
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Maximum File Upload Size (MB)
                </label>
                <input
                  type="number"
                  v-model.number="adminSettings.maxFileSize"
                  @change="saveAdminSettings"
                  min="1"
                  max="100"
                  class="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- Save All Changes Button -->
        <div class="flex justify-end">
          <BaseButton
            @click="saveAllSettings"
            variant="primary"
            :loading="isSaving"
          >
            <Icon name="check" size="sm" class="mr-2" />
            Save All Settings
          </BaseButton>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { useToast } from '@/composables/useToast';
import BaseButton from '@/components/ui/BaseButton.vue';
import Icon from '@/components/ui/Icon.vue';

const authStore = useAuthStore();
const { toast } = useToast();

// State
const isSaving = ref(false);

// Theme settings
const currentTheme = ref('system');
const currentFontSize = ref('medium');

const themes = [
  { value: 'light', name: 'Light', description: 'Clean and bright interface', icon: 'sun' },
  { value: 'dark', name: 'Dark', description: 'Easy on the eyes', icon: 'moon' },
  { value: 'system', name: 'System', description: 'Follow system preference', icon: 'computer-desktop' }
];

const fontSizes = [
  { value: 'small', name: 'Small' },
  { value: 'medium', name: 'Medium' },
  { value: 'large', name: 'Large' }
];

// Notification settings
const notificationSettings = ref([
  {
    key: 'fileUploaded',
    title: 'File Uploaded',
    description: 'Notify when files are uploaded to your account',
    enabled: true
  },
  {
    key: 'accountActivity',
    title: 'Account Activity',
    description: 'Notify about login activity and security events',
    enabled: true
  },
  {
    key: 'systemUpdates',
    title: 'System Updates',
    description: 'Notify about system maintenance and updates',
    enabled: false
  },
  {
    key: 'weeklyDigest',
    title: 'Weekly Digest',
    description: 'Receive weekly summary of account activity',
    enabled: true
  }
]);

// File management settings
const fileSettings = ref({
  autoDownload: false,
  defaultView: 'grid',
  itemsPerPage: 25
});

// Language & Region settings
const regionSettings = ref({
  language: 'en',
  timezone: 'UTC',
  dateFormat: 'MM/DD/YYYY',
  numberFormat: 'US'
});

// Admin settings
const adminSettings = ref({
  maintenanceMode: false,
  autoApproveRegistrations: false,
  maxFileSize: 10
});

// Methods
const setTheme = (theme: string) => {
  currentTheme.value = theme;
  
  // Apply theme immediately
  const html = document.documentElement;
  if (theme === 'dark') {
    html.classList.add('dark');
  } else if (theme === 'light') {
    html.classList.remove('dark');
  } else {
    // System theme
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    html.classList.toggle('dark', prefersDark);
  }
  
  localStorage.setItem('theme', theme);
  
  toast.success('Theme updated', {
    title: 'Settings',
    duration: 2000
  });
};

const setFontSize = (size: string) => {
  currentFontSize.value = size;
  
  // Apply font size
  const html = document.documentElement;
  html.classList.remove('font-small', 'font-medium', 'font-large');
  html.classList.add(`font-${size}`);
  
  localStorage.setItem('fontSize', size);
  
  toast.success('Font size updated', {
    title: 'Settings',
    duration: 2000
  });
};

const toggleNotification = (key: string) => {
  const setting = notificationSettings.value.find(n => n.key === key);
  if (setting) {
    setting.enabled = !setting.enabled;
    saveNotificationSettings();
  }
};

const saveNotificationSettings = () => {
  localStorage.setItem('notificationSettings', JSON.stringify(notificationSettings.value));
  
  toast.success('Notification preferences updated', {
    title: 'Settings',
    duration: 2000
  });
};

const saveFileSettings = () => {
  localStorage.setItem('fileSettings', JSON.stringify(fileSettings.value));
  
  toast.success('File management preferences updated', {
    title: 'Settings',
    duration: 2000
  });
};

const saveRegionSettings = () => {
  localStorage.setItem('regionSettings', JSON.stringify(regionSettings.value));
  
  toast.success('Language & region settings updated', {
    title: 'Settings',
    duration: 2000
  });
};

const saveAdminSettings = () => {
  localStorage.setItem('adminSettings', JSON.stringify(adminSettings.value));
  
  toast.success('System settings updated', {
    title: 'Settings',
    duration: 2000
  });
};

const saveAllSettings = async () => {
  try {
    isSaving.value = true;
    
    // Save all settings to localStorage (in a real app, you'd save to backend)
    saveNotificationSettings();
    saveFileSettings();
    saveRegionSettings();
    if (authStore.isAdmin) {
      saveAdminSettings();
    }
    
    toast.success('All settings saved successfully', {
      title: 'Settings Saved',
      duration: 3000
    });
    
  } catch (error) {
    toast.error('Failed to save settings', {
      title: 'Save Failed',
      duration: 5000
    });
  } finally {
    isSaving.value = false;
  }
};

const loadSettings = () => {
  // Load theme
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme) {
    currentTheme.value = savedTheme;
  }
  
  // Load font size
  const savedFontSize = localStorage.getItem('fontSize');
  if (savedFontSize) {
    currentFontSize.value = savedFontSize;
  }
  
  // Load notification settings
  const savedNotifications = localStorage.getItem('notificationSettings');
  if (savedNotifications) {
    notificationSettings.value = JSON.parse(savedNotifications);
  }
  
  // Load file settings
  const savedFileSettings = localStorage.getItem('fileSettings');
  if (savedFileSettings) {
    fileSettings.value = { ...fileSettings.value, ...JSON.parse(savedFileSettings) };
  }
  
  // Load region settings
  const savedRegionSettings = localStorage.getItem('regionSettings');
  if (savedRegionSettings) {
    regionSettings.value = { ...regionSettings.value, ...JSON.parse(savedRegionSettings) };
  }
  
  // Load admin settings
  if (authStore.isAdmin) {
    const savedAdminSettings = localStorage.getItem('adminSettings');
    if (savedAdminSettings) {
      adminSettings.value = { ...adminSettings.value, ...JSON.parse(savedAdminSettings) };
    }
  }
};

// Lifecycle
onMounted(() => {
  loadSettings();
});
</script>