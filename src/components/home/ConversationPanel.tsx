import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useEmergency } from '../../context/EmergencyContext';
import { Bot, User, Send, Sparkles } from 'lucide-react';
import { apiService } from '../../services/api';

export const ConversationPanel: React.FC = () => {
  const { 
    dialogueMessages, 
    addDialogueMessage, 
    setIsListening, 
    setActiveSession, 
    speakInstruction,
    locationGPS 
  } = useEmergency();

  const [promptInput, setPromptInput] = useState('');

  const handleSendPrompt = async () => {
    if (!promptInput.trim()) return;
    const text = promptInput.trim();
    setPromptInput('');

    addDialogueMessage({
      sender: 'USER',
      text: text,
      confidence: 0.98
    });

    setIsListening(true);
    const triageResult = await apiService.runTriage(text, locationGPS);
    setActiveSession(triageResult);

    setTimeout(() => {
      setIsListening(false);
      addDialogueMessage({
        sender: 'ECHO_AI',
        text: `EchoAid Assessment: ${triageResult.guidance} Action recommended: ${triageResult.recommended_action}`,
        confidence: 0.99
      });
      speakInstruction(triageResult.guidance);
    }, 1000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-3xl mx-auto glass-card rounded-3xl p-6 border border-space-border space-y-4 shadow-card-soft"
    >
      <div className="flex items-center justify-between border-b border-space-border pb-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-brand-accent" />
          <span className="text-xs font-mono font-bold text-slate-300">LIVE CONVERSATION TRANSCRIPT</span>
        </div>
        <span className="text-[11px] font-mono text-slate-400">NVIDIA NIM ENGINE ENCRYPTED</span>
      </div>

      {/* Messages Scroll Area */}
      <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1">
        {dialogueMessages.map((msg) => (
          <div
            key={msg.id}
            className={`p-4 rounded-2xl text-xs sm:text-sm leading-relaxed space-y-1 ${
              msg.sender === 'ECHO_AI'
                ? 'bg-brand-accent/10 border border-brand-accent/30 text-white ml-4'
                : msg.sender === 'USER'
                ? 'bg-space-surface border border-space-border text-white mr-4'
                : 'bg-space-card/60 text-slate-400 text-center font-mono text-xs border border-space-border'
            }`}
          >
            <div className="flex items-center justify-between text-[11px] font-mono opacity-70">
              <span className="font-bold flex items-center gap-1">
                {msg.sender === 'ECHO_AI' && <Bot className="w-3.5 h-3.5 text-brand-accent" />}
                {msg.sender === 'USER' && <User className="w-3.5 h-3.5 text-slate-300" />}
                {msg.sender}
              </span>
              <span>{msg.timestamp}</span>
            </div>
            <div>{msg.text}</div>
          </div>
        ))}
      </div>

      {/* Input Box */}
      <div className="flex gap-2 pt-2 border-t border-space-border">
        <input
          type="text"
          value={promptInput}
          onChange={(e) => setPromptInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSendPrompt()}
          placeholder="Speak or type symptoms (e.g. My chest hurts and I can't breathe)..."
          className="flex-1 px-4 py-3 rounded-2xl bg-space-surface border border-space-border text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-accent font-sans"
        />
        <button
          onClick={handleSendPrompt}
          className="px-5 py-3 rounded-2xl bg-brand-accent text-white font-bold text-xs shadow-glow-brand hover:scale-105 transition-all flex items-center gap-1.5"
        >
          <Send className="w-4 h-4" />
          <span className="hidden sm:inline">Send</span>
        </button>
      </div>

    </motion.div>
  );
};
