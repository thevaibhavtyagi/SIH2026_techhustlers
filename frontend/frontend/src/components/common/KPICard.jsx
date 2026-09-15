import { useEffect, useState, useRef } from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

export default function KPICard({ icon: Icon, label, value, prefix = '', suffix = '', trend, trendLabel, color = 'blue', className = '' }) {
  const [displayValue, setDisplayValue] = useState(0);
  const ref = useRef(null);
  const numericValue = typeof value === 'number' ? value : parseFloat(String(value).replace(/[^0-9.]/g, ''));

  useEffect(() => {
    if (isNaN(numericValue)) {
      setDisplayValue(value);
      return;
    }
    let start = 0;
    const duration = 1200;
    const startTime = performance.now();
    const animate = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      start = eased * numericValue;
      setDisplayValue(numericValue >= 100 ? Math.round(start).toLocaleString('en-IN') : start.toFixed(1));
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [numericValue, value]);

  const colorMap = {
    blue: 'from-gov-blue-500/10 to-gov-blue-500/5 border-gov-blue-200',
    green: 'from-green-500/10 to-green-500/5 border-green-200',
    red: 'from-red-500/10 to-red-500/5 border-red-200',
    amber: 'from-amber-500/10 to-amber-500/5 border-amber-200',
    indigo: 'from-indigo-500/10 to-indigo-500/5 border-indigo-200',
    purple: 'from-purple-500/10 to-purple-500/5 border-purple-200',
  };

  const iconColorMap = {
    blue: 'text-gov-blue-600 bg-gov-blue-100',
    green: 'text-green-600 bg-green-100',
    red: 'text-red-600 bg-red-100',
    amber: 'text-amber-600 bg-amber-100',
    indigo: 'text-indigo-600 bg-indigo-100',
    purple: 'text-purple-600 bg-purple-100',
  };

  return (
    <div ref={ref} className={`bg-gradient-to-br ${colorMap[color]} border rounded-xl p-5 animate-fade-in ${className}`}>
      <div className="flex items-start justify-between mb-3">
        <div className={`p-2.5 rounded-lg ${iconColorMap[color]}`}>
          {Icon && <Icon className="w-5 h-5" />}
        </div>
        {trend !== undefined && (
          <div className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${
            trend > 0 ? 'text-green-700 bg-green-100' : trend < 0 ? 'text-red-700 bg-red-100' : 'text-slate-500 bg-slate-100'
          }`}>
            {trend > 0 ? <TrendingUp className="w-3 h-3" /> : trend < 0 ? <TrendingDown className="w-3 h-3" /> : <Minus className="w-3 h-3" />}
            {Math.abs(trend)}%
          </div>
        )}
      </div>
      <p className="text-2xl font-bold text-slate-800 tracking-tight">
        {prefix}{displayValue}{suffix}
      </p>
      <p className="text-sm text-slate-500 mt-1 font-medium">{label}</p>
      {trendLabel && <p className="text-xs text-slate-400 mt-0.5">{trendLabel}</p>}
    </div>
  );
}
