<script setup lang="ts">
import { RouterView } from 'vue-router';
import { onMounted, ref } from 'vue';
import Toast from './components/ui/Toast.vue';
import { useToast } from './composables/useToast';

const toastRef = ref();
const { setToastRef } = useToast();

// Setup toast system
onMounted(() => {
  if (toastRef.value) {
    setToastRef(toastRef.value);
  }
});
</script>

<template>
  <div id="app" class="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
    <!-- Main app content -->
    <RouterView />
    
    <!-- Global toast notifications -->
    <Toast ref="toastRef" />
  </div>
</template>

<style scoped>
/* App-specific styles are handled in main.css */
</style>
