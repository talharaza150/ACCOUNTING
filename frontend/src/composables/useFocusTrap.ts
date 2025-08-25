import { ref } from 'vue';

export function useFocusTrap() {
  const isActive = ref(false);
  let container: HTMLElement | null = null;
  let previousActiveElement: HTMLElement | null = null;
  
  const focusableSelectors = [
    'button',
    '[href]',
    'input',
    'select',
    'textarea',
    '[tabindex]:not([tabindex="-1"])',
    '[contenteditable]'
  ].join(', ');

  const getFocusableElements = (element: HTMLElement): HTMLElement[] => {
    return Array.from(element.querySelectorAll(focusableSelectors))
      .filter((el) => {
        const htmlEl = el as HTMLElement;
        return !htmlEl.hasAttribute('disabled') && 
               !htmlEl.getAttribute('aria-hidden') &&
               htmlEl.offsetParent !== null;
      }) as HTMLElement[];
  };

  const handleKeydown = (event: KeyboardEvent) => {
    if (!container || !isActive.value || event.key !== 'Tab') return;

    const focusableElements = getFocusableElements(container);
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    if (!firstElement) return;

    if (event.shiftKey) {
      // Shift + Tab
      if (document.activeElement === firstElement || document.activeElement === container) {
        event.preventDefault();
        lastElement?.focus();
      }
    } else {
      // Tab
      if (document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    }
  };

  const activate = (element: HTMLElement) => {
    if (isActive.value) return;

    container = element;
    previousActiveElement = document.activeElement as HTMLElement;
    isActive.value = true;

    document.addEventListener('keydown', handleKeydown);

    // Focus the first focusable element
    const focusableElements = getFocusableElements(element);
    if (focusableElements.length > 0) {
      focusableElements[0].focus();
    } else {
      element.focus();
    }
  };

  const deactivate = () => {
    if (!isActive.value) return;

    isActive.value = false;
    container = null;

    document.removeEventListener('keydown', handleKeydown);

    // Return focus to previous element
    if (previousActiveElement && document.contains(previousActiveElement)) {
      previousActiveElement.focus();
    }
    previousActiveElement = null;
  };

  return {
    isActive,
    activate,
    deactivate
  };
}