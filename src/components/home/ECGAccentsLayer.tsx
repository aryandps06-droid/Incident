import React from 'react';

const ECGAccentsLayerComponent: React.FC = () => {
  return (
    <div className="pointer-events-none absolute inset-0 z-4 overflow-hidden select-none">
      {/* ─── LEFT SIDE ECG PULSE ACCENTS ─── */}
      
      {/* Left Top Accent 1: Small Cyan Glowing ECG Pulse (Near Headline) */}
      <div className="animate-ecg-heartbeat absolute top-28 left-4 w-32 h-8 opacity-70">
        <svg viewBox="0 0 140 30" className="w-full h-full stroke-[#00E5FF] fill-none">
          <path
            d="M 0 15 L 25 15 L 30 6 L 36 24 L 42 3 L 48 20 L 54 15 L 140 15"
            strokeWidth="2"
            strokeLinecap="round"
            className="filter drop-shadow-[0_0_8px_#00E5FF]"
          />
        </svg>
      </div>

      {/* Left Accent 2: Small Dim Faint Pink ECG Line (Below Subtext) */}
      <div className="absolute top-[36%] left-8 w-28 h-6 opacity-35">
        <svg viewBox="0 0 140 30" className="w-full h-full stroke-[#D946EF] fill-none">
          <path
            d="M 0 15 L 40 15 L 45 8 L 50 22 L 55 15 L 140 15"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      </div>

      {/* Left Bottom Accent 3: Tiny Faint Cyan Pulse Line (Near Action Cards) */}
      <div className="absolute bottom-24 left-6 w-24 h-6 opacity-40">
        <svg viewBox="0 0 140 30" className="w-full h-full stroke-[#00E5FF] fill-none">
          <path
            d="M 0 15 L 30 15 L 34 10 L 38 20 L 42 15 L 140 15"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      </div>

      {/* ─── RIGHT SIDE ECG PULSE ACCENTS (As shown in user's image) ─── */}
      
      {/* Right Top Accent 1: Large Glowing Pink ECG Heartbeat Line */}
      <div className="animate-ecg-heartbeat absolute top-[28%] right-6 lg:right-12 w-48 h-14">
        <svg viewBox="0 0 140 30" className="w-full h-full stroke-[#D946EF] fill-none">
          <path
            d="M 0 15 L 30 15 L 35 5 L 42 25 L 50 2 L 58 22 L 64 15 L 140 15"
            strokeWidth="2.8"
            strokeLinecap="round"
            className="filter drop-shadow-[0_0_14px_#D946EF]"
          />
        </svg>
      </div>

      {/* Right Bottom Accent 2: Smaller Faint Pink ECG Line */}
      <div className="absolute bottom-20 right-10 lg:right-16 w-36 h-10 opacity-60">
        <svg viewBox="0 0 140 30" className="w-full h-full stroke-[#D946EF] fill-none">
          <path
            d="M 0 15 L 35 15 L 40 8 L 46 22 L 52 15 L 140 15"
            strokeWidth="2"
            strokeLinecap="round"
            className="filter drop-shadow-[0_0_6px_#D946EF]"
          />
        </svg>
      </div>
    </div>
  );
};


export const ECGAccentsLayer = React.memo(ECGAccentsLayerComponent);
