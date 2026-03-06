import React from 'react';
import { ICONS } from '../constants';
import { FORM_TEMPLATES } from '../services/geminiService';
import { getThemeColor } from '../utils/themeUtils';

interface TemplateGalleryProps {
    onSelectTemplate: (templateId: keyof typeof FORM_TEMPLATES) => void;
}

const TEMPLATE_ICONS: Record<keyof typeof FORM_TEMPLATES, React.ElementType> = {
    survey: ICONS.Star,
    feedback: ICONS.MessageSquare,
    registration: ICONS.Calendar,
    contact: ICONS.Mail,
    jobApplication: ICONS.Briefcase,
};

const TemplateGallery: React.FC<TemplateGalleryProps> = ({ onSelectTemplate }) => {
    const templates = Object.entries(FORM_TEMPLATES) as [keyof typeof FORM_TEMPLATES, typeof FORM_TEMPLATES[keyof typeof FORM_TEMPLATES]][];

    return (
        <div className="w-full text-left pt-8 animate-in slide-in-from-bottom-5 duration-500">
            <div className="flex items-center gap-4 mb-6">
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
                <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest font-display">Quick Start Templates</h3>
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 md:gap-4">
                {templates.map(([id, template]) => {
                    const Icon = TEMPLATE_ICONS[id] || ICONS.Sparkles;

                    return (
                        <button
                            key={id}
                            onClick={() => onSelectTemplate(id)}
                            className="group relative p-4 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all flex flex-col items-center justify-center text-center gap-3 hover:-translate-y-1 hover:shadow-lg hover:shadow-cyan-900/20 overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-cyan-500/10 to-transparent rounded-bl-3xl opacity-0 group-hover:opacity-100 transition-opacity"></div>

                            <div className="p-3 UI-glow rounded-full bg-black/40 text-cyan-400 group-hover:text-white transition-colors group-hover:scale-110">
                                <Icon className="w-5 h-5 md:w-6 md:h-6" />
                            </div>

                            <div className="space-y-1">
                                <h4 className="text-xs md:text-sm font-bold text-slate-200 group-hover:text-white transition-colors line-clamp-1">
                                    {template.title}
                                </h4>
                                <p className="text-[9px] md:text-[10px] text-slate-500 line-clamp-2">
                                    {template.description}
                                </p>
                            </div>
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

export default TemplateGallery;
