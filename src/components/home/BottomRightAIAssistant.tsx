import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, X, Send, Sparkles, Shield } from 'lucide-react';
import { useEmergency } from '../../context/EmergencyContext';

export const BottomRightAIAssistant: React.FC = () => {
  const { dialogueMessages, handleSpokenInput, isAnalyzing } = useEmergency();
  const [isOpen, setIsOpen] = useState(false);
  const [inputText, setInputText] = useState('');

  const handleSend = () => {
    if (!inputText.trim()) return;
    const txt = inputText.trim();
    setInputText('');
    handleSpokenInput(txt);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      
      {/* Expanded Glass Conversation Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            className="w-[360px] sm:w-[400px] h-[480px] mb-4 rounded-3xl bg-[#0D1324]/85 border border-white/15 backdrop-blur-2xl shadow-[0_20px_60px_rgba(0,0,0,0.8)] flex flex-col overflow-hidden glass-shimmer"
          >
            {/* Panel Header */}
            <div className="flex items-center justify-between p-4 border-b border-white/10 bg-white/[0.03]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-300 shadow-[0_0_12px_rgba(0,229,255,0.4)]">
                  <Shield className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white font-sans">EchoAid AI Assistant</h3>
                  <div className="flex items-center gap-1.5 text-[10px] text-emerald-400 font-mono">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                    <span>Real-time Triage Active</span>
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                aria-label="Close Assistant Panel"
                className="p-1.5 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 text-slate-300 hover:text-white transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Chat Transcript Area */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3 custom-scrollbar">
              {dialogueMessages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center text-slate-400 space-y-2 p-6">
                  <Bot className="w-8 h-8 text-cyan-400/60 animate-bounce" />
                  <p className="text-xs font-sans">I am EchoAid X. Tell me what happened, or type your query below.</p>
                </div>
              ) : (
                dialogueMessages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex items-start gap-2 ${msg.sender === 'USER' ? 'justify-end' : 'justify-start'}`}
                  >
                    {msg.sender === 'ECHO_AI' && (
                      <div className="w-6 h-6 rounded-lg bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-300 shrink-0 mt-0.5">
                        <Bot className="w-3.5 h-3.5" />
                      </div>
                    )}
                    <div
                      className={`p-3 rounded-2xl text-xs max-w-[82%] leading-relaxed font-sans ${
                        msg.sender === 'USER'
                          ? 'bg-gradient-to-r from-cyan-500/30 to-blue-600/30 border border-cyan-400/40 text-white rounded-br-none'
                          : 'bg-white/[0.06] border border-white/10 text-slate-200 rounded-bl-none'
                      }`}
                    >
                      {msg.text}
                    </div>
                  </div>
                ))
              )}
              {isAnalyzing && (
                <div className="flex items-center gap-2 text-cyan-300 text-xs font-mono p-2">
                  <Sparkles className="w-3.5 h-3.5 animate-spin" />
                  <span>EchoAid is analyzing input...</span>
                </div>
              )}
            </div>

            {/* Typing Bar */}
            <div className="p-3 border-t border-white/10 bg-white/[0.02]">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Ask or report an emergency..."
                  className="flex-1 px-3.5 py-2.5 rounded-xl bg-white/[0.05] border border-white/10 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-400/60 font-sans"
                />
                <button
                  type="button"
                  onClick={handleSend}
                  aria-label="Send Message"
                  className="p-2.5 rounded-xl bg-cyan-500/20 border border-cyan-400/40 hover:bg-cyan-500/30 text-cyan-300 transition-all cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Bottom-Right Launcher Orb */}
      <motion.button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.08, y: -2 }}
        whileTap={{ scale: 0.94 }}
        animate={{
          y: [0, -6, 0],
        }}
        transition={{
          y: { duration: 4, repeat: Infinity, ease: 'easeInOut' },
        }}
        aria-label="Open AI Assistant Chat"
        className="relative group p-3.5 rounded-full bg-gradient-to-br from-cyan-500/25 via-navy-900 to-purple-600/30 border border-cyan-400/50 backdrop-blur-xl shadow-[0_0_25px_rgba(0,229,255,0.4)] text-cyan-300 hover:text-white transition-all cursor-pointer"
      >
        <span className="absolute inset-0 rounded-full bg-cyan-400/20 animate-ping pointer-events-none" />
        <Bot className="w-6 h-6 relative z-10" />
      </motion.button>

    </div>
  );
};
