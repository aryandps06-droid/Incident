import React, { useEffect, useRef } from 'react';

export const HolographicHeadBrain: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = 780);
    let height = (canvas.height = 880);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.parentElement?.clientWidth || 780;
      height = canvas.height = canvas.parentElement?.clientHeight || 880;
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    // Generate 80 neural network nodes inside brain region
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

    // Connect close nodes for electric neural pathways
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

    // Electric neural impulses (Pink #D946EF, Purple #A855F7, Electric Blue #00E5FF)
    const impulses: Array<{ from: number; to: number; progress: number; speed: number; color: string }> = [];
    const impulseColors = ['#D946EF', '#A855F7', '#00E5FF', '#7C4DFF', '#38BDF8'];

    for (let k = 0; k < 30; k++) {
      const fromIdx = Math.floor(Math.random() * nodeCount);
      if (brainNodes[fromIdx].conexiones.length > 0) {
        const toIdx = brainNodes[fromIdx].conexiones[Math.floor(Math.random() * brainNodes[fromIdx].conexiones.length)];
        impulses.push({
          from: fromIdx,
          to: toIdx,
          progress: Math.random(),
          speed: Math.random() * 0.02 + 0.008,
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

      // Brain brightness fluctuates every 3 seconds (as requested)
      const brightnessFluctuation = Math.sin(time * 2.1) * 0.18 + 0.82;

      // 1. Subsurface Brain Volumetric Glow (Neon Pink #D946EF, Purple #A855F7, Electric Blue #00E5FF)
      const brainGlow = ctx.createRadialGradient(currentBrainCenterX, currentBrainCenterY, 15, currentBrainCenterX, currentBrainCenterY, brainRadiusX * 1.55);
      brainGlow.addColorStop(0, `rgba(217, 70, 239, ${0.7 * brightnessFluctuation})`); // Neon Pink #D946EF
      brainGlow.addColorStop(0.4, `rgba(168, 85, 247, ${0.5 * brightnessFluctuation})`); // Purple #A855F7
      brainGlow.addColorStop(0.75, `rgba(0, 229, 255, ${0.3 * brightnessFluctuation})`); // Electric Blue #00E5FF
      brainGlow.addColorStop(1, 'rgba(3, 7, 18, 0)');
      ctx.fillStyle = brainGlow;
      ctx.beginPath();
      ctx.arc(currentBrainCenterX, currentBrainCenterY, brainRadiusX * 1.55, 0, Math.PI * 2);
      ctx.fill();

      // 2. Draw Neural Pathways (Synapse Lines)
      ctx.lineWidth = 0.9;
      for (let i = 0; i < nodeCount; i++) {
        const nodeA = brainNodes[i];
        for (const targetIdx of nodeA.conexiones) {
          const nodeB = brainNodes[targetIdx];
          const lineAlpha = ((Math.sin(time * 2.2 + i) + 1) * 0.2 + 0.15) * brightnessFluctuation;
          
          ctx.strokeStyle = i % 2 === 0 ? `rgba(217, 70, 239, ${lineAlpha})` : `rgba(168, 85, 247, ${lineAlpha})`;
          ctx.beginPath();
          ctx.moveTo(nodeA.x, nodeA.y);
          ctx.lineTo(nodeB.x, nodeB.y);
          ctx.stroke();
        }
      }

      // 3. Render Floating Electric Impulses along Pathways
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

      // 4. Render Neural Synapse Points (Sparkling)
      for (let i = 0; i < nodeCount; i++) {
        const node = brainNodes[i];
        const alpha = Math.max(0.2, Math.min(1.0, (node.baseAlpha + Math.sin(time * 3.5 + i) * 0.35) * brightnessFluctuation));

        ctx.fillStyle = i % 2 === 0 ? `rgba(217, 70, 239, ${alpha})` : `rgba(168, 85, 247, ${alpha})`;
        ctx.shadowColor = i % 2 === 0 ? '#D946EF' : '#A855F7';
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animId);
    };
  }, []);

  return (
    <div className="relative w-full h-full min-h-[620px] lg:min-h-[780px] flex items-center justify-center overflow-hidden select-none">
      
      {/* Volumetric Radial Glow Backdrop (Blue & Magenta Rim Light) */}
      <div className="absolute w-[580px] h-[580px] lg:w-[750px] lg:h-[750px] rounded-full bg-gradient-to-tr from-[#00E5FF]/20 via-[#A855F7]/25 to-[#D946EF]/20 blur-[140px] pointer-events-none" />

      {/* Massive Circular Scanner HUD Rings Rotating Slowly at Different Speeds */}
      <div className="absolute w-[500px] h-[500px] lg:w-[660px] lg:h-[660px] rounded-full border border-[#00E5FF]/20 border-t-[#D946EF]/80 animate-spin-slow pointer-events-none" />
      <div className="absolute w-[420px] h-[420px] lg:w-[550px] lg:h-[550px] rounded-full border border-[#A855F7]/20 border-r-[#00E5FF]/60 animate-spin-reverse pointer-events-none" />

      {/* Glass Profile Head SVG + MRI Pink/Purple Brain Overlay */}
      <div className="relative z-10 w-full max-w-[680px] h-[660px] lg:h-[820px] flex items-center justify-center">
        
        {/* Transparent Glass Holographic Head Contour SVG */}
        <svg 
          viewBox="0 0 600 700" 
          className="absolute inset-0 w-full h-full drop-shadow-[0_0_45px_rgba(0,229,255,0.5)] pointer-events-none"
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="headRimGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#00E5FF" stopOpacity="0.95" />
              <stop offset="40%" stopColor="#A855F7" stopOpacity="0.85" />
              <stop offset="75%" stopColor="#D946EF" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#38BDF8" stopOpacity="0.85" />
            </linearGradient>

            <linearGradient id="mriSkullGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#D946EF" stopOpacity="0.45" />
              <stop offset="50%" stopColor="#A855F7" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#00E5FF" stopOpacity="0.25" />
            </linearGradient>

            <radialGradient id="platformGlowGrad" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#00E5FF" stopOpacity="0.6" />
              <stop offset="50%" stopColor="#A855F7" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#030712" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Holographic Head Side Profile Path facing left */}
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
            stroke="url(#headRimGrad)"
            strokeWidth="4"
            strokeLinecap="round"
            className="filter drop-shadow-[0_0_16px_#00E5FF]"
          />

          {/* Neck & Shoulder Contour Lines */}
          <path
            d="M 220 660 C 180 680, 130 700, 80 710 M 445 660 C 490 680, 540 700, 590 710"
            stroke="url(#headRimGrad)"
            strokeWidth="2.4"
            strokeDasharray="4 6"
            opacity="0.7"
          />

          {/* MRI Brain Anatomical Shape Overlay */}
          <path
            d="M 320 105 
               C 385 65, 495 70, 530 135 
               C 560 190, 550 260, 515 305 
               C 480 345, 400 350, 345 320 
               C 305 295, 285 235, 300 175 
               C 310 135, 318 115, 320 105 Z"
            fill="url(#mriSkullGrad)"
            stroke="#D946EF"
            strokeWidth="2"
            strokeDasharray="6 4"
            className="filter drop-shadow-[0_0_16px_#D946EF]"
          />

          {/* Holographic Circular Platform Below Neck */}
          <ellipse
            cx="330"
            cy="670"
            rx="220"
            ry="26"
            fill="url(#platformGlowGrad)"
            stroke="#00E5FF"
            strokeWidth="1.5"
            strokeDasharray="8 4"
            opacity="0.8"
          />
        </svg>

        {/* Dynamic Canvas Layer (Neural Synapses & Electric Impulses) */}
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />

        {/* Small ECG Line on Right Side (Pink with Soft Pulse & Tiny Glow) */}
        <div className="absolute bottom-16 right-2 sm:right-6 bg-space-card/85 border border-white/10 rounded-2xl p-3.5 backdrop-blur-2xl shadow-card-soft space-y-1 font-mono text-[11px]">
          <div className="flex items-center justify-between text-[#00E5FF] gap-4">
            <span className="text-[10px] text-slate-400 font-bold">NEURAL ECG</span>
            <span className="text-emerald-400 font-bold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              PULSE
            </span>
          </div>

          <div className="w-36 h-8 flex items-center">
            <svg viewBox="0 0 140 30" className="w-full h-full stroke-[#D946EF] fill-none">
              <path
                d="M 0 15 L 30 15 L 35 5 L 42 25 L 50 2 L 58 22 L 64 15 L 140 15"
                strokeWidth="2"
                strokeLinecap="round"
                className="drop-shadow-[0_0_10px_#D946EF] animate-pulse"
              />
            </svg>
          </div>
        </div>

      </div>

    </div>
  );
};
