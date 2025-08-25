import { ref, reactive, computed, watch } from 'vue';

export interface ValidationRule {
  test: (value: any) => boolean;
  message: string;
}

export interface FieldConfig {
  required?: boolean;
  rules?: ValidationRule[];
  validateOnChange?: boolean;
  validateOnBlur?: boolean;
}

export interface FieldState {
  value: any;
  error: string;
  touched: boolean;
  dirty: boolean;
  valid: boolean;
}

export function useFormValidation<T extends Record<string, any>>(
  initialValues: T,
  config: Partial<Record<keyof T, FieldConfig>> = {}
) {
  // Form state
  const values = reactive({ ...initialValues }) as T;
  const fields = reactive<Record<keyof T, FieldState>>({} as Record<keyof T, FieldState>);
  const isSubmitting = ref(false);
  const submitCount = ref(0);

  // Initialize fields
  Object.keys(initialValues).forEach(key => {
    const fieldKey = key as keyof T;
    fields[fieldKey] = {
      value: initialValues[fieldKey],
      error: '',
      touched: false,
      dirty: false,
      valid: true
    };
  });

  // Validation rules
  const requiredRule = (message = 'This field is required'): ValidationRule => ({
    test: (value: any) => {
      if (typeof value === 'string') return value.trim().length > 0;
      if (typeof value === 'number') return !isNaN(value);
      if (Array.isArray(value)) return value.length > 0;
      return value !== null && value !== undefined;
    },
    message
  });

  const emailRule = (message = 'Please enter a valid email address'): ValidationRule => ({
    test: (value: string) => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return !value || emailRegex.test(value);
    },
    message
  });

  const minLengthRule = (min: number, message?: string): ValidationRule => ({
    test: (value: string) => !value || value.length >= min,
    message: message || `Must be at least ${min} characters long`
  });

  const maxLengthRule = (max: number, message?: string): ValidationRule => ({
    test: (value: string) => !value || value.length <= max,
    message: message || `Must be no more than ${max} characters long`
  });

  const phoneRule = (message = 'Please enter a valid phone number'): ValidationRule => ({
    test: (value: string) => {
      const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
      return !value || phoneRegex.test(value.replace(/\s|-|\(|\)/g, ''));
    },
    message
  });

  const urlRule = (message = 'Please enter a valid URL'): ValidationRule => ({
    test: (value: string) => {
      try {
        return !value || Boolean(new URL(value));
      } catch {
        return false;
      }
    },
    message
  });

  const numericRule = (message = 'Please enter a valid number'): ValidationRule => ({
    test: (value: any) => !value || !isNaN(Number(value)),
    message
  });

  const matchRule = (otherField: keyof T, message?: string): ValidationRule => ({
    test: (value: any) => !value || value === values[otherField],
    message: message || `Must match ${String(otherField)}`
  });

  // Validate single field
  const validateField = (fieldName: keyof T): boolean => {
    const fieldConfig = config[fieldName] || {};
    const value = values[fieldName];
    const fieldState = fields[fieldName];
    
    // Clear previous error
    fieldState.error = '';
    fieldState.valid = true;

    // Required validation
    if (fieldConfig.required) {
      const rule = requiredRule();
      if (!rule.test(value)) {
        fieldState.error = rule.message;
        fieldState.valid = false;
        return false;
      }
    }

    // Custom rules
    if (fieldConfig.rules) {
      for (const rule of fieldConfig.rules) {
        if (!rule.test(value)) {
          fieldState.error = rule.message;
          fieldState.valid = false;
          return false;
        }
      }
    }

    return true;
  };

  // Validate all fields
  const validateForm = (): boolean => {
    let isValid = true;
    
    Object.keys(fields).forEach(key => {
      const fieldKey = key as keyof T;
      const fieldValid = validateField(fieldKey);
      if (!fieldValid) {
        isValid = false;
      }
    });

    return isValid;
  };

  // Set field value
  const setFieldValue = (fieldName: keyof T, value: any) => {
    values[fieldName] = value;
    fields[fieldName].value = value;
    fields[fieldName].dirty = true;

    const fieldConfig = config[fieldName] || {};
    if (fieldConfig.validateOnChange) {
      validateField(fieldName);
    }
  };

  // Set field touched
  const setFieldTouched = (fieldName: keyof T) => {
    fields[fieldName].touched = true;

    const fieldConfig = config[fieldName] || {};
    if (fieldConfig.validateOnBlur) {
      validateField(fieldName);
    }
  };

  // Set field error
  const setFieldError = (fieldName: keyof T, error: string) => {
    fields[fieldName].error = error;
    fields[fieldName].valid = !error;
  };

  // Reset form
  const resetForm = () => {
    Object.keys(initialValues).forEach(key => {
      const fieldKey = key as keyof T;
      values[fieldKey] = initialValues[fieldKey];
      fields[fieldKey] = {
        value: initialValues[fieldKey],
        error: '',
        touched: false,
        dirty: false,
        valid: true
      };
    });
    isSubmitting.value = false;
    submitCount.value = 0;
  };

  // Reset field
  const resetField = (fieldName: keyof T) => {
    values[fieldName] = initialValues[fieldName];
    fields[fieldName] = {
      value: initialValues[fieldName],
      error: '',
      touched: false,
      dirty: false,
      valid: true
    };
  };

  // Handle form submit
  const handleSubmit = async (onSubmit: (values: T) => Promise<void> | void) => {
    submitCount.value++;
    isSubmitting.value = true;

    // Mark all fields as touched
    Object.keys(fields).forEach(key => {
      const fieldKey = key as keyof T;
      fields[fieldKey].touched = true;
    });

    // Validate form
    const isValid = validateForm();

    if (isValid) {
      try {
        await onSubmit(values);
      } catch (error) {
        // Handle submission error
        console.error('Form submission error:', error);
      }
    }

    isSubmitting.value = false;
  };

  // Computed properties
  const isValid = computed(() => Object.values(fields).every(field => field.valid));
  const isDirty = computed(() => Object.values(fields).some(field => field.dirty));
  const hasErrors = computed(() => Object.values(fields).some(field => field.error));
  const touchedFields = computed(() => 
    Object.keys(fields).filter(key => fields[key as keyof T].touched)
  );
  const errorFields = computed(() =>
    Object.keys(fields).filter(key => fields[key as keyof T].error)
  );

  // Watch for value changes
  Object.keys(initialValues).forEach(key => {
    const fieldKey = key as keyof T;
    watch(() => values[fieldKey], (newValue) => {
      fields[fieldKey].value = newValue;
      if (!fields[fieldKey].dirty) {
        fields[fieldKey].dirty = true;
      }
    });
  });

  return {
    // State
    values,
    fields,
    isSubmitting,
    submitCount,

    // Computed
    isValid,
    isDirty,
    hasErrors,
    touchedFields,
    errorFields,

    // Methods
    validateField,
    validateForm,
    setFieldValue,
    setFieldTouched,
    setFieldError,
    resetForm,
    resetField,
    handleSubmit,

    // Validation rules
    rules: {
      required: requiredRule,
      email: emailRule,
      minLength: minLengthRule,
      maxLength: maxLengthRule,
      phone: phoneRule,
      url: urlRule,
      numeric: numericRule,
      match: matchRule
    }
  };
}