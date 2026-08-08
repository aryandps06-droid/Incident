import React, { useCallback, useRef, useState } from 'react';
import { motion, AnimatePresence, useSpring } from 'framer-motion';
import { Mic, Sparkles, Brain, Volume2 } from 'lucide-react';
import { useMouseParallax } from '../../hooks/useMouseParallax';
import { easePremium, introTimeline } from '../../lib/motionPresets';

export type AICoreState = 'idle' | 'listening' | 'thinking' | 'speaking';

interface AICoreProps {
  state?: AICoreState;
  size?: 'md' | 'lg';
  onClick?: () => void;
  showLabel?: boolean;
  label?: string;
  emergency?: boolean;
  introDelay?: number;
}

interface Ripple {
  id: number;
  x: number;
  y: number;
}

const STATE_LABELS: Record<AICoreState, string> = {
  idle: 'Tap or click to start',
  listening: 'LISTENING...',
  thinking: 'ANALYZING...',
  speaking: 'ECHO SPEAKING',
};

const STATE_ICONS: Record<AICoreState, React.ReactNode> = {
  idle: <Mic className="w-8 h-8" />,
  listening: <Mic className="w-8 h-8" />,
  thinking: <Brain className="w-7 h-7" />,
  speaking: <Volume2 className="w-7 h-7" />,
};

export const AICore: React.FC<AICoreProps> = ({
  state = 'idle',
  size = 'lg',
  onClick,
  showLabel = true,
  label,
  emergency = false,
  introDelay = introTimeline.orbAppear,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [ripples, setRipples] = useState<Ripple[]>([]);
  const [isHovered, setIsHovered] = useState(false);
  const { normalizedX, normalizedY } = useMouseParallax();

  const tiltX = useSpring(normalizedY * (isHovered ? -10 : -6), { stiffness: 150, damping: 22 });
  const tiltY = useSpring(normalizedX * (isHovered ? 10 : 6), { stiffness: 150, damping: 22 });

  const coreSize = size === 'lg' ? 'w-52 h-52 sm:w-60 sm:h-60' : 'w-48 h-48 sm:w-56 sm:h-56';
  const haloSize = size === 'lg' ? 'w-80 h-80 sm:w-96 sm:h-96' : 'w-72 h-72';

  const isActive = state !== 'idle';
  const displayLabel = label ?? STATE_LABELS[state];
  const showEnergyWaves = isHovered || state === 'listening' || state === 'speaking';
  const particleSpeed = isHovered ? 0.55 : 1;

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const rect = containerRef.current?.getBoundingClientRect();
      if (rect) {
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const id = Date.now();
        setRipples((prev) => [...prev, { id, x, y }]);
        setTimeout(() => setRipples((prev) => prev.filter((r) => r.id !== id)), 800);
      }
      onClick?.();
    },
    [onClick]
  );

  const breatheScale = state === 'speaking' ? [1, 1.06, 1] : state === 'listening' ? [1, 1.04, 1] : [1, 1.02, 1];
  const breatheDuration = state === 'speaking' ? 1.2 : state === 'thinking' ? 2 : 4;

  const haloColors = emergency || state === 'speaking'
    ? 'from-brand-emergency/50 via-red-500/30 to-purple-500/40'
    : 'from-brand-accent/50 via-blue-600/35 to-purple-600/40';

  return (
    <div
      ref={containerRef}
      className="relative flex items-center justify-center cursor-pointer group select-none"
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onClick?.()}
      aria-label={displayLabel}
    >
      {/* Ambient light — grows in on load, intensifies on hover */}
      <motion.div
        initial={{ opacity: 0, scale: 0.4 }}
        animate={{
          opacity: isHovered ? 0.75 : isActive ? [0.35, 0.55, 0.35] : [0.15, 0.35, 0.15],
          scale: isHovered ? 1.15 : isActive ? [1, 1.12, 1] : [1, 1.08, 1],
        }}
        transition={{
          opacity: isHovered
            ? { duration: 0.6, ease: easePremium }
            : { duration: breatheDuration, repeat: Infinity, ease: 'easeInOut', delay: introDelay },
          scale: isHovered
            ? { duration: 0.6, ease: easePremium }
            : { duration: breatheDuration, repeat: Infinity, ease: 'easeInOut', delay: introDelay },
        }}
        className={`absolute ${haloSize} rounded-full blur-3xl pointer-events-none bg-gradient-to-r ${haloColors} transition-shadow duration-700 ${
          isHovered ? 'shadow-[0_0_120px_40px_rgba(79,140,255,0.45)]' : 'shadow-orb-blue'
        }`}
      />

      {/* Rotating rings */}
      {[0, 1, 2].map((ring) => (
        <motion.div
          key={ring}
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{
            opacity: isHovered
              ? 0.25 + ring * 0.1
              : [0.12 + ring * 0.06, 0.28 + ring * 0.06, 0.12 + ring * 0.06],
            rotate: ring % 2 === 0 ? 360 : -360,
          }}
          transition={{
            opacity: isHovered
              ? { duration: 0.5 }
              : { duration: 3 + ring, repeat: Infinity, ease: 'easeInOut', delay: introDelay + ring * 0.15 },
            rotate: {
              duration: (20 + ring * 8) * particleSpeed,
              repeat: Infinity,
              ease: 'linear',
              delay: introDelay,
            },
          }}
          style={{ rotateX: tiltX, rotateY: tiltY }}
          className={`absolute rounded-full border pointer-events-none transition-colors duration-500 ${
            ring === 0
              ? 'w-[280px] h-[280px] sm:w-[320px] sm:h-[320px] border-brand-accent/25 group-hover:border-brand-accent/45'
              : ring === 1
              ? 'w-[310px] h-[310px] sm:w-[350px] sm:h-[350px] border-purple-500/20 border-dashed group-hover:border-purple-400/35'
              : 'w-[340px] h-[340px] sm:w-[380px] sm:h-[380px] border-blue-400/15 group-hover:border-blue-400/30'
          }`}
        />
      ))}

      {/* Orbiting particles — faster on hover */}
      {Array.from({ length: 8 }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0 }}
          animate={{ rotate: 360, opacity: 1 }}
          transition={{
            rotate: {
              duration: (12 + i * 2) * particleSpeed,
              repeat: Infinity,
              ease: 'linear',
              delay: introTimeline.particles,
            },
            opacity: { duration: 1.2, delay: introTimeline.particles + i * 0.05, ease: easePremium },
          }}
          className="absolute pointer-events-none"
          style={{ width: 280 + i * 15, height: 280 + i * 15 }}
        >
          <motion.div
            animate={{ opacity: [0.25, 0.7, 0.25], scale: [0.8, 1.15, 0.8] }}
            transition={{
              duration: (2 + i * 0.3) * particleSpeed,
              repeat: Infinity,
              delay: i * 0.2,
            }}
            className={`absolute top-0 left-1/2 -translate-x-1/2 rounded-full bg-brand-accent ${
              isHovered
                ? 'w-2 h-2 shadow-[0_0_14px_rgba(79,140,255,1)]'
                : 'w-1.5 h-1.5 shadow-[0_0_10px_rgba(79,140,255,0.8)]'
            }`}
          />
        </motion.div>
      ))}

      {/* Energy waves — hover + active states */}
      <AnimatePresence>
        {showEnergyWaves &&
          [0, 1, 2].map((pulse) => (
            <motion.div
              key={`wave-${pulse}`}
              initial={{ opacity: 0.35, scale: 1 }}
              animate={{ opacity: 0, scale: isHovered ? 2 : 1.6 }}
              transition={{
                duration: isHovered ? 2 : state === 'speaking' ? 1.5 : 2.8,
                repeat: Infinity,
                delay: pulse * (isHovered ? 0.65 : 0.9),
                ease: 'easeOut',
              }}
              className={`absolute ${coreSize} rounded-full border pointer-events-none ${
                emergency ? 'border-brand-emergency/30' : 'border-brand-accent/25'
              }`}
            />
          ))}
      </AnimatePresence>

      {/* Glass core — slow cinematic appear */}
      <motion.div
        initial={{ opacity: 0, scale: 0.65, filter: 'blur(8px)' }}
        animate={{
          opacity: 1,
          scale: breatheScale,
          filter: 'blur(0px)',
          y: [0, -8, 0],
        }}
        transition={{
          opacity: { duration: 1.8, delay: introDelay, ease: easePremium },
          scale: {
            duration: breatheDuration,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: introDelay + 1.2,
          },
          filter: { duration: 1.8, delay: introDelay, ease: easePremium },
          y: { duration: 6, repeat: Infinity, ease: 'easeInOut', delay: introDelay + 1 },
        }}
        style={{ rotateX: tiltX, rotateY: tiltY, transformStyle: 'preserve-3d' }}
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.98 }}
        className={`relative ${coreSize} rounded-full flex flex-col items-center justify-center ai-core-glass transition-shadow duration-700 ${
          emergency || state === 'speaking'
            ? 'border-brand-emergency/50 shadow-glow-red'
            : isHovered
            ? 'border-brand-accent/55 shadow-[0_0_70px_rgba(79,140,255,0.55)]'
            : 'border-brand-accent/40 shadow-glow-brand'
        }`}
      >
        <div className="absolute inset-3 rounded-full bg-gradient-to-br from-brand-accent/25 via-purple-600/15 to-blue-900/30 overflow-hidden">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 25 * particleSpeed, repeat: Infinity, ease: 'linear' }}
            className="absolute inset-0 bg-[conic-gradient(from_0deg,transparent,rgba(79,140,255,0.3),transparent,rgba(139,92,246,0.25),transparent)]"
          />
          {state === 'thinking' && (
            <motion.div
              animate={{ y: ['-100%', '200%'] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
              className="absolute inset-x-0 h-8 bg-gradient-to-b from-transparent via-brand-accent/30 to-transparent"
            />
          )}
        </div>

        <div className="relative z-10 flex flex-col items-center justify-center space-y-3">
          <motion.div
            animate={
              state === 'listening'
                ? { scale: [1, 1.12, 1] }
                : state === 'speaking'
                ? { scale: [1, 1.08, 0.97, 1.08, 1] }
                : { scale: isHovered ? 1.06 : 1 }
            }
            transition={{
              duration: state === 'speaking' ? 0.6 : 1.2,
              repeat: isActive ? Infinity : 0,
              ease: 'easeInOut',
            }}
            className={`p-4 rounded-full border transition-all duration-500 ${
              isActive
                ? 'bg-brand-accent/30 text-white border-white/30 shadow-glow-brand'
                : 'bg-brand-accent/15 text-brand-accent border-brand-accent/40 group-hover:bg-brand-accent/25 group-hover:text-white group-hover:border-brand-accent/60'
            }`}
          >
            {STATE_ICONS[state]}
          </motion.div>

          {showLabel && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: introDelay + 1.4, duration: 0.8, ease: easePremium }}
              className="flex items-center gap-1.5 text-xs font-mono text-slate-300 tracking-wider"
            >
              <Sparkles
                className={`w-3.5 h-3.5 ${
                  isActive || isHovered ? 'text-brand-accent animate-spin' : 'text-brand-accent/70'
                }`}
                style={{ animationDuration: isHovered ? '2s' : '3s' }}
              />
              <span>{displayLabel}</span>
            </motion.div>
          )}
        </div>

        <AnimatePresence>
          {ripples.map((ripple) => (
            <motion.span
              key={ripple.id}
              initial={{ scale: 0, opacity: 0.5 }}
              animate={{ scale: 4, opacity: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="absolute rounded-full border border-white/40 pointer-events-none"
              style={{
                left: ripple.x,
                top: ripple.y,
                width: 40,
                height: 40,
                marginLeft: -20,
                marginTop: -20,
              }}
            />
          ))}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};
