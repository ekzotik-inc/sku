import { useAppStore } from '../store/appStore';
import { CheckCircle, AlertCircle, Info, X, AlertTriangle } from 'lucide-react';

const icons = {
  success: <CheckCircle size={18} className="text-green-500" />,
  error: <AlertCircle size={18} className="text-red-500" />,
  warning: <AlertTriangle size={18} className="text-amber-500" />,
  info: <Info size={18} className="text-teal-500" />,
};

const borders = {
  success: 'border-l-green-500',
  error: 'border-l-red-500',
  warning: 'border-l-amber-500',
  info: 'border-l-teal-500',
};

export default function Toast() {
  const { toasts, removeToast } = useAppStore();

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 pointer-events-none">
      {toasts.map(toast => (
        <div
          key={toast.id}
          className={`toast-enter pointer-events-auto flex items-start gap-3 bg-white rounded-xl shadow-2xl border border-slate-100 border-l-4 ${borders[toast.type] || borders.info} px-4 py-3 min-w-72 max-w-96`}
        >
          <div className="mt-0.5 shrink-0">{icons[toast.type] || icons.info}</div>
          <p className="text-sm text-slate-700 font-medium flex-1 leading-relaxed">{toast.message}</p>
          <button
            onClick={() => removeToast(toast.id)}
            className="shrink-0 text-slate-400 hover:text-slate-600 transition-colors mt-0.5"
          >
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}
