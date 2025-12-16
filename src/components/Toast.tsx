import React, { useEffect } from 'react';
import { ICONS } from '../constants';

interface ToastProps {
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  onClose: () => void;
  duration?: number;
}

const Toast: React.FC<ToastProps> = ({ message, type, onClose, duration = 5000 }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [onClose, duration]);

  const getToastStyles = () => {
    switch (type) {
      case 'success':
        return 'bg-green-900/90 border-green-500 text-green-100';
      case 'error':
        return 'bg-red-900/90 border-red-500 text-red-100';
      case 'warning':
        return 'bg-yellow-900/90 border-yellow-500 text-yellow-100';
      default:
        return 'bg-blue-900/90 border-blue-500 text-blue-100';
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <ICONS.Check className="w-5 h-5" />;
      case 'error':
        return <ICONS.X className="w-5 h-5" />;
      case 'warning':
        return <span className="w-5 h-5 flex items-center justify-center text-sm font-bold">!</span>;
      default:
        return <span className="w-5 h-5 flex items-center justify-center text-sm font-bold">i</span>;
    }
  };

  return (
    <div className={`fixed top-4 right-4 z-50 max-w-md p-4 rounded-lg border backdrop-blur-sm animate-in slide-in-from-top-2 duration-300 ${getToastStyles()}`}>
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0">
          {getIcon()}
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium">{message}</p>
        </div>
        <button
          onClick={onClose}
          className="flex-shrink-0 p-1 hover:bg-white/10 rounded transition-colors"
        >
          <ICONS.X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default Toast;