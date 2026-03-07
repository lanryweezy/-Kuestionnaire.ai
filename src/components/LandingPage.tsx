import React from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { ICONS } from '../constants';

const LandingPage: React.FC = () => {
    const { signInWithGoogle, isLoading } = useAuthStore();

    const handleLogin = async () => {
        await signInWithGoogle();
    };

    return (
        <div className="min-h-screen bg-[#050508] text-white selection:bg-cyan-500/30 overflow-x-hidden">
            {/* Navigation */}
            <nav className="fixed top-0 left-0 w-full z-50 bg-[#050508]/50 backdrop-blur-xl border-b border-white/5 px-6 py-4 flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center shadow-[0_0_20px_rgba(6,182,212,0.5)]">
                        <ICONS.Sparkles className="w-4 h-4 text-white" />
                    </div>
                    <span className="font-display font-bold text-xl tracking-tighter">Kuestionnaire.ai</span>
                </div>
                <button
                    onClick={handleLogin}
                    className="text-xs font-mono font-bold uppercase tracking-widest px-6 py-2 border border-white/10 hover:bg-white/5 transition-all rounded-full"
                >
                    Sign In
                </button>
            </nav>

            {/* Hero Section */}
            <section className="relative pt-40 pb-20 px-6 max-w-7xl mx-auto flex flex-col items-center text-center">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-cyan-600/10 blur-[120px] rounded-full -z-10 pointer-events-none" />

                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-cyan-500/20 bg-cyan-500/5 text-cyan-400 text-[10px] font-mono tracking-widest uppercase mb-8 animate-in fade-in slide-in-from-top-4 duration-700">
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
                    </span>
                    Intelligence-Driven Forms is Here
                </div>

                <h1 className="text-6xl md:text-8xl lg:text-9xl font-display font-bold tracking-tighter leading-[0.9] mb-8 animate-in fade-in slide-in-from-bottom-8 duration-1000">
                    Build Forms<br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-b from-white via-white to-white/20">with AI Speed</span>
                </h1>

                <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed mb-12 font-light animate-in fade-in duration-1000 delay-300">
                    Kuestionnaire.ai transforms your ideas into intelligent, high-converting forms using advanced AI. Scale your data collection with zero friction.
                </p>

                <div className="flex flex-col md:flex-row items-center gap-4 animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-500">
                    <button
                        onClick={handleLogin}
                        disabled={isLoading}
                        className="group relative px-10 py-5 bg-white text-black font-bold font-display uppercase tracking-widest rounded-full hover:bg-cyan-400 transition-all duration-300 transform hover:scale-105 shadow-[0_0_30px_rgba(255,255,255,0.2)]"
                    >
                        {isLoading ? 'Processing...' : 'Start Creating Free'}
                        <div className="absolute inset-0 rounded-full border border-white scale-100 group-hover:scale-110 opacity-0 group-hover:opacity-20 transition-all" />
                    </button>
                    <div className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">
                        No Credit Card Required
                    </div>
                </div>

                {/* Hero Visual Mock */}
                <div className="mt-24 w-full max-w-5xl relative group animate-in zoom-in-95 duration-1000 delay-700">
                    <div className="absolute inset-0 bg-gradient-to-t from-[#050508] to-transparent z-10" />
                    <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-3xl blur opacity-20 group-hover:opacity-30 transition duration-1000" />
                    <div className="relative bg-[#0a0a0f] border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
                        <img src="/landing-hero.png" alt="Kuestionnaire.ai Builder" className="w-full h-auto opacity-80" />

                        {/* Overlay Status */}
                        <div className="absolute top-6 left-6 flex items-center gap-4 bg-black/50 backdrop-blur-md rounded-full px-4 py-2 border border-white/10">
                            <div className="flex -space-x-2">
                                {[1, 2, 3].map(i => <div key={i} className={`w-6 h-6 rounded-full border-2 border-[#0a0a0f] bg-slate-800`} />)}
                            </div>
                            <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest">Live: 1,248 Submissions Today</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Grid */}
            <section className="py-32 px-6 max-w-7xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {[
                        {
                            title: "AI Co-pilot",
                            desc: "Generate complete forms from a single phrase. AI refines questions in real-time.",
                            icon: ICONS.Sparkles
                        },
                        {
                            title: "Smart Logic",
                            desc: "Create complex branching paths that adapt to how users answer your questions.",
                            icon: ICONS.Zap
                        },
                        {
                            title: "Real-time Edge",
                            desc: "Instant notifications and powerful analytics delivered through a lightweight engine.",
                            icon: ICONS.Monitor
                        }
                    ].map((f, i) => (
                        <div key={i} className="p-8 rounded-3xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.05] transition-all group">
                            <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                <f.icon className="w-6 h-6 text-cyan-400" />
                            </div>
                            <h3 className="font-display font-bold text-2xl mb-4">{f.title}</h3>
                            <p className="text-slate-400 leading-relaxed font-light">{f.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Showcase / CTA */}
            <section className="py-40 relative px-6 overflow-hidden">
                <div className="absolute inset-0 -z-10 bg-gradient-to-b from-transparent via-cyan-950/20 to-transparent" />
                <div className="max-w-4xl mx-auto text-center">
                    <h2 className="text-5xl md:text-7xl font-display font-bold tracking-tighter mb-8 italic">
                        Ready to evolve your data?
                    </h2>
                    <p className="text-slate-400 mb-12 text-lg">Join the future of high-performance form building.</p>
                    <button
                        onClick={handleLogin}
                        className="px-12 py-6 border border-cyan-500 text-cyan-400 hover:bg-cyan-500 hover:text-black font-bold font-display uppercase tracking-widest rounded-full transition-all shadow-[0_0_20px_rgba(6,182,212,0.2)]"
                    >
                        Get Started Now — It's Free
                    </button>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-12 border-t border-white/5 text-center text-[10px] font-mono uppercase tracking-[0.3em] text-slate-600">
                &copy; 2026 Kuestionnaire.ai // Built for the next web
            </footer>
        </div>
    );
};

export default LandingPage;
