import { FormSchema, FormSubmission } from "../types";
import { db } from './db';

export const storageService = {
  // Form-specific operations
  getForms: async (fallback: FormSchema[] = []): Promise<FormSchema[]> => {
    try {
      const forms = await db.forms.toArray();
      return forms.length > 0 ? forms : fallback;
    } catch (e) {
      console.error(`Failed to get forms from IndexedDB`, e);
      return fallback;
    }
  },

  saveForms: async (forms: FormSchema[]): Promise<boolean> => {
    try {
      await db.forms.clear();
      await db.forms.bulkAdd(forms);
      return true;
    } catch (e) {
      console.error(`Failed to save forms to IndexedDB`, e);
      return false;
    }
  },

  // Submission-specific operations
  getSubmissions: async (fallback: FormSubmission[] = []): Promise<FormSubmission[]> => {
    try {
      const submissions = await db.submissions.toArray();
      return submissions.length > 0 ? submissions : fallback;
    } catch (e) {
      console.error(`Failed to get submissions from IndexedDB`, e);
      return fallback;
    }
  },

  saveSubmissions: async (submissions: FormSubmission[]): Promise<boolean> => {
    try {
      await db.submissions.clear();
      await db.submissions.bulkAdd(submissions);
      return true;
    } catch (e) {
      console.error(`Failed to save submissions to IndexedDB`, e);
      return false;
    }
  },

  addSubmission: async (submission: FormSubmission): Promise<boolean> => {
    try {
      await db.submissions.add(submission);
      return true;
    } catch (e) {
      console.error("Failed to add submission to IndexedDB", e);
      return false;
    }
  },

  getSubmissionsByFormId: async (formId: string): Promise<FormSubmission[]> => {
    try {
      const submissions = await db.submissions.where('formId').equals(formId).toArray();
      return submissions;
    } catch (e) {
      console.error(`Failed to get submissions by form ID ${formId} from IndexedDB`, e);
      return [];
    }
  }
};