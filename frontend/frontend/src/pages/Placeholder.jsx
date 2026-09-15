import { Construction, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Placeholder({ title }) {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] bg-white rounded-xl border border-slate-200 shadow-sm p-8 text-center animate-fade-in">
      <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-2xl flex items-center justify-center mb-6">
        <Construction className="w-8 h-8" />
      </div>
      <h2 className="text-2xl font-bold text-slate-800 mb-2">{title || 'Under Construction'}</h2>
      <p className="text-slate-500 max-w-md mb-8">
        This section of the MPLADS DRISHTI platform is currently being developed for the prototype. It will be available in the next release phase.
      </p>
      <button 
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 px-5 py-2.5 bg-navy-800 text-white font-medium rounded-lg hover:bg-navy-900 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Go Back
      </button>
    </div>
  );
}
