import React, { useEffect, useRef } from 'react';

interface AuroraBackgroundProps {
  children: React.ReactNode;
}

export const AuroraBackground: React.FC<AuroraBackgroundProps> = ({ children }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const spotlightRef = useRef<HTMLDivElement>(null);
  const auroraCanvasRef = useRef<HTMLCanvasElement>(null);
  const starCanvasRef = useRef<HTMLCanvasElement>(null);

  const parallaxRef = useRef({ targetX: 0, targetY: 0, currentX: 0, currentY: 0 });

  // Cursor Parallax Tracking
  useEffect(() => {
    let animationFrameId: number;

    const handleMouseMove = (e: MouseEvent) => {
      parallaxRef.current.targetX = (e.clientX / window.innerWidth - 0.5) * 24;
      parallaxRef.current.targetY = (e.clientY / window.innerHeight - 0.5) * 24;
    };

    const updatePosition = () => {
      parallaxRef.current.currentX += (parallaxRef.current.targetX - parallaxRef.current.currentX) * 0.05;
      parallaxRef.current.currentY += (parallaxRef.current.targetY - parallaxRef.current.currentY) * 0.05;

      if (spotlightRef.current) {
        const spotX = (parallaxRef.current.targetX + 0.5 * window.innerWidth) - 250;
        const spotY = (parallaxRef.current.targetY + 0.5 * window.innerHeight) - 250;
        spotlightRef.current.style.transform = `translate3d(${spotX}px, ${spotY}px, 0)`;
      }

      animationFrameId = requestAnimationFrame(updatePosition);
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    animationFrameId = requestAnimationFrame(updatePosition);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  // Tiny Star Particles Background Canvas
  useEffect(() => {
    const canvas = starCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    const stars: Array<{ x: number; y: number; r: number; alpha: number; pulseSpeed: number }> = [];
    for (let i = 0; i < 45; i++) {
      stars.push({
        x: Math.random() * width,
        y: Math.random() * height,
        r: Math.random() * 1.2 + 0.4,
        alpha: Math.random() * 0.4 + 0.1,
        pulseSpeed: Math.random() * 0.02 + 0.005
      });
    }

    let time = 0;
    const renderStars = () => {
      time += 0.015;
      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < stars.length; i++) {
        const s = stars[i];
        const a = s.alpha + Math.sin(time * s.pulseSpeed * 10) * 0.15;
        ctx.fillStyle = `rgba(0, 229, 255, ${Math.max(0.05, a)})`;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fill();
      }

      animId = requestAnimationFrame(renderStars);
    };

    animId = requestAnimationFrame(renderStars);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animId);
    };
  }, []);

  // 30-40 Second Volumetric Aurora Borealis Canvas (Upper-Left Quadrant Spilling Diagonally)
  useEffect(() => {
    const canvas = auroraCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    let time = 0;

    const renderAurora = () => {
      time += 0.004; // 35 second organic flow cycle
      ctx.clearRect(0, 0, width, height);

      const px = parallaxRef.current.currentX * 0.5;
      const py = parallaxRef.current.currentY * 0.5;

      const globalBrightness = Math.sin(time * 0.8) * 0.12 + 0.88;

      // 6 Cinematic Aurora Ribbons spilling from Top-Left
      const ribbonConfigs = [
        { speed: 1.0, freq: 0.0018, amp: 90, color: 'rgba(0, 229, 255, ', alpha: 0.38, yOff: 80 },
        { speed: 0.8, freq: 0.0022, amp: 110, color: 'rgba(124, 77, 255, ', alpha: 0.34, yOff: 130 },
        { speed: 1.1, freq: 0.0015, amp: 100, color: 'rgba(217, 70, 239, ', alpha: 0.30, yOff: 180 },
        { speed: 0.7, freq: 0.0025, amp: 125, color: 'rgba(56, 189, 248, ', alpha: 0.28, yOff: 230 },
        { speed: 0.9, freq: 0.0020, amp: 85, color: 'rgba(168, 85, 247, ', alpha: 0.26, yOff: 280 },
        { speed: 0.6, freq: 0.0012, amp: 135, color: 'rgba(0, 229, 255, ', alpha: 0.22, yOff: 330 }
      ];

      for (let r = 0; r < ribbonConfigs.length; r++) {
        const cfg = ribbonConfigs[r];
        const phase = r * 0.4;
        const waveY = Math.sin(time * cfg.speed + phase) * 50 + cfg.yOff + py;

        ctx.beginPath();
        ctx.moveTo(-180 + px, -120);

        for (let x = -180 + px; x <= width * 0.8 + px; x += 25) {
          const sine1 = Math.sin(x * cfg.freq + time * cfg.speed + phase);
          const sine2 = Math.cos(x * (cfg.freq * 0.75) - time * 0.6);
          const y = waveY + (sine1 * sine2) * cfg.amp;
          ctx.lineTo(x, y);
        }

        ctx.lineTo(width * 0.8 + px, -120);
        ctx.closePath();

        const currentAlpha = cfg.alpha * globalBrightness;
        const grad = ctx.createLinearGradient(-100 + px, -100, width * 0.55 + px, height * 0.7 + py);
        grad.addColorStop(0, `${cfg.color}${currentAlpha})`);
        grad.addColorStop(0.4, `${cfg.color}${currentAlpha * 0.55})`);
        grad.addColorStop(1, 'rgba(3, 7, 18, 0)');

        ctx.fillStyle = grad;
        ctx.filter = `blur(${55 + r * 10}px)`;
        ctx.fill();
        ctx.filter = 'none';
      }

      animId = requestAnimationFrame(renderAurora);
    };

    animId = requestAnimationFrame(renderAurora);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animId);
    };
  }, []);

  return (
    <div ref={containerRef} className="relative min-h-screen w-full bg-[#030712] overflow-hidden text-slate-100 selection:bg-cyan-500/30">
      
      {/* Background Layer 1-3: Deep Navy #030712 / #050816 / #07111F */}
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
        <div className="absolute -top-[15%] -left-[10%] w-[65vw] h-[65vw] rounded-full bg-gradient-to-br from-[#07111F] via-[#050816] to-[#030712] blur-[120px]" />
        <div className="absolute top-[25%] -right-[15%] w-[55vw] h-[55vw] rounded-full bg-gradient-to-bl from-[#0B1025] via-[#050816] to-[#030712] blur-[120px]" />
      </div>

      {/* Tiny Star Particles Canvas */}
      <canvas ref={starCanvasRef} className="pointer-events-none absolute inset-0 z-0 w-full h-full opacity-60" />

      {/* Noise Texture Overlay (5%) */}
      <div 
        className="pointer-events-none absolute inset-0 z-0 opacity-[0.05] mix-blend-overlay"
        style={{
          backgroundImage: `radial-gradient(rgba(0, 229, 255, 0.9) 1px, transparent 1px)`,
          backgroundSize: '32px 32px'
        }}
      />

      {/* Hero Cinematic Volumetric Aurora Borealis Canvas */}
      <canvas ref={auroraCanvasRef} className="pointer-events-none absolute inset-0 z-0 w-full h-full opacity-90" />

      {/* Dynamic 60FPS Cursor Spotlight */}
      <div 
        ref={spotlightRef}
        className="pointer-events-none fixed top-0 left-0 w-[500px] h-[500px] rounded-full bg-radial-spotlight opacity-30 blur-[85px] z-0 will-change-transform"
        style={{ transform: 'translate3d(-500px, -500px, 0)' }}
      />

      {/* Main Content Stage */}
      <div className="relative z-10 w-full min-h-screen">
        {children}
      </div>

    </div>
  );
};
