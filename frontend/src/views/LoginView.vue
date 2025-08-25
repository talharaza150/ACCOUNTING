<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8">
      <!-- Header -->
      <header class="text-center">
        <div class="mx-auto h-16 w-16 flex items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900 mb-6">
          <Icon 
            name="check-circle" 
            size="xl" 
            class="text-blue-600 dark:text-blue-400" 
            aria-hidden="true" 
          />
        </div>
        <h1 class="text-3xl font-extrabold text-gray-900 dark:text-gray-100 mb-2">
          Raza Accounting Portal
        </h1>
        <p class="text-sm text-gray-600 dark:text-gray-400">
          Sign in to your account
        </p>
      </header>

      <!-- Login Form -->
      <form 
        class="mt-8 space-y-6" 
        @submit.prevent="submitForm"
        novalidate
        role="form"
        aria-label="Login form"
      >
        <div class="space-y-4">
          <!-- Username Field -->
          <BaseInput
            v-model="values.username"
            label="Username"
            type="text"
            placeholder="Enter your username"
            required
            autocomplete="username"
            leading-icon="user"
            :error-message="fields.username.error"
            @blur="setFieldTouched('username')"
          />

          <!-- Password Field -->
          <BaseInput
            v-model="values.password"
            label="Password"
            type="password"
            placeholder="Enter your password"
            required
            autocomplete="current-password"
            leading-icon="lock-closed"
            :error-message="fields.password.error"
            @blur="setFieldTouched('password')"
          />
        </div>

        <!-- Error Alert -->
        <div 
          v-if="authError" 
          class="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md"
          role="alert"
          aria-live="polite"
        >
          <div class="flex items-center">
            <Icon name="x-circle" class="text-red-500 mr-2" size="sm" aria-hidden="true" />
            <span class="text-sm text-red-700 dark:text-red-400">{{ authError }}</span>
          </div>
        </div>

        <!-- Submit Button -->
        <BaseButton
          type="submit"
          variant="primary"
          size="lg"
          full-width
          :loading="isSubmitting"
          :disabled="!isValid || isSubmitting"
          aria-describedby="login-button-help"
        >
          {{ isSubmitting ? 'Signing in...' : 'Sign in' }}
        </BaseButton>

        <div id="login-button-help" class="sr-only">
          Click to sign in to your account
        </div>

        <!-- Request Account Link -->
        <div class="text-center">
          <router-link 
            to="/request-account" 
            class="text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 text-sm font-medium transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 rounded px-1 py-1"
          >
            Don't have an account? Request access
          </router-link>
        </div>
      </form>

      <!-- Keyboard shortcuts info -->
      <div class="text-center text-xs text-gray-500 dark:text-gray-400 mt-4">
        Press Tab to navigate • Enter to submit
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { useFormValidation } from '@/composables/useFormValidation';
import { useToast } from '@/composables/useToast';
import BaseInput from '@/components/ui/BaseInput.vue';
import BaseButton from '@/components/ui/BaseButton.vue';
import Icon from '@/components/ui/Icon.vue';

const router = useRouter();
const authStore = useAuthStore();
const { toast } = useToast();
const authError = ref('');

// Form validation
const formValidation = useFormValidation(
  {
    username: '',
    password: ''
  },
  {
    username: {
      required: true,
      rules: [
        {
          test: (value) => value && value.length >= 3,
          message: 'Username must be at least 3 characters long'
        }
      ],
      validateOnBlur: true
    },
    password: {
      required: true,
      rules: [
        {
          test: (value) => value && value.length >= 6,
          message: 'Password must be at least 6 characters long'
        }
      ],
      validateOnBlur: true
    }
  }
);

const {
  values,
  fields,
  isValid,
  isSubmitting,
  setFieldTouched,
  handleSubmit
} = formValidation;

const performLogin = async () => {
  authError.value = '';
  
  try {
    const result = await authStore.login(values.username, values.password);

    if (result.success) {
      toast.success('Login successful!', {
        title: 'Welcome back',
        duration: 3000
      });
      
      console.log('Login successful, user role:', authStore.user?.role);
      
      if (authStore.isAdmin) {
        console.log('Redirecting to admin dashboard');
        await router.push('/admin');
      } else {
        console.log('Redirecting to client dashboard');
        await router.push('/dashboard');
      }
    } else {
      authError.value = result.error || 'Invalid username or password';
      toast.error('Login failed', {
        title: 'Authentication Error',
        duration: 5000
      });
    }
  } catch (err) {
    authError.value = 'Login failed - please try again';
    toast.error('Something went wrong. Please try again.', {
      title: 'Connection Error',
      duration: 5000
    });
    console.error('Login error:', err);
  }
};

// Handle form submission with validation
const submitForm = () => {
  handleSubmit(performLogin);
};

// Focus management
onMounted(() => {
  // Focus the first input field on load
  const firstInput = document.querySelector('input[type="text"]') as HTMLInputElement;
  if (firstInput) {
    setTimeout(() => firstInput.focus(), 100);
  }
});
</script>