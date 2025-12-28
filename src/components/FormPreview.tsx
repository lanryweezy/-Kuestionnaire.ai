import React, { useState, useEffect, useRef, useMemo } from 'react';
import { FormSchema, Question, QuestionType, FormSubmission } from '../types';
import { ICONS } from '../constants';
import { validateAnswer } from '../services/geminiService';
import { storageService } from '../services/storageService';
import { useStore } from '../store/useStore';

interface FormPreviewProps {
  onClose: () => void;
}

const FormPreview: React.FC<FormPreviewProps> = ({ onClose }) => {
  const { currentForm: form, isPublicView: isPublic, addToast } = useStore();
  const [currentStep, setCurrentStep] = useState(-1);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [isInitializing, setIsInitializing] = useState(true);
  const [isListening, setIsListening] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [validationMsg, setValidationMsg] = useState<{valid: boolean, text: string} | null>(null);

  const totalSteps = form.questions.length;

  useEffect(() => {
    const timer = setTimeout(() => setIsInitializing(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    setValidationMsg(null);
  }, [currentStep]);

  // Handle Submission Save
  useEffect(() => {
    const saveSubmission = async () => {
      if (currentStep === totalSteps) {
          const submission: FormSubmission = {
              id: crypto.randomUUID(),
              formId: form.id,
              timestamp: new Date().toISOString(),
              answers: answers
          };
          
          await storageService.addSubmission(submission);
      }
    };
    saveSubmission();
  }, [currentStep, totalSteps, answers, form.id]);

  const handleStart = () => {
    setCurrentStep(0);
  };

  const handleNext = () => {
    if (currentStep >= 0 && currentStep < totalSteps) {
        // Branching Logic
        const q = form.questions[currentStep];
        
        // If SECTION, no answer logic needed, just proceed
        if (q.type === QuestionType.SECTION) {
            setCurrentStep(currentStep + 1);
            return;
        }

        const answer = answers[q.id];
        let nextStepIndex = currentStep + 1;

        if (q.logic && q.logic.length > 0) {
            for (const rule of q.logic) {
                let isMatch = false;
                const ansStr = String(answer || "").toLowerCase();
                const ruleVal = rule.value.toLowerCase();

                if (rule.condition === 'equals') isMatch = ansStr === ruleVal;
                if (rule.condition === 'not_equals') isMatch = ansStr !== ruleVal;
                if (rule.condition === 'contains') isMatch = ansStr.includes(ruleVal);
                
                if (Array.isArray(answer)) {
                     const ansArray = answer.map(a => String(a).toLowerCase());
                     if (rule.condition === 'contains') isMatch = ansArray.includes(ruleVal);
                     if (rule.condition === 'equals') isMatch = ansArray.includes(ruleVal); 
                }

                if (isMatch) {
                    const targetIndex = form.questions.findIndex(tq => tq.id === rule.jumpToId);
                    if (targetIndex !== -1) {
                        nextStepIndex = targetIndex;
                        break; 
                    }
                }
            }
        }
        setCurrentStep(nextStepIndex < totalSteps ? nextStepIndex : totalSteps);
    } else {
        setCurrentStep(0);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) setCurrentStep(curr => curr - 1);
    else if (currentStep === 0) setCurrentStep(-1);
  };

  const handleAnswer = (val: any) => {
    const qId = form.questions[currentStep].id;
    setAnswers(prev => ({ ...prev, [qId]: val }));
    if(validationMsg) setValidationMsg(null); 
  };

  const verifyInput = async (q: Question) => {
      const val = answers[q.id];
      if (!val || typeof val !== 'string' || !val.trim()) return;
      setIsValidating(true);
      try {
          const result = await validateAnswer(q.label, val);
          setValidationMsg({ valid: result.isValid, text: result.message });
      } finally {
          setIsValidating(false);
      }
  };

  // Keyboard
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (currentStep === -1 && e.key === 'Enter' && !isInitializing) handleStart();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentStep, isInitializing]);

  const toggleVoiceInput = () => {
      if (isListening) { setIsListening(false); return; }
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
          const recognition = new SpeechRecognition();
          recognition.continuous = false;
          recognition.lang = 'en-US';
          recognition.interimResults = false;
          setIsListening(true);
          recognition.onresult = (event: any) => {
              const transcript = event.results[0][0].transcript;
              handleAnswer(transcript);
              setIsListening(false);
          };
          recognition.onerror = () => setIsListening(false);
          recognition.onend = () => setIsListening(false);
          recognition.start();
      } else {
          addToast("Voice input not supported in this browser.", 'error');
      }
  };

  const currentQ = currentStep >= 0 && currentStep < totalSteps ? form.questions[currentStep] : null;

  const displayedOptions = useMemo(() => {
      if (!currentQ || !currentQ.options) return [];
      if (currentQ.randomizeOptions) return [...currentQ.options].sort(() => Math.random() - 0.5);
      return currentQ.options;
  }, [currentQ]);


  const renderInput = (q: Question) => {
    if (q.type === QuestionType.SECTION) {
        return (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <p className="text-xl text-slate-300 font-light leading-relaxed border-l-2 border-cyan-500/50 pl-6">
                    {q.description}
                </p>
                <button 
                    onClick={handleNext}
                    className="mt-8 px-8 py-3 bg-white text-black font-bold font-display uppercase tracking-wider hover:bg-cyan-400 transition flex items-center gap-2"
                >
                    Continue <ICONS.ArrowLeft className="w-4 h-4 rotate-180" />
                </button>
            </div>
        );
    }

    const val = answers[q.id] || '';
    switch (q.type) {
      case QuestionType.SHORT_TEXT:
      case QuestionType.LONG_TEXT:
        return (
          <div className="relative group space-y-2">
            {q.type === QuestionType.SHORT_TEXT ? (
                <div className="relative">
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 text-cyan-500 font-mono text-xl pointer-events-none opacity-50 group-focus-within:opacity-100 transition-opacity">{'>'}</span>
                    <input autoFocus type={q.inputType || 'text'} value={val} onChange={(e) => handleAnswer(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleNext()} placeholder={isListening ? "Listening..." : (q.placeholder || "Input_Data...")} className="w-full bg-transparent border-b border-white/20 text-2xl md:text-3xl py-2 pl-8 pr-12 font-mono text-white focus:border-cyan-500 focus:outline-none transition-all placeholder-white/10" />
                     <button onClick={toggleVoiceInput} className={`absolute right-0 top-1/2 -translate-y-1/2 p-2 hover:bg-white/10 rounded-full transition ${isListening ? 'text-red-400 animate-pulse' : 'text-slate-500 hover:text-cyan-400'}`}><ICONS.Mic className="w-5 h-5" /></button>
                </div>
            ) : (
                <div className="relative">
                    <textarea autoFocus value={val} onChange={(e) => handleAnswer(e.target.value)} placeholder={isListening ? "Listening..." : (q.placeholder || "Input_Detailed_Data...")} className="w-full bg-white/5 border border-white/10 rounded-lg text-xl p-4 pr-12 font-mono focus:border-cyan-500 focus:bg-white/10 focus:outline-none transition-all placeholder-white/10 resize-none h-40" />
                    <button onClick={toggleVoiceInput} className={`absolute right-4 bottom-4 p-2 hover:bg-white/10 rounded-full transition ${isListening ? 'text-red-400 animate-pulse' : 'text-slate-500 hover:text-cyan-400'}`}><ICONS.Mic className="w-5 h-5" /></button>
                </div>
            )}
            <div className="flex items-center gap-4 min-h-[24px]">
                 <button onClick={() => verifyInput(q)} disabled={!val || isValidating} className="text-[10px] text-cyan-400 hover:text-white uppercase tracking-widest border border-cyan-500/30 px-2 py-1 rounded hover:bg-cyan-500/10 disabled:opacity-50 disabled:cursor-not-allowed transition">{isValidating ? 'ANALYZING...' : 'VERIFY_DATA'}</button>
                 {validationMsg && <div className={`text-xs font-mono animate-in slide-in-from-left-2 duration-300 ${validationMsg.valid ? 'text-green-400' : 'text-red-400'}`}>[{validationMsg.valid ? 'OK' : 'ERR'}] {validationMsg.text}</div>}
            </div>
          </div>
        );
      case QuestionType.MULTIPLE_CHOICE:
      case QuestionType.DROPDOWN:
        return (
          <div className="space-y-3">
            {displayedOptions.map((opt, idx) => (
              <div key={opt.id} onClick={() => { handleAnswer(opt.label); setTimeout(handleNext, 250); }} className={`relative p-4 border rounded-none skew-x-[-10deg] cursor-pointer text-lg md:text-xl transition-all flex items-center gap-4 group overflow-hidden ${val === opt.label ? 'bg-cyan-500/20 border-cyan-500 text-white' : 'border-white/20 hover:bg-white/5 hover:border-cyan-500/50 text-slate-300'}`}>
                <div className="skew-x-[10deg] flex items-center gap-4 w-full">
                    <span className={`font-mono text-xs opacity-50`}>0{idx + 1}</span>
                    {opt.label}
                    {val === opt.label && <ICONS.Check className="ml-auto w-5 h-5 text-cyan-400" />}
                </div>
                <div className="absolute inset-0 bg-cyan-400/5 translate-x-full group-hover:translate-x-0 transition-transform duration-300"></div>
              </div>
            ))}
          </div>
        );
      case QuestionType.CHECKBOXES:
         const selected = (Array.isArray(val) ? val : []) as string[];
         return (
             <div className="space-y-3">
                {displayedOptions.map((opt, idx) => (
                    <div key={opt.id} onClick={() => { const newSet = selected.includes(opt.label) ? selected.filter(s => s !== opt.label) : [...selected, opt.label]; handleAnswer(newSet); }} className={`p-4 border border-l-4 rounded-r-lg cursor-pointer text-lg md:text-xl transition-all flex items-center gap-4 ${selected.includes(opt.label) ? 'bg-purple-500/20 border-purple-500 border-l-purple-500 text-white' : 'border-white/20 border-l-white/20 hover:bg-white/5 hover:border-purple-500/50 hover:border-l-purple-500'}`}>
                        <div className={`w-5 h-5 border flex items-center justify-center transition-colors ${selected.includes(opt.label) ? 'bg-purple-500 border-purple-500 text-white' : 'border-white/30 bg-black/50'}`}>
                             {selected.includes(opt.label) && <ICONS.Check className="w-3 h-3" />}
                        </div>
                        <span className="font-mono">{opt.label}</span>
                    </div>
                ))}
                <button onClick={handleNext} className="mt-6 px-8 py-3 bg-white text-black font-bold font-display uppercase tracking-wider rounded-none skew-x-[-10deg] hover:bg-cyan-400 transition"><span className="skew-x-[10deg] inline-block">Confirm_Selection</span></button>
             </div>
         );
      case QuestionType.RATING:
        const maxRating = q.maxRating || 5;
        const currentRating = typeof val === 'number' ? val : 0;
        const IconComponent = q.ratingIcon === 'heart' ? ICONS.Heart : q.ratingIcon === 'zap' ? ICONS.Zap : ICONS.Star;
        return (
          <div className="space-y-6">
            <div className="flex items-center flex-wrap gap-2 md:gap-4 justify-between md:justify-start">
              {Array.from({ length: maxRating }).map((_, idx) => {
                const ratingValue = idx + 1;
                return (
                  <button key={idx} onClick={() => { handleAnswer(ratingValue); setTimeout(handleNext, 400); }} className={`transition-all duration-300 transform hover:scale-110 relative group p-2`}>
                    <IconComponent className={`w-10 h-10 md:w-14 md:h-14 transition-colors duration-300 ${ratingValue <= currentRating ? 'text-cyan-400 fill-cyan-400 drop-shadow-[0_0_10px_rgba(34,211,238,0.8)]' : 'text-slate-800'}`} />
                    <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs font-mono opacity-0 group-hover:opacity-100 text-cyan-500 transition-opacity">{ratingValue}</div>
                  </button>
                );
              })}
            </div>
            {(q.ratingMinLabel || q.ratingMaxLabel) && <div className="flex justify-between w-full max-w-md md:px-2 pt-2 text-xs md:text-sm font-mono text-slate-400 uppercase tracking-widest"><span>{q.ratingMinLabel}</span><span>{q.ratingMaxLabel}</span></div>}
          </div>
        );
      case QuestionType.DATE:
        return (
          <div className="space-y-4 max-w-sm">
             <div className="relative group">
                 <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-cyan-500"><ICONS.Calendar className="w-6 h-6" /></div>
                 <input type="date" value={val ? (typeof val === 'string' ? val.split('T')[0] : val.date) : ''} onChange={(e) => { const newVal = q.includeTime ? { date: e.target.value, time: (typeof val === 'object' ? val.time : '') } : e.target.value; handleAnswer(newVal); }} onKeyDown={(e) => e.key === 'Enter' && !q.includeTime && handleNext()} className="bg-black/50 border border-cyan-500/30 text-white text-xl rounded-none focus:ring-0 focus:border-cyan-500 block w-full pl-12 p-4 placeholder-slate-600 font-mono" />
             </div>
             {q.includeTime && (
                 <div className="relative group animate-in slide-in-from-top-2">
                     <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-cyan-500"><ICONS.Clock className="w-6 h-6" /></div>
                     <input type="time" value={val && typeof val === 'object' ? val.time : ''} onChange={(e) => { const datePart = val && typeof val === 'object' ? val.date : (typeof val === 'string' ? val : ''); handleAnswer({ date: datePart, time: e.target.value }); }} className="bg-black/50 border border-cyan-500/30 text-white text-xl rounded-none focus:ring-0 focus:border-cyan-500 block w-full pl-12 p-4 placeholder-slate-600 font-mono" />
                 </div>
             )}
             <button onClick={handleNext} disabled={!val || (q.includeTime && (!val.date || !val.time))} className={`mt-4 w-full py-3 font-medium transition font-mono uppercase tracking-widest text-sm border ${(val && (!q.includeTime || (val.date && val.time))) ? 'bg-cyan-500/20 border-cyan-500 text-cyan-400 hover:bg-cyan-500/30' : 'bg-transparent border-white/10 text-slate-600 cursor-not-allowed'}`}>Confirm_Entry</button>
          </div>
        );
      default: return <p className="text-slate-500 font-mono">Module_Type_Unknown</p>;
    }
  };

  const renderBackground = () => {
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
                    <div className="scanline"></div>
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

  if (isInitializing) return <div className="fixed inset-0 z-50 bg-black text-cyan-500 font-mono flex flex-col items-center justify-center p-8"><div className="w-full max-w-md space-y-2"><div className="h-1 w-full bg-cyan-900 rounded overflow-hidden"><div className="h-full bg-cyan-400 animate-[typewriter_1.5s_ease-out_forwards]"></div></div><div className="text-xs space-y-1 opacity-70"><p>&gt; INITIALIZING_CORE...</p><p>&gt; LOADING_SCHEMA_ID: {form.id.substring(0,8)}...</p><p>&gt; ESTABLISHING_SECURE_LINK...</p></div></div></div>;

  return (
    <div className="fixed inset-0 z-50 text-white flex flex-col font-sans crt-overlay">
      {renderBackground()}
      {isListening && <div className="absolute inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-300"><div className="flex flex-col items-center gap-4"><div className="relative"><div className="absolute inset-0 bg-cyan-500 blur-2xl opacity-50 animate-pulse"></div><div className="w-24 h-24 rounded-full border-2 border-cyan-400 flex items-center justify-center relative bg-black/50"><div className="flex gap-1 items-end h-10"><div className="w-1 bg-cyan-400 animate-[pulse_0.5s_infinite] h-4"></div><div className="w-1 bg-cyan-400 animate-[pulse_0.7s_infinite] h-8"></div><div className="w-1 bg-cyan-400 animate-[pulse_0.4s_infinite] h-6"></div><div className="w-1 bg-cyan-400 animate-[pulse_0.6s_infinite] h-10"></div><div className="w-1 bg-cyan-400 animate-[pulse_0.5s_infinite] h-5"></div></div></div></div><p className="text-cyan-400 font-mono text-sm animate-pulse uppercase tracking-widest">Listening for Input...</p><button onClick={() => setIsListening(false)} className="mt-4 px-4 py-1 text-xs text-white/50 border border-white/20 rounded hover:bg-white/10">Cancel</button></div></div>}
      <div className="absolute top-0 left-0 w-full p-6 flex justify-between items-start z-20 pointer-events-none">
          <div className="flex flex-col gap-1"><span className="text-[10px] font-mono text-white/40">SYS.VER.2.5</span><span className="text-sm font-bold font-display uppercase tracking-widest">{form.title}</span></div>
          {!isPublic && <button onClick={() => window.location.hash = ''} className="pointer-events-auto px-4 py-1 border border-white/10 bg-black/40 backdrop-blur text-xs font-mono hover:bg-white/10 hover:border-white/30 transition uppercase">[ ESC ] Abort</button>}
      </div>
      <div className="absolute bottom-0 left-0 w-full h-1 bg-white/5 z-20"><div className={`h-full transition-all duration-700 ease-out shadow-[0_0_10px_currentColor] ${form.theme === 'cyberpunk' ? 'bg-yellow-400 text-yellow-400' : 'bg-cyan-400 text-cyan-400'}`} style={{ width: `${((currentStep + 1) / (totalSteps + 1)) * 100}%` }}></div></div>

      <div className="flex-1 overflow-hidden relative flex flex-col items-center justify-center p-4 md:p-6 z-10">
        {currentStep === -1 && (
            <div className="max-w-3xl w-full text-center space-y-6 md:space-y-8 animate-in zoom-in duration-500">
                <div className="inline-block border border-white/20 px-2 md:px-3 py-1 rounded-full text-[8px] md:text-[10px] font-mono tracking-[0.2em] mb-4 text-white/60">SECURE TRANSMISSION</div>
                <h1 className="text-4xl md:text-5xl lg:text-8xl font-display font-bold leading-tight bg-clip-text text-transparent bg-gradient-to-b from-white to-white/40 tracking-tighter">{form.title}</h1>
                <p className="text-base md:text-lg lg:text-xl text-cyan-100/60 font-light max-w-2xl mx-auto border-l-2 border-cyan-500/30 pl-4 md:pl-6 text-left font-mono">{form.description}</p>
                <div className="pt-6 md:pt-8">
                  <button 
                    onClick={handleStart} 
                    className={`group relative inline-flex items-center justify-center px-8 md:px-10 py-4 md:py-5 text-base md:text-lg font-bold transition-all duration-200 font-display uppercase tracking-widest clip-path-polygon focus:outline-none ${form.theme === 'cyberpunk' ? 'bg-yellow-400 text-black hover:bg-yellow-300' : 'bg-cyan-600 text-white hover:bg-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.5)]'}`} 
                    style={{ clipPath: 'polygon(10% 0, 100% 0, 100% 70%, 90% 100%, 0 100%, 0 30%)' }}
                  >
                    Initialize
                  </button>
                  <p className="mt-3 md:mt-4 text-[8px] md:text-[10px] font-mono text-white/30">PRESS ENTER TO START</p>
                </div>
            </div>
        )}

        {currentStep >= 0 && currentStep < totalSteps && currentQ && (
            <div key={currentStep} className="max-w-2xl w-full animate-in fade-in slide-in-from-bottom-8 duration-500">
                <div className={`mb-4 md:mb-6 flex flex-wrap items-center gap-2 md:gap-4 font-mono text-[10px] md:text-xs text-cyan-500/80`}>
                  <span className="border border-cyan-500/30 px-2 py-0.5 rounded">STEP {currentStep + 1} / {totalSteps}</span>
                  {currentQ.required && currentQ.type !== QuestionType.SECTION && <span className="text-red-400 flex items-center gap-1">● MANDATORY</span>}
                </div>
                <h2 className="text-2xl md:text-3xl lg:text-5xl font-display font-medium mb-8 md:mb-12 leading-tight text-white drop-shadow-lg">{currentQ.label}</h2>
                <div className="mb-8 md:mb-12 relative">
                  <div className="absolute -left-4 top-0 bottom-0 w-0.5 bg-gradient-to-b from-cyan-500/0 via-cyan-500/50 to-cyan-500/0"></div>
                  <div className="pl-4">{renderInput(currentQ)}</div>
                </div>
                {currentQ.type !== QuestionType.SECTION && (
                <div className="flex flex-wrap items-center gap-3 md:gap-4 mt-6 md:mt-8 opacity-50 hover:opacity-100 transition-opacity">
                     <button onClick={handleNext} className={`px-5 md:px-6 py-2 rounded-full font-bold text-sm uppercase tracking-wide border border-white/20 hover:bg-white/10 hover:border-white/50 transition`}>Confirm</button>
                     {currentStep > 0 && <button onClick={handlePrev} className="px-3 md:px-4 py-2 text-white/50 hover:text-white transition text-xs font-mono">{'< BACK'}</button>}
                </div>
                )}
            </div>
        )}

        {currentStep === totalSteps && (
             <div className="text-center space-y-6 md:space-y-8 animate-in zoom-in duration-500 relative">
                 <div className="absolute inset-0 bg-cyan-500/10 blur-[100px] rounded-full"></div>
                 <div className="w-24 h-24 md:w-32 md:h-32 border-2 border-cyan-500 rounded-full flex items-center justify-center mx-auto mb-4 md:mb-6 relative z-10 animate-[pulse_3s_infinite]">
                   <div className="absolute inset-0 border border-cyan-500 rounded-full animate-ping opacity-20"></div>
                   <ICONS.Check className="w-12 h-12 md:w-16 md:h-16 text-cyan-400" />
                 </div>
                 <h2 className="text-3xl md:text-5xl font-display font-bold tracking-tight">{form.thankYouTitle || 'TRANSMISSION COMPLETE'}</h2>
                 <p className="text-base md:text-lg font-mono text-white/60">{form.thankYouMessage || 'Data successfully encrypted and stored.'}</p>
                 {isPublic ? (
                     <div className="mt-8 md:mt-12 space-y-4">
                        <button onClick={() => window.location.hash = ''} className="px-4 md:px-6 py-2 md:py-3 bg-white/10 text-white hover:bg-white/20 transition rounded-xl text-sm md:text-sm font-bold uppercase tracking-wide">Create your own Kuestionnaire</button>
                     </div>
                 ) : (
                     <button onClick={() => window.location.hash = `builder/${form.id}`} className="mt-8 md:mt-12 text-cyan-400 hover:text-white transition text-sm font-mono border-b border-cyan-500/30 pb-1">Return_to_Editor</button>
                 )}
             </div>
        )}
      </div>
    </div>
  );
};

export default FormPreview;