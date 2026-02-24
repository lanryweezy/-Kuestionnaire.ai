import React, { useMemo } from 'react';
import { FormSchema, ThemeOption } from '../../types';
import { ICONS, THEMES } from '../../constants';
import { getThemeStyles } from '../../utils/themeUtils';

interface ThemeSidebarProps {
  form: FormSchema;
  updateForm: (updatedForm: FormSchema) => void;
  onClose: () => void;
}

const ThemeSidebar: React.FC<ThemeSidebarProps> = ({ form, updateForm, onClose }) => {
  const themeStyles = useMemo(() => getThemeStyles(form.theme), [form.theme]);

  return (
    <div className="absolute right-0 top-0 h-full w-80 bg-dark-900/95 backdrop-blur-xl border-l border-white/10 z-50 p-6 shadow-2xl animate-in slide-in-from-right duration-300">
      <div className="flex items-center justify-between mb-8">
        <h3 className="font-display font-bold text-xl tracking-tight">Visual Interface</h3>
        <button onClick={onClose} className="text-slate-400 hover:text-white"><ICONS.X className="w-6 h-6" /></button>
      </div>
      <div className="space-y-6">
        <div className="space-y-3">
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Environment Theme</label>
          <div className="grid grid-cols-2 gap-3">
            {(Object.keys(THEMES) as ThemeOption[]).map(themeKey => (
              <button 
                key={themeKey} 
                onClick={() => updateForm({ ...form, theme: themeKey })} 
                className={`relative p-3 rounded-xl border text-left transition-all overflow-hidden ${form.theme === themeKey ? `${themeStyles.border} ${themeStyles.bgTranslucent}` : 'border-white/10 hover:border-white/30 bg-white/5'}`}
              >
                <div className={`w-full h-12 rounded-lg mb-2 ${themeKey === 'nebula' ? 'bg-gradient-to-br from-purple-900 to-cyan-900' : themeKey === 'midnight' ? 'bg-black' : themeKey === 'cyberpunk' ? 'bg-yellow-400' : 'bg-gradient-to-br from-orange-500 to-purple-600'}`}></div>
                <span className={`text-xs font-medium uppercase tracking-wider ${form.theme === themeKey ? 'text-white' : 'text-slate-400'}`}>{THEMES[themeKey].label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThemeSidebar;
