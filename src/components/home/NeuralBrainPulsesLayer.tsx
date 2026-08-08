import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useEmergency } from '../../context/EmergencyContext';

const NeuralBrainPulsesLayerComponent: React.FC = () => {
  const { isListening, isSpeaking, isAnalyzing, isUserSpeaking, isAISpeaking } = useEmergency();
  const [bootComplete, setBootComplete] = useState(false);

  // Requirement 17: 2-Second AI Boot Sequence Trigger
  useEffect(() => {
    const timer = setTimeout(() => setBootComplete(true), 2000);
    return () => clearTimeout(timer);
  }, []);

  // Requirement 8: AI Thinking Mode Activity Scaling
  // Idle: 20% base | Listening: +20% (60%) | Thinking: +50% (85%) | Speaking: 100% MAX
  const isSpeakingState = isAISpeaking || isSpeaking;
  const isThinkingState = isAnalyzing;
  const isListeningState = isUserSpeaking || isListening;
  
  const speedMult = isSpeakingState ? 0.35 : isThinkingState ? 0.5 : isListeningState ? 0.75 : 1.25;
  const pulseOpacity = isSpeakingState ? 1.0 : isThinkingState ? 0.85 : isListeningState ? 0.6 : 0.25;
  const strokeWidthVal = isSpeakingState ? 4.2 : isThinkingState ? 3.4 : isListeningState ? 2.6 : 1.8;

  // Requirement 1: 14 Anatomical Bezier Neural Energy Pathways
  const neuralPaths = [
    // Frontal Lobe Paths
    { id: 'p1', path: 'M 40 140 Q 70 80, 130 60 T 200 80', color: '#00E5FF', baseDuration: 3.2, delay: 0 },
    { id: 'p2', path: 'M 60 120 C 90 70, 140 50, 190 70', color: '#D946EF', baseDuration: 2.8, delay: 0.2 },
    { id: 'p3', path: 'M 50 100 Q 80 50, 150 45 T 210 65', color: '#A855F7', baseDuration: 3.5, delay: 0.4 },
    
    // Parietal & Motor Cortex Paths
    { id: 'p4', path: 'M 130 60 Q 180 40, 220 90 T 240 150', color: '#A855F7', baseDuration: 3.6, delay: 0.5 },
    { id: 'p5', path: 'M 110 90 C 150 70, 200 80, 230 130', color: '#FF007F', baseDuration: 2.5, delay: 0.1 },
    { id: 'p6', path: 'M 140 45 Q 200 35, 250 85 T 255 140', color: '#00E5FF', baseDuration: 3.1, delay: 0.3 },

    // Temporal Lobe Paths
    { id: 'p7', path: 'M 50 160 Q 90 170, 140 160 T 210 170', color: '#00E5FF', baseDuration: 3.0, delay: 0.6 },
    { id: 'p8', path: 'M 70 180 C 120 190, 170 180, 220 165', color: '#38BDF8', baseDuration: 2.7, delay: 0.3 },
    { id: 'p9', path: 'M 80 150 Q 120 135, 170 145 T 225 155', color: '#FFFFFF', baseDuration: 2.2, delay: 0.15 },

    // Occipital & Limbic Circuit
    { id: 'p10', path: 'M 160 100 Q 210 110, 250 160 T 220 220', color: '#D946EF', baseDuration: 3.4, delay: 0.4 },
    { id: 'p11', path: 'M 130 130 C 170 140, 210 170, 235 200', color: '#A855F7', baseDuration: 3.1, delay: 0.05 },

    // Cerebellar & Brainstem Signal Arcs
    { id: 'p12', path: 'M 140 170 Q 180 200, 200 240', color: '#00E5FF', baseDuration: 2.4, delay: 0.7 },
    { id: 'p13', path: 'M 100 150 C 130 180, 160 210, 185 245', color: '#FF007F', baseDuration: 2.9, delay: 0.45 },
    { id: 'p14', path: 'M 160 190 Q 190 220, 210 255', color: '#38BDF8', baseDuration: 2.6, delay: 0.25 }
  ];

  // Requirement 2 & 11: Synapses & Neural Constellation Nodes
  const nodes = [
    { id: 'n1', cx: 130, cy: 60, color: '#00E5FF', delay: 0 },
    { id: 'n2', cx: 190, cy: 70, color: '#D946EF', delay: 0.2 },
    { id: 'n3', cx: 220, cy: 90, color: '#A855F7', delay: 0.4 },
    { id: 'n4', cx: 140, cy: 160, color: '#00E5FF', delay: 0.6 },
    { id: 'n5', cx: 210, cy: 170, color: '#FF007F', delay: 0.1 },
    { id: 'n6', cx: 180, cy: 200, color: '#38BDF8', delay: 0.5 },
    { id: 'n7', cx: 80, cy: 120, color: '#00E5FF', delay: 0.35 },
    { id: 'n8', cx: 240, cy: 130, color: '#D946EF', delay: 0.15 },
    { id: 'n9', cx: 150, cy: 45, color: '#A855F7', delay: 0.45 },
    { id: 'n10', cx: 170, cy: 145, color: '#FFFFFF', delay: 0.25 },
    { id: 'n11', cx: 110, cy: 90, color: '#38BDF8', delay: 0.65 },
    { id: 'n12', cx: 200, cy: 240, color: '#00E5FF', delay: 0.75 }
  ];

  // Requirement 11: Dynamic Constellation Links
  const constellationLinks = [
    { from: 0, to: 1 }, { from: 1, to: 2 }, { from: 1, to: 9 },
    { from: 3, to: 4 }, { from: 4, to: 5 }, { from: 6, to: 10 },
    { from: 7, to: 2 }, { from: 8, to: 0 }, { from: 9, to: 3 },
    { from: 5, to: 11 }
  ];

  // Requirement 12: Electric Arc Sparks Jumping Between Nearby Neurons
  const electricArcs = [
    { d: 'M 130 60 Q 160 50, 190 70', color: '#00E5FF', delay: 1.2 },
    { d: 'M 190 70 Q 210 75, 220 90', color: '#FFFFFF', delay: 2.7 },
    { d: 'M 140 160 Q 160 150, 170 145', color: '#D946EF', delay: 0.8 },
    { d: 'M 170 145 Q 195 160, 210 170', color: '#38BDF8', delay: 3.4 },
    { d: 'M 110 90 Q 120 75, 130 60', color: '#00E5FF', delay: 2.1 }
  ];

  // Requirement 6: Live Data Stream Particles Entering Brain
  const dataParticles = [
    { startX: 10, startY: 100, endX: 150, endY: 140, delay: 0, duration: 2.2 },
    { startX: 20, startY: 180, endX: 140, endY: 160, delay: 0.7, duration: 2.5 },
    { startX: 290, startY: 70, endX: 190, endY: 70, delay: 1.3, duration: 2.0 },
    { startX: 280, startY: 210, endX: 180, endY: 200, delay: 0.4, duration: 2.8 },
    { startX: 150, startY: 10, endX: 150, endY: 140, delay: 1.8, duration: 2.4 }
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: bootComplete ? 1 : [0, 0.4, 1], scale: 1 }}
      transition={{ duration: 2.0, ease: 'easeOut' }}
      className="absolute top-[18%] right-[22%] w-[48%] h-[48%] pointer-events-none z-10 overflow-visible"
    >
      {/* Requirement 5: AI ENERGY CORE (Limbic Plasma Blob + Concentric Shockwaves) */}
      <div className="absolute top-[35%] left-[38%] -translate-x-1/2 -translate-y-1/2 w-48 h-48 pointer-events-none">
        {/* Soft Rotating Plasma Glow */}
        <motion.div 
          animate={{
            rotate: [0, 360],
            scale: isSpeakingState ? [1, 1.25, 1] : isThinkingState ? [1, 1.15, 1] : [1, 1.05, 1],
            opacity: isSpeakingState ? [0.35, 0.65, 0.35] : [0.15, 0.35, 0.15]
          }}
          transition={{
            rotate: { duration: 18, repeat: Infinity, ease: 'linear' },
            scale: { duration: isSpeakingState ? 1.2 : 4, repeat: Infinity, ease: 'easeInOut' },
            opacity: { duration: isSpeakingState ? 1.2 : 4, repeat: Infinity, ease: 'easeInOut' }
          }}
          className="w-full h-full rounded-full bg-gradient-to-r from-cyan-500/30 via-purple-600/30 to-pink-500/30 blur-2xl"
          style={{ willChange: 'transform, opacity' }}
        />

        {/* Emitted Concentric Energy Shockwaves through Neural Grid */}
        <motion.div 
          animate={{
            scale: [0.3, 2.2],
            opacity: [0.65, 0]
          }}
          transition={{
            duration: isSpeakingState ? 1.5 : isThinkingState ? 2.2 : 4.0,
            repeat: Infinity,
            ease: 'easeOut'
          }}
          className="absolute inset-0 rounded-full border border-cyan-400/50 shadow-[0_0_20px_rgba(0,229,255,0.4)] pointer-events-none"
          style={{ willChange: 'transform, opacity' }}
        />
      </div>

      {/* Requirement 7: 12s VERTICAL MEDICAL SCANNER BEAM */}
      <motion.div
        animate={{
          top: ['-10%', '110%'],
          opacity: [0, 0.8, 0.8, 0]
        }}
        transition={{
          duration: 3.2,
          repeat: Infinity,
          repeatDelay: 8.8, // 3.2s + 8.8s = exactly 12-second cycle
          ease: 'easeInOut'
        }}
        className="absolute left-[-15%] right-[-15%] h-[3px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_15px_#00E5FF,0_0_30px_#00E5FF] pointer-events-none z-30"
        style={{ willChange: 'transform, opacity' }}
      >
        {/* Soft Downward Scanner Fan Light */}
        <div className="w-full h-12 bg-gradient-to-b from-cyan-400/20 to-transparent blur-sm" />
      </motion.div>

      {/* Requirement 14: REACTIVE CYAN EYE REFLECTION */}
      <motion.div 
        animate={{
          scale: isSpeakingState ? [1, 1.4, 1] : [1, 1.1, 1],
          opacity: isSpeakingState ? [0.7, 1, 0.7] : [0.4, 0.65, 0.4]
        }}
        transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-[28%] left-[28%] w-5 h-5 rounded-full bg-cyan-400/40 blur-md pointer-events-none z-20 shadow-[0_0_12px_#00E5FF]"
      />

      <svg 
        viewBox="0 0 300 300" 
        className="w-full h-full overflow-visible"
        style={{ transform: 'translateZ(0)' }}
      >
        <defs>
          {/* Requirement 16: Cinematic Bloom Filters */}
          <filter id="bloom-cyan" x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="3.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          <filter id="bloom-magenta" x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="4.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          <filter id="bloom-white" x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="2.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Requirement 11: NEURAL CONSTELLATION LINK LINES */}
        {constellationLinks.map((link, idx) => {
          const n1 = nodes[link.from];
          const n2 = nodes[link.to];
          return (
            <motion.line
              key={`constellation-${idx}`}
              x1={n1.cx}
              y1={n1.cy}
              x2={n2.cx}
              y2={n2.cy}
              stroke="#00E5FF"
              strokeWidth="0.8"
              animate={{
                strokeOpacity: isSpeakingState ? [0.15, 0.45, 0.15] : [0.05, 0.22, 0.05]
              }}
              transition={{
                duration: 2.5 + idx * 0.4,
                repeat: Infinity,
                ease: 'easeInOut'
              }}
            />
          );
        })}

        {/* Static Base Faint Neural Folds */}
        {neuralPaths.map((np) => (
          <path
            key={`base-${np.id}`}
            d={np.path}
            fill="none"
            stroke={np.color}
            strokeWidth="1.0"
            strokeOpacity={pulseOpacity * 0.18}
            strokeDasharray="3 4"
          />
        ))}

        {/* Requirement 1: NEURAL ENERGY FLOW (Impulses along Bezier curves) */}
        {neuralPaths.map((np) => (
          <g key={`pulse-${np.id}`}>
            {/* Soft Glow Trail */}
            <motion.path
              d={np.path}
              fill="none"
              stroke={np.color}
              strokeWidth={strokeWidthVal}
              strokeLinecap="round"
              strokeDasharray={isSpeakingState ? "45 150" : isThinkingState ? "35 160" : "25 180"}
              strokeOpacity={pulseOpacity}
              filter={np.color === '#00E5FF' ? 'url(#bloom-cyan)' : 'url(#bloom-magenta)'}
              animate={{
                strokeDashoffset: [210, -210]
              }}
              transition={{
                duration: np.baseDuration * speedMult,
                repeat: Infinity,
                delay: np.delay * speedMult,
                ease: 'easeInOut'
              }}
            />

            {/* Sharp White Electric Pulse Core */}
            <motion.path
              d={np.path}
              fill="none"
              stroke="#FFFFFF"
              strokeWidth={isSpeakingState ? "2.2" : "1.4"}
              strokeLinecap="round"
              strokeDasharray={isSpeakingState ? "14 180" : "6 200"}
              strokeOpacity={pulseOpacity}
              filter="url(#bloom-white)"
              animate={{
                strokeDashoffset: [210, -210]
              }}
              transition={{
                duration: np.baseDuration * speedMult,
                repeat: Infinity,
                delay: np.delay * speedMult,
                ease: 'easeInOut'
              }}
            />
          </g>
        ))}

        {/* Requirement 12: ELECTRIC ARCS JUMPING BETWEEN NEURONS (150ms sparks) */}
        {electricArcs.map((arc, idx) => (
          <motion.path
            key={`electric-arc-${idx}`}
            d={arc.d}
            fill="none"
            stroke={arc.color}
            strokeWidth="1.8"
            strokeLinecap="round"
            filter="url(#bloom-cyan)"
            animate={{
              opacity: [0, 1, 0, 0.8, 0],
              strokeDasharray: ["0 100", "40 0", "0 100"]
            }}
            transition={{
              duration: 0.35,
              repeat: Infinity,
              repeatDelay: arc.delay + 3.0,
              ease: 'linear'
            }}
          />
        ))}

        {/* Requirement 6: STREAMING DATA PARTICLES ENTERING BRAIN */}
        {dataParticles.map((dp, idx) => (
          <motion.circle
            key={`data-particle-${idx}`}
            initial={{ cx: dp.startX, cy: dp.startY }}
            animate={{
              cx: [dp.startX, dp.endX],
              cy: [dp.startY, dp.endY],
              opacity: [0, 0.9, 0],
              scale: [0.6, 1.4, 0.2]
            }}
            transition={{
              duration: dp.duration,
              repeat: Infinity,
              delay: dp.delay,
              ease: 'easeOut'
            }}
            r={1.8}
            fill="#00E5FF"
            filter="url(#bloom-cyan)"
          />
        ))}

        {/* Requirement 2: SYNAPSE FLASHES AT JUNCTION NODES */}
        {nodes.map((node) => (
          <g key={`synapse-${node.id}`}>
            {/* Outer Flashing Burst Circle */}
            <motion.circle
              cx={node.cx}
              cy={node.cy}
              r={isSpeakingState ? 11 : isThinkingState ? 8 : 5}
              fill={node.color}
              filter={node.color === '#00E5FF' ? 'url(#bloom-cyan)' : 'url(#bloom-magenta)'}
              animate={{
                scale: isSpeakingState ? [0.4, 2.6, 0.4] : isThinkingState ? [0.5, 1.8, 0.5] : [0.7, 1.3, 0.7],
                opacity: [0.1, pulseOpacity, 0.1]
              }}
              transition={{
                duration: isSpeakingState ? 0.8 : isThinkingState ? 1.4 : 3.2,
                repeat: Infinity,
                delay: node.delay,
                ease: 'easeInOut'
              }}
            />
            {/* Intense White Diamond Core Spark */}
            <circle
              cx={node.cx}
              cy={node.cy}
              r={2.2}
              fill="#FFFFFF"
              filter="url(#bloom-white)"
            />
          </g>
        ))}
      </svg>
    </motion.div>
  );
};

export const NeuralBrainPulsesLayer = React.memo(NeuralBrainPulsesLayerComponent);

