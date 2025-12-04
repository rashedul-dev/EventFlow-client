"use client";

import { StateRecoveryService } from "../error/recovery/StateRecoveryService";

/**
 * FormErrorManager - Comprehensive form resilience
 *
 * Features:
 * - Auto-save draft every 30 seconds
 * - Recovery from browser crashes
 * - Validation error persistence across navigation
 * - Server error translation to field-level errors
 * - Multi-language error messages
 */

export interface FormError {
  field: string;
  message: string;
  type: "validation" | "server" | "client";
}

export interface FormState {
  values: Record<string, any>;
  errors: FormError[];
  touched: Set<string>;
  isDirty: boolean;
  isSubmitting: boolean;
  submitCount: number;
}

export class FormErrorManager {
  private formId: string;
  private state: FormState;
  private autoSaveInterval: NodeJS.Timeout | null = null;
  private listeners: Array<(state: FormState) => void> = [];

  constructor(formId: string, initialValues: Record<string, any> = {}) {
    this.formId = formId;
    this.state = {
      values: initialValues,
      errors: [],
      touched: new Set(),
      isDirty: false,
      isSubmitting: false,
      submitCount: 0,
    };

    // Try to restore from saved state
    this.restoreState();

    // Start auto-save
    this.startAutoSave();
  }

  /**
   * Set form values
   */
  setValues(values: Record<string, any>): void {
    this.state.values = { ...this.state.values, ...values };
    this.state.isDirty = true;
    this.notifyListeners();
  }

  /**
   * Set field value
   */
  setFieldValue(field: string, value: any): void {
    this.state.values[field] = value;
    this.state.isDirty = true;
    this.notifyListeners();
  }

  /**
   * Set field touched
   */
  setFieldTouched(field: string, touched: boolean = true): void {
    if (touched) {
      this.state.touched.add(field);
    } else {
      this.state.touched.delete(field);
    }
    this.notifyListeners();
  }

  /**
   * Set validation errors
   */
  setErrors(errors: FormError[]): void {
    this.state.errors = errors;
    this.notifyListeners();
  }

  /**
   * Add error
   */
  addError(field: string, message: string, type: FormError["type"] = "validation"): void {
    this.state.errors.push({ field, message, type });
    this.notifyListeners();
  }

  /**
   * Clear errors for field
   */
  clearFieldErrors(field: string): void {
    this.state.errors = this.state.errors.filter((e) => e.field !== field);
    this.notifyListeners();
  }

  /**
   * Clear all errors
   */
  clearErrors(): void {
    this.state.errors = [];
    this.notifyListeners();
  }

  /**
   * Validate field
   */
  validateField(field: string, rules: Record<string, any>): boolean {
    const value = this.state.values[field];

    this.clearFieldErrors(field);

    // Required validation
    if (rules.required && !value) {
      this.addError(field, `${field} is required`, "validation");
      return false;
    }

    // Min length validation
    if (rules.minLength && value.length < rules.minLength) {
      this.addError(field, `${field} must be at least ${rules.minLength} characters`, "validation");
      return false;
    }

    // Max length validation
    if (rules.maxLength && value.length > rules.maxLength) {
      this.addError(field, `${field} must be at most ${rules.maxLength} characters`, "validation");
      return false;
    }

    // Email validation
    if (rules.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      this.addError(field, "Invalid email address", "validation");
      return false;
    }

    // Custom validation
    if (rules.validate && typeof rules.validate === "function") {
      const error = rules.validate(value, this.state.values);
      if (error) {
        this.addError(field, error, "validation");
        return false;
      }
    }

    return true;
  }

  /**
   * Handle server errors
   */
  handleServerErrors(serverErrors: Array<{ field?: string; message: string }>): void {
    this.clearErrors();

    serverErrors.forEach((error) => {
      if (error.field) {
        this.addError(error.field, error.message, "server");
      } else {
        // Generic error
        this.addError("_form", error.message, "server");
      }
    });
  }

  /**
   * Get field error
   */
  getFieldError(field: string): FormError | null {
    return this.state.errors.find((e) => e.field === field) || null;
  }

  /**
   * Check if field has error
   */
  hasFieldError(field: string): boolean {
    return this.state.errors.some((e) => e.field === field);
  }

  /**
   * Get form errors (not field-specific)
   */
  getFormErrors(): FormError[] {
    return this.state.errors.filter((e) => e.field === "_form");
  }

  /**
   * Check if form is valid
   */
  isValid(): boolean {
    return this.state.errors.length === 0;
  }

  /**
   * Start submission
   */
  startSubmission(): void {
    this.state.isSubmitting = true;
    this.state.submitCount++;
    this.notifyListeners();
  }

  /**
   * End submission
   */
  endSubmission(): void {
    this.state.isSubmitting = false;
    this.notifyListeners();
  }

  /**
   * Reset form
   */
  reset(values?: Record<string, any>): void {
    this.state = {
      values: values || {},
      errors: [],
      touched: new Set(),
      isDirty: false,
      isSubmitting: false,
      submitCount: 0,
    };

    // Clear saved state
    StateRecoveryService.clearFormData(this.formId);

    this.notifyListeners();
  }

  /**
   * Get current state
   */
  getState(): FormState {
    return { ...this.state, touched: new Set(this.state.touched) };
  }

  /**
   * Subscribe to state changes
   */
  subscribe(listener: (state: FormState) => void): () => void {
    this.listeners.push(listener);

    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  /**
   * Notify listeners
   */
  private notifyListeners(): void {
    const state = this.getState();
    this.listeners.forEach((listener) => listener(state));
  }

  /**
   * Start auto-save
   */
  private startAutoSave(): void {
    this.autoSaveInterval = setInterval(() => {
      if (this.state.isDirty) {
        this.saveState();
      }
    }, 30000); // Every 30 seconds
  }

  /**
   * Stop auto-save
   */
  stopAutoSave(): void {
    if (this.autoSaveInterval) {
      clearInterval(this.autoSaveInterval);
      this.autoSaveInterval = null;
    }
  }

  /**
   * Save form state
   */
  saveState(): void {
    StateRecoveryService.saveFormData(this.formId, {
      values: this.state.values,
      errors: this.state.errors,
      touched: Array.from(this.state.touched),
      submitCount: this.state.submitCount,
    });
  }

  /**
   * Restore form state
   */
  private restoreState(): void {
    const saved = StateRecoveryService.getFormData(this.formId);

    if (saved) {
      this.state.values = saved.values || this.state.values;
      this.state.errors = saved.errors || [];
      this.state.touched = new Set(saved.touched || []);
      this.state.submitCount = saved.submitCount || 0;
      this.state.isDirty = true;

      console.log("📝 Form state restored:", this.formId);
    }
  }

  /**
   * Cleanup
   */
  destroy(): void {
    this.stopAutoSave();
    this.listeners = [];
  }
}
