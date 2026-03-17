import React from 'react';
import { CheckCircle, AlertCircle, Sparkles, X } from 'lucide-react';

export interface ToastData {
  message: string;
  type: 'success' | 'error' | 'info';
}

interface ToastProps extends ToastData {
  onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({ message, type, onClose }) => {
  React.useEffect(() => {
    const t = setTimeout(onClose, 3500);
    return () => clearTimeout(t);
  }, [onClose]);

  const colors = {
    success: 'bg-emerald-900/80 border-emerald-700/60 text-emerald-300',
    error: 'bg-red-900/80 border-red-700/60 text-red-300',
    info: 'bg-blue-900/80 border-blue-700/60 text-blue-300',
  };

  const icons = {
    success: <CheckCircle size={18} />,
    error: <AlertCircle size={18} />,
    info: <Sparkles size={18} />,
  };

  return (
    <div
      className={`fixed top-4 left-4 right-4 sm:left-auto sm:right-6 sm:top-6 sm:max-w-sm z-[100] flex items-center gap-3 px-4 sm:px-5 py-3 rounded-xl border shadow-2xl backdrop-blur-md anim-slide-down ${colors[type]}`}
    >
      {icons[type]}
      <span className="text-sm font-medium flex-1">{message}</span>
      <button onClick={onClose} className="ml-2 opacity-60 hover:opacity-100 transition-opacity p-1 hover:bg-white/10 rounded-lg">
        <X size={14} />
      </button>
    </div>
  );
};

export default Toast;
