import React, { useState, useCallback, useMemo } from 'react';
import { FormSchema, Question, QuestionType, QuestionOption, ThemeOption, LogicRule } from '../../types';
import { ICONS, THEMES } from '../../constants';
import { refineQuestionText, generateOptions } from '../../services/geminiService';
import { useStore } from '../../store/useStore';

interface QuestionEditorProps {
  question: Question;
  form: FormSchema; // Pass the whole form for logic options
  updateForm: (updatedForm: FormSchema) => void;
  addToast: (message: string, type: string) => void;
  onRemoveQuestion: (id: string) => void;
  onDuplicateQuestion: (id: string) => void;
  onMoveQuestion: (index: number, direction: 'up' | 'down') => void;
  questionIndex: number;
  totalQuestions: number;
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

const QuestionEditor: React.FC<QuestionEditorProps> = ({ 
  question, 
  form, 
  updateForm, 
  addToast, 
  onRemoveQuestion,
  onDuplicateQuestion,
  onMoveQuestion,
  questionIndex,
  totalQuestions,
}) => {
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

  const themeStyles = useMemo(() => getThemeStyles(form.theme), [form.theme]);

  const updateQuestion = useCallback((updates: Partial<Question>) => {
    updateForm({
      ...form,
      questions: form.questions.map(q => q.id === question.id ? { ...q, ...updates } : q)
    });
  }, [form, updateForm, question.id]);

  const addOption = useCallback(() => {
    updateForm({
      ...form,
      questions: form.questions.map(q => {
        if (q.id === question.id) {
          const newOption: QuestionOption = { id: crypto.randomUUID(), label: '' };
          return { ...q, options: [...(q.options || []), newOption] };
        }
        return q;
      })
    });
  }, [form, updateForm, question.id]);

  const updateOption = useCallback((optId: string, label: string) => {
    updateForm({
      ...form,
      questions: form.questions.map(q => {
        if (q.id === question.id) {
          return {
            ...q,
            options: q.options?.map(o => o.id === optId ? { ...o, label } : o)
          };
        }
        return q;
      })
    });
  }, [form, updateForm, question.id]);

  const removeOption = useCallback((optId: string) => {
    updateForm({
      ...form,
      questions: form.questions.map(q => {
        if (q.id === question.id) {
          return { ...q, options: q.options?.filter(o => o.id !== optId) };
        }
        return q;
      })
    });
  }, [form, updateForm, question.id]);

  const handleAiRefine = async (currentText: string) => {
    if (!currentText.trim() || isRefining) return;
    setIsRefining(true);
    try {
      const refined = await refineQuestionText(currentText);
      updateQuestion({ label: refined });
    } finally {
      setIsRefining(false);
    }
  };

  const handleGenerateOptions = async () => {
    if (!optionPrompt.trim()) return;
    setIsGeneratingOptions(true);
    try {
        const options = await generateOptions(optionPrompt);
        updateForm({
            ...form,
            questions: form.questions.map(q => {
                if(q.id === question.id) {
                    const newOptions = options.map(opt => ({ id: crypto.randomUUID(), label: opt }));
                    return { ...q, options: [...(q.options || []), ...newOptions] };
                }
                return q;
            })
        });
        setOptionPrompt('');
        setShowOptionPrompt(false);
    } catch(e) {
        console.error(e);
        addToast("Failed to generate options", 'error');
    } finally {
        setIsGeneratingOptions(false);
    }
  };

  const addLogicRule = () => {
    const rule: LogicRule = { id: crypto.randomUUID(), condition: 'equals', value: '', jumpToId: '' };
    updateQuestion({ logic: [...(question.logic || []), rule] });
  };

  const updateLogicRule = (ruleId: string, updates: Partial<LogicRule>) => {
    if(question.logic) updateQuestion({ logic: question.logic.map(r => r.id === ruleId ? { ...r, ...updates } : r) });
  };

  const removeLogicRule = (ruleId: string) => {
      if(question.logic) updateQuestion({ logic: question.logic.filter(r => r.id !== ruleId) });
  };

  return (
    <div className="p-1 rounded-3xl bg-gradient-to-b from-white/10 to-transparent relative">
        <div className="bg-dark-900/90 rounded-[22px] p-6 md:p-8 backdrop-blur-xl border border-white/5 relative overflow-hidden">
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none"></div>
            
            <div className="flex justify-between items-start mb-6 relative z-10">
                <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${themeStyles.bgTranslucent} border border-white/10`}>
                        {getIconForType(question.type)}
                    </div>
                    <div>
                        <h3 className="font-display font-bold text-white text-lg">{question.label}</h3>
                        <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">{question.type.replace('_', ' ')}</p>
                    </div>
                </div>
                
                <div className="flex items-center gap-2">
                    <button onClick={() => onMoveQuestion(questionIndex, 'up')} disabled={questionIndex === 0} className="p-2 rounded-lg bg-white/5 border border-white/10 text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition"><ICONS.ChevronUp className="w-4 h-4" /></button>
                    <button onClick={() => onMoveQuestion(questionIndex, 'down')} disabled={questionIndex === totalQuestions - 1} className="p-2 rounded-lg bg-white/5 border border-white/10 text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition"><ICONS.ChevronDown className="w-4 h-4" /></button>
                    <div className="w-px h-6 bg-white/10"></div>
                    <button onClick={() => onDuplicateQuestion(question.id)} className="p-2 rounded-lg bg-white/5 border border-white/10 text-slate-400 hover:text-white transition"><ICONS.Copy className="w-4 h-4" /></button>
                    <button onClick={() => onRemoveQuestion(question.id)} className="p-2 rounded-lg bg-white/5 border border-white/10 text-red-400 hover:text-red-300 hover:bg-red-400/10 transition"><ICONS.Trash className="w-4 h-4" /></button>
                </div>
            </div>
            
            <div className="flex flex-col md:flex-row gap-6 mb-8 relative z-10">
                <div className="flex-1">
                    <div className="flex justify-between items-center mb-2">
                        <label htmlFor={`question-label-${question.id}`} className={`block text-[10px] font-bold ${themeStyles.accent} uppercase tracking-widest font-display`}>
                            {question.type === QuestionType.SECTION ? 'Section Title' : 'Question'}
                        </label>
                        {question.type !== QuestionType.SECTION && (
                            <button onClick={() => handleAiRefine(question.label)} disabled={isRefining} className="flex items-center gap-1.5 text-[10px] text-purple-400 hover:text-purple-300 transition px-2 py-1 rounded-full bg-purple-500/10 border border-purple-500/20">
                                <ICONS.Sparkles className={`w-3 h-3 ${isRefining ? 'animate-spin' : ''}`} />
                                {isRefining ? 'Improving...' : 'AI Improve'}
                            </button>
                        )}
                    </div>
                    
                    <input 
                        id={`question-label-${question.id}`} 
                        value={question.label} 
                        onChange={(e) => updateQuestion({ label: e.target.value })} 
                        className={`w-full bg-transparent border-b ${themeStyles.border} py-2 text-xl text-white focus:outline-none placeholder-slate-600 font-display`}
                        placeholder={question.type === QuestionType.SECTION ? "Section heading..." : "Enter your question..."}
                    />
                </div>
                
                <div className="md:w-48">
                    <label htmlFor={`answer-type-${question.id}`} className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest font-display mb-2">Answer Type</label>
                    <select id={`answer-type-${question.id}`} value={question.type} onChange={(e) => updateQuestion({ type: e.target.value as QuestionType })} className="w-full bg-black border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-cyan-500 outline-none appearance-none bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IndoaXRlIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCI+PHBhdGggZD0iTTYgOWw2IDYgNi02Ij48L3BhdGg+PC9zdmc+')]] bg-no-repeat bg-[right_0.5rem_center] pr-8">
                        <optgroup label="Text Inputs">
                            <option value={QuestionType.SHORT_TEXT}>Short Text</option>
                            <option value={QuestionType.LONG_TEXT}>Long Text</option>
                        </optgroup>
                        <optgroup label="Selection">
                            <option value={QuestionType.MULTIPLE_CHOICE}>Multiple Choice</option>
                            <option value={QuestionType.CHECKBOXES}>Checkboxes</option>
                            <option value={QuestionType.DROPDOWN}>Dropdown</option>
                        </optgroup>
                        <optgroup label="Specialized">
                            <option value={QuestionType.RATING}>Rating Scale</option>
                            <option value={QuestionType.DATE}>Date</option>
                            <option value={QuestionType.SECTION}>Section</option>
                        </optgroup>
                    </select>
                </div>
            </div>

            {question.type === QuestionType.SECTION && (
                <div className="mb-8 p-5 rounded-xl bg-white/5 border border-white/5 space-y-4 relative z-10">
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest font-display">Section Content</label>
                    <div>
                        <label htmlFor={`section-description-${question.id}`} className="text-xs text-slate-400 mb-1 block font-medium">Description / Instructions</label>
                        <textarea 
                            id={`section-description-${question.id}`} 
                            value={question.description || ''} 
                            onChange={(e) => updateQuestion({ description: e.target.value })} 
                            className="w-full bg-dark-900 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-cyan-500 outline-none h-24 resize-none" 
                            placeholder="Provide context or instructions for this section..." 
                        />
                    </div>
                </div>
            )}

            {question.type !== QuestionType.SECTION && (
            <div className="mb-8 p-5 rounded-xl bg-white/5 border border-white/5 space-y-4 relative z-10">
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest font-display">Settings</label>
                {(question.type === QuestionType.SHORT_TEXT || question.type === QuestionType.LONG_TEXT) && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="md:col-span-2">
                            <label htmlFor={`input-placeholder-${question.id}`} className="text-xs text-slate-400 mb-1 block font-medium">Input Placeholder</label>
                            <input id={`input-placeholder-${question.id}`} value={question.placeholder || ''} onChange={(e) => updateQuestion({ placeholder: e.target.value })} className="w-full bg-dark-900 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-cyan-500 outline-none" placeholder="e.g. Enter your identification code..." />
                            </div>
                            {question.type === QuestionType.SHORT_TEXT && (
                            <div>
                                <label className="text-xs text-slate-400 mb-1 block font-medium">Input Format</label>
                                <select value={question.inputType || 'text'} onChange={(e) => updateQuestion({ inputType: e.target.value as any })} className="w-full bg-dark-900 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-cyan-500 outline-none appearance-none bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3wzLm9yZy8yMDAwL3N2ZyIgd2lkdGg9IjI0IiBoZWlnaHQ9IjI0IiB2aWV3Qmx2PSIwIDAgMjQgMjQiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvcm49InJvdW5kIj48cGF0aCBkPSJNNiA5bDYgNiA2LTYiPjwvcGF0aD48L3N2Zz4=')]] bg-no-repeat bg-[right_0.5rem_center] pr-8">
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
                {question.type === QuestionType.RATING && (
                    <div className="flex flex-wrap gap-4">
                        <div className="w-32">
                                <label htmlFor={`max-scale-${question.id}`} className="text-xs text-slate-400 mb-1 block font-medium">Max Scale</label>
                                <select id={`max-scale-${question.id}`} value={question.maxRating || 5} onChange={(e) => updateQuestion({ maxRating: Number(e.target.value) })} className="w-full bg-dark-900 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-cyan-500 outline-none">
                                {[3,4,5,6,7,8,9,10].map(n => <option key={n} value={n}>{n}</option>)}
                                </select>
                        </div>
                        <div className="flex-1 min-w-[120px]">
                            <label htmlFor={`min-label-${question.id}`} className="text-xs text-slate-400 mb-1 block font-medium">Min Label</label>
                            <input id={`min-label-${question.id}`} value={question.ratingMinLabel || ''} onChange={(e) => updateQuestion({ ratingMinLabel: e.target.value })} className="w-full bg-dark-900 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-cyan-500 outline-none" placeholder="e.g. Poor" />
                        </div>
                        <div className="flex-1 min-w-[120px]">
                            <label htmlFor={`max-label-${question.id}`} className="text-xs text-slate-400 mb-1 block font-medium">Max Label</label>
                            <input id={`max-label-${question.id}`} value={question.ratingMaxLabel || ''} onChange={(e) => updateQuestion({ ratingMaxLabel: e.target.value })} className="w-full bg-dark-900 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-cyan-500 outline-none" placeholder="e.g. Excellent" />
                        </div>
                    </div>
                )}
            </div>
            )}

            {[QuestionType.MULTIPLE_CHOICE, QuestionType.CHECKBOXES, QuestionType.DROPDOWN].includes(question.type) && (
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
                                        onKeyDown={(e) => e.key === 'Enter' && handleGenerateOptions()}
                                        className="w-full bg-black border border-white/10 rounded px-2 py-1 text-xs text-white mb-2 focus:border-cyan-500 outline-none"
                                    />
                                    <div className="flex justify-end gap-2">
                                        <button onClick={() => setShowOptionPrompt(false)} className="text-[10px] text-slate-500 hover:text-white">Cancel</button>
                                        <button onClick={() => handleGenerateOptions()} disabled={isGeneratingOptions || !optionPrompt.trim()} className="text-[10px] bg-cyan-600 text-white px-2 py-1 rounded hover:bg-cyan-500 disabled:opacity-50">{isGeneratingOptions ? 'Generating...' : 'Generate'}</button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {question.options?.map((opt, idx) => (
                        <div key={opt.id} className="flex items-center gap-3 group/option animate-in fade-in slide-in-from-left-2 duration-200">
                            <div className="flex-shrink-0 text-slate-500">
                                <span className="text-xs font-mono w-4 inline-block text-center text-slate-600">{idx + 1}</span>
                            </div>
                            <input 
                                value={opt.label}
                                onChange={(e) => updateOption(opt.id, e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') { e.preventDefault(); addOption(); }
                                    if (e.key === 'Backspace' && opt.label === '' && (question.options?.length || 0) > 1) { e.preventDefault(); removeOption(opt.id); }
                                }}
                                className={`flex-1 bg-transparent border-b border-transparent hover:border-white/10 focus:${themeStyles.border} py-1.5 text-sm text-slate-300 focus:text-white focus:outline-none transition-all placeholder-slate-600 font-mono`}
                                placeholder={`Option_Value_${idx + 1}`}
                            />
                            <button onClick={() => removeOption(opt.id)} className="opacity-0 group-hover/option:opacity-100 p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all"><ICONS.Trash className="w-4 h-4" /></button>
                        </div>
                    ))}
                    <button onClick={() => addOption()} className={`group flex items-center gap-3 py-2 px-1 text-sm text-slate-500 ${themeStyles.accentHover} transition-colors mt-2`}>
                        <div className="w-4 h-4 flex items-center justify-center rounded border border-dashed border-current"><ICONS.Plus className="w-3 h-3" /></div>
                        <span className="font-medium">Append Option</span>
                    </button>
                    <div className="flex items-center gap-3 mt-4 pt-4 border-t border-white/5">
                        <input type="checkbox" id={`randomize-options-${question.id}`} checked={question.randomizeOptions || false} onChange={(e) => updateQuestion({ randomizeOptions: e.target.checked })} className={`h-4 w-4 bg-transparent border-slate-600 rounded checked:${themeStyles.bg}`} />
                        <label htmlFor={`randomize-options-${question.id}`} className="text-xs font-medium text-slate-400 cursor-pointer">Randomize Option Order</label>
                    </div>
                </div>
            )}
            
            {question.type !== QuestionType.SECTION && (
            <div className="mb-6 relative z-10">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <ICONS.GitBranch className="w-4 h-4 text-purple-400" />
                        <label className="text-[10px] font-bold text-purple-400 uppercase tracking-widest font-display">Conditional Logic</label>
                    </div>
                    <button onClick={() => addLogicRule()} className="text-[10px] border border-white/10 hover:border-purple-500 hover:text-purple-400 px-2 py-1 rounded transition uppercase tracking-wide">+ Add Rule</button>
                </div>
                {question.logic && question.logic.length > 0 && (
                    <div className="space-y-3 bg-black/20 p-4 rounded-xl border border-purple-500/10">
                        {question.logic.map((rule) => (
                            <div key={rule.id} className="flex flex-col md:flex-row items-center gap-2 text-sm">
                                <label htmlFor={`logic-condition-${rule.id}`} className="text-slate-500 font-mono text-xs whitespace-nowrap">IF ANSWER</label>
                                <select id={`logic-condition-${rule.id}`} value={rule.condition} onChange={(e) => updateLogicRule(rule.id, { condition: e.target.value as any })} className="bg-dark-900 border border-white/10 rounded px-2 py-1 text-white text-xs focus:border-purple-500 outline-none">
                                    <option value="equals">Equals</option>
                                    <option value="not_equals">Does Not Equal</option>
                                    <option value="contains">Contains</option>
                                </select>
                                <label htmlFor={`logic-value-${rule.id}`} className="sr-only">Logic Value</label>
                                <input id={`logic-value-${rule.id}`} type="text" value={rule.value} onChange={(e) => updateLogicRule(rule.id, { value: e.target.value })} className="flex-1 bg-dark-900 border border-white/10 rounded px-2 py-1 text-white text-xs focus:border-purple-500 outline-none w-full" placeholder="Value..." />
                                <label htmlFor={`logic-jump-to-${rule.id}`} className="text-slate-500 font-mono text-xs whitespace-nowrap">JUMP TO</label>
                                <select id={`logic-jump-to-${rule.id}`} value={rule.jumpToId} onChange={(e) => updateLogicRule(rule.id, { jumpToId: e.target.value })} className="flex-1 bg-dark-900 border border-white/10 rounded px-2 py-1 text-white text-xs focus:border-purple-500 outline-none w-full">
                                    <option value="">Select Destination</option>
                                    {form.questions.map((tq, idx) => tq.id !== question.id && <option key={tq.id} value={tq.id}>{idx + 1}. {tq.label.substring(0, 20)}...</option>)}
                                </select>
                                <button onClick={() => removeLogicRule(rule.id)} className="p-1 hover:text-red-400 text-slate-600 transition"><ICONS.X className="w-3 h-3" /></button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
            )}

            <div className="flex items-center justify-between pt-6 border-t border-white/5 relative z-10">
                 <div className="flex items-center gap-6">
                    {question.type !== QuestionType.SECTION && (
                    <div className="flex items-center gap-3">
                        <input type="checkbox" id={`question-required-${question.id}`} checked={question.required} onChange={(e) => updateQuestion({ required: e.target.checked })} className="cursor-pointer" />
                        <label htmlFor={`question-required-${question.id}`} className="text-xs font-medium text-slate-400 uppercase tracking-wide">Required Field</label>
                    </div>
                    )}
                    <button onClick={() => onDuplicateQuestion(question.id)} className="text-slate-400 hover:text-white text-xs uppercase tracking-wide font-medium flex items-center gap-2"><ICONS.Copy className="w-4 h-4" /> Clone</button>
                 </div>
                 <button onClick={() => onRemoveQuestion(question.id)} className="text-red-400/70 hover:text-red-400 text-xs uppercase tracking-wide font-medium flex items-center gap-2 transition hover:bg-red-400/10 px-3 py-1.5 rounded-lg"><ICONS.Trash className="w-4 h-4" /></button>
            </div>
        </div>
    </div>
  );
};

export default QuestionEditor;