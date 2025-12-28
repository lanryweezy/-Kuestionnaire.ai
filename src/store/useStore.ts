import { create } from 'zustand';
import { FormSchema, ViewState, QuestionType, FormSubmission } from '../types';
import { storageService } from '../services/storageService';

// Mock Data for "Old Forms" - Used as fallback if storage is empty
const MOCK_FORMS: FormSchema[] = [
  {
    id: 'f-alpha-9',
    title: 'Off-World Colonization App',
    description: 'Application form for the Mars 2050 terraforming initiative. Medical clearance required.',
    theme: 'nebula',
    questions: [
      { id: 'q1', type: QuestionType.SHORT_TEXT, label: 'Candidate Name', required: true },
      { id: 'q2', type: QuestionType.DROPDOWN, label: 'Sector of Origin', required: true, options: [{id:'o1', label:'Earth'}, {id:'o2', label:'Luna'}, {id:'o3', label:'Belt'}] },
      { id: 'q3', type: QuestionType.RATING, label: 'G-Force Tolerance', required: false, maxRating: 5, ratingIcon: 'zap' }
    ]
  },
  {
    id: 'f-beta-2',
    title: 'Cybernetics Feedback',
    description: 'Post-surgery satisfaction survey for neural link implants.',
    theme: 'cyberpunk',
    questions: [
      { id: 'q1', type: QuestionType.RATING, label: 'Integration Comfort', required: true, maxRating: 5, ratingIcon: 'heart' },
      { id: 'q2', type: QuestionType.LONG_TEXT, label: 'Report Synaptic Glitches', required: false }
    ]
  },
  {
    id: 'f-gamma-7',
    title: 'Midnight Ops Report',
    description: 'Daily status report for shadow operatives.',
    theme: 'midnight',
    questions: [
        { id: 'q1', type: QuestionType.DATE, label: 'Mission Date', required: true, includeTime: true },
        { id: 'q2', type: QuestionType.CHECKBOXES, label: 'Objectives Complete', required: true, options: [{id:'o1', label:'Infiltration'}, {id:'o2', label:'Data Retrieval'}, {id:'o3', label:'Extraction'}] }
    ]
  }
];

const initialForm: FormSchema = {
  id: 'new',
  title: 'Untitled Form',
  description: '',
  questions: [],
  theme: 'nebula'
};

interface ToastMessage {
  id: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
}

interface AppState {
  forms: FormSchema[];
  currentForm: FormSchema;
  isLoading: boolean;
  toasts: ToastMessage[];
  view: ViewState;
  isPublicView: boolean;
  modal: {
    isOpen: boolean;
    message: string;
    onConfirm: () => void;
    onCancel?: () => void;
  };
  
  setForms: (forms: FormSchema[]) => void;
  setCurrentForm: (form: FormSchema) => void;
  setIsLoading: (loading: boolean) => void;
  addToast: (message: string, type: ToastMessage['type']) => void;
  removeToast: (id: string) => void;
  setView: (view: ViewState) => void;
  setIsPublicView: (isPublic: boolean) => void;
  openModal: (message: string, onConfirm: () => void, onCancel?: () => void) => void;
  closeModal: () => void;
  
  // Actions that interact with forms
  addForm: (form: FormSchema) => void;
  deleteForm: (id: string) => void;
  updateForm: (updatedForm: FormSchema) => void;
  
  // Initializer
  initializeForms: () => void;
}

export const useStore = create<AppState>((set, get) => ({
  forms: [],
  currentForm: initialForm,
  isLoading: false,
  toasts: [],
  view: 'dashboard',
  isPublicView: false,
  modal: {
    isOpen: false,
    message: '',
    onConfirm: () => {},
    onCancel: () => {},
  },

  setForms: (forms) => set({ forms }),
  setCurrentForm: (form) => set({ currentForm: form }),
  setIsLoading: (loading) => set({ isLoading: loading }),
  setView: (view) => set({ view }),
  setIsPublicView: (isPublic) => set({ isPublicView: isPublic }),

  addToast: (message, type) => {
    const id = crypto.randomUUID();
    set((state) => ({
      toasts: [...state.toasts, { id, message, type }],
    }));
  },
  removeToast: (id) => {
    set((state) => ({
      toasts: state.toasts.filter((toast) => toast.id !== id),
    }));
  },
    
  addForm: async (form) => {
    const newForms = [form, ...get().forms]; // Get current forms and add new one
    set({ forms: newForms }); // Update state synchronously
    await storageService.saveForms(newForms); // Persist asynchronously
  },

  deleteForm: async (id) => {
    const newForms = get().forms.filter((f) => f.id !== id);
    set({ forms: newForms }); // Update state synchronously
    await storageService.saveForms(newForms); // Persist asynchronously
    
    let newCurrentForm = get().currentForm;
    if (get().currentForm.id === id) {
        newCurrentForm = initialForm;
        // Optionally redirect to dashboard if the deleted form was the current one
        get().setView('dashboard'); 
    }

    get().addToast('Form deleted successfully', 'success');
    set({ currentForm: newCurrentForm });
  },

  updateForm: async (updatedForm) => {
    const newForms = get().forms.map((f) =>
        f.id === updatedForm.id ? updatedForm : f
    );
    set({ forms: newForms, currentForm: updatedForm }); // Update state synchronously
    await storageService.saveForms(newForms); // Persist asynchronously
  },
    
  initializeForms: async () => {
    const storedForms = await storageService.getForms(MOCK_FORMS);
    set({ forms: storedForms });
  },

  openModal: (message, onConfirm, onCancel) => set({
    modal: {
      isOpen: true,
      message,
      onConfirm,
      onCancel: onCancel || (() => get().closeModal()), // Default cancel action
    },
  }),
  closeModal: () => set({
    modal: {
      isOpen: false,
      message: '',
      onConfirm: () => {},
      onCancel: () => {},
    },
  }),
}));

