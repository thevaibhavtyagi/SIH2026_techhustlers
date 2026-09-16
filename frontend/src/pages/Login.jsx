import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/common/Toast';
import { Eye, EyeOff, Lock, Mail, UserCog, Shield, ShieldCheck, TrendingUp, AlertTriangle, BarChart3, Activity, Globe, Fingerprint } from 'lucide-react';
import { LOGIN_ROLES, ROLE_DASHBOARD_PATH } from '../utils/constants';
import logo from '../assets/mplads-drishti-logo.png';

export default function Login() {
  const { login, clearError } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const isFormValid = email.trim() !== '' && password.trim() !== '' && role !== '';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isFormValid) return;

    setLoading(true);
    clearError();

    const result = await login(email, password, role);
    setLoading(false);

    if (result.success) {
      toast.success(`Welcome, ${result.user.name}!`, 'Login Successful');
      navigate(ROLE_DASHBOARD_PATH[result.user.role] || '/dashboard');
    } else {
      toast.error(result.error || 'Invalid Credentials', 'Authentication Failed');
    }
  };

  return (
    <div className="h-screen overflow-hidden flex">
      {/* ========== Left Panel — Official Logo Visual ========== */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-sky-50 via-sky-100/50 to-white flex-col items-center justify-center relative border-r border-sky-100/60 p-6">
        {/* Subtle background decoration */}
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
          <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-sky-200/40 blur-[100px]" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-blue-200/30 blur-[100px]" />
        </div>

        <Link to="/" className="relative z-10 w-full max-w-xl flex flex-col items-center justify-center group">
          
          {/* Top Context - Official Ministry Badge */}
          <div className="z-20 flex items-center gap-3 px-5 py-2 bg-white/60 backdrop-blur-md border border-slate-200/50 rounded-full shadow-sm transform group-hover:-translate-y-0.5 transition-transform duration-500">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-extrabold text-navy-800 tracking-[0.2em] uppercase">
              Ministry of Statistics & Programme Implementation
            </span>
          </div>

          {/* Main Logo Container */}
          <div className="relative w-full flex justify-center -my-10 z-10">
             <div className="absolute inset-0 bg-sky-300/20 rounded-full blur-[80px] opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
             <img 
               src={logo} 
               alt="MPLADS Platform" 
               className="relative w-full max-w-[54rem] max-h-[75vh] object-contain drop-shadow-2xl group-hover:scale-[1.02] transition-transform duration-700 group-hover:drop-shadow-[0_20px_40px_rgba(14,165,233,0.25)]"
             />
          </div>
          
          {/* Bottom Context - Premium Capabilities Card */}
          <div className="-mt-10 z-20 relative max-w-sm text-center bg-white/60 backdrop-blur-md border border-white p-5 rounded-3xl shadow-xl shadow-sky-100/50 transform group-hover:-translate-y-1 transition-transform duration-500">
            <h3 className="text-[15px] font-bold text-navy-900 mb-1.5 tracking-tight">
              Intelligent Oversight Platform
            </h3>
            <p className="text-[12.5px] text-slate-600 leading-relaxed font-medium">
              Empowering authorities with AI-driven analytics, real-time anomaly detection, and comprehensive financial tracking for national development.
            </p>
          </div>
        </Link>
      </div>

      {/* ========== Right Panel — Login Form ========== */}
      <div className="lg:w-1/2 w-full flex items-center justify-center px-6 py-8 bg-slate-50">
        {/* Increased form size from max-w-md to max-w-lg (wider) and increased padding */}
        <div className="w-full max-w-lg bg-white p-12 rounded-[2rem] shadow-2xl shadow-slate-200/60 border border-slate-100">
          {/* Mobile-only header */}
          <div className="lg:hidden flex items-center gap-4 mb-10">
            <Link to="/" className="bg-slate-50 p-2 rounded-full border border-slate-200 hover:bg-slate-100 transition-colors">
              <img src={logo} alt="MPLADS DRISHTI" className="w-12 h-12" />
            </Link>
            <div>
              <h1 className="font-bold text-navy-800 text-lg">MPLADS DRISHTI</h1>
              <p className="text-[10px] text-slate-500 tracking-widest uppercase">Securing Development Funds</p>
            </div>
          </div>

          <div className="mb-10 text-center">
            <h2 className="text-3xl font-extrabold text-slate-800 mb-3 tracking-tight">Welcome Back</h2>
            <p className="text-base text-slate-500">Sign in to access the MPLADS intelligence platform.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-7">
            {/* Email */}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2.5">Email Address</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-gov-blue-600 transition-colors" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); clearError(); }}
                  className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-base focus:outline-none focus:bg-white focus:border-gov-blue-500 focus:ring-4 focus:ring-gov-blue-500/15 transition-all shadow-sm"
                  placeholder="Enter your official email"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2.5">Password</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-gov-blue-600 transition-colors" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); clearError(); }}
                  className="w-full pl-12 pr-12 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-base focus:outline-none focus:bg-white focus:border-gov-blue-500 focus:ring-4 focus:ring-gov-blue-500/15 transition-all shadow-sm"
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Role Select */}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2.5">Login As</label>
              <div className="relative group">
                <UserCog className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-gov-blue-600 transition-colors z-10" />
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full pl-12 pr-10 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-base focus:outline-none focus:bg-white focus:border-gov-blue-500 focus:ring-4 focus:ring-gov-blue-500/15 appearance-none transition-all cursor-pointer font-medium text-slate-700 shadow-sm"
                >
                  <option value="" className="text-slate-400">Select your role</option>
                  {LOGIN_ROLES.map(r => (
                    <option key={r.value} value={r.value}>{r.label}</option>
                  ))}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                  <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || !isFormValid}
              className="w-full bg-gradient-to-r from-navy-800 to-gov-blue-700 text-white font-bold text-lg py-4 rounded-xl hover:from-navy-900 hover:to-gov-blue-800 transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-lg shadow-navy-800/25 hover:shadow-xl hover:shadow-navy-800/40 mt-4 group"
            >
              {loading ? (
                <>
                  <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Authenticating...
                </>
              ) : (
                <>
                  <Lock className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  Access Dashboard
                </>
              )}
            </button>
          </form>

          {/* Footer note */}
          <div className="mt-10 pt-8 border-t border-slate-100">
            <div className="flex items-start sm:items-center justify-center gap-2 text-xs text-slate-400 font-medium leading-relaxed max-w-sm mx-auto">
              <ShieldCheck className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5 sm:mt-0" strokeWidth={2.5} />
              <p className="text-left sm:text-center">
                This is a secure government portal. Unauthorized access is strictly prohibited and actively monitored.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
