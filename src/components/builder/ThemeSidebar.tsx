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
        <h3 className="font-display font-bold text-xl tracking-tight">Form Settings</h3>
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

        <div className="pt-6 border-t border-white/5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ICONS.Mail className="w-4 h-4 text-cyan-400" />
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Email Notifications</label>
            </div>
            <div
              onClick={() => updateForm({ ...form, emailNotificationsEnabled: !form.emailNotificationsEnabled })}
              className={`w-10 h-5 rounded-full p-1 cursor-pointer transition-colors duration-200 ${form.emailNotificationsEnabled ? 'bg-cyan-500' : 'bg-white/10'}`}
            >
              <div className={`w-3 h-3 bg-white rounded-full transition-transform duration-200 ${form.emailNotificationsEnabled ? 'translate-x-5' : 'translate-x-0'}`} />
            </div>
          </div>

          {form.emailNotificationsEnabled && (
            <div className="animate-in slide-in-from-top-2 duration-300">
              <label className="text-[10px] font-mono text-slate-600 mb-1 block uppercase">Alert Destination</label>
              <input
                type="email"
                value={form.notifyEmail || ''}
                onChange={(e) => updateForm({ ...form, notifyEmail: e.target.value })}
                placeholder="alerts@example.com"
                className="w-full bg-black border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:border-cyan-500 outline-none transition-all"
              />
              <p className="mt-2 text-[9px] text-slate-500 font-mono leading-relaxed">
                You will receive a summary for every new submission.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ThemeSidebar;
