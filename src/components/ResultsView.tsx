import React, { useState, useEffect } from 'react';
import { FormSchema, FormSubmission, QuestionType } from '../types';
import { ICONS } from '../constants';
import { storageService } from '../services/storageService';
import { useStore } from '../store/useStore';

interface ResultsViewProps {
    onBack: () => void;
}

const ResultsView: React.FC<ResultsViewProps> = ({ onBack }) => {
    const { currentForm: form, addToast } = useStore();
    const [submissions, setSubmissions] = useState<FormSubmission[]>([]);
    const [dataView, setDataView] = useState<'table' | 'grid'>('table');

    useEffect(() => {
        const loadSubmissions = async () => {
            const filtered = await storageService.getSubmissionsByFormId(form.id);
            setSubmissions(filtered);
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

    const handleShare = () => {
        console.log("share button clicked!");
        const shareable = new URL(`share.html#${encodeURIComponent(JSON.stringify({submissions, form}))}`, location.href).toString();
        console.log("shareable: ", shareable);
    };

    const handleExport = () => {
        if (submissions.length === 0) {
            addToast("No submissions to export.", 'info');
            return;
        }

        const headers = ['timestamp', ...dataQuestions.map(q => q.label)];
        const rows = submissions.map(sub => {
            const rowData: string[] = [sub.timestamp];
            dataQuestions.forEach(q => {
                const answer = sub.answers[q.id];
                rowData.push(typeof answer === 'object' ? JSON.stringify(answer) : String(answer || ''));
            });
            return rowData;
        });

        let csvContent = headers.map(h => `"${h}"`).join(',') + '\n';
        csvContent += rows.map(row => row.map(cell => `"${cell.replace(/"/g, '""')}"`).join(',')).join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        if (link.download !== undefined) { // Feature detection for download attribute
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', `${form.title}-submissions.csv`);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            addToast("Submissions exported to CSV!", 'success');
        } else {
            addToast("Your browser does not support downloading files.", 'error');
        }
    };

    const totalResponses = submissions.length;
    const completionRate = totalResponses > 0 ? 100 : 0; // Assuming all recorded submissions are complete
    const avgCompletionTime = 0; // Not tracking this currently
    const lastSubmission = submissions.length > 0 ? submissions[0] : undefined;

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
            <header className="h-16 border-b border-white/5 flex items-center justify-between px-4 md:px-6 bg-dark-900/50 backdrop-blur-md sticky top-0 z-40">
                <div className="flex items-center gap-2 md:gap-4">
                    <button onClick={onBack} className="p-2 hover:bg-white/5 rounded-full text-slate-400 hover:text-white transition">
                        <ICONS.ArrowLeft className="w-5 h-5" />
                    </button>
                    <div className="flex flex-col">
                         <span className="text-[8px] md:text-[10px] font-mono text-cyan-500 leading-none">KUESTIONNAIRE</span>
                         <span className="text-[6px] md:text-[8px] text-slate-600 leading-none font-bold tracking-wider">ANALYTICS</span>
                    </div>
                </div>
                
                <div className="flex items-center gap-2">
                     <button 
                       onClick={handleExport}
                       className="p-1.5 md:p-2 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition"
                       title="Export Data"
                     >
                        <ICONS.Download className="w-4 md:w-5 h-4 md:h-5" />
                    </button>
                     <button 
                       onClick={handleShare}
                       className="p-1.5 md:p-2 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition"
                       title="Share Results"
                     >
                        <ICONS.Share2 className="w-4 md:w-5 h-4 md:h-5" />
                    </button>
                </div>
            </header>

            <main className="flex-1 overflow-hidden p-4 md:p-6 relative">
                <div className="max-w-7xl mx-auto space-y-6 h-full flex flex-col">
                    {/* Stats Cards */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="p-4 rounded-2xl glass-panel border border-white/10">
                            <div className="text-[10px] font-mono text-slate-500 uppercase tracking-wider mb-1">Total Responses</div>
                            <div className="text-2xl md:text-3xl font-bold font-display text-cyan-400">{submissions.length}</div>
                        </div>
                        <div className="p-4 rounded-2xl glass-panel border border-white/10">
                            <div className="text-[10px] font-mono text-slate-500 uppercase tracking-wider mb-1">Completion Rate</div>
                            <div className="text-2xl md:text-3xl font-bold font-display text-green-400">~{completionRate}%</div>
                        </div>
                        <div className="p-4 rounded-2xl glass-panel border border-white/10">
                            <div className="text-[10px] font-mono text-slate-500 uppercase tracking-wider mb-1">Avg. Time</div>
                            <div className="text-2xl md:text-3xl font-bold font-display text-purple-400">{avgCompletionTime}s</div>
                        </div>
                        <div className="p-4 rounded-2xl glass-panel border border-white/10">
                            <div className="text-[10px] font-mono text-slate-500 uppercase tracking-wider mb-1">Last Entry</div>
                            <div className="text-2xl md:text-3xl font-bold font-display text-amber-400">{lastSubmission ? formatDate(lastSubmission.timestamp) : 'None'}</div>
                        </div>
                    </div>

                    {/* Data View Toggle */}
                    <div className="flex gap-2">
                        <button 
                            onClick={() => setDataView('table')}
                            className={`px-3 md:px-4 py-1.5 md:py-2 rounded-lg text-xs md:text-sm font-medium transition ${dataView === 'table' ? 'bg-cyan-600 text-white' : 'bg-white/5 text-slate-400 hover:bg-white/10'}`}
                        >
                            Table View
                        </button>
                        <button 
                            onClick={() => setDataView('grid')}
                            className={`px-3 md:px-4 py-1.5 md:py-2 rounded-lg text-xs md:text-sm font-medium transition ${dataView === 'grid' ? 'bg-cyan-600 text-white' : 'bg-white/5 text-slate-400 hover:bg-white/10'}`}
                        >
                            Grid View
                        </button>
                    </div>

                    {/* Data Display */}
                    <div className="flex-1 overflow-hidden">
                        {dataView === 'table' ? (
                            <div className="h-full flex flex-col gap-4 md:gap-6">
                                {/* Main Data Table */}
                                <div className="flex-1 rounded-2xl border border-white/10 overflow-hidden flex flex-col bg-dark-900/30 backdrop-blur-sm">
                                    <div className="p-4 border-b border-white/10 bg-white/5">
                                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest font-display flex items-center gap-2">
                                            <ICONS.List className="w-4 h-4" /> Incoming Data Stream
                                        </h3>
                                        <div className="text-[10px] font-mono text-slate-600">
                                            {submissions.length} RECORDS FOUND
                                        </div>
                                    </div>
                                    <div className="flex-1 overflow-auto custom-scrollbar">
                                        {submissions.length === 0 ? (
                                            <div className="h-full flex flex-col items-center justify-center text-slate-600 space-y-4 p-8">
                                                <div className="p-4 rounded-full bg-white/5"><ICONS.Sparkles className="w-6 h-6 opacity-50" /></div>
                                                <p className="text-sm font-mono text-center">Awaiting transmission data...</p>
                                            </div>
                                        ) : (
                                            <table className="w-full text-left border-collapse">
                                                <thead className="sticky top-0 bg-dark-900 z-10 text-[10px] uppercase text-slate-500 font-mono tracking-wider border-b border-white/5">
                                                    <tr>
                                                        <th className="p-3 md:p-4 bg-dark-900/90 backdrop-blur">Timestamp</th>
                                                        {dataQuestions.slice(0, 2).map(q => (
                                                            <th key={q.id} className="p-3 md:p-4 bg-dark-900/90 backdrop-blur max-w-[150px] truncate hidden sm:table-cell" title={q.label}>{q.label}</th>
                                                        ))}
                                                        <th className="p-3 md:p-4 bg-dark-900/90 backdrop-blur text-right">Action</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-white/5 text-sm">
                                                    {submissions.map((sub, idx) => (
                                                        <tr key={sub.id} className="hover:bg-white/5 transition-colors group">
                                                            <td className="p-3 md:p-4 whitespace-nowrap">
                                                                <div className="font-mono text-xs text-cyan-400">{formatDate(sub.timestamp)}</div>
                                                                <div className="font-mono text-[10px] text-slate-500 hidden sm:block">{formatTime(sub.timestamp)}</div>
                                                            </td>
                                                            {dataQuestions.slice(0, 2).map(q => {
                                                                const val = sub.answers[q.id];
                                                                const displayVal = typeof val === 'object' ? JSON.stringify(val) : String(val || '-');
                                                                return (
                                                                    <td key={q.id} className="p-3 md:p-4 text-slate-300 max-w-[150px] truncate hidden sm:table-cell" title={displayVal}>
                                                                        {displayVal}
                                                                    </td>
                                                                );
                                                            })}
                                                            <td className="p-3 md:p-4 text-right">
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
                                <div className="rounded-2xl bg-black border border-white/10 flex flex-col overflow-hidden relative shadow-inner h-40 md:h-48">
                                     <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:20px_20px]"></div>
                                     <div className="p-3 md:p-4 border-b border-white/10 bg-white/5 z-10">
                                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest font-display flex items-center gap-2">
                                            <ICONS.GitBranch className="w-4 h-4" /> System Log
                                        </h3>
                                    </div>
                                    <div className="flex-1 overflow-y-auto p-3 md:p-4 space-y-2 font-mono text-xs custom-scrollbar z-10">
                                        {submissions.length === 0 && <div className="text-slate-600">&gt; System standing by...</div>}
                                        {submissions.map((sub, i) => (
                                            <div key={sub.id} className="flex gap-2 md:gap-3 text-slate-400 animate-in slide-in-from-left-2 duration-300" style={{animationDelay: `${i * 50}ms`}}>
                                                <span className="text-slate-600 whitespace-nowrap text-[10px]">[{formatTime(sub.timestamp)}]</span>
                                                <span className="text-cyan-500/80 text-[10px]">Rx_DATA_PACKET</span>
                                                <span className="text-slate-600 truncate opacity-50 text-[10px]">ID:{sub.id.substring(0,6)}</span>
                                            </div>
                                        ))}
                                        <div className="animate-pulse text-cyan-500/50 mt-2 text-[10px]">_</div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            // Grid View
                            <div className="h-full overflow-auto custom-scrollbar p-2">
                                {submissions.length === 0 ? (
                                    <div className="h-full flex flex-col items-center justify-center text-slate-600 space-y-4">
                                        <div className="p-4 rounded-full bg-white/5"><ICONS.Sparkles className="w-6 h-6 opacity-50" /></div>
                                        <p className="text-sm font-mono">Awaiting transmission data...</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {submissions.map(sub => (
                                            <div key={sub.id} className="p-4 rounded-2xl glass-panel border border-white/10 hover:border-white/20 transition-colors">
                                                <div className="flex justify-between items-start mb-3">
                                                    <div className="font-mono text-[10px] text-cyan-400">{formatDate(sub.timestamp)}</div>
                                                    <div className="font-mono text-[10px] text-slate-500">{formatTime(sub.timestamp)}</div>
                                                </div>
                                                <div className="space-y-2">
                                                    {dataQuestions.slice(0, 3).map(q => {
                                                        const val = sub.answers[q.id];
                                                        const displayVal = typeof val === 'object' ? JSON.stringify(val) : String(val || '-');
                                                        return (
                                                            <div key={q.id} className="text-xs">
                                                                <div className="text-slate-500 font-mono">{q.label}</div>
                                                                <div className="text-white truncate" title={displayVal}>{displayVal}</div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                                <button className="mt-3 text-[10px] text-slate-500 hover:text-white border border-white/10 hover:border-white/30 px-2 py-1 rounded transition w-full">
                                                    VIEW DETAILS
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default ResultsView;