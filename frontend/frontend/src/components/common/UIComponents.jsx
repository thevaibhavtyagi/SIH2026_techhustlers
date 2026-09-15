import { X } from 'lucide-react';
import { useEffect } from 'react';

export function Modal({ isOpen, onClose, title, children, maxWidth = 'max-w-2xl' }) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      const handleEsc = (e) => { if (e.key === 'Escape') onClose(); };
      document.addEventListener('keydown', handleEsc);
      return () => { document.body.style.overflow = ''; document.removeEventListener('keydown', handleEsc); };
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative bg-white rounded-2xl shadow-2xl w-full ${maxWidth} max-h-[85vh] overflow-hidden animate-fade-in`}>
        {title && (
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
            <h2 className="text-lg font-semibold text-slate-800">{title}</h2>
            <button onClick={onClose} className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors">
              <X className="w-5 h-5 text-slate-500" />
            </button>
          </div>
        )}
        <div className="overflow-y-auto max-h-[calc(85vh-60px)] p-6">{children}</div>
      </div>
    </div>
  );
}

export function Drawer({ isOpen, onClose, title, children, width = 'w-[480px]' }) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      const handleEsc = (e) => { if (e.key === 'Escape') onClose(); };
      document.addEventListener('keydown', handleEsc);
      return () => { document.body.style.overflow = ''; document.removeEventListener('keydown', handleEsc); };
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className={`absolute right-0 top-0 h-full ${width} bg-white shadow-2xl overflow-hidden animate-slide-right`}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <h2 className="text-lg font-semibold text-slate-800">{title}</h2>
          <button onClick={onClose} className="p-1.5 hover:bg-slate-200 rounded-lg transition-colors">
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>
        <div className="overflow-y-auto h-[calc(100%-60px)] p-6">{children}</div>
      </div>
    </div>
  );
}

export function ConfirmDialog({ isOpen, onClose, onConfirm, title, message, confirmLabel = 'Confirm', variant = 'primary' }) {
  if (!isOpen) return null;

  const btnColor = variant === 'danger'
    ? 'bg-red-600 hover:bg-red-700 text-white'
    : 'bg-navy-800 hover:bg-navy-900 text-white';

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} maxWidth="max-w-md">
      <p className="text-sm text-slate-600 mb-6">{message}</p>
      <div className="flex gap-3 justify-end">
        <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg">
          Cancel
        </button>
        <button onClick={onConfirm} className={`px-4 py-2 text-sm font-medium rounded-lg ${btnColor}`}>
          {confirmLabel}
        </button>
      </div>
    </Modal>
  );
}

export function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      {Icon && (
        <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
          <Icon className="w-8 h-8 text-slate-400" />
        </div>
      )}
      <h3 className="text-lg font-semibold text-slate-700 mb-1">{title}</h3>
      {description && <p className="text-sm text-slate-500 max-w-md">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function LoadingState({ rows = 5, className = '' }) {
  return (
    <div className={`animate-pulse space-y-4 ${className}`}>
      {[...Array(rows)].map((_, i) => (
        <div key={i} className="flex gap-4">
          <div className="h-10 bg-slate-100 rounded-lg flex-1" />
          <div className="h-10 bg-slate-100 rounded-lg w-24" />
          <div className="h-10 bg-slate-100 rounded-lg w-20" />
        </div>
      ))}
    </div>
  );
}

export function ProgressBar({ value, max = 100, color = 'blue', showLabel = true, className = '' }) {
  const pct = Math.min((value / max) * 100, 100);
  const colorMap = {
    blue: 'bg-gov-blue-500',
    green: 'bg-green-500',
    red: 'bg-red-500',
    amber: 'bg-amber-500',
    auto: pct >= 80 ? 'bg-green-500' : pct >= 50 ? 'bg-amber-500' : 'bg-red-500',
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-1000 ease-out ${colorMap[color]}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      {showLabel && <span className="text-xs font-medium text-slate-600 w-10 text-right">{Math.round(pct)}%</span>}
    </div>
  );
}

export function Timeline({ items, className = '' }) {
  return (
    <div className={`relative ${className}`}>
      <div className="absolute left-4 top-2 bottom-2 w-0.5 bg-slate-200" />
      {items.map((item, i) => (
        <div key={i} className="relative flex gap-4 pb-6 last:pb-0">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 z-10 ${
            i === 0 ? 'bg-navy-800 text-white' : 'bg-slate-200 text-slate-500'
          }`}>
            <div className={`w-2.5 h-2.5 rounded-full ${i === 0 ? 'bg-white' : 'bg-slate-400'}`} />
          </div>
          <div className="flex-1 pt-1">
            <p className="text-sm font-medium text-slate-800">{item.event || item.status}</p>
            {item.detail && <p className="text-xs text-slate-500 mt-0.5">{item.detail}</p>}
            {item.text && <p className="text-xs text-slate-500 mt-0.5">{item.text}</p>}
            <p className="text-[11px] text-slate-400 mt-1">
              {item.date} {item.by ? `• ${item.by}` : ''} {item.author ? `• ${item.author}` : ''}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

export function AIInsightCard({ title, children, className = '' }) {
  return (
    <div className={`relative overflow-hidden rounded-xl border border-indigo-200 bg-gradient-to-br from-indigo-50/80 to-purple-50/40 p-5 ${className}`}>
      <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full -translate-y-1/2 translate-x-1/2" />
      <div className="flex items-center gap-2 mb-3">
        <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center">
          <span className="text-xs">✨</span>
        </div>
        <h3 className="text-sm font-semibold text-indigo-900">{title || 'AI Insight'}</h3>
        <span className="text-[10px] font-medium text-indigo-600 bg-indigo-100 px-2 py-0.5 rounded-full">AI Generated</span>
      </div>
      <div className="relative text-sm text-slate-700">{children}</div>
    </div>
  );
}

export function PageHeader({ title, subtitle, children, className = '' }) {
  return (
    <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 ${className}`}>
      <div>
        <h1 className="text-2xl font-bold text-slate-800">{title}</h1>
        {subtitle && <p className="text-sm text-slate-500 mt-1">{subtitle}</p>}
      </div>
      {children && <div className="flex items-center gap-3">{children}</div>}
    </div>
  );
}

export function ChartCard({ title, subtitle, children, className = '', action }) {
  return (
    <div className={`bg-white rounded-xl border border-slate-200 overflow-hidden ${className}`}>
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
        <div>
          <h3 className="text-sm font-semibold text-slate-800">{title}</h3>
          {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
        </div>
        {action}
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

export function FilterBar({ filters, values, onChange, className = '' }) {
  return (
    <div className={`flex flex-wrap items-center gap-3 ${className}`}>
      {filters.map(f => (
        <select
          key={f.key}
          value={values[f.key] || ''}
          onChange={(e) => onChange({ ...values, [f.key]: e.target.value })}
          className="text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white text-slate-700 focus:outline-none focus:border-gov-blue-500 focus:ring-1 focus:ring-gov-blue-500/30"
        >
          <option value="">{f.label}</option>
          {f.options.map(o => (
            <option key={o} value={o}>{o}</option>
          ))}
        </select>
      ))}
    </div>
  );
}
