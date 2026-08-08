import React from 'react';
import { clsx } from 'clsx';

interface BadgeProps {
  variant?: 'cyan' | 'red' | 'emerald' | 'warning' | 'purple';
  children: React.ReactNode;
  pulse?: boolean;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  variant = 'cyan',
  children,
  pulse = false,
  className
}) => {
  const styles = {
    cyan: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30 shadow-[0_0_12px_rgba(0,240,255,0.2)]',
    red: 'bg-emergency-500/15 text-red-400 border-emergency-500/40 shadow-[0_0_14px_rgba(255,0,60,0.3)]',
    emerald: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/35 shadow-[0_0_12px_rgba(0,230,118,0.25)]',
    warning: 'bg-amber-500/15 text-amber-300 border-amber-500/35',
    purple: 'bg-purple-500/15 text-purple-300 border-purple-500/35 shadow-[0_0_12px_rgba(168,85,247,0.2)]',
  };

  const dots = {
    cyan: 'bg-cyan-400',
    red: 'bg-red-500',
    emerald: 'bg-emerald-400',
    warning: 'bg-amber-400',
    purple: 'bg-purple-400',
  };

  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono font-medium border backdrop-blur-md transition-all',
        styles[variant],
        className
      )}
    >
      {pulse && (
        <span className="relative flex h-2 w-2">
          <span className={clsx('animate-ping absolute inline-flex h-full w-full rounded-full opacity-75', dots[variant])}></span>
          <span className={clsx('relative inline-flex rounded-full h-2 w-2', dots[variant])}></span>
        </span>
      )}
      {children}
    </span>
  );
};
