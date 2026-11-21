import React from 'react';

interface MascotProps {
  className?: string;
  size?: number | string;
  animate?: boolean;
}

export const MrPlopSVG: React.FC<MascotProps> = ({ className = 'w-full h-full' }) => (
  <img
    src="/mascots/mr-plop.png"
    alt="Mr. Plop"
    draggable={false}
    className={`${className} object-contain select-none pointer-events-none drop-shadow-sm`}
  />
);

export const LilDripSVG: React.FC<MascotProps> = ({ className = 'w-full h-full' }) => (
  <img
    src="/mascots/lil-drip.png"
    alt="Lil' Drip"
    draggable={false}
    className={`${className} object-contain select-none pointer-events-none drop-shadow-sm`}
  />
);

export const SirFlushSVG: React.FC<MascotProps> = ({ className = 'w-full h-full' }) => (
  <img
    src="/mascots/sir-flush.png"
    alt="Sir Flush"
    draggable={false}
    className={`${className} object-contain select-none pointer-events-none drop-shadow-sm`}
  />
);
