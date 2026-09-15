import { Link } from 'react-router-dom';
import { ShieldCheck, Activity, Bell, Lock, ArrowRight, TrendingUp, Users, MapPin } from 'lucide-react';
import Navbar from '../components/common/Navbar';

const features = [
  {
    icon: ShieldCheck,
    title: 'AI Monitoring',
    desc: 'AI-powered anomaly detection identifies suspicious expenditure patterns, duplicate projects, and contractor irregularities across all MPLADS schemes.',
    color: 'from-emerald-500 to-teal-600',
    bgColor: 'bg-emerald-50',
    iconColor: 'text-emerald-600',
    border: 'border-emerald-100',
  },
  {
    icon: Activity,
    title: 'Live Tracking',
    desc: 'Real-time monitoring of project progress, fund utilization, and milestone completion across every constituency in India.',
    color: 'from-blue-500 to-indigo-600',
    bgColor: 'bg-blue-50',
    iconColor: 'text-blue-600',
    border: 'border-blue-100',
  },
  {
    icon: Bell,
    title: 'Smart Alerts',
    desc: 'Automated risk scoring and intelligent alert system that flags high-risk projects with explainable AI insights for quick action.',
    color: 'from-amber-500 to-orange-600',
    bgColor: 'bg-amber-50',
    iconColor: 'text-amber-600',
    border: 'border-amber-100',
  },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-gov-blue-500 selection:text-white">
      {/* Reusable Navbar */}
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-32 overflow-hidden bg-navy-900 text-white">
        {/* Background Gradients & Effects */}
        <div className="absolute inset-0 bg-gradient-to-br from-navy-900 via-navy-800 to-gov-blue-700" />
        
        {/* Decorative Grid */}
        <div className="absolute inset-0 opacity-[0.05]">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="landing-grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="1"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#landing-grid)" />
          </svg>
        </div>

        {/* Ashoka Chakra */}
        <div className="absolute top-1/2 right-[-10%] -translate-y-1/2 pointer-events-none opacity-[0.08]">
          <svg width="800" height="800" viewBox="0 0 200 200" fill="none">
            <circle cx="100" cy="100" r="95" stroke="white" strokeWidth="2" />
            <circle cx="100" cy="100" r="85" stroke="white" strokeWidth="1" strokeDasharray="2 4" />
            <circle cx="100" cy="100" r="30" stroke="white" strokeWidth="2" />
            <circle cx="100" cy="100" r="10" fill="white" />
            {Array.from({ length: 24 }).map((_, i) => {
              const angle = (i * 15) * (Math.PI / 180);
              return (
                <line
                  key={i}
                  x1={100 + 30 * Math.cos(angle)}
                  y1={100 + 30 * Math.sin(angle)}
                  x2={100 + 95 * Math.cos(angle)}
                  y2={100 + 95 * Math.sin(angle)}
                  stroke="white"
                  strokeWidth="1.5"
                />
              );
            })}
          </svg>
        </div>

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 mb-8 backdrop-blur-sm animate-fade-in shadow-lg shadow-black/10">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse border border-emerald-200" />
              <span className="text-xs font-semibold text-white tracking-wide uppercase">MoSPI Official Platform</span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-6 leading-[1.15] animate-slide-up tracking-tight drop-shadow-xl">
              AI-Powered Surveillance &<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-300 via-blue-200 to-indigo-300">
                Analytics for MPLADS
              </span>
            </h1>

            <p className="text-lg md:text-xl text-sky-100/90 mb-10 leading-relaxed animate-slide-up max-w-2xl mx-auto font-medium drop-shadow-md">
              Transforming MPLADS project monitoring with artificial intelligence — detecting anomalies, 
              predicting risks, and ensuring transparent utilization of national development funds.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-up">
              <Link
                to="/login"
                className="inline-flex items-center justify-center gap-2 bg-white text-navy-900 font-bold px-8 py-4 rounded-xl hover:bg-slate-50 transition-all shadow-xl hover:shadow-2xl hover:-translate-y-0.5 group"
              >
                <Lock className="w-5 h-5 group-hover:scale-110 transition-transform" />
                Access Login Portal
              </Link>
              <a
                href="#platform"
                className="inline-flex items-center justify-center gap-2 bg-navy-800/40 text-white font-semibold px-8 py-4 rounded-xl hover:bg-navy-800/60 transition-all border border-white/20 backdrop-blur-md"
              >
                Learn More
                <ArrowRight className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="platform" className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <span className="text-xs font-bold text-gov-blue-600 bg-gov-blue-50 px-3 py-1 rounded-full uppercase tracking-widest border border-gov-blue-100">Platform Capabilities</span>
            <h2 className="text-3xl md:text-5xl font-extrabold text-slate-900 mt-6 mb-4 tracking-tight">
              Intelligent Oversight at Scale
            </h2>
            <p className="text-lg text-slate-500 max-w-2xl mx-auto leading-relaxed">
              Three core pillars powering data-driven MPLADS monitoring, delivering complete transparency and actionable insights for district authorities.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {features.map((f, idx) => (
              <div
                key={f.title}
                className={`bg-white rounded-3xl p-8 border ${f.border} shadow-lg shadow-slate-200/40 hover:shadow-xl transition-all duration-300 group hover:-translate-y-2`}
              >
                <div className={`w-16 h-16 rounded-2xl ${f.bgColor} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-inner`}>
                  <f.icon className={`w-8 h-8 ${f.iconColor}`} />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">{f.title}</h3>
                <p className="text-base text-slate-600 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-navy-950 text-slate-400 py-10 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
          <div>
            <p className="text-base font-bold text-white mb-1 tracking-wide">MPLADS DRISHTI</p>
            <p className="text-xs font-medium tracking-widest uppercase text-sky-500/80">Transparent Development • Stronger India</p>
          </div>
          <div className="text-xs font-medium leading-relaxed">
            <p>Smart India Hackathon 2026 • Problem Statement #26102</p>
            <p className="text-slate-500 mt-1">Ministry of Statistics & Programme Implementation • Government of India</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
