import { Link } from 'react-router-dom';
import { Shield, Brain, MapPin, AlertTriangle, TrendingUp, Users, Eye, Zap, ArrowRight, BarChart3, Lock, FileSearch, ChevronRight, Database, Server, Cpu, Layers } from 'lucide-react';
import logo from '../assets/mplads-drishti-logo.png';

const stats = [
  { label: 'Projects Monitored', value: '12,482', icon: BarChart3 },
  { label: 'Funds Tracked', value: '₹8,642 Cr', icon: TrendingUp },
  { label: 'AI Risk Detections', value: '847', icon: AlertTriangle },
  { label: 'States Covered', value: '36', icon: MapPin },
];

const capabilities = [
  { icon: Eye, title: 'Real-Time Monitoring', desc: 'Continuous surveillance of project progress, expenditure, and milestones across all constituencies.' },
  { icon: Brain, title: 'Anomaly Detection', desc: 'Isolation Forest identifies statistical outliers and unusual project behavior patterns.' },
  { icon: AlertTriangle, title: 'Risk Intelligence', desc: 'Three-stage AI pipeline generates 0–100 risk scores with explainable contributing factors.' },
  { icon: FileSearch, title: 'Investigation Workflow', desc: 'End-to-end case management from automated alert to investigation resolution.' },
  { icon: Shield, title: 'Contractor Scoring', desc: 'AI-powered contractor reliability scores based on historical performance and risk patterns.' },
  { icon: MapPin, title: 'Geographic Intelligence', desc: 'Interactive India risk map with state and district-level drill-down analysis.' },
];

const pipeline = [
  { label: 'Data Ingestion', desc: 'Project records, financials, progress reports', color: 'bg-blue-500' },
  { label: 'Rule Engine', desc: 'Detects duplicates, inconsistencies, rule violations', color: 'bg-indigo-500' },
  { label: 'Isolation Forest', desc: 'Identifies statistical outliers and anomalies', color: 'bg-purple-500' },
  { label: 'Random Forest', desc: 'Predicts extreme delays and cost overruns', color: 'bg-violet-500' },
  { label: 'Risk Engine', desc: 'Unified 0–100 risk scoring', color: 'bg-orange-500' },
  { label: 'Explainable AI', desc: 'Human-readable explanations for every flag', color: 'bg-rose-500' },
];

const roles = [
  { role: 'Ministry Admin', desc: 'National command center with full visibility across all states, AI risk engine, investigation management, and contractor intelligence.', features: ['National Dashboard', 'AI Risk Engine', 'Investigation Queue', 'Contractor Intelligence', 'Geographic Intelligence', 'Report Builder'] },
  { role: 'Member of Parliament', desc: 'Constituency-focused dashboard showing projects, funds, progress, and risk alerts specific to their area.', features: ['Constituency Dashboard', 'My Projects', 'Fund Tracking', 'Progress Monitoring', 'Risk Alerts'] },
  { role: 'Citizen', desc: 'Public transparency portal for searching projects, tracking development, and reporting concerns.', features: ['Project Search', 'Development Tracking', 'Public Expenditure', 'Report a Concern', 'Nearby Projects'] },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className="fixed top-0 w-full bg-white/90 backdrop-blur-md border-b border-slate-200 z-50">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={logo} alt="MPLADS DRISHTI" className="w-10 h-10" />
            <div>
              <span className="font-bold text-navy-800 text-sm tracking-wide">MPLADS DRISHTI</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login" className="text-sm font-medium text-slate-600 hover:text-navy-800 px-4 py-2 rounded-lg hover:bg-slate-100 transition-colors">
              Login
            </Link>
            <Link to="/register" className="text-sm font-medium text-white bg-navy-800 px-5 py-2.5 rounded-lg hover:bg-navy-900 transition-colors">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="gradient-hero text-white pt-32 pb-20 relative overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full border border-white/20" />
          <div className="absolute bottom-1/4 right-1/4 w-64 h-64 rounded-full border border-white/20" />
        </div>
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <img src={logo} alt="MPLADS DRISHTI" className="w-28 h-28 mx-auto mb-8 animate-fade-in" />
            <h1 className="text-4xl md:text-5xl font-bold mb-4 animate-fade-in">
              AI-Powered MPLADS Monitoring & Risk Intelligence
            </h1>
            <p className="text-lg text-slate-300 mb-8 max-w-2xl mx-auto animate-slide-up">
              Transforming project monitoring from manual review into intelligent, explainable, data-driven oversight.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-up">
              <Link to="/login" className="inline-flex items-center gap-2 bg-white text-navy-800 font-semibold px-8 py-3.5 rounded-xl hover:bg-slate-100 transition-colors shadow-lg">
                <Lock className="w-5 h-5" /> Secure Login
              </Link>
              <a href="#capabilities" className="inline-flex items-center gap-2 bg-white/10 text-white font-semibold px-8 py-3.5 rounded-xl hover:bg-white/20 transition-colors border border-white/20">
                Explore Platform <ArrowRight className="w-5 h-5" />
              </a>
            </div>
          </div>
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-16 max-w-4xl mx-auto">
            {stats.map(s => (
              <div key={s.label} className="glass rounded-xl px-5 py-4 text-center">
                <s.icon className="w-6 h-6 mx-auto mb-2 text-indigo-300" />
                <p className="text-2xl font-bold">{s.value}</p>
                <p className="text-xs text-slate-300 mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Challenge */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <p className="text-sm font-semibold text-gov-blue-600 uppercase tracking-wider mb-2">The Challenge</p>
            <h2 className="text-3xl font-bold text-slate-800 mb-4">MPLADS Oversight Needs Intelligence</h2>
            <p className="text-slate-600">The MPLAD Scheme disburses ₹5 Crore annually to each MP for local development. With 12,000+ projects across India, manual review cannot detect anomalies, fraud, or inefficiencies at scale.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { title: 'Delayed Detection', desc: 'Anomalies in expenditure and progress are discovered months or years after funds are disbursed.' },
              { title: 'Information Asymmetry', desc: 'No unified view connecting project data, contractor history, and geographic patterns.' },
              { title: 'Manual Review Limits', desc: 'Thousands of projects make comprehensive human oversight physically impossible.' },
            ].map(c => (
              <div key={c.title} className="bg-white rounded-xl p-6 border border-slate-200 hover:shadow-lg transition-shadow">
                <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center mb-4">
                  <AlertTriangle className="w-5 h-5 text-red-500" />
                </div>
                <h3 className="font-semibold text-slate-800 mb-2">{c.title}</h3>
                <p className="text-sm text-slate-600">{c.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AI Pipeline */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <p className="text-sm font-semibold text-gov-blue-600 uppercase tracking-wider mb-2">How AI Detects Risk</p>
            <h2 className="text-3xl font-bold text-slate-800 mb-4">Three-Stage Intelligence Pipeline</h2>
            <p className="text-slate-600">Our ML architecture processes every MPLADS project through multiple detection stages to generate explainable risk scores.</p>
          </div>
          <div className="max-w-4xl mx-auto">
            <div className="space-y-4">
              {pipeline.map((step, i) => (
                <div key={step.label} className="flex items-center gap-4 animate-fade-in" style={{ animationDelay: `${i * 100}ms` }}>
                  <div className={`w-12 h-12 rounded-xl ${step.color} flex items-center justify-center text-white font-bold text-lg flex-shrink-0`}>
                    {i + 1}
                  </div>
                  <div className="flex-1 bg-slate-50 rounded-xl p-4 border border-slate-200">
                    <h4 className="font-semibold text-slate-800">{step.label}</h4>
                    <p className="text-sm text-slate-600">{step.desc}</p>
                  </div>
                  {i < pipeline.length - 1 && (
                    <div className="hidden md:block">
                      <ChevronRight className="w-5 h-5 text-slate-300 rotate-90" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Capabilities */}
      <section id="capabilities" className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <p className="text-sm font-semibold text-gov-blue-600 uppercase tracking-wider mb-2">Key Capabilities</p>
            <h2 className="text-3xl font-bold text-slate-800">Comprehensive Intelligence Platform</h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {capabilities.map(c => (
              <div key={c.title} className="bg-white rounded-xl p-6 border border-slate-200 hover:shadow-lg hover:border-gov-blue-200 transition-all group">
                <div className="w-12 h-12 rounded-xl bg-gov-blue-50 flex items-center justify-center mb-4 group-hover:bg-gov-blue-100 transition-colors">
                  <c.icon className="w-6 h-6 text-gov-blue-600" />
                </div>
                <h3 className="font-semibold text-slate-800 mb-2">{c.title}</h3>
                <p className="text-sm text-slate-600">{c.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Roles */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <p className="text-sm font-semibold text-gov-blue-600 uppercase tracking-wider mb-2">Role-Based Access</p>
            <h2 className="text-3xl font-bold text-slate-800">Tailored Dashboards for Every Stakeholder</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {roles.map(r => (
              <div key={r.role} className="bg-slate-50 rounded-xl p-6 border border-slate-200">
                <div className="w-10 h-10 rounded-lg bg-navy-800 flex items-center justify-center mb-4">
                  <Users className="w-5 h-5 text-white" />
                </div>
                <h3 className="font-bold text-slate-800 mb-2">{r.role}</h3>
                <p className="text-sm text-slate-600 mb-4">{r.desc}</p>
                <ul className="space-y-1.5">
                  {r.features.map(f => (
                    <li key={f} className="text-sm text-slate-600 flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-gov-blue-500" /> {f}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Architecture */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <p className="text-sm font-semibold text-gov-blue-600 uppercase tracking-wider mb-2">Platform Architecture</p>
            <h2 className="text-3xl font-bold text-slate-800">Modern, Scalable Technology Stack</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-4xl mx-auto">
            {[
              { icon: Layers, label: 'React Frontend', desc: 'Modern SPA with role-based dashboards' },
              { icon: Server, label: 'Node.js API', desc: 'Express middleware & authentication' },
              { icon: Cpu, label: 'FastAPI ML', desc: 'Python ML pipeline & risk scoring' },
              { icon: Database, label: 'PostgreSQL', desc: 'Structured project & analytics data' },
            ].map(t => (
              <div key={t.label} className="bg-white rounded-xl p-5 border border-slate-200 text-center">
                <t.icon className="w-8 h-8 mx-auto mb-3 text-navy-800" />
                <h4 className="font-semibold text-slate-800 text-sm">{t.label}</h4>
                <p className="text-xs text-slate-500 mt-1">{t.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="gradient-hero text-white py-20">
        <div className="max-w-3xl mx-auto text-center px-6">
          <h2 className="text-3xl font-bold mb-4">Experience Intelligent MPLADS Oversight</h2>
          <p className="text-slate-300 mb-8">See how AI transforms development monitoring from reactive to predictive.</p>
          <Link to="/login" className="inline-flex items-center gap-2 bg-white text-navy-800 font-semibold px-8 py-3.5 rounded-xl hover:bg-slate-100 transition-colors shadow-lg">
            <Lock className="w-5 h-5" /> Access the Platform
          </Link>
          <div className="mt-8 space-y-2">
            <p className="text-xs text-slate-400">Prototype for Smart India Hackathon 2026</p>
            <p className="text-xs text-slate-500">Demonstration prototype using synthetic/demo data. Not a live government system.</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-navy-900 text-slate-400 py-8">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img src={logo} alt="MPLADS DRISHTI" className="w-8 h-8" />
            <div>
              <p className="text-sm font-semibold text-white">MPLADS DRISHTI</p>
              <p className="text-[10px] tracking-wider">TRANSPARENT DEVELOPMENT • STRONGER INDIA</p>
            </div>
          </div>
          <p className="text-xs">SIH 2026 • Problem #26102 • MoSPI • Smart Automation</p>
        </div>
      </footer>
    </div>
  );
}
