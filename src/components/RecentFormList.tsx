import React, { memo } from 'react';
import { FormSchema } from '../types';
import { ICONS } from '../constants';

interface RecentFormListProps {
  forms: FormSchema[];
  onSelectForm: (form: FormSchema) => void;
  onDeleteForm: (id: string) => void;
  getThemeColor: (theme: string) => string;
}

const RecentFormList: React.FC<RecentFormListProps> = memo(({ 
  forms, 
  onSelectForm, 
  onDeleteForm,
  getThemeColor
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {forms.map((form) => {
        const themeClass = getThemeColor(form.theme);
        return (
          <div
            key={form.id}
            onClick={() => onSelectForm(form)}
            className="group relative p-5 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all text-left flex flex-col h-44 hover:-translate-y-1 hover:shadow-xl overflow-hidden cursor-pointer"
          >
            <div className={`absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-transparent via-current to-transparent opacity-50 group-hover:opacity-100 transition-opacity ${themeClass.split(' ')[1]}`}></div>
            
            <div className="flex justify-between items-start mb-2">
              <div className={`text-[10px] font-mono px-2 py-0.5 rounded border bg-opacity-10 ${themeClass.replace('shadow-', '')} bg-current border-current`}>
                 {form.theme.toUpperCase()}
              </div>
              <div className="flex gap-2">
                  <button
                      onClick={(e) => { e.stopPropagation(); onDeleteForm(form.id); }}
                      className="p-1.5 rounded-lg bg-black/40 text-slate-500 hover:text-red-400 hover:bg-red-900/20 opacity-0 group-hover:opacity-100 transition-all z-20"
                      title="Delete Schema"
                  >
                      <ICONS.Trash className="w-3.5 h-3.5" />
                  </button>
                  <ICONS.ExternalLink className="w-4 h-4 text-slate-600 group-hover:text-white transition" />
              </div>
            </div>

            <h4 className="text-lg font-bold font-display text-white mb-2 truncate w-full pr-4">{form.title}</h4>
            <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">{form.description || "No description provided."}</p>
            
            <div className="mt-auto pt-3 border-t border-white/5 flex items-center justify-between">
                <div className="text-[10px] text-slate-500 font-mono flex items-center gap-2">
                   <span>ID: {form.id.substring(0, 6)}</span>
                   <span className="w-1 h-1 rounded-full bg-slate-600"></span>
                   <span>{form.questions.length} MODULES</span>
                </div>
                <div className={`w-2 h-2 rounded-full ${themeClass.split(' ')[1]} shadow-[0_0_8px_currentColor] opacity-50 group-hover:opacity-100 transition`}></div>
            </div>
          </div>
        );
      })}
    </div>
  );
});

export default RecentFormList;