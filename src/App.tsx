import React, { useEffect, lazy, Suspense } from 'react';
import { Routes, Route, useNavigate, useParams } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import Toast from './components/Toast';
import Modal from './components/Modal'; // Import the new Modal component
import { FormSchema, QuestionType } from './types';
import { generateFormStructure } from './services/geminiService';
import { useStore } from './store/useStore';

// Lazy load non-critical components
const FormBuilder = lazy(() => import('./components/FormBuilder'));
const FormPreview = lazy(() => import('./components/FormPreview'));
const ResultsView = lazy(() => import('./components/ResultsView'));


const App: React.FC = () => {
  const navigate = useNavigate();
  const {
    forms,
    currentForm,
    isLoading,
    toasts,
    isPublicView,
    
    setCurrentForm,
    setIsLoading,
    addToast,
    removeToast,
    setIsPublicView,
    openModal, // Import openModal from store
    deleteForm,
    updateForm,
    initializeForms,
  } = useStore();

  useEffect(() => {
    initializeForms();
  }, [initializeForms]);

  // Track if we're in public view mode using URL params
  useEffect(() => {
    // This effect needs to run whenever the URL changes, not just on component mount
    // It will be triggered by react-router-dom rendering
    const path = window.location.pathname;
    setIsPublicView(path.startsWith('/view/'));
  }, [window.location.pathname, setIsPublicView]);


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

      addForm(newForm); // Use store action
      setCurrentForm(newForm);
      addToast('Form generated successfully!', 'success'); // Use store action
      navigate(`/builder/${newId}`); // Use navigate
    } catch (error) {
      console.error("Failed to generate form", error);
      addToast('Failed to generate form. Please try again with a different prompt.', 'error'); // Use store action
    } finally {
      setIsLoading(false);
    }
  };

  const handleManualCreate = () => {
    try {
      const newId = crypto.randomUUID();
      const newForm: FormSchema = { 
        id: newId,
        title: 'Untitled Form',
        description: '',
        questions: [],
        theme: 'nebula'
      };
      addForm(newForm); // Use store action
      setCurrentForm(newForm);
      navigate(`/builder/${newId}`); // Use navigate
    } catch (error) {
      console.error('Error creating blank form:', error);
      addToast('Failed to create blank form. Please try again.', 'error'); // Use store action
    }
  };

  const handleSelectForm = (form: FormSchema) => {
    setCurrentForm(form); // Set current form in store
    navigate(`/builder/${form.id}`); // Use navigate
  };

  const handleDeleteForm = (id: string) => {
    openModal(
      "Are you sure you want to delete this form? This action cannot be undone.",
      () => {
        deleteForm(id); // Use store action
        if (currentForm.id === id) {
          navigate('/'); // Redirect to dashboard if current form is deleted
        }
      }
    );
  };

  // Update form in the list when modified in builder
  const handleUpdateForm = (updated: FormSchema | ((prev: FormSchema) => FormSchema)) => {
      let newVal: FormSchema;
      if (typeof updated === 'function') {
          newVal = updated(currentForm);
      } else {
          newVal = updated;
      }
      
      updateForm(newVal); // Use store action
  };

  // Component to load form data based on URL params
  const FormLoader: React.FC<{ children: React.ReactNode, type: 'builder' | 'preview' | 'results' }> = ({ children, type }) => {
    const { id } = useParams<{ id: string }>();
    useEffect(() => {
      if (id) {
        const form = forms.find(f => f.id === id);
        if (form) {
          setCurrentForm(form);
        } else {
          addToast(`Form with ID ${id} not found.`, 'error');
          navigate('/');
        }
      }
    }, [id, forms, setCurrentForm, addToast, navigate]);

    if (!id || currentForm.id !== id) {
      return <div className="flex items-center justify-center h-screen"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500"></div></div>;
    }

    return <>{children}</>;
  };


  return (
    <div className="min-h-screen bg-black font-sans text-white">
      <Routes>
        <Route path="/" element={
          <Dashboard 
            onGenerate={handleGenerate} 
            isLoading={isLoading} 
            onManualCreate={handleManualCreate}
            recentForms={forms}
            onSelectForm={handleSelectForm}
            onDeleteForm={handleDeleteForm}
          />
        }/>
        <Route path="/builder/:id" element={
          <Suspense fallback={<div className="flex items-center justify-center h-screen"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500"></div></div>}>
            <FormLoader type="builder">
              <FormBuilder 
                onPreview={() => navigate(`/view/${currentForm.id}`)}
                onResults={() => navigate(`/results/${currentForm.id}`)}
                onBack={() => navigate('/')}
              />
            </FormLoader>
          </Suspense>
        }/>
        <Route path="/view/:id" element={
          <Suspense fallback={<div className="flex items-center justify-center h-screen"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500"></div></div>}>
            <FormLoader type="preview">
              <FormPreview 
                onClose={() => {
                  if (isPublicView) {
                    navigate('/'); // If public, maybe go to a "Create your own" page or just home
                  } else {
                    navigate(`/builder/${currentForm.id}`); // If in builder preview, go back to builder
                  }
                }}
              />
            </FormLoader>
          </Suspense>
        }/>
        <Route path="/results/:id" element={
          <Suspense fallback={<div className="flex items-center justify-center h-screen"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500"></div></div>}>
            <FormLoader type="results">
              <ResultsView 
                onBack={() => navigate(`/builder/${currentForm.id}`)}
              />
            </FormLoader>
          </Suspense>
        }/>
        <Route path="*" element={
          <div className="flex items-center justify-center h-screen text-xl text-slate-400">
            404 - Page Not Found
          </div>
        }/>
      </Routes>

      {/* Toast notifications */}
      {toasts.map(toast => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={() => removeToast(toast.id)}
        />
      ))}

      {/* Global Modal Component */}
      <Modal />
    </div>
  );
};

export default App;