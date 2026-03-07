import { FormSchema, FormSubmission, Question, QuestionType } from "../types";
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/useAuthStore';

// Helper to get current user ID
const getUserId = () => {
  return useAuthStore.getState().user?.id;
};

export const storageService = {
  // Form-specific operations
  getForms: async (fallback: FormSchema[] = []): Promise<FormSchema[]> => {
    const userId = getUserId();
    if (!userId) return fallback;

    try {
      const { data: formsData, error: formsError } = await supabase
        .from('forms')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (formsError) throw formsError;
      if (!formsData || formsData.length === 0) return fallback;

      const { data: questionsData, error: questionsError } = await supabase
        .from('questions')
        .select('*')
        .in('form_id', formsData.map(f => f.id))
        .order('order_index', { ascending: true });

      if (questionsError) throw questionsError;

      const forms: FormSchema[] = formsData.map(f => {
        const formQuestions = (questionsData || []).filter(q => q.form_id === f.id).map(q => ({
          id: q.id,
          type: q.question_type as QuestionType,
          label: q.label,
          required: q.required,
          options: q.options || [],
          maxRating: q.max_rating,
          includeTime: q.include_time,
          // You can add more mappings here if your schema grows
        } as Question));

        return {
          id: f.id,
          title: f.title,
          description: f.description,
          theme: f.theme,
          isPublic: f.is_public,
          questions: formQuestions,
          createdAt: f.created_at,
          updatedAt: f.updated_at
        } as FormSchema;
      });

      return forms;
    } catch (e) {
      console.error(`Failed to get forms from Supabase`, e);
      return fallback;
    }
  },

  getFormById: async (id: string): Promise<FormSchema | null> => {
    try {
      const { data: formData, error: formError } = await supabase
        .from('forms')
        .select('*')
        .eq('id', id)
        .single();

      if (formError) throw formError;
      if (!formData) return null;

      const { data: questionsData, error: questionsError } = await supabase
        .from('questions')
        .select('*')
        .eq('form_id', id)
        .order('order_index', { ascending: true });

      if (questionsError) throw questionsError;

      const formQuestions: Question[] = (questionsData || []).map(q => ({
        id: q.id,
        type: q.question_type as QuestionType,
        label: q.label,
        required: q.required,
        options: q.options || [],
        maxRating: q.max_rating,
        includeTime: q.include_time,
      } as Question));

      return {
        id: formData.id,
        title: formData.title,
        description: formData.description || '',
        theme: formData.theme as any,
        isPublic: formData.is_public,
        questions: formQuestions
      } as FormSchema;
    } catch (e) {
      console.error(`Failed to get form ${id} from Supabase`, e);
      return null;
    }
  },

  putForm: async (form: FormSchema): Promise<boolean> => {
    const userId = getUserId();
    if (!userId) return false;

    try {
      // 1. Upsert Form
      const { error: formError } = await supabase
        .from('forms')
        .upsert({
          id: form.id,
          user_id: userId,
          title: form.title,
          description: form.description,
          theme: form.theme,
          is_public: form.isPublic || false,
          updated_at: new Date().toISOString()
        });

      if (formError) throw formError;

      // 2. Fetch existing questions to find which ones to delete
      const { data: existingQuestions } = await supabase
        .from('questions')
        .select('id')
        .eq('form_id', form.id);

      const currentQuestionIds = form.questions.map(q => q.id);
      const toDelete = (existingQuestions || []).filter(q => !currentQuestionIds.includes(q.id)).map(q => q.id);

      if (toDelete.length > 0) {
        await supabase.from('questions').delete().in('id', toDelete);
      }

      // 3. Upsert Questions
      if (form.questions.length > 0) {
        const questionsToUpsert = form.questions.map((q, index) => ({
          id: q.id,
          form_id: form.id,
          question_type: q.type,
          label: q.label,
          required: q.required,
          options: q.options || null,
          max_rating: q.maxRating || null,
          include_time: q.includeTime || false,
          order_index: index
        }));

        const { error: questionsError } = await supabase
          .from('questions')
          .upsert(questionsToUpsert);

        if (questionsError) throw questionsError;
      }

      return true;
    } catch (e) {
      console.error(`Failed to put form to Supabase`, e);
      return false;
    }
  },

  deleteForm: async (id: string): Promise<boolean> => {
    const userId = getUserId();
    if (!userId) return false;

    try {
      const { error } = await supabase
        .from('forms')
        .delete()
        .eq('id', id)
        .eq('user_id', userId);

      if (error) throw error;
      return true;
    } catch (e) {
      console.error(`Failed to delete form from Supabase`, e);
      return false;
    }
  },

  // Submissions
  getSubmissionsByFormId: async (formId: string): Promise<FormSubmission[]> => {
    try {
      const { data: responsesData, error: responsesError } = await supabase
        .from('responses')
        .select('*')
        .eq('form_id', formId);

      if (responsesError) throw responsesError;
      if (!responsesData || responsesData.length === 0) return [];

      const { data: answersData, error: answersError } = await supabase
        .from('answers')
        .select('*')
        .in('response_id', responsesData.map(r => r.id));

      if (answersError) throw answersError;

      const submissions: FormSubmission[] = responsesData.map(r => {
        const formAnswers = (answersData || []).filter(a => a.response_id === r.id);
        const answerMap: Record<string, any> = {};
        formAnswers.forEach(a => {
          answerMap[a.question_id] = a.answer_value !== null ? a.answer_value : a.answer_text;
        });

        return {
          id: r.id,
          formId: r.form_id,
          timestamp: r.submitted_at,
          answers: answerMap
        };
      });

      return submissions;
    } catch (e) {
      console.error(`Failed to get submissions by form ID from Supabase`, e);
      return [];
    }
  },

  addSubmission: async (submission: FormSubmission): Promise<boolean> => {
    try {
      // Create response record
      const { error: responseError } = await supabase
        .from('responses')
        .insert({
          id: submission.id,
          form_id: submission.formId,
          submitted_at: submission.timestamp
        });

      if (responseError) throw responseError;

      // Create answers
      const answersToInsert = Object.keys(submission.answers).map(questionId => {
        const val = submission.answers[questionId];
        const isComplex = typeof val === 'object' || Array.isArray(val);
        return {
          response_id: submission.id,
          question_id: questionId,
          answer_text: isComplex ? null : String(val),
          answer_value: isComplex ? val : null
        };
      });

      if (answersToInsert.length > 0) {
        const { error: answersError } = await supabase
          .from('answers')
          .insert(answersToInsert);

        if (answersError) throw answersError;
      }

      return true;
    } catch (e) {
      console.error("Failed to add submission to Supabase", e);
      return false;
    }
  },

  getSubmissions: async (fallback: FormSubmission[] = []): Promise<FormSubmission[]> => {
    const userId = getUserId();
    if (!userId) return fallback;
    try {
      const { data: forms } = await supabase.from('forms').select('id').eq('user_id', userId);
      if (!forms || forms.length === 0) return [];

      const formIds = forms.map(f => f.id);
      const { data: responses, error } = await supabase.from('responses').select('*').in('form_id', formIds);
      if (error) throw error;

      if (!responses || responses.length === 0) return fallback;

      const { data: answersData } = await supabase.from('answers').select('*').in('response_id', responses.map(r => r.id));

      const submissions: FormSubmission[] = responses.map(r => {
        const formAnswers = (answersData || []).filter(a => a.response_id === r.id);
        const answerMap: Record<string, any> = {};
        formAnswers.forEach(a => {
          answerMap[a.question_id] = a.answer_value !== null ? a.answer_value : a.answer_text;
        });

        return {
          id: r.id,
          formId: r.form_id,
          timestamp: r.submitted_at,
          answers: answerMap
        };
      });

      return submissions;

    } catch (e) {
      return fallback;
    }
  },

  saveForms: async (forms: FormSchema[]): Promise<boolean> => {
    try {
      for (const form of forms) {
        await storageService.putForm(form);
      }
      return true;
    } catch (e) {
      return false;
    }
  },

  saveSubmissions: async (submissions: FormSubmission[]): Promise<boolean> => {
    try {
      for (const sub of submissions) {
        await storageService.addSubmission(sub);
      }
      return true;
    } catch (e) {
      return false;
    }
  }
};