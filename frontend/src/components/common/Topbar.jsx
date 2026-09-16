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
    <header className="bg-white/80 backdrop-blur-xl border-b border-slate-200/60 px-4 lg:px-6 py-3 flex items-center justify-between sticky top-0 z-30 shadow-sm">
      <div className="flex items-center gap-4 flex-1">
        {/* Search */}
        <div className="hidden md:flex items-center gap-2.5 bg-slate-50/80 hover:bg-white border border-slate-200 rounded-xl px-4 py-2.5 w-[28rem] shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)] focus-within:bg-white focus-within:border-gov-blue-500 focus-within:ring-2 focus-within:ring-gov-blue-500/20 transition-all duration-300 group">
          <Search className="w-5 h-5 text-slate-400 group-focus-within:text-gov-blue-500 transition-colors" />
          <input
            type="text"
            placeholder="Search projects, alerts, contractors..."
            className="bg-transparent text-[14.5px] outline-none flex-1 text-slate-700 placeholder:text-slate-400"
          />
          <kbd className="hidden lg:inline text-[11px] text-slate-400 bg-white border border-slate-200 px-2 py-0.5 rounded-md font-mono shadow-sm">⌘K</kbd>
        </div>
      </div>

      <div className="flex items-center gap-5 mr-2">
        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => { setShowNotif(!showNotif); setShowProfile(false); }}
            className="relative p-2.5 text-slate-500 hover:text-navy-900 hover:bg-slate-100 rounded-xl transition-all"
          >
            <Bell className="w-7 h-7" strokeWidth={1.5} />
            <span className="absolute top-1.5 right-1.5 w-5 h-5 bg-red-500 text-white text-[11px] font-bold rounded-full flex items-center justify-center ring-2 ring-white shadow-sm">
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
            className="flex items-center gap-3 px-2 py-1.5 hover:bg-slate-100/80 rounded-xl transition-colors"
          >
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-navy-800 to-navy-900 text-white flex items-center justify-center text-base font-bold shadow-md ring-2 ring-white">
              {user?.name?.charAt(0) || 'U'}
            </div>
            <div className="hidden md:block text-left">
              <p className="text-[14.5px] font-bold text-slate-700 leading-tight">{user?.name}</p>
              <p className="text-[12px] font-medium text-slate-500">{user?.designation || user?.role}</p>
            </div>
            <ChevronDown className="w-5 h-5 text-slate-400 hidden md:block" />
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
