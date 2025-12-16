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
        <div className="min-h-screen bg-[#050508] text-white p-6 md:p-10 relative overflow-hidden bg-[url('https://grainy-gradients.vercel.app/noise.svg')]">
            
            {/* Header */}
            <header className="flex items-center justify-between mb-10 relative z-10">
                <div className="flex items-center gap-4">
                    <button onClick={onBack} className="p-2 hover:bg-white/10 rounded-full text-slate-400 hover:text-white transition">
                        <ICONS.ArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold font-display uppercase tracking-widest text-cyan-400">Mission Control</h1>
                        <p className="text-xs text-slate-500 font-mono">ANALYTICS MODULE // {form.title.toUpperCase()}</p>
                    </div>
                </div>
                <div className="px-3 py-1 bg-green-500/10 border border-green-500/30 rounded text-green-400 text-xs font-mono animate-pulse">
                    LIVE FEED ACTIVE
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative z-10">
                {/* KPI Cards */}
                <div className="glass-panel p-6 rounded-2xl border-t-2 border-cyan-500">
                    <div className="text-slate-500 text-xs uppercase tracking-widest mb-2 font-display">Total Transmissions</div>
                    <div className="text-4xl font-mono font-bold text-white">{submissions.length}</div>
                </div>
                
                <div className="glass-panel p-6 rounded-2xl border-t-2 border-purple-500">
                    <div className="text-slate-500 text-xs uppercase tracking-widest mb-2 font-display">Last Active</div>
                    <div className="text-xl font-mono font-bold text-white">{submissions.length > 0 ? formatTime(submissions[0].timestamp) : '--:--'}</div>
                </div>

                <div className="glass-panel p-6 rounded-2xl border-t-2 border-pink-500">
                    <div className="text-slate-500 text-xs uppercase tracking-widest mb-2 font-display">Field Completion</div>
                    <div className="text-4xl font-mono font-bold text-white">100%</div>
                </div>

                 <div className="glass-panel p-6 rounded-2xl border-t-2 border-yellow-500">
                    <div className="text-slate-500 text-xs uppercase tracking-widest mb-2 font-display">Module Status</div>
                    <div className="text-4xl font-mono font-bold text-white">{dataQuestions.length}</div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6 relative z-10 h-[500px]">
                
                {/* Visualizer (Placeholder style for now) */}
                <div className="md:col-span-2 glass-panel rounded-2xl p-6 relative flex flex-col overflow-hidden">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-sm font-bold text-slate-300 uppercase tracking-widest font-display">Data Feed</h3>
                    </div>
                    
                    <div className="flex-1 overflow-auto custom-scrollbar">
                        {submissions.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-slate-500">
                                <ICONS.Sparkles className="w-8 h-8 mb-4 opacity-20" />
                                <p className="text-sm font-mono">No data transmissions received yet.</p>
                            </div>
                        ) : (
                            <table className="w-full text-left text-sm text-slate-400">
                                <thead className="text-xs uppercase bg-white/5 text-slate-300 sticky top-0">
                                    <tr>
                                        <th className="p-3">Timestamp</th>
                                        {dataQuestions.slice(0, 3).map(q => (
                                            <th key={q.id} className="p-3">{q.label.substring(0, 20)}...</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {submissions.map(sub => (
                                        <tr key={sub.id} className="hover:bg-white/5 transition">
                                            <td className="p-3 font-mono text-xs text-cyan-500">
                                                {formatDate(sub.timestamp)} <span className="text-slate-600">|</span> {formatTime(sub.timestamp)}
                                            </td>
                                            {dataQuestions.slice(0, 3).map(q => {
                                                const val = sub.answers[q.id];
                                                return (
                                                    <td key={q.id} className="p-3 text-white truncate max-w-[150px]">
                                                        {typeof val === 'object' ? JSON.stringify(val) : String(val || '-')}
                                                    </td>
                                                );
                                            })}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>

                {/* Recent Activity Feed */}
                <div className="glass-panel rounded-2xl p-6 overflow-hidden flex flex-col">
                    <h3 className="text-sm font-bold text-slate-300 uppercase tracking-widest font-display mb-4">Signal Log</h3>
                    <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar">
                        {submissions.map((sub) => (
                            <div key={sub.id} className="p-3 bg-white/5 border border-white/5 rounded-lg flex items-center justify-between text-xs animate-in slide-in-from-right duration-300">
                                <div>
                                    <div className="text-cyan-400 font-mono mb-1">{formatTime(sub.timestamp)}</div>
                                    <div className="text-slate-400">ID: {sub.id.substring(0,6)}</div>
                                </div>
                                <div className="text-green-400 font-mono border border-green-500/30 px-1 rounded bg-green-500/10">
                                    ENCRYPTED
                                </div>
                            </div>
                        ))}
                         {submissions.length === 0 && <div className="text-center text-slate-500 text-xs py-10">Waiting for signals...</div>}
                    </div>
                </div>
            </div>
            
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-600/10 rounded-full blur-[100px] -z-10 animate-pulse-slow"></div>
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-[100px] -z-10 animate-pulse-slow"></div>
        </div>
    );
};

export default MissionControl;