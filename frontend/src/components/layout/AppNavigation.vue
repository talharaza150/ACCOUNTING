<template>
  <nav 
    class="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700"
    role="navigation"
    aria-label="Main navigation"
  >
    <div class="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
      <div class="flex justify-between h-14 sm:h-16">
        <!-- Logo and brand -->
        <div class="flex items-center">
          <div class="flex-shrink-0 flex items-center">
            <Icon 
              name="clipboard-document" 
              class="h-7 w-7 sm:h-8 sm:w-8 text-blue-600 dark:text-blue-400 mr-2 sm:mr-3" 
              aria-hidden="true" 
            />
            <h1 class="text-xl font-semibold text-gray-900 dark:text-gray-100 hidden sm:block">
              {{ title }}
            </h1>
            <h1 class="text-lg font-semibold text-gray-900 dark:text-gray-100 sm:hidden">
              {{ shortTitle }}
            </h1>
          </div>
        </div>

        <!-- Desktop navigation -->
        <div class="hidden md:flex items-center space-x-3">
          <!-- Navigation items -->
          <div v-if="navigationItems.length > 0" class="flex space-x-0.5">
            <BaseButton
              v-for="item in navigationItems"
              :key="item.id"
              :variant="item.active ? 'primary' : 'ghost'"
              :size="'sm'"
              :icon="item.icon"
              @click="handleNavigation(item)"
              :aria-current="item.active ? 'page' : undefined"
            >
              {{ item.label }}
            </BaseButton>
          </div>

          <!-- Dark mode toggle -->
          <BaseButton
            variant="ghost"
            size="sm"
            :icon="isDark ? 'sun' : 'moon'"
            icon-only
            :aria-label="isDark ? 'Switch to light mode' : 'Switch to dark mode'"
            @click="toggleDarkMode"
          />

          <!-- PWA Install Button -->
          <BaseButton
            v-if="isInstallable"
            variant="ghost"
            size="sm"
            icon="arrow-down-tray"
            icon-only
            aria-label="Install app"
            title="Install app for offline access"
            @click="installPWA"
          />

          <!-- PWA Update Button -->
          <BaseButton
            v-if="isUpdateAvailable"
            variant="primary"
            size="sm"
            icon="arrow-path"
            icon-only
            aria-label="Update app"
            title="New version available - click to update"
            @click="updatePWA"
          />

          <!-- Offline Indicator -->
          <div
            v-if="!isOnline"
            class="flex items-center px-2 py-1 bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 rounded-md text-xs"
            title="You are currently offline"
          >
            <Icon name="wifi-slash" size="xs" class="mr-1" />
            <span class="hidden sm:inline">Offline</span>
          </div>

          <!-- User menu -->
          <div v-if="user" class="relative" ref="userMenuRef">
            <BaseButton
              variant="ghost"
              size="sm"
              :aria-label="`User menu for ${user.name}`"
              :aria-expanded="isUserMenuOpen"
              aria-haspopup="true"
              @click="toggleUserMenu"
            >
              <div class="flex items-center space-x-2">
                <div class="h-8 w-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                  <span class="text-sm font-medium text-blue-700 dark:text-blue-300">
                    {{ user.initials }}
                  </span>
                </div>
                <span class="hidden lg:block text-sm font-medium text-gray-700 dark:text-gray-300">
                  {{ user.name }}
                </span>
                <Icon name="chevron-down" size="sm" class="text-gray-400" />
              </div>
            </BaseButton>

            <!-- User dropdown menu -->
            <Transition
              enter-active-class="transition ease-out duration-200"
              enter-from-class="opacity-0 scale-95"
              enter-to-class="opacity-100 scale-100"
              leave-active-class="transition ease-in duration-150"
              leave-from-class="opacity-100 scale-100"
              leave-to-class="opacity-0 scale-95"
            >
              <div
                v-if="isUserMenuOpen"
                class="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50"
                role="menu"
                aria-orientation="vertical"
              >
                <div class="py-1">
                  <div class="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                    <p class="text-sm font-medium text-gray-900 dark:text-gray-100">{{ user.name }}</p>
                    <p class="text-sm text-gray-500 dark:text-gray-400">{{ user.email }}</p>
                  </div>
                  
                  <button
                    v-for="item in userMenuItems"
                    :key="item.id"
                    class="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-2 touch-target"
                    role="menuitem"
                    @click="handleUserMenuClick(item)"
                  >
                    <Icon :name="item.icon" size="sm" />
                    <span>{{ item.label }}</span>
                  </button>
                </div>
              </div>
            </Transition>
          </div>
        </div>

        <!-- Mobile menu button -->
        <div class="md:hidden flex items-center space-x-2">
          <!-- Dark mode toggle for mobile -->
          <BaseButton
            variant="ghost"
            size="sm"
            :icon="isDark ? 'sun' : 'moon'"
            icon-only
            :aria-label="isDark ? 'Switch to light mode' : 'Switch to dark mode'"
            @click="toggleDarkMode"
          />

          <!-- Mobile menu toggle -->
          <BaseButton
            variant="ghost"
            size="sm"
            :icon="isMobileMenuOpen ? 'x-mark' : 'bars-3'"
            icon-only
            aria-label="Toggle navigation menu"
            :aria-expanded="isMobileMenuOpen"
            @click="toggleMobileMenu"
          />
        </div>
      </div>
    </div>

    <!-- Mobile menu -->
    <Transition
      enter-active-class="transition-all duration-300 ease-out"
      enter-from-class="opacity-0 max-h-0"
      enter-to-class="opacity-100 max-h-96"
      leave-active-class="transition-all duration-200 ease-in"
      leave-from-class="opacity-100 max-h-96"
      leave-to-class="opacity-0 max-h-0"
    >
      <div 
        v-if="isMobileMenuOpen"
        class="md:hidden bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 overflow-hidden"
      >
        <div class="px-3 py-2 space-y-1.5">
          <!-- Mobile navigation items -->
          <BaseButton
            v-for="item in navigationItems"
            :key="item.id"
            :variant="item.active ? 'primary' : 'ghost'"
            :icon="item.icon"
            full-width
            @click="handleNavigation(item)"
            :aria-current="item.active ? 'page' : undefined"
          >
            {{ item.label }}
          </BaseButton>

          <!-- User info and actions for mobile -->
          <div v-if="user" class="border-t border-gray-200 dark:border-gray-700 pt-1.5 mt-1.5">
            <div class="flex items-center px-2 py-1.5">
              <div class="h-10 w-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mr-3">
                <span class="text-sm font-medium text-blue-700 dark:text-blue-300">
                  {{ user.initials }}
                </span>
              </div>
              <div>
                <p class="text-sm font-medium text-gray-900 dark:text-gray-100">{{ user.name }}</p>
                <p class="text-sm text-gray-500 dark:text-gray-400">{{ user.email }}</p>
              </div>
            </div>
            
            <div class="space-y-0.5">
              <BaseButton
                v-for="item in userMenuItems"
                :key="item.id"
                variant="ghost"
                :icon="item.icon"
                full-width
                @click="handleUserMenuClick(item)"
              >
                {{ item.label }}
              </BaseButton>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </nav>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { onClickOutside } from '@vueuse/core';
import BaseButton from '@/components/ui/BaseButton.vue';
import Icon from '@/components/ui/Icon.vue';
import { useDarkMode } from '@/composables/useDarkMode';
import { usePWA } from '@/composables/usePWA';

interface NavigationItem {
  id: string;
  label: string;
  icon?: string;
  active?: boolean;
  handler: () => void;
}

interface User {
  name: string;
  email: string;
  initials: string;
}

interface Props {
  title?: string;
  shortTitle?: string;
  navigationItems?: NavigationItem[];
  user?: User;
  userMenuItems?: NavigationItem[];
}

const props = withDefaults(defineProps<Props>(), {
  title: 'Raza Accounting Portal',
  shortTitle: 'Raza Portal',
  navigationItems: () => [],
  userMenuItems: () => [
    { id: 'profile', label: 'Profile', icon: 'user', handler: () => {} },
    { id: 'settings', label: 'Settings', icon: 'cog', handler: () => {} },
    { id: 'logout', label: 'Logout', icon: 'arrow-right-on-rectangle', handler: () => {} }
  ]
});

const { isDark, toggle: toggleDarkMode } = useDarkMode();
const { isInstallable, installPWA, isOnline, isUpdateAvailable, updatePWA } = usePWA();

const isMobileMenuOpen = ref(false);
const isUserMenuOpen = ref(false);
const userMenuRef = ref<HTMLElement>();

// Close user menu when clicking outside
onClickOutside(userMenuRef, () => {
  isUserMenuOpen.value = false;
});

const toggleMobileMenu = () => {
  isMobileMenuOpen.value = !isMobileMenuOpen.value;
  if (isMobileMenuOpen.value) {
    isUserMenuOpen.value = false;
  }
};

const toggleUserMenu = () => {
  isUserMenuOpen.value = !isUserMenuOpen.value;
  if (isUserMenuOpen.value) {
    isMobileMenuOpen.value = false;
  }
};

const handleNavigation = (item: NavigationItem) => {
  item.handler();
  isMobileMenuOpen.value = false;
};

const handleUserMenuClick = (item: NavigationItem) => {
  item.handler();
  isUserMenuOpen.value = false;
  isMobileMenuOpen.value = false;
};

// Close mobile menu on escape key
const handleEscape = (event: KeyboardEvent) => {
  if (event.key === 'Escape') {
    if (isMobileMenuOpen.value) {
      isMobileMenuOpen.value = false;
    }
    if (isUserMenuOpen.value) {
      isUserMenuOpen.value = false;
    }
  }
};

// Close menus on route change or window resize
const closeAllMenus = () => {
  isMobileMenuOpen.value = false;
  isUserMenuOpen.value = false;
};

onMounted(() => {
  document.addEventListener('keydown', handleEscape);
  window.addEventListener('resize', closeAllMenus);
});

onUnmounted(() => {
  document.removeEventListener('keydown', handleEscape);
  window.removeEventListener('resize', closeAllMenus);
});
</script>