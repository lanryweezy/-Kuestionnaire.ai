import React from 'react';
import { ICONS } from '../constants';
import { useStore } from '../store/useStore';

const Modal: React.FC = () => {
  const { modal, closeModal } = useStore();

  if (!modal.isOpen) return null;

  const handleConfirm = () => {
    modal.onConfirm();
    closeModal();
  };

  const handleCancel = () => {
    if (modal.onCancel) {
      modal.onCancel();
    }
    closeModal();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={handleCancel}></div>
      <div className="relative w-full max-w-md bg-dark-900 rounded-3xl border border-white/10 p-8 shadow-2xl animate-in zoom-in-95 duration-200 glass-panel">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4 relative">
            <div className="absolute inset-0 rounded-full animate-ping bg-red-900/20"></div>
            <ICONS.Trash className="w-8 h-8 text-red-400 relative z-10" />
          </div>
          <h2 className="text-2xl font-bold font-display tracking-tight">Confirm Action</h2>
          <p className="text-slate-400 mt-2 text-sm">{modal.message}</p>
        </div>
        <div className="flex gap-3 mt-6">
          <button onClick={handleConfirm} className="flex-1 py-3 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition flex items-center justify-center gap-2 text-sm uppercase tracking-wide">
            <ICONS.Check className="w-4 h-4" /> Confirm
          </button>
          <button onClick={handleCancel} className="flex-1 py-3 bg-white/5 text-white font-bold rounded-xl hover:bg-white/10 transition text-sm uppercase tracking-wide border border-white/5">
            <ICONS.X className="w-4 h-4" /> Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default Modal;
