import { Link } from 'react-router-dom';
import { ShieldCheck, Activity, Bell, Lock, ArrowRight, Eye, Scale, Landmark, ChevronRight, Sparkles } from 'lucide-react';
import Navbar from '../components/common/Navbar';
import logo from '../assets/mplads-drishti-logo.png';

/* ================================================================
   Ashoka Chakra SVG — 24 spokes, glossy radial gradient
   ================================================================ */
function AshokaChakra({ className = '' }) {
  return (
    <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <defs>
        {/* Glossy radial gradient */}
        <radialGradient id="chakra-gloss" cx="40%" cy="35%" r="60%">
          <stop offset="0%" stopColor="#bae6fd" stopOpacity="0.5" />
          <stop offset="50%" stopColor="#7dd3fc" stopOpacity="0.18" />
          <stop offset="100%" stopColor="#0284c7" stopOpacity="0.06" />
        </radialGradient>
        <radialGradient id="chakra-inner" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#0ea5e9" stopOpacity="0.08" />
        </radialGradient>
      </defs>
      {/* Outer glossy circle */}
      <circle cx="100" cy="100" r="96" fill="url(#chakra-gloss)" />
      <circle cx="100" cy="100" r="96" stroke="#7dd3fc" strokeWidth="1.5" strokeOpacity="0.35" />
      <circle cx="100" cy="100" r="88" stroke="#7dd3fc" strokeWidth="0.8" strokeOpacity="0.2" strokeDasharray="3 5" />
      {/* Inner hub */}
      <circle cx="100" cy="100" r="28" fill="url(#chakra-inner)" />
      <circle cx="100" cy="100" r="28" stroke="#38bdf8" strokeWidth="1.2" strokeOpacity="0.3" />
      <circle cx="100" cy="100" r="10" fill="#38bdf8" fillOpacity="0.15" />
      <circle cx="100" cy="100" r="10" stroke="#38bdf8" strokeWidth="1" strokeOpacity="0.25" />
      {/* 24 spokes */}
      {Array.from({ length: 24 }).map((_, i) => {
        const angle = (i * 15) * (Math.PI / 180);
        return (
          <line
            key={i}
            x1={100 + 28 * Math.cos(angle)}
            y1={100 + 28 * Math.sin(angle)}
            x2={100 + 88 * Math.cos(angle)}
            y2={100 + 88 * Math.sin(angle)}
            stroke="#38bdf8"
            strokeWidth="1.2"
            strokeOpacity="0.22"
          />
        );
      })}
      {/* Glossy highlight arc */}
      <ellipse cx="80" cy="65" rx="50" ry="35" fill="white" fillOpacity="0.08" transform="rotate(-15 80 65)" />
    </svg>
  );
}

const pillars = [
  {
    icon: Eye,
    title: 'Complete Transparency',
    desc: 'End-to-end visibility into development fund allocation, utilization, and project outcomes — empowering accountability at every level of governance.',
    bgColor: 'bg-sky-50',
    iconColor: 'text-sky-600',
    border: 'border-sky-100',
    accent: 'from-sky-400 to-blue-500',
  },
  {
    icon: ShieldCheck,
    title: 'Intelligent Oversight',
    desc: 'Advanced monitoring capabilities that ensure compliance with guidelines, detect irregularities, and safeguard public resources for communities nationwide.',
    bgColor: 'bg-emerald-50',
    iconColor: 'text-emerald-600',
    border: 'border-emerald-100',
    accent: 'from-emerald-400 to-teal-500',
  },
  {
    icon: Scale,
    title: 'Accountable Governance',
    desc: 'Data-driven decision making tools that strengthen democratic oversight, enabling elected representatives to deliver measurable impact to their constituencies.',
    bgColor: 'bg-indigo-50',
    iconColor: 'text-indigo-600',
    border: 'border-indigo-100',
    accent: 'from-indigo-400 to-violet-500',
  },
];

const values = [
  {
    icon: Landmark,
    title: 'Strengthening Democratic Institutions',
    desc: 'Empowering Members of Parliament and district authorities with modern tools to monitor and ensure the effective implementation of local development projects.',
  },
  {
    icon: Activity,
    title: 'Data-Driven Decision Making',
    desc: 'Comprehensive analytics and actionable insights that transform how development programmes are planned, monitored, and evaluated across India.',
  },
  {
    icon: Bell,
    title: 'Proactive Risk Management',
    desc: 'Early-warning systems and intelligent monitoring that enable timely interventions, ensuring development funds reach their intended beneficiaries.',
  },
];

export default function Landing() {
  return (
    <div className="min-h-screen font-sans selection:bg-gov-blue-500 selection:text-white">
      <Navbar />

      {/* ===================== HERO SECTION ===================== */}
      <section className="relative pt-28 pb-0 overflow-hidden">
        {/* Light sky-blue gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-sky-50 via-blue-50/50 to-indigo-50/30" />

        {/* Soft floating orbs */}
        <div className="absolute top-16 left-[8%] w-[500px] h-[500px] rounded-full bg-sky-200/25 blur-[130px] pointer-events-none" />
        <div className="absolute bottom-0 right-[5%] w-[550px] h-[550px] rounded-full bg-blue-200/20 blur-[140px] pointer-events-none" />
        <div className="absolute top-[50%] left-[45%] w-[350px] h-[350px] rounded-full bg-indigo-100/25 blur-[100px] pointer-events-none" />

        {/* Subtle grid */}
        <div className="absolute inset-0 opacity-[0.03]">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="hero-grid" width="60" height="60" patternUnits="userSpaceOnUse">
                <path d="M 60 0 L 0 0 0 60" fill="none" stroke="#1B2A4A" strokeWidth="0.5"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#hero-grid)" />
          </svg>
        </div>

        <div className="w-[95%] max-w-[1350px] mx-auto relative z-10">
          <div className="grid lg:grid-cols-2 gap-10 items-center min-h-[88vh] py-12">
            {/* Left — Text Content */}
            <div className="max-w-xl">
              <div className="inline-flex items-center gap-2 bg-white/80 border border-sky-200/60 rounded-full px-4 py-2 mb-8 backdrop-blur-md shadow-sm animate-fade-in">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-bold text-navy-700 tracking-wide uppercase">Government of India • Official Platform</span>
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-[3.5rem] font-extrabold leading-[1.08] mb-6 animate-slide-up tracking-tight">
                <span className="text-navy-900">Empowering</span>
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-gov-blue-600 via-sky-500 to-indigo-500">
                  Transparent India
                </span>
                <br />
                <span className="text-navy-900">Through Technology</span>
              </h1>

              <p className="text-lg text-slate-600 mb-10 leading-relaxed animate-slide-up max-w-lg font-medium">
                A unified digital platform by the Ministry of Statistics & Programme
                Implementation for monitoring the Members of Parliament Local Area
                Development Scheme — ensuring accountability, transparency, and
                effective utilization of public funds across every constituency.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 animate-slide-up">
                <Link
                  to="/login"
                  className="inline-flex items-center justify-center gap-3 bg-gradient-to-r from-navy-800 to-gov-blue-700 text-white font-bold text-lg px-9 py-4.5 rounded-2xl hover:from-navy-900 hover:to-gov-blue-800 transition-all duration-300 shadow-xl shadow-navy-800/20 hover:shadow-2xl hover:shadow-navy-800/35 hover:-translate-y-1 group"
                >
                  <Lock className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  Authorized Login
                  <ChevronRight className="w-5 h-5 opacity-60 group-hover:translate-x-1 transition-transform" />
                </Link>
                <a
                  href="#about"
                  className="inline-flex items-center justify-center gap-2 bg-white/80 text-navy-800 font-semibold text-lg px-8 py-4.5 rounded-2xl hover:bg-white transition-all border border-slate-200/80 backdrop-blur-sm shadow-sm hover:shadow-md hover:-translate-y-0.5"
                >
                  About the Platform
                  <ArrowRight className="w-5 h-5" />
                </a>
              </div>

              {/* Ministry attribution */}
              <div className="mt-14 flex items-center gap-3 animate-fade-in">
                <div className="h-px flex-1 max-w-16 bg-slate-300" />
                <p className="text-xs text-slate-400 font-semibold tracking-wide uppercase">
                  Ministry of Statistics & Programme Implementation
                </p>
              </div>
            </div>

            {/* Right — Large Logo with Glossy Ashoka Chakra */}
            <div className="hidden lg:flex items-center justify-center relative w-full h-full min-h-[500px]">
              {/* Glossy Ashoka Chakra behind logo - shifted up slightly to align with the 'eye' of the logo */}
              <div className="absolute top-[42%] left-1/2 -translate-x-1/2 -translate-y-1/2 animate-spin-slow" style={{ animationDuration: '40s' }}>
                <AshokaChakra className="w-[620px] h-[620px]" />
              </div>

              {/* Second subtle ring */}
              <div className="absolute top-[42%] left-1/2 -translate-x-1/2 -translate-y-1/2 animate-spin-slow" style={{ animationDuration: '55s', animationDirection: 'reverse' }}>
                <AshokaChakra className="w-[500px] h-[500px] opacity-40" />
              </div>

              {/* Soft glow behind logo */}
              <div className="absolute top-[42%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-sky-300/40 rounded-full blur-[100px]" />

              {/* Floating tri-color accents */}
              <div className="absolute top-[10%] right-[15%] w-4 h-4 rounded-full bg-saffron-400/60 animate-pulse shadow-[0_0_15px_rgba(251,146,60,0.5)]" />
              <div className="absolute bottom-[10%] left-[15%] w-3.5 h-3.5 rounded-full bg-india-green-500/60 animate-pulse shadow-[0_0_15px_rgba(34,197,94,0.5)]" style={{ animationDelay: '1s' }} />
              <div className="absolute top-1/4 left-[5%] w-3 h-3 rounded-full bg-sky-400/50 animate-pulse" style={{ animationDelay: '0.5s' }} />
              <div className="absolute bottom-1/4 right-[10%] w-2.5 h-2.5 rounded-full bg-indigo-400/40 animate-pulse" style={{ animationDelay: '1.5s' }} />

              {/* Main Logo — LARGE */}
              <div className="relative group z-10">
                <div className="absolute inset-0 bg-white/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                <img
                  src={logo}
                  alt="MPLADS DRISHTI"
                  className="relative w-[480px] h-auto drop-shadow-2xl hover:scale-[1.05] transition-transform duration-700 hover:drop-shadow-[0_20px_40px_rgba(14,165,233,0.25)]"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Smooth wave transition to white */}
        <div className="relative -mb-1">
          <svg viewBox="0 0 1440 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path d="M0 50L60 45C120 40 240 30 360 28C480 26 600 32 720 40C840 48 960 58 1080 58C1200 58 1320 48 1380 43L1440 38V100H1380C1320 100 1200 100 1080 100C960 100 840 100 720 100C600 100 480 100 360 100C240 100 120 100 60 100H0V50Z" fill="white"/>
          </svg>
        </div>
      </section>

      {/* ===================== PILLARS SECTION ===================== */}
      <section id="about" className="py-24 bg-white relative">
        {/* Soft sky glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-sky-50/50 rounded-full blur-[120px] pointer-events-none" />

        <div className="w-[95%] max-w-[1350px] mx-auto relative z-10">
          <div className="text-center mb-16">
            <span className="inline-flex items-center gap-2 text-xs font-bold text-gov-blue-600 bg-sky-50 px-4 py-1.5 rounded-full uppercase tracking-widest border border-sky-100">
              <ShieldCheck className="w-3.5 h-3.5" />
              Our Mission
            </span>
            <h2 className="text-3xl md:text-5xl font-extrabold text-navy-900 mt-6 mb-5 tracking-tight">
              Building a Transparent India
            </h2>
            <p className="text-lg text-slate-500 max-w-2xl mx-auto leading-relaxed">
              A digital initiative dedicated to strengthening democratic governance
              through transparency, accountability, and effective oversight of
              public development programmes.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {pillars.map((f) => (
              <div
                key={f.title}
                className={`bg-white rounded-3xl p-8 border ${f.border} shadow-lg shadow-slate-100/40 hover:shadow-xl hover:shadow-sky-100/30 transition-all duration-500 group hover:-translate-y-2 relative overflow-hidden`}
              >
                {/* Top accent bar */}
                <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${f.accent} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

                <div className={`w-16 h-16 rounded-2xl ${f.bgColor} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <f.icon className={`w-8 h-8 ${f.iconColor}`} />
                </div>
                <h3 className="text-xl font-bold text-navy-900 mb-3">{f.title}</h3>
                <p className="text-base text-slate-600 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===================== VALUES / COMMITMENT SECTION ===================== */}
      <section className="py-24 relative overflow-hidden">
        {/* Light sky gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-sky-50/40 via-blue-50/25 to-white" />
        <div className="absolute bottom-0 right-[10%] w-[450px] h-[450px] rounded-full bg-sky-100/25 blur-[120px] pointer-events-none" />

        <div className="w-[95%] max-w-[1350px] mx-auto relative z-10">
          <div className="text-center mb-16">
            <span className="inline-flex items-center gap-2 text-xs font-bold text-sky-600 bg-sky-50 px-4 py-1.5 rounded-full uppercase tracking-widest border border-sky-100">
              Our Commitment
            </span>
            <h2 className="text-3xl md:text-5xl font-extrabold text-navy-900 mt-6 mb-5 tracking-tight">
              Technology for Good Governance
            </h2>
            <p className="text-lg text-slate-500 max-w-2xl mx-auto leading-relaxed">
              Leveraging the power of modern technology to serve the people of India
              — making governance more transparent, responsive, and effective.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {values.map((v, idx) => (
              <div key={v.title} className="group relative">
                <div className="bg-white rounded-2xl p-8 border border-slate-100 shadow-md shadow-slate-100/40 hover:shadow-lg hover:shadow-sky-100/30 transition-all duration-300 hover:-translate-y-1 h-full">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-sky-50 to-blue-50 border border-sky-100 flex items-center justify-center mb-5 group-hover:scale-105 transition-transform">
                    <v.icon className="w-7 h-7 text-gov-blue-600" />
                  </div>
                  <h3 className="text-lg font-bold text-navy-900 mb-3">{v.title}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">{v.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===================== CTA SECTION ===================== */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-navy-800 via-navy-900 to-gov-blue-800" />

        {/* Glossy Ashoka Chakra */}
        <div className="absolute top-1/2 right-[-3%] -translate-y-1/2 pointer-events-none opacity-[0.07]">
          <svg width="500" height="500" viewBox="0 0 200 200" fill="none">
            <circle cx="100" cy="100" r="95" stroke="white" strokeWidth="2" />
            <circle cx="100" cy="100" r="85" stroke="white" strokeWidth="1" strokeDasharray="2 4" />
            <circle cx="100" cy="100" r="30" stroke="white" strokeWidth="2" />
            <circle cx="100" cy="100" r="10" fill="white" />
            {Array.from({ length: 24 }).map((_, i) => {
              const angle = (i * 15) * (Math.PI / 180);
              return (
                <line key={i} x1={100 + 30 * Math.cos(angle)} y1={100 + 30 * Math.sin(angle)}
                  x2={100 + 95 * Math.cos(angle)} y2={100 + 95 * Math.sin(angle)}
                  stroke="white" strokeWidth="1.5" />
              );
            })}
          </svg>
        </div>

        <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
          <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4 tracking-tight">
            Committed to a Transparent India
          </h2>
          <p className="text-lg text-sky-200/80 mb-10 max-w-2xl mx-auto leading-relaxed">
            Authorized officials can access the platform to monitor development
            programmes, review project progress, and ensure effective utilization
            of public resources.
          </p>
          <Link
            to="/login"
            className="inline-flex items-center justify-center gap-3 bg-white text-navy-900 font-bold text-lg px-10 py-4 rounded-2xl hover:bg-sky-50 transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1 group"
          >
            <Lock className="w-5 h-5 group-hover:scale-110 transition-transform" />
            Authorized Access Portal
            <ChevronRight className="w-5 h-5 opacity-50 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </section>

      {/* ===================== FOOTER — Light & Balanced ===================== */}
      <footer className="bg-gradient-to-b from-slate-50 to-sky-50/40 border-t border-sky-100/60">
        <div className="w-[95%] max-w-[1350px] mx-auto py-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left">
            <div className="flex items-center gap-4">
              <img src={logo} alt="MPLADS DRISHTI" className="w-14 h-14 drop-shadow-sm" />
              <div>
                <p className="text-base font-extrabold text-navy-800 tracking-wide">MPLADS DRISHTI</p>
                <p className="text-[11px] font-semibold tracking-[0.18em] uppercase text-gov-blue-600/70">
                  Transparent Development • Stronger India
                </p>
              </div>
            </div>
            <div className="text-xs font-medium leading-relaxed text-slate-500">
              <p className="font-semibold text-slate-600">Smart India Hackathon 2026 • Problem Statement #26102</p>
              <p className="mt-1">
                Ministry of Statistics & Programme Implementation • Government of India
              </p>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="mt-8 pt-6 border-t border-sky-100/60 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-xs text-slate-400 font-medium">
              © 2026 MPLADS DRISHTI. All rights reserved. Government of India.
            </p>
            {/* Tri-color accent */}
            <div className="flex items-center gap-1.5">
              <div className="w-8 h-1.5 bg-saffron-500 rounded-full" />
              <div className="w-8 h-1.5 bg-white border border-slate-200 rounded-full" />
              <div className="w-8 h-1.5 bg-india-green-600 rounded-full" />
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
