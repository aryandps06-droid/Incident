import React, { useMemo } from 'react';
import { motion, useSpring } from 'framer-motion';
import { useMouseParallax } from '../../hooks/useMouseParallax';
import { easePremium, introTimeline } from '../../lib/motionPresets';

export const PremiumBackground: React.FC = () => {
  const { normalizedX, normalizedY } = useMouseParallax();

  const springConfig = { stiffness: 50, damping: 22, mass: 0.5 };
  const parallaxX = useSpring(normalizedX * 24, springConfig);
  const parallaxY = useSpring(normalizedY * 16, springConfig);
  const parallaxXDeep = useSpring(normalizedX * 12, springConfig);
  const parallaxYDeep = useSpring(normalizedY * 8, springConfig);

  const particles = useMemo(
    () =>
      Array.from({ length: 36 }, (_, i) => ({
        id: i,
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        size: Math.random() * 2.5 + 1,
        duration: Math.random() * 10 + 8,
        delay: introTimeline.particles + Math.random() * 1.5,
        opacity: Math.random() * 0.35 + 0.08,
      })),
    []
  );

  return (
    <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none" aria-hidden="true">
      {/* Base */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.6, ease: easePremium }}
        className="absolute inset-0 bg-space-bg"
      />

      {/* Orb-centered ambient spotlight — grows behind the AI core */}
      <motion.div
        initial={{ opacity: 0, scale: 0.35 }}
        animate={{ opacity: [0.2, 0.45, 0.35], scale: 1 }}
        transition={{
          opacity: { duration: 3, delay: introTimeline.ambientLight, ease: easePremium },
          scale: { duration: 2.8, delay: introTimeline.ambientLight, ease: easePremium },
        }}
        className="absolute top-[28%] left-1/2 -translate-x-1/2 w-[600px] h-[600px] sm:w-[700px] sm:h-[700px] rounded-full bg-[radial-gradient(circle,rgba(79,140,255,0.22)_0%,rgba(139,92,246,0.08)_40%,transparent_70%)] blur-3xl"
      />

      {/* Large radial gradients */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 2.2, delay: 0.3, ease: easePremium }}
        style={{ x: parallaxXDeep, y: parallaxYDeep }}
        className="absolute -top-[20%] left-1/2 -translate-x-1/2 w-[900px] h-[900px] rounded-full bg-[radial-gradient(circle,rgba(79,140,255,0.14)_0%,transparent_70%)] blur-3xl"
      />
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 2.4, delay: 0.5, ease: easePremium }}
        style={{ x: parallaxX, y: parallaxY }}
        className="absolute top-[30%] -right-[10%] w-[700px] h-[700px] rounded-full bg-[radial-gradient(circle,rgba(139,92,246,0.12)_0%,transparent_70%)] blur-3xl"
      />
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 2.6, delay: 0.4, ease: easePremium }}
        style={{ x: parallaxXDeep, y: parallaxYDeep }}
        className="absolute -bottom-[15%] -left-[10%] w-[800px] h-[800px] rounded-full bg-[radial-gradient(circle,rgba(59,130,246,0.1)_0%,transparent_70%)] blur-3xl"
      />

      {/* Aurora layers */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: [0.2, 0.45, 0.3, 0.4, 0.2], scale: [1, 1.04, 1.01, 1.05, 1] }}
        transition={{
          opacity: { duration: 14, repeat: Infinity, ease: 'easeInOut', delay: 1 },
          scale: { duration: 14, repeat: Infinity, ease: 'easeInOut', delay: 1 },
        }}
        style={{ x: parallaxX, y: parallaxY }}
        className="absolute top-[10%] left-[20%] w-[60%] h-[40%] rounded-full bg-gradient-to-r from-blue-600/15 via-purple-500/20 to-indigo-600/15 blur-[100px]"
      />

      <div className="absolute inset-0 mesh-gradient opacity-50" />

      {/* Floating particles — fade in after orb */}
      {particles.map((p) => (
        <motion.div
          key={p.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{
            opacity: [p.opacity, p.opacity * 1.4, p.opacity * 0.6, p.opacity],
            y: [0, -24, -12, -32, 0],
            x: [0, 8, -6, 4, 0],
          }}
          transition={{
            opacity: { duration: p.duration, repeat: Infinity, delay: p.delay, ease: 'easeInOut' },
            y: { duration: p.duration, repeat: Infinity, delay: p.delay, ease: 'easeInOut' },
            x: { duration: p.duration, repeat: Infinity, delay: p.delay, ease: 'easeInOut' },
          }}
          className="absolute rounded-full bg-blue-400/70 shadow-[0_0_6px_rgba(79,140,255,0.5)]"
          style={{ left: p.left, top: p.top, width: p.size, height: p.size }}
        />
      ))}

      {/* Subtle light streak */}
      <motion.div
        animate={{ rotate: [0, 360] }}
        transition={{ duration: 80, repeat: Infinity, ease: 'linear' }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150%] h-[150%] opacity-[0.025]"
        style={{
          background:
            'conic-gradient(from 0deg, transparent, rgba(79,140,255,0.35), transparent, rgba(139,92,246,0.25), transparent)',
        }}
      />

      <div className="absolute inset-0 noise-overlay opacity-[0.03]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(5,8,22,0.35)_70%,rgba(5,8,22,0.88)_100%)]" />
    </div>
  );
};
