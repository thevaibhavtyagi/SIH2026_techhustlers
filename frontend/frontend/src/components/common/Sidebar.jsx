import { NavLink, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { ROLE_LABELS } from '../../utils/constants';
import {
  LayoutDashboard, FolderKanban, BrainCircuit, AlertTriangle,
  IndianRupee, Clock, HardHat, MapPin, Bell, Search as SearchIcon,
  FileText, MessageSquare, ChevronLeft, ChevronRight, LogOut,
  User, Shield, Building2, Eye, FileWarning, Home, Flag, UserCircle, Menu, X
} from 'lucide-react';
import logo from '../../assets/mplads-drishti-logo.png';

const ADMIN_MENU = [
  { label: 'Command Center', path: '/admin/dashboard', icon: LayoutDashboard },
  { label: 'Projects', path: '/admin/projects', icon: FolderKanban },
  { label: 'AI Risk Engine', path: '/admin/risk-engine', icon: BrainCircuit },
  { label: 'Fraud & Anomalies', path: '/admin/anomalies', icon: AlertTriangle },
  { label: 'Expenditure', path: '/admin/expenditure', icon: IndianRupee },
  { label: 'Progress & Delays', path: '/admin/progress', icon: Clock },
  { label: 'Contractors', path: '/admin/contractors', icon: HardHat },
  { label: 'Geographic Intel', path: '/admin/map', icon: MapPin },
  { label: 'Alerts', path: '/admin/alerts', icon: Bell },
  { label: 'Investigations', path: '/admin/investigations', icon: SearchIcon },
  { label: 'Reports', path: '/admin/reports', icon: FileText },
];

const MP_MENU = [
  { label: 'My Dashboard', path: '/mp/dashboard', icon: LayoutDashboard },
  { label: 'My Projects', path: '/mp/projects', icon: FolderKanban },
  { label: 'Funds', path: '/mp/funds', icon: IndianRupee },
  { label: 'Progress', path: '/mp/progress', icon: Clock },
  { label: 'Risk Insights', path: '/mp/risk', icon: AlertTriangle },
  { label: 'Alerts', path: '/mp/alerts', icon: Bell },
];

const CITIZEN_MENU = [
  { label: 'Dashboard', path: '/citizen/dashboard', icon: Home },
  { label: 'Explore Projects', path: '/citizen/projects', icon: FolderKanban },
  { label: 'Nearby Development', path: '/citizen/nearby', icon: MapPin },
  { label: 'My Reports', path: '/citizen/my-reports', icon: FileText },
  { label: 'Report a Concern', path: '/citizen/report', icon: Flag },
  { label: 'Profile', path: '/citizen/profile', icon: UserCircle },
];

const ROLE_MENUS = { admin: ADMIN_MENU, mp: MP_MENU, citizen: CITIZEN_MENU };
const ROLE_COLORS = {
  admin: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
  mp: 'bg-saffron-500/20 text-saffron-300 border-saffron-500/30',
  citizen: 'bg-india-green-500/20 text-india-green-300 border-india-green-500/30',
};

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const menu = ROLE_MENUS[user?.role] || [];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const sidebarContent = (
    <div className={`flex flex-col h-full bg-navy-800 text-white transition-all duration-300 ${collapsed ? 'w-[72px]' : 'w-64'}`}>
      {/* Logo */}
      <div className={`flex items-center gap-3 px-4 py-5 border-b border-white/10 ${collapsed ? 'justify-center' : ''}`}>
        <img src={logo} alt="MPLADS DRISHTI" className="w-9 h-9 object-contain flex-shrink-0" />
        {!collapsed && (
          <div className="min-w-0">
            <h1 className="font-bold text-sm leading-tight tracking-wide">MPLADS DRISHTI</h1>
            <p className="text-[10px] text-slate-400 tracking-widest uppercase">Transparent Development</p>
          </div>
        )}
      </div>

      {/* Role Badge */}
      {!collapsed && user && (
        <div className="px-4 py-3 border-b border-white/10">
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium border ${ROLE_COLORS[user.role]}`}>
            <Shield className="w-3 h-3" />
            {ROLE_LABELS[user.role]}
          </span>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
        {menu.map(item => (
          <NavLink
            key={item.path}
            to={item.path}
            onClick={() => setMobileOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group
              ${isActive
                ? 'bg-white/12 text-white shadow-sm'
                : 'text-slate-300 hover:bg-white/8 hover:text-white'
              } ${collapsed ? 'justify-center' : ''}`
            }
            title={collapsed ? item.label : undefined}
          >
            <item.icon className="w-[18px] h-[18px] flex-shrink-0" />
            {!collapsed && <span>{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* User + Logout */}
      <div className="border-t border-white/10 p-3">
        {!collapsed && user && (
          <div className="flex items-center gap-3 px-2 py-2 mb-2">
            <div className="w-8 h-8 rounded-full bg-gov-blue-600 flex items-center justify-center text-xs font-bold">
              {user.name?.charAt(0) || 'U'}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium truncate">{user.name}</p>
              <p className="text-[11px] text-slate-400 truncate">{user.email}</p>
            </div>
          </div>
        )}
        <button
          onClick={handleLogout}
          className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm text-slate-300 hover:bg-red-500/20 hover:text-red-300 transition-colors ${collapsed ? 'justify-center' : ''}`}
        >
          <LogOut className="w-[18px] h-[18px]" />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>

      {/* Collapse Toggle (desktop) */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="hidden lg:flex items-center justify-center py-3 border-t border-white/10 text-slate-400 hover:text-white transition-colors"
      >
        {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
      </button>
    </div>
  );

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-3 left-3 z-50 p-2 bg-navy-800 text-white rounded-lg shadow-lg"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/60" onClick={() => setMobileOpen(false)} />
          <div className="relative h-full w-64 animate-slide-right">
            {sidebarContent}
          </div>
          <button
            onClick={() => setMobileOpen(false)}
            className="absolute top-3 right-3 text-white p-2"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
      )}

      {/* Desktop sidebar */}
      <div className="hidden lg:block h-screen sticky top-0 flex-shrink-0">
        {sidebarContent}
      </div>
    </>
  );
}
