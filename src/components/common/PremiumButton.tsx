import React, { useRef, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';
import { springMagnetic, easePremium } from '../../lib/motionPresets';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'emergency';

interface PremiumButtonProps {
  variant?: ButtonVariant;
  magnetic?: boolean;
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  introDelay?: number;
  animateIn?: boolean;
}

interface Ripple {
  id: number;
  x: number;
  y: number;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary: 'bg-brand-accent text-white border border-brand-accent/40',
  secondary: 'glass-card text-slate-200 border border-brand-accent/20 hover:border-brand-accent/45',
  ghost: 'bg-transparent text-slate-300 border border-space-border hover:border-brand-accent/35',
  emergency: 'bg-gradient-to-r from-red-600 via-brand-emergency to-red-600 text-white border border-red-500/40',
};

const variantGlow: Record<ButtonVariant, string> = {
  primary: 'shadow-glow-brand group-hover:shadow-[0_0_36px_rgba(79,140,255,0.45)]',
  secondary: 'shadow-card-soft group-hover:shadow-[0_0_28px_rgba(79,140,255,0.2)]',
  ghost: 'group-hover:shadow-[0_0_20px_rgba(79,140,255,0.12)]',
  emergency: 'shadow-glow-red group-hover:shadow-[0_0_36px_rgba(255,77,79,0.45)]',
};

export const PremiumButton: React.FC<PremiumButtonProps> = ({
  variant = 'primary',
  magnetic = true,
  children,
  className,
  onClick,
  disabled,
  type = 'button',
  introDelay = 0,
  animateIn = false,
}) => {
  const ref = useRef<HTMLButtonElement>(null);
  const [ripples, setRipples] = useState<Ripple[]>([]);
  const [magneticOffset, setMagneticOffset] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      if (!magnetic || disabled || !ref.current) return;
      const rect = ref.current.getBoundingClientRect();
      setMagneticOffset({
        x: (e.clientX - (rect.left + rect.width / 2)) * 0.12,
        y: (e.clientY - (rect.top + rect.height / 2)) * 0.12,
      });
    },
    [magnetic, disabled]
  );

  const handleMouseLeave = useCallback(() => {
    setMagneticOffset({ x: 0, y: 0 });
    setIsHovered(false);
  }, []);

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      if (disabled) return;
      const rect = ref.current?.getBoundingClientRect();
      if (rect) {
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const id = Date.now();
        setRipples((prev) => [...prev, { id, x, y }]);
        setTimeout(() => setRipples((prev) => prev.filter((r) => r.id !== id)), 650);
      }
      onClick?.(e);
    },
    [disabled, onClick]
  );

  return (
    <motion.button
      ref={ref}
      type={type}
      disabled={disabled}
      onClick={handleClick}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      initial={animateIn ? { opacity: 0, y: 12 } : false}
      animate={{
        opacity: 1,
        y: 0,
        x: magneticOffset.x,
      }}
      transition={{
        opacity: { duration: 0.7, delay: introDelay, ease: easePremium },
        y: { duration: 0.7, delay: introDelay, ease: easePremium },
        x: springMagnetic,
      }}
      whileHover={{ scale: disabled ? 1 : 1.025 }}
      whileTap={{ scale: disabled ? 1 : 0.975 }}
      className={clsx(
        'group relative overflow-hidden rounded-2xl font-sans font-bold text-sm transition-all duration-500',
        variantStyles[variant],
        variantGlow[variant],
        isHovered && 'border-brand-accent/50',
        disabled && 'opacity-50 cursor-not-allowed',
        className
      )}
    >
      {/* Hover glow wash */}
      <motion.div
        animate={{ opacity: isHovered ? 1 : 0 }}
        transition={{ duration: 0.4 }}
        className="absolute inset-0 bg-gradient-to-r from-brand-accent/10 via-purple-500/10 to-brand-accent/10 pointer-events-none"
      />

      {ripples.map((ripple) => (
        <motion.span
          key={ripple.id}
          initial={{ scale: 0, opacity: 0.45 }}
          animate={{ scale: 4.5, opacity: 0 }}
          transition={{ duration: 0.65, ease: 'easeOut' }}
          className="absolute rounded-full bg-white/25 pointer-events-none"
          style={{
            left: ripple.x,
            top: ripple.y,
            width: 20,
            height: 20,
            marginLeft: -10,
            marginTop: -10,
          }}
        />
      ))}
      <span className="relative z-10 flex items-center justify-center gap-2">{children}</span>
    </motion.button>
  );
};
