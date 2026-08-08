import React, { useMemo } from 'react';
import { motion } from 'framer-motion';

const StarParticlesLayerComponent: React.FC = () => {
  // 18 Floating Ambient Light Particles
  const particles = useMemo(() => {
    const arr = [];
    for (let i = 0; i < 18; i++) {
      const size = 2 + Math.random() * 3; // 2px - 5px
      const isCyan = i % 2 === 0;
      const initialX = Math.random() * 100;
      const initialY = Math.random() * 100;
      const driftX = (Math.random() - 0.5) * 60;
      const driftY = (Math.random() - 0.5) * 60;
      const duration = 12 + Math.random() * 14; // 12s - 26s non-looping feel
      const delay = Math.random() * 4;
      const isNearBrain = initialX > 60 && initialY < 50;

      arr.push({
        id: i,
        size,
        color: isCyan ? '#00E5FF' : '#D946EF',
        initialX,
        initialY,
        driftX,
        driftY,
        duration,
        delay,
        opacity: isNearBrain ? 0.75 : 0.45,
        shadow: isNearBrain 
          ? '0 0 12px rgba(0, 229, 255, 0.9)' 
          : isCyan ? '0 0 8px rgba(0, 229, 255, 0.6)' : '0 0 8px rgba(217, 70, 239, 0.6)'
      });
    }
    return arr;
  }, []);

  return (
    <div className="pointer-events-none absolute inset-0 z-2 overflow-hidden select-none">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          initial={{ x: `${p.initialX}vw`, y: `${p.initialY}vh`, opacity: 0 }}
          animate={{
            x: [`${p.initialX}vw`, `${p.initialX + p.driftX / 5}vw`, `${p.initialX - p.driftX / 5}vw`],
            y: [`${p.initialY}vh`, `${p.initialY - 15}vh`, `${p.initialY}vh`],
            opacity: [p.opacity * 0.5, p.opacity, p.opacity * 0.5]
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            repeatType: 'reverse',
            delay: p.delay,
            ease: 'easeInOut'
          }}
          className="absolute rounded-full"
          style={{
            width: `${p.size}px`,
            height: `${p.size}px`,
            backgroundColor: p.color,
            boxShadow: p.shadow,
            willChange: 'transform, opacity'
          }}
        />
      ))}
    </div>
  );
};

export const StarParticlesLayer = React.memo(StarParticlesLayerComponent);
