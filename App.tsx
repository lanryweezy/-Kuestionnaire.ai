import React, { useState, useEffect } from 'react';
import Dashboard from './components/Dashboard';
import FormBuilder from './components/FormBuilder';
import FormPreview from './components/FormPreview';
import MissionControl from './components/MissionControl';
import { FormSchema, ViewState, QuestionType } from './types';
import { generateFormStructure } from './services/geminiService';

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

const STORAGE_KEY = 'kuestionnaire_ai_data';

const App: React.FC = () => {
  const [view, setView] = useState<ViewState>('dashboard');
  
  // Initialize from LocalStorage or fall back to Mocks
  const [forms, setForms] = useState<FormSchema[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : MOCK_FORMS;
    } catch (e) {
      console.error("Failed to load forms", e);
      return MOCK_FORMS;
    }
  });

  const [currentForm, setCurrentForm] = useState<FormSchema>(initialForm);
  const [isLoading, setIsLoading] = useState(false);

  // Router Logic
  useEffect(() => {
    const handleHashChange = () => {
      // Robustly handle hash: remove # and optional leading slash
      const hash = window.location.hash.replace(/^#\/?/, ''); 
      const [route, id] = hash.split('/');

      if (route === 'builder' && id) {
        const form = forms.find(f => f.id === id);
        if (form) {
          setCurrentForm(form);
          setView('builder');
        } else {
          // If ID not found (e.g. after deletion or bad link), go home
          window.location.hash = '';
        }
      } else if (route === 'view' && id) {
        const form = forms.find(f => f.id === id);
        if (form) {
          setCurrentForm(form);
          setView('preview');
        } else {
          window.location.hash = '';
        }
      } else if (route === 'results' && id) {
        const form = forms.find(f => f.id === id);
        if (form) {
          setCurrentForm(form);
          setView('results');
        } else {
          window.location.hash = '';
        }
      } else {
        setView('dashboard');
      }
    };

    // Listen to hash changes
    window.addEventListener('hashchange', handleHashChange);
    
    // Check initial hash on load
    handleHashChange();

    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [forms]); // Dependency on forms ensures we can find the form when loaded

  // Persist forms whenever they change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(forms));
  }, [forms]);

  const handleGenerate = async (prompt: string) => {
    setIsLoading(true);
    try {
      const generated = await generateFormStructure(prompt);
      
      const newId = crypto.randomUUID();
      const newForm: FormSchema = {
        id: newId,
        title: generated.title,
        description: generated.description,
        theme: 'nebula',
        questions: generated.questions.map(q => ({
          id: crypto.randomUUID(),
          label: q.label,
          type: q.type as QuestionType,
          required: q.required,
          options: q.options?.map(opt => ({ id: crypto.randomUUID(), label: opt })) || []
        }))
      };

      setForms(prev => [newForm, ...prev]);
      setCurrentForm(newForm);
      // Navigate to builder
      window.location.hash = `builder/${newId}`;
    } catch (error) {
      console.error("Failed to generate form", error);
      alert("Failed to generate form. Please check your API key or try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleManualCreate = () => {
    const newId = crypto.randomUUID();
    const newForm = { ...initialForm, id: newId };
    setForms(prev => [newForm, ...prev]);
    setCurrentForm(newForm);
    window.location.hash = `builder/${newId}`;
  };

  const handleSelectForm = (form: FormSchema) => {
    window.location.hash = `builder/${form.id}`;
  };

  const handleDeleteForm = (id: string) => {
    if (confirm("Are you sure you want to delete this transmission log?")) {
      setForms(prev => prev.filter(f => f.id !== id));
      if (currentForm.id === id) {
        window.location.hash = '';
      }
    }
  };

  // Update form in the list when modified in builder
  const handleUpdateForm = (updated: FormSchema | ((prev: FormSchema) => FormSchema)) => {
      let newVal: FormSchema;
      if (typeof updated === 'function') {
          newVal = updated(currentForm);
      } else {
          newVal = updated;
      }
      
      setCurrentForm(newVal);
      setForms(prev => prev.map(f => f.id === newVal.id ? newVal : f));
  };

  // Determine if we are in public view mode based on hash
  const isPublicView = window.location.hash.includes('view/');

  return (
    <div className="min-h-screen font-sans text-white">
      {view === 'dashboard' && (
        <Dashboard 
          onGenerate={handleGenerate} 
          isLoading={isLoading} 
          onManualCreate={handleManualCreate}
          recentForms={forms}
          onSelectForm={handleSelectForm}
          onDeleteForm={handleDeleteForm}
        />
      )}

      {view === 'builder' && (
        <FormBuilder 
          form={currentForm} 
          setForm={handleUpdateForm as React.Dispatch<React.SetStateAction<FormSchema>>}
          onPreview={() => setView('preview')} // Instant preview (overlay)
          onResults={() => window.location.hash = `results/${currentForm.id}`}
          onBack={() => window.location.hash = ''}
        />
      )}

      {view === 'preview' && (
        <FormPreview 
          form={currentForm}
          onClose={() => {
            if (isPublicView) {
               // If public, maybe go to a "Create your own" page or just home
               window.location.hash = '';
            } else {
               // If in builder preview, go back to builder
               setView('builder'); 
            }
          }}
          isPublic={isPublicView}
        />
      )}

      {view === 'results' && (
        <MissionControl 
          form={currentForm}
          onBack={() => window.location.hash = `builder/${currentForm.id}`}
        />
      )}
    </div>
  );
};

export default App;