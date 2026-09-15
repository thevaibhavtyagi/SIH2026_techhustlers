import { useState } from 'react';
import { Link } from 'react-router-dom';
import { adminApi } from '../services/api';
import { useToast } from '../components/common/Toast';
import { Eye, EyeOff, User, Mail, Lock, UserCog, CheckCircle, Shield } from 'lucide-react';
import { SIGNUP_ROLES, INDIAN_STATES, DISTRICTS } from '../utils/constants';
import logo from '../assets/mplads-drishti-logo.png';

// Admin-only: provisions admin / district_nodal / mp accounts via the real
// backend (POST /api/users). Mounted at /admin/provision-account, gated by
// ProtectedRoute allowedRoles={['admin']] — never a public route.
export default function Signup() {
  const toast = useToast();
  const [form, setForm] = useState({ name: '', email: '', password: '', role: '', state: '', district: '', constituency: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [error, setError] = useState(null);

  const update = (key, val) => {
    setForm(f => {
      const next = { ...f, [key]: val };
      if (key === 'state') next.district = '';
      return next;
    });
    setFieldErrors(e => ({ ...e, [key]: null }));
    setError(null);
  };

  // MP dashboards are scoped by constituency, district dashboards by
  // district — without these the role's dashboard has nothing to query.
  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Full name is required';
    if (!form.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) errs.email = 'Valid email required';
    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(form.password)) {
      errs.password = 'Min 8 characters, with uppercase, lowercase & a number';
    }
    if (!form.role) errs.role = 'Select a role';
    if (form.role === 'mp' && !form.constituency.trim()) errs.constituency = 'Constituency is required for an MP account';
    if (form.role === 'district_nodal' && !form.state) errs.state = 'State is required for a District Authority account';
    if (form.role === 'district_nodal' && !form.district) errs.district = 'District is required for a District Authority account';
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setError(null);

    try {
      const user = await adminApi.createUser(form);
      toast.success(`${user.name} (${user.role}) can now log in with the password you set.`, 'Account Created');
      setForm({ name: '', email: '', password: '', role: '', state: '', district: '', constituency: '' });
    } catch (err) {
      const message = err?.response?.data?.message || 'Could not create the account. Please try again.';
      setError(message);
      toast.error(message, 'Registration Failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <Link to="/">
            <img src={logo} alt="MPLADS DRISHTI" className="w-16 h-16 mx-auto mb-4" />
          </Link>
          <h1 className="text-2xl font-bold text-slate-800">Internal Account Setup</h1>
          <p className="text-sm text-slate-500 mt-2">
            Create authorized government portal accounts. This page is for internal use only.
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
          {/* Internal-only notice */}
          <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 mb-6">
            <Shield className="w-5 h-5 text-amber-600 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-amber-800">Restricted Access</p>
              <p className="text-xs text-amber-600 mt-0.5">Only authorized personnel can create accounts. Public registration is not available.</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => update('name', e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-gov-blue-500 focus:ring-2 focus:ring-gov-blue-500/20 transition-all"
                  placeholder="Enter full name"
                />
              </div>
              {fieldErrors.name && <p className="text-xs text-red-500 mt-1">{fieldErrors.name}</p>}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => update('email', e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-gov-blue-500 focus:ring-2 focus:ring-gov-blue-500/20 transition-all"
                  placeholder="official@mpladsdrishti.gov.in"
                />
              </div>
              {fieldErrors.email && <p className="text-xs text-red-500 mt-1">{fieldErrors.email}</p>}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={(e) => update('password', e.target.value)}
                  className="w-full pl-10 pr-11 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-gov-blue-500 focus:ring-2 focus:ring-gov-blue-500/20 transition-all"
                  placeholder="Min 8 chars, upper, lower & a number"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {fieldErrors.password && <p className="text-xs text-red-500 mt-1">{fieldErrors.password}</p>}
            </div>

            {/* Role Dropdown */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Assign Role</label>
              <div className="relative">
                <UserCog className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 z-10" />
                <select
                  value={form.role}
                  onChange={(e) => update('role', e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-gov-blue-500 focus:ring-2 focus:ring-gov-blue-500/20 bg-white appearance-none transition-all cursor-pointer"
                >
                  <option value="">Select Role</option>
                  {SIGNUP_ROLES.map(r => (
                    <option key={r.value} value={r.value}>{r.label}</option>
                  ))}
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                  <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
              {fieldErrors.role && <p className="text-xs text-red-500 mt-1">{fieldErrors.role}</p>}
            </div>

            {/* Constituency — required for MP accounts, drives the MP dashboard's data scope */}
            {form.role === 'mp' && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Constituency</label>
                <input
                  type="text"
                  value={form.constituency}
                  onChange={(e) => update('constituency', e.target.value)}
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-gov-blue-500 focus:ring-2 focus:ring-gov-blue-500/20 transition-all"
                  placeholder="e.g. Varanasi"
                />
                {fieldErrors.constituency && <p className="text-xs text-red-500 mt-1">{fieldErrors.constituency}</p>}
              </div>
            )}

            {/* State + District — required for District Authority accounts */}
            {form.role === 'district_nodal' && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">State</label>
                  <select
                    value={form.state}
                    onChange={(e) => update('state', e.target.value)}
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-gov-blue-500 focus:ring-2 focus:ring-gov-blue-500/20 bg-white appearance-none"
                  >
                    <option value="">Select State</option>
                    {INDIAN_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                  {fieldErrors.state && <p className="text-xs text-red-500 mt-1">{fieldErrors.state}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">District</label>
                  <select
                    value={form.district}
                    onChange={(e) => update('district', e.target.value)}
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-gov-blue-500 focus:ring-2 focus:ring-gov-blue-500/20 bg-white appearance-none"
                  >
                    <option value="">Select District</option>
                    {(DISTRICTS[form.state] || []).map((d) => <option key={d} value={d}>{d}</option>)}
                  </select>
                  {fieldErrors.district && <p className="text-xs text-red-500 mt-1">{fieldErrors.district}</p>}
                </div>
              </div>
            )}

            {/* Error from AuthContext */}
            {error && (
              <div className="bg-red-50 text-red-700 text-sm px-4 py-3 rounded-lg border border-red-200">{error}</div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-navy-800 text-white font-semibold py-3 rounded-lg hover:bg-navy-900 transition-all disabled:opacity-60 flex items-center justify-center gap-2 mt-2"
            >
              {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <CheckCircle className="w-4 h-4" />}
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-sm text-slate-500 mt-6">
            Already have credentials?{' '}
            <Link to="/login" className="text-gov-blue-600 font-medium hover:underline">Sign In</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
