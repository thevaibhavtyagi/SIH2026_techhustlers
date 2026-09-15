import { Link } from 'react-router-dom';
import { LogIn } from 'lucide-react';
import logo from '../../assets/mplads-drishti-logo.png';

export default function Navbar() {
  return (
    <nav className="fixed top-0 w-full bg-white/95 backdrop-blur-md border-b border-slate-200 z-50">
      <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
        {/* Left — Logo + Title */}
        <Link to="/" className="flex items-center gap-3 group">
          <img src={logo} alt="MoSPI Logo" className="w-10 h-10 transition-transform group-hover:scale-105" />
          <div className="leading-tight">
            <span className="font-bold text-navy-800 text-sm tracking-wide block">MPLADS DRISHTI</span>
            <span className="text-[10px] text-slate-400 tracking-widest uppercase">MoSPI • Government of India</span>
          </div>
        </Link>

        {/* Right — Login Portal Button (flashing) */}
        <Link
          to="/login"
          className="inline-flex items-center gap-2 bg-navy-800 text-white font-semibold text-sm px-5 py-2.5 rounded-lg hover:bg-navy-900 transition-all shadow-md animate-pulse-subtle"
        >
          <LogIn className="w-4 h-4" />
          Login Portal
        </Link>
      </div>
    </nav>
  );
}
