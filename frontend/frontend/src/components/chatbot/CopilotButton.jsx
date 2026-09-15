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
          className="fixed bottom-6 right-6 z-40 group flex items-center gap-2 bg-navy-800 text-white px-5 py-3.5 rounded-full shadow-xl hover:bg-navy-900 hover:shadow-2xl transition-all duration-300 hover:scale-105"
          title="Open Drishti Copilot"
        >
          <Sparkles className="w-5 h-5 text-indigo-300" />
          <span className="text-sm font-medium hidden sm:inline">Drishti Copilot</span>
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-indigo-400 rounded-full animate-pulse-subtle" />
        </button>
      )}
      {isOpen && <CopilotChat onClose={() => setIsOpen(false)} />}
    </>
  );
}
