import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { authApi, adminApi } from '../../services/api';
import { useToast } from '../../components/common/Toast';
import { PageHeader } from '../../components/common/UIComponents';
import { User, Mail, Shield, Phone, Briefcase, MapPin, Calendar, CheckCircle2 } from 'lucide-react';

export default function AdminProfile() {
  const { user, login } = useAuth();
  const toast = useToast();
  
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Editable fields
  const [formData, setFormData] = useState({
    name: '',
    designation: '',
    phone: ''
  });

  const loadProfile = async () => {
    try {
      setLoading(true);
      const data = await authApi.me();
      setProfile(data);
      setFormData({
        name: data.name || '',
        designation: data.designation || '',
        phone: data.phone || ''
      });
    } catch (err) {
      toast.error('Unable to load profile.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!profile) return;
    
    setSaving(true);
    try {
      await adminApi.updateUser(profile.id, formData);
      toast.success('Profile updated successfully.');
      await loadProfile();
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to update profile.';
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 animate-pulse space-y-6">
        <div className="h-8 bg-slate-200 rounded w-64" />
      </div>
    );
  }

  if (!profile) return null;

  const formatDate = (dateStr) => {
    if (!dateStr) return 'Not applicable';
    return new Date(dateStr).toLocaleDateString('en-US', { 
      year: 'numeric', month: 'long', day: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-5xl mx-auto">
      <PageHeader 
        title="My Profile" 
        subtitle="Manage your personal information and account preferences."
      />

      <div className="grid md:grid-cols-3 gap-6">
        
        {/* Left Column: Account Details (Read-only) */}
        <div className="md:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <div className="flex flex-col items-center text-center mb-6">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-navy-800 to-gov-blue-600 text-white flex items-center justify-center text-3xl font-bold mb-4 shadow-lg ring-4 ring-slate-50">
                {profile.name?.charAt(0) || 'U'}
              </div>
              <h3 className="text-lg font-bold text-slate-800">{profile.name}</h3>
              <p className="text-sm text-slate-500 font-medium">{profile.role.toUpperCase()}</p>
              
              {profile.isActive && (
                <div className="mt-3 flex items-center gap-1.5 px-3 py-1 bg-green-50 text-green-700 text-xs font-bold rounded-full border border-green-100">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  ACTIVE ACCOUNT
                </div>
              )}
            </div>

            <div className="space-y-4 border-t border-slate-100 pt-5">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1"><Mail className="w-3 h-3"/> Email</p>
                <p className="text-sm font-medium text-slate-700 break-all">{profile.email}</p>
              </div>
              
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1"><Shield className="w-3 h-3"/> Role Level</p>
                <p className="text-sm font-medium text-slate-700">{profile.role}</p>
              </div>

              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1"><MapPin className="w-3 h-3"/> Geographic Scope</p>
                <p className="text-sm font-medium text-slate-700">
                  {profile.state ? `${profile.state} ${profile.district ? '/ ' + profile.district : ''} ${profile.constituency ? '/ ' + profile.constituency : ''}` : 'National (Not applicable)'}
                </p>
              </div>

              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1"><Calendar className="w-3 h-3"/> Last Login</p>
                <p className="text-sm font-medium text-slate-700">{formatDate(profile.lastLoginAt)}</p>
              </div>
              
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1"><Calendar className="w-3 h-3"/> Member Since</p>
                <p className="text-sm font-medium text-slate-700">{formatDate(profile.createdAt)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Edit Form */}
        <div className="md:col-span-2">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50">
              <h2 className="text-lg font-bold text-slate-800">Profile Information</h2>
              <p className="text-sm text-slate-500">Update your personal details and official designation.</p>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-gov-blue-500 focus:ring-4 focus:ring-gov-blue-500/10 transition-all"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Official Designation</label>
                <div className="relative">
                  <Briefcase className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    name="designation"
                    value={formData.designation}
                    onChange={handleChange}
                    placeholder="e.g. MoSPI Administrator"
                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-gov-blue-500 focus:ring-4 focus:ring-gov-blue-500/10 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+91..."
                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-gov-blue-500 focus:ring-4 focus:ring-gov-blue-500/10 transition-all"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end">
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 bg-navy-800 text-white text-sm font-bold rounded-xl hover:bg-navy-900 focus:ring-4 focus:ring-navy-800/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {saving ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Saving...
                    </>
                  ) : (
                    'Save Changes'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

      </div>
    </div>
  );
}
