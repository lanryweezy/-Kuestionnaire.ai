import { FormSchema, FormSubmission } from "../types";

const STORAGE_KEYS = {
  FORMS: 'kuestionnaire_ai_data',
  SUBMISSIONS: 'kuestionnaire_ai_submissions'
} as const;

export const storageService = {
  // Generic storage operations with error handling
  getItem: <T>(key: string, fallback: T): T => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : fallback;
    } catch (e) {
      console.error(`Failed to get item ${key} from localStorage`, e);
      return fallback;
    }
  },

  setItem: (key: string, value: any): boolean => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (e) {
      console.error(`Failed to set item ${key} in localStorage`, e);
      return false;
    }
  },

  removeItem: (key: string): boolean => {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (e) {
      console.error(`Failed to remove item ${key} from localStorage`, e);
      return false;
    }
  },

  // Form-specific operations
  getForms: (fallback: FormSchema[] = []): FormSchema[] => {
    return storageService.getItem<FormSchema[]>(STORAGE_KEYS.FORMS, fallback);
  },

  saveForms: (forms: FormSchema[]): boolean => {
    return storageService.setItem(STORAGE_KEYS.FORMS, forms);
  },

  // Submission-specific operations
  getSubmissions: (fallback: FormSubmission[] = []): FormSubmission[] => {
    return storageService.getItem<FormSubmission[]>(STORAGE_KEYS.SUBMISSIONS, fallback);
  },

  saveSubmissions: (submissions: FormSubmission[]): boolean => {
    return storageService.setItem(STORAGE_KEYS.SUBMISSIONS, submissions);
  },

  addSubmission: (submission: FormSubmission): boolean => {
    try {
      const existing = storageService.getSubmissions();
      return storageService.saveSubmissions([submission, ...existing]);
    } catch (e) {
      console.error("Failed to add submission to localStorage", e);
      return false;
    }
  },

  getSubmissionsByFormId: (formId: string): FormSubmission[] => {
    try {
      const all = storageService.getSubmissions();
      return all.filter((s: FormSubmission) => s.formId === formId);
    } catch (e) {
      console.error("Failed to get submissions by form ID from localStorage", e);
      return [];
    }
  }
};