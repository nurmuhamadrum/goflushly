import React from 'react';
import Svg, { Path, Circle, Rect } from 'react-native-svg';

export interface BristolIconProps {
  type: number;
  width?: number;
  height?: number;
}

export const BRISTOL_COLORS: Record<number, string> = {
  1: '#B85D19', // Brown pellets
  2: '#D97724', // Orange lumpy sausage
  3: '#72B02B', // Olive green cracked sausage
  4: '#16A34A', // Emerald green smooth snake
  5: '#0D9488', // Teal soft puffy blobs
  6: '#2563EB', // Blue fluffy mushy splatters
  7: '#6366F1', // Purple watery puddle
};

/**
 * Type 1: Hard separate lumps/pellets with gloss dots (#B85D19)
 */
export const BristolType1: React.FC<{ width?: number; height?: number }> = ({
  width = 46,
  height = 26,
}) => (
  <Svg width={width} height={height} viewBox="0 0 54 30" fill="none">
    {/* Pellet 1 (Bottom Left) */}
    <Circle cx="10" cy="18" r="5" fill="#B85D19" />
    <Circle cx="8.5" cy="16.5" r="1.3" fill="#FFFFFF" opacity={0.5} />

    {/* Pellet 2 (Top Left-Center) */}
    <Circle cx="18" cy="9" r="3.8" fill="#B85D19" />
    <Circle cx="16.8" cy="7.8" r="1" fill="#FFFFFF" opacity={0.5} />

    {/* Pellet 3 (Center Top) */}
    <Circle cx="26" cy="14" r="5.6" fill="#B85D19" />
    <Circle cx="24.2" cy="12.2" r="1.5" fill="#FFFFFF" opacity={0.5} />

    {/* Pellet 4 (Center Bottom) */}
    <Circle cx="20" cy="22" r="3.6" fill="#B85D19" />
    <Circle cx="18.9" cy="20.9" r="0.9" fill="#FFFFFF" opacity={0.5} />

    {/* Pellet 5 (Right) */}
    <Circle cx="37" cy="19" r="4.2" fill="#B85D19" />
    <Circle cx="35.6" cy="17.6" r="1.1" fill="#FFFFFF" opacity={0.5} />
  </Svg>
);

/**
 * Type 2: Sausage-shaped but lumpy with bumpy segments (#D97724)
 */
export const BristolType2: React.FC<{ width?: number; height?: number }> = ({
  width = 46,
  height = 26,
}) => (
  <Svg width={width} height={height} viewBox="0 0 54 30" fill="none">
    {/* Segmented Lumpy Sausage Silhouette */}
    <Circle cx="11" cy="16" r="6" fill="#D97724" />
    <Circle cx="18" cy="17" r="5.8" fill="#D97724" />
    <Circle cx="26" cy="15" r="6.2" fill="#D97724" />
    <Circle cx="34" cy="16" r="5.8" fill="#D97724" />
    <Circle cx="41" cy="17" r="5" fill="#D97724" />

    {/* Connecting body */}
    <Rect x="11" y="11.5" width="30" height="9" rx="4" fill="#D97724" />

    {/* Specular Highlights on segments */}
    <Circle cx="9.5" cy="13.5" r="1.5" fill="#FFFFFF" opacity={0.5} />
    <Circle cx="16.5" cy="14.5" r="1.3" fill="#FFFFFF" opacity={0.45} />
    <Circle cx="24.5" cy="12" r="1.6" fill="#FFFFFF" opacity={0.5} />
    <Circle cx="32.5" cy="13.5" r="1.4" fill="#FFFFFF" opacity={0.45} />
  </Svg>
);

/**
 * Type 3: Like a sausage with surface crack lines (#72B02B)
 */
export const BristolType3: React.FC<{ width?: number; height?: number }> = ({
  width = 46,
  height = 26,
}) => (
  <Svg width={width} height={height} viewBox="0 0 54 30" fill="none">
    {/* Smooth curved sausage body */}
    <Path
      d="M 10 16 C 18 12, 34 12, 44 16"
      stroke="#72B02B"
      strokeWidth="9"
      strokeLinecap="round"
      fill="none"
    />

    {/* Surface Cracks / Creases */}
    <Path
      d="M 19 10 L 21 15"
      stroke="#3D5A10"
      strokeWidth="1.8"
      strokeLinecap="round"
    />
    <Path
      d="M 27 9.5 L 28 15"
      stroke="#3D5A10"
      strokeWidth="1.8"
      strokeLinecap="round"
    />
    <Path
      d="M 35 10 L 36 15"
      stroke="#3D5A10"
      strokeWidth="1.8"
      strokeLinecap="round"
    />
  </Svg>
);

/**
 * Type 4: Like a sausage or snake, smooth and soft (#16A34A)
 */
export const BristolType4: React.FC<{ width?: number; height?: number }> = ({
  width = 46,
  height = 26,
}) => (
  <Svg width={width} height={height} viewBox="0 0 54 30" fill="none">
    {/* Smooth undulating snake/sausage */}
    <Path
      d="M 10 16 C 15 11, 22 10, 27 14 C 32 18, 38 18, 44 13"
      stroke="#16A34A"
      strokeWidth="8.5"
      strokeLinecap="round"
      fill="none"
    />

    {/* Glossy top ridge highlight */}
    <Path
      d="M 14 13 C 17 11, 21 11, 24 13"
      stroke="#FFFFFF"
      strokeWidth="1.6"
      strokeLinecap="round"
      opacity={0.5}
      fill="none"
    />
  </Svg>
);

/**
 * Type 5: Soft blobs with clear-cut edges (#0D9488)
 */
export const BristolType5: React.FC<{ width?: number; height?: number }> = ({
  width = 46,
  height = 26,
}) => (
  <Svg width={width} height={height} viewBox="0 0 54 30" fill="none">
    {/* Puffy soft cloud/blob cluster */}
    <Circle cx="13" cy="18" r="6" fill="#0D9488" />
    <Circle cx="26" cy="14" r="8" fill="#0D9488" />
    <Circle cx="39" cy="18" r="6" fill="#0D9488" />
    <Rect x="13" y="14" width="26" height="8" rx="4" fill="#0D9488" />

    {/* Gloss highlights */}
    <Circle cx="11.5" cy="15.5" r="1.3" fill="#FFFFFF" opacity={0.5} />
    <Circle cx="24.2" cy="11.5" r="1.8" fill="#FFFFFF" opacity={0.5} />
    <Circle cx="37.5" cy="15.5" r="1.3" fill="#FFFFFF" opacity={0.5} />
  </Svg>
);

/**
 * Type 6: Fluffy pieces with ragged edges, a mushy stool (#2563EB)
 */
export const BristolType6: React.FC<{ width?: number; height?: number }> = ({
  width = 46,
  height = 26,
}) => (
  <Svg width={width} height={height} viewBox="0 0 54 30" fill="none">
    {/* Fluffy mushy irregular droplets cluster */}
    <Circle cx="11" cy="18" r="5" fill="#2563EB" />
    <Circle cx="17" cy="13" r="4.2" fill="#2563EB" />
    <Circle cx="23" cy="17" r="5.2" fill="#2563EB" />
    <Circle cx="29" cy="13" r="4.5" fill="#2563EB" />
    <Circle cx="35" cy="18" r="5.2" fill="#2563EB" />
    <Circle cx="42" cy="14" r="4.2" fill="#2563EB" />
    <Rect x="12" y="14" width="28" height="6" rx="3" fill="#2563EB" />
  </Svg>
);

/**
 * Type 7: Watery, entirely liquid puddle with splash droplets (#6366F1)
 */
export const BristolType7: React.FC<{ width?: number; height?: number }> = ({
  width = 46,
  height = 26,
}) => (
  <Svg width={width} height={height} viewBox="0 0 54 30" fill="none">
    {/* Floating Splash Droplets */}
    <Circle cx="16" cy="8.5" r="2.2" fill="#6366F1" />
    <Circle cx="38" cy="7" r="1.7" fill="#6366F1" />

    {/* Liquid puddle with wavy top and flat curved bottom */}
    <Path
      d="M 8 19 C 13 17, 18 20, 23 18 C 28 16, 33 20, 38 18 C 42 16.5, 45 18, 47 17.5 L 45 22.5 C 40 25, 15 25, 8 22.5 Z"
      fill="#6366F1"
    />

    {/* Soft wavy crest reflection */}
    <Path
      d="M 12 18.5 C 16 17.5, 20 19.5, 24 18 C 28 17, 32 19, 36 18"
      stroke="#FFFFFF"
      strokeWidth="1.2"
      strokeLinecap="round"
      opacity={0.4}
    />
  </Svg>
);

/**
 * Dynamic Bristol Stool Icon Selector (Types 1 to 7)
 */
export const BristolStoolIcon: React.FC<BristolIconProps> = ({
  type,
  width = 46,
  height = 26,
}) => {
  switch (type) {
    case 1:
      return <BristolType1 width={width} height={height} />;
    case 2:
      return <BristolType2 width={width} height={height} />;
    case 3:
      return <BristolType3 width={width} height={height} />;
    case 4:
      return <BristolType4 width={width} height={height} />;
    case 5:
      return <BristolType5 width={width} height={height} />;
    case 6:
      return <BristolType6 width={width} height={height} />;
    case 7:
      return <BristolType7 width={width} height={height} />;
    default:
      return <BristolType4 width={width} height={height} />;
  }
};
