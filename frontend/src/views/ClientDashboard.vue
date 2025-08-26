<template>
  <PullToRefresh
    :on-refresh="refreshFiles"
    :disabled="isLoading"
  >
    <div class="min-h-screen bg-gray-50 dark:bg-gray-900 overflow-x-hidden">
      <!-- Navigation -->
      <AppNavigation
        title="Raza Accounting Portal"
        short-title="Portal"
        :user="userInfo"
        :navigation-items="navigationItems"
        :user-menu-items="userMenuItems"
      />

      <!-- Main Content -->
      <main class="max-w-7xl mx-auto py-2 px-3 sm:py-6 sm:px-6 lg:px-8 pb-20" role="main">
      <!-- Page Header -->
      <header class="mb-4 sm:mb-8">
        <div class="md:flex md:items-center md:justify-between">
          <div class="flex-1 min-w-0">
            <h1 class="text-2xl font-bold leading-7 text-gray-900 dark:text-gray-100 sm:text-3xl">
              My Documents
            </h1>
            <p class="mt-1 text-sm text-gray-600 dark:text-gray-400">
              Manage and access your accounting documents
            </p>
          </div>
          <div class="mt-3 flex flex-wrap gap-2 md:mt-0 md:ml-4 md:space-x-3 md:gap-0">
            <!-- View toggle -->
            <div class="flex rounded-md shadow-sm" role="group" aria-label="View options">
              <BaseButton
                :variant="viewMode === 'list' ? 'primary' : 'secondary'"
                size="sm"
                icon="list"
                icon-only
                aria-label="List view"
                @click="setViewMode('list')"
              />
              <BaseButton
                :variant="viewMode === 'grid' ? 'primary' : 'secondary'"
                size="sm"
                icon="grid"
                icon-only
                aria-label="Grid view"
                class="-ml-px"
                @click="setViewMode('grid')"
              />
            </div>

            <!-- Upload button -->
            <BaseButton
              variant="primary"
              size="sm"
              icon="cloud-arrow-up"
              @click="openUploadModal"
            >
              Upload Document
            </BaseButton>
          </div>
        </div>
      </header>

      <!-- Stats Cards -->
      <section class="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-6 mb-4 md:mb-8" aria-label="Document statistics">
        <div class="card p-4 sm:p-6">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <Icon name="document" class="h-8 w-8 text-blue-500" aria-hidden="true" />
            </div>
            <div class="ml-5 w-0 flex-1">
              <dl>
                <dt class="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                  Total Files
                </dt>
                <dd class="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                  {{ files.length }}
                </dd>
              </dl>
            </div>
          </div>
        </div>

        <div class="card p-4 sm:p-6">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <Icon name="clock" class="h-8 w-8 text-green-500" aria-hidden="true" />
            </div>
            <div class="ml-5 w-0 flex-1">
              <dl>
                <dt class="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                  Recent Files
                </dt>
                <dd class="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                  {{ recentFiles.length }}
                </dd>
              </dl>
            </div>
          </div>
        </div>

        <div class="card p-4 sm:p-6">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <Icon name="tag" class="h-8 w-8 text-purple-500" aria-hidden="true" />
            </div>
            <div class="ml-5 w-0 flex-1">
              <dl>
                <dt class="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                  Categories
                </dt>
                <dd class="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                  {{ uniqueCategories.length }}
                </dd>
              </dl>
            </div>
          </div>
        </div>
      </section>

      <!-- Search and Filters -->
      <section class="card mb-4 md:mb-8" aria-label="Search and filter documents">
        <div class="p-3 sm:p-6">
          <div class="flex flex-col sm:flex-row gap-2 sm:gap-4">
            <!-- Search input -->
            <div class="flex-1">
              <BaseInput
                v-model="searchTerm"
                type="search"
                placeholder="Search documents..."
                leading-icon="magnifying-glass"
                clearable
                :debounce="300"
                aria-label="Search documents"
              />
            </div>

            <!-- Category filter -->
            <div class="sm:w-48">
              <select
                v-model="selectedCategory"
                class="block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm min-h-[44px]"
                aria-label="Filter by category"
              >
                <option value="">All Categories</option>
                <option v-for="category in uniqueCategories" :key="category" :value="category">
                  {{ category }}
                </option>
              </select>
            </div>

            <!-- Sort options -->
            <div class="sm:w-48">
              <select
                v-model="sortBy"
                class="block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm min-h-[44px]"
                aria-label="Sort documents"
              >
                <option value="created_at">Date Added</option>
                <option value="original_name">Name</option>
                <option value="file_size">Size</option>
                <option value="category_name">Category</option>
              </select>
            </div>
          </div>
        </div>
      </section>

      <!-- File List/Grid -->
      <section aria-label="Documents">
        <!-- Loading state -->
        <div v-if="loading" class="space-y-4">
          <div v-for="i in 5" :key="i" class="card p-4 sm:p-6 loading-skeleton h-20 sm:h-24"></div>
        </div>

        <!-- Empty state -->
        <div v-else-if="filteredFiles.length === 0" class="text-center py-12">
          <Icon name="document" class="mx-auto h-16 w-16 text-gray-400 mb-4" aria-hidden="true" />
          <h3 class="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
            {{ searchTerm || selectedCategory ? 'No matching documents' : 'No documents yet' }}
          </h3>
          <p class="text-gray-600 dark:text-gray-400 mb-6">
            {{ searchTerm || selectedCategory 
              ? 'Try adjusting your search or filter criteria.' 
              : 'Get started by uploading your first document.' 
            }}
          </p>
          <BaseButton
            v-if="!searchTerm && !selectedCategory"
            variant="primary"
            icon="cloud-arrow-up"
            @click="openUploadModal"
          >
            Upload Document
          </BaseButton>
        </div>

        <!-- File grid/list with Virtual Scrolling -->
        <VirtualScrollList
          v-else-if="shouldUseVirtualScroll"
          :items="sortedFiles"
          :height="isMobile ? 500 : 600"
          :item-height="viewMode === 'grid' ? (isMobile ? 240 : 280) : (isMobile ? 100 : 120)"
          :selected-items="selectedFiles"
          :get-item-key="(file) => file.id"
          :empty-message="'No files found'"
          :empty-icon="'document'"
          :aria-label="'Files list'"
          class="rounded-lg border border-gray-200 dark:border-gray-700 touch-pan-y overscroll-y-contain"
        >
          <template #default="{ item: file, index }">
            <div class="p-1.5 sm:p-2">
              <FileCard
                :file="file"
                :layout="viewMode"
                :actions="fileActions"
                :selectable="bulkMode"
                :is-selected="selectedFiles.has(file.id)"
                :preview-url="getPreviewUrl(file)"
                @click="viewFile"
                @select="handleFileSelection"
                @swipe-action="handleSwipeAction"
              />
            </div>
          </template>
        </VirtualScrollList>

        <!-- Standard File grid/list -->
        <div
          v-else
          :class="[
            viewMode === 'grid' 
              ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4' 
              : 'space-y-3 sm:space-y-4',
            'touch-pan-y overscroll-y-contain'
          ]"
        >
          <FileCard
            v-for="file in sortedFiles"
            :key="file.id"
            :file="file"
            :layout="viewMode"
            :actions="fileActions"
            :selectable="bulkMode"
            :is-selected="selectedFiles.has(file.id)"
            :preview-url="getPreviewUrl(file)"
            @click="viewFile"
            @select="handleFileSelection"
            @swipe-action="handleSwipeAction"
          />
        </div>

        <!-- Pagination -->
        <div v-if="totalPages > 1" class="mt-6 sm:mt-8 flex justify-center">
          <nav class="flex space-x-1.5 sm:space-x-2 flex-wrap justify-center" aria-label="Pagination">
            <BaseButton
              variant="ghost"
              size="sm"
              :disabled="currentPage === 1"
              @click="goToPage(currentPage - 1)"
              aria-label="Previous page"
            >
              Previous
            </BaseButton>
            
            <BaseButton
              v-for="page in visiblePages"
              :key="page"
              :variant="page === currentPage ? 'primary' : 'ghost'"
              size="sm"
              @click="goToPage(page)"
              :aria-current="page === currentPage ? 'page' : undefined"
            >
              {{ page }}
            </BaseButton>
            
            <BaseButton
              variant="ghost"
              size="sm"
              :disabled="currentPage === totalPages"
              @click="goToPage(currentPage + 1)"
              aria-label="Next page"
            >
              Next
            </BaseButton>
          </nav>
        </div>
      </section>

      <!-- Bulk Actions Bar -->
      <Transition
        enter-active-class="transition-all duration-300 ease-out"
        enter-from-class="opacity-0 transform translate-y-2"
        enter-to-class="opacity-100 transform translate-y-0"
        leave-active-class="transition-all duration-200 ease-in"
        leave-from-class="opacity-100 transform translate-y-0"
        leave-to-class="opacity-0 transform translate-y-2"
      >
        <div
          v-if="selectedFiles.size > 0"
          class="fixed bottom-2 left-2 right-2 mx-auto max-w-2xl bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-3 sm:p-4 z-40 touch-manipulation"
        >
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-3">
              <span class="text-sm font-medium text-gray-900 dark:text-gray-100">
                {{ selectedFiles.size }} {{ selectedFiles.size === 1 ? 'file' : 'files' }} selected
              </span>
            </div>
            <div class="flex items-center space-x-1.5 sm:space-x-2 overflow-x-auto">
              <BaseButton
                variant="ghost"
                size="sm"
                icon="arrow-down-tray"
                @click="downloadSelected"
              >
                Download
              </BaseButton>
              <BaseButton
                variant="danger"
                size="sm"
                icon="trash"
                @click="deleteSelected"
              >
                Delete
              </BaseButton>
              <BaseButton
                variant="ghost"
                size="sm"
                @click="clearSelection"
              >
                Cancel
              </BaseButton>
            </div>
          </div>
        </div>
      </Transition>
    </main>

    <!-- Modals -->
    <!-- Upload Modal -->
    <BaseModal
      v-model="showUploadModal"
      title="Upload Document"
      size="md"
      @close="resetUploadForm"
    >
      <form @submit.prevent="uploadFile" class="space-y-4">
        <!-- Drag & Drop Zone -->
        <div
          @drop="handleFileDrop"
          @dragover="handleDragOver"
          @dragleave="handleDragLeave"
          @dragenter="handleDragEnter"
          :class="[
            'border-2 border-dashed rounded-lg p-8 text-center transition-colors duration-200',
            isDragging 
              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
              : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
          ]"
        >
          <Icon name="cloud-arrow-up" class="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <div class="space-y-2">
            <p class="text-sm text-gray-600 dark:text-gray-400">
              <BaseButton
                type="button"
                variant="link"
                @click="triggerFileInput"
                class="font-medium"
              >
                Click to upload
              </BaseButton>
              or drag and drop
            </p>
            <p class="text-xs text-gray-500">
              PDF, DOC, JPG, PNG up to 10MB
            </p>
          </div>
          <input
            ref="fileInputRef"
            type="file"
            class="sr-only"
            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.txt,.csv,.xlsx"
            @change="handleFileSelect"
          />
        </div>

        <!-- Selected file info -->
        <div v-if="selectedFile" class="flex items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-md">
          <Icon name="document" class="h-6 w-6 text-gray-400 mr-3" />
          <div class="flex-1">
            <p class="text-sm font-medium text-gray-900 dark:text-gray-100">
              {{ selectedFile.name }}
            </p>
            <p class="text-xs text-gray-500">
              {{ formatFileSize(selectedFile.size) }}
            </p>
          </div>
          <BaseButton
            variant="ghost"
            size="sm"
            icon="x-mark"
            icon-only
            @click="removeSelectedFile"
            aria-label="Remove file"
          />
        </div>

        <!-- Form fields -->
        <div class="space-y-4">
          <BaseInput
            v-model="uploadForm.description"
            label="Description (Optional)"
            type="textarea"
            rows="3"
            placeholder="Brief description of the document..."
          />

          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Category (Optional)
            </label>
            <select
              v-model="uploadForm.categoryId"
              class="block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm min-h-[44px]"
            >
              <option value="">Select a category...</option>
              <option v-for="category in categories" :key="category.id" :value="category.id">
                {{ category.name }}
              </option>
            </select>
          </div>
        </div>
      </form>

      <template #footer>
        <div class="flex justify-end space-x-3">
          <BaseButton
            variant="ghost"
            @click="showUploadModal = false"
          >
            Cancel
          </BaseButton>
          <BaseButton
            variant="primary"
            :loading="uploading"
            :disabled="!selectedFile || uploading"
            @click="uploadFile"
          >
            {{ uploading ? 'Uploading...' : 'Upload Document' }}
          </BaseButton>
        </div>
      </template>
    </BaseModal>

    <!-- File Viewer Modal -->
    <BaseModal
      v-model="showViewer"
      :title="selectedFileForView?.original_name"
      size="xl"
      @close="closeViewer"
    >
      <div class="max-h-96 overflow-auto custom-scrollbar">
        <!-- Image preview -->
        <div v-if="isImage(selectedFileForView)" class="text-center">
          <img
            :src="filePreviewUrl"
            :alt="selectedFileForView.original_name"
            class="max-w-full max-h-80 mx-auto rounded"
            @error="handlePreviewError"
          />
        </div>
        
        <!-- PDF preview -->
        <div v-else-if="isPDF(selectedFileForView)" class="text-center">
          <iframe
            :src="filePreviewUrl"
            class="w-full h-80 border-0 rounded"
            title="PDF preview"
          ></iframe>
        </div>
        
        <!-- Text file preview -->
        <div v-else-if="isText(selectedFileForView)" class="bg-gray-100 dark:bg-gray-700 p-4 rounded-md">
          <pre v-if="fileContent" class="text-sm whitespace-pre-wrap font-mono">{{ fileContent }}</pre>
          <div v-else class="text-center text-gray-500 py-4">
            <Icon name="arrow-path" class="animate-spin mx-auto mb-2" />
            Loading file content...
          </div>
        </div>
        
        <!-- Unsupported file type -->
        <div v-else class="text-center p-8">
          <Icon name="document" class="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <p class="text-gray-600 dark:text-gray-400 mb-2">Preview not available</p>
          <p class="text-sm text-gray-500">{{ selectedFileForView?.mime_type }}</p>
        </div>
      </div>

      <template #footer>
        <div class="flex justify-end space-x-3">
          <BaseButton
            variant="secondary"
            icon="arrow-down-tray"
            @click="downloadFile(selectedFileForView)"
          >
            Download
          </BaseButton>
          <BaseButton
            variant="ghost"
            @click="showViewer = false"
          >
            Close
          </BaseButton>
        </div>
      </template>
    </BaseModal>

    <!-- Delete Confirmation Modal -->
    <BaseModal
      v-model="showDeleteModal"
      title="Delete Document"
      size="sm"
    >
      <div class="text-center">
        <Icon name="exclamation-triangle" class="mx-auto h-12 w-12 text-red-500 mb-4" />
        <p class="text-gray-600 dark:text-gray-400 mb-4">
          Are you sure you want to delete this document? This action cannot be undone.
        </p>
        <div v-if="selectedFileForDelete" class="bg-gray-50 dark:bg-gray-700 p-3 rounded-md mb-4">
          <p class="font-medium text-gray-900 dark:text-gray-100">
            {{ selectedFileForDelete.original_name }}
          </p>
        </div>
      </div>

      <template #footer>
        <div class="flex justify-end space-x-3">
          <BaseButton
            variant="ghost"
            @click="showDeleteModal = false"
          >
            Cancel
          </BaseButton>
          <BaseButton
            variant="danger"
            :loading="deleting"
            @click="confirmDelete"
          >
            {{ deleting ? 'Deleting...' : 'Delete Document' }}
          </BaseButton>
        </div>
      </template>
    </BaseModal>

    <!-- Advanced Image Viewer -->
    <ImageViewer
      v-if="showImageViewer && filePreviewUrl"
      :image-src="filePreviewUrl"
      :image-alt="selectedFileForView?.original_name"
      @close="closeImageViewer"
    />
    </div>
  </PullToRefresh>
</template><script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { useToast } from '@/composables/useToast';
import { useDarkMode } from '@/composables/useDarkMode';
import { useAnalytics } from '@/composables/useAnalytics';
import { useDevice } from '@/composables/useDevice';
import api from '@/lib/axios';

// Components
import AppNavigation from '@/components/layout/AppNavigation.vue';
import BaseButton from '@/components/ui/BaseButton.vue';
import BaseInput from '@/components/ui/BaseInput.vue';
import BaseModal from '@/components/ui/BaseModal.vue';
import Icon from '@/components/ui/Icon.vue';
import FileCard from '@/components/ui/FileCard.vue';
import PullToRefresh from '@/components/ui/PullToRefresh.vue';
import ImageViewer from '@/components/ui/ImageViewer.vue';
import VirtualScrollList from '@/components/ui/VirtualScrollList.vue';

const router = useRouter();
const authStore = useAuthStore();
const { toast } = useToast();
const analytics = useAnalytics();
const { isDark } = useDarkMode();
const { isMobile } = useDevice();

// State management
const files = ref<any[]>([]);
const categories = ref<any[]>([]);
const loading = ref(true);
const searchTerm = ref('');
const selectedCategory = ref('');
const sortBy = ref('created_at');
const viewMode = ref<'list' | 'grid'>('list');
const bulkMode = ref(false);
const selectedFiles = ref(new Set<string>());
const enableVirtualScroll = ref(false);

// Pagination
const currentPage = ref(1);
const itemsPerPage = ref(20);

// Modals
const showUploadModal = ref(false);
const showViewer = ref(false);
const showDeleteModal = ref(false);
const showImageViewer = ref(false);

// File operations
const uploading = ref(false);
const deleting = ref(false);
const selectedFile = ref<File | null>(null);
const selectedFileForView = ref<any>(null);
const selectedFileForDelete = ref<any>(null);
const filePreviewUrl = ref('');
const fileContent = ref('');
const isDragging = ref(false);
const fileInputRef = ref<HTMLInputElement>();

// Upload form
const uploadForm = ref({
  description: '',
  categoryId: ''
});

// User info for navigation
const userInfo = computed(() => {
  if (!authStore.user) return null;
  return {
    name: authStore.fullName,
    email: authStore.user.email,
    initials: `${authStore.user.first_name?.[0] || ''}${authStore.user.last_name?.[0] || ''}`.toUpperCase()
  };
});

// Navigation items
const navigationItems = computed(() => [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: 'home',
    active: true,
    handler: () => router.push('/dashboard')
  }
]);

const userMenuItems = computed(() => [
  {
    id: 'profile',
    label: 'Profile',
    icon: 'user',
    handler: () => {}
  },
  {
    id: 'settings',
    label: 'Settings', 
    icon: 'cog',
    handler: () => {}
  },
  {
    id: 'logout',
    label: 'Sign Out',
    icon: 'arrow-right-on-rectangle',
    handler: handleLogout
  }
]);

// File actions
const fileActions = computed(() => [
  {
    id: 'view',
    label: 'View',
    icon: 'eye',
    variant: 'secondary' as const,
    handler: viewFile
  },
  {
    id: 'download',
    label: 'Download',
    icon: 'arrow-down-tray',
    variant: 'secondary' as const,
    handler: downloadFile
  },
  {
    id: 'delete',
    label: 'Delete',
    icon: 'trash',
    variant: 'danger' as const,
    handler: confirmDeleteFile
  }
]);

// Computed properties
const recentFiles = computed(() => {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  return files.value.filter(file => new Date(file.created_at) > thirtyDaysAgo);
});

const uniqueCategories = computed(() => {
  const categoryNames = files.value
    .map(file => file.category_name)
    .filter(Boolean);
  return [...new Set(categoryNames)];
});

const filteredFiles = computed(() => {
  let filtered = files.value;

  // Search filter
  if (searchTerm.value) {
    const search = searchTerm.value.toLowerCase();
    filtered = filtered.filter(file => 
      file.original_name.toLowerCase().includes(search) ||
      (file.description && file.description.toLowerCase().includes(search)) ||
      (file.category_name && file.category_name.toLowerCase().includes(search))
    );
  }

  // Category filter
  if (selectedCategory.value) {
    filtered = filtered.filter(file => file.category_name === selectedCategory.value);
  }

  return filtered;
});

const sortedFiles = computed(() => {
  const sorted = [...filteredFiles.value];
  
  sorted.sort((a, b) => {
    let aValue = a[sortBy.value];
    let bValue = b[sortBy.value];

    // Handle date sorting
    if (sortBy.value === 'created_at') {
      return new Date(bValue).getTime() - new Date(aValue).getTime();
    }

    // Handle string sorting
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return aValue.localeCompare(bValue);
    }

    // Handle numeric sorting
    return (aValue || 0) - (bValue || 0);
  });

  // Pagination
  const start = (currentPage.value - 1) * itemsPerPage.value;
  return sorted.slice(start, start + itemsPerPage.value);
});

// Auto-enable virtual scrolling for large lists
const shouldUseVirtualScroll = computed(() => 
  filteredFiles.value.length > 100 || enableVirtualScroll.value
);

const totalPages = computed(() => 
  shouldUseVirtualScroll.value ? 1 : Math.ceil(filteredFiles.value.length / itemsPerPage.value)
);

const visiblePages = computed(() => {
  const total = totalPages.value;
  const current = currentPage.value;
  const delta = 2;
  
  const range = [];
  const rangeWithDots = [];

  for (let i = Math.max(2, current - delta); 
       i <= Math.min(total - 1, current + delta); 
       i++) {
    range.push(i);
  }

  if (current - delta > 2) {
    rangeWithDots.push(1, '...');
  } else {
    rangeWithDots.push(1);
  }

  rangeWithDots.push(...range);

  if (current + delta < total - 1) {
    rangeWithDots.push('...', total);
  } else if (total > 1) {
    rangeWithDots.push(total);
  }

  return rangeWithDots.filter(page => page !== 1 || total > 1);
});

// Methods
const fetchFiles = async () => {
  try {
    loading.value = true;
    const response = await api.get('/api/files');
    files.value = response.data;
  } catch (error) {
    console.error('Error fetching files:', error);
    toast.error('Failed to load files');
  } finally {
    loading.value = false;
  }
};

// Pull-to-refresh handler
const refreshFiles = async () => {
  try {
    const response = await api.get('/api/files');
    files.value = response.data;
    toast.success('Files refreshed', {
      duration: 2000
    });
  } catch (error) {
    console.error('Error refreshing files:', error);
    toast.error('Failed to refresh files');
  }
};

const fetchCategories = async () => {
  try {
    const response = await api.get('/api/categories');
    categories.value = response.data;
  } catch (error) {
    console.error('Error fetching categories:', error);
  }
};

const setViewMode = (mode: 'list' | 'grid') => {
  viewMode.value = mode;
  localStorage.setItem('viewMode', mode);
};

const openUploadModal = () => {
  showUploadModal.value = true;
};

const resetUploadForm = () => {
  selectedFile.value = null;
  uploadForm.value = {
    description: '',
    categoryId: ''
  };
  isDragging.value = false;
};

const triggerFileInput = () => {
  fileInputRef.value?.click();
};

const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  if (file) {
    selectedFile.value = file;
  }
};

const handleFileDrop = (event: DragEvent) => {
  event.preventDefault();
  isDragging.value = false;
  
  const files = event.dataTransfer?.files;
  if (files && files.length > 0) {
    selectedFile.value = files[0];
  }
};

const handleDragOver = (event: DragEvent) => {
  event.preventDefault();
};

const handleDragEnter = (event: DragEvent) => {
  event.preventDefault();
  isDragging.value = true;
};

const handleDragLeave = (event: DragEvent) => {
  event.preventDefault();
  if (!event.currentTarget?.contains(event.relatedTarget as Node)) {
    isDragging.value = false;
  }
};

const removeSelectedFile = () => {
  selectedFile.value = null;
  if (fileInputRef.value) {
    fileInputRef.value.value = '';
  }
};

const uploadFile = async () => {
  if (!selectedFile.value) return;

  uploading.value = true;

  try {
    const formData = new FormData();
    formData.append('file', selectedFile.value);
    
    if (uploadForm.value.categoryId) {
      formData.append('categoryId', uploadForm.value.categoryId);
    }
    if (uploadForm.value.description) {
      formData.append('description', uploadForm.value.description);
    }

    await api.post('/api/files/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    toast.success('Document uploaded successfully');
    
    // Track file upload
    analytics.trackFileAction('upload', response.data.file.id, response.data.file.original_name, {
      mime_type: selectedFile.value.type,
      file_size: selectedFile.value.size,
      category: uploadForm.value.categoryId
    });
    
    showUploadModal.value = false;
    resetUploadForm();
    fetchFiles();
  } catch (error) {
    console.error('Error uploading file:', error);
    toast.error('Failed to upload document');
  } finally {
    uploading.value = false;
  }
};

const viewFile = async (file: any) => {
  selectedFileForView.value = file;
  fileContent.value = '';
  filePreviewUrl.value = '';
  
  // Track file view
  analytics.trackFileAction('view', file.id, file.original_name, {
    mime_type: file.mime_type,
    file_size: file.file_size,
    category: file.category_name
  });
  
  try {
    if (isImage(file)) {
      // Use advanced image viewer for images
      const response = await api.get(`/api/files/${file.id}/download`, {
        responseType: 'blob'
      });
      filePreviewUrl.value = window.URL.createObjectURL(new Blob([response.data]));
      showImageViewer.value = true;
    } else {
      // Use regular modal viewer for other files
      showViewer.value = true;
      
      if (isPDF(file)) {
        const response = await api.get(`/api/files/${file.id}/download`, {
          responseType: 'blob'
        });
        filePreviewUrl.value = window.URL.createObjectURL(new Blob([response.data]));
      } else if (isText(file)) {
        const response = await api.get(`/api/files/${file.id}/download`, {
          responseType: 'text'
        });
        fileContent.value = response.data;
      }
    }
  } catch (error) {
    console.error('Error loading file for preview:', error);
    toast.error('Failed to load file preview');
  }
};

const closeViewer = () => {
  showViewer.value = false;
  if (filePreviewUrl.value) {
    window.URL.revokeObjectURL(filePreviewUrl.value);
    filePreviewUrl.value = '';
  }
  fileContent.value = '';
  selectedFileForView.value = null;
};

const closeImageViewer = () => {
  showImageViewer.value = false;
  if (filePreviewUrl.value) {
    window.URL.revokeObjectURL(filePreviewUrl.value);
    filePreviewUrl.value = '';
  }
  selectedFileForView.value = null;
};

const downloadFile = async (file: any) => {
  try {
    const response = await api.get(`/api/files/${file.id}/download`, {
      responseType: 'blob'
    });
    
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', file.original_name);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
    
    toast.success('Download started');
  } catch (error) {
    console.error('Error downloading file:', error);
    toast.error('Failed to download file');
  }
};

const confirmDeleteFile = (file: any) => {
  selectedFileForDelete.value = file;
  showDeleteModal.value = true;
};

const confirmDelete = async () => {
  if (!selectedFileForDelete.value) return;

  deleting.value = true;

  try {
    await api.delete(`/api/files/${selectedFileForDelete.value.id}/delete`);
    
    toast.success('Document deleted successfully');
    showDeleteModal.value = false;
    selectedFileForDelete.value = null;
    fetchFiles();
  } catch (error) {
    console.error('Error deleting file:', error);
    toast.error('Failed to delete document');
  } finally {
    deleting.value = false;
  }
};

const handleFileSelection = (file: any, selected: boolean) => {
  if (selected) {
    selectedFiles.value.add(file.id);
  } else {
    selectedFiles.value.delete(file.id);
  }
  
  if (selectedFiles.value.size > 0 && !bulkMode.value) {
    bulkMode.value = true;
  } else if (selectedFiles.value.size === 0 && bulkMode.value) {
    bulkMode.value = false;
  }
};

const handleSwipeAction = (file: any, action: 'view' | 'delete') => {
  if (action === 'view') {
    viewFile(file);
  } else if (action === 'delete') {
    confirmDeleteFile(file);
  }
};

const clearSelection = () => {
  selectedFiles.value.clear();
  bulkMode.value = false;
};

const downloadSelected = async () => {
  for (const fileId of selectedFiles.value) {
    const file = files.value.find(f => f.id === fileId);
    if (file) {
      await downloadFile(file);
    }
  }
  clearSelection();
};

const deleteSelected = () => {
  // Show confirmation for bulk delete
  toast.warning('Bulk delete confirmation', {
    title: 'Delete Multiple Files',
    actions: [
      {
        label: 'Confirm',
        variant: 'danger',
        handler: async () => {
          for (const fileId of selectedFiles.value) {
            const file = files.value.find(f => f.id === fileId);
            if (file) {
              try {
                await api.delete(`/api/files/${file.id}/delete`);
              } catch (error) {
                console.error('Error deleting file:', error);
              }
            }
          }
          clearSelection();
          fetchFiles();
          toast.success('Selected files deleted');
        }
      }
    ],
    duration: 0
  });
};

const goToPage = (page: number) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page;
  }
};

const handleLogout = async () => {
  await authStore.logout();
  toast.success('Logged out successfully');
  router.push('/login');
};

// Utility functions
const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const getPreviewUrl = (file: any) => {
  if (isImage(file)) {
    return `/api/files/${file.id}/download`;
  }
  return null;
};

const isImage = (file: any) => {
  return file?.mime_type?.startsWith('image/');
};

const isPDF = (file: any) => {
  return file?.mime_type === 'application/pdf';
};

const isText = (file: any) => {
  const textTypes = [
    'text/plain',
    'text/csv',
    'text/html',
    'text/css',
    'text/javascript',
    'application/json',
    'application/xml'
  ];
  return textTypes.includes(file?.mime_type) || 
         file?.original_name?.endsWith('.txt') ||
         file?.original_name?.endsWith('.csv') ||
         file?.original_name?.endsWith('.json') ||
         file?.original_name?.endsWith('.xml');
};

const handlePreviewError = () => {
  toast.error('Failed to load image preview');
};

// Keyboard shortcuts
const handleKeyboardShortcuts = (event: KeyboardEvent) => {
  // Ctrl/Cmd + U for upload
  if ((event.ctrlKey || event.metaKey) && event.key === 'u') {
    event.preventDefault();
    openUploadModal();
  }
  
  // Escape to close modals
  if (event.key === 'Escape') {
    if (showUploadModal.value) showUploadModal.value = false;
    if (showViewer.value) closeViewer();
    if (showImageViewer.value) closeImageViewer();
    if (showDeleteModal.value) showDeleteModal.value = false;
    if (selectedFiles.value.size > 0) clearSelection();
  }
  
  // Ctrl/Cmd + A to select all (when in bulk mode)
  if ((event.ctrlKey || event.metaKey) && event.key === 'a' && bulkMode.value) {
    event.preventDefault();
    filteredFiles.value.forEach(file => {
      selectedFiles.value.add(file.id);
    });
  }
};

// Watch for search changes to track analytics
watch(searchTerm, (newTerm, oldTerm) => {
  if (newTerm && newTerm !== oldTerm && newTerm.length >= 3) {
    // Debounce search analytics
    setTimeout(() => {
      if (searchTerm.value === newTerm) {
        analytics.trackSearch(newTerm, filteredFiles.value.length, {
          category_filter: selectedCategory.value,
          sort_by: sortBy.value
        });
      }
    }, 1000);
  }
});

// Lifecycle
onMounted(async () => {
  // Load saved view mode
  const savedViewMode = localStorage.getItem('viewMode') as 'list' | 'grid';
  if (savedViewMode) {
    viewMode.value = savedViewMode;
  }

  // Load data
  await Promise.all([
    fetchFiles(),
    fetchCategories()
  ]);

  // Add keyboard shortcuts
  document.addEventListener('keydown', handleKeyboardShortcuts);
});

onUnmounted(() => {
  // Clean up
  document.removeEventListener('keydown', handleKeyboardShortcuts);
  
  if (filePreviewUrl.value) {
    window.URL.revokeObjectURL(filePreviewUrl.value);
  }
});
</script>