<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8">
      <div>
        <div class="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-green-100">
          <svg class="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"></path>
          </svg>
        </div>
        <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Request Account Access
        </h2>
        <p class="mt-2 text-center text-sm text-gray-600">
          Please fill out the form below to request access to the portal
        </p>
      </div>

      <div v-if="submitted" class="bg-green-50 border border-green-200 rounded-md p-4">
        <div class="flex">
          <div class="flex-shrink-0">
            <svg class="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
            </svg>
          </div>
          <div class="ml-3">
            <h3 class="text-sm font-medium text-green-800">Request submitted successfully!</h3>
            <p class="mt-1 text-sm text-green-700">
              Your account request has been submitted. An administrator will review your request and contact you.
            </p>
          </div>
        </div>
        <div class="mt-4">
          <router-link to="/login" class="text-green-600 hover:text-green-500 text-sm font-medium">
            Return to login page
          </router-link>
        </div>
      </div>

      <form v-else class="mt-8 space-y-6" @submit.prevent="handleSubmit">
        <div class="space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label for="firstName" class="block text-sm font-medium text-gray-700">First Name</label>
              <input
                id="firstName"
                name="firstName"
                type="text"
                required
                v-model="form.firstName"
                class="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
            <div>
              <label for="lastName" class="block text-sm font-medium text-gray-700">Last Name</label>
              <input
                id="lastName"
                name="lastName"
                type="text"
                required
                v-model="form.lastName"
                class="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
          </div>

          <div>
            <label for="email" class="block text-sm font-medium text-gray-700">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              required
              v-model="form.email"
              class="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>

          <div>
            <label for="phone" class="block text-sm font-medium text-gray-700">Phone Number</label>
            <input
              id="phone"
              name="phone"
              type="tel"
              v-model="form.phone"
              class="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>

          <div>
            <label for="companyName" class="block text-sm font-medium text-gray-700">Company Name</label>
            <input
              id="companyName"
              name="companyName"
              type="text"
              v-model="form.companyName"
              class="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>

          <div>
            <label for="businessType" class="block text-sm font-medium text-gray-700">Business Type</label>
            <input
              id="businessType"
              name="businessType"
              type="text"
              v-model="form.businessType"
              placeholder="e.g., Small Business, Corporation, Non-profit"
              class="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>

          <div>
            <label for="message" class="block text-sm font-medium text-gray-700">Message (Optional)</label>
            <textarea
              id="message"
              name="message"
              rows="3"
              v-model="form.message"
              placeholder="Please describe your accounting needs or any additional information"
              class="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            ></textarea>
          </div>
        </div>

        <div v-if="error" class="text-red-600 text-sm">
          {{ error }}
        </div>

        <div>
          <button
            type="submit"
            :disabled="loading"
            class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
          >
            <span v-if="loading" class="mr-2">
              <svg class="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </span>
            {{ loading ? 'Submitting...' : 'Submit Request' }}
          </button>
        </div>

        <div class="text-center">
          <router-link to="/login" class="text-blue-600 hover:text-blue-500 text-sm">
            Already have an account? Sign in
          </router-link>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import api from '@/lib/axios';

const form = ref({
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  companyName: '',
  businessType: '',
  message: ''
});

const error = ref('');
const loading = ref(false);
const submitted = ref(false);

const handleSubmit = async () => {
  error.value = '';
  loading.value = true;

  try {
    await api.post('/api/account-requests', form.value);
    submitted.value = true;
  } catch (err: any) {
    error.value = err.response?.data?.error || 'Failed to submit request';
  } finally {
    loading.value = false;
  }
};
</script>