import React from 'react';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';
import { easePremium, introTimeline } from '../../lib/motionPresets';

interface PremiumCardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  index?: number;
  animateIn?: boolean;
}

export const PremiumCard: React.FC<PremiumCardProps> = ({
  children,
  className,
  onClick,
  index = 0,
  animateIn = false,
}) => {
  return (
    <motion.div
      onClick={onClick}
      initial={animateIn ? { opacity: 0, y: 24 } : false}
      animate={animateIn ? { opacity: 1, y: 0 } : undefined}
      transition={{
        duration: 0.7,
        delay: introTimeline.cards + index * introTimeline.cardStagger,
        ease: easePremium,
      }}
      whileHover={{
        y: -6,
        boxShadow: '0 28px 60px rgba(0,0,0,0.55), 0 0 36px rgba(79,140,255,0.12)',
      }}
      whileTap={{ scale: 0.98, y: -2 }}
      className={clsx(
        'relative rounded-3xl glass-card premium-card-interactive cursor-pointer border backdrop-blur-2xl overflow-hidden group',
        className
      )}
    >
      {/* Border glow on hover */}
      <div className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none premium-border-glow" />

      {/* Reflection sweep */}
      <div className="card-reflection-sweep pointer-events-none" aria-hidden="true" />

      {/* Static soft sheen */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/[0.04] via-transparent to-transparent pointer-events-none" />

      <div className="relative z-10">{children}</div>
    </motion.div>
  );
};
