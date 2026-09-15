import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/common/Toast';
import { Eye, EyeOff, Lock, Mail, Copy, Check, Shield, BarChart3, MapPin, AlertTriangle } from 'lucide-react';
import { DEMO_CREDENTIALS } from '../utils/constants';
import logo from '../assets/mplads-drishti-logo.png';

export default function Login() {
  const { login, clearError } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(null);

  const isFormValid = email.trim() !== '' && password.trim() !== '';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isFormValid) return;

    setLoading(true);
    clearError();

    // Simulate authentication delay for realism
    setTimeout(() => {
      const result = login(email, password);
      setLoading(false);

      if (result.success) {
        // Token simulation — in production this comes from backend
        const token = 'jwt_' + btoa(JSON.stringify({ role: result.user.role, ts: Date.now() }));
        localStorage.setItem('mplads_token', token);

        toast.success(`Welcome, ${result.user.name}!`, 'Login Successful');
        navigate('/dashboard');
      } else {
        // Red toast notification for invalid credentials
        toast.error('Invalid Credentials', 'Authentication Failed');
      }
    }, 1200);
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
      {/* Left Panel — Decorative */}
      <div className="hidden lg:flex lg:w-1/2 gradient-hero text-white relative overflow-hidden">
        {/* Background decorations */}
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute top-20 left-10 w-80 h-80 rounded-full border border-white/30" />
          <div className="absolute bottom-20 right-10 w-60 h-60 rounded-full border border-white/20" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full border border-white/10" />
        </div>

        {/* Blurred dashboard mockup overlay */}
        <div className="absolute inset-0 opacity-5 pointer-events-none">
          <div className="absolute top-32 left-12 right-12 bottom-32 border border-white/20 rounded-2xl">
            <div className="p-6 space-y-4">
              <div className="flex gap-4">
                <div className="h-20 flex-1 rounded-lg bg-white/20" />
                <div className="h-20 flex-1 rounded-lg bg-white/20" />
                <div className="h-20 flex-1 rounded-lg bg-white/20" />
              </div>
              <div className="h-40 rounded-lg bg-white/15" />
              <div className="flex gap-4">
                <div className="h-28 flex-1 rounded-lg bg-white/10" />
                <div className="h-28 flex-1 rounded-lg bg-white/10" />
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-10 flex flex-col justify-center px-16">
          <img src={logo} alt="MPLADS DRISHTI" className="w-28 h-28 mb-8 animate-fade-in" />

          <h1 className="text-3xl font-bold mb-3 animate-fade-in">
            Securing National<br />
            <span className="bg-gradient-to-r from-indigo-300 to-cyan-300 bg-clip-text text-transparent">
              Development Funds
            </span>
          </h1>

          <p className="text-sm text-slate-300 tracking-widest uppercase mb-10 animate-slide-up">
            MPLADS DRISHTI • AI-Powered Monitoring
          </p>

          <div className="space-y-4 animate-slide-up">
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

          <div className="mt-14 pt-8 border-t border-white/10">
            <p className="text-xs text-slate-400">Smart India Hackathon 2026 • Problem #26102</p>
            <p className="text-xs text-slate-500 mt-1">Ministry of Statistics & Programme Implementation</p>
          </div>
        </div>
      </div>

      {/* Right Panel — Login Form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-white">
        <div className="w-full max-w-md">
          {/* Mobile-only header */}
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <img src={logo} alt="MPLADS DRISHTI" className="w-12 h-12" />
            <div>
              <h1 className="font-bold text-navy-800">MPLADS DRISHTI</h1>
              <p className="text-[10px] text-slate-500 tracking-widest uppercase">Securing Development Funds</p>
            </div>
          </div>

          <h2 className="text-2xl font-bold text-slate-800 mb-1">Welcome Back</h2>
          <p className="text-sm text-slate-500 mb-8">Sign in to access the MPLADS intelligence platform.</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
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

            {/* Password */}
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

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || !isFormValid}
              className="w-full bg-navy-800 text-white font-semibold py-3 rounded-lg hover:bg-navy-900 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Authenticating...
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  Login
                </>
              )}
            </button>
          </form>

          {/* Demo Credentials */}
          <div className="mt-8 bg-slate-50 border border-slate-200 rounded-xl overflow-hidden">
            <div className="px-4 py-3 bg-slate-100 border-b border-slate-200">
              <h3 className="text-sm font-semibold text-slate-700">🔑 Demo Access</h3>
              <p className="text-[10px] text-slate-500 mt-0.5">Click any role to auto-fill credentials</p>
            </div>
            <div className="divide-y divide-slate-100">
              {DEMO_CREDENTIALS.map((cred, i) => (
                <div
                  key={i}
                  className="px-4 py-3 hover:bg-white cursor-pointer transition-colors"
                  onClick={() => fillCredentials(cred)}
                >
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
          </div>
        </div>
      </div>
    </div>
  );
}
