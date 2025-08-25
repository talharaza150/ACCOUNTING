<template>
  <div class="space-y-1">
    <!-- Label -->
    <label 
      v-if="label || $slots.label"
      :for="inputId"
      :class="labelClasses"
    >
      <slot name="label">{{ label }}</slot>
      <span v-if="required" class="text-red-500 ml-1" aria-label="required">*</span>
    </label>

    <!-- Input wrapper -->
    <div class="relative">
      <!-- Leading icon -->
      <div v-if="leadingIcon || slots.leading" class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
        <slot name="leading">
          <Icon v-if="leadingIcon" :name="leadingIcon" class="text-gray-400" size="sm" />
        </slot>
      </div>

      <!-- Input -->
      <component
        :is="tag"
        :id="inputId"
        ref="inputRef"
        :value="modelValue"
        :type="type"
        :placeholder="placeholder"
        :disabled="disabled"
        :readonly="readonly"
        :required="required"
        :autocomplete="autocomplete"
        :min="min"
        :max="max"
        :step="step"
        :rows="rows"
        :cols="cols"
        :class="inputClasses"
        :aria-invalid="hasError"
        :aria-describedby="ariaDescribedBy"
        :aria-required="required"
        v-bind="$attrs"
        @input="handleInput"
        @blur="handleBlur"
        @focus="handleFocus"
        @keydown="handleKeydown"
      />

      <!-- Trailing content -->
      <div v-if="trailingIcon || slots.trailing || showClearButton" class="absolute inset-y-0 right-0 flex items-center pr-3">
        <slot name="trailing">
          <!-- Clear button -->
          <BaseButton
            v-if="showClearButton"
            variant="ghost"
            size="sm"
            icon="x-mark"
            icon-only
            :aria-label="`Clear ${label || 'input'}`"
            @click="clearInput"
          />
          
          <!-- Trailing icon -->
          <Icon v-else-if="trailingIcon" :name="trailingIcon" class="text-gray-400" size="sm" />
        </slot>
      </div>

      <!-- Loading indicator -->
      <div v-if="loading" class="absolute inset-y-0 right-0 flex items-center pr-3">
        <Icon name="arrow-path" class="animate-spin text-gray-400" size="sm" />
      </div>
    </div>

    <!-- Help text -->
    <div v-if="helpText || slots.help" :id="`${inputId}-help`" class="text-sm text-gray-600 dark:text-gray-400">
      <slot name="help">{{ helpText }}</slot>
    </div>

    <!-- Error message -->
    <div
      v-if="hasError && errorMessage"
      :id="`${inputId}-error`"
      class="text-sm text-red-600 dark:text-red-400"
      role="alert"
      aria-live="polite"
    >
      {{ errorMessage }}
    </div>

    <!-- Success message -->
    <div
      v-if="hasSuccess && successMessage"
      :id="`${inputId}-success`"
      class="text-sm text-green-600 dark:text-green-400"
      role="status"
      aria-live="polite"
    >
      {{ successMessage }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick, useSlots } from 'vue';
import Icon from './Icon.vue';
import BaseButton from './BaseButton.vue';

interface Props {
  modelValue?: string | number;
  label?: string;
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'search' | 'textarea';
  placeholder?: string;
  disabled?: boolean;
  readonly?: boolean;
  required?: boolean;
  loading?: boolean;
  clearable?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'filled';
  leadingIcon?: string;
  trailingIcon?: string;
  helpText?: string;
  errorMessage?: string;
  successMessage?: string;
  autocomplete?: string;
  min?: string | number;
  max?: string | number;
  step?: string | number;
  rows?: number;
  cols?: number;
  debounce?: number;
}

const props = withDefaults(defineProps<Props>(), {
  type: 'text',
  size: 'md',
  variant: 'default',
  debounce: 0
});

const emit = defineEmits<{
  'update:modelValue': [value: string | number];
  'input': [event: Event];
  'blur': [event: FocusEvent];
  'focus': [event: FocusEvent];
  'clear': [];
  'keydown': [event: KeyboardEvent];
}>();

const slots = useSlots();

const inputRef = ref<HTMLInputElement | HTMLTextAreaElement>();
const isFocused = ref(false);
const debounceTimer = ref<number>();

// Generate unique ID for accessibility
const inputId = computed(() => `input-${Math.random().toString(36).substr(2, 9)}`);

// Determine input tag
const tag = computed(() => props.type === 'textarea' ? 'textarea' : 'input');

// Validation states
const hasError = computed(() => Boolean(props.errorMessage));
const hasSuccess = computed(() => Boolean(props.successMessage));

// Show clear button
const showClearButton = computed(() => 
  props.clearable && 
  props.modelValue && 
  !props.disabled && 
  !props.readonly &&
  isFocused.value
);

// ARIA describedby
const ariaDescribedBy = computed(() => {
  const ids = [];
  if (props.helpText) ids.push(`${inputId.value}-help`);
  if (hasError.value) ids.push(`${inputId.value}-error`);
  if (hasSuccess.value) ids.push(`${inputId.value}-success`);
  return ids.length > 0 ? ids.join(' ') : undefined;
});

// Label classes
const labelClasses = computed(() => {
  const classes = ['block text-sm font-medium'];
  
  if (hasError.value) {
    classes.push('text-red-700 dark:text-red-400');
  } else if (hasSuccess.value) {
    classes.push('text-green-700 dark:text-green-400');
  } else {
    classes.push('text-gray-700 dark:text-gray-300');
  }
  
  return classes.join(' ');
});

// Input classes
const inputClasses = computed(() => {
  const classes = [
    'block w-full rounded-md border-0 shadow-sm ring-1 ring-inset transition-all duration-200',
    'placeholder:text-gray-400 focus:ring-2 focus:ring-inset',
    'disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500 disabled:ring-gray-200',
    'dark:bg-gray-900 dark:text-gray-100 dark:placeholder:text-gray-500',
    'min-h-[44px]' // Touch target size
  ];

  // Size variants
  if (props.size === 'sm') {
    classes.push('py-1.5 px-3 text-sm min-h-[36px]');
  } else if (props.size === 'md') {
    classes.push('py-2 px-3 text-sm');
  } else if (props.size === 'lg') {
    classes.push('py-3 px-4 text-base min-h-[48px]');
  }

  // Leading icon spacing
  if (props.leadingIcon || slots.leading) {
    classes.push('pl-10');
  }

  // Trailing icon/button spacing
  if (props.trailingIcon || slots.trailing || showClearButton.value || props.loading) {
    classes.push('pr-10');
  }

  // State styles
  if (hasError.value) {
    classes.push(
      'ring-red-300 focus:ring-red-500',
      'dark:ring-red-500 dark:focus:ring-red-400'
    );
  } else if (hasSuccess.value) {
    classes.push(
      'ring-green-300 focus:ring-green-500',
      'dark:ring-green-500 dark:focus:ring-green-400'
    );
  } else {
    classes.push(
      'ring-gray-300 focus:ring-blue-500',
      'dark:ring-gray-600 dark:focus:ring-blue-400'
    );
  }

  // Variant styles
  if (props.variant === 'filled') {
    classes.push('bg-gray-50 dark:bg-gray-800');
  } else {
    classes.push('bg-white dark:bg-gray-900');
  }

  return classes.join(' ');
});

// Event handlers
const handleInput = (event: Event) => {
  const target = event.target as HTMLInputElement | HTMLTextAreaElement;
  const value = props.type === 'number' ? Number(target.value) : target.value;

  if (props.debounce > 0) {
    clearTimeout(debounceTimer.value);
    debounceTimer.value = window.setTimeout(() => {
      emit('update:modelValue', value);
    }, props.debounce);
  } else {
    emit('update:modelValue', value);
  }

  emit('input', event);
};

const handleBlur = (event: FocusEvent) => {
  isFocused.value = false;
  emit('blur', event);
};

const handleFocus = (event: FocusEvent) => {
  isFocused.value = true;
  emit('focus', event);
};

const handleKeydown = (event: KeyboardEvent) => {
  emit('keydown', event);
};

const clearInput = () => {
  emit('update:modelValue', '');
  emit('clear');
  
  nextTick(() => {
    inputRef.value?.focus();
  });
};

// Expose methods
defineExpose({
  focus: () => inputRef.value?.focus(),
  blur: () => inputRef.value?.blur(),
  select: () => inputRef.value?.select()
});
</script>