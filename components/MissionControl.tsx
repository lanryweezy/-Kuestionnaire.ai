import React, { useState, useEffect } from 'react';
import { FormSchema, FormSubmission, QuestionType } from '../types';
import { ICONS } from '../constants';

interface MissionControlProps {
    form: FormSchema;
    onBack: () => void;
}

const MissionControl: React.FC<MissionControlProps> = ({ form, onBack }) => {
    const [submissions, setSubmissions] = useState<FormSubmission[]>([]);

    useEffect(() => {
        const loadSubmissions = () => {
            try {
                const all = JSON.parse(localStorage.getItem('kuestionnaire_ai_submissions') || '[]');
                const filtered = all.filter((s: FormSubmission) => s.formId === form.id);
                setSubmissions(filtered);
            } catch (e) {
                console.error("Failed to load submissions", e);
            }
        };
        loadSubmissions();
    }, [form.id]);

    const formatTime = (iso: string) => {
        const date = new Date(iso);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const formatDate = (iso: string) => {
        const date = new Date(iso);
        return date.toLocaleDateString();
    };

    // Filter out SECTION type questions for display
    const dataQuestions = form.questions.filter(q => q.type !== QuestionType.SECTION);

    return (
        <div className="min-h-screen text-white flex flex-col relative overflow-hidden font-sans">
             {/* Background Ambience (Copied from Dashboard/Builder style) */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-20 bg-[#050508]">
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-600/10 rounded-full mix-blend-screen filter blur-3xl animate-blob pointer-events-none"></div>
                <div className="absolute top-0 right-1/4 w-96 h-96 bg-cyan-600/10 rounded-full mix-blend-screen filter blur-3xl animate-blob animation-delay-2000 pointer-events-none"></div>
                 <div className="absolute -bottom-8 left-1/3 w-96 h-96 bg-blue-600/10 rounded-full mix-blend-screen filter blur-3xl animate-blob animation-delay-4000 pointer-events-none"></div>
                 <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay pointer-events-none"></div>
            </div>

            {/* Header (Matching FormBuilder style) */}
            <header className="h-16 border-b border-white/5 flex items-center justify-between px-6 bg-dark-900/50 backdrop-blur-md sticky top-0 z-40">
                <div className="flex items-center gap-4">
                    <button onClick={onBack} className="p-2 hover:bg-white/5 rounded-full text-slate-400 hover:text-white transition">
                        <ICONS.ArrowLeft className="w-5 h-5" />
                    </button>
                    <div className="flex flex-col">
                        <span className="text-[10px] font-mono text-cyan-500 leading-none">MISSION CONTROL</span>
                        <span className="text-[8px] text-slate-600 leading-none font-bold tracking-wider">DATA ANALYTICS</span>
                    </div>
                    <div className="h-8 w-px bg-white/10 hidden md:block"></div>
                    <h1 className="text-lg font-bold font-display text-white truncate max-w-md hidden md:block">{form.title}</h1>
                </div>
                 <div className="flex items-center gap-2 px-3 py-1 bg-green-500/10 border border-green-500/20 rounded-full">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
                    <span className="text-[10px] font-mono text-green-400 font-medium">LIVE FEED</span>
                </div>
            </header>

            <main className="flex-1 p-6 md:p-10 overflow-y-auto custom-scrollbar">
                <div className="max-w-7xl mx-auto space-y-8">
                    
                    {/* KPI Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="p-5 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors group relative overflow-hidden glass-panel">
                             <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500 to-transparent opacity-50"></div>
                             <div className="flex justify-between items-start mb-2">
                                 <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest font-display">Total Submissions</span>
                                 <ICONS.List className="w-4 h-4 text-cyan-500/50" />
                             </div>
                             <div className="text-3xl font-display font-bold text-white group-hover:scale-105 transition-transform origin-left">{submissions.length}</div>
                        </div>

                        <div className="p-5 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors group relative overflow-hidden glass-panel">
                             <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-transparent opacity-50"></div>
                             <div className="flex justify-between items-start mb-2">
                                 <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest font-display">Completion Rate</span>
                                 <ICONS.Check className="w-4 h-4 text-purple-500/50" />
                             </div>
                             <div className="text-3xl font-display font-bold text-white group-hover:scale-105 transition-transform origin-left">100%</div>
                        </div>

                         <div className="p-5 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors group relative overflow-hidden glass-panel">
                             <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-pink-500 to-transparent opacity-50"></div>
                             <div className="flex justify-between items-start mb-2">
                                 <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest font-display">Avg. Time</span>
                                 <ICONS.Clock className="w-4 h-4 text-pink-500/50" />
                             </div>
                             <div className="text-3xl font-display font-bold text-white group-hover:scale-105 transition-transform origin-left">~1.2m</div>
                        </div>

                        <div className="p-5 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors group relative overflow-hidden glass-panel">
                             <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-yellow-500 to-transparent opacity-50"></div>
                             <div className="flex justify-between items-start mb-2">
                                 <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest font-display">Last Active</span>
                                 <ICONS.Zap className="w-4 h-4 text-yellow-500/50" />
                             </div>
                             <div className="text-3xl font-display font-bold text-white group-hover:scale-105 transition-transform origin-left">{submissions.length > 0 ? formatTime(submissions[0].timestamp) : '--:--'}</div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
                        {/* Main Data Table */}
                        <div className="lg:col-span-2 rounded-2xl bg-dark-900/50 border border-white/5 backdrop-blur-sm flex flex-col overflow-hidden glass-panel">
                            <div className="p-4 border-b border-white/5 flex justify-between items-center bg-white/5">
                                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest font-display flex items-center gap-2">
                                    <ICONS.List className="w-4 h-4" /> Incoming Data Stream
                                </h3>
                                <div className="text-[10px] font-mono text-slate-600">
                                    {submissions.length} RECORDS FOUND
                                </div>
                            </div>
                            <div className="flex-1 overflow-auto custom-scrollbar">
                                {submissions.length === 0 ? (
                                    <div className="h-full flex flex-col items-center justify-center text-slate-600 space-y-4">
                                        <div className="p-4 rounded-full bg-white/5"><ICONS.Sparkles className="w-6 h-6 opacity-50" /></div>
                                        <p className="text-sm font-mono">Awaiting transmission data...</p>
                                    </div>
                                ) : (
                                    <table className="w-full text-left border-collapse">
                                        <thead className="sticky top-0 bg-dark-900 z-10 text-[10px] uppercase text-slate-500 font-mono tracking-wider border-b border-white/5">
                                            <tr>
                                                <th className="p-4 bg-dark-900/90 backdrop-blur">Timestamp</th>
                                                {dataQuestions.slice(0, 3).map(q => (
                                                    <th key={q.id} className="p-4 bg-dark-900/90 backdrop-blur max-w-[200px] truncate" title={q.label}>{q.label}</th>
                                                ))}
                                                <th className="p-4 bg-dark-900/90 backdrop-blur text-right">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-white/5 text-sm">
                                            {submissions.map((sub, idx) => (
                                                <tr key={sub.id} className="hover:bg-white/5 transition-colors group">
                                                    <td className="p-4 whitespace-nowrap">
                                                        <div className="font-mono text-xs text-cyan-400">{formatDate(sub.timestamp)}</div>
                                                        <div className="font-mono text-[10px] text-slate-500">{formatTime(sub.timestamp)}</div>
                                                    </td>
                                                    {dataQuestions.slice(0, 3).map(q => {
                                                        const val = sub.answers[q.id];
                                                        const displayVal = typeof val === 'object' ? JSON.stringify(val) : String(val || '-');
                                                        return (
                                                            <td key={q.id} className="p-4 text-slate-300 max-w-[200px] truncate" title={displayVal}>
                                                                {displayVal}
                                                            </td>
                                                        );
                                                    })}
                                                    <td className="p-4 text-right">
                                                        <button className="text-[10px] text-slate-500 hover:text-white border border-white/10 hover:border-white/30 px-2 py-1 rounded transition opacity-0 group-hover:opacity-100">
                                                            DETAILS
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                )}
                            </div>
                        </div>

                         {/* Side Log / Terminal */}
                        <div className="rounded-2xl bg-black border border-white/10 flex flex-col overflow-hidden relative shadow-inner">
                             <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:20px_20px]"></div>
                             <div className="p-4 border-b border-white/10 bg-white/5 z-10">
                                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest font-display flex items-center gap-2">
                                    <ICONS.GitBranch className="w-4 h-4" /> System Log
                                </h3>
                            </div>
                            <div className="flex-1 overflow-y-auto p-4 space-y-2 font-mono text-xs custom-scrollbar z-10">
                                {submissions.length === 0 && <div className="text-slate-600">> System standing by...</div>}
                                {submissions.map((sub, i) => (
                                    <div key={sub.id} className="flex gap-3 text-slate-400 animate-in slide-in-from-left-2 duration-300" style={{animationDelay: `${i * 50}ms`}}>
                                        <span className="text-slate-600 whitespace-nowrap">[{formatTime(sub.timestamp)}]</span>
                                        <span className="text-cyan-500/80">Rx_DATA_PACKET</span>
                                        <span className="text-slate-600 truncate opacity-50">ID:{sub.id.substring(0,6)}</span>
                                    </div>
                                ))}
                                <div className="animate-pulse text-cyan-500/50 mt-2">_</div>
                            </div>
                        </div>
                    </div>

                </div>
            </main>
        </div>
    );
};

export default MissionControl;