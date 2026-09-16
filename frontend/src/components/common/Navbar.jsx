import { Link } from 'react-router-dom';
import { LogIn, Shield } from 'lucide-react';
import logo from '../../assets/mplads-drishti-logo.png';

export default function Navbar() {
  return (
    <>
      {/* Tri-color strip — saffron, white, green */}
      <div className="fixed top-0 w-full z-[60] flex h-1">
        <div className="flex-1 bg-saffron-500" />
        <div className="flex-1 bg-white" />
        <div className="flex-1 bg-india-green-600" />
      </div>

      <nav className="fixed top-1 w-full bg-white/90 backdrop-blur-xl border-b border-sky-100/60 z-50 shadow-sm shadow-sky-100/30">
        <div className="w-[95%] max-w-[1350px] mx-auto py-2.5 flex items-center justify-between">
          {/* Left — Logo + Title */}
          <Link to="/" className="flex items-center gap-4 group">
            <div className="relative">
              <div className="absolute -inset-1.5 bg-gradient-to-br from-sky-100 to-blue-50 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <img
                src={logo}
                alt="MPLADS DRISHTI Logo"
                className="relative w-16 h-16 transition-transform duration-500 group-hover:scale-105 drop-shadow-lg"
              />
            </div>
            <div className="leading-tight">
              <span className="font-extrabold text-navy-800 text-xl tracking-wide block">
                MPLADS DRISHTI
              </span>
              <span className="text-[11px] text-slate-500 tracking-[0.2em] uppercase font-semibold">
                MoSPI • Government of India
              </span>
            </div>
          </Link>

          {/* Right — Login Portal Button */}
          <Link
            to="/login"
            className="inline-flex items-center gap-2.5 bg-gradient-to-r from-navy-800 to-gov-blue-700 text-white font-bold text-base px-7 py-3 rounded-xl hover:from-navy-900 hover:to-gov-blue-800 transition-all duration-300 shadow-lg shadow-navy-800/25 hover:shadow-xl hover:shadow-navy-800/40 hover:-translate-y-0.5 group"
          >
            <LogIn className="w-5 h-5 group-hover:scale-110 transition-transform" />
            Login Portal
          </Link>
        </div>
      </nav>
    </>
  );
}
