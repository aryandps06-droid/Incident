import React, { useEffect, useRef } from 'react';
import './HeroBrain.css';

export const HeroBrain: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = 800);
    let height = (canvas.height = 900);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.parentElement?.clientWidth || 800;
      height = canvas.height = canvas.parentElement?.clientHeight || 900;
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    // 4. Generate floating scanning dust particles inside canvas
    const particles: Array<{ x: number; y: number; radius: number; alpha: number; speedY: number; speedX: number; pulse: number }> = [];
    for (let p = 0; p < 35; p++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 2 + 0.8,
        alpha: Math.random() * 0.5 + 0.2,
        speedY: Math.random() * 0.4 + 0.1,
        speedX: (Math.random() - 0.5) * 0.2,
        pulse: Math.random() * Math.PI * 2
      });
    }

    // 2. Generate neural network nodes inside brain region
    const brainNodes: Array<{ x: number; y: number; size: number; baseAlpha: number; conexiones: number[] }> = [];
    const nodeCount = 80;

    const brainCenterX = width * 0.56;
    const brainCenterY = height * 0.32;
    const brainRadiusX = width * 0.25;
    const brainRadiusY = height * 0.21;

    for (let i = 0; i < nodeCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const rX = Math.sqrt(Math.random()) * brainRadiusX;
      const rY = Math.sqrt(Math.random()) * brainRadiusY;

      brainNodes.push({
        x: brainCenterX + Math.cos(angle) * rX,
        y: brainCenterY + Math.sin(angle) * rY * 0.88,
        size: Math.random() * 2.8 + 1,
        baseAlpha: Math.random() * 0.7 + 0.3,
        conexiones: []
      });
    }

    // Connect close nodes to form neural pathways
    for (let i = 0; i < nodeCount; i++) {
      for (let j = i + 1; j < nodeCount; j++) {
        const dx = brainNodes[i].x - brainNodes[j].x;
        const dy = brainNodes[i].y - brainNodes[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 72) {
          brainNodes[i].conexiones.push(j);
        }
      }
    }

    // Electric neural pulses moving continuously (Bright Pink & Electric Purple)
    const impulses: Array<{ from: number; to: number; progress: number; speed: number; color: string }> = [];
    const impulseColors = ['#EC4899', '#A855F7', '#D946EF', '#00E5FF', '#F43F5E'];

    for (let k = 0; k < 30; k++) {
      const fromIdx = Math.floor(Math.random() * nodeCount);
      if (brainNodes[fromIdx].conexiones.length > 0) {
        const toIdx = brainNodes[fromIdx].conexiones[Math.floor(Math.random() * brainNodes[fromIdx].conexiones.length)];
        impulses.push({
          from: fromIdx,
          to: toIdx,
          progress: Math.random(),
          speed: Math.random() * 0.024 + 0.01,
          color: impulseColors[Math.floor(Math.random() * impulseColors.length)]
        });
      }
    }

    let time = 0;

    const render = () => {
      time += 0.016;
      ctx.clearRect(0, 0, width, height);

      const currentBrainCenterX = width * 0.56;
      const currentBrainCenterY = height * 0.32;

      // Render Floating Particles
      for (let p = 0; p < particles.length; p++) {
        const pt = particles[p];
        pt.y -= pt.speedY;
        pt.x += pt.speedX;
        pt.pulse += 0.02;

        if (pt.y < -10) pt.y = height + 10;
        if (pt.x < -10) pt.x = width + 10;
        if (pt.x > width + 10) pt.x = -10;

        const pAlpha = pt.alpha + Math.sin(pt.pulse) * 0.15;
        ctx.fillStyle = p % 2 === 0 ? `rgba(0, 229, 255, ${Math.max(0.08, pAlpha)})` : `rgba(236, 72, 153, ${Math.max(0.08, pAlpha)})`;
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, pt.radius, 0, Math.PI * 2);
        ctx.fill();
      }

      // Heartbeat Pulse Modulation for MRI Brain Core
      const heartbeatPulse = Math.sin(time * 3.2) * 0.08 + 1;

      // Subsurface Brain Volumetric Glow
      const brainGlow = ctx.createRadialGradient(
        currentBrainCenterX, currentBrainCenterY, 15,
        currentBrainCenterX, currentBrainCenterY, brainRadiusX * 1.5 * heartbeatPulse
      );
      brainGlow.addColorStop(0, 'rgba(236, 72, 153, 0.7)'); // Hot Pink
      brainGlow.addColorStop(0.4, 'rgba(168, 85, 247, 0.5)'); // Electric Purple
      brainGlow.addColorStop(0.75, 'rgba(0, 229, 255, 0.25)'); // Cyan Rim
      brainGlow.addColorStop(1, 'rgba(3, 6, 20, 0)');
      ctx.fillStyle = brainGlow;
      ctx.beginPath();
      ctx.arc(currentBrainCenterX, currentBrainCenterY, brainRadiusX * 1.5 * heartbeatPulse, 0, Math.PI * 2);
      ctx.fill();

      // Draw Neural Synapse Pathways
      ctx.lineWidth = 0.9;
      for (let i = 0; i < nodeCount; i++) {
        const nodeA = brainNodes[i];
        for (const targetIdx of nodeA.conexiones) {
          const nodeB = brainNodes[targetIdx];
          const lineAlpha = (Math.sin(time * 2.2 + i) + 1) * 0.22 + 0.15;
          
          ctx.strokeStyle = i % 2 === 0 ? `rgba(236, 72, 153, ${lineAlpha})` : `rgba(168, 85, 247, ${lineAlpha})`;
          ctx.beginPath();
          ctx.moveTo(nodeA.x, nodeA.y);
          ctx.lineTo(nodeB.x, nodeB.y);
          ctx.stroke();
        }
      }

      // Render Floating Electric Neural Impulses
      for (let k = 0; k < impulses.length; k++) {
        const imp = impulses[k];
        imp.progress += imp.speed;
        if (imp.progress >= 1) {
          imp.progress = 0;
          imp.from = Math.floor(Math.random() * nodeCount);
          if (brainNodes[imp.from].conexiones.length > 0) {
            imp.to = brainNodes[imp.from].conexiones[Math.floor(Math.random() * brainNodes[imp.from].conexiones.length)];
          }
        }

        const nodeA = brainNodes[imp.from];
        const nodeB = brainNodes[imp.to];
        if (nodeA && nodeB) {
          const curX = nodeA.x + (nodeB.x - nodeA.x) * imp.progress;
          const curY = nodeA.y + (nodeB.y - nodeA.y) * imp.progress;

          ctx.fillStyle = imp.color;
          ctx.shadowColor = imp.color;
          ctx.shadowBlur = 10;
          ctx.beginPath();
          ctx.arc(curX, curY, 2.6, 0, Math.PI * 2);
          ctx.fill();
          ctx.shadowBlur = 0;
        }
      }

      // Render Neural Synapse Nodes
      for (let i = 0; i < nodeCount; i++) {
        const node = brainNodes[i];
        const alpha = Math.max(0.2, Math.min(1.0, node.baseAlpha + Math.sin(time * 3.5 + i) * 0.35));

        ctx.fillStyle = i % 2 === 0 ? `rgba(236, 72, 153, ${alpha})` : `rgba(168, 85, 247, ${alpha})`;
        ctx.shadowColor = i % 2 === 0 ? '#EC4899' : '#A855F7';
        ctx.shadowBlur = 9;
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      // 5. Medical Scan Lines Overlay
      const scanY = (Math.sin(time * 0.7) * 0.45 + 0.5) * height;
      const scanGrad = ctx.createLinearGradient(0, scanY, width, scanY);
      scanGrad.addColorStop(0, 'rgba(0, 229, 255, 0)');
      scanGrad.addColorStop(0.3, 'rgba(236, 72, 153, 0.45)');
      scanGrad.addColorStop(0.7, 'rgba(168, 85, 247, 0.45)');
      scanGrad.addColorStop(1, 'rgba(0, 229, 255, 0)');

      ctx.strokeStyle = scanGrad;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(width * 0.1, scanY);
      ctx.lineTo(width * 0.95, scanY);
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
    <div className="hero-brain-artwork-stage">
      
      {/* Subsurface Volumetric Radial Glow */}
      <div className="hero-brain-volumetric-glow" />

      {/* 3. Three Concentric Rotating HUD Rings */}
      <div className="hero-hud-ring-1">
        <div style={{ position: 'absolute', top: '10px', left: '50%', transform: 'translateX(-50%)', width: '10px', height: '10px', borderRadius: '50%', background: '#ec4899', boxShadow: '0 0 15px #ec4899' }} />
      </div>
      <div className="hero-hud-ring-2">
        <div style={{ position: 'absolute', bottom: '10px', left: '50%', transform: 'translateX(-50%)', width: '8px', height: '8px', borderRadius: '50%', background: '#a855f7', boxShadow: '0 0 12px #a855f7' }} />
      </div>
      <div className="hero-hud-ring-3" />

      {/* 1. Translucent Holographic Glass Human Head with visible neck and shoulders */}
      <div className="hero-head-glass-body">
        
        <svg 
          viewBox="0 0 600 700" 
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', filter: 'drop-shadow(0 0 45px rgba(0, 229, 255, 0.5))', pointerEvents: 'none' }}
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="heroGlassEdgeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#00E5FF" stopOpacity="0.92" />
              <stop offset="40%" stopColor="#A855F7" stopOpacity="0.82" />
              <stop offset="75%" stopColor="#EC4899" stopOpacity="0.88" />
              <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.85" />
            </linearGradient>

            <linearGradient id="heroGlassBrainFill" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#EC4899" stopOpacity="0.45" />
              <stop offset="50%" stopColor="#A855F7" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#00E5FF" stopOpacity="0.25" />
            </linearGradient>
          </defs>

          {/* Translucent Glass Profile Contour (Head, Neck, Shoulders) */}
          <path
            d="M 220 660 
               C 220 580, 240 520, 260 470 
               C 230 460, 210 430, 210 390 
               C 210 360, 230 335, 255 330 
               C 245 290, 240 240, 250 180 
               C 270 100, 340 40, 420 40 
               C 510 40, 570 110, 575 210 
               C 580 270, 560 330, 550 360 
               C 530 420, 490 460, 470 490 
               C 455 515, 450 560, 445 660"
            stroke="url(#heroGlassEdgeGrad)"
            strokeWidth="4"
            strokeLinecap="round"
            style={{ filter: 'drop-shadow(0 0 16px #00E5FF)' }}
          />

          {/* Visible Neck & Shoulders Contour Lines */}
          <path
            d="M 220 660 C 170 680, 110 700, 60 715 M 445 660 C 495 680, 550 700, 600 715"
            stroke="url(#heroGlassEdgeGrad)"
            strokeWidth="2.5"
            strokeDasharray="5 7"
            opacity="0.7"
          />

          {/* 2. MRI Brain Anatomical Shape Overlay */}
          <path
            d="M 320 105 
               C 385 65, 495 70, 530 135 
               C 560 190, 550 260, 515 305 
               C 480 345, 400 350, 345 320 
               C 305 295, 285 235, 300 175 
               C 310 135, 318 115, 320 105 Z"
            fill="url(#heroGlassBrainFill)"
            stroke="#EC4899"
            strokeWidth="2.2"
            strokeDasharray="6 4"
            style={{ filter: 'drop-shadow(0 0 16px #EC4899)' }}
          />
        </svg>

        {/* Neural Synapses & Electric Impulses Canvas */}
        <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }} />

        {/* 6. ECG Telemetry Readout */}
        <div className="hero-ecg-telemetry-badge">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#00e5ff', gap: '16px' }}>
            <span style={{ fontSize: '10px', color: '#94a3b8' }}>NEURAL TELEMETRY</span>
            <span style={{ color: '#34d399', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#34d399' }} />
              SYNAPSE OK
            </span>
          </div>

          <div style={{ width: '140px', height: '32px', display: 'flex', alignItems: 'center' }}>
            <svg viewBox="0 0 140 30" style={{ width: '100%', height: '100%', stroke: '#ec4899', fill: 'none' }}>
              <path
                className="hero-ecg-stroke-line"
                d="M 0 15 L 30 15 L 35 5 L 42 25 L 50 2 L 58 22 L 64 15 L 140 15"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9px', color: '#94a3b8', paddingTop: '2px' }}>
            <span>BPM: 74</span>
            <span>SpO2: 98%</span>
            <span>FREQ: 40Hz</span>
          </div>
        </div>

      </div>

    </div>
  );
};

export default HeroBrain;
