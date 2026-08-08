import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Variants } from 'framer-motion';
import { useEmergency } from '../../context/EmergencyContext';
import { AuroraLayer } from '../home/AuroraLayer';
import { StarParticlesLayer } from '../home/StarParticlesLayer';
import { HUDRingsLayer } from '../home/HUDRingsLayer';
import { ECGAccentsLayer } from '../home/ECGAccentsLayer';
import { NeuralBrainPulsesLayer } from '../home/NeuralBrainPulsesLayer';
import { AIOrb } from '../home/AIOrb';
import { VoiceWaveform } from '../home/VoiceWaveform';
import { CustomCursor } from '../common/CustomCursor';
import { BottomRightAIAssistant } from '../home/BottomRightAIAssistant';
import { PhoneCall, MapPin, Stethoscope, Users, Lock, Mic, Shield, Sparkles } from 'lucide-react';

const LinkedinIcon: React.FC<{ className?: string }> = ({ className = "w-4 h-4" }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.25V10.9H6.46M7.86 6.77a1.64 1.64 0 1 0 0 3.28 1.64 1.64 0 0 0 0-3.28Z" />
  </svg>
);

export const LandingScreen: React.FC = () => {
  const { 
    screenState,
    startConversation, 
    setActiveModal, 
    isBackendOnline, 
    isListening, 
    isSpeaking, 
    isAnalyzing,
    isUserSpeaking,
    isAISpeaking,
    agoraStatus,
    isEmergencyActive
  } = useEmergency();

  const isSessionActive = screenState !== 'landing';

  // SECTION 2: Dynamic greeting based on real current time
  // EASTER EGG 1: Logo 5-Click Handler
  const [logoClickCount, setLogoClickCount] = useState(0);
  const [showEasterEggToast, setShowEasterEggToast] = useState(false);

  // Requirement 15: Zero-Lag GPU Parallax via direct rAF DOM mutation (0 React re-renders on mousemove)
  useEffect(() => {
    let rafId: number;
    const handleMouseMove = (e: MouseEvent) => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        const centerX = window.innerWidth / 2;
        const centerY = window.innerHeight / 2;
        const offsetX = ((e.clientX - centerX) / centerX) * 2.5; // Max ±2.5px
        const offsetY = ((e.clientY - centerY) / centerY) * 2.5; // Max ±2.5px
        const stageEl = document.getElementById('parallax-brain-stage');
        if (stageEl) {
          stageEl.style.transform = `translate3d(${offsetX}px, ${offsetY}px, 0)`;
        }
      });
    };
    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(rafId);
    };
  }, []);

  // EASTER EGG 2: Brain Click Neural Pulse Handler
  const [brainClickActive, setBrainClickActive] = useState(false);
  const handleBrainClick = () => {
    setBrainClickActive(true);
    setTimeout(() => setBrainClickActive(false), 1600);
  };

  const handleLogoClick = () => {
    const next = logoClickCount + 1;
    setLogoClickCount(next);
    if (next >= 5) {
      setShowEasterEggToast(true);
      setLogoClickCount(0);
      setTimeout(() => setShowEasterEggToast(false), 4000);
    }
  };

  const getDynamicGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return { main: "Good Morning.", sub: "What's happening right now?" };
    if (hour >= 12 && hour < 17) return { main: "Good Afternoon.", sub: "What's happening right now?" };
    if (hour >= 17 && hour < 21) return { main: "Good Evening.", sub: "What's happening right now?" };
    return { main: "Good Evening.", sub: "What's happening right now?" };
  };

  const dynamicGreeting = getDynamicGreeting();

  // LIVE CLOCK — updates every second
  const [liveTime, setLiveTime] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setLiveTime(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  const clockTime = liveTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
  const clockDate = liveTime.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

  // SCANNER SWEEP — every 12s cinematic light across brain
  const [scannerActive, setScannerActive] = useState(false);
  useEffect(() => {
    const loop = setInterval(() => {
      setScannerActive(true);
      setTimeout(() => setScannerActive(false), 2000);
    }, 12000);
    return () => clearInterval(loop);
  }, []);

  // SECTION 1: Page Load Entrance Sequence (1.4s with cubic-bezier(0.22, 1, 0.36, 1))
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.18,
        delayChildren: 0.1,
        duration: 1.4,
        ease: [0.22, 1, 0.36, 1]
      },
    },
  };

  const line1Variants: Variants = {
    hidden: { opacity: 0, y: 16, filter: 'blur(10px)' },
    visible: {
      opacity: 1,
      y: 0,
      filter: 'blur(0px)',
      transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] }
    }
  };

  const line3Variants: Variants = {
    hidden: { opacity: 0, y: 16, filter: 'blur(10px)' },
    visible: {
      opacity: 1,
      y: 0,
      filter: 'blur(0px)',
      transition: { duration: 0.7, delay: 0.36, ease: [0.22, 1, 0.36, 1] }
    }
  };

  const orbVariants: Variants = {
    hidden: { opacity: 0, scale: 0.85 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.7, delay: 0.54, ease: [0.22, 1, 0.36, 1] }
    }
  };

  const cardsVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, delay: 0.72, ease: [0.22, 1, 0.36, 1] }
    }
  };

  const quickActions = [
    {
      id: 'ambulance',
      title: 'Call Ambulance',
      subtitle: 'Instant 911 / 108 Dispatch',
      icon: <PhoneCall className="w-4 h-4 text-red-400" />,
      color: 'border-white/15 hover:border-red-500/60 bg-white/[0.04] hover:bg-red-500/10 shadow-glow-red/20',
      action: () => startConversation('Emergency: Need immediate ambulance dispatch')
    },
    {
      id: 'location',
      title: 'Share Location',
      subtitle: 'Live GPS Broadcast',
      icon: <MapPin className="w-4 h-4 text-cyan-400" />,
      color: 'border-white/15 hover:border-cyan-400/60 bg-white/[0.04] hover:bg-cyan-500/10 shadow-glow-brand/20',
      action: () => startConversation('Sharing live location for emergency assistance')
    },
    {
      id: 'medical-id',
      title: 'Medical ID',
      subtitle: 'View Profile & Allergies',
      icon: <Stethoscope className="w-4 h-4 text-purple-400" />,
      color: 'border-white/15 hover:border-purple-500/60 bg-white/[0.04] hover:bg-purple-500/10 shadow-glow-purple/20',
      action: () => setActiveModal('medical-id')
    },
    {
      id: 'contacts',
      title: 'Emergency Contacts',
      subtitle: 'Notify Loved Ones',
      icon: <Users className="w-4 h-4 text-emerald-400" />,
      color: 'border-white/15 hover:border-emerald-500/60 bg-white/[0.04] hover:bg-emerald-500/10 shadow-glow-emerald/20',
      action: () => setActiveModal('contacts')
    },
  ];

  return (
    <div className="relative min-h-screen bg-[#03050F] overflow-hidden text-white font-sans selection:bg-cyan-500/30 selection:text-cyan-200">

      {/* 10. AI ASSISTANT: Floating Bottom-Right Assistant Orb & Conversation Drawer */}
      <BottomRightAIAssistant />

      {/* SECTION 1: Deep Dark Space Starfield Layer + Ambient Light Particles */}
      <StarParticlesLayer />
      
      {/* SECTION 1: Faint Noise Texture Overlay (2% Opacity) */}
      <div 
        className="absolute inset-0 z-1 pointer-events-none opacity-[0.02] mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`
        }}
      />

      {/* Seamless Fluid Deep Space Background */}
      <div 
        className="absolute inset-0 z-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at 70% 30%, #081a38 0%, #050b1e 50%, #02030a 100%)'
        }}
      />

      {/* SECTION 2: 3 Independent Volumetric Aurora Borealis Layers */}
      <AuroraLayer />

      {/* ECG Heartbeat Accent Lines */}
      <ECGAccentsLayer />

      {/* SECTION 2: Live Atmospheric Lighting & Soft Vignette */}
      <motion.div 
        animate={{
          opacity: isSessionActive ? 0.9 : 0.65
        }}
        transition={{ duration: 1 }}
        className="absolute inset-0 z-3 pointer-events-none"
        style={{
          background: 'radial-gradient(circle at 30% 40%, rgba(0, 229, 255, 0.15) 0%, transparent 60%), radial-gradient(circle at 75% 35%, rgba(217, 70, 239, 0.2) 0%, transparent 55%), radial-gradient(ellipse at center, transparent 50%, rgba(2, 3, 10, 0.7) 100%)'
        }}
      />

      {/* SECTION 4: Right Side Holographic Head & MRI Brain Visualization (Seamless full-canvas blend, zero seam line) */}
      <motion.div 
        id="parallax-brain-stage"
        animate={{
          scale: brainClickActive ? [1, 1.03, 1] : [1, 1.005, 1]
        }}
        transition={{ duration: brainClickActive ? 0.4 : 6, repeat: brainClickActive ? 2 : Infinity, ease: 'easeInOut' }}
        onClick={handleBrainClick}
        title="Click Brain for Neural Pulse Surge"
        className="absolute inset-0 w-full h-full z-4 pointer-events-auto cursor-pointer flex items-center justify-end overflow-hidden"
        style={{
          willChange: 'transform'
        }}
      >
        <div className="relative w-full h-full max-h-screen flex items-center justify-end">
          
          {/* Easter Egg 2: Neural Spark Pulse Overlay on Click */}
          <AnimatePresence>
            {brainClickActive && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: [0.2, 0.8, 0], scale: [0.9, 1.3, 1.5] }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1.4, ease: 'easeOut' }}
                className="absolute top-[20%] right-[25%] w-64 h-64 rounded-full bg-cyan-400/30 blur-3xl pointer-events-none z-30"
              />
            )}
          </AnimatePresence>

          {/* Depth Shadow Behind Holographic Head */}
          <div className="absolute inset-0 w-full h-full bg-radial-vignette opacity-70 pointer-events-none" />

          {/* Requirement 13: Light Refraction Mesh (Aurora colors soft bend across skull) */}
          <motion.div 
            animate={{
              opacity: [0.15, 0.35, 0.15],
              rotate: [0, 15, 0]
            }}
            transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute top-[10%] right-[15%] w-[45%] h-[75%] rounded-full bg-gradient-to-tr from-cyan-500/10 via-purple-500/10 to-pink-500/10 blur-3xl pointer-events-none mix-blend-screen"
          />

          {/* Holographic Head & Brain Image with ultra-smooth 5-stop horizontal blend mask to erase all seam lines */}
          <img
            src="/assets/hero.webp"
            alt="EchoAid X Holographic Glass Head & Brain Artwork"
            className="h-full w-auto max-w-none object-contain object-right z-0 pointer-events-none opacity-95 mix-blend-lighten filter drop-shadow-[0_20px_50px_rgba(0,0,0,0.9)]"
            style={{
              maskImage: 'linear-gradient(to right, transparent 0%, transparent 30%, rgba(0,0,0,0.2) 42%, rgba(0,0,0,0.7) 58%, black 78%)',
              WebkitMaskImage: 'linear-gradient(to right, transparent 0%, transparent 30%, rgba(0,0,0,0.2) 42%, rgba(0,0,0,0.7) 58%, black 78%)'
            }}
          />

          {/* Brain Glow & Neural Pulses Overlays */}
          <div className="absolute inset-0 w-full h-full flex items-center justify-end pointer-events-none z-1">
            <div className="relative w-[520px] h-[520px] lg:w-[600px] lg:h-[600px] max-h-screen flex items-center justify-center">
              
              {/* 1. Soft Cyan Rim Light around Skull Edge */}
              <div className="absolute w-[46%] h-[46%] top-[18%] right-[22%] rounded-full border border-cyan-400/25 shadow-[0_0_50px_rgba(0,229,255,0.3)] pointer-events-none" />

              {/* 2. Soft Purple Inner Glow Behind Brain */}
              <div className="absolute w-[40%] h-[40%] top-[20%] right-[24%] rounded-full bg-purple-900/35 blur-3xl pointer-events-none" />

              {/* 3. Requirement 3: Brain Glow Breathing Pulse (6-second infinite loop 1 -> 1.005 -> 1) */}
              <motion.div 
                animate={{
                  scale: isAISpeaking || isAnalyzing ? [1, 1.15, 1] : [1, 1.005, 1],
                  opacity: isAISpeaking ? [0.8, 1, 0.8] : [0.65, 0.85, 0.65]
                }}
                transition={{ duration: isAISpeaking || isAnalyzing ? 1.4 : 6.0, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute w-[40%] h-[40%] top-[20%] right-[24%] rounded-full bg-radial-brain-glow pointer-events-none" 
              />
              
              {/* 4. REAL ANATOMICAL SVG NEURAL LIGHT PULSES LAYER (Requirement 1, 2, 5, 6, 7, 8, 11, 12, 14, 16, 17) */}
              <NeuralBrainPulsesLayer />

              {/* 5. Requirement 4: Holographic Depth Glass Reflection Sweep */}
              <motion.div 
                animate={{
                  x: ['-100%', '180%'],
                  opacity: [0, 0.35, 0]
                }}
                transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute inset-y-0 right-0 w-32 bg-gradient-to-r from-transparent via-cyan-300/15 to-transparent pointer-events-none rotate-12 blur-sm" 
              />

              {/* 6. Requirement 7: Diagonal Medical Scanning Light Beam */}
              <motion.div
                animate={{
                  y: ['-120%', '160%'],
                  opacity: [0, 0.5, 0]
                }}
                transition={{ duration: 12, repeat: Infinity, repeatDelay: 8, ease: 'easeInOut' }}
                className="absolute inset-x-0 h-[120px] bg-gradient-to-b from-transparent via-cyan-400/25 to-transparent blur-[40px] pointer-events-none -rotate-12"
              />

            </div>
          </div>
        </div>
      </motion.div>

      {/* SECTION 3: Medical Concentric Scanning HUD Layer */}
      <HUDRingsLayer />

      {/* CINEMATIC SCANNER SWEEP — every 12s a light races across the brain */}
      <AnimatePresence>
        {scannerActive && (
          <motion.div
            key="scanner"
            initial={{ x: '-10%', opacity: 0 }}
            animate={{ x: '110%', opacity: [0, 0.18, 0.18, 0] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.8, ease: [0.22, 1, 0.36, 1] }}
            className="absolute top-0 right-0 w-[55%] h-full z-5 pointer-events-none"
            style={{
              background: 'linear-gradient(105deg, transparent 20%, rgba(0,229,255,0.25) 50%, transparent 80%)',
              filter: 'blur(18px)',
            }}
          />
        )}
      </AnimatePresence>

      {/* Primary Interactive Stage Layer (z-index 20) */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-20 h-screen max-h-screen flex flex-col justify-between p-3 sm:p-4 lg:px-7 lg:py-3.5 max-w-[1920px] mx-auto pointer-events-auto overflow-hidden"
      >
        
        {/* Top Header Bar */}
        <header className="flex flex-wrap items-center justify-between gap-3 z-30 shrink-0">
          
          {/* Top Left Logo & Subtitle — Easter Egg 1: Click 5 Times */}
          <div 
            onClick={handleLogoClick} 
            className="flex items-center gap-2.5 cursor-pointer group select-none relative"
            title="Click 5 times for Easter Egg"
          >
            <div className="w-8 h-8 rounded-xl bg-[#00E5FF]/15 border border-[#00E5FF]/50 flex items-center justify-center text-[#00E5FF] shadow-[0_0_15px_rgba(0,229,255,0.4)] backdrop-blur-xl transition-all duration-300 group-hover:scale-105 group-hover:border-cyan-400">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[20px] font-black tracking-tight text-white font-sans flex items-center gap-1.5 leading-none">
                EchoAid
                <span className="bg-gradient-to-r from-[#00E5FF] via-[#A855F7] to-[#D946EF] bg-clip-text text-transparent">X</span>
              </div>
              <div className="text-[8.5px] font-mono text-slate-400 tracking-[0.22em] uppercase mt-0.5">
                AI Emergency Companion
              </div>
            </div>

            {/* Easter Egg Toast Notification */}
            <AnimatePresence>
              {showEasterEggToast && (
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.9 }}
                  className="absolute top-12 left-0 px-3 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500/30 to-purple-600/30 border border-cyan-400/50 backdrop-blur-xl text-xs font-semibold text-white shadow-[0_0_20px_rgba(0,229,255,0.4)] whitespace-nowrap z-50 flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5 text-cyan-300 animate-spin" />
                  <span>Built with ❤️ by CosmicNexus</span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Top Right Header Badges & Clean Team Signature */}
          <div className="flex items-center gap-2 font-sans">

            {/* Live Clock — real OS-like feel */}
            <div className="hidden sm:flex flex-col items-end mr-1">
              <span className="text-[12px] font-mono font-semibold text-white/90 leading-none tabular-nums">{clockTime}</span>
              <span className="text-[8.5px] font-mono text-slate-500 leading-none mt-0.5">{clockDate}</span>
            </div>

            <div className="w-px h-5 bg-white/10" />

            {/* CosmicNexus team badge — Easter Egg 3: Open About Modal */}
            <motion.button
              onClick={() => setActiveModal('cosmicnexus')}
              whileHover={{ y: -1, scale: 1.03 }}
              aria-label="About CosmicNexus"
              className="px-3 py-1 rounded-full bg-white/[0.04] border border-white/12 hover:bg-white/[0.07] hover:border-cyan-400/40 backdrop-blur-[12px] text-[#C8D4F0] text-[11px] font-medium tracking-[0.025em] transition-all duration-200 cursor-pointer font-sans shrink-0 group relative overflow-hidden"
            >
              <span className="relative z-10">CosmicNexus</span>
              <span className="absolute bottom-0 left-0 w-full h-[1px] bg-cyan-400 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
            </motion.button>

            <div className="w-px h-5 bg-white/10" />

            {/* DYNAMIC STATUS PILL (2. DYNAMIC STATUS & 9. EMERGENCY READINESS) */}
            <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono backdrop-blur-xl border transition-all duration-300 ${
              isEmergencyActive
                ? 'bg-red-500/15 border-red-400/40 text-red-300 shadow-[0_0_12px_rgba(239,68,68,0.3)]'
                : isUserSpeaking || isListening
                  ? 'bg-cyan-500/15 border-cyan-400/40 text-cyan-300 shadow-[0_0_12px_rgba(0,229,255,0.3)]'
                  : isAnalyzing
                    ? 'bg-purple-500/15 border-purple-400/40 text-purple-300 shadow-[0_0_12px_rgba(168,85,247,0.3)]'
                    : isAISpeaking || isSpeaking
                      ? 'bg-cyan-500/15 border-cyan-400/40 text-cyan-300 shadow-[0_0_12px_rgba(0,229,255,0.3)]'
                      : 'bg-emerald-500/10 border-emerald-500/25 text-emerald-300'
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${isEmergencyActive ? 'bg-red-400 animate-ping' : 'bg-emerald-400 animate-pulse'}`} />
              <span>
                {isEmergencyActive
                  ? '🚑 Emergency Active'
                  : isUserSpeaking || isListening
                    ? '🎤 Listening...'
                    : isAnalyzing
                      ? '🧠 Analyzing...'
                      : isAISpeaking || isSpeaking
                        ? '💬 Responding...'
                        : '● Ready to Assist'}
              </span>
            </div>

          </div>
        </header>

        {/* Main Stage Grid */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-center my-auto w-full">
          
          {/* Left Panel (~42% Width): Morphs Smoothly When Mic Pressed */}
          <div className="lg:col-span-5 flex flex-col justify-center space-y-2 lg:space-y-2.5 text-left max-w-xl z-20">
            
            {/* Status pill — clean and minimal */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="w-fit"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.04] border border-white/10 backdrop-blur-xl">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
                </span>
                <span className="text-[11px] font-sans font-medium text-slate-300 tracking-wide">Real-time AI Emergency Companion</span>
              </div>
            </motion.div>

            {/* SECTION 6: Hero Text Premium Typography (font-weight: 800, line-height: 0.92, letter-spacing: -0.04em, text-shadow) */}
            <div className="space-y-0.5">
              <h1 className="text-3xl sm:text-4xl lg:text-[42px] font-black text-white tracking-[-0.04em] font-sans leading-[0.94] drop-shadow-[0_8px_32px_rgba(0,0,0,0.45)]">
                
                <AnimatePresence mode="wait">
                  {!isSessionActive ? (
                    <motion.div 
                      key="landing-headline"
                      initial={{ opacity: 0, y: 16, filter: 'blur(8px)' }}
                      animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                    >
                      <motion.span variants={line1Variants} className="block">
                        {dynamicGreeting.main}
                      </motion.span>

                      <motion.span 
                        variants={line3Variants}
                        className="inline-block bg-gradient-to-r from-[#35E0FF] via-[#7C7DFF] to-[#E44DFF] bg-clip-text text-transparent animate-hero-gradient-shift filter drop-shadow-[0_0_25px_rgba(0,229,255,0.5)]"
                      >
                        {dynamicGreeting.sub}
                      </motion.span>
                    </motion.div>
                  ) : (
                    <motion.div 
                      key="active-headline"
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -15 }}
                      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                    >
                      <span className="block text-2xl font-mono text-cyan-400 tracking-widest uppercase font-bold">
                        {isUserSpeaking ? 'Listening...' : isAnalyzing ? 'Analyzing Symptoms...' : isAISpeaking ? 'EchoAid Responding...' : 'Session Active'}
                      </span>
                      <span className="block text-3xl font-extrabold text-white">
                        Describe the emergency.
                      </span>
                    </motion.div>
                  )}
                </AnimatePresence>

              </h1>

              {/* Sub-text Description */}
              <p className="text-xs sm:text-sm text-slate-200 font-sans max-w-md pt-0.5 leading-relaxed opacity-95 font-normal drop-shadow-[0_2px_8px_rgba(0,0,0,0.7)]">
                {isSessionActive 
                  ? 'Speak naturally to EchoAid X. Automatic ambulance & emergency response dispatch active.' 
                  : 'Your AI emergency companion designed to assist, guide, and protect when every second counts.'}
              </p>

              {/* Trust indicators — credibility row */}
              {!isSessionActive && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.9, duration: 0.5 }}
                  className="flex items-center gap-3 pt-1 flex-wrap"
                >
                  {[
                    { icon: '🎙️', label: 'Real-time voice support' },
                    { icon: '📍', label: 'Live location sharing' },
                    { icon: '🔒', label: 'Private by design' },
                  ].map((item, i) => (
                    <span key={i} className="flex items-center gap-1 text-[10px] text-slate-500 font-sans">
                      {i > 0 && <span className="w-px h-3 bg-white/10 mr-2" />}
                      <span>{item.icon}</span>
                      <span>{item.label}</span>
                    </span>
                  ))}
                </motion.div>
              )}
            </div>

            {/* Quick chips removed — conversation starts naturally */}

            {/* SECTION 7: Holographic AI Voice Core Orb */}
            <motion.div variants={orbVariants} className="relative flex flex-col justify-start items-center gap-2 w-full max-w-md my-0">
              <div className="w-full flex justify-center">
                <AIOrb />
              </div>
            </motion.div>

            {/* SECTION 8: Quick Action Cards Grid */}
            <motion.div variants={cardsVariants} className="grid grid-cols-2 gap-2.5 w-full pt-0.5">
              {quickActions.map((act) => (
                <motion.div
                  key={act.id}
                  whileHover={{ y: -2, scale: 1.01 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={act.action}
                  role="button"
                  aria-label={act.title}
                  tabIndex={0}
                  onKeyDown={(e) => e.key === 'Enter' && act.action()}
                  className={`relative overflow-hidden p-2.5 rounded-xl backdrop-blur-[18px] border transition-all duration-300 cursor-pointer ${act.color} flex items-center gap-2.5 group shadow-card-soft hover:border-l-2 hover:border-l-cyan-400 glass-shimmer`}
                >
                  <div className="p-1.5 rounded-lg bg-white/[0.06] border border-white/10 group-hover:border-cyan-400/50 shrink-0">
                    {act.icon}
                  </div>
                  <div className="text-left min-w-0">
                    <div className="text-xs font-bold text-white font-sans group-hover:text-cyan-300 transition-colors truncate">{act.title}</div>
                    <div className="text-[9px] text-slate-400 font-sans truncate mt-0.5">{act.subtitle}</div>
                  </div>
                </motion.div>
              ))}
            </motion.div>

          </div>

          {/* Right Column Spacer */}
          <div className="lg:col-span-7 flex items-center justify-end relative w-full h-full min-h-[480px] lg:min-h-[600px] pointer-events-none" />

        </div>

        {/* SECTION 12: Premium Footer */}
        <footer className="flex flex-wrap items-center justify-between gap-4 border-t border-white/10 pt-3 pb-1 shrink-0 z-20">

          {/* LEFT — Privacy badge */}
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.04] border border-white/10 backdrop-blur-xl">
            <Lock className="w-3 h-3 text-emerald-400 shrink-0" />
            <span className="text-[11px] font-sans font-medium text-slate-300">Your data is private &amp; secure</span>
          </div>

          {/* RIGHT — Founder + LinkedIn */}
          <div className="flex items-center gap-3">

            {/* Crafted by badge */}
            <button
              onClick={() => setActiveModal('cosmicnexus')}
              aria-label="About CosmicNexus"
              className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-cyan-500/10 via-purple-500/10 to-pink-500/10 border border-cyan-400/30 hover:border-cyan-400/60 hover:bg-cyan-500/10 backdrop-blur-xl text-cyan-300 transition-all duration-200 hover:scale-105 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <span className="text-[12px] font-sans font-semibold text-white whitespace-nowrap">
                Crafted by <span className="text-cyan-300">Kumar Aryan</span> · Founder of <span className="text-purple-300">CosmicNexus</span>
              </span>
            </button>

            {/* LinkedIn icon button */}
            <a
              href="https://www.linkedin.com/in/aryan-aryan-1b8704351/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Kumar Aryan on LinkedIn"
              className="flex items-center justify-center w-8 h-8 rounded-full bg-white/[0.06] border border-white/15 hover:bg-[#0077B5]/20 hover:border-[#0077B5]/60 text-slate-300 hover:text-[#0077B5] transition-all duration-200 hover:scale-110 cursor-pointer"
            >
              <LinkedinIcon className="w-4 h-4" />
            </a>

          </div>
        </footer>

      </motion.div>

    </div>
  );
};
