import React, { useState } from 'react';
import { FormSchema, Question, QuestionType, QuestionOption, ThemeOption, LogicRule } from '../types';
import { ICONS, THEMES } from '../constants';
import { refineQuestionText, generateOptions } from '../services/geminiService';

interface FormBuilderProps {
  form: FormSchema;
  setForm: React.Dispatch<React.SetStateAction<FormSchema>>;
  onPreview: () => void;
  onResults: () => void;
  onBack: () => void;
}

const getIconForType = (type: QuestionType) => {
  switch (type) {
    case QuestionType.RATING: return <ICONS.Star className="w-4 h-4" />;
    case QuestionType.DATE: return <ICONS.Calendar className="w-4 h-4" />;
    case QuestionType.MULTIPLE_CHOICE:
    case QuestionType.CHECKBOXES:
    case QuestionType.DROPDOWN: return <ICONS.List className="w-4 h-4" />;
    case QuestionType.SECTION: return <ICONS.Section className="w-4 h-4" />;
    default: return <ICONS.Text className="w-4 h-4" />;
  }
};

const FormBuilder: React.FC<FormBuilderProps> = ({ form, setForm, onPreview, onResults, onBack }) => {
  const [activeQuestionId, setActiveQuestionId] = useState<string | null>(
    form.questions.length > 0 ? form.questions[0].id : null
  );
  const [isDesignOpen, setIsDesignOpen] = useState(false);
  const [isPublishOpen, setIsPublishOpen] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [isRefining, setIsRefining] = useState(false);
  const [isGeneratingOptions, setIsGeneratingOptions] = useState(false);
  const [optionPrompt, setOptionPrompt] = useState('');
  const [showOptionPrompt, setShowOptionPrompt] = useState(false);

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

  const themeStyles = getThemeStyles(form.theme);

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

  const addQuestion = () => {
    const newQuestion: Question = {
      id: crypto.randomUUID(),
      type: QuestionType.SHORT_TEXT,
      label: 'New Question',
      required: false,
      options: [],
    };
    setForm(prev => ({ ...prev, questions: [...prev.questions, newQuestion] }));
    setActiveQuestionId(newQuestion.id);
  };

  const removeQuestion = (id: string) => {
    setForm(prev => ({ ...prev, questions: prev.questions.filter(q => q.id !== id) }));
    if (activeQuestionId === id) setActiveQuestionId(null);
  };

  const duplicateQuestion = (id: string) => {
     const questionToDuplicate = form.questions.find(q => q.id === id);
     if (!questionToDuplicate) return;

     const newQuestion: Question = {
         ...questionToDuplicate,
         id: crypto.randomUUID(),
         label: `${questionToDuplicate.label} (Copy)`,
         options: questionToDuplicate.options?.map(o => ({ ...o, id: crypto.randomUUID() })),
         logic: [] 
     };

     setForm(prev => {
         const index = prev.questions.findIndex(q => q.id === id);
         const newQuestions = [...prev.questions];
         newQuestions.splice(index + 1, 0, newQuestion);
         return { ...prev, questions: newQuestions };
     });
     setActiveQuestionId(newQuestion.id);
  };

  const moveQuestion = (index: number, direction: 'up' | 'down') => {
      setForm(prev => {
          const newQuestions = [...prev.questions];
          if (direction === 'up' && index > 0) {
              [newQuestions[index], newQuestions[index - 1]] = [newQuestions[index - 1], newQuestions[index]];
          } else if (direction === 'down' && index < newQuestions.length - 1) {
              [newQuestions[index], newQuestions[index + 1]] = [newQuestions[index + 1], newQuestions[index]];
          }
          return { ...prev, questions: newQuestions };
      });
  };

  const updateQuestion = (id: string, updates: Partial<Question>) => {
    setForm(prev => ({
      ...prev,
      questions: prev.questions.map(q => q.id === id ? { ...q, ...updates } : q)
    }));
  };

  const addOption = (qId: string) => {
    setForm(prev => ({
      ...prev,
      questions: prev.questions.map(q => {
        if (q.id === qId) {
          const newOption: QuestionOption = { id: crypto.randomUUID(), label: '' };
          return { ...q, options: [...(q.options || []), newOption] };
        }
        return q;
      })
    }));
  };

  const updateOption = (qId: string, optId: string, label: string) => {
    setForm(prev => ({
      ...prev,
      questions: prev.questions.map(q => {
        if (q.id === qId) {
          return {
            ...q,
            options: q.options?.map(o => o.id === optId ? { ...o, label } : o)
          };
        }
        return q;
      })
    }));
  };

  const removeOption = (qId: string, optId: string) => {
    setForm(prev => ({
      ...prev,
      questions: prev.questions.map(q => {
        if (q.id === qId) {
          return { ...q, options: q.options?.filter(o => o.id !== optId) };
        }
        return q;
      })
    }));
  };

  const handleAiRefine = async (id: string, currentText: string) => {
    if (!currentText.trim() || isRefining) return;
    setIsRefining(true);
    try {
      const refined = await refineQuestionText(currentText);
      updateQuestion(id, { label: refined });
    } finally {
      setIsRefining(false);
    }
  };

  const handleGenerateOptions = async (qId: string) => {
    if (!optionPrompt.trim()) return;
    setIsGeneratingOptions(true);
    try {
        const options = await generateOptions(optionPrompt);
        setForm(prev => ({
            ...prev,
            questions: prev.questions.map(q => {
                if(q.id === qId) {
                    const newOptions = options.map(opt => ({ id: crypto.randomUUID(), label: opt }));
                    return { ...q, options: [...(q.options || []), ...newOptions] };
                }
                return q;
            })
        }));
        setOptionPrompt('');
        setShowOptionPrompt(false);
    } catch(e) {
        console.error(e);
        alert("Failed to generate options");
    } finally {
        setIsGeneratingOptions(false);
    }
  };

  const addLogicRule = (qId: string) => {
    const rule: LogicRule = { id: crypto.randomUUID(), condition: 'equals', value: '', jumpToId: '' };
    const q = form.questions.find(q => q.id === qId);
    if(q) updateQuestion(qId, { logic: [...(q.logic || []), rule] });
  };

  const updateLogicRule = (qId: string, ruleId: string, updates: Partial<LogicRule>) => {
    const q = form.questions.find(q => q.id === qId);
    if(q && q.logic) updateQuestion(qId, { logic: q.logic.map(r => r.id === ruleId ? { ...r, ...updates } : r) });
  };

  const removeLogicRule = (qId: string, ruleId: string) => {
      const q = form.questions.find(q => q.id === qId);
      if(q && q.logic) updateQuestion(qId, { logic: q.logic.filter(r => r.id !== ruleId) });
  };

  const handleCopyLink = () => {
    const link = `${window.location.origin}/#/view/${form.id}`;
    navigator.clipboard.writeText(link);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="min-h-screen flex flex-col text-white relative overflow-hidden transition-colors duration-500">
      {renderThemeBackground()}

      {/* Header */}
      <header className="h-16 border-b border-white/5 flex items-center justify-between px-6 bg-dark-900/50 backdrop-blur-md sticky top-0 z-40">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 hover:bg-white/5 rounded-full text-slate-400 hover:text-white transition">
            <ICONS.ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex flex-col">
             <span className="text-[10px] font-mono text-cyan-500 leading-none">KUESTIONNAIRE</span>
             <span className="text-[8px] text-slate-600 leading-none font-bold tracking-wider">AI BUILDER</span>
          </div>
          <div className="h-8 w-px bg-white/10 hidden md:block"></div>
          <input
            value={form.title}
            onChange={(e) => setForm(prev => ({ ...prev, title: e.target.value }))}
            className={`bg-transparent text-lg font-bold font-display text-white focus:outline-none focus:border-b ${themeStyles.border} w-64 md:w-96 placeholder-white/20`}
            placeholder="Form Title"
          />
        </div>
        
        <div className="absolute left-1/2 -translate-x-1/2 flex items-center bg-black/40 rounded-lg p-1 border border-white/10 hidden md:flex">
             <button className="px-4 py-1.5 rounded-md bg-white/10 text-white text-xs font-bold uppercase tracking-wider">Build</button>
             <button onClick={onResults} className="px-4 py-1.5 rounded-md text-slate-400 hover:text-white text-xs font-bold uppercase tracking-wider transition">Results</button>
        </div>

        <div className="flex items-center gap-3">
             <button 
               onClick={handleCopyLink}
               className={`p-2 rounded-lg transition ${isCopied ? 'bg-green-500/20 text-green-400' : 'hover:bg-white/10 text-slate-400'}`} 
               title={isCopied ? "Link copied!" : "Copy form link"}
             >
                {isCopied ? <ICONS.Check className="w-5 h-5" /> : <ICONS.Link className="w-5 h-5" />}
            </button>
             <button onClick={() => setIsDesignOpen(!isDesignOpen)} className={`p-2 rounded-lg transition ${isDesignOpen ? `${themeStyles.bgTranslucent} ${themeStyles.accent}` : 'hover:bg-white/10 text-slate-400'}`} title="Theme & Design">
                <ICONS.Palette className="w-5 h-5" />
            </button>
            <div className="h-6 w-px bg-white/10 mx-1"></div>
            <button onClick={onPreview} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 transition text-sm font-medium border border-white/10 backdrop-blur">
                <ICONS.Eye className="w-4 h-4" />
                <span className="hidden md:inline">Preview</span>
            </button>
            <button onClick={() => setIsPublishOpen(true)} className={`flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r ${themeStyles.gradient} hover:opacity-90 transition text-sm font-medium ${themeStyles.shadow}`}>
                <ICONS.Share className="w-4 h-4" />
                Publish
            </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden relative">
        {/* Sidebar */}
        <aside className="w-80 border-r border-white/5 overflow-y-auto bg-dark-900/50 p-4 space-y-3 hidden md:block custom-scrollbar backdrop-blur-sm">
            <div className="flex items-center justify-between mb-4 px-1">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest font-display">Structure</h3>
                <span className="text-[10px] bg-white/5 px-2 py-0.5 rounded text-slate-500">{form.questions.length} Items</span>
            </div>
            {form.questions.map((q, idx) => (
                <div key={q.id} onClick={() => setActiveQuestionId(q.id)} className={`p-3 rounded-xl border cursor-pointer transition-all duration-300 group relative ${activeQuestionId === q.id ? `${themeStyles.bgTranslucent} ${themeStyles.border} border-opacity-30 ${themeStyles.shadow.replace('20', '10')}` : 'bg-white/5 border-transparent hover:bg-white/10'}`}>
                    <div className="flex justify-between items-start">
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                                <span className={`${activeQuestionId === q.id ? themeStyles.accent : 'text-slate-500'}`}>{getIconForType(q.type)}</span>
                                <span className={`text-[10px] font-mono ${activeQuestionId === q.id ? themeStyles.accent : 'text-slate-600'}`}>0{idx + 1}</span>
                            </div>
                            <p className="text-sm font-medium truncate text-slate-200">{q.label}</p>
                        </div>
                    </div>
                    {activeQuestionId === q.id && <div className={`absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-8 ${themeStyles.bg} rounded-r-full shadow-[0_0_8px_currentColor]`}></div>}
                </div>
            ))}
            <button onClick={addQuestion} className={`w-full py-3 rounded-xl border border-dashed border-white/10 text-slate-400 ${themeStyles.accentHover} hover:border-current hover:bg-white/5 transition flex justify-center items-center gap-2 text-sm mt-4 group`}>
                <div className={`p-1 rounded bg-white/5 group-hover:${themeStyles.bgTranslucent} transition`}><ICONS.Plus className="w-3 h-3" /></div>
                Add Element
            </button>
        </aside>

        {/* Main Editor */}
        <main className="flex-1 overflow-y-auto p-4 md:p-10 relative">
            <div className="max-w-3xl mx-auto space-y-8 pb-20">
                <div className="p-6 rounded-2xl glass-panel relative overflow-hidden group">
                    <label className="block text-[10px] font-bold text-slate-500 mb-2 uppercase tracking-widest font-display">FORM CONTEXT</label>
                    <textarea value={form.description} onChange={(e) => setForm(prev => ({...prev, description: e.target.value}))} className="w-full bg-transparent border-none p-0 text-slate-300 focus:ring-0 resize-none h-20 placeholder-slate-600 text-lg" placeholder="Describe the purpose of this data collection..." />
                </div>

                {activeQuestionId && (() => {
                    const q = form.questions.find(q => q.id === activeQuestionId);
                    if (!q) return null;
                    return (
                        <div className="p-1 rounded-3xl bg-gradient-to-b from-white/10 to-transparent relative">
                            <div className="bg-dark-900/90 rounded-[22px] p-6 md:p-8 backdrop-blur-xl border border-white/5 relative overflow-hidden">
                                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none"></div>

                                <div className="flex flex-col md:flex-row gap-6 mb-8 relative z-10">
                                    <div className="flex-1">
                                        <div className="flex justify-between items-center mb-2">
                                            <label className={`block text-[10px] font-bold ${themeStyles.accent} uppercase tracking-widest font-display`}>
                                                {q.type === QuestionType.SECTION ? 'Section Title' : 'Question'}
                                            </label>
                                            {q.type !== QuestionType.SECTION && (
                                                <button onClick={() => handleAiRefine(q.id, q.label)} disabled={isRefining} className="flex items-center gap-1.5 text-[10px] text-purple-400 hover:text-purple-300 transition px-2 py-1 rounded-full bg-purple-500/10 border border-purple-500/20">
                                                    <ICONS.Sparkles className={`w-3 h-3 ${isRefining ? 'animate-spin' : ''}`} />
                                                    {isRefining ? 'Improving...' : 'AI Improve'}
                                                </button>
                                            )}
                                        </div>
                                        <input value={q.label} onChange={(e) => updateQuestion(q.id, { label: e.target.value })} className={`w-full bg-black/20 border border-white/10 rounded-xl px-4 py-4 text-white text-lg focus:${themeStyles.border} focus:ring-1 ${themeStyles.ring} transition shadow-inner`} placeholder={q.type === QuestionType.SECTION ? "Section Title..." : "Enter your question here..."} />
                                    </div>
                                    <div className="w-full md:w-64">
                                        <label className={`block text-[10px] font-bold ${themeStyles.accent} mb-2 uppercase tracking-widest font-display`}>Answer Type</label>
                                        <div className="relative">
                                            <select value={q.type} onChange={(e) => updateQuestion(q.id, { type: e.target.value as QuestionType })} className={`w-full bg-black/20 border border-white/10 rounded-xl px-4 py-4 text-white appearance-none focus:${themeStyles.border} focus:ring-1 ${themeStyles.ring} transition cursor-pointer`}>
                                                {Object.keys(QuestionType).map(t => <option key={t} value={t} className="bg-dark-900">{t.replace('_', ' ')}</option>)}
                                            </select>
                                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500"><ICONS.ChevronDown className="w-4 h-4" /></div>
                                        </div>
                                    </div>
                                </div>

                                {q.type === QuestionType.SECTION && (
                                    <div className="mb-8 p-5 rounded-xl bg-white/5 border border-white/5 space-y-4 relative z-10">
                                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest font-display">Section Content</label>
                                        <div>
                                            <label className="text-xs text-slate-400 mb-1 block font-medium">Description / Instructions</label>
                                            <textarea 
                                                value={q.description || ''} 
                                                onChange={(e) => updateQuestion(q.id, { description: e.target.value })} 
                                                className="w-full bg-dark-900 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-cyan-500 outline-none h-24 resize-none" 
                                                placeholder="Provide context or instructions for this section..." 
                                            />
                                        </div>
                                    </div>
                                )}

                                {q.type !== QuestionType.SECTION && (
                                <div className="mb-8 p-5 rounded-xl bg-white/5 border border-white/5 space-y-4 relative z-10">
                                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest font-display">Settings</label>
                                    {(q.type === QuestionType.SHORT_TEXT || q.type === QuestionType.LONG_TEXT) && (
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                <div className="md:col-span-2">
                                                <label className="text-xs text-slate-400 mb-1 block font-medium">Input Placeholder</label>
                                                <input value={q.placeholder || ''} onChange={(e) => updateQuestion(q.id, { placeholder: e.target.value })} className="w-full bg-dark-900 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-cyan-500 outline-none" placeholder="e.g. Enter your identification code..." />
                                                </div>
                                                {q.type === QuestionType.SHORT_TEXT && (
                                                <div>
                                                    <label className="text-xs text-slate-400 mb-1 block font-medium">Input Format</label>
                                                    <select value={q.inputType || 'text'} onChange={(e) => updateQuestion(q.id, { inputType: e.target.value as any })} className="w-full bg-dark-900 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-cyan-500 outline-none">
                                                        <option value="text">Standard Text</option>
                                                        <option value="email">Email Address</option>
                                                        <option value="url">Website URL</option>
                                                        <option value="number">Numeric</option>
                                                        <option value="tel">Phone Number</option>
                                                    </select>
                                                </div>
                                                )}
                                        </div>
                                    )}
                                    {q.type === QuestionType.RATING && (
                                        <div className="flex flex-wrap gap-4">
                                            <div className="w-32">
                                                    <label className="text-xs text-slate-400 mb-1 block font-medium">Max Scale</label>
                                                    <select value={q.maxRating || 5} onChange={(e) => updateQuestion(q.id, { maxRating: Number(e.target.value) })} className="w-full bg-dark-900 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-cyan-500 outline-none">
                                                    {[3,4,5,6,7,8,9,10].map(n => <option key={n} value={n}>{n}</option>)}
                                                    </select>
                                            </div>
                                            <div className="flex-1 min-w-[120px]">
                                                <label className="text-xs text-slate-400 mb-1 block font-medium">Min Label</label>
                                                <input value={q.ratingMinLabel || ''} onChange={(e) => updateQuestion(q.id, { ratingMinLabel: e.target.value })} className="w-full bg-dark-900 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-cyan-500 outline-none" placeholder="e.g. Poor" />
                                            </div>
                                            <div className="flex-1 min-w-[120px]">
                                                <label className="text-xs text-slate-400 mb-1 block font-medium">Max Label</label>
                                                <input value={q.ratingMaxLabel || ''} onChange={(e) => updateQuestion(q.id, { ratingMaxLabel: e.target.value })} className="w-full bg-dark-900 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-cyan-500 outline-none" placeholder="e.g. Excellent" />
                                            </div>
                                        </div>
                                    )}
                                </div>
                                )}

                                {[QuestionType.MULTIPLE_CHOICE, QuestionType.CHECKBOXES, QuestionType.DROPDOWN].includes(q.type) && (
                                    <div className="mb-8 space-y-3 relative z-10 bg-white/5 p-4 rounded-xl border border-white/5">
                                        <div className="flex justify-between items-center mb-2">
                                            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest font-display">Selection Parameters</label>
                                            <div className="relative">
                                                <button 
                                                    onClick={() => setShowOptionPrompt(!showOptionPrompt)}
                                                    className="flex items-center gap-1 text-[10px] text-cyan-400 hover:text-white border border-cyan-500/20 bg-cyan-500/5 px-2 py-1 rounded transition"
                                                >
                                                    <ICONS.Sparkles className="w-3 h-3" /> Auto-Populate
                                                </button>
                                                {showOptionPrompt && (
                                                    <div className="absolute right-0 top-full mt-2 w-64 bg-dark-900 border border-white/10 rounded-lg p-3 shadow-xl z-20">
                                                        <label className="text-[10px] text-slate-400 mb-1 block">Topic (e.g. "European Countries")</label>
                                                        <input 
                                                            autoFocus
                                                            value={optionPrompt}
                                                            onChange={(e) => setOptionPrompt(e.target.value)}
                                                            onKeyDown={(e) => e.key === 'Enter' && handleGenerateOptions(q.id)}
                                                            className="w-full bg-black border border-white/10 rounded px-2 py-1 text-xs text-white mb-2 focus:border-cyan-500 outline-none"
                                                        />
                                                        <div className="flex justify-end gap-2">
                                                            <button onClick={() => setShowOptionPrompt(false)} className="text-[10px] text-slate-500 hover:text-white">Cancel</button>
                                                            <button onClick={() => handleGenerateOptions(q.id)} disabled={isGeneratingOptions || !optionPrompt.trim()} className="text-[10px] bg-cyan-600 text-white px-2 py-1 rounded hover:bg-cyan-500 disabled:opacity-50">{isGeneratingOptions ? 'Generating...' : 'Generate'}</button>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {q.options?.map((opt, idx) => (
                                            <div key={opt.id} className="flex items-center gap-3 group/option animate-in fade-in slide-in-from-left-2 duration-200">
                                                <div className="flex-shrink-0 text-slate-500">
                                                    <span className="text-xs font-mono w-4 inline-block text-center text-slate-600">{idx + 1}</span>
                                                </div>
                                                <input 
                                                    value={opt.label}
                                                    onChange={(e) => updateOption(q.id, opt.id, e.target.value)}
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter') { e.preventDefault(); addOption(q.id); }
                                                        if (e.key === 'Backspace' && opt.label === '' && (q.options?.length || 0) > 1) { e.preventDefault(); removeOption(q.id, opt.id); }
                                                    }}
                                                    className={`flex-1 bg-transparent border-b border-transparent hover:border-white/10 focus:${themeStyles.border} py-1.5 text-sm text-slate-300 focus:text-white focus:outline-none transition-all placeholder-slate-600 font-mono`}
                                                    placeholder={`Option_Value_${idx + 1}`}
                                                />
                                                <button onClick={() => removeOption(q.id, opt.id)} className="opacity-0 group-hover/option:opacity-100 p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all"><ICONS.Trash className="w-4 h-4" /></button>
                                            </div>
                                        ))}
                                        <button onClick={() => addOption(q.id)} className={`group flex items-center gap-3 py-2 px-1 text-sm text-slate-500 ${themeStyles.accentHover} transition-colors mt-2`}>
                                            <div className="w-4 h-4 flex items-center justify-center rounded border border-dashed border-current"><ICONS.Plus className="w-3 h-3" /></div>
                                            <span className="font-medium">Append Option</span>
                                        </button>
                                        <div className="flex items-center gap-3 mt-4 pt-4 border-t border-white/5">
                                            <input type="checkbox" id="rnd" checked={q.randomizeOptions || false} onChange={(e) => updateQuestion(q.id, { randomizeOptions: e.target.checked })} className={`h-4 w-4 bg-transparent border-slate-600 rounded checked:${themeStyles.bg}`} />
                                            <label htmlFor="rnd" className="text-xs font-medium text-slate-400 cursor-pointer">Randomize Option Order</label>
                                        </div>
                                    </div>
                                )}
                                
                                {q.type !== QuestionType.SECTION && (
                                <div className="mb-6 relative z-10">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-2">
                                            <ICONS.GitBranch className="w-4 h-4 text-purple-400" />
                                            <label className="text-[10px] font-bold text-purple-400 uppercase tracking-widest font-display">Conditional Logic</label>
                                        </div>
                                        <button onClick={() => addLogicRule(q.id)} className="text-[10px] border border-white/10 hover:border-purple-500 hover:text-purple-400 px-2 py-1 rounded transition uppercase tracking-wide">+ Add Rule</button>
                                    </div>
                                    {q.logic && q.logic.length > 0 && (
                                        <div className="space-y-3 bg-black/20 p-4 rounded-xl border border-purple-500/10">
                                            {q.logic.map((rule) => (
                                                <div key={rule.id} className="flex flex-col md:flex-row items-center gap-2 text-sm">
                                                    <span className="text-slate-500 font-mono text-xs whitespace-nowrap">IF ANSWER</span>
                                                    <select value={rule.condition} onChange={(e) => updateLogicRule(q.id, rule.id, { condition: e.target.value as any })} className="bg-dark-900 border border-white/10 rounded px-2 py-1 text-white text-xs focus:border-purple-500 outline-none">
                                                        <option value="equals">Equals</option>
                                                        <option value="not_equals">Does Not Equal</option>
                                                        <option value="contains">Contains</option>
                                                    </select>
                                                    <input type="text" value={rule.value} onChange={(e) => updateLogicRule(q.id, rule.id, { value: e.target.value })} className="flex-1 bg-dark-900 border border-white/10 rounded px-2 py-1 text-white text-xs focus:border-purple-500 outline-none w-full" placeholder="Value..." />
                                                    <span className="text-slate-500 font-mono text-xs whitespace-nowrap">JUMP TO</span>
                                                    <select value={rule.jumpToId} onChange={(e) => updateLogicRule(q.id, rule.id, { jumpToId: e.target.value })} className="flex-1 bg-dark-900 border border-white/10 rounded px-2 py-1 text-white text-xs focus:border-purple-500 outline-none w-full">
                                                        <option value="">Select Destination</option>
                                                        {form.questions.map((tq, idx) => tq.id !== q.id && <option key={tq.id} value={tq.id}>{idx + 1}. {tq.label.substring(0, 20)}...</option>)}
                                                    </select>
                                                    <button onClick={() => removeLogicRule(q.id, rule.id)} className="p-1 hover:text-red-400 text-slate-600 transition"><ICONS.X className="w-3 h-3" /></button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                )}

                                <div className="flex items-center justify-between pt-6 border-t border-white/5 relative z-10">
                                     <div className="flex items-center gap-6">
                                        {q.type !== QuestionType.SECTION && (
                                        <div className="flex items-center gap-3">
                                            <input type="checkbox" checked={q.required} onChange={(e) => updateQuestion(q.id, { required: e.target.checked })} className="cursor-pointer" />
                                            <label className="text-xs font-medium text-slate-400 uppercase tracking-wide">Required Field</label>
                                        </div>
                                        )}
                                        <button onClick={() => duplicateQuestion(q.id)} className="text-slate-400 hover:text-white text-xs uppercase tracking-wide font-medium flex items-center gap-2"><ICONS.Copy className="w-4 h-4" /> Clone</button>
                                     </div>
                                     <button onClick={() => removeQuestion(q.id)} className="text-red-400/70 hover:text-red-400 text-xs uppercase tracking-wide font-medium flex items-center gap-2 transition hover:bg-red-400/10 px-3 py-1.5 rounded-lg"><ICONS.Trash className="w-4 h-4" /> Delete</button>
                                </div>
                            </div>
                        </div>
                    );
                })()}

                {/* Thank You Screen Config */}
                <div className="mt-12 pt-8 border-t border-white/10">
                    <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest font-display mb-4">Completion Screen</h3>
                    <div className="glass-panel p-6 rounded-2xl space-y-4">
                        <div>
                            <label className="text-xs text-slate-400 mb-1 block">Title</label>
                            <input 
                                value={form.thankYouTitle || 'Transmission Complete'} 
                                onChange={(e) => setForm(prev => ({...prev, thankYouTitle: e.target.value}))}
                                className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-white focus:border-cyan-500 outline-none"
                            />
                        </div>
                        <div>
                            <label className="text-xs text-slate-400 mb-1 block">Message</label>
                            <textarea 
                                value={form.thankYouMessage || 'Data successfully encrypted and stored.'}
                                onChange={(e) => setForm(prev => ({...prev, thankYouMessage: e.target.value}))}
                                className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-white focus:border-cyan-500 outline-none resize-none h-20"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </main>
        
        {/* Design Sidebar - Overlay */}
        {isDesignOpen && (
            <div className="absolute right-0 top-0 h-full w-80 bg-dark-900/95 backdrop-blur-xl border-l border-white/10 z-50 p-6 shadow-2xl animate-in slide-in-from-right duration-300">
                <div className="flex items-center justify-between mb-8">
                    <h3 className="font-display font-bold text-xl tracking-tight">Visual Interface</h3>
                    <button onClick={() => setIsDesignOpen(false)} className="text-slate-400 hover:text-white"><ICONS.X className="w-6 h-6" /></button>
                </div>
                <div className="space-y-6">
                    <div className="space-y-3">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Environment Theme</label>
                        <div className="grid grid-cols-2 gap-3">
                            {(Object.keys(THEMES) as ThemeOption[]).map(themeKey => (
                                <button key={themeKey} onClick={() => setForm(prev => ({...prev, theme: themeKey}))} className={`relative p-3 rounded-xl border text-left transition-all overflow-hidden ${form.theme === themeKey ? `${themeStyles.border} ${themeStyles.bgTranslucent}` : 'border-white/10 hover:border-white/30 bg-white/5'}`}>
                                    <div className={`w-full h-12 rounded-lg mb-2 ${themeKey === 'nebula' ? 'bg-gradient-to-br from-purple-900 to-cyan-900' : themeKey === 'midnight' ? 'bg-black' : themeKey === 'cyberpunk' ? 'bg-yellow-400' : 'bg-gradient-to-br from-orange-500 to-purple-600'}`}></div>
                                    <span className={`text-xs font-medium uppercase tracking-wider ${form.theme === themeKey ? 'text-white' : 'text-slate-400'}`}>{THEMES[themeKey].label}</span>
                                </button>
                            ))}
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