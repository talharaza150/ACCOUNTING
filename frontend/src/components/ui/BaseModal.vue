<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition-all duration-300 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition-all duration-200 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="modelValue"
        ref="modalBackdrop"
        class="fixed inset-0 z-50 overflow-y-auto"
        role="dialog"
        :aria-modal="true"
        :aria-labelledby="titleId"
        :aria-describedby="descriptionId"
        @click="handleBackdropClick"
        @keydown="handleKeydown"
      >
        <!-- Backdrop -->
        <div class="fixed inset-0 bg-black/50 backdrop-blur-sm" aria-hidden="true"></div>
        
        <!-- Modal container -->
        <div class="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
          <Transition
            enter-active-class="transition-all duration-300 ease-out"
            enter-from-class="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            enter-to-class="opacity-100 translate-y-0 sm:scale-100"
            leave-active-class="transition-all duration-200 ease-in"
            leave-from-class="opacity-100 translate-y-0 sm:scale-100"
            leave-to-class="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
          >
            <div
              v-if="modelValue"
              ref="modalPanel"
              :class="modalClasses"
              @click.stop
            >
              <!-- Header -->
              <div v-if="$slots.header || title || closable" class="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                <div class="flex-1">
                  <slot name="header">
                    <h3 v-if="title" :id="titleId" class="text-lg font-semibold text-gray-900 dark:text-gray-100">
                      {{ title }}
                    </h3>
                  </slot>
                </div>
                
                <BaseButton
                  v-if="closable"
                  ref="closeButton"
                  variant="ghost"
                  size="sm"
                  icon="x-mark"
                  icon-only
                  aria-label="Close modal"
                  @click="close"
                />
              </div>
              
              <!-- Body -->
              <div :class="bodyClasses">
                <div v-if="description" :id="descriptionId" class="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  {{ description }}
                </div>
                <slot></slot>
              </div>
              
              <!-- Footer -->
              <div v-if="$slots.footer" :class="footerClasses">
                <slot name="footer"></slot>
              </div>
            </div>
          </Transition>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick, onMounted } from 'vue';
import { useFocusTrap } from '@/composables/useFocusTrap';
import BaseButton from './BaseButton.vue';

interface Props {
  modelValue: boolean;
  title?: string;
  description?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  closable?: boolean;
  closeOnBackdrop?: boolean;
  closeOnEscape?: boolean;
  persistent?: boolean;
  fullscreen?: boolean;
  centered?: boolean;
  scrollable?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  size: 'md',
  closable: true,
  closeOnBackdrop: true,
  closeOnEscape: true,
  persistent: false,
  fullscreen: false,
  centered: true,
  scrollable: false
});

const emit = defineEmits<{
  'update:modelValue': [value: boolean];
  'close': [];
  'open': [];
}>();

const modalBackdrop = ref<HTMLElement>();
const modalPanel = ref<HTMLElement>();
const closeButton = ref<InstanceType<typeof BaseButton>>();

// Generate unique IDs for accessibility
const titleId = computed(() => `modal-title-${Math.random().toString(36).substr(2, 9)}`);
const descriptionId = computed(() => `modal-description-${Math.random().toString(36).substr(2, 9)}`);

// Focus trap management
const { activate: activateFocusTrap, deactivate: deactivateFocusTrap } = useFocusTrap();

// Size classes
const sizeClasses = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
  full: 'max-w-7xl'
};

// Modal classes
const modalClasses = computed(() => {
  const classes = [
    'relative w-full bg-white dark:bg-gray-800 rounded-lg shadow-xl transform transition-all',
    'text-left overflow-hidden'
  ];
  
  if (props.fullscreen) {
    classes.push('h-screen w-screen max-w-none rounded-none');
  } else {
    classes.push(sizeClasses[props.size]);
    classes.push('mx-4 sm:mx-auto');
  }
  
  if (props.scrollable && !props.fullscreen) {
    classes.push('max-h-[90vh] flex flex-col');
  }
  
  return classes.join(' ');
});

// Body classes
const bodyClasses = computed(() => {
  const classes = ['p-6'];
  
  if (props.scrollable && !props.fullscreen) {
    classes.push('flex-1 overflow-y-auto');
  }
  
  return classes.join(' ');
});

// Footer classes
const footerClasses = computed(() => {
  return 'px-6 py-4 bg-gray-50 dark:bg-gray-700/50 border-t border-gray-200 dark:border-gray-700 flex justify-end space-x-2';
});

// Handle backdrop click
const handleBackdropClick = (event: MouseEvent) => {
  if (props.closeOnBackdrop && !props.persistent && event.target === modalBackdrop.value) {
    close();
  }
};

// Handle keyboard events
const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Escape' && props.closeOnEscape && !props.persistent) {
    close();
  }
};

// Close modal
const close = () => {
  if (!props.persistent) {
    emit('update:modelValue', false);
    emit('close');
  }
};

// Watch for modal state changes
watch(() => props.modelValue, async (isOpen) => {
  if (isOpen) {
    emit('open');
    
    // Wait for DOM to update
    await nextTick();
    
    // Set up focus trap
    if (modalPanel.value) {
      activateFocusTrap(modalPanel.value);
    }
    
    // Focus the close button or first focusable element
    await nextTick();
    if (closeButton.value?.$el) {
      closeButton.value.$el.focus();
    } else {
      const firstFocusable = modalPanel.value?.querySelector(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      ) as HTMLElement;
      firstFocusable?.focus();
    }
    
    // Prevent body scroll
    document.body.style.overflow = 'hidden';
  } else {
    // Cleanup
    deactivateFocusTrap();
    document.body.style.overflow = '';
  }
}, { immediate: true });

// Cleanup on unmount
onMounted(() => {
  return () => {
    deactivateFocusTrap();
    document.body.style.overflow = '';
  };
});
</script>