import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Question, QuestionType } from '../types';
import { ICONS } from '../constants';
import { generateNextQuestion } from '../services/geminiService';
import { getThemeStyles } from '../utils/themeUtils';

import { useStore } from '../store/useStore';
import QuestionListSidebar from './builder/QuestionListSidebar';
import QuestionEditor from './builder/QuestionEditor';
import ThemeSidebar from './builder/ThemeSidebar';
import debounce from 'lodash.debounce';

interface FormBuilderProps {
  onPreview: () => void;
  onResults: () => void;
  onBack: () => void;
}

const FormBuilder: React.FC<FormBuilderProps> = ({ onPreview, onResults, onBack }) => {
  const { currentForm: form, updateForm, addToast } = useStore();
  const updateQuestion = useCallback((id: string, updates: Partial<Question>) => {
    const currentFormState = useStore.getState().currentForm;
    updateForm({
      ...currentFormState,
      questions: currentFormState.questions.map(q => q.id === id ? { ...q, ...updates } : q)
    });
  }, [updateForm]);
  const [activeQuestionId, setActiveQuestionId] = useState<string | null>(null);
  const [isDesignOpen, setIsDesignOpen] = useState(false);
  const [isPublishOpen, setIsPublishOpen] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);
  const [assistantMessage, setAssistantMessage] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isGeneratingNext, setIsGeneratingNext] = useState(false);

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Local state for debounced inputs
  const [localTitle, setLocalTitle] = useState(form.title);
  const [localDescription, setLocalDescription] = useState(form.description);
  const [localThankYouTitle, setLocalThankYouTitle] = useState(form.thankYouTitle || 'Transmission Complete');
  const [localThankYouMessage, setLocalThankYouMessage] = useState(form.thankYouMessage || 'Data successfully encrypted and stored.');

  // Keep track of which fields are currently focused by the user
  const focusedFields = useRef<Set<string>>(new Set());

  // Sync local state from global state ONLY when the user is NOT actively typing in that field.
  // This allows external updates (like AI generation) to reflect instantly without clobbering user typing.
  useEffect(() => {
    if (!focusedFields.current.has('title')) setLocalTitle(form.title);
    if (!focusedFields.current.has('description')) setLocalDescription(form.description);
    if (!focusedFields.current.has('thankYouTitle')) setLocalThankYouTitle(form.thankYouTitle || 'Transmission Complete');
    if (!focusedFields.current.has('thankYouMessage')) setLocalThankYouMessage(form.thankYouMessage || 'Data successfully encrypted and stored.');
  }, [form.title, form.description, form.thankYouTitle, form.thankYouMessage]);

  const pendingUpdates = useRef<Partial<import('../types').FormSchema>>({});

  // Use refs to access latest updateForm safely inside debounce without recreating it
  const updateFormRef = useRef(updateForm);
  useEffect(() => {
    updateFormRef.current = updateForm;
  }, [updateForm]);

  const debouncedUpdate = useMemo(() => debounce(() => {
    if (Object.keys(pendingUpdates.current).length > 0) {
      const currentFormState = useStore.getState().currentForm;
      updateFormRef.current({ ...currentFormState, ...pendingUpdates.current });
      pendingUpdates.current = {};
    }
  }, 300), []);

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      debouncedUpdate.flush(); // Flush instead of cancel to ensure last keystrokes are saved
    };
  }, [debouncedUpdate]);

  const createDebouncedHandler = useCallback((key: keyof import('../types').FormSchema, setLocal: React.Dispatch<React.SetStateAction<string>>) => {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setLocal(e.target.value);
      pendingUpdates.current = { ...pendingUpdates.current, [key]: e.target.value };
      debouncedUpdate();
    };
  }, [debouncedUpdate]);

  const handleFocus = useCallback((key: string) => {
    focusedFields.current.add(key);
  }, []);

  const handleBlur = useCallback((key: string) => {
    focusedFields.current.delete(key);
    // Ensure any final pending updates are flushed immediately on blur
    debouncedUpdate.flush();
  }, [debouncedUpdate]);

  // Set active question when form loads or changes
  useEffect(() => {
    if (form.questions.length > 0 && !activeQuestionId) {
      setActiveQuestionId(form.questions[0].id);
    } else if (form.questions.length === 0) {
      setActiveQuestionId(null);
    }
  }, [form.questions, activeQuestionId]);

  const themeStyles = useMemo(() => getThemeStyles(form.theme), [form.theme]);


  // Memoized computed values


  const activeQuestion = useMemo(() =>
    form.questions.find(q => q.id === activeQuestionId),
    [form.questions, activeQuestionId]
  );

  // Derived data for logic jump options so QuestionEditor can be purely memoized
  const logicJumpOptions = useMemo(() => {
    return form.questions.map((q, idx) => ({
      id: q.id,
      label: `${idx + 1}. ${q.label.substring(0, 20)}...`
    }));
  }, [form.questions]);

  const renderThemeBackground = () => {
    const common = "absolute inset-0 -z-20 bg-[#050508] transition-colors duration-700";
    switch (form.theme) {
      case 'midnight':
        return (
          <>
            <div className={common}></div>
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:50px_50px] -z-10 opacity-30 pointer-events-none"></div>
          </>
        );
      case 'cyberpunk':
        return (
          <>
            <div className="absolute inset-0 bg-black -z-20"></div>
            <div className="absolute inset-0 bg-gradient-to-t from-yellow-900/10 to-transparent -z-10 pointer-events-none"></div>
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay pointer-events-none"></div>
          </>
        );
      case 'sunset':
        return (
          <>
            <div className="absolute inset-0 bg-[#0f0505] -z-20"></div>
            <div className="absolute inset-0 bg-gradient-to-br from-orange-900/20 via-red-950/20 to-black -z-10 pointer-events-none"></div>
          </>
        );
      case 'nebula':
      default:
        return (
          <>
            <div className={common}></div>
            <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-purple-600/10 rounded-full mix-blend-screen filter blur-[100px] animate-pulse-slow pointer-events-none"></div>
            <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-cyan-600/10 rounded-full mix-blend-screen filter blur-[100px] animate-pulse-slow pointer-events-none"></div>
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay pointer-events-none"></div>
          </>
        );
    }
  };

  // Memoized event handlers
  // Bolt Optimization: We use useStore.getState() inside these callbacks instead of adding 'form'
  // to the dependency array. This keeps the callback references stable, preventing unnecessary
  // re-renders of heavy child components like QuestionEditor when the form state updates.
  const addQuestion = useCallback((questionType: QuestionType = QuestionType.SHORT_TEXT) => {
    const currentForm = useStore.getState().currentForm;
    const newQuestion: Question = {
      id: crypto.randomUUID(),
      type: questionType,
      label: 'New Question',
      required: false,
      options: [],
    };
    updateForm({ ...currentForm, questions: [...currentForm.questions, newQuestion] });
    setActiveQuestionId(newQuestion.id);
  }, [updateForm]);

  const handleSuggestQuestion = useCallback(async () => {
    setIsGeneratingNext(true);
    const currentForm = useStore.getState().currentForm;
    try {
      const suggestion = await generateNextQuestion(currentForm);

      const newQuestion: Question = {
        id: crypto.randomUUID(),
        label: suggestion.label,
        type: suggestion.type as QuestionType,
        required: suggestion.required !== undefined ? suggestion.required : false,
        options: suggestion.options?.map((opt: string) => ({ id: crypto.randomUUID(), label: opt })) || []
      };

      // Since the request is async, we should fetch the latest form state again before updating
      const latestForm = useStore.getState().currentForm;
      const updatedForm = {
        ...latestForm,
        questions: [...latestForm.questions, newQuestion]
      };

      updateForm(updatedForm);
      setActiveQuestionId(newQuestion.id);
      addToast('AI added a new question!', 'success');
    } catch (error) {
      console.error("Failed to suggest question:", error);
      addToast('Failed to generate a question.', 'error');
    } finally {
      setIsGeneratingNext(false);
    }
  }, [updateForm, addToast]);

  const removeQuestion = useCallback((id: string) => {
    const currentForm = useStore.getState().currentForm;
    updateForm({ ...currentForm, questions: currentForm.questions.filter(q => q.id !== id) });
    setActiveQuestionId(prev => prev === id ? null : prev);
  }, [updateForm]);

  const duplicateQuestion = useCallback((id: string) => {
    const currentForm = useStore.getState().currentForm;
    const questionToDuplicate = currentForm.questions.find(q => q.id === id);
    if (!questionToDuplicate) return;

    const newQuestion: Question = {
      ...questionToDuplicate,
      id: crypto.randomUUID(),
      label: `${questionToDuplicate.label} (Copy)`,
      options: questionToDuplicate.options?.map(o => ({ ...o, id: crypto.randomUUID() })),
      logic: []
    };

    const index = currentForm.questions.findIndex(q => q.id === id);
    const newQuestions = [...currentForm.questions];
    newQuestions.splice(index + 1, 0, newQuestion);
    updateForm({ ...currentForm, questions: newQuestions });
    setActiveQuestionId(newQuestion.id);
  }, [updateForm]);

  const moveQuestion = useCallback((index: number, direction: 'up' | 'down') => {
    const currentForm = useStore.getState().currentForm;
    const newQuestions = [...currentForm.questions];
    if (direction === 'up' && index > 0) {
      [newQuestions[index], newQuestions[index - 1]] = [newQuestions[index - 1], newQuestions[index]];
    } else if (direction === 'down' && index < newQuestions.length - 1) {
      [newQuestions[index], newQuestions[index + 1]] = [newQuestions[index + 1], newQuestions[index]];
    }
    updateForm({ ...currentForm, questions: newQuestions });
  }, [updateForm]);

  const moveQuestionByIndex = useCallback((fromIndex: number, toIndex: number) => {
    const currentForm = useStore.getState().currentForm;
    const newQuestions = [...currentForm.questions];
    const item = newQuestions[fromIndex];
    newQuestions.splice(fromIndex, 1);
    newQuestions.splice(toIndex, 0, item);
    updateForm({ ...currentForm, questions: newQuestions });
  }, [updateForm]);






  const updateFormTitle = useMemo(() => createDebouncedHandler('title', setLocalTitle), [createDebouncedHandler]);
  const updateFormDescription = useMemo(() => createDebouncedHandler('description', setLocalDescription), [createDebouncedHandler]);
  const updateThankYouTitle = useMemo(() => createDebouncedHandler('thankYouTitle', setLocalThankYouTitle), [createDebouncedHandler]);
  const updateThankYouMessage = useMemo(() => createDebouncedHandler('thankYouMessage', setLocalThankYouMessage), [createDebouncedHandler]);

  const handleCopyLink = () => {
    const link = `${window.location.origin}/view/${form.id}`;
    navigator.clipboard.writeText(link);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  // Template functions
  const applyTemplate = useCallback(async (templateType: string) => {
    const currentForm = useStore.getState().currentForm;
    setIsProcessing(true);
    try {
      setAssistantMessage('Applying template...');

      const { generateFormStructure } = await import('../services/geminiService');

      // Map template type to a descriptive prompt
      const templatePrompts: Record<string, string> = {
        survey: 'Create a customer satisfaction survey',
        feedback: 'Create a product feedback form',
        registration: 'Create an event registration form',
        contact: 'Create a contact us form',
        jobApplication: 'Create a job application form',
        eventFeedback: 'Create an event feedback form',
        productReview: 'Create a product review form',
        customerOnboarding: 'Create a customer onboarding form',
      };

      const prompt = templatePrompts[templateType] || `Create a ${templateType.replace(/([A-Z])/g, ' $1').trim()} form`;
      const generatedForm = await generateFormStructure(prompt);

      // Convert generated questions to our format
      const convertedQuestions = generatedForm.questions.map(q => ({
        id: crypto.randomUUID(),
        type: Object.values(QuestionType).includes(q.type as QuestionType) ? q.type as QuestionType : QuestionType.SHORT_TEXT,
        label: q.label,
        required: q.required,
        options: q.options ? q.options.map(opt => ({ id: crypto.randomUUID(), label: opt })) : [],
        maxRating: q.type === QuestionType.RATING ? 5 : undefined,
        ratingIcon: q.type === QuestionType.RATING ? 'star' as 'star' | 'heart' | 'zap' : undefined
      }));

      updateForm({
        ...currentForm,
        title: generatedForm.title,
        description: generatedForm.description,
        questions: convertedQuestions
      });

      if (convertedQuestions.length > 0) {
        setActiveQuestionId(convertedQuestions[0].id);
      }

      setAssistantMessage('Template applied successfully!');
      addToast('Template applied successfully!', 'success');
    } catch (error) {
      console.error('Error applying template:', error);
      setAssistantMessage('Sorry, I encountered an error applying the template.');
      addToast('Error applying template. Please try again.', 'error');
    } finally {
      setIsProcessing(false);
    }
  }, [updateForm, addToast]);

  // Agentic AI Assistant functions
  const generateSmartForm = useCallback(async () => {
    const currentForm = useStore.getState().currentForm;
    setIsProcessing(true);
    try {
      setAssistantMessage('Analyzing your form requirements...');

      // Use the gemini service to generate a smart form based on the title and description
      if (currentForm.title.trim() || currentForm.description.trim()) {
        setAssistantMessage('Generating form based on your requirements...');

        // Import the gemini service function
        const { generateFormStructure } = await import('../services/geminiService');

        const prompt = `${currentForm.title} ${currentForm.description}`.trim();
        const generatedForm = await generateFormStructure(prompt);

        // Convert generated questions to our format
        const convertedQuestions = generatedForm.questions.map(q => ({
          id: crypto.randomUUID(),
          type: Object.values(QuestionType).includes(q.type as QuestionType) ? q.type as QuestionType : QuestionType.SHORT_TEXT,
          label: q.label,
          required: q.required,
          options: q.options ? q.options.map(opt => ({ id: crypto.randomUUID(), label: opt })) : [],
          maxRating: q.type === QuestionType.RATING ? 5 : undefined,
          ratingIcon: q.type === QuestionType.RATING ? 'star' as 'star' | 'heart' | 'zap' : undefined
        }));

        updateForm({
          ...currentForm,
          title: generatedForm.title,
          description: generatedForm.description,
          questions: convertedQuestions
        });

        if (convertedQuestions.length > 0) {
          setActiveQuestionId(convertedQuestions[0].id);
        }

        setAssistantMessage('AI-generated form created! You can customize these questions as needed.');
        addToast('AI-generated form created successfully!', 'success');
      } else {
        setAssistantMessage('Creating a sample form structure based on your title...');
        // Create a sample form based on the title
        const sampleQuestions = [
          {
            id: crypto.randomUUID(),
            type: QuestionType.SHORT_TEXT,
            label: `What is your name?`,
            required: true,
            options: []
          },
          {
            id: crypto.randomUUID(),
            type: QuestionType.SHORT_TEXT,
            label: `What is your email address?`,
            required: true,
            options: []
          },
          {
            id: crypto.randomUUID(),
            type: QuestionType.LONG_TEXT,
            label: `Tell us more about your interest in ${currentForm.title}`,
            required: false,
            options: []
          }
        ];

        updateForm({ ...currentForm, questions: sampleQuestions });
        setActiveQuestionId(sampleQuestions[0].id);
        setAssistantMessage('Sample form created! You can customize these questions or add more.');
        addToast('Smart form created successfully!', 'success');
      }
    } catch (error) {
      console.error('Error in AI assistant:', error);
      setAssistantMessage('Sorry, I encountered an error generating the form. Using sample form instead.');

      // Fallback to sample form
      const sampleQuestions = [
        {
          id: crypto.randomUUID(),
          type: QuestionType.SHORT_TEXT,
          label: `What is your name?`,
          required: true,
          options: []
        },
        {
          id: crypto.randomUUID(),
          type: QuestionType.SHORT_TEXT,
          label: `What is your email address?`,
          required: true,
          options: []
        },
        {
          id: crypto.randomUUID(),
          type: QuestionType.LONG_TEXT,
          label: `Tell us more about your interest in ${currentForm.title}`,
          required: false,
          options: []
        }
      ];

      updateForm({ ...currentForm, questions: sampleQuestions });
      setActiveQuestionId(sampleQuestions[0].id);
      addToast('Sample form created as fallback.', 'info');
    } finally {
      setIsProcessing(false);
    }
  }, [updateForm, addToast]);

  const suggestRelatedQuestions = useCallback(async () => {
    const currentForm = useStore.getState().currentForm;
    setIsProcessing(true);
    try {
      setAssistantMessage('Generating related questions based on your form...');

      // Use the gemini service to generate related questions
      const { generateFormStructure } = await import('../services/geminiService');

      // Create a prompt based on current form to generate related questions
      const currentQuestions = currentForm.questions.map(q => q.label).join(', ');
      const prompt = `Add 2-3 related questions to this form: ${currentForm.title}. Current questions: ${currentQuestions}. Description: ${currentForm.description}`;

      const generatedForm = await generateFormStructure(prompt);

      // Convert generated questions to our format
      const convertedQuestions = generatedForm.questions.map(q => ({
        id: crypto.randomUUID(),
        type: Object.values(QuestionType).includes(q.type as QuestionType) ? q.type as QuestionType : QuestionType.SHORT_TEXT,
        label: q.label,
        required: q.required,
        options: q.options ? q.options.map(opt => ({ id: crypto.randomUUID(), label: opt })) : [],
        maxRating: q.type === QuestionType.RATING ? 5 : undefined,
        ratingIcon: q.type === QuestionType.RATING ? 'star' as 'star' | 'heart' | 'zap' : undefined
      }));

      // Add the suggested questions to the form
      const updatedQuestions = [...currentForm.questions, ...convertedQuestions];
      updateForm({ ...currentForm, questions: updatedQuestions });

      if (convertedQuestions.length > 0) {
        setActiveQuestionId(convertedQuestions[0].id);
      }

      setAssistantMessage('AI-suggested questions added to your form!');
      addToast('Suggested questions added successfully!', 'success');
    } catch (error) {
      console.error('Error suggesting questions:', error);

      // Fallback to simple heuristic
      setAssistantMessage('Using simple suggestions as fallback...');

      // Simple heuristic to suggest related questions based on form title/description
      const titleLower = currentForm.title.toLowerCase();
      const descLower = currentForm.description.toLowerCase();

      let suggestedQuestions = [];

      if (titleLower.includes('survey') || descLower.includes('feedback')) {
        suggestedQuestions = [
          {
            id: crypto.randomUUID(),
            type: QuestionType.RATING,
            label: 'Overall, how satisfied are you?',
            required: false,
            maxRating: 5,
            ratingIcon: 'star' as 'star' | 'heart' | 'zap'
          },
          {
            id: crypto.randomUUID(),
            type: QuestionType.LONG_TEXT,
            label: 'What can we improve?',
            required: false
          }
        ];
      } else if (titleLower.includes('registration') || descLower.includes('sign up')) {
        suggestedQuestions = [
          {
            id: crypto.randomUUID(),
            type: QuestionType.SHORT_TEXT,
            label: 'Phone number',
            required: false
          },
          {
            id: crypto.randomUUID(),
            type: QuestionType.DROPDOWN,
            label: 'How did you hear about us?',
            required: false,
            options: [
              { id: crypto.randomUUID(), label: 'Social Media' },
              { id: crypto.randomUUID(), label: 'Friend Referral' },
              { id: crypto.randomUUID(), label: 'Advertisement' },
              { id: crypto.randomUUID(), label: 'Other' }
            ]
          }
        ];
      } else {
        // Generic suggestions
        suggestedQuestions = [
          {
            id: crypto.randomUUID(),
            type: QuestionType.SHORT_TEXT,
            label: 'Any additional comments?',
            required: false
          }
        ];
      }

      // Add the suggested questions to the form
      const updatedQuestions = [...currentForm.questions, ...suggestedQuestions];
      updateForm({ ...currentForm, questions: updatedQuestions });
      setActiveQuestionId(suggestedQuestions[0].id);

      addToast('Suggested questions added as fallback.', 'info');
    } finally {
      setIsProcessing(false);
    }
  }, [updateForm, addToast]);

  const autoFormatQuestions = useCallback(async () => {
    const currentForm = useStore.getState().currentForm;
    setIsProcessing(true);
    try {
      setAssistantMessage('Improving question clarity and formatting...');

      // Process each question to improve clarity
      const improvedQuestions = currentForm.questions.map(q => {
        let updatedLabel = q.label;

        // Improve question formatting
        if (!q.label.endsWith('?') && !q.label.endsWith('.') && q.type !== QuestionType.SECTION) {
          if (q.type === QuestionType.SHORT_TEXT || q.type === QuestionType.LONG_TEXT) {
            updatedLabel = q.label + '?';
          }
        }

        // Capitalize first letter
        updatedLabel = updatedLabel.charAt(0).toUpperCase() + updatedLabel.slice(1);

        return { ...q, label: updatedLabel };
      });

      updateForm({ ...currentForm, questions: improvedQuestions });
      setAssistantMessage('Questions formatted for better clarity!');
      addToast('Questions formatted successfully!', 'success');
    } catch (error) {
      console.error('Error formatting questions:', error);
      setAssistantMessage('Sorry, I encountered an error formatting questions.');
      addToast('Error formatting questions. Please try again.', 'error');
    } finally {
      setIsProcessing(false);
    }
  }, [updateForm, addToast]);

  return (
    <div className="min-h-screen flex flex-col text-white relative overflow-hidden transition-colors duration-500">
      {renderThemeBackground()}

      {/* Header */}
      <header className="h-16 border-b border-white/5 flex items-center justify-between px-4 md:px-6 bg-dark-900/50 backdrop-blur-md sticky top-0 z-40">
        <div className="flex items-center gap-2 md:gap-4">
          <button onClick={onBack} className="p-2 hover:bg-white/5 rounded-full text-slate-400 hover:text-white transition">
            <ICONS.ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex flex-col">
            <span className="text-[8px] md:text-[10px] font-mono text-cyan-500 leading-none">KUESTIONNAIRE</span>
            <span className="text-[6px] md:text-[8px] text-slate-600 leading-none font-bold tracking-wider">AI BUILDER</span>
          </div>
          <div className="h-6 md:h-8 w-px bg-white/10 hidden md:block"></div>
          <input
            value={localTitle}
            onChange={updateFormTitle}
            onFocus={() => handleFocus('title')}
            onBlur={() => handleBlur('title')}
            className={`bg-transparent text-base md:text-lg font-bold font-display text-white focus:outline-none focus:border-b ${themeStyles.border} w-32 md:w-64 lg:w-96 placeholder-white/20`}
            placeholder="Form Title"
          />
        </div>

        <div className="absolute left-1/2 -translate-x-1/2 flex items-center bg-black/40 rounded-lg p-1 border border-white/10 hidden md:flex">
          <button className="px-3 md:px-4 py-1.5 rounded-md bg-white/10 text-white text-[10px] md:text-xs font-bold uppercase tracking-wider">Build</button>
          <button onClick={onResults} className="px-3 md:px-4 py-1.5 rounded-md text-slate-400 hover:text-white text-[10px] md:text-xs font-bold uppercase tracking-wider transition">Results</button>
        </div>

        <div className="flex items-center gap-2 md:gap-3">
          <button
            onClick={() => setIsAssistantOpen(!isAssistantOpen)}
            className={`p-1.5 md:p-2 rounded-lg transition ${isAssistantOpen ? `${themeStyles.bgTranslucent} ${themeStyles.accent}` : 'hover:bg-white/10 text-slate-400'}`}
            title="AI Assistant"
          >
            <ICONS.Bot className="w-4 md:w-5 h-4 md:h-5" />
          </button>
          <button
            onClick={handleCopyLink}
            className={`p-1.5 md:p-2 rounded-lg transition ${isCopied ? 'bg-green-500/20 text-green-400' : 'hover:bg-white/10 text-slate-400'}`}
            title={isCopied ? "Link copied!" : "Copy form link"}
          >
            {isCopied ? <ICONS.Check className="w-4 md:w-5 h-4 md:h-5" /> : <ICONS.Link className="w-4 md:w-5 h-4 md:h-5" />}
          </button>
          <button onClick={() => setIsDesignOpen(!isDesignOpen)} className={`p-1.5 md:p-2 rounded-lg transition ${isDesignOpen ? `${themeStyles.bgTranslucent} ${themeStyles.accent}` : 'hover:bg-white/10 text-slate-400'}`} title="Theme & Design">
            <ICONS.Palette className="w-4 md:w-5 h-4 md:h-5" />
          </button>
          <div className="h-4 md:h-6 w-px bg-white/10 mx-1"></div>
          <button onClick={onPreview} className="flex items-center gap-1 md:gap-2 px-2 md:px-4 py-1.5 md:py-2 rounded-lg bg-white/5 hover:bg-white/10 transition text-xs md:text-sm font-medium border border-white/10 backdrop-blur">
            <ICONS.Eye className="w-3 md:w-4 h-3 md:h-4" />
            <span className="hidden sm:inline">Preview</span>
          </button>
          <button onClick={() => setIsPublishOpen(true)} className={`flex items-center gap-1 md:gap-2 px-2 md:px-4 py-1.5 md:py-2 rounded-lg bg-gradient-to-r ${themeStyles.gradient} hover:opacity-90 transition text-xs md:text-sm font-medium ${themeStyles.shadow}`}>
            <ICONS.Share className="w-3 md:w-4 h-3 md:h-4" />
            <span className="hidden sm:inline">Publish</span>
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden relative">
        <QuestionListSidebar
          form={form}
          addQuestion={addQuestion}
          moveQuestion={moveQuestionByIndex}
          activeQuestionId={activeQuestionId}
          onSetActiveQuestion={setActiveQuestionId}
          isSidebarOpen={isSidebarOpen}
          setIsSidebarOpen={setIsSidebarOpen}
          onSuggestQuestion={handleSuggestQuestion}
          isGeneratingNext={isGeneratingNext}
        />

        {/* Main Editor */}
        <main className="flex-1 overflow-y-auto p-4 md:p-10 relative">
          <div className="max-w-3xl mx-auto space-y-8 pb-20">
            <div className="p-6 rounded-2xl glass-panel relative overflow-hidden group">
              <label className="block text-[10px] font-bold text-slate-500 mb-2 uppercase tracking-widest font-display">FORM CONTEXT</label>
              <textarea
                value={localDescription}
                onChange={updateFormDescription}
                onFocus={() => handleFocus('description')}
                onBlur={() => handleBlur('description')}
                className="w-full bg-transparent border-none p-0 text-slate-300 focus:ring-0 resize-none h-20 placeholder-slate-600 text-lg"
                placeholder="Describe the purpose of this data collection..."
              />
            </div>

            {activeQuestionId && activeQuestion && (
              <QuestionEditor
                question={activeQuestion}
                logicJumpOptions={logicJumpOptions}
                updateQuestion={updateQuestion}
                addOption={addOption}
                updateOption={updateOption}
                removeOption={removeOption}
                themeStyles={themeStyles}
                theme={form.theme}
                updateQuestion={updateQuestion}
                addToast={addToast}
                onRemoveQuestion={removeQuestion}
                onDuplicateQuestion={duplicateQuestion}
                onMoveQuestion={moveQuestion}
                questionIndex={form.questions.findIndex(q => q.id === activeQuestionId)}
                totalQuestions={form.questions.length}
              />
            )}

            {/* Thank You Screen Config */}
            <div className="mt-12 pt-8 border-t border-white/10">
              <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest font-display mb-4">Completion Screen</h3>
              <div className="glass-panel p-6 rounded-2xl space-y-4">
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">Title</label>
                  <input
                    value={localThankYouTitle}
                    onChange={updateThankYouTitle}
                    onFocus={() => handleFocus('thankYouTitle')}
                    onBlur={() => handleBlur('thankYouTitle')}
                    className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-white focus:border-cyan-500 outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">Message</label>
                  <textarea
                    value={localThankYouMessage}
                    onChange={updateThankYouMessage}
                    onFocus={() => handleFocus('thankYouMessage')}
                    onBlur={() => handleBlur('thankYouMessage')}
                    className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-white focus:border-cyan-500 outline-none resize-none h-20"
                  />
                </div>
              </div>
            </div>
          </div>
        </main>

        {/* Design Sidebar - Overlay */}

        {isDesignOpen && (

          <ThemeSidebar

            form={form}

            updateForm={updateForm}

            onClose={() => setIsDesignOpen(false)}

          />

        )}

        {/* AI Assistant Panel */}
        {isAssistantOpen && (
          <div className="absolute right-0 top-0 h-full w-80 bg-dark-900/95 backdrop-blur-xl border-l border-white/10 z-50 p-6 shadow-2xl animate-in slide-in-from-right duration-300">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-display font-bold text-xl tracking-tight flex items-center gap-2">
                <ICONS.Bot className="w-5 h-5 text-cyan-400" /> AI Assistant
              </h3>
              <button onClick={() => setIsAssistantOpen(false)} className="text-slate-400 hover:text-white">
                <ICONS.X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="bg-black/30 rounded-xl p-4 border border-white/10">
                <p className="text-sm text-slate-300 mb-3">
                  {assistantMessage || "I'm your AI assistant. I can help you create and improve your form!"}
                </p>

                {isProcessing && (
                  <div className="flex items-center gap-2 text-cyan-400 text-sm">
                    <div className="w-4 h-4 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
                    Processing...
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <button
                  onClick={generateSmartForm}
                  disabled={isProcessing}
                  className={`w-full py-3 rounded-xl text-left px-4 transition ${themeStyles.bgTranslucent} hover:${themeStyles.bgTranslucent.replace('10', '20')} border ${themeStyles.border} disabled:opacity-50`}
                >
                  <div className="flex items-center gap-2">
                    <ICONS.Magic className="w-4 h-4" />
                    <span className="font-medium">Create Smart Form</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">Generate questions based on your form purpose</p>
                </button>

                <button
                  onClick={suggestRelatedQuestions}
                  disabled={isProcessing}
                  className={`w-full py-3 rounded-xl text-left px-4 transition ${themeStyles.bgTranslucent} hover:${themeStyles.bgTranslucent.replace('10', '20')} border ${themeStyles.border} disabled:opacity-50`}
                >
                  <div className="flex items-center gap-2">
                    <ICONS.PlusCircle className="w-4 h-4" />
                    <span className="font-medium">Suggest Questions</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">Add relevant questions to your form</p>
                </button>

                <button
                  onClick={autoFormatQuestions}
                  disabled={isProcessing}
                  className={`w-full py-3 rounded-xl text-left px-4 transition ${themeStyles.bgTranslucent} hover:${themeStyles.bgTranslucent.replace('10', '20')} border ${themeStyles.border} disabled:opacity-50`}
                >
                  <div className="flex items-center gap-2">
                    <ICONS.Edit className="w-4 h-4" />
                    <span className="font-medium">Improve Questions</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">Format and enhance existing questions</p>
                </button>
              </div>

              {/* Template Gallery */}
              <div className="pt-4 border-t border-white/10">
                <h4 className="font-medium text-slate-400 mb-3 flex items-center gap-2">
                  <ICONS.LightBulb className="w-4 h-4" /> Form Templates
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => applyTemplate('survey')}
                    disabled={isProcessing}
                    className={`py-2 px-3 rounded-lg text-xs transition ${themeStyles.bgTranslucent} hover:${themeStyles.bgTranslucent.replace('10', '20')} border ${themeStyles.border} disabled:opacity-50`}
                  >
                    Survey
                  </button>
                  <button
                    onClick={() => applyTemplate('registration')}
                    disabled={isProcessing}
                    className={`py-2 px-3 rounded-lg text-xs transition ${themeStyles.bgTranslucent} hover:${themeStyles.bgTranslucent.replace('10', '20')} border ${themeStyles.border} disabled:opacity-50`}
                  >
                    Registration
                  </button>
                  <button
                    onClick={() => applyTemplate('contact')}
                    disabled={isProcessing}
                    className={`py-2 px-3 rounded-lg text-xs transition ${themeStyles.bgTranslucent} hover:${themeStyles.bgTranslucent.replace('10', '20')} border ${themeStyles.border} disabled:opacity-50`}
                  >
                    Contact
                  </button>
                  <button
                    onClick={() => applyTemplate('jobApplication')}
                    disabled={isProcessing}
                    className={`py-2 px-3 rounded-lg text-xs transition ${themeStyles.bgTranslucent} hover:${themeStyles.bgTranslucent.replace('10', '20')} border ${themeStyles.border} disabled:opacity-50`}
                  >
                    Job App
                  </button>
                  <button
                    onClick={() => applyTemplate('eventFeedback')}
                    disabled={isProcessing}
                    className={`py-2 px-3 rounded-lg text-xs transition ${themeStyles.bgTranslucent} hover:${themeStyles.bgTranslucent.replace('10', '20')} border ${themeStyles.border} disabled:opacity-50`}
                  >
                    Event
                  </button>
                  <button
                    onClick={() => applyTemplate('productReview')}
                    disabled={isProcessing}
                    className={`py-2 px-3 rounded-lg text-xs transition ${themeStyles.bgTranslucent} hover:${themeStyles.bgTranslucent.replace('10', '20')} border ${themeStyles.border} disabled:opacity-50`}
                  >
                    Review
                  </button>
                </div>
              </div>

              {/* Quick Add Question Types */}
              <div className="pt-4 border-t border-white/10">
                <h4 className="font-medium text-slate-400 mb-3 flex items-center gap-2">
                  <ICONS.PlusCircle className="w-4 h-4" /> Add Question
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => addQuestion(QuestionType.SHORT_TEXT)}
                    disabled={isProcessing}
                    className={`py-2 px-3 rounded-lg text-xs transition ${themeStyles.bgTranslucent} hover:${themeStyles.bgTranslucent.replace('10', '20')} border ${themeStyles.border} disabled:opacity-50`}
                  >
                    Short Text
                  </button>
                  <button
                    onClick={() => addQuestion(QuestionType.LONG_TEXT)}
                    disabled={isProcessing}
                    className={`py-2 px-3 rounded-lg text-xs transition ${themeStyles.bgTranslucent} hover:${themeStyles.bgTranslucent.replace('10', '20')} border ${themeStyles.border} disabled:opacity-50`}
                  >
                    Long Text
                  </button>
                  <button
                    onClick={() => addQuestion(QuestionType.MULTIPLE_CHOICE)}
                    disabled={isProcessing}
                    className={`py-2 px-3 rounded-lg text-xs transition ${themeStyles.bgTranslucent} hover:${themeStyles.bgTranslucent.replace('10', '20')} border ${themeStyles.border} disabled:opacity-50`}
                  >
                    MCQ
                  </button>
                  <button
                    onClick={() => addQuestion(QuestionType.CHECKBOXES)}
                    disabled={isProcessing}
                    className={`py-2 px-3 rounded-lg text-xs transition ${themeStyles.bgTranslucent} hover:${themeStyles.bgTranslucent.replace('10', '20')} border ${themeStyles.border} disabled:opacity-50`}
                  >
                    Checkboxes
                  </button>
                  <button
                    onClick={() => addQuestion(QuestionType.DROPDOWN)}
                    disabled={isProcessing}
                    className={`py-2 px-3 rounded-lg text-xs transition ${themeStyles.bgTranslucent} hover:${themeStyles.bgTranslucent.replace('10', '20')} border ${themeStyles.border} disabled:opacity-50`}
                  >
                    Dropdown
                  </button>
                  <button
                    onClick={() => addQuestion(QuestionType.RATING)}
                    disabled={isProcessing}
                    className={`py-2 px-3 rounded-lg text-xs transition ${themeStyles.bgTranslucent} hover:${themeStyles.bgTranslucent.replace('10', '20')} border ${themeStyles.border} disabled:opacity-50`}
                  >
                    Rating
                  </button>
                  <button
                    onClick={() => addQuestion(QuestionType.FILE_UPLOAD)}
                    disabled={isProcessing}
                    className={`py-2 px-3 rounded-lg text-xs transition ${themeStyles.bgTranslucent} hover:${themeStyles.bgTranslucent.replace('10', '20')} border ${themeStyles.border} disabled:opacity-50`}
                  >
                    File Upload
                  </button>
                  <button
                    onClick={() => addQuestion(QuestionType.SIGNATURE_PAD)}
                    disabled={isProcessing}
                    className={`py-2 px-3 rounded-lg text-xs transition ${themeStyles.bgTranslucent} hover:${themeStyles.bgTranslucent.replace('10', '20')} border ${themeStyles.border} disabled:opacity-50`}
                  >
                    Signature
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {isPublishOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setIsPublishOpen(false)}></div>
          <div className="relative w-full max-w-md bg-dark-900 rounded-3xl border border-white/10 p-8 shadow-2xl animate-in zoom-in-95 duration-200 glass-panel">
            <div className="text-center mb-6">
              <div className={`w-16 h-16 ${themeStyles.bgTranslucent} rounded-full flex items-center justify-center mx-auto mb-4 relative`}>
                <div className={`absolute inset-0 rounded-full animate-ping ${themeStyles.bgTranslucent}`}></div>
                <ICONS.Sparkles className={`w-8 h-8 ${themeStyles.accent} relative z-10`} />
              </div>
              <h2 className="text-2xl font-bold font-display tracking-tight">Interface Deployed</h2>
              <p className="text-slate-400 mt-2 text-sm">System ready for data ingestion.</p>
            </div>
            <div className="bg-black/40 rounded-xl p-4 border border-white/10 flex items-center gap-3 mb-6">
              <ICONS.Link className="w-5 h-5 text-slate-500" />
              <input readOnly value={`${window.location.origin}/view/${form.id}`} className="bg-transparent border-none text-sm text-slate-300 flex-1 focus:ring-0 truncate font-mono" />
              <button onClick={handleCopyLink} className={`${themeStyles.accent} hover:opacity-80 font-bold text-xs uppercase tracking-wide whitespace-nowrap`}>{isCopied ? 'Copied' : 'Copy'}</button>
            </div>
            <div className="flex gap-3">
              <button onClick={onPreview} className="flex-1 py-3 bg-white text-black font-bold rounded-xl hover:bg-slate-200 transition flex items-center justify-center gap-2 text-sm uppercase tracking-wide"><ICONS.ExternalLink className="w-4 h-4" /> Initialize</button>
              <button onClick={() => setIsPublishOpen(false)} className="flex-1 py-3 bg-white/5 text-white font-bold rounded-xl hover:bg-white/10 transition text-sm uppercase tracking-wide border border-white/5">Dismiss</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FormBuilder;