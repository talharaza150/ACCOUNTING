<template>
  <component
    :is="tag"
    :type="tag === 'button' ? type : undefined"
    :disabled="disabled || loading"
    :class="buttonClasses"
    :aria-label="ariaLabel"
    :aria-describedby="ariaDescribedby"
    :aria-pressed="pressed"
    v-bind="$attrs"
    @click="handleClick"
    @keydown="handleKeydown"
  >
    <span v-if="loading" class="inline-flex items-center">
      <svg 
        class="animate-spin -ml-1 mr-2 h-4 w-4" 
        fill="none" 
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
    </span>
    
    <Icon v-if="icon && !loading" :name="icon" :class="iconClasses" />
    
    <span v-if="slots.default || text" :class="{ 'sr-only': iconOnly }">
      <slot>{{ text }}</slot>
    </span>
    
    <Icon v-if="trailingIcon && !loading" :name="trailingIcon" :class="trailingIconClasses" />
  </component>
</template>

<script setup lang="ts">
import { computed, useSlots } from 'vue';
import Icon from './Icon.vue';

interface Props {
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'ghost' | 'link';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  type?: 'button' | 'submit' | 'reset';
  tag?: 'button' | 'a' | 'router-link';
  disabled?: boolean;
  loading?: boolean;
  icon?: string;
  trailingIcon?: string;
  iconOnly?: boolean;
  text?: string;
  ariaLabel?: string;
  ariaDescribedby?: string;
  pressed?: boolean;
  fullWidth?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'primary',
  size: 'md',
  type: 'button',
  tag: 'button',
  disabled: false,
  loading: false,
  iconOnly: false,
  fullWidth: false
});

const emit = defineEmits<{
  click: [event: Event];
}>();

const slots = useSlots();

const baseClasses = 'relative inline-flex items-center justify-center font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation active:scale-[0.98]';

const variantClasses = {
  primary: 'bg-blue-600 text-white hover:bg-blue-700 focus-visible:ring-blue-500 active:bg-blue-800',
  secondary: 'bg-gray-100 text-gray-900 hover:bg-gray-200 focus-visible:ring-gray-500 active:bg-gray-300 dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-700',
  success: 'bg-green-600 text-white hover:bg-green-700 focus-visible:ring-green-500 active:bg-green-800',
  danger: 'bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-500 active:bg-red-800',
  warning: 'bg-yellow-500 text-white hover:bg-yellow-600 focus-visible:ring-yellow-500 active:bg-yellow-700',
  ghost: 'text-gray-900 hover:bg-gray-100 focus-visible:ring-gray-500 active:bg-gray-200 dark:text-gray-100 dark:hover:bg-gray-800',
  link: 'text-blue-600 hover:text-blue-700 hover:underline focus-visible:ring-blue-500 active:text-blue-800 dark:text-blue-400'
};

const sizeClasses = {
  xs: 'px-2 py-1 text-xs rounded min-h-[32px]',
  sm: 'px-3 py-1.5 text-sm rounded-md min-h-[36px]',
  md: 'px-4 py-2 text-sm rounded-md min-h-[44px]', // 44px for touch targets
  lg: 'px-6 py-3 text-base rounded-lg min-h-[48px]',
  xl: 'px-8 py-4 text-lg rounded-lg min-h-[52px]'
};

const buttonClasses = computed(() => {
  const classes = [baseClasses];
  
  if (props.variant !== 'link') {
    classes.push(variantClasses[props.variant]);
  } else {
    classes.push(variantClasses.link);
  }
  
  classes.push(sizeClasses[props.size]);
  
  if (props.fullWidth) {
    classes.push('w-full');
  }
  
  if (props.iconOnly) {
    classes.push('aspect-square p-0');
  }
  
  return classes.join(' ');
});

const iconClasses = computed(() => {
  const classes = [];
  
  if (props.size === 'xs') classes.push('h-3 w-3');
  else if (props.size === 'sm') classes.push('h-4 w-4');
  else if (props.size === 'md') classes.push('h-4 w-4');
  else if (props.size === 'lg') classes.push('h-5 w-5');
  else if (props.size === 'xl') classes.push('h-6 w-6');
  
  if (!props.iconOnly && (slots.default || props.text)) {
    classes.push('mr-2');
  }
  
  return classes.join(' ');
});

const trailingIconClasses = computed(() => {
  const classes = [];
  
  if (props.size === 'xs') classes.push('h-3 w-3');
  else if (props.size === 'sm') classes.push('h-4 w-4');
  else if (props.size === 'md') classes.push('h-4 w-4');
  else if (props.size === 'lg') classes.push('h-5 w-5');
  else if (props.size === 'xl') classes.push('h-6 w-6');
  
  if (!props.iconOnly && (slots.default || props.text)) {
    classes.push('ml-2');
  }
  
  return classes.join(' ');
});

const handleClick = (event: Event) => {
  if (!props.disabled && !props.loading) {
    emit('click', event);
  }
};

const handleKeydown = (event: KeyboardEvent) => {
  // Handle Enter and Space for accessibility
  if (props.tag === 'button' && (event.key === 'Enter' || event.key === ' ')) {
    if (!props.disabled && !props.loading) {
      emit('click', event);
    }
  }
};
</script>