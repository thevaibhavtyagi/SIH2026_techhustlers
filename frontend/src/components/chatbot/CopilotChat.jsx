import { useState, useRef, useEffect } from 'react';
import { X, Send, Sparkles, Bot, User, Loader2 } from 'lucide-react';
import { getCopilotResponse, getCopilotSuggestions, getCopilotWelcome } from '../../services/api';

export default function CopilotChat({ onClose }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    async function initCopilot() {
      try {
        const welcomeText = await getCopilotWelcome();
        const sugg = await getCopilotSuggestions();
        setMessages([{ role: 'assistant', text: welcomeText, type: 'text' }]);
        setSuggestions(sugg);
      } catch (e) {
        setMessages([{ role: 'assistant', text: 'Welcome to Drishti Copilot.', type: 'text' }]);
      }
    }
    initCopilot();
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSend = async (text) => {
    const query = text || input.trim();
    if (!query || loading) return;

    setMessages(prev => [...prev, { role: 'user', text: query }]);
    setInput('');
    setLoading(true);

    try {
      const response = await getCopilotResponse(query);
      setMessages(prev => [...prev, { role: 'assistant', ...response }]);
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', text: 'Sorry, I encountered an error processing your request.', type: 'text' }]);
    }
    setLoading(false);
  };

  const renderResponse = (msg) => {
    if (msg.role === 'user') {
      return <p className="text-sm">{msg.text}</p>;
    }

    return (
      <div className="space-y-3">
        <p className="text-sm text-slate-700">{msg.text}</p>

        {msg.data && msg.type === 'table' && (
          <div className="overflow-x-auto rounded-lg border border-slate-200">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-slate-50">
                  {Object.keys(msg.data[0]).map(key => (
                    <th key={key} className="px-3 py-2 text-left font-semibold text-slate-600 capitalize">{key}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {msg.data.map((row, i) => (
                  <tr key={i} className="border-t border-slate-100">
                    {Object.values(row).map((val, j) => (
                      <td key={j} className="px-3 py-2 text-slate-700 whitespace-nowrap">{val}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {msg.data && msg.type === 'list' && (
          <div className="space-y-1.5">
            {msg.data.map((item, i) => (
              <div key={i} className="flex justify-between text-xs bg-slate-50 rounded-lg px-3 py-2">
                <span className="text-slate-600">{item.metric}</span>
                <span className="font-semibold text-slate-800">{item.value}</span>
              </div>
            ))}
          </div>
        )}

        {msg.insight && (
          <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-3 text-xs text-indigo-800">
            <span className="font-semibold">💡 Insight:</span> {msg.insight}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="fixed bottom-0 right-0 sm:bottom-6 sm:right-6 z-50 w-full sm:w-[420px] h-[85vh] sm:h-[600px] bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-slide-up">
      {/* Header */}
      <div className="gradient-navy text-white px-5 py-4 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-white/15 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-indigo-300" />
          </div>
          <div>
            <h3 className="font-semibold text-sm">Drishti Copilot</h3>
            <p className="text-[11px] text-slate-300">AI-Powered Intelligence Assistant</p>
          </div>
        </div>
        <button onClick={onClose} className="p-1.5 hover:bg-white/10 rounded-lg transition-colors">
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.map((msg, i) => (
          <div key={i} className={`flex gap-2.5 ${msg.role === 'user' ? 'justify-end' : ''}`}>
            {msg.role === 'assistant' && (
              <div className="w-7 h-7 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Bot className="w-4 h-4 text-indigo-600" />
              </div>
            )}
            <div className={`max-w-[85%] rounded-xl px-4 py-3 ${
              msg.role === 'user'
                ? 'bg-navy-800 text-white rounded-br-sm'
                : 'bg-slate-50 border border-slate-200 rounded-bl-sm'
            }`}>
              {renderResponse(msg)}
            </div>
            {msg.role === 'user' && (
              <div className="w-7 h-7 rounded-full bg-navy-800 flex items-center justify-center flex-shrink-0 mt-0.5">
                <User className="w-4 h-4 text-white" />
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex gap-2.5">
            <div className="w-7 h-7 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
              <Bot className="w-4 h-4 text-indigo-600" />
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-xl rounded-bl-sm px-4 py-3">
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <Loader2 className="w-4 h-4 animate-spin" />
                Analyzing data...
              </div>
            </div>
          </div>
        )}

        {/* Suggestions (only show at start) */}
        {messages.length === 1 && (
          <div className="space-y-2">
            <p className="text-xs text-slate-400 font-medium">Try asking:</p>
            <div className="flex flex-wrap gap-2">
              {suggestions.slice(0, 4).map((s, i) => (
                <button
                  key={i}
                  onClick={() => handleSend(s)}
                  className="text-xs bg-white border border-slate-200 text-slate-600 rounded-full px-3 py-1.5 hover:bg-slate-50 hover:border-gov-blue-300 transition-colors text-left"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="border-t border-slate-200 px-4 py-3 flex-shrink-0">
        <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus-within:border-gov-blue-500 focus-within:ring-1 focus-within:ring-gov-blue-500/30 transition-all">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask about projects, risk, delays..."
            className="flex-1 bg-transparent text-sm outline-none text-slate-700 placeholder:text-slate-400"
            disabled={loading}
          />
          <button
            onClick={() => handleSend()}
            disabled={!input.trim() || loading}
            className="p-2 bg-navy-800 text-white rounded-lg hover:bg-navy-900 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
        <p className="text-[10px] text-slate-400 mt-2 text-center">AI-generated from live MPLADS risk data — verify before acting on any flagged item</p>
      </div>
    </div>
  );
}
