import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

export const AICoreConsciousness: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = 750);
    let height = (canvas.height = 750);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.parentElement?.clientWidth || 750;
      height = canvas.height = canvas.parentElement?.clientHeight || 750;
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    // Generate orbiting neural nodes around AI Core
    const nodeCount = 55;
    const nodes: Array<{
      angle: number;
      distance: number;
      orbitSpeed: number;
      radius: number;
      baseAlpha: number;
      connections: number[];
    }> = [];

    for (let i = 0; i < nodeCount; i++) {
      const dist = Math.random() * 220 + 80; // Distance from core
      nodes.push({
        angle: Math.random() * Math.PI * 2,
        distance: dist,
        orbitSpeed: (Math.random() * 0.008 + 0.003) * (i % 2 === 0 ? 1 : -1),
        radius: Math.random() * 2.5 + 1,
        baseAlpha: Math.random() * 0.7 + 0.3,
        connections: []
      });
    }

    // Connect close nodes for electric neural arcs
    for (let i = 0; i < nodeCount; i++) {
      for (let j = i + 1; j < nodeCount; j++) {
        const dx = Math.cos(nodes[i].angle) * nodes[i].distance - Math.cos(nodes[j].angle) * nodes[j].distance;
        const dy = Math.sin(nodes[i].angle) * nodes[i].distance - Math.sin(nodes[j].angle) * nodes[j].distance;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 65) {
          nodes[i].connections.push(j);
        }
      }
    }

    // Electric energy arcs shooting across core
    const arcs: Array<{ from: number; to: number; progress: number; speed: number; color: string }> = [];
    const colors = ['#00E5FF', '#A855F7', '#EC4899', '#3B82F6'];

    for (let k = 0; k < 22; k++) {
      const fromIdx = Math.floor(Math.random() * nodeCount);
      if (nodes[fromIdx].connections.length > 0) {
        const toIdx = nodes[fromIdx].connections[Math.floor(Math.random() * nodes[fromIdx].connections.length)];
        arcs.push({
          from: fromIdx,
          to: toIdx,
          progress: Math.random(),
          speed: Math.random() * 0.025 + 0.01,
          color: colors[Math.floor(Math.random() * colors.length)]
        });
      }
    }

    let time = 0;

    const render = () => {
      time += 0.016;
      ctx.clearRect(0, 0, width, height);

      const curCenterX = width * 0.5;
      const curCenterY = height * 0.5;

      // 1. Core Subsurface Radial Bloom
      const coreBloom = ctx.createRadialGradient(curCenterX, curCenterY, 20, curCenterX, curCenterY, 280);
      coreBloom.addColorStop(0, 'rgba(0, 229, 255, 0.45)');
      coreBloom.addColorStop(0.35, 'rgba(168, 85, 247, 0.35)');
      coreBloom.addColorStop(0.7, 'rgba(236, 72, 153, 0.2)');
      coreBloom.addColorStop(1, 'rgba(4, 7, 20, 0)');
      ctx.fillStyle = coreBloom;
      ctx.beginPath();
      ctx.arc(curCenterX, curCenterY, 280, 0, Math.PI * 2);
      ctx.fill();

      // 2. Update Orbiting Neural Nodes Position
      for (let i = 0; i < nodeCount; i++) {
        nodes[i].angle += nodes[i].orbitSpeed;
      }

      // 3. Render Synapse Lines Between Orbiting Nodes
      ctx.lineWidth = 0.8;
      for (let i = 0; i < nodeCount; i++) {
        const nodeA = nodes[i];
        const ax = curCenterX + Math.cos(nodeA.angle) * nodeA.distance;
        const ay = curCenterY + Math.sin(nodeA.angle) * nodeA.distance;

        for (const targetIdx of nodeA.connections) {
          const nodeB = nodes[targetIdx];
          const bx = curCenterX + Math.cos(nodeB.angle) * nodeB.distance;
          const by = curCenterY + Math.sin(nodeB.angle) * nodeB.distance;

          const lineAlpha = (Math.sin(time * 2.5 + i) + 1) * 0.18 + 0.1;
          ctx.strokeStyle = i % 2 === 0 ? `rgba(0, 229, 255, ${lineAlpha})` : `rgba(168, 85, 247, ${lineAlpha})`;
          ctx.beginPath();
          ctx.moveTo(ax, ay);
          ctx.lineTo(bx, by);
          ctx.stroke();
        }
      }

      // 4. Render Electric Arcs Traveling along Connections
      for (let k = 0; k < arcs.length; k++) {
        const arc = arcs[k];
        arc.progress += arc.speed;
        if (arc.progress >= 1) {
          arc.progress = 0;
          arc.from = Math.floor(Math.random() * nodeCount);
          if (nodes[arc.from].connections.length > 0) {
            arc.to = nodes[arc.from].connections[Math.floor(Math.random() * nodes[arc.from].connections.length)];
          }
        }

        const nodeA = nodes[arc.from];
        const nodeB = nodes[arc.to];
        if (nodeA && nodeB) {
          const ax = curCenterX + Math.cos(nodeA.angle) * nodeA.distance;
          const ay = curCenterY + Math.sin(nodeA.angle) * nodeA.distance;
          const bx = curCenterX + Math.cos(nodeB.angle) * nodeB.distance;
          const by = curCenterY + Math.sin(nodeB.angle) * nodeB.distance;

          const curX = ax + (bx - ax) * arc.progress;
          const curY = ay + (by - ay) * arc.progress;

          ctx.fillStyle = arc.color;
          ctx.shadowColor = arc.color;
          ctx.shadowBlur = 10;
          ctx.beginPath();
          ctx.arc(curX, curY, 2.5, 0, Math.PI * 2);
          ctx.fill();
          ctx.shadowBlur = 0;
        }
      }

      // 5. Render Orbiting Neural Nodes
      for (let i = 0; i < nodeCount; i++) {
        const node = nodes[i];
        const nx = curCenterX + Math.cos(node.angle) * node.distance;
        const ny = curCenterY + Math.sin(node.angle) * node.distance;
        const alpha = Math.max(0.2, Math.min(1.0, node.baseAlpha + Math.sin(time * 3 + i) * 0.35));

        ctx.fillStyle = i % 3 === 0 ? `rgba(236, 72, 153, ${alpha})` : (i % 2 === 0 ? `rgba(0, 229, 255, ${alpha})` : `rgba(168, 85, 247, ${alpha})`);
        ctx.shadowColor = i % 3 === 0 ? '#EC4899' : '#00E5FF';
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(nx, ny, node.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      // 6. Medical Scanning Pulse Sweep Circle
      const scanRadius = ((Math.sin(time * 1.2) * 0.5 + 0.5) * 220) + 40;
      ctx.strokeStyle = `rgba(0, 229, 255, ${Math.max(0.1, 0.4 - scanRadius / 600)})`;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(curCenterX, curCenterY, scanRadius, 0, Math.PI * 2);
      ctx.stroke();

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animId);
    };
  }, []);

  return (
    <div className="relative w-full h-full min-h-[580px] lg:min-h-[680px] flex items-center justify-center overflow-hidden select-none">
      
      {/* 1. Volumetric Subsurface Radial Backdrop Bloom */}
      <div className="absolute w-[520px] h-[520px] lg:w-[680px] lg:h-[680px] rounded-full bg-gradient-to-tr from-cyan-500/25 via-purple-600/30 to-pink-500/20 blur-[130px] pointer-events-none animate-pulse-slow" />

      {/* 2. Outer Holographic Ring (Clockwise Rotation) */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 48, repeat: Infinity, ease: 'linear' }}
        className="absolute w-[460px] h-[460px] lg:w-[600px] lg:h-[600px] rounded-full border border-cyan-400/30 border-t-cyan-300/90 border-b-purple-500/60 pointer-events-none"
      >
        <div className="absolute top-2 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-cyan-300 shadow-[0_0_16px_#00E5FF]" />
        <div className="absolute bottom-6 right-12 w-2.5 h-2.5 rounded-full bg-purple-400 shadow-[0_0_12px_#A855F7]" />
      </motion.div>

      {/* 3. Glass Ring (Counter-Clockwise Rotation) */}
      <motion.div
        animate={{ rotate: -360 }}
        transition={{ duration: 62, repeat: Infinity, ease: 'linear' }}
        className="absolute w-[380px] h-[380px] lg:w-[500px] lg:h-[500px] rounded-full border border-purple-500/25 border-r-pink-500/80 border-l-cyan-400/50 backdrop-blur-[6px] pointer-events-none"
      >
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-2.5 h-2.5 rounded-full bg-pink-400 shadow-[0_0_12px_#EC4899]" />
      </motion.div>

      {/* 4. Energy Pulse Ring (Heartbeat Expansion every 5 sec) */}
      <motion.div
        animate={{
          scale: [1, 1.35, 1],
          opacity: [0.6, 0, 0.6],
        }}
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute w-[280px] h-[280px] lg:w-[380px] lg:h-[380px] rounded-full border-2 border-cyan-400/40 pointer-events-none shadow-[0_0_30px_#00E5FF]"
      />

      {/* 5. Core Sphere Container (Floating Breathing Motion) */}
      <motion.div
        animate={{
          y: [-8, 8, -8],
          scale: [1, 1.03, 1],
        }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        className="relative z-10 w-[240px] h-[240px] lg:w-[320px] lg:h-[320px] rounded-full flex flex-col items-center justify-center bg-gradient-to-br from-cyan-950/70 via-space-card/90 to-space-bg border-2 border-cyan-400/80 shadow-[0_0_60px_rgba(0,229,255,0.45)] backdrop-blur-3xl"
      >
        {/* Core Volumetric Glass Sphere */}
        <div className="relative w-36 h-36 lg:w-48 lg:h-48 rounded-full bg-gradient-to-tr from-cyan-400/40 via-purple-500/40 to-pink-500/30 flex items-center justify-center shadow-inner border border-white/20">
          <div className="w-20 h-20 lg:w-28 lg:h-28 rounded-full bg-gradient-to-br from-white/90 via-cyan-300 to-purple-400 blur-[2px] shadow-[0_0_30px_#00E5FF] animate-pulse" />
        </div>
      </motion.div>

      {/* Dynamic Canvas Layer (Orbiting Neural Nodes & Electric Arcs) */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />

      {/* 6. Medical Telemetry & Floating ECG Waveform Card */}
      <div className="absolute bottom-12 right-4 sm:right-10 bg-space-card/85 border border-white/10 rounded-2xl p-4 backdrop-blur-2xl shadow-card-soft space-y-1.5 font-mono text-[11px] z-20">
        <div className="flex items-center justify-between text-cyan-300 gap-6">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">AI CONSCIOUSNESS TELEMETRY</span>
          <span className="text-emerald-400 font-bold flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            ONLINE (99.4%)
          </span>
        </div>

        {/* Pulsing Medical ECG Waveform Line */}
        <div className="w-44 h-9 flex items-center">
          <svg viewBox="0 0 140 30" className="w-full h-full stroke-cyan-400 fill-none">
            <path
              d="M 0 15 L 30 15 L 35 5 L 42 25 L 50 2 L 58 22 L 64 15 L 140 15"
              strokeWidth="2"
              strokeLinecap="round"
              className="drop-shadow-[0_0_10px_#00E5FF]"
            />
          </svg>
        </div>

        <div className="flex justify-between text-[9.5px] text-slate-400 pt-0.5 border-t border-white/10">
          <span>FREQ: 40Hz</span>
          <span>LATENCY: 12ms</span>
          <span>NEURAL: 55 NODES</span>
        </div>
      </div>

    </div>
  );
};
