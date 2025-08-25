<template>
  <component
    :is="iconComponent"
    :class="classes"
    :aria-hidden="!ariaLabel"
    :aria-label="ariaLabel"
    :role="ariaLabel ? 'img' : undefined"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { 
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  XMarkIcon,
  Bars3Icon,
  ChevronDownIcon,
  ChevronUpIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  MagnifyingGlassIcon,
  DocumentIcon,
  FolderIcon,
  EyeIcon,
  ArrowDownTrayIcon,
  TrashIcon,
  PlusIcon,
  UserIcon,
  CogIcon,
  HomeIcon,
  ClipboardDocumentIcon,
  CloudArrowUpIcon,
  DocumentArrowDownIcon,
  PencilIcon,
  ClockIcon,
  TagIcon,
  StarIcon,
  HeartIcon,
  ShareIcon,
  LinkIcon,
  PhotoIcon,
  VideoCameraIcon,
  MusicalNoteIcon,
  CodeBracketIcon,
  ArchiveBoxIcon,
  BoltIcon,
  LightBulbIcon,
  ShieldCheckIcon,
  GlobeAltIcon,
  DevicePhoneMobileIcon,
  ComputerDesktopIcon,
  SunIcon,
  MoonIcon,
  AdjustmentsHorizontalIcon,
  EllipsisVerticalIcon,
  ArrowPathIcon,
  CheckIcon,
  ExclamationCircleIcon,
  LockClosedIcon,
  ArrowRightOnRectangleIcon,
  QueueListIcon,
  Squares2X2Icon
} from '@heroicons/vue/24/outline';

import {
  CheckCircleIcon as CheckCircleIconSolid,
  XCircleIcon as XCircleIconSolid,
  ExclamationTriangleIcon as ExclamationTriangleIconSolid,
  InformationCircleIcon as InformationCircleIconSolid,
  HeartIcon as HeartIconSolid,
  StarIcon as StarIconSolid
} from '@heroicons/vue/24/solid';

interface Props {
  name: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  variant?: 'outline' | 'solid';
  ariaLabel?: string;
  class?: string;
}

const props = withDefaults(defineProps<Props>(), {
  size: 'md',
  variant: 'outline'
});

const iconMap = {
  // Status icons
  'check-circle': CheckCircleIcon,
  'x-circle': XCircleIcon,
  'exclamation-triangle': ExclamationTriangleIcon,
  'exclamation-circle': ExclamationCircleIcon,
  'information-circle': InformationCircleIcon,
  'check': CheckIcon,
  
  // Navigation icons
  'x-mark': XMarkIcon,
  'bars-3': Bars3Icon,
  'chevron-down': ChevronDownIcon,
  'chevron-up': ChevronUpIcon,
  'chevron-left': ChevronLeftIcon,
  'chevron-right': ChevronRightIcon,
  
  // Action icons
  'magnifying-glass': MagnifyingGlassIcon,
  'plus': PlusIcon,
  'pencil': PencilIcon,
  'trash': TrashIcon,
  'eye': EyeIcon,
  'arrow-down-tray': ArrowDownTrayIcon,
  'cloud-arrow-up': CloudArrowUpIcon,
  'document-arrow-down': DocumentArrowDownIcon,
  'share': ShareIcon,
  'link': LinkIcon,
  'arrow-path': ArrowPathIcon,
  
  // File type icons
  'document': DocumentIcon,
  'folder': FolderIcon,
  'clipboard-document': ClipboardDocumentIcon,
  'photo': PhotoIcon,
  'video-camera': VideoCameraIcon,
  'musical-note': MusicalNoteIcon,
  'code-bracket': CodeBracketIcon,
  'archive-box': ArchiveBoxIcon,
  
  // User & system icons
  'user': UserIcon,
  'cog': CogIcon,
  'home': HomeIcon,
  'clock': ClockIcon,
  'tag': TagIcon,
  'bolt': BoltIcon,
  'light-bulb': LightBulbIcon,
  'shield-check': ShieldCheckIcon,
  'globe-alt': GlobeAltIcon,
  'device-phone-mobile': DevicePhoneMobileIcon,
  'computer-desktop': ComputerDesktopIcon,
  'sun': SunIcon,
  'moon': MoonIcon,
  'adjustments-horizontal': AdjustmentsHorizontalIcon,
  'ellipsis-vertical': EllipsisVerticalIcon,
  
  // Interactive icons
  'star': StarIcon,
  'heart': HeartIcon,
  
  // Security icons
  'lock-closed': LockClosedIcon,
  'arrow-right-on-rectangle': ArrowRightOnRectangleIcon,
  
  // Layout icons
  'list': QueueListIcon,
  'grid': Squares2X2Icon
};

const solidIconMap = {
  'check-circle': CheckCircleIconSolid,
  'x-circle': XCircleIconSolid,
  'exclamation-triangle': ExclamationTriangleIconSolid,
  'information-circle': InformationCircleIconSolid,
  'heart': HeartIconSolid,
  'star': StarIconSolid
};

const sizeClasses = {
  xs: 'h-3 w-3',
  sm: 'h-4 w-4',
  md: 'h-5 w-5',
  lg: 'h-6 w-6',
  xl: 'h-8 w-8',
  '2xl': 'h-10 w-10'
};

const iconComponent = computed(() => {
  const iconName = props.name as keyof typeof iconMap;
  
  if (props.variant === 'solid' && solidIconMap[iconName]) {
    return solidIconMap[iconName];
  }
  
  return iconMap[iconName] || DocumentIcon;
});

const classes = computed(() => {
  const classList = [sizeClasses[props.size]];
  
  if (props.class) {
    classList.push(props.class);
  }
  
  return classList.join(' ');
});
</script>