import React, { useEffect, useRef } from 'react';

export const RadarGrid: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let angle = 0;
    let animationFrameId: number;

    const targets = [
      { r: 0.3, theta: 0.8, label: 'EMS Dispatch Unit #4' },
      { r: 0.6, theta: 2.4, label: 'AED Beacon Vault' },
      { r: 0.45, theta: 4.1, label: 'EchoAid Satellite Node 12' },
      { r: 0.75, theta: 5.5, label: 'Trauma Center Bay' },
    ];

    const render = () => {
      const width = canvas.width;
      const height = canvas.height;
      const cx = width / 2;
      const cy = height / 2;
      const radius = Math.min(width, height) / 2 - 15;

      ctx.clearRect(0, 0, width, height);

      // Outer rings
      ctx.strokeStyle = 'rgba(0, 240, 255, 0.15)';
      ctx.lineWidth = 1;

      [0.3, 0.6, 0.9].forEach((f) => {
        ctx.beginPath();
        ctx.arc(cx, cy, radius * f, 0, Math.PI * 2);
        ctx.stroke();
      });

      // Axis lines
      ctx.beginPath();
      ctx.moveTo(cx - radius, cy);
      ctx.lineTo(cx + radius, cy);
      ctx.moveTo(cx, cy - radius);
      ctx.lineTo(cx, cy + radius);
      ctx.stroke();

      // Sweep line
      angle += 0.02;
      if (angle > Math.PI * 2) angle = 0;

      const sweepGradient = ctx.createConicGradient(angle - Math.PI / 3, cx, cy);
      sweepGradient.addColorStop(0, 'rgba(0, 240, 255, 0.25)');
      sweepGradient.addColorStop(0.1, 'rgba(0, 240, 255, 0.05)');
      sweepGradient.addColorStop(1, 'transparent');

      ctx.fillStyle = sweepGradient;
      ctx.beginPath();
      ctx.arc(cx, cy, radius * 0.9, 0, Math.PI * 2);
      ctx.fill();

      // Radar line lead
      const lx = cx + Math.cos(angle) * (radius * 0.9);
      const ly = cy + Math.sin(angle) * (radius * 0.9);
      ctx.strokeStyle = 'rgba(0, 240, 255, 0.8)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(lx, ly);
      ctx.stroke();

      // Blips / Targets
      targets.forEach((t) => {
        const tx = cx + Math.cos(t.theta) * (radius * t.r);
        const ty = cy + Math.sin(t.theta) * (radius * t.r);

        ctx.fillStyle = '#00F0FF';
        ctx.shadowColor = '#00F0FF';
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(tx, ty, 3.5, 0, Math.PI * 2);
        ctx.fill();

        ctx.shadowBlur = 0;
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.font = '10px JetBrains Mono';
        ctx.fillText(t.label, tx + 6, ty + 3);
      });

      // Center pulse (User GPS Lock)
      ctx.fillStyle = '#FF003C';
      ctx.shadowColor = '#FF003C';
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.arc(cx, cy, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  return (
    <div className="relative flex items-center justify-center p-4">
      <canvas
        ref={canvasRef}
        width={340}
        height={340}
        className="w-full max-w-[340px] aspect-square rounded-full border border-cyan-500/20 bg-navy-900/60 shadow-[0_0_30px_rgba(0,240,255,0.15)] backdrop-blur-xl"
      />
    </div>
  );
};
