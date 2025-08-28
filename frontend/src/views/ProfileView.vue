<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900 dark:text-gray-100">Profile</h1>
        <p class="mt-2 text-gray-600 dark:text-gray-400">
          Manage your account information and preferences
        </p>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Profile Picture Section -->
        <div class="lg:col-span-1">
          <div class="bg-white dark:bg-gray-800 shadow-sm rounded-lg p-6">
            <h2 class="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
              Profile Picture
            </h2>
            
            <div class="flex flex-col items-center">
              <div class="w-32 h-32 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
                <span class="text-4xl font-semibold text-gray-600 dark:text-gray-400">
                  {{ userInitials }}
                </span>
              </div>
              
              <BaseButton
                variant="secondary"
                size="sm"
                @click="handleAvatarUpload"
                class="mb-2"
              >
                <Icon name="camera" size="sm" class="mr-2" />
                Change Photo
              </BaseButton>
              
              <p class="text-xs text-gray-500 dark:text-gray-400 text-center">
                JPG, GIF or PNG. Max size of 2MB
              </p>
            </div>
          </div>
        </div>

        <!-- Profile Information -->
        <div class="lg:col-span-2">
          <div class="bg-white dark:bg-gray-800 shadow-sm rounded-lg">
            <div class="p-6">
              <h2 class="text-lg font-medium text-gray-900 dark:text-gray-100 mb-6">
                Personal Information
              </h2>

              <form @submit.prevent="handleProfileUpdate" class="space-y-6">
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <!-- First Name -->
                  <BaseInput
                    v-model="profileForm.firstName"
                    label="First Name"
                    type="text"
                    required
                    :error-message="formErrors.firstName"
                  />

                  <!-- Last Name -->
                  <BaseInput
                    v-model="profileForm.lastName"
                    label="Last Name"
                    type="text"
                    required
                    :error-message="formErrors.lastName"
                  />
                </div>

                <!-- Email -->
                <BaseInput
                  v-model="profileForm.email"
                  label="Email Address"
                  type="email"
                  required
                  :error-message="formErrors.email"
                />

                <!-- Phone -->
                <BaseInput
                  v-model="profileForm.phone"
                  label="Phone Number"
                  type="tel"
                  :error-message="formErrors.phone"
                />

                <!-- Company (for clients) -->
                <BaseInput
                  v-if="authStore.isClient"
                  v-model="profileForm.companyName"
                  label="Company Name"
                  type="text"
                  :error-message="formErrors.companyName"
                />

                <!-- Save Button -->
                <div class="flex justify-end">
                  <BaseButton
                    type="submit"
                    variant="primary"
                    :loading="isUpdating"
                    :disabled="!hasProfileChanges"
                  >
                    <Icon name="check" size="sm" class="mr-2" />
                    Save Changes
                  </BaseButton>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      <!-- Security Section -->
      <div class="mt-8 bg-white dark:bg-gray-800 shadow-sm rounded-lg">
        <div class="p-6">
          <h2 class="text-lg font-medium text-gray-900 dark:text-gray-100 mb-6">
            Security
          </h2>

          <!-- Change Password -->
          <div class="border-b border-gray-200 dark:border-gray-700 pb-6">
            <h3 class="text-base font-medium text-gray-900 dark:text-gray-100 mb-4">
              Change Password
            </h3>
            
            <form @submit.prevent="handlePasswordChange" class="space-y-4">
              <BaseInput
                v-model="passwordForm.currentPassword"
                label="Current Password"
                type="password"
                required
                :error-message="passwordErrors.currentPassword"
              />

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <BaseInput
                  v-model="passwordForm.newPassword"
                  label="New Password"
                  type="password"
                  required
                  :error-message="passwordErrors.newPassword"
                />

                <BaseInput
                  v-model="passwordForm.confirmPassword"
                  label="Confirm New Password"
                  type="password"
                  required
                  :error-message="passwordErrors.confirmPassword"
                />
              </div>

              <div class="flex justify-end">
                <BaseButton
                  type="submit"
                  variant="primary"
                  :loading="isChangingPassword"
                  :disabled="!hasPasswordChanges"
                >
                  <Icon name="lock-closed" size="sm" class="mr-2" />
                  Update Password
                </BaseButton>
              </div>
            </form>
          </div>

          <!-- Account Information -->
          <div class="pt-6">
            <h3 class="text-base font-medium text-gray-900 dark:text-gray-100 mb-4">
              Account Information
            </h3>
            
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm">
              <div>
                <dt class="text-gray-500 dark:text-gray-400">Username</dt>
                <dd class="mt-1 text-gray-900 dark:text-gray-100">{{ user?.username }}</dd>
              </div>
              
              <div>
                <dt class="text-gray-500 dark:text-gray-400">Account Type</dt>
                <dd class="mt-1">
                  <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                        :class="user?.role === 'admin' 
                          ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400'
                          : 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'">
                    {{ user?.role === 'admin' ? 'Administrator' : 'Client' }}
                  </span>
                </dd>
              </div>
              
              <div>
                <dt class="text-gray-500 dark:text-gray-400">Member Since</dt>
                <dd class="mt-1 text-gray-900 dark:text-gray-100">
                  {{ formatDate(user?.created_at) }}
                </dd>
              </div>
              
              <div>
                <dt class="text-gray-500 dark:text-gray-400">Last Login</dt>
                <dd class="mt-1 text-gray-900 dark:text-gray-100">
                  {{ user?.last_login ? formatDate(user.last_login) : 'Never' }}
                </dd>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { useToast } from '@/composables/useToast';
import BaseInput from '@/components/ui/BaseInput.vue';
import BaseButton from '@/components/ui/BaseButton.vue';
import Icon from '@/components/ui/Icon.vue';
import api from '@/lib/axios';

const authStore = useAuthStore();
const { toast } = useToast();

// State
const isUpdating = ref(false);
const isChangingPassword = ref(false);

// Profile form
const profileForm = ref({
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  companyName: ''
});

const originalProfileForm = ref({
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  companyName: ''
});

const formErrors = ref({
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  companyName: ''
});

// Password form
const passwordForm = ref({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
});

const passwordErrors = ref({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
});

// Computed
const user = computed(() => authStore.user);

const userInitials = computed(() => {
  if (!user.value) return '';
  return `${user.value.first_name?.[0] || ''}${user.value.last_name?.[0] || ''}`.toUpperCase();
});

const hasProfileChanges = computed(() => {
  return JSON.stringify(profileForm.value) !== JSON.stringify(originalProfileForm.value);
});

const hasPasswordChanges = computed(() => {
  return passwordForm.value.currentPassword || passwordForm.value.newPassword || passwordForm.value.confirmPassword;
});

// Methods
const loadProfileData = () => {
  if (user.value) {
    profileForm.value = {
      firstName: user.value.first_name || '',
      lastName: user.value.last_name || '',
      email: user.value.email || '',
      phone: user.value.phone || '',
      companyName: user.value.company_name || ''
    };
    
    originalProfileForm.value = { ...profileForm.value };
  }
};

const handleProfileUpdate = async () => {
  try {
    isUpdating.value = true;
    formErrors.value = {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      companyName: ''
    };

    // Validation
    if (!profileForm.value.firstName.trim()) {
      formErrors.value.firstName = 'First name is required';
      return;
    }
    if (!profileForm.value.lastName.trim()) {
      formErrors.value.lastName = 'Last name is required';
      return;
    }
    if (!profileForm.value.email.trim()) {
      formErrors.value.email = 'Email is required';
      return;
    }

    const response = await api.put('/api/profile', {
      first_name: profileForm.value.firstName,
      last_name: profileForm.value.lastName,
      email: profileForm.value.email,
      phone: profileForm.value.phone || null,
      company_name: authStore.isClient ? profileForm.value.companyName : null
    });

    // Update auth store
    authStore.user = response.data.user;
    originalProfileForm.value = { ...profileForm.value };

    toast.success('Profile updated successfully', {
      title: 'Success',
      duration: 3000
    });

  } catch (error: any) {
    toast.error(error.response?.data?.error || 'Failed to update profile', {
      title: 'Update Failed',
      duration: 5000
    });
  } finally {
    isUpdating.value = false;
  }
};

const handlePasswordChange = async () => {
  try {
    isChangingPassword.value = true;
    passwordErrors.value = {
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    };

    // Validation
    if (!passwordForm.value.currentPassword) {
      passwordErrors.value.currentPassword = 'Current password is required';
      return;
    }
    if (!passwordForm.value.newPassword) {
      passwordErrors.value.newPassword = 'New password is required';
      return;
    }
    if (passwordForm.value.newPassword.length < 6) {
      passwordErrors.value.newPassword = 'Password must be at least 6 characters';
      return;
    }
    if (passwordForm.value.newPassword !== passwordForm.value.confirmPassword) {
      passwordErrors.value.confirmPassword = 'Passwords do not match';
      return;
    }

    await api.put('/api/auth/change-password', {
      currentPassword: passwordForm.value.currentPassword,
      newPassword: passwordForm.value.newPassword
    });

    // Clear form
    passwordForm.value = {
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    };

    toast.success('Password updated successfully', {
      title: 'Success',
      duration: 3000
    });

  } catch (error: any) {
    const errorMessage = error.response?.data?.error || 'Failed to change password';
    if (errorMessage.includes('current password')) {
      passwordErrors.value.currentPassword = 'Current password is incorrect';
    } else {
      toast.error(errorMessage, {
        title: 'Password Change Failed',
        duration: 5000
      });
    }
  } finally {
    isChangingPassword.value = false;
  }
};

const handleAvatarUpload = () => {
  toast.info('Avatar upload feature coming soon!', {
    title: 'Feature Coming Soon',
    duration: 3000
  });
};

const formatDate = (dateString?: string) => {
  if (!dateString) return '';
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

// Lifecycle
onMounted(() => {
  loadProfileData();
});
</script>