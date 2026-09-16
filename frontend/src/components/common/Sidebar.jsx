import { NavLink, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { ROLE_LABELS } from '../../utils/constants';
import {
  LayoutDashboard, FolderKanban, BrainCircuit, AlertTriangle,
  IndianRupee, Clock, HardHat, MapPin, Bell, Search as SearchIcon,
  FileText, MessageSquare, ChevronLeft, ChevronRight, LogOut,
  User, Shield, Building2, Eye, FileWarning, Menu, X, UserPlus
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
  { label: 'Create Account', path: '/admin/provision-account', icon: UserPlus },
];

const MP_MENU = [
  { label: 'My Dashboard', path: '/mp/dashboard', icon: LayoutDashboard },
  { label: 'My Projects', path: '/mp/projects', icon: FolderKanban },
  { label: 'Funds', path: '/mp/funds', icon: IndianRupee },
  { label: 'Progress', path: '/mp/progress', icon: Clock },
  { label: 'Risk Insights', path: '/mp/risk', icon: AlertTriangle },
  { label: 'Alerts', path: '/mp/alerts', icon: Bell },
];

const DISTRICT_MENU = [
  { label: 'District Dashboard', path: '/district/dashboard', icon: LayoutDashboard },
  { label: 'District Projects', path: '/district/projects', icon: FolderKanban },
  { label: 'Local Alerts', path: '/district/alerts', icon: Bell },
];

const ROLE_MENUS = { admin: ADMIN_MENU, mp: MP_MENU, district_nodal: DISTRICT_MENU };
const ROLE_COLORS = {
  admin: 'bg-sky-50 text-sky-700 border-sky-200',
  mp: 'bg-orange-50 text-orange-700 border-orange-200',
  district_nodal: 'bg-emerald-50 text-emerald-700 border-emerald-200',
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
    <div className={`relative flex flex-col h-full bg-gradient-to-b from-white/95 via-sky-50/80 to-white/95 backdrop-blur-3xl border-r border-white/80 shadow-[8px_0_40px_rgba(0,0,0,0.04)] transition-all duration-300 ${collapsed ? 'w-[88px]' : 'w-[280px]'}`}>
      
      {/* Floating Collapse Toggle (Desktop) */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="hidden lg:flex absolute -right-3.5 top-8 items-center justify-center w-7 h-7 bg-white border border-slate-200 rounded-full shadow-md text-slate-500 hover:text-gov-blue-600 hover:border-gov-blue-300 z-50 hover:scale-110 transition-all cursor-pointer"
      >
        {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
      </button>

      {/* Unified Header Section (Logo + Role Badge) */}
      <div className={`flex flex-col gap-5 px-6 pt-6 pb-4 border-b border-white/50 ${collapsed ? 'items-center px-4' : ''}`}>
        <div className={`flex items-center gap-4 ${collapsed ? 'justify-center' : ''}`}>
          <div className="relative flex-shrink-0 flex items-center justify-center bg-gradient-to-br from-sky-100/50 to-white w-[68px] h-[68px] rounded-2xl border border-sky-200/50 shadow-lg shadow-sky-100/50">
             <img src={logo} alt="MPLADS DRISHTI" className="w-full h-full object-contain drop-shadow-xl scale-[1.35]" />
          </div>
          {!collapsed && (
            <div className="min-w-0 flex flex-col justify-center mt-0.5">
              <h1 className="font-extrabold text-[16px] text-navy-900 leading-none tracking-tight mb-1.5">MPLADS DRISHTI</h1>
              <p className="text-[10px] font-bold text-sky-600 tracking-[0.2em] uppercase leading-none">Transparent India</p>
            </div>
          )}
        </div>
        
        {/* Role Badge Button */}
        {!collapsed && user && (
          <div className="w-full animate-fade-in">
            <span className={`flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-xl text-[13.5px] font-extrabold border shadow-sm ${ROLE_COLORS[user.role]}`}>
              <Shield className="w-4.5 h-4.5" />
              {ROLE_LABELS[user.role]}
            </span>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto pt-3 pb-5 px-4 space-y-1.5 custom-scrollbar">
        {menu.map(item => (
          <NavLink
            key={item.path}
            to={item.path}
            onClick={() => setMobileOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3.5 px-4 py-3 rounded-2xl text-[14.5px] font-bold transition-all duration-300 group relative overflow-hidden
              ${isActive
                ? 'text-gov-blue-700 bg-white shadow-lg shadow-gov-blue-500/10 border border-white/80 scale-[1.02] z-10'
                : 'text-slate-500 hover:bg-white/60 hover:text-navy-900 border border-transparent hover:shadow-sm'
              } ${collapsed ? 'justify-center px-0' : ''}`
            }
            title={collapsed ? item.label : undefined}
          >
            {({ isActive }) => (
              <>
                {isActive && <div className="absolute left-0 top-1/2 -translate-y-1/2 h-3/4 w-1.5 bg-gov-blue-500 rounded-r-full shadow-[0_0_12px_rgba(59,130,246,0.6)]" />}
                <item.icon className={`w-[22px] h-[22px] flex-shrink-0 transition-transform duration-300 group-hover:scale-110 ${isActive ? 'text-gov-blue-600' : 'text-slate-400 group-hover:text-gov-blue-500'}`} />
                {!collapsed && <span>{item.label}</span>}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* User + Logout */}
      <div className="border-t border-white/50 p-4 bg-gradient-to-t from-sky-50/50 to-transparent">
        {!collapsed && user && (
          <div className="flex items-center gap-3 px-3 py-3 mb-3 bg-white/80 backdrop-blur-sm border border-white rounded-2xl shadow-sm hover:shadow-md transition-all">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-navy-800 to-navy-900 flex items-center justify-center text-lg text-white font-bold shadow-lg flex-shrink-0 ring-4 ring-white">
              {user.name?.charAt(0) || 'U'}
            </div>
            <div className="min-w-0 flex-1 pr-2">
              <p className="text-[13.5px] font-bold text-navy-900 truncate tracking-tight">{user.name}</p>
              <p className="text-[11px] font-medium text-slate-500 truncate">{user.email}</p>
            </div>
          </div>
        )}
        <button
          onClick={handleLogout}
          className={`flex items-center gap-3.5 w-full px-4 py-3 rounded-xl text-[14px] font-bold text-slate-600 hover:bg-red-50 hover:text-red-600 hover:border-red-100 hover:shadow-sm border border-transparent transition-all duration-300 ${collapsed ? 'justify-center px-0' : ''}`}
        >
          <LogOut className="w-[18px] h-[18px] flex-shrink-0" />
          {!collapsed && <span>Secure Logout</span>}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-3 left-3 z-50 p-2.5 bg-white text-navy-900 rounded-xl shadow-md border border-slate-200"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <div className="relative h-full w-[280px] animate-slide-right">
            {sidebarContent}
          </div>
          <button
            onClick={() => setMobileOpen(false)}
            className="absolute top-4 right-4 text-white p-2 hover:bg-white/20 rounded-full transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
      )}

      {/* Desktop sidebar */}
      <div className="hidden lg:block h-screen sticky top-0 flex-shrink-0 z-40">
        {sidebarContent}
      </div>
    </>
  );
}
