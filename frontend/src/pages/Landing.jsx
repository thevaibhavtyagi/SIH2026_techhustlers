import { Link } from 'react-router-dom';
import { ShieldCheck, Activity, Bell, Lock, ArrowRight } from 'lucide-react';
import Navbar from '../components/common/Navbar';

const features = [
  {
    icon: ShieldCheck,
    title: 'Fraud Detection',
    desc: 'AI-powered anomaly detection identifies suspicious expenditure patterns, duplicate projects, and contractor irregularities across all MPLADS schemes.',
    color: 'from-red-500 to-rose-600',
    bgColor: 'bg-red-50',
    iconColor: 'text-red-600',
  },
  {
    icon: Activity,
    title: 'Live Tracking',
    desc: 'Real-time monitoring of project progress, fund utilization, and milestone completion across every constituency in India.',
    color: 'from-blue-500 to-indigo-600',
    bgColor: 'bg-blue-50',
    iconColor: 'text-blue-600',
  },
  {
    icon: Bell,
    title: 'Smart Alerts',
    desc: 'Automated risk scoring and intelligent alert system that flags high-risk projects with explainable AI insights for quick action.',
    color: 'from-amber-500 to-orange-600',
    bgColor: 'bg-amber-50',
    iconColor: 'text-amber-600',
  },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-white">
      {/* Reusable Navbar */}
      <Navbar />

      {/* Hero Section */}
      <section className="gradient-hero text-white pt-28 pb-24 relative overflow-hidden">
        {/* Ashoka Chakra Watermark */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <svg
            className="w-[500px] h-[500px] opacity-[0.04]"
            viewBox="0 0 200 200"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle cx="100" cy="100" r="95" stroke="white" strokeWidth="2" />
            <circle cx="100" cy="100" r="30" stroke="white" strokeWidth="2" />
            <circle cx="100" cy="100" r="10" fill="white" />
            {/* 24 spokes of Ashoka Chakra */}
            {Array.from({ length: 24 }).map((_, i) => {
              const angle = (i * 15) * (Math.PI / 180);
              const x1 = 100 + 30 * Math.cos(angle);
              const y1 = 100 + 30 * Math.sin(angle);
              const x2 = 100 + 95 * Math.cos(angle);
              const y2 = 100 + 95 * Math.sin(angle);
              return (
                <line
                  key={i}
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke="white"
                  strokeWidth="1.5"
                />
              );
            })}
          </svg>
        </div>

        {/* Decorative circles */}
        <div className="absolute inset-0 opacity-5 pointer-events-none">
          <div className="absolute top-10 right-20 w-72 h-72 rounded-full border border-white/30" />
          <div className="absolute bottom-10 left-10 w-48 h-48 rounded-full border border-white/20" />
        </div>

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 mb-6 animate-fade-in">
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span className="text-xs font-medium text-slate-200 tracking-wide">Government of India • MoSPI Initiative</span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-6 leading-tight animate-fade-in">
              AI-Powered Surveillance &{' '}
              <span className="bg-gradient-to-r from-indigo-300 via-blue-300 to-cyan-300 bg-clip-text text-transparent">
                Analytics for MPLADS
              </span>
            </h1>

            <p className="text-lg text-slate-300 mb-10 max-w-2xl mx-auto leading-relaxed animate-slide-up">
              Transforming MPLADS project monitoring with artificial intelligence — detecting anomalies, 
              predicting risks, and ensuring transparent utilization of national development funds.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-up">
              <Link
                to="/login"
                className="inline-flex items-center gap-2 bg-white text-navy-800 font-semibold px-8 py-3.5 rounded-xl hover:bg-slate-100 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
              >
                <Lock className="w-5 h-5" />
                Access Login Portal
              </Link>
              <a
                href="#features"
                className="inline-flex items-center gap-2 bg-white/10 text-white font-semibold px-8 py-3.5 rounded-xl hover:bg-white/20 transition-all border border-white/20"
              >
                Learn More
                <ArrowRight className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section — Exactly 3 Cards */}
      <section id="features" className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-14">
            <p className="text-sm font-semibold text-gov-blue-600 uppercase tracking-wider mb-2">Platform Capabilities</p>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-800">
              Intelligent Oversight at Scale
            </h2>
            <p className="text-slate-500 mt-3 max-w-xl mx-auto">
              Three core pillars powering data-driven MPLADS monitoring across India.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {features.map((f, idx) => (
              <div
                key={f.title}
                className="bg-white rounded-2xl p-7 border border-slate-200 hover:shadow-xl hover:border-gov-blue-200 transition-all duration-300 group hover:-translate-y-1"
                style={{ animationDelay: `${idx * 150}ms` }}
              >
                <div className={`w-14 h-14 rounded-xl ${f.bgColor} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform`}>
                  <f.icon className={`w-7 h-7 ${f.iconColor}`} />
                </div>
                <h3 className="text-lg font-bold text-slate-800 mb-2">{f.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-navy-900 text-slate-400 py-8">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-white">MPLADS DRISHTI</p>
            <p className="text-[10px] tracking-wider mt-0.5">TRANSPARENT DEVELOPMENT • STRONGER INDIA</p>
          </div>
          <p className="text-xs">SIH 2026 • Problem #26102 • MoSPI • Smart Automation</p>
        </div>
      </footer>
    </div>
  );
}
