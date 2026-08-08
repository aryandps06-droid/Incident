import React from 'react';
import { motion } from 'framer-motion';

const AuroraLayerComponent: React.FC = () => {
  return (
    <div className="pointer-events-none absolute inset-0 z-1 overflow-hidden mix-blend-screen select-none">
      
      {/* ─── 3 INDEPENDENT VOLUMETRIC AURORA BOREALIS LAYERS ─── */}
      
      {/* Layer 1: Electric Cyan (Opacity 0.18, 22s Loop) */}
      <motion.div 
        animate={{
          x: [0, 40, -30, 0],
          y: [0, -25, 20, 0],
          scale: [1, 1.08, 0.95, 1]
        }}
        transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute -top-[20%] -left-[10%] w-[75vw] h-[70vw] rounded-full blur-[200px]"
        style={{ 
          background: 'radial-gradient(ellipse at top left, rgba(0, 229, 255, 0.18) 0%, rgba(56, 189, 248, 0.12) 50%, transparent 100%)',
          willChange: 'transform'
        }}
      />

      {/* Layer 2: Royal Violet (Opacity 0.14, 28s Loop) */}
      <motion.div 
        animate={{
          x: [0, -45, 35, 0],
          y: [0, 30, -20, 0],
          scale: [1, 0.94, 1.1, 1]
        }}
        transition={{ duration: 28, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute -top-[10%] left-[10%] w-[65vw] h-[65vw] rounded-full blur-[240px]"
        style={{ 
          background: 'radial-gradient(circle, rgba(168, 85, 247, 0.14) 0%, rgba(124, 77, 255, 0.09) 60%, transparent 100%)',
          willChange: 'transform'
        }}
      />

      {/* Layer 3: Neon Magenta (Opacity 0.10, 34s Loop) */}
      <motion.div 
        animate={{
          x: [0, 35, -40, 0],
          y: [0, -20, 30, 0],
          scale: [1, 1.12, 0.96, 1]
        }}
        transition={{ duration: 34, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-[10%] -left-[5%] w-[60vw] h-[60vw] rounded-full blur-[220px]"
        style={{ 
          background: 'radial-gradient(circle, rgba(217, 70, 239, 0.10) 0%, rgba(244, 114, 182, 0.06) 65%, transparent 100%)',
          willChange: 'transform'
        }}
      />

      {/* Right Side Background Volumetric Ribbon (Behind Head) */}
      <motion.div 
        animate={{
          x: [0, -30, 25, 0],
          y: [0, 20, -25, 0],
          scale: [1, 1.05, 0.97, 1]
        }}
        transition={{ duration: 26, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute -top-[15%] -right-[10%] w-[65vw] h-[65vw] rounded-full blur-[200px]"
        style={{ 
          background: 'radial-gradient(ellipse at top right, rgba(0, 229, 255, 0.16) 0%, rgba(168, 85, 247, 0.12) 50%, transparent 100%)',
          willChange: 'transform'
        }}
      />

    </div>
  );
};


export const AuroraLayer = React.memo(AuroraLayerComponent);
