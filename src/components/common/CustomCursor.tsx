import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

export const CustomCursor: React.FC = () => {
  const [position, setPosition] = useState({ x: -100, y: -100 });
  const [isHovered, setIsHovered] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Only run on desktop devices with fine pointing input
    if (typeof window === 'undefined' || window.matchMedia('(pointer: coarse)').matches) {
      return;
    }

    const onMouseMove = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });
      if (!isVisible) setIsVisible(true);

      const target = e.target as HTMLElement | null;
      if (target) {
        const isInteractive = target.closest('button, a, input, [role="button"], .glass-card, .cursor-pointer');
        setIsHovered(!!isInteractive);
      }
    };

    const onMouseLeave = () => setIsVisible(false);
    const onMouseEnter = () => setIsVisible(true);

    window.addEventListener('mousemove', onMouseMove, { passive: true });
    document.addEventListener('mouseleave', onMouseLeave);
    document.addEventListener('mouseenter', onMouseEnter);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseleave', onMouseLeave);
      document.removeEventListener('mouseenter', onMouseEnter);
    };
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
      {/* Outer Cyan Light Reaction Glow */}
      <motion.div
        className="absolute w-28 h-28 rounded-full bg-cyan-400/10 blur-xl pointer-events-none transform -translate-x-1/2 -translate-y-1/2"
        animate={{
          x: position.x,
          y: position.y,
          scale: isHovered ? 1.6 : 1,
          opacity: isHovered ? 0.35 : 0.15,
        }}
        transition={{ type: 'spring', damping: 28, stiffness: 350, mass: 0.5 }}
      />

      {/* Trailing Dot Cursor */}
      <motion.div
        className={`absolute rounded-full border pointer-events-none transform -translate-x-1/2 -translate-y-1/2 transition-colors duration-200 ${
          isHovered
            ? 'w-7 h-7 bg-cyan-400/15 border-cyan-400/60 shadow-[0_0_15px_rgba(0,229,255,0.4)]'
            : 'w-3 h-3 bg-cyan-300/80 border-cyan-400/40 shadow-[0_0_8px_rgba(0,229,255,0.5)]'
        }`}
        animate={{
          x: position.x,
          y: position.y,
        }}
        transition={{ type: 'spring', damping: 35, stiffness: 450, mass: 0.1 }}
      />
    </div>
  );
};
