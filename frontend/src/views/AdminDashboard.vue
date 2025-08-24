<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Navigation -->
    <nav class="bg-white shadow">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <div class="flex items-center">
            <h1 class="text-xl font-semibold text-gray-900">
              Raza Accounting Portal - Admin
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

    <!-- Tab Navigation -->
    <div class="bg-white border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav class="-mb-px flex space-x-8">
          <button
            v-for="tab in tabs"
            :key="tab.id"
            @click="activeTab = tab.id"
            :class="[
              'py-4 px-1 border-b-2 font-medium text-sm',
              activeTab === tab.id
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            ]"
          >
            {{ tab.name }}
          </button>
        </nav>
      </div>
    </div>

    <!-- Tab Content -->
    <div class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <!-- Account Requests Tab -->
      <div v-if="activeTab === 'requests'" class="px-4 py-6 sm:px-0">
        <div class="bg-white shadow rounded-lg">
          <div class="px-6 py-4 border-b border-gray-200">
            <h3 class="text-lg font-medium text-gray-900">Account Requests</h3>
          </div>
          <div class="p-6">
            <div v-if="loadingRequests" class="text-center py-4">
              <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
            <div v-else-if="accountRequests.length === 0" class="text-center py-8 text-gray-500">
              No pending requests
            </div>
            <div v-else class="space-y-4">
              <div
                v-for="request in accountRequests"
                :key="request.id"
                class="border border-gray-200 rounded-lg p-4"
              >
                <div class="flex justify-between items-start">
                  <div class="flex-1">
                    <h4 class="text-lg font-medium text-gray-900">
                      {{ request.first_name }} {{ request.last_name }}
                    </h4>
                    <div class="mt-1 space-y-1">
                      <p class="text-sm text-gray-600">{{ request.email }}</p>
                      <p v-if="request.phone" class="text-sm text-gray-600">{{ request.phone }}</p>
                      <p v-if="request.company_name" class="text-sm text-gray-600">Company: {{ request.company_name }}</p>
                      <p v-if="request.business_type" class="text-sm text-gray-600">Type: {{ request.business_type }}</p>
                    </div>
                    <div v-if="request.message" class="mt-2">
                      <p class="text-sm text-gray-700">{{ request.message }}</p>
                    </div>
                    <p class="text-xs text-gray-400 mt-2">
                      Submitted {{ formatDate(request.created_at) }}
                    </p>
                  </div>
                  <div v-if="request.status === 'pending'" class="flex space-x-2 ml-4">
                    <button
                      @click="approveRequest(request)"
                      class="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm"
                    >
                      Approve
                    </button>
                    <button
                      @click="rejectRequest(request)"
                      class="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm"
                    >
                      Reject
                    </button>
                  </div>
                  <div v-else class="ml-4">
                    <span :class="[
                      'px-2 py-1 text-xs font-medium rounded',
                      request.status === 'approved' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    ]">
                      {{ request.status }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Users Tab -->
      <div v-if="activeTab === 'users'" class="px-4 py-6 sm:px-0">
        <div class="bg-white shadow rounded-lg">
          <div class="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h3 class="text-lg font-medium text-gray-900">Users</h3>
            <button
              @click="showCreateUser = true"
              class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm"
            >
              Create User
            </button>
          </div>
          <div class="p-6">
            <div v-if="loadingUsers" class="text-center py-4">
              <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
            <div v-else class="overflow-x-auto">
              <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
                  <tr>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Company</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                  </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                  <tr v-for="user in users" :key="user.id">
                    <td class="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div class="text-sm font-medium text-gray-900">{{ user.first_name }} {{ user.last_name }}</div>
                        <div class="text-sm text-gray-500">{{ user.email }}</div>
                      </div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <span :class="[
                        'px-2 py-1 text-xs font-medium rounded',
                        user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                      ]">
                        {{ user.role }}
                      </span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {{ user.company_name || '-' }}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <span :class="[
                        'px-2 py-1 text-xs font-medium rounded',
                        user.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      ]">
                        {{ user.is_active ? 'Active' : 'Inactive' }}
                      </span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {{ formatDate(user.created_at) }}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <!-- Files Tab -->
      <div v-if="activeTab === 'files'" class="px-4 py-6 sm:px-0">
        <div class="bg-white shadow rounded-lg">
          <div class="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h3 class="text-lg font-medium text-gray-900">Files</h3>
            <button
              @click="showUploadFile = true"
              class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm"
            >
              Upload File
            </button>
          </div>
          <div class="p-6">
            <div v-if="loadingFiles" class="text-center py-4">
              <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
            <div v-else class="space-y-4">
              <div
                v-for="file in files"
                :key="file.id"
                class="border border-gray-200 rounded-lg p-4"
              >
                <div class="flex justify-between items-start">
                  <div class="flex-1">
                    <h4 class="text-sm font-medium text-gray-900">{{ file.original_name }}</h4>
                    <div class="mt-1 space-y-1">
                      <p class="text-sm text-gray-600">{{ file.category_name || 'Uncategorized' }}</p>
                      <p class="text-sm text-gray-600">Assigned to: {{ file.assigned_to_username }}</p>
                      <p class="text-sm text-gray-600">Size: {{ formatFileSize(file.file_size) }}</p>
                    </div>
                    <p class="text-xs text-gray-400 mt-2">
                      Uploaded {{ formatDate(file.created_at) }}
                    </p>
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
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Create User Modal -->
    <div v-if="showCreateUser" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div class="mt-3">
          <h3 class="text-lg font-medium text-gray-900 mb-4">Create New User</h3>
          <form @submit.prevent="createUser">
            <div class="space-y-4">
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700">First Name</label>
                  <input
                    v-model="newUser.firstName"
                    type="text"
                    required
                    class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700">Last Name</label>
                  <input
                    v-model="newUser.lastName"
                    type="text"
                    required
                    class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700">Username</label>
                <input
                  v-model="newUser.username"
                  type="text"
                  required
                  class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700">Email</label>
                <input
                  v-model="newUser.email"
                  type="email"
                  required
                  class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700">Password</label>
                <input
                  v-model="newUser.password"
                  type="password"
                  required
                  class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700">Role</label>
                <select
                  v-model="newUser.role"
                  required
                  class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="client">Client</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700">Company Name</label>
                <input
                  v-model="newUser.companyName"
                  type="text"
                  class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div class="flex justify-end space-x-2 mt-6">
              <button
                type="button"
                @click="showCreateUser = false"
                class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                class="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700"
              >
                Create User
              </button>
            </div>
          </form>
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
          <h3 class="text-lg font-medium text-gray-900 mb-4">Upload File</h3>
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
                <label class="block text-sm font-medium text-gray-700">Assign to User</label>
                <select
                  v-model="uploadForm.assignedTo"
                  required
                  class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select a user...</option>
                  <option v-for="user in users" :key="user.id" :value="user.id">
                    {{ user.first_name }} {{ user.last_name }} ({{ user.username }})
                  </option>
                </select>
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
                  placeholder="Optional description of the file..."
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
                {{ uploading ? 'Uploading...' : 'Upload File' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Approve Request Modal -->
    <div v-if="showApproveModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div class="mt-3">
          <h3 class="text-lg font-medium text-gray-900 mb-4">Approve Account Request</h3>
          <form @submit.prevent="confirmApprove">
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700">Username</label>
                <input
                  v-model="approveForm.username"
                  type="text"
                  required
                  class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700">Password</label>
                <input
                  v-model="approveForm.password"
                  type="password"
                  required
                  class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div class="flex justify-end space-x-2 mt-6">
              <button
                type="button"
                @click="showApproveModal = false"
                class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                class="px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700"
              >
                Approve & Create Account
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import api from '@/lib/axios';

const router = useRouter();
const authStore = useAuthStore();

const activeTab = ref('requests');
const tabs = [
  { id: 'requests', name: 'Account Requests' },
  { id: 'users', name: 'Users' },
  { id: 'files', name: 'Files' }
];

// Data
const accountRequests = ref<any[]>([]);
const users = ref<any[]>([]);
const files = ref<any[]>([]);
const categories = ref<any[]>([]);

// Loading states
const loadingRequests = ref(true);
const loadingUsers = ref(true);
const loadingFiles = ref(true);

// Modals
const showCreateUser = ref(false);
const showApproveModal = ref(false);
const showUploadFile = ref(false);

// Upload states
const uploading = ref(false);
const fileInput = ref<HTMLInputElement>();

// File viewer functionality
const showViewer = ref(false);
const selectedFile = ref<any>(null);
const fileContent = ref('');
const filePreviewUrl = ref('');

// Forms
const newUser = ref({
  firstName: '',
  lastName: '',
  username: '',
  email: '',
  password: '',
  role: 'client',
  companyName: ''
});

const approveForm = ref({
  username: '',
  password: ''
});

const uploadForm = ref({
  assignedTo: '',
  categoryId: '',
  description: ''
});

const selectedRequest = ref<any>(null);

// Methods
const fetchAccountRequests = async () => {
  try {
    const response = await api.get('/api/admin/account-requests');
    accountRequests.value = response.data;
  } catch (error) {
    console.error('Error fetching account requests:', error);
  } finally {
    loadingRequests.value = false;
  }
};

const fetchUsers = async () => {
  try {
    const response = await api.get('/api/admin/users');
    users.value = response.data;
  } catch (error) {
    console.error('Error fetching users:', error);
  } finally {
    loadingUsers.value = false;
  }
};

const fetchFiles = async () => {
  try {
    const response = await api.get('/api/files');
    files.value = response.data;
  } catch (error) {
    console.error('Error fetching files:', error);
  } finally {
    loadingFiles.value = false;
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
    formData.append('assignedTo', uploadForm.value.assignedTo);
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
      assignedTo: '',
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

const approveRequest = (request: any) => {
  selectedRequest.value = request;
  approveForm.value.username = `${request.first_name.toLowerCase()}_${request.last_name.toLowerCase()}`;
  approveForm.value.password = '';
  showApproveModal.value = true;
};

const confirmApprove = async () => {
  try {
    await api.put(`/api/admin/account-requests/${selectedRequest.value!.id}/approve`, approveForm.value);
    showApproveModal.value = false;
    fetchAccountRequests();
    fetchUsers();
  } catch (error) {
    console.error('Error approving request:', error);
  }
};

const rejectRequest = async (request: any) => {
  if (confirm('Are you sure you want to reject this request?')) {
    try {
      await api.put(`/api/admin/account-requests/${request.id}/reject`);
      fetchAccountRequests();
    } catch (error) {
      console.error('Error rejecting request:', error);
    }
  }
};

const createUser = async () => {
  try {
    await api.post('/api/admin/users', newUser.value);
    showCreateUser.value = false;
    fetchUsers();
    // Reset form
    newUser.value = {
      firstName: '',
      lastName: '',
      username: '',
      email: '',
      password: '',
      role: 'client',
      companyName: ''
    };
  } catch (error) {
    console.error('Error creating user:', error);
  }
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString();
};

const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
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

const handleLogout = async () => {
  await authStore.logout();
  router.push('/login');
};

onMounted(() => {
  fetchAccountRequests();
  fetchUsers();
  fetchFiles();
  fetchCategories();
});
</script>