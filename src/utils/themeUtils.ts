import { ThemeOption } from '../types';

export const getThemeColor = (theme: ThemeOption): string => {
  switch (theme) {
    case 'cyberpunk': return 'border-yellow-500 text-yellow-500 shadow-yellow-500/20';
    case 'midnight': return 'border-indigo-500 text-indigo-500 shadow-indigo-500/20';
    case 'sunset': return 'border-orange-500 text-orange-500 shadow-orange-500/20';
    default: return 'border-cyan-500 text-cyan-500 shadow-cyan-500/20';
  }
};

export const getThemeStyles = (theme: ThemeOption) => {
  switch (theme) {
    case 'midnight':
      return {
        accent: 'text-indigo-400',
        accentHover: 'hover:text-indigo-300',
        border: 'border-indigo-500',
        bg: 'bg-indigo-500',
        bgTranslucent: 'bg-indigo-500/10',
        ring: 'focus:ring-indigo-500',
        gradient: 'from-indigo-600 to-blue-600',
        shadow: 'shadow-indigo-500/20'
      };
    case 'cyberpunk':
      return {
        accent: 'text-yellow-400',
        accentHover: 'hover:text-yellow-300',
        border: 'border-yellow-400',
        bg: 'bg-yellow-400',
        bgTranslucent: 'bg-yellow-400/10',
        ring: 'focus:ring-yellow-400',
        gradient: 'from-yellow-500 to-orange-600',
        shadow: 'shadow-yellow-500/20'
      };
    case 'sunset':
      return {
        accent: 'text-orange-400',
        accentHover: 'hover:text-orange-300',
        border: 'border-orange-500',
        bg: 'bg-orange-500',
        bgTranslucent: 'bg-orange-500/10',
        ring: 'focus:ring-orange-500',
        gradient: 'from-orange-600 to-red-600',
        shadow: 'shadow-orange-500/20'
      };
    case 'nebula':
    default:
      return {
        accent: 'text-cyan-400',
        accentHover: 'hover:text-cyan-300',
        border: 'border-cyan-500',
        bg: 'bg-cyan-500',
        bgTranslucent: 'bg-cyan-500/10',
        ring: 'focus:ring-cyan-500',
        gradient: 'from-cyan-600 to-blue-600',
        shadow: 'shadow-cyan-500/20'
      };
  }
};
