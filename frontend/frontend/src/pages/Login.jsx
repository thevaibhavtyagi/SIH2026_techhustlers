import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff, Lock, Mail, Copy, Check, Shield, BarChart3, MapPin, AlertTriangle } from 'lucide-react';
import { DEMO_CREDENTIALS } from '../utils/constants';
import logo from '../assets/mplads-drishti-logo.png';

export default function Login() {
  const { login, error, clearError } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    clearError();
    const result = login(email, password);
    setLoading(false);
    if (result.success) {
      const routes = { admin: '/admin/dashboard', mp: '/mp/dashboard', citizen: '/citizen/dashboard' };
      navigate(routes[result.user.role] || '/');
    }
  };

  const fillCredentials = (cred) => {
    setEmail(cred.email);
    setPassword(cred.password);
    clearError();
  };

  const copyText = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 1500);
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel */}
      <div className="hidden lg:flex lg:w-1/2 gradient-hero text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-80 h-80 rounded-full border border-white/30" />
          <div className="absolute bottom-20 right-10 w-60 h-60 rounded-full border border-white/20" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full border border-white/10" />
        </div>
        <div className="relative z-10 flex flex-col justify-center px-16">
          <img src={logo} alt="MPLADS DRISHTI" className="w-32 h-32 mb-8" />
          <h1 className="text-3xl font-bold mb-3">MPLADS DRISHTI</h1>
          <p className="text-sm text-slate-300 tracking-widest uppercase mb-8">Transparent Development • Stronger India</p>
          <div className="space-y-4">
            {[
              { icon: Shield, text: 'AI-powered anomaly detection across 12,000+ projects' },
              { icon: BarChart3, text: 'Real-time expenditure tracking with risk scoring' },
              { icon: MapPin, text: 'Geographic intelligence with state-level drill-down' },
              { icon: AlertTriangle, text: 'Explainable AI — know WHY a project was flagged' },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3 text-sm text-slate-300">
                <item.icon className="w-5 h-5 text-indigo-300 flex-shrink-0" />
                <span>{item.text}</span>
              </div>
            ))}
          </div>
          <div className="mt-12 pt-8 border-t border-white/10">
            <p className="text-xs text-slate-400">Smart India Hackathon 2026 • Problem #26102</p>
            <p className="text-xs text-slate-500 mt-1">Ministry of Statistics & Programme Implementation</p>
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-slate-50">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <img src={logo} alt="MPLADS DRISHTI" className="w-12 h-12" />
            <div>
              <h1 className="font-bold text-navy-800">MPLADS DRISHTI</h1>
              <p className="text-[10px] text-slate-500 tracking-widest uppercase">Transparent Development</p>
            </div>
          </div>

          <h2 className="text-2xl font-bold text-slate-800 mb-1">Welcome Back</h2>
          <p className="text-sm text-slate-500 mb-8">Sign in to access the MPLADS intelligence platform.</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); clearError(); }}
                  className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-gov-blue-500 focus:ring-2 focus:ring-gov-blue-500/20 transition-all"
                  placeholder="Enter your email"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); clearError(); }}
                  className="w-full pl-10 pr-11 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-gov-blue-500 focus:ring-2 focus:ring-gov-blue-500/20 transition-all"
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} className="w-4 h-4 rounded border-slate-300 text-gov-blue-600 focus:ring-gov-blue-500" />
                <span className="text-sm text-slate-600">Remember me</span>
              </label>
              <button type="button" className="text-sm text-gov-blue-600 hover:text-gov-blue-700 font-medium" onClick={() => alert('Demo prototype — contact administrator for password reset.')}>
                Forgot password?
              </button>
            </div>

            {error && (
              <div className="bg-red-50 text-red-700 text-sm px-4 py-3 rounded-lg border border-red-200">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-navy-800 text-white font-semibold py-3 rounded-lg hover:bg-navy-900 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Lock className="w-4 h-4" />}
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <p className="text-center text-sm text-slate-500 mt-6">
            Don't have an account?{' '}
            <Link to="/register" className="text-gov-blue-600 font-medium hover:underline">Register as Citizen</Link>
          </p>

          {/* Demo Credentials */}
          <div className="mt-8 bg-white border border-slate-200 rounded-xl overflow-hidden">
            <div className="px-4 py-3 bg-slate-50 border-b border-slate-200">
              <h3 className="text-sm font-semibold text-slate-700">🔑 Demo Access</h3>
            </div>
            <div className="divide-y divide-slate-100">
              {DEMO_CREDENTIALS.map((cred, i) => (
                <div key={i} className="px-4 py-3 hover:bg-slate-50 cursor-pointer" onClick={() => fillCredentials(cred)}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold text-slate-700">{cred.role}</span>
                    <button
                      onClick={(e) => { e.stopPropagation(); copyText(cred.email, `email-${i}`); }}
                      className="text-slate-400 hover:text-slate-600"
                    >
                      {copied === `email-${i}` ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                  <p className="text-xs text-slate-500 font-mono">{cred.email}</p>
                  <p className="text-xs text-slate-400 font-mono">{'•'.repeat(cred.password.length)}</p>
                </div>
              ))}
            </div>
            <p className="px-4 py-2 text-[10px] text-slate-400 bg-slate-50 border-t border-slate-100">Click to auto-fill credentials</p>
          </div>
        </div>
      </div>
    </div>
  );
}
