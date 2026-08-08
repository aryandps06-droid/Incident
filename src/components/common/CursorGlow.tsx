import React, { useEffect, useRef, useCallback } from 'react';

export const CursorGlow: React.FC = () => {
  const glowRef = useRef<HTMLDivElement>(null);
  const trailRef = useRef<HTMLDivElement>(null);
  const posRef = useRef({ x: -200, y: -200 });
  const targetRef = useRef({ x: -200, y: -200 });
  const rafRef = useRef<number>(0);
  const isHoveringInteractive = useRef(false);

  const animate = useCallback(() => {
    const lerp = 0.12;
    posRef.current.x += (targetRef.current.x - posRef.current.x) * lerp;
    posRef.current.y += (targetRef.current.y - posRef.current.y) * lerp;

    if (glowRef.current) {
      glowRef.current.style.transform = `translate(${posRef.current.x - 20}px, ${posRef.current.y - 20}px)`;
    }
    if (trailRef.current) {
      trailRef.current.style.transform = `translate(${posRef.current.x - 6}px, ${posRef.current.y - 6}px)`;
    }

    rafRef.current = requestAnimationFrame(animate);
  }, []);

  useEffect(() => {
    const handleMove = (e: MouseEvent) => {
      targetRef.current = { x: e.clientX, y: e.clientY };

      const el = e.target as HTMLElement;
      const interactive = el.closest('button, a, input, [role="button"], [tabindex]');
      isHoveringInteractive.current = !!interactive;

      if (glowRef.current) {
        const size = interactive ? '48px' : '40px';
        glowRef.current.style.width = size;
        glowRef.current.style.height = size;
        glowRef.current.style.background = interactive
          ? 'radial-gradient(circle, rgba(0,229,255,0.35) 0%, transparent 70%)'
          : 'radial-gradient(circle, rgba(0,229,255,0.18) 0%, transparent 70%)';
      }
    };

    const handleClick = (e: MouseEvent) => {
      const ripple = document.createElement('div');
      ripple.style.cssText = `
        position: fixed;
        left: ${e.clientX - 20}px;
        top: ${e.clientY - 20}px;
        width: 40px; height: 40px;
        border-radius: 50%;
        background: radial-gradient(circle, rgba(0,229,255,0.5) 0%, transparent 70%);
        pointer-events: none;
        z-index: 9998;
        animation: ripple-out 0.6s ease-out forwards;
      `;
      document.body.appendChild(ripple);
      setTimeout(() => ripple.remove(), 700);
    };

    rafRef.current = requestAnimationFrame(animate);
    window.addEventListener('mousemove', handleMove, { passive: true });
    window.addEventListener('click', handleClick, { passive: true });

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('click', handleClick);
    };
  }, [animate]);

  // Don't render on touch devices
  if (typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches) {
    return null;
  }

  return (
    <>
      {/* Outer glow blob */}
      <div
        ref={glowRef}
        className="cursor-glow"
        style={{
          width: '40px',
          height: '40px',
          background: 'radial-gradient(circle, rgba(0,229,255,0.18) 0%, transparent 70%)',
          willChange: 'transform',
        }}
        aria-hidden="true"
      />
      {/* Inner sharp dot */}
      <div
        ref={trailRef}
        style={{
          position: 'fixed',
          width: '12px',
          height: '12px',
          borderRadius: '50%',
          background: 'rgba(0,229,255,0.7)',
          pointerEvents: 'none',
          zIndex: 9999,
          willChange: 'transform',
          boxShadow: '0 0 8px rgba(0,229,255,0.8)',
        }}
        aria-hidden="true"
      />
    </>
  );
};
