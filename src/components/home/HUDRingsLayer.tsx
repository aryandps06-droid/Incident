import React from 'react';
import { motion } from 'framer-motion';

const HUDRingsLayerComponent: React.FC = () => {
  return (
    <div className="pointer-events-none absolute right-0 top-0 w-[55%] h-full z-5 flex items-center justify-end overflow-hidden select-none">
      <div className="relative w-[620px] h-[620px] flex items-center justify-center opacity-18">
        
        {/* Requirement 9: OUTER RING (Very Slow Clockwise Rotation 45s) */}
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 45, repeat: Infinity, ease: 'linear' }}
          className="absolute w-[580px] h-[580px] rounded-full border border-cyan-400/25 border-dashed blur-[0.5px]"
          style={{ willChange: 'transform' }}
        >
          <div className="w-1.5 h-1.5 rounded-full bg-cyan-300 absolute top-2 left-1/2 -translate-x-1/2 shadow-[0_0_8px_#00E5FF]" />
        </motion.div>

        {/* Requirement 9: MIDDLE RING (Counter-Clockwise Rotation 32s) */}
        <motion.div 
          animate={{ rotate: -360 }}
          transition={{ duration: 32, repeat: Infinity, ease: 'linear' }}
          className="absolute w-[490px] h-[490px] rounded-full border border-purple-400/20 border-t-cyan-400/40 p-2 blur-[0.5px]"
          style={{ willChange: 'transform' }}
        >
          <div className="w-2 h-2 rounded-full bg-cyan-300 absolute top-0 left-1/2 -translate-x-1/2 shadow-[0_0_8px_#00E5FF]" />
          <div className="w-2 h-2 rounded-full bg-purple-300 absolute bottom-0 left-1/2 -translate-x-1/2 shadow-[0_0_8px_#A855F7]" />
        </motion.div>

        {/* Requirement 9: INNER RING (Slightly Faster Rotation 20s + Subtle Pulse Scale 1 -> 1.012 -> 1) */}
        <motion.div 
          animate={{ 
            rotate: 360,
            scale: [1, 1.012, 1]
          }}
          transition={{ 
            rotate: { duration: 20, repeat: Infinity, ease: 'linear' },
            scale: { duration: 4.5, repeat: Infinity, ease: 'easeInOut' }
          }}
          className="absolute w-[410px] h-[410px] rounded-full border border-cyan-300/20 border-b-pink-400/30 blur-[0.5px]"
          style={{ willChange: 'transform' }}
        />

      </div>
    </div>
  );
};

export const HUDRingsLayer = React.memo(HUDRingsLayerComponent);
