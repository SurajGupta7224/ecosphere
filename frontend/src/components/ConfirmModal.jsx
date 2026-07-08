import React from 'react';
import { AlertOctagon, Trash2 } from 'lucide-react';

const ConfirmModal = ({ isOpen, title, message, onConfirm, onCancel, confirmLabel = 'Confirm' }) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200 bg-slate-900/40 backdrop-blur-sm"
      onClick={onCancel}
    >
      <div
        onClick={e => e.stopPropagation()}
        className="bg-white rounded-2xl p-8 shadow-2xl animate-in zoom-in-95 duration-200 max-w-[400px] w-full"
      >
        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center border border-red-100">
            <Trash2 className="w-7 h-7 text-red-500" />
          </div>
        </div>

        {/* Title */}
        <h3 className="text-xl font-bold text-slate-800 text-center tracking-tight mb-2">
          {title}
        </h3>

        {/* Message */}
        <p className="text-sm text-slate-500 text-center mb-8 leading-relaxed">
          {message}
        </p>

        {/* Buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-3 px-4 rounded-xl text-sm font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-all active:scale-95"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-3 px-4 rounded-xl text-sm font-bold text-white bg-red-600 hover:bg-red-700 transition-all active:scale-95 shadow-lg shadow-red-100"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
