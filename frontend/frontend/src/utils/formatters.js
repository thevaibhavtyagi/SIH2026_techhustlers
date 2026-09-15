// ========== Currency Formatting ==========
export const formatCurrency = (amount, options = {}) => {
  const { compact = true } = options;
  if (amount === null || amount === undefined) return '—';

  const abs = Math.abs(amount);
  if (compact) {
    if (abs >= 10000000) {
      return `₹${(amount / 10000000).toFixed(abs >= 100000000 ? 0 : 1)} Cr`;
    }
    if (abs >= 100000) {
      return `₹${(amount / 100000).toFixed(1)} Lakh`;
    }
    if (abs >= 1000) {
      return `₹${(amount / 1000).toFixed(1)}K`;
    }
  }
  return `₹${amount.toLocaleString('en-IN')}`;
};

export const formatCurrencyFull = (amount) => {
  if (amount === null || amount === undefined) return '—';
  return `₹${amount.toLocaleString('en-IN')}`;
};

// ========== Number Formatting ==========
export const formatNumber = (n) => {
  if (n === null || n === undefined) return '—';
  return n.toLocaleString('en-IN');
};

// ========== Date Formatting ==========
export const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
};

export const formatDateTime = (dateStr) => {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });
};

export const timeAgo = (dateStr) => {
  if (!dateStr) return '';
  const now = new Date();
  const d = new Date(dateStr);
  const diff = Math.floor((now - d) / 1000);
  if (diff < 60) return 'Just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return formatDate(dateStr);
};

// ========== Percentage ==========
export const formatPercentage = (n, decimals = 1) => {
  if (n === null || n === undefined) return '—';
  return `${n.toFixed(decimals)}%`;
};

// ========== Risk Levels ==========
export const getRiskLevel = (score) => {
  if (score >= 75) return 'Critical';
  if (score >= 60) return 'High';
  if (score >= 40) return 'Moderate';
  return 'Low';
};

export const getRiskColor = (score) => {
  if (score >= 75) return 'text-red-600 bg-red-50 border-red-200';
  if (score >= 60) return 'text-orange-600 bg-orange-50 border-orange-200';
  if (score >= 40) return 'text-amber-600 bg-amber-50 border-amber-200';
  return 'text-green-600 bg-green-50 border-green-200';
};

export const getRiskDotColor = (score) => {
  if (score >= 75) return 'bg-red-500';
  if (score >= 60) return 'bg-orange-500';
  if (score >= 40) return 'bg-amber-500';
  return 'bg-green-500';
};

export const getRiskBgClass = (level) => {
  const map = {
    'Critical': 'bg-red-500',
    'High': 'bg-orange-500',
    'Moderate': 'bg-amber-500',
    'Low': 'bg-green-500',
  };
  return map[level] || 'bg-gray-500';
};

// ========== Status Colors ==========
export const getStatusColor = (status) => {
  const map = {
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
  return map[status] || 'text-gray-700 bg-gray-50 border-gray-200';
};

export const getSeverityColor = (severity) => {
  const map = {
    'Critical': 'text-red-700 bg-red-100 border-red-300',
    'High': 'text-orange-700 bg-orange-100 border-orange-300',
    'Medium': 'text-amber-700 bg-amber-100 border-amber-300',
    'Low': 'text-green-700 bg-green-100 border-green-300',
  };
  return map[severity] || 'text-gray-700 bg-gray-100 border-gray-300';
};

// ========== Truncation ==========
export const truncate = (str, len = 40) => {
  if (!str) return '';
  return str.length > len ? str.slice(0, len) + '…' : str;
};

// ========== Delay ==========
export const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
