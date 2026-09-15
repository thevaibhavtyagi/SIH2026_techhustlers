import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Bell, Search, ChevronDown, LogOut, User, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Topbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showProfile, setShowProfile] = useState(false);
  const [showNotif, setShowNotif] = useState(false);

  const notifications = [
    { id: 1, text: 'New critical alert: MPLAD-10482 risk elevated to 87', time: '2h ago', read: false },
    { id: 2, text: 'Investigation INV-001 status updated', time: '4h ago', read: false },
    { id: 3, text: 'Monthly risk report generated', time: '1d ago', read: true },
  ];

  return (
    <header className="bg-white border-b border-slate-200 px-4 lg:px-6 py-3 flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center gap-4 flex-1">
        {/* Search */}
        <div className="hidden md:flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 w-80 focus-within:border-gov-blue-500 focus-within:ring-1 focus-within:ring-gov-blue-500/30 transition-all">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search projects, alerts, contractors..."
            className="bg-transparent text-sm outline-none flex-1 text-slate-700 placeholder:text-slate-400"
          />
          <kbd className="hidden lg:inline text-[10px] text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded font-mono">⌘K</kbd>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {/* Demo Badge */}
        <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 bg-amber-50 text-amber-700 text-[11px] font-medium rounded-full border border-amber-200">
          <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse-subtle" />
          DEMO ENVIRONMENT
        </span>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => { setShowNotif(!showNotif); setShowProfile(false); }}
            className="relative p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute -top-0.5 -right-0.5 w-4.5 h-4.5 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
              {notifications.filter(n => !n.read).length}
            </span>
          </button>

          {showNotif && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden z-50">
              <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
                <h3 className="font-semibold text-sm text-slate-800">Notifications</h3>
                <span className="text-xs text-gov-blue-600 cursor-pointer hover:underline">Mark all read</span>
              </div>
              <div className="max-h-64 overflow-y-auto">
                {notifications.map(n => (
                  <div key={n.id} className={`px-4 py-3 border-b border-slate-50 hover:bg-slate-50 cursor-pointer ${!n.read ? 'bg-blue-50/40' : ''}`}>
                    <p className="text-sm text-slate-700">{n.text}</p>
                    <p className="text-xs text-slate-400 mt-1">{n.time}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Profile */}
        <div className="relative">
          <button
            onClick={() => { setShowProfile(!showProfile); setShowNotif(false); }}
            className="flex items-center gap-2 px-2 py-1.5 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-navy-800 text-white flex items-center justify-center text-xs font-bold">
              {user?.name?.charAt(0) || 'U'}
            </div>
            <div className="hidden md:block text-left">
              <p className="text-sm font-medium text-slate-700 leading-tight">{user?.name}</p>
              <p className="text-[11px] text-slate-400">{user?.designation || user?.role}</p>
            </div>
            <ChevronDown className="w-4 h-4 text-slate-400 hidden md:block" />
          </button>

          {showProfile && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden z-50">
              <div className="px-4 py-3 border-b border-slate-100">
                <p className="font-medium text-sm text-slate-800">{user?.name}</p>
                <p className="text-xs text-slate-500">{user?.email}</p>
              </div>
              <div className="py-1">
                <button className="w-full text-left px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 flex items-center gap-2">
                  <User className="w-4 h-4" /> Profile
                </button>
                <button className="w-full text-left px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 flex items-center gap-2">
                  <Settings className="w-4 h-4" /> Settings
                </button>
              </div>
              <div className="border-t border-slate-100 py-1">
                <button
                  onClick={() => { logout(); navigate('/login'); }}
                  className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                >
                  <LogOut className="w-4 h-4" /> Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Click outside to close */}
      {(showProfile || showNotif) && (
        <div className="fixed inset-0 z-40" onClick={() => { setShowProfile(false); setShowNotif(false); }} />
      )}
    </header>
  );
}
