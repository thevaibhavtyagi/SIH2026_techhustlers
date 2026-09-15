import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff, User, Mail, Phone, Lock, MapPin, Shield, CheckCircle } from 'lucide-react';
import { INDIAN_STATES, DISTRICTS } from '../utils/constants';
import logo from '../assets/mplads-drishti-logo.png';

export default function Register() {
  const { register, error, clearError } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', mobile: '', password: '', confirmPassword: '', state: '', district: '', constituency: '', terms: false });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  const update = (key, val) => {
    setForm(f => ({ ...f, [key]: val }));
    setFieldErrors(e => ({ ...e, [key]: null }));
    clearError();
    if (key === 'state') setForm(f => ({ ...f, state: val, district: '', constituency: '' }));
  };

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Full name is required';
    if (!form.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) errs.email = 'Valid email required';
    if (!form.mobile.match(/^[6-9]\d{9}$/)) errs.mobile = 'Valid 10-digit mobile required';
    if (form.password.length < 6) errs.password = 'Min 6 characters';
    if (form.password !== form.confirmPassword) errs.confirmPassword = 'Passwords do not match';
    if (!form.state) errs.state = 'Select state';
    if (!form.district) errs.district = 'Select district';
    if (!form.terms) errs.terms = 'Accept terms to continue';
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    const result = register(form);
    setLoading(false);
    if (result.success) {
      navigate('/citizen/dashboard');
    }
  };

  const districts = DISTRICTS[form.state] || [];

  const Field = ({ label, icon: Icon, error: err, children }) => (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1.5">{label}</label>
      <div className="relative">
        {Icon && <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 z-10" />}
        {children}
      </div>
      {err && <p className="text-xs text-red-500 mt-1">{err}</p>}
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-xl">
        <div className="text-center mb-8">
          <Link to="/">
            <img src={logo} alt="MPLADS DRISHTI" className="w-16 h-16 mx-auto mb-4" />
          </Link>
          <h1 className="text-2xl font-bold text-slate-800">Create Citizen Account</h1>
          <p className="text-sm text-slate-500 mt-2 max-w-md mx-auto">
            Register to access public project information and participate in transparent development monitoring.
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
          {/* Role lock notice */}
          <div className="flex items-center gap-3 bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 mb-6">
            <Shield className="w-5 h-5 text-blue-600 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-blue-800">Account Role: <span className="font-bold">Citizen</span></p>
              <p className="text-xs text-blue-600 mt-0.5">New public accounts are registered as Citizens. Government/MP accounts are provisioned separately.</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Field label="Full Name" icon={User} error={fieldErrors.name}>
              <input type="text" value={form.name} onChange={(e) => update('name', e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-gov-blue-500 focus:ring-2 focus:ring-gov-blue-500/20"
                placeholder="Enter your full name" />
            </Field>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Email Address" icon={Mail} error={fieldErrors.email}>
                <input type="email" value={form.email} onChange={(e) => update('email', e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-gov-blue-500 focus:ring-2 focus:ring-gov-blue-500/20"
                  placeholder="email@example.com" />
              </Field>
              <Field label="Mobile Number" icon={Phone} error={fieldErrors.mobile}>
                <input type="tel" value={form.mobile} onChange={(e) => update('mobile', e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-gov-blue-500 focus:ring-2 focus:ring-gov-blue-500/20"
                  placeholder="10-digit mobile" maxLength={10} />
              </Field>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Password" icon={Lock} error={fieldErrors.password}>
                <input type={showPassword ? 'text' : 'password'} value={form.password} onChange={(e) => update('password', e.target.value)}
                  className="w-full pl-10 pr-11 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-gov-blue-500 focus:ring-2 focus:ring-gov-blue-500/20"
                  placeholder="Min 6 characters" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </Field>
              <Field label="Confirm Password" icon={Lock} error={fieldErrors.confirmPassword}>
                <input type="password" value={form.confirmPassword} onChange={(e) => update('confirmPassword', e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-gov-blue-500 focus:ring-2 focus:ring-gov-blue-500/20"
                  placeholder="Re-enter password" />
              </Field>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Field label="State" icon={MapPin} error={fieldErrors.state}>
                <select value={form.state} onChange={(e) => update('state', e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-gov-blue-500 focus:ring-2 focus:ring-gov-blue-500/20 bg-white appearance-none">
                  <option value="">Select State</option>
                  {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </Field>
              <Field label="District" icon={MapPin} error={fieldErrors.district}>
                <select value={form.district} onChange={(e) => update('district', e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-gov-blue-500 focus:ring-2 focus:ring-gov-blue-500/20 bg-white appearance-none">
                  <option value="">Select District</option>
                  {districts.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </Field>
              <Field label="Constituency (Optional)">
                <input type="text" value={form.constituency} onChange={(e) => update('constituency', e.target.value)}
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-gov-blue-500 focus:ring-2 focus:ring-gov-blue-500/20"
                  placeholder="Optional" />
              </Field>
            </div>

            <div>
              <label className="flex items-start gap-2 cursor-pointer">
                <input type="checkbox" checked={form.terms} onChange={(e) => update('terms', e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded border-slate-300 text-gov-blue-600 focus:ring-gov-blue-500" />
                <span className="text-sm text-slate-600">
                  I agree to the <button type="button" className="text-gov-blue-600 hover:underline">Terms of Service</button> and <button type="button" className="text-gov-blue-600 hover:underline">Privacy Policy</button>.
                </span>
              </label>
              {fieldErrors.terms && <p className="text-xs text-red-500 mt-1">{fieldErrors.terms}</p>}
            </div>

            {error && (
              <div className="bg-red-50 text-red-700 text-sm px-4 py-3 rounded-lg border border-red-200">{error}</div>
            )}

            <button type="submit" disabled={loading}
              className="w-full bg-navy-800 text-white font-semibold py-3 rounded-lg hover:bg-navy-900 transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
              {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <CheckCircle className="w-4 h-4" />}
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-sm text-slate-500 mt-6">
            Already have an account? <Link to="/login" className="text-gov-blue-600 font-medium hover:underline">Sign In</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
