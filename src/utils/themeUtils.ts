import { ThemeOption } from '../types';

export const getThemeColor = (theme: ThemeOption): string => {
  switch (theme) {
    case 'cyberpunk': return 'border-yellow-500 text-yellow-500 shadow-yellow-500/20';
    case 'midnight': return 'border-indigo-500 text-indigo-500 shadow-indigo-500/20';
    case 'sunset': return 'border-orange-500 text-orange-500 shadow-orange-500/20';
    default: return 'border-cyan-500 text-cyan-500 shadow-cyan-500/20';
  }
};