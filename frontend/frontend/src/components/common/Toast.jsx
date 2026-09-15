import { useState, createContext, useContext, useCallback } from 'react';
import { X, CheckCircle, AlertTriangle, AlertCircle, Info } from 'lucide-react';

const ToastContext = createContext(null);

const ICONS = {
  success: CheckCircle,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info,
};

const COLORS = {
  success: 'bg-green-50 border-green-300 text-green-800',
  error: 'bg-red-50 border-red-300 text-red-800',
  warning: 'bg-amber-50 border-amber-300 text-amber-800',
  info: 'bg-blue-50 border-blue-300 text-blue-800',
};

const ICON_COLORS = {
  success: 'text-green-500',
  error: 'text-red-500',
  warning: 'text-amber-500',
  info: 'text-blue-500',
};

function ToastItem({ toast, onRemove }) {
  const Icon = ICONS[toast.type] || Info;
  return (
    <div className={`flex items-start gap-3 px-4 py-3 rounded-lg border shadow-lg animate-slide-up max-w-sm ${COLORS[toast.type]}`}>
      <Icon className={`w-5 h-5 mt-0.5 flex-shrink-0 ${ICON_COLORS[toast.type]}`} />
      <div className="flex-1 min-w-0">
        {toast.title && <p className="font-semibold text-sm">{toast.title}</p>}
        <p className="text-sm">{toast.message}</p>
      </div>
      <button onClick={() => onRemove(toast.id)} className="flex-shrink-0 hover:opacity-70">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info', title = null, duration = 4000) => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, message, type, title }]);
    if (duration > 0) {
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== id));
      }, duration);
    }
    return id;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const toast = useCallback({
    success: (msg, title) => addToast(msg, 'success', title),
    error: (msg, title) => addToast(msg, 'error', title),
    warning: (msg, title) => addToast(msg, 'warning', title),
    info: (msg, title) => addToast(msg, 'info', title),
  }, [addToast]);

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2">
        {toasts.map(t => (
          <ToastItem key={t.id} toast={t} onRemove={removeToast} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within ToastProvider');
  return context;
}
