import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { FormSchema, Question, QuestionType, QuestionOption, ThemeOption, LogicRule } from '../types';
import { ICONS, THEMES } from '../constants';
import { refineQuestionText, generateOptions } from '../services/geminiService';

import { useStore } from '../store/useStore';
import QuestionListSidebar from './builder/QuestionListSidebar';
import QuestionEditor from './builder/QuestionEditor';
import ThemeSidebar from './builder/ThemeSidebar';

interface FormBuilderProps {
  onPreview: () => void;
  onResults: () => void;
  onBack: () => void;
}

const FormBuilder: React.FC<FormBuilderProps> = ({ onPreview, onResults, onBack }) => {
  const { currentForm: form, updateForm, addToast } = useStore();
  const [activeQuestionId, setActiveQuestionId] = useState<string | null>(null);
  const [isDesignOpen, setIsDesignOpen] = useState(false);
  const [isPublishOpen, setIsPublishOpen] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);
  const [assistantMessage, setAssistantMessage] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Set active question when form loads or changes
  useEffect(() => {
    if (form.questions.length > 0 && !activeQuestionId) {
      setActiveQuestionId(form.questions[0].id);
    } else if (form.questions.length === 0) {
      setActiveQuestionId(null);
    }
  }, [form.questions, activeQuestionId]);

  // Helper to get theme-specific styles
  const getThemeStyles = (theme: ThemeOption) => {
    switch (theme) {
      case 'midnight':
        return {
          accent: 'text-indigo-400',
          accentHover: 'hover:text-indigo-300',
          border: 'border-indigo-500',
          bg: 'bg-indigo-500',
          bgTranslucent: 'bg-indigo-500/10',
          ring: 'focus:ring-indigo-500',
          gradient: 'from-indigo-600 to-blue-600',
          shadow: 'shadow-indigo-500/20'
        };
      case 'cyberpunk':
        return {
          accent: 'text-yellow-400',
          accentHover: 'hover:text-yellow-300',
          border: 'border-yellow-400',
          bg: 'bg-yellow-400',
          bgTranslucent: 'bg-yellow-400/10',
          ring: 'focus:ring-yellow-400',
          gradient: 'from-yellow-500 to-orange-600',
          shadow: 'shadow-yellow-500/20'
        };
      case 'sunset':
        return {
          accent: 'text-orange-400',
          accentHover: 'hover:text-orange-300',
          border: 'border-orange-500',
          bg: 'bg-orange-500',
          bgTranslucent: 'bg-orange-500/10',
          ring: 'focus:ring-orange-500',
          gradient: 'from-orange-600 to-red-600',
          shadow: 'shadow-orange-500/20'
        };
      case 'nebula':
      default:
        return {
          accent: 'text-cyan-400',
          accentHover: 'hover:text-cyan-300',
          border: 'border-cyan-500',
          bg: 'bg-cyan-500',
          bgTranslucent: 'bg-cyan-500/10',
          ring: 'focus:ring-cyan-500',
          gradient: 'from-cyan-600 to-blue-600',
          shadow: 'shadow-cyan-500/20'
        };
    }
  };

  const themeStyles = useMemo(() => getThemeStyles(form.theme), [form.theme]);


  // Memoized computed values

  
  const activeQuestion = useMemo(() => 
    form.questions.find(q => q.id === activeQuestionId), 
    [form.questions, activeQuestionId]
  );

  const renderThemeBackground = () => {
      const common = "absolute inset-0 -z-20 bg-[#050508] transition-colors duration-700";
      switch(form.theme) {
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
  const addQuestion = useCallback(() => {
    const newQuestion: Question = {
      id: crypto.randomUUID(),
      type: QuestionType.SHORT_TEXT,
      label: 'New Question',
      required: false,
      options: [],
    };
    updateForm({ ...form, questions: [...form.questions, newQuestion] });
    setActiveQuestionId(newQuestion.id);
  }, [form, updateForm]);

  const removeQuestion = useCallback((id: string) => {
    updateForm({ ...form, questions: form.questions.filter(q => q.id !== id) });
    if (activeQuestionId === id) setActiveQuestionId(null);
  }, [form, updateForm, activeQuestionId]);

  const duplicateQuestion = useCallback((id: string) => {
     const questionToDuplicate = form.questions.find(q => q.id === id);
     if (!questionToDuplicate) return;

     const newQuestion: Question = {
         ...questionToDuplicate,
         id: crypto.randomUUID(),
         label: `${questionToDuplicate.label} (Copy)`,
         options: questionToDuplicate.options?.map(o => ({ ...o, id: crypto.randomUUID() })),
         logic: [] 
     };

     const index = form.questions.findIndex(q => q.id === id);
     const newQuestions = [...form.questions];
     newQuestions.splice(index + 1, 0, newQuestion);
     updateForm({ ...form, questions: newQuestions });
     setActiveQuestionId(newQuestion.id);
  }, [form, updateForm]);

  const moveQuestion = useCallback((index: number, direction: 'up' | 'down') => {
      const newQuestions = [...form.questions];
      if (direction === 'up' && index > 0) {
          [newQuestions[index], newQuestions[index - 1]] = [newQuestions[index - 1], newQuestions[index]];
      } else if (direction === 'down' && index < newQuestions.length - 1) {
          [newQuestions[index], newQuestions[index + 1]] = [newQuestions[index + 1], newQuestions[index]];
      }
      updateForm({ ...form, questions: newQuestions });
  }, [form, updateForm]);

  const updateQuestion = useCallback((id: string, updates: Partial<Question>) => {
    updateForm({
      ...form,
      questions: form.questions.map(q => q.id === id ? { ...q, ...updates } : q)
    });
  }, [form, updateForm]);

  const addOption = useCallback((qId: string) => {
    updateForm({
      ...form,
      questions: form.questions.map(q => {
        if (q.id === qId) {
          const newOption: QuestionOption = { id: crypto.randomUUID(), label: '' };
          return { ...q, options: [...(q.options || []), newOption] };
        }
        return q;
      })
    });
  }, [form, updateForm]);

  const updateOption = useCallback((qId: string, optId: string, label: string) => {
    updateForm({
      ...form,
      questions: form.questions.map(q => {
        if (q.id === qId) {
          return {
            ...q,
            options: q.options?.map(o => o.id === optId ? { ...o, label } : o)
          };
        }
        return q;
      })
    });
  }, [form, updateForm]);

  const removeOption = useCallback((qId: string, optId: string) => {
    updateForm({
      ...form,
      questions: form.questions.map(q => {
        if (q.id === qId) {
          return { ...q, options: q.options?.filter(o => o.id !== optId) };
        }
        return q;
      })
    });
  }, [form, updateForm]);


  const handleCopyLink = () => {
    const link = `${window.location.origin}/#/view/${form.id}`;
    navigator.clipboard.writeText(link);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  // Agentic AI Assistant functions
  const generateSmartForm = async () => {
    setIsProcessing(true);
    try {
      setAssistantMessage('Analyzing your form requirements...');
      
      // Use the gemini service to generate a smart form based on the title and description
      if (form.title.trim() || form.description.trim()) {
        setAssistantMessage('Generating form based on your requirements...');
        
        // Import the gemini service function
        const { generateFormStructure } = await import('../services/geminiService');
        
        const prompt = `${form.title} ${form.description}`.trim();
        const generatedForm = await generateFormStructure(prompt);
        
        // Convert generated questions to our format
        const convertedQuestions = generatedForm.questions.map(q => ({
          id: crypto.randomUUID(),
          type: Object.values(QuestionType).includes(q.type as QuestionType) ? q.type as QuestionType : QuestionType.SHORT_TEXT,
          label: q.label,
          required: q.required,
          options: q.options ? q.options.map(opt => ({ id: crypto.randomUUID(), label: opt })) : [],
          maxRating: q.type === 'RATING' ? 5 : undefined,
          ratingIcon: q.type === 'RATING' ? 'star' as 'star' | 'heart' | 'zap' : undefined
        }));
              
        updateForm({ 
          ...form, 
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
            label: `Tell us more about your interest in ${form.title}`,
            required: false,
            options: []
          }
        ];
        
        updateForm({ ...form, questions: sampleQuestions });
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
          label: `Tell us more about your interest in ${form.title}`,
          required: false,
          options: []
        }
      ];
      
      updateForm({ ...form, questions: sampleQuestions });
      setActiveQuestionId(sampleQuestions[0].id);
      addToast('Sample form created as fallback.', 'info');
    } finally {
      setIsProcessing(false);
    }
  };

  const suggestRelatedQuestions = async () => {
    setIsProcessing(true);
    try {
      setAssistantMessage('Generating related questions based on your form...');
      
      // Use the gemini service to generate related questions
      const { generateFormStructure } = await import('../services/geminiService');
      
      // Create a prompt based on current form to generate related questions
      const currentQuestions = form.questions.map(q => q.label).join(', ');
      const prompt = `Add 2-3 related questions to this form: ${form.title}. Current questions: ${currentQuestions}. Description: ${form.description}`;
      
      const generatedForm = await generateFormStructure(prompt);
      
      // Convert generated questions to our format
      const convertedQuestions = generatedForm.questions.map(q => ({
        id: crypto.randomUUID(),
        type: Object.values(QuestionType).includes(q.type as QuestionType) ? q.type as QuestionType : QuestionType.SHORT_TEXT,
        label: q.label,
        required: q.required,
        options: q.options ? q.options.map(opt => ({ id: crypto.randomUUID(), label: opt })) : [],
        maxRating: q.type === 'RATING' ? 5 : undefined,
        ratingIcon: q.type === 'RATING' ? 'star' as 'star' | 'heart' | 'zap' : undefined
      }));
      
      // Add the suggested questions to the form
      const updatedQuestions = [...form.questions, ...convertedQuestions];
      updateForm({ ...form, questions: updatedQuestions });
      
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
      const titleLower = form.title.toLowerCase();
      const descLower = form.description.toLowerCase();
      
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
      const updatedQuestions = [...form.questions, ...suggestedQuestions];
      updateForm({ ...form, questions: updatedQuestions });
      setActiveQuestionId(suggestedQuestions[0].id);
      
      addToast('Suggested questions added as fallback.', 'info');
    } finally {
      setIsProcessing(false);
    }
  };

  const autoFormatQuestions = async () => {
    setIsProcessing(true);
    try {
      setAssistantMessage('Improving question clarity and formatting...');
      
      // Process each question to improve clarity
      const improvedQuestions = form.questions.map(q => {
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
      
      updateForm({ ...form, questions: improvedQuestions });
      setAssistantMessage('Questions formatted for better clarity!');
      addToast('Questions formatted successfully!', 'success');
    } catch (error) {
      console.error('Error formatting questions:', error);
      setAssistantMessage('Sorry, I encountered an error formatting questions.');
      addToast('Error formatting questions. Please try again.', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

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
            value={form.title}
            onChange={(e) => updateForm({ ...form, title: e.target.value })}
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
          activeQuestionId={activeQuestionId}
          onSetActiveQuestion={setActiveQuestionId}
          isSidebarOpen={isSidebarOpen}
          setIsSidebarOpen={setIsSidebarOpen}
        />

        {/* Main Editor */}
        <main className="flex-1 overflow-y-auto p-4 md:p-10 relative">
            <div className="max-w-3xl mx-auto space-y-8 pb-20">
                <div className="p-6 rounded-2xl glass-panel relative overflow-hidden group">
                    <label className="block text-[10px] font-bold text-slate-500 mb-2 uppercase tracking-widest font-display">FORM CONTEXT</label>
                    <textarea value={form.description} onChange={(e) => updateForm({ ...form, description: e.target.value })} className="w-full bg-transparent border-none p-0 text-slate-300 focus:ring-0 resize-none h-20 placeholder-slate-600 text-lg" placeholder="Describe the purpose of this data collection..." />
                </div>

                {activeQuestionId && activeQuestion && (
                    <QuestionEditor
                        question={activeQuestion}
                        form={form}
                        updateForm={updateForm}
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
                                value={form.thankYouTitle || 'Transmission Complete'} 
                                onChange={(e) => updateForm({ ...form, thankYouTitle: e.target.value })}
                                className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-white focus:border-cyan-500 outline-none"
                            />
                        </div>
                        <div>
                            <label className="text-xs text-slate-400 mb-1 block">Message</label>
                            <textarea 
                                value={form.thankYouMessage || 'Data successfully encrypted and stored.'}
                                onChange={(e) => updateForm({ ...form, thankYouMessage: e.target.value })}
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
                      <input readOnly value={`${window.location.origin}/#/view/${form.id}`} className="bg-transparent border-none text-sm text-slate-300 flex-1 focus:ring-0 truncate font-mono" />
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