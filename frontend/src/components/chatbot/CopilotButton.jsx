import { useState } from 'react';
import { Sparkles } from 'lucide-react';
import CopilotChat from './CopilotChat';

export default function CopilotButton() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-8 z-40 group flex items-center gap-2.5 px-6 py-3.5 bg-gradient-to-r from-gov-blue-600 via-indigo-600 to-purple-600 bg-[length:200%_auto] hover:bg-right text-white rounded-full shadow-[0_0_25px_rgba(99,102,241,0.6)] ring-2 ring-white/30 hover:shadow-[0_0_45px_rgba(99,102,241,0.9)] transition-all duration-500 hover:-translate-y-2 hover:scale-105"
          title="Open Drishti Copilot"
        >
          <Sparkles className="w-5 h-5 text-sky-200 group-hover:text-white transition-colors" />
          <span className="text-[14.5px] font-bold tracking-wide hidden sm:inline">Drishti Copilot</span>
        </button>
      )}
      {isOpen && <CopilotChat onClose={() => setIsOpen(false)} />}
    </>
  );
}
