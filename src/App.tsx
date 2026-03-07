import React, { useEffect, lazy, Suspense } from 'react';
import { Routes, Route, useNavigate, useParams, useLocation } from 'react-router-dom';
import { Analytics } from '@vercel/analytics/react';
import Dashboard from './components/Dashboard';
import Toast from './components/Toast';
import Modal from './components/Modal';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Login } from './components/Login';
import LandingPage from './components/LandingPage';
import { AuthCallback } from './pages/AuthCallback';
import { FormSchema, QuestionType } from './types';
import { generateFormStructure, FORM_TEMPLATES } from './services/geminiService';
import { storageService } from './services/storageService';
import { useStore } from './store/useStore';
import { useAuthStore } from './store/useAuthStore';

// Lazy load non-critical components
const FormBuilder = lazy(() => import('./components/FormBuilder'));
const FormPreview = lazy(() => import('./components/FormPreview'));
const ResultsView = lazy(() => import('./components/ResultsView'));


const App: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isLoading: authLoading, checkAuth } = useAuthStore();
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
    openModal,
    deleteForm,
    updateForm,
    addForm,
    initializeForms,
  } = useStore();

  // Initialize auth state on app load
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    initializeForms();
  }, [initializeForms]);

  // Track if we're in public view mode using URL params
  useEffect(() => {
    setIsPublicView(location.pathname.startsWith('/view/'));
  }, [location.pathname, setIsPublicView]);


  const handleGenerate = async (prompt: string) => {
    setIsLoading(true);
    try {
      const generated = await generateFormStructure(prompt);

      const newId = crypto.randomUUID();
      const newForm: FormSchema = {
        id: newId,
        title: generated.title || 'Untitled Form',
        description: generated.description || '',
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

  const handleSelectTemplate = (templateId: string) => {
    const template = FORM_TEMPLATES[templateId as keyof typeof FORM_TEMPLATES];
    if (!template) return;

    const newId = crypto.randomUUID();
    const newForm: FormSchema = {
      id: newId,
      title: template.title,
      description: template.description,
      theme: 'nebula',
      questions: template.questions.map((q: any) => ({
        id: crypto.randomUUID(),
        label: q.label,
        type: q.type as QuestionType,
        required: q.required,
        options: q.options?.map((opt: string) => ({ id: crypto.randomUUID(), label: opt })) || []
      }))
    };

    addForm(newForm);
    setCurrentForm(newForm);
    addToast('Template loaded successfully!', 'success');
    navigate(`/builder/${newId}`);
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
    const currentFormId = useStore(state => state.currentForm.id);
    const forms = useStore(state => state.forms);
    const setCurrentForm = useStore(state => state.setCurrentForm);
    const addToast = useStore(state => state.addToast);

    const [isFetching, setIsFetching] = React.useState(false);

    useEffect(() => {
      const loadForm = async () => {
        if (id && currentFormId !== id) {
          const form = forms.find(f => f.id === id);
          if (form) {
            setCurrentForm(form);
          } else {
            // If not in local list, try to fetch directly (for distribution links)
            setIsFetching(true);
            const fetchedForm = await storageService.getFormById(id);
            if (fetchedForm) {
              setCurrentForm(fetchedForm);
            } else if (forms.length > 0 || !authLoading) {
              addToast(`Form with ID ${id} not found.`, 'error');
              navigate('/');
            }
            setIsFetching(false);
          }
        }
      };
      loadForm();
    }, [id, currentFormId, forms, setCurrentForm, addToast, navigate, authLoading]);

    if (!id || isFetching || (currentFormId !== id)) {
      return <div className="flex items-center justify-center h-screen"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500"></div></div>;
    }

    return <>{children}</>;
  };


  return (
    <div className="min-h-screen bg-black font-sans text-white">
      <Routes>
        <Route path="/auth/callback" element={
          <AuthCallback />
        } />
        <Route path="/" element={
          authLoading ? (
            <div className="flex items-center justify-center h-screen">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500"></div>
            </div>
          ) : !user ? (
            <LandingPage />
          ) : (
            <ErrorBoundary>
              <Dashboard
                onGenerate={handleGenerate}
                onManualCreate={handleManualCreate}
                onSelectForm={handleSelectForm}
                onSelectTemplate={handleSelectTemplate}
              />
            </ErrorBoundary>
          )
        } />
        <Route path="/builder/:id" element={
          <ErrorBoundary>
            <Suspense fallback={<div className="flex items-center justify-center h-screen"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500"></div></div>}>
              <FormLoader type="builder">
                <FormBuilder
                  onPreview={() => navigate(`/view/${currentForm.id}`)}
                  onResults={() => navigate(`/results/${currentForm.id}`)}
                  onBack={() => navigate('/')}
                />
              </FormLoader>
            </Suspense>
          </ErrorBoundary>
        } />
        <Route path="/view/:id" element={
          <ErrorBoundary>
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
          </ErrorBoundary>
        } />
        <Route path="/results/:id" element={
          <ErrorBoundary>
            <Suspense fallback={<div className="flex items-center justify-center h-screen"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500"></div></div>}>
              <FormLoader type="results">
                <ResultsView
                  onBack={() => navigate(`/builder/${currentForm.id}`)}
                />
              </FormLoader>
            </Suspense>
          </ErrorBoundary>
        } />
        <Route path="*" element={
          <div className="flex items-center justify-center h-screen text-xl text-slate-400">
            404 - Page Not Found
          </div>
        } />
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
      <Analytics />
    </div>
  );
};

export default App;