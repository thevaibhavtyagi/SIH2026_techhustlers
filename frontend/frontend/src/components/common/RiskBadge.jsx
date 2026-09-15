import { getRiskLevel } from '../../utils/formatters';
import { AlertTriangle, AlertCircle, AlertOctagon, CheckCircle } from 'lucide-react';

const config = {
  Critical: { color: 'text-red-700 bg-red-100 border-red-300', icon: AlertOctagon },
  High: { color: 'text-orange-700 bg-orange-100 border-orange-300', icon: AlertCircle },
  Moderate: { color: 'text-amber-700 bg-amber-100 border-amber-300', icon: AlertTriangle },
  Low: { color: 'text-green-700 bg-green-100 border-green-300', icon: CheckCircle },
};

export default function RiskBadge({ score, showScore = true, size = 'md' }) {
  const level = getRiskLevel(score);
  const { color, icon: Icon } = config[level] || config.Low;
  const sizeClass = size === 'sm' ? 'text-[11px] px-2 py-0.5 gap-1' : 'text-xs px-2.5 py-1 gap-1.5';

  return (
    <span className={`inline-flex items-center font-medium border rounded-full ${color} ${sizeClass}`}>
      <Icon className={size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} />
      {level}
      {showScore && <span className="font-mono">({score})</span>}
    </span>
  );
}

export function StatusBadge({ status, size = 'md' }) {
  const colors = {
    'On Track': 'text-green-700 bg-green-50 border-green-200',
    'Completed': 'text-blue-700 bg-blue-50 border-blue-200',
    'Delayed': 'text-amber-700 bg-amber-50 border-amber-200',
    'Under Review': 'text-purple-700 bg-purple-50 border-purple-200',
    'High Risk': 'text-red-700 bg-red-50 border-red-200',
    'New': 'text-blue-700 bg-blue-50 border-blue-200',
    'Assigned': 'text-indigo-700 bg-indigo-50 border-indigo-200',
    'Investigating': 'text-amber-700 bg-amber-50 border-amber-200',
    'Resolved': 'text-green-700 bg-green-50 border-green-200',
    'Under Investigation': 'text-orange-700 bg-orange-50 border-orange-200',
    'Awaiting Verification': 'text-purple-700 bg-purple-50 border-purple-200',
  };
  const c = colors[status] || 'text-gray-700 bg-gray-50 border-gray-200';
  const sizeClass = size === 'sm' ? 'text-[11px] px-2 py-0.5' : 'text-xs px-2.5 py-1';

  return (
    <span className={`inline-flex items-center font-medium border rounded-full ${c} ${sizeClass}`}>
      {status}
    </span>
  );
}

export function SeverityBadge({ severity, size = 'md' }) {
  const colors = {
    'Critical': 'text-red-700 bg-red-100 border-red-300',
    'High': 'text-orange-700 bg-orange-100 border-orange-300',
    'Medium': 'text-amber-700 bg-amber-100 border-amber-300',
    'Low': 'text-green-700 bg-green-100 border-green-300',
  };
  const c = colors[severity] || 'text-gray-700 bg-gray-100 border-gray-300';
  const sizeClass = size === 'sm' ? 'text-[11px] px-2 py-0.5' : 'text-xs px-2.5 py-1';

  return (
    <span className={`inline-flex items-center font-semibold border rounded-full ${c} ${sizeClass}`}>
      {severity}
    </span>
  );
}
