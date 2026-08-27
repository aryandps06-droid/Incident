import React, { useRef, useEffect, useState, useMemo } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { Activity, ShieldCheck, Cpu, Terminal, Zap } from 'lucide-react';
import { useEmergency } from '../../context/EmergencyContext';
import heroRobotImg from '../../assets/echoaid_ai_hero_figure.jpg';
import heroRobotWebp from '../../assets/hero_robot.webp';

// ─── Interfaces for Canvas Synaptic Engine ────────────────────────────────────
interface SynapseNode {
  x: number;
  y: number;
  origX: number;
  origY: number;
  vx: number;
  vy: number;
  radius: number;
  baseAlpha: number;
  color: string;
  connections: number[];
  lobe: number;
}

interface ElectricalImpulse {
  fromNode: number;
  toNode: number;
  progress: number;
  speed: number;
  color: string;
  size: number;
}

interface SparkParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  alpha: number;
  color: string;
  size: number;
}

interface LightningCrack {
  points: Array<{ x: number; y: number }>;
  alpha: number;
  color: string;
  width: number;
}

export const NeuralAIFigure: React.FC = () => {
  const { isListening, isSpeaking, isAnalyzing, isUserSpeaking, isAISpeaking, agoraStatus } = useEmergency();
  const isLive = isListening || isSpeaking || isAnalyzing || isUserSpeaking || isAISpeaking || agoraStatus === 'CONNECTED';

  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // ─── 1. Stable, Premium 3D Gaze Parallax ───────────────────────────────────
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const rawMousePos = useRef({ x: 0, y: 0, active: false });

  // Increased damping for rock-solid stability
  const springConfig = { damping: 36, stiffness: 90, mass: 0.9 };
  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [8, -8]), springConfig);
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-10, 10]), springConfig);
  const transX = useSpring(useTransform(mouseX, [-0.5, 0.5], [-12, 12]), springConfig);
  const transY = useSpring(useTransform(mouseY, [-0.5, 0.5], [-10, 10]), springConfig);

  const [isHovered, setIsHovered] = useState(false);
  const [flashIntensity, setFlashIntensity] = useState(0);

  // ─── 2. Hold-to-Charge "Quantum Singularity" State ────────────────────────────
  const [isCharging, setIsCharging] = useState(false);
  const [chargeProgress, setChargeProgress] = useState(0);
  const chargeStartTime = useRef<number | null>(null);
  const isChargingRef = useRef(false);
  const chargeProgressRef = useRef(0);

  const lightningCracksRef = useRef<LightningCrack[]>([]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const { innerWidth, innerHeight } = window;
      const xNorm = (e.clientX / innerWidth) - 0.5;
      const yNorm = (e.clientY / innerHeight) - 0.5;
      mouseX.set(xNorm);
      mouseY.set(yNorm);

      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const localX = e.clientX - rect.left;
        const localY = e.clientY - rect.top;
        rawMousePos.current = {
          x: localX,
          y: localY,
          active: true,
        };
      }
    };

    const handleMouseLeave = () => {
      rawMousePos.current.active = false;
      if (isChargingRef.current) {
        handleRelease();
      }
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('mouseleave', handleMouseLeave);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [mouseX, mouseY]);

  // ─── Hold-to-Charge Handlers ────────────────────────────────────────────────
  const handleHoldStart = () => {
    setIsCharging(true);
    isChargingRef.current = true;
    chargeStartTime.current = Date.now();
  };

  const handleRelease = () => {
    if (!isChargingRef.current) return;
    const progress = chargeProgressRef.current;
    setIsCharging(false);
    isChargingRef.current = false;
    setChargeProgress(0);
    chargeProgressRef.current = 0;
    chargeStartTime.current = null;

    // Trigger instant cranial white-cyan flash
    setFlashIntensity(1);
    setTimeout(() => setFlashIntensity(0), 400);

    const crackCount = progress > 0.6 ? 32 : 16;
    const crackWidth = progress > 0.6 ? 2.0 : 1.4;

    const startX = 760 * 0.56;
    const startY = 760 * 0.36;

    for (let f = 0; f < crackCount; f++) {
      const angle = (f / crackCount) * Math.PI * 2 + (Math.random() - 0.5) * 0.3;
      const forkPoints: Array<{ x: number; y: number }> = [{ x: startX, y: startY }];
      let cx = startX;
      let cy = startY;
      const steps = progress > 0.6 ? 9 + Math.floor(Math.random() * 5) : 6 + Math.floor(Math.random() * 4);
      const stepLen = progress > 0.6 ? 25 + Math.random() * 20 : 18 + Math.random() * 16;

      for (let s = 0; s < steps; s++) {
        const segAngle = angle + (Math.random() - 0.5) * 1.2;
        cx += Math.cos(segAngle) * stepLen;
        cy += Math.sin(segAngle) * stepLen;
        forkPoints.push({ x: cx, y: cy });
      }

      lightningCracksRef.current.push({
        points: forkPoints,
        alpha: 1,
        color: f % 3 === 0 ? '#00D9FF' : f % 3 === 1 ? '#A855F7' : '#EC4899',
        width: Math.random() * 1.0 + crackWidth,
      });
    }
  };

  // ─── 3. Supercharged 120 FPS Canvas Engine ──────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    const width = (canvas.width = 760);
    const height = (canvas.height = 760);

    const brainCenterX = width * 0.56;
    const brainCenterY = height * 0.36;
    const brainRadiusX = width * 0.235;
    const brainRadiusY = height * 0.205;

    const colors = ['#00D9FF', '#38BDF8', '#818CF8', '#A855F7', '#EC4899', '#FFFFFF'];

    // 96 High-Density Brain Cells
    const nodes: SynapseNode[] = Array.from({ length: 96 }, (_, idx) => {
      const angle = Math.random() * Math.PI * 2;
      const r = Math.sqrt(Math.random()) * 0.95;
      const x = brainCenterX + Math.cos(angle) * brainRadiusX * r;
      const y = brainCenterY + Math.sin(angle) * brainRadiusY * r;

      return {
        x,
        y,
        origX: x,
        origY: y,
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35,
        radius: Math.random() * 2.2 + 1.2,
        baseAlpha: Math.random() * 0.6 + 0.35,
        color: colors[Math.floor(Math.random() * colors.length)],
        connections: [],
        lobe: idx % 4,
      };
    });

    nodes.forEach((node, i) => {
      for (let j = i + 1; j < nodes.length; j++) {
        const other = nodes[j];
        const dist = Math.hypot(node.x - other.x, node.y - other.y);
        if (dist < 75) {
          node.connections.push(j);
        }
      }
    });

    const impulses: ElectricalImpulse[] = [];
    const sparks: SparkParticle[] = [];

    const spawnImpulse = () => {
      const fromNode = Math.floor(Math.random() * nodes.length);
      const node = nodes[fromNode];
      if (node.connections.length > 0) {
        const toNode = node.connections[Math.floor(Math.random() * node.connections.length)];
        impulses.push({
          fromNode,
          toNode,
          progress: 0,
          speed: (Math.random() * 0.05 + 0.03) * (isHovered || isLive ? 2.2 : 1),
          color: colors[Math.floor(Math.random() * colors.length)],
          size: Math.random() * 2.8 + 2.0,
        });
      }
    };

    const spawnSpontaneousCrack = () => {
      const n1 = nodes[Math.floor(Math.random() * nodes.length)];
      const n2 = nodes[Math.floor(Math.random() * nodes.length)];
      if (!n1 || !n2 || n1 === n2) return;

      const pts: Array<{ x: number; y: number }> = [{ x: n1.x, y: n1.y }];
      const segments = 6;
      for (let s = 1; s < segments; s++) {
        const t = s / segments;
        const midX = n1.x + (n2.x - n1.x) * t + (Math.random() - 0.5) * 22;
        const midY = n1.y + (n2.y - n1.y) * t + (Math.random() - 0.5) * 22;
        pts.push({ x: midX, y: midY });
      }
      pts.push({ x: n2.x, y: n2.y });

      lightningCracksRef.current.push({
        points: pts,
        alpha: 1,
        color: Math.random() < 0.5 ? '#00D9FF' : Math.random() < 0.8 ? '#A855F7' : '#EC4899',
        width: Math.random() * 0.8 + 1.2,
      });
    };

    let frame = 0;
    const render = () => {
      frame++;
      ctx.clearRect(0, 0, width, height);

      if (isChargingRef.current && chargeStartTime.current) {
        const elapsed = (Date.now() - chargeStartTime.current) / 1200;
        const curProgress = Math.min(1, elapsed);
        chargeProgressRef.current = curProgress;
        setChargeProgress(curProgress);
      }

      const charge = chargeProgressRef.current;

      if (frame % (isHovered || isLive ? 1 : 3) === 0) {
        spawnImpulse();
      }

      if (frame % (isHovered || isLive ? 8 : 16) === 0) {
        spawnSpontaneousCrack();
      }

      // ── 1. Draw Synaptic Dendrite Connections ──
      ctx.lineWidth = 0.8;
      nodes.forEach((node) => {
        node.connections.forEach((targetIdx) => {
          const target = nodes[targetIdx];
          const dist = Math.hypot(node.x - target.x, node.y - target.y);
          const alpha = (1 - dist / 78) * 0.35;
          ctx.strokeStyle = `rgba(0, 217, 255, ${alpha})`;
          ctx.beginPath();
          ctx.moveTo(node.x, node.y);
          ctx.lineTo(target.x, target.y);
          ctx.stroke();
        });
      });

      // ── 2. Draw Traveling Action Potentials ──
      for (let k = impulses.length - 1; k >= 0; k--) {
        const imp = impulses[k];
        imp.progress += imp.speed * (1 + charge * 2);
        const from = nodes[imp.fromNode];
        const to = nodes[imp.toNode];

        if (!from || !to || imp.progress >= 1) {
          if (to && Math.random() < 0.7) {
            for (let s = 0; s < 5; s++) {
              sparks.push({
                x: to.x,
                y: to.y,
                vx: (Math.random() - 0.5) * (3.0 + charge * 3),
                vy: (Math.random() - 0.5) * (3.0 + charge * 3),
                alpha: 1,
                color: imp.color,
                size: Math.random() * 2.0 + 1,
              });
            }
          }
          impulses.splice(k, 1);
          continue;
        }

        const currX = from.x + (to.x - from.x) * imp.progress;
        const currY = from.y + (to.y - from.y) * imp.progress;

        ctx.shadowColor = imp.color;
        ctx.shadowBlur = 16;
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(currX, currY, imp.size, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = imp.color;
        ctx.beginPath();
        ctx.arc(currX, currY, imp.size * 1.6, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      // ── 3. Draw Arrival Micro-Sparks ──
      for (let s = sparks.length - 1; s >= 0; s--) {
        const sp = sparks[s];
        sp.x += sp.vx;
        sp.y += sp.vy;
        sp.alpha -= 0.045;
        if (sp.alpha <= 0) {
          sparks.splice(s, 1);
          continue;
        }
        ctx.fillStyle = sp.color;
        ctx.globalAlpha = sp.alpha;
        ctx.beginPath();
        ctx.arc(sp.x, sp.y, sp.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
      }

      // ── 4. Singularity Gravitational Pull on Brain Cells ──
      nodes.forEach((node) => {
        if (charge > 0) {
          const targetX = brainCenterX + (node.origX - brainCenterX) * (1 - charge * 0.72);
          const targetY = brainCenterY + (node.origY - brainCenterY) * (1 - charge * 0.72);
          node.x += (targetX - node.x) * 0.15;
          node.y += (targetY - node.y) * 0.15;
        } else {
          node.x += node.vx;
          node.y += node.vy;

          const dx = (node.x - brainCenterX) / brainRadiusX;
          const dy = (node.y - brainCenterY) / brainRadiusY;
          if (dx * dx + dy * dy > 0.94) {
            node.vx *= -1;
            node.vy *= -1;
          }
        }

        ctx.shadowColor = node.color;
        ctx.shadowBlur = 12 + charge * 18;
        ctx.fillStyle = charge > 0.8 ? '#FFFFFF' : node.color;
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius * (1 + charge * 0.7), 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      // ── 5. Draw Charging Quantum Singularity Core ──
      if (charge > 0) {
        ctx.shadowColor = '#00D9FF';
        ctx.shadowBlur = 35 * charge;
        ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
        ctx.beginPath();
        ctx.arc(brainCenterX, brainCenterY, 7 + charge * 22, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = '#A855F7';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(brainCenterX, brainCenterY, 12 + charge * 28, 0, Math.PI * 2);
        ctx.stroke();
        ctx.shadowBlur = 0;
      }

      // ── 6. Draw Electric Neural Crack Lightning Fractures ──
      const cracks = lightningCracksRef.current;
      for (let f = cracks.length - 1; f >= 0; f--) {
        const crack = cracks[f];
        crack.alpha -= 0.038;
        if (crack.alpha <= 0) {
          cracks.splice(f, 1);
          continue;
        }

        ctx.strokeStyle = crack.color;
        ctx.lineWidth = crack.width;
        ctx.shadowColor = crack.color;
        ctx.shadowBlur = 20;
        ctx.globalAlpha = crack.alpha;
        ctx.beginPath();
        crack.points.forEach((pt, idx) => {
          if (idx === 0) ctx.moveTo(pt.x, pt.y);
          else ctx.lineTo(pt.x, pt.y);
        });
        ctx.stroke();
        ctx.globalAlpha = 1;
        ctx.shadowBlur = 0;
      }

      // ── 7. Interactive Cursor Lightning Branching ──
      if (rawMousePos.current.active && !isChargingRef.current) {
        const { x, y } = rawMousePos.current;
        const scaleFactor = width / (containerRef.current?.clientWidth || width);
        const mx = x * scaleFactor;
        const my = y * scaleFactor;

        let closestNode = nodes[0];
        let minDist = 9999;
        nodes.forEach((node) => {
          const d = Math.hypot(node.x - mx, node.y - my);
          if (d < minDist) {
            minDist = d;
            closestNode = node;
          }
        });

        if (minDist < 240 && closestNode) {
          ctx.strokeStyle = 'rgba(0, 217, 255, 0.9)';
          ctx.lineWidth = 1.6;
          ctx.shadowColor = '#00D9FF';
          ctx.shadowBlur = 18;
          ctx.beginPath();
          ctx.moveTo(closestNode.x, closestNode.y);

          const midX = (closestNode.x + mx) / 2 + (Math.random() - 0.5) * 24;
          const midY = (closestNode.y + my) / 2 + (Math.random() - 0.5) * 24;
          ctx.lineTo(midX, midY);
          ctx.lineTo(mx, my);
          ctx.stroke();
          ctx.shadowBlur = 0;
        }
      }

      animId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, [isHovered, isLive]);

  // ─── 4. Dynamic Live Telemetry Metrics ───────────────────────────────────────
  const [synapseRate, setSynapseRate] = useState(99.98);
  const [latencyMs, setLatencyMs] = useState(12);
  const [entropy, setEntropy] = useState(0.0028);
  const [tensorOps, setTensorOps] = useState('5.12 GHz');

  useEffect(() => {
    const interval = setInterval(() => {
      setSynapseRate(+(99.95 + Math.random() * 0.04).toFixed(2));
      setLatencyMs(Math.floor(7 + Math.random() * 5));
      setEntropy(+(0.001 + Math.random() * 0.0025).toFixed(4));
      setTensorOps(`${(5.0 + Math.random() * 0.3).toFixed(2)} GHz`);
    }, 2200);
    return () => clearInterval(interval);
  }, []);

  const innerBars = useMemo(() => Array.from({ length: 24 }), []);
  const outerBars = useMemo(() => Array.from({ length: 24 }), []);

  return (
    <div 
      ref={containerRef}
      onMouseDown={handleHoldStart}
      onMouseUp={handleRelease}
      onTouchStart={handleHoldStart}
      onTouchEnd={handleRelease}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        handleRelease();
      }}
      className="relative w-full max-w-[480px] lg:max-w-[540px] xl:max-w-[580px] aspect-square flex items-center justify-center cursor-pointer select-none perspective-[1400px]"
    >

      {/* ─── Real-Time Charge Progress HUD Bar ─── */}
      {isCharging && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-2 left-1/2 -translate-x-1/2 z-40 px-3.5 py-1.5 rounded-xl bg-[#040711]/95 border border-cyan-400/80 backdrop-blur-2xl shadow-[0_0_25px_rgba(0,217,255,0.5)] flex flex-col items-center gap-1 pointer-events-none"
        >
          <div className="flex items-center gap-1.5 text-[9px] font-mono font-bold text-cyan-300">
            <Zap className="w-3 h-3 text-cyan-400 animate-pulse" />
            <span>SINGULARITY CHARGE: {Math.floor(chargeProgress * 100)}%</span>
          </div>
          <div className="w-40 h-1.5 rounded-full bg-cyan-950/80 overflow-hidden border border-cyan-500/40">
            <div 
              className="h-full bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 transition-all duration-75 shadow-[0_0_8px_#00D9FF]"
              style={{ width: `${chargeProgress * 100}%` }}
            />
          </div>
        </motion.div>
      )}

      {/* ─── 3D Parallax Stage ─── */}
      <motion.div
        style={{
          rotateX,
          rotateY,
          x: transX,
          y: transY,
          transformStyle: 'preserve-3d',
        }}
        animate={{
          y: isLive ? [0, -10, 0] : [0, -6, 0],
          scale: isCharging ? [1, 0.97, 1] : 1,
        }}
        transition={{
          duration: isLive ? 4.2 : 6.8,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="relative w-full h-full flex items-center justify-center"
      >

        {/* ─── Hexagonal Grid ─── */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 90, repeat: Infinity, ease: 'linear' }}
          className="absolute w-[86%] h-[86%] rounded-full opacity-[0.08] pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(circle, rgba(0,217,255,0.4) 1px, transparent 1px)`,
            backgroundSize: '16px 16px',
            transform: 'scale(1.15)',
          }}
        />

        {/* ─── Deep Plasma Energy Core ─── */}
        <motion.div
          animate={{
            scale: isCharging ? [1, 1.35, 1] : isHovered || isLive ? [1, 1.22, 1] : [1, 1.1, 1],
            opacity: isCharging ? [0.8, 1, 0.8] : isHovered || isLive ? [0.5, 0.85, 0.5] : [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: isCharging ? 0.3 : isLive ? 2.2 : 4.8,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="absolute w-[90%] h-[90%] rounded-full blur-[100px] pointer-events-none"
          style={{
            background: isCharging 
              ? 'radial-gradient(circle, rgba(0,217,255,0.85) 0%, rgba(168,85,247,0.65) 40%, transparent 80%)'
              : 'radial-gradient(circle, rgba(0,217,255,0.55) 0%, rgba(99,102,241,0.35) 35%, rgba(168,85,247,0.2) 58%, transparent 80%)',
          }}
        />

        {/* ─── Outer Face Ring (Clockwise) ─── */}
        <motion.div
          animate={{ 
            rotate: 360,
            scale: isCharging ? [1.1, 0.96, 1.1] : isLive ? [1.1, 1.15, 1.1] : [1.1, 1.13, 1.1]
          }}
          transition={{ 
            rotate: { duration: isCharging ? 8 : 34, repeat: Infinity, ease: 'linear' },
            scale: { duration: isCharging ? 0.3 : 3.2, repeat: Infinity, ease: 'easeInOut' }
          }}
          className="absolute inset-[-3%] sm:inset-[-1%] rounded-full border-2 border-cyan-400/35 pointer-events-none"
          style={{
            borderStyle: 'dashed',
            transform: 'rotateX(72deg) rotateY(-8deg)',
            boxShadow: '0 0 40px rgba(0,217,255,0.35), inset 0 0 28px rgba(0,217,255,0.2)',
          }}
        >
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full bg-cyan-200 shadow-[0_0_18px_4px_rgba(0,217,255,1)]" />
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-3 h-3 rounded-full bg-cyan-400 shadow-[0_0_14px_3px_rgba(0,217,255,0.9)]" />
          
          <div className="absolute top-1/2 -left-3 -translate-y-1/2 px-1.5 py-0.2 rounded bg-cyan-950/90 border border-cyan-400/80 text-[7.5px] font-mono text-cyan-300 font-bold">
            000&deg;
          </div>
          <div className="absolute top-1/2 -right-3 -translate-y-1/2 px-1.5 py-0.2 rounded bg-cyan-950/90 border border-cyan-400/80 text-[7.5px] font-mono text-cyan-300 font-bold">
            180&deg;
          </div>
        </motion.div>

        {/* ─── Mid Equatorial Face Ring (Counter-Clockwise) ─── */}
        <motion.div
          animate={{ 
            rotate: -360,
            scale: isCharging ? [1.02, 0.94, 1.02] : isLive ? [1.02, 1.08, 1.02] : [1.02, 1.05, 1.02]
          }}
          transition={{ 
            rotate: { duration: isCharging ? 6 : 24, repeat: Infinity, ease: 'linear' },
            scale: { duration: isCharging ? 0.3 : 3.8, repeat: Infinity, ease: 'easeInOut' }
          }}
          className="absolute inset-4 sm:inset-7 rounded-full border-2 border-violet-400/40 pointer-events-none"
          style={{
            borderStyle: 'dotted',
            transform: 'rotateX(58deg) rotateY(28deg)',
            boxShadow: '0 0 35px rgba(168,85,247,0.4), inset 0 0 20px rgba(168,85,247,0.25)',
          }}
        >
          <div className="absolute top-1/2 -right-2 -translate-y-1/2 w-3.5 h-3.5 rounded-full bg-purple-200 shadow-[0_0_16px_4px_rgba(168,85,247,1)]" />
          <div className="absolute top-1/2 -left-2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-purple-400 shadow-[0_0_12px_3px_rgba(168,85,247,0.85)]" />
        </motion.div>

        {/* ─── Inner Brow Arc ─── */}
        <motion.div
          animate={{ 
            rotate: 360,
            opacity: isCharging ? [0.6, 1, 0.6] : [0.4, 0.85, 0.4]
          }}
          transition={{ 
            rotate: { duration: isCharging ? 4 : 16, repeat: Infinity, ease: 'linear' },
            opacity: { duration: 2.6, repeat: Infinity, ease: 'easeInOut' }
          }}
          className="absolute inset-12 sm:inset-16 rounded-full border border-dashed border-cyan-300/50 pointer-events-none"
          style={{
            transform: 'rotateX(42deg) rotateY(-18deg)',
            boxShadow: '0 0 24px rgba(0,217,255,0.4)',
          }}
        >
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-white shadow-[0_0_14px_3px_rgba(0,217,255,1)]" />
        </motion.div>

        {/* ─── Orbiting Satellite Prisms ─── */}
        {[
          { orbitRadius: 200, speed: 18, delay: 0, color: 'bg-cyan-400 shadow-[0_0_12px_rgba(0,217,255,1)]' },
          { orbitRadius: 165, speed: 14, delay: 4, color: 'bg-purple-400 shadow-[0_0_12px_rgba(168,85,247,1)]' },
          { orbitRadius: 225, speed: 24, delay: 8, color: 'bg-indigo-400 shadow-[0_0_12px_rgba(99,102,241,1)]' },
        ].map((sat, i) => (
          <motion.div
            key={i}
            animate={{ rotate: 360 }}
            transition={{ duration: isCharging ? sat.speed * 0.3 : sat.speed, repeat: Infinity, ease: 'linear', delay: sat.delay }}
            className="absolute inset-0 pointer-events-none flex items-center justify-center z-25"
            style={{ transform: `rotateX(${60 + i * 5}deg) rotateY(${i * 15}deg)` }}
          >
            <div
              className={`w-2 h-2 rounded-sm rotate-45 ${sat.color}`}
              style={{ transform: `translateX(${sat.orbitRadius}px)` }}
            />
          </motion.div>
        ))}

        {/* ─── Dual-Layer Audio Equalizer (48 Bars) ─── */}
        <div 
          className="absolute inset-16 rounded-full pointer-events-none flex items-center justify-center z-15"
          style={{ transform: 'rotateX(62deg)' }}
        >
          <div className="relative w-full h-full flex items-center justify-center">
            {innerBars.map((_, i) => {
              const angle = (i / innerBars.length) * 360;
              return (
                <motion.div
                  key={`in-${i}`}
                  animate={{
                    height: isCharging 
                      ? [6, Math.random() * 26 + 10, 6] 
                      : isLive 
                      ? [4, Math.random() * 22 + 6, 4] 
                      : [2.5, Math.random() * 10 + 2.5, 2.5],
                    opacity: [0.35, 0.9, 0.35],
                  }}
                  transition={{
                    duration: 0.5 + (i % 6) * 0.1,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                  className="absolute w-[1.5px] rounded-full origin-bottom"
                  style={{
                    backgroundColor: '#00D9FF',
                    boxShadow: '0 0 8px #00D9FF',
                    transform: `rotate(${angle}deg) translateY(-125px)`,
                  }}
                />
              );
            })}
          </div>
        </div>

        <div 
          className="absolute inset-12 rounded-full pointer-events-none flex items-center justify-center z-14"
          style={{ transform: 'rotateX(54deg) rotateY(18deg)' }}
        >
          <div className="relative w-full h-full flex items-center justify-center">
            {outerBars.map((_, i) => {
              const angle = (i / outerBars.length) * 360;
              return (
                <motion.div
                  key={`out-${i}`}
                  animate={{
                    height: isCharging 
                      ? [8, Math.random() * 24 + 8, 8] 
                      : isLive 
                      ? [5, Math.random() * 18 + 5, 5] 
                      : [3, Math.random() * 8 + 3, 3],
                    opacity: [0.25, 0.8, 0.25],
                  }}
                  transition={{
                    duration: 0.6 + (i % 5) * 0.12,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                  className="absolute w-[1.2px] rounded-full origin-bottom"
                  style={{
                    backgroundColor: '#A855F7',
                    boxShadow: '0 0 6px #A855F7',
                    transform: `rotate(${angle}deg) translateY(-145px)`,
                  }}
                />
              );
            })}
          </div>
        </div>

        {/* ─── Cranial Neural Energy Aura ─── */}
        <motion.div
          animate={{
            scale: isCharging ? [0.95, 1.4, 0.95] : isHovered || isLive ? [0.95, 1.3, 0.95] : [0.98, 1.15, 0.98],
            opacity: isCharging ? [0.8, 1, 0.8] : isHovered || isLive ? [0.65, 0.95, 0.65] : [0.4, 0.8, 0.4],
          }}
          transition={{
            duration: isCharging ? 0.3 : isLive ? 1.2 : 2.6,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="absolute top-[20%] left-[43%] w-48 h-48 rounded-full blur-2xl mix-blend-screen pointer-events-none z-15"
          style={{
            background: 'radial-gradient(circle, rgba(0,217,255,0.9) 0%, rgba(168,85,247,0.8) 38%, rgba(236,72,153,0.45) 62%, transparent 80%)',
          }}
        />

        {/* ─── Instant Click Cranial Flash Layer ─── */}
        {flashIntensity > 0 && (
          <div 
            className="absolute top-[18%] left-[40%] w-56 h-56 rounded-full blur-3xl mix-blend-screen pointer-events-none z-35 bg-cyan-300 opacity-90 transition-opacity duration-300"
          />
        )}

        {/* ─── 96 Brain Cells & Neural Crack Canvas ─── */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full pointer-events-none z-20 mix-blend-screen"
        />

        {/* ─── AI Incident Commander Robot & Companion Visual ─── */}
        <motion.div
          animate={{
            y: isLive ? [0, -8, 0] : isHovered ? -4 : [0, -6, 0],
            scale: isCharging ? [1, 1.04, 1] : [1, 1.015, 1],
          }}
          transition={{
            y: { duration: 4.8, repeat: Infinity, ease: 'easeInOut' },
            scale: { duration: 3.6, repeat: Infinity, ease: 'easeInOut' }
          }}
          className="relative z-15 w-[92%] h-[92%] flex items-center justify-center pointer-events-none"
        >
          <img
            src={heroRobotImg}
            onError={(e) => {
              const target = e.currentTarget;
              if (target.src !== heroRobotWebp) {
                target.src = heroRobotWebp;
              }
            }}
            alt="EchoAid X AI Incident Commander Robot Companion"
            className="w-full h-full object-contain object-center select-none"
            style={{
              maskImage: 'radial-gradient(circle at 50% 48%, black 65%, rgba(0,0,0,0.85) 82%, transparent 98%)',
              WebkitMaskImage: 'radial-gradient(circle at 50% 48%, black 65%, rgba(0,0,0,0.85) 82%, transparent 98%)',
              filter: isLive 
                ? 'brightness(1.08) contrast(1.05) drop-shadow(0 0 35px rgba(0,217,255,0.65))'
                : 'brightness(1.02) contrast(1.02) drop-shadow(0 0 25px rgba(0,217,255,0.38))',
            }}
          />

          {/* Glowing AI Core Chest / Cranial Beacon Pulse */}
          <motion.div
            animate={{
              scale: isLive ? [1, 1.35, 1] : [1, 1.18, 1],
              opacity: isLive ? [0.6, 0.95, 0.6] : [0.4, 0.75, 0.4],
            }}
            transition={{
              duration: 2.2,
              repeat: Infinity,
              ease: 'easeInOut'
            }}
            className="absolute top-[32%] left-[54%] -translate-x-1/2 -translate-y-1/2 w-20 h-20 rounded-full bg-cyan-400/40 blur-xl pointer-events-none mix-blend-screen"
          />
        </motion.div>

      </motion.div>

      {/* ─── 4 ROCK-SOLID PINNED TELEMETRY CARDS (NO OVERLAP) ─── */}
      
      {/* Top-Right: Cognition Engine */}
      <div className="absolute top-1 -right-2 sm:-right-4 z-30 px-3 py-1.5 rounded-xl bg-[#040711]/92 border border-cyan-400/40 backdrop-blur-2xl shadow-[0_6px_25px_rgba(0,217,255,0.25)] flex items-center gap-2 pointer-events-none">
        <div className="w-2 h-2 rounded-full bg-cyan-400 animate-ping shrink-0" />
        <div className="flex flex-col">
          <span className="text-[8px] font-mono font-bold tracking-widest text-slate-400 uppercase flex items-center gap-1">
            <Cpu className="w-2.5 h-2.5 text-cyan-400" />
            COGNITION ENGINE
          </span>
          <span className="text-[11px] font-mono font-bold text-cyan-300 tracking-tight">
            {synapseRate}% ACCURACY
          </span>
        </div>
      </div>

      {/* Top-Left: Operational Shield */}
      <div className="absolute top-1 -left-2 sm:-left-4 z-30 px-3 py-1.5 rounded-xl bg-[#040711]/92 border border-purple-400/40 backdrop-blur-2xl shadow-[0_6px_25px_rgba(168,85,247,0.25)] flex items-center gap-2 pointer-events-none">
        <ShieldCheck className="w-3.5 h-3.5 text-purple-400 shrink-0" />
        <div className="flex flex-col">
          <span className="text-[8px] font-mono font-bold text-slate-400 uppercase">OPERATIONAL SHIELD</span>
          <span className="text-[10px] font-mono font-bold text-purple-300 tracking-wide">
            EVIDENCE VERIFIED
          </span>
        </div>
      </div>

      {/* Bottom-Right: PCM Oscilloscope */}
      <div className="absolute bottom-1 -right-2 sm:-right-4 z-30 px-3 py-1.5 rounded-xl bg-[#040711]/92 border border-indigo-400/40 backdrop-blur-2xl shadow-[0_6px_25px_rgba(99,102,241,0.25)] flex flex-col gap-1 pointer-events-none">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-1">
            <Activity className="w-3 h-3 text-indigo-400 animate-pulse" />
            <span className="text-[8px] font-mono font-bold tracking-wider text-slate-400 uppercase">
              PCM STREAM
            </span>
          </div>
          <span className="text-[8.5px] font-mono text-indigo-300 font-bold">{latencyMs}ms</span>
        </div>

        {/* Mini Sine Wave */}
        <div className="w-24 h-3.5 flex items-center overflow-hidden">
          <svg className="w-full h-full stroke-cyan-400 fill-none" viewBox="0 0 100 20">
            <motion.path
              d="M 0 10 Q 12 0, 25 10 T 50 10 T 75 10 T 100 10"
              strokeWidth="1.8"
              animate={{
                d: [
                  "M 0 10 Q 12 2, 25 10 T 50 10 T 75 10 T 100 10",
                  "M 0 10 Q 12 18, 25 10 T 50 10 T 75 10 T 100 10",
                  "M 0 10 Q 12 2, 25 10 T 50 10 T 75 10 T 100 10",
                ]
              }}
              transition={{ repeat: Infinity, duration: 1.4, ease: 'linear' }}
            />
          </svg>
        </div>
      </div>

      {/* Bottom-Left: Tensor Core Live */}
      <div className="absolute bottom-1 -left-2 sm:-left-4 z-30 px-3 py-1.5 rounded-xl bg-[#040711]/92 border border-white/[0.1] backdrop-blur-2xl font-mono text-[8.5px] text-slate-400 flex flex-col gap-0.5 pointer-events-none shadow-[0_6px_25px_rgba(0,0,0,0.4)]">
        <div className="flex items-center gap-1 text-cyan-400 font-bold">
          <Terminal className="w-3 h-3" />
          <span>TENSOR_CORE_LIVE</span>
        </div>
        <div className="flex items-center justify-between gap-2.5">
          <span>CLOCK:</span>
          <span className="text-cyan-300 font-bold">{tensorOps}</span>
        </div>
        <div className="flex items-center justify-between gap-2.5">
          <span>ENTROPY:</span>
          <span className="text-emerald-400 font-bold">{entropy}</span>
        </div>
      </div>

    </div>
  );
};
