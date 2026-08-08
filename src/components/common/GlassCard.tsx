import React from 'react';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';
import { easePremium } from '../../lib/motionPresets';

interface GlassCardProps {
  children: React.ReactNode;
  variant?: 'default' | 'hover' | 'emergency' | 'safe';
  className?: string;
  onClick?: () => void;
  index?: number;
  animate?: boolean;
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  variant = 'default',
  className,
  onClick,
  index = 0,
  animate = false,
}) => {
  const variantStyles = {
    default: 'glass-card',
    hover: 'glass-card premium-card-interactive cursor-pointer',
    emergency: 'glass-card-emergency',
    safe: 'glass-card border-brand-success/30 shadow-glow-emerald',
  };

  const isInteractive = variant === 'hover';

  const content = (
    <>
      <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none premium-border-glow" />
      <div className="card-reflection-sweep pointer-events-none" aria-hidden="true" />
      <div className="absolute inset-0 bg-gradient-to-br from-white/[0.04] via-transparent to-transparent pointer-events-none" />
      <div className="absolute top-0 right-0 w-8 h-8 border-t border-r border-brand-accent/20 rounded-tr-2xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-8 h-8 border-b border-l border-brand-accent/20 rounded-bl-2xl pointer-events-none" />
      <div className="relative z-10">{children}</div>
    </>
  );

  if (animate || isInteractive) {
    return (
      <motion.div
        onClick={onClick}
        initial={animate ? { opacity: 0, y: 20 } : false}
        animate={animate ? { opacity: 1, y: 0 } : undefined}
        transition={{
          duration: 0.7,
          delay: 0.5 + index * 0.1,
          ease: easePremium,
        }}
        whileHover={isInteractive ? { y: -6, scale: 1.005 } : undefined}
        whileTap={isInteractive ? { scale: 0.98, y: -2 } : undefined}
        className={clsx(
          'relative rounded-2xl overflow-hidden backdrop-blur-xl group premium-card-border',
          variantStyles[variant],
          isInteractive && 'premium-card-interactive',
          className
        )}
      >
        {content}
      </motion.div>
    );
  }

  return (
    <div
      onClick={onClick}
      className={clsx(
        'relative rounded-2xl overflow-hidden backdrop-blur-xl group premium-card-border',
        variantStyles[variant],
        className
      )}
    >
      {content}
    </div>
  );
};
