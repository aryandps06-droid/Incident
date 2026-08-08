import React, { useEffect, useRef } from 'react';

interface VoiceWaveformProps {
  active?: boolean;
  color?: string;
  barCount?: number;
  height?: number;
}

export const VoiceWaveform: React.FC<VoiceWaveformProps> = ({
  active = true,
  color = '#4F8CFF',
  barCount = 36,
  height = 40
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let phase = 0;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const width = canvas.width;
      const barWidth = width / barCount - 3;

      phase += 0.08;

      for (let i = 0; i < barCount; i++) {
        let barHeight = 4;
        if (active) {
          const sine = Math.sin(phase + i * 0.25);
          const cos = Math.cos(phase * 0.8 + i * 0.15);
          barHeight = Math.abs(sine * cos) * (canvas.height - 8) + 6;
        }

        const x = i * (barWidth + 3);
        const y = (canvas.height - barHeight) / 2;

        const gradient = ctx.createLinearGradient(0, y, 0, y + barHeight);
        gradient.addColorStop(0, color);
        gradient.addColorStop(1, 'rgba(79, 140, 255, 0.15)');

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.roundRect(x, y, barWidth, barHeight, 3);
        ctx.fill();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => cancelAnimationFrame(animationFrameId);
  }, [active, color, barCount]);

  return (
    <canvas
      ref={canvasRef}
      width={320}
      height={height}
      className="w-full max-w-[320px] opacity-90 mx-auto"
    />
  );
};
