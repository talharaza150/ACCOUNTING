<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Navigation -->
    <nav class="bg-white shadow">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <div class="flex items-center">
            <h1 class="text-xl font-semibold text-gray-900">
              Raza Accounting Portal
            </h1>
          </div>
          <div class="flex items-center space-x-4">
            <span class="text-gray-700">Welcome, {{ authStore.fullName }}</span>
            <button
              @click="handleLogout"
              class="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-md text-sm font-medium"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>

    <!-- Main Content -->
    <div class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div class="px-4 py-6 sm:px-0">
        <!-- Stats Cards -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div class="bg-white overflow-hidden shadow rounded-lg">
            <div class="p-5">
              <div class="flex items-center">
                <div class="flex-shrink-0">
                  <svg class="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                  </svg>
                </div>
                <div class="ml-5 w-0 flex-1">
                  <dl>
                    <dt class="text-sm font-medium text-gray-500 truncate">Total Files</dt>
                    <dd class="text-lg font-medium text-gray-900">{{ files.length }}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div class="bg-white overflow-hidden shadow rounded-lg">
            <div class="p-5">
              <div class="flex items-center">
                <div class="flex-shrink-0">
                  <svg class="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                </div>
                <div class="ml-5 w-0 flex-1">
                  <dl>
                    <dt class="text-sm font-medium text-gray-500 truncate">Recent Files</dt>
                    <dd class="text-lg font-medium text-gray-900">{{ recentFiles.length }}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div class="bg-white overflow-hidden shadow rounded-lg">
            <div class="p-5">
              <div class="flex items-center">
                <div class="flex-shrink-0">
                  <svg class="h-6 w-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
                  </svg>
                </div>
                <div class="ml-5 w-0 flex-1">
                  <dl>
                    <dt class="text-sm font-medium text-gray-500 truncate">Categories</dt>
                    <dd class="text-lg font-medium text-gray-900">{{ uniqueCategories.length }}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Search and Filter -->
        <div class="bg-white shadow rounded-lg mb-8">
          <div class="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h3 class="text-lg font-medium text-gray-900">My Documents</h3>
            <button
              @click="showUploadFile = true"
              class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm"
            >
              Upload Document
            </button>
          </div>
          <div class="p-6">
            <div class="flex flex-col sm:flex-row gap-4 mb-6">
              <div class="flex-1">
                <input
                  v-model="searchTerm"
                  type="text"
                  placeholder="Search files..."
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div class="sm:w-48">
                <select
                  v-model="selectedCategory"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Categories</option>
                  <option v-for="category in uniqueCategories" :key="category" :value="category">
                    {{ category }}
                  </option>
                </select>
              </div>
            </div>

            <!-- Files List -->
            <div v-if="loading" class="text-center py-4">
              <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>

            <div v-else-if="filteredFiles.length === 0" class="text-center py-8 text-gray-500">
              No files found
            </div>

            <div v-else class="grid grid-cols-1 gap-4">
              <div
                v-for="file in filteredFiles"
                :key="file.id"
                class="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors"
              >
                <div class="flex items-center justify-between">
                  <div class="flex items-center space-x-3">
                    <div class="flex-shrink-0">
                      <svg class="h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                      </svg>
                    </div>
                    <div>
                      <h4 class="text-sm font-medium text-gray-900">{{ file.original_name }}</h4>
                      <p class="text-sm text-gray-500">
                        {{ file.category_name || 'Uncategorized' }} • {{ formatFileSize(file.file_size) }}
                      </p>
                      <p class="text-xs text-gray-400">
                        Uploaded {{ formatDate(file.created_at) }}
                      </p>
                    </div>
                  </div>
                  <div class="flex items-center space-x-2">
                    <button
                      @click="viewFile(file)"
                      class="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm"
                    >
                      View
                    </button>
                    <button
                      @click="downloadFile(file)"
                      class="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm"
                    >
                      Download
                    </button>
                  </div>
                </div>
                <div v-if="file.description" class="mt-2 text-sm text-gray-600">
                  {{ file.description }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- File Viewer Modal -->
    <div v-if="showViewer" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div class="relative top-10 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-md bg-white">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-lg font-medium text-gray-900">{{ selectedFile?.original_name }}</h3>
          <button @click="showViewer = false" class="text-gray-400 hover:text-gray-600">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
        <div class="max-h-96 overflow-auto">
          <!-- Image files -->
          <div v-if="isImage(selectedFile)" class="text-center">
            <img :src="filePreviewUrl" alt="File preview" class="max-w-full max-h-80 mx-auto" />
          </div>
          
          <!-- PDF files -->
          <div v-else-if="isPDF(selectedFile)" class="text-center">
            <iframe :src="filePreviewUrl" class="w-full h-80 border"></iframe>
          </div>
          
          <!-- Text files -->
          <div v-else-if="isText(selectedFile)" class="bg-gray-100 p-4 rounded font-mono text-sm">
            <pre v-if="fileContent" class="whitespace-pre-wrap">{{ fileContent }}</pre>
            <div v-else class="text-center text-gray-500">Loading file content...</div>
          </div>
          
          <!-- Other files -->
          <div v-else class="text-center p-8">
            <svg class="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
            </svg>
            <p class="text-gray-600">Preview not available for this file type</p>
            <p class="text-sm text-gray-500 mt-2">{{ selectedFile?.mime_type }}</p>
          </div>
        </div>
        <div class="flex justify-end mt-4 space-x-2">
          <button
            @click="downloadFile(selectedFile)"
            class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm"
          >
            Download
          </button>
          <button
            @click="showViewer = false"
            class="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded text-sm"
          >
            Close
          </button>
        </div>
      </div>
    </div>

    <!-- Upload File Modal -->
    <div v-if="showUploadFile" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div class="mt-3">
          <h3 class="text-lg font-medium text-gray-900 mb-4">Upload Document</h3>
          <form @submit.prevent="uploadFile">
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700">File</label>
                <input
                  type="file"
                  ref="fileInput"
                  required
                  class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700">Category</label>
                <select
                  v-model="uploadForm.categoryId"
                  class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select a category (optional)...</option>
                  <option v-for="category in categories" :key="category.id" :value="category.id">
                    {{ category.name }}
                  </option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700">Description (Optional)</label>
                <textarea
                  v-model="uploadForm.description"
                  rows="3"
                  class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Optional description of the document..."
                ></textarea>
              </div>
            </div>
            <div class="flex justify-end space-x-2 mt-6">
              <button
                type="button"
                @click="showUploadFile = false"
                class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                :disabled="uploading"
                class="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {{ uploading ? 'Uploading...' : 'Upload Document' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import api from '@/lib/axios';

const router = useRouter();
const authStore = useAuthStore();

const files = ref<any[]>([]);
const categories = ref<any[]>([]);
const loading = ref(true);
const searchTerm = ref('');
const selectedCategory = ref('');

// Upload functionality
const showUploadFile = ref(false);
const uploading = ref(false);
const fileInput = ref<HTMLInputElement>();

const uploadForm = ref({
  categoryId: '',
  description: ''
});

// File viewer functionality
const showViewer = ref(false);
const selectedFile = ref<any>(null);
const fileContent = ref('');
const filePreviewUrl = ref('');

const recentFiles = computed(() => {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  return files.value.filter(file => new Date(file.created_at) > thirtyDaysAgo);
});

const uniqueCategories = computed(() => {
  const categories = files.value
    .map(file => file.category_name)
    .filter(Boolean);
  return [...new Set(categories)];
});

const filteredFiles = computed(() => {
  return files.value.filter(file => {
    const matchesSearch = file.original_name.toLowerCase().includes(searchTerm.value.toLowerCase()) ||
                         (file.description && file.description.toLowerCase().includes(searchTerm.value.toLowerCase()));
    const matchesCategory = !selectedCategory.value || file.category_name === selectedCategory.value;
    return matchesSearch && matchesCategory;
  });
});

const fetchFiles = async () => {
  try {
    const response = await api.get('/api/files');
    files.value = response.data;
  } catch (error) {
    console.error('Error fetching files:', error);
  } finally {
    loading.value = false;
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

const uploadFile = async () => {
  if (!fileInput.value?.files?.length) return;
  
  uploading.value = true;
  
  try {
    const formData = new FormData();
    formData.append('file', fileInput.value.files[0]);
    
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

    showUploadFile.value = false;
    fetchFiles();
    
    // Reset form
    uploadForm.value = {
      categoryId: '',
      description: ''
    };
    
    if (fileInput.value) {
      fileInput.value.value = '';
    }
    
  } catch (error) {
    console.error('Error uploading file:', error);
    alert('Error uploading file. Please try again.');
  } finally {
    uploading.value = false;
  }
};

const viewFile = async (file: any) => {
  selectedFile.value = file;
  fileContent.value = '';
  filePreviewUrl.value = '';
  
  showViewer.value = true;
  
  try {
    if (isImage(file) || isPDF(file)) {
      // For images and PDFs, we can create a blob URL for preview
      const response = await api.get(`/api/files/${file.id}/download`, {
        responseType: 'blob'
      });
      filePreviewUrl.value = window.URL.createObjectURL(new Blob([response.data]));
    } else if (isText(file)) {
      // For text files, load content as text
      const response = await api.get(`/api/files/${file.id}/download`, {
        responseType: 'text'
      });
      fileContent.value = response.data;
    }
  } catch (error) {
    console.error('Error loading file for preview:', error);
  }
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
  } catch (error) {
    console.error('Error downloading file:', error);
  }
};

const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString();
};

const handleLogout = async () => {
  await authStore.logout();
  router.push('/login');
};

onMounted(() => {
  fetchFiles();
  fetchCategories();
});
</script>