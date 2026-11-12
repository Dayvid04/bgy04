import React from 'react';
import { motion } from 'motion/react';

const logoImage = '/bgy-logo-transparent.png';

interface BgyLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  animated?: boolean;
  className?: string;
  showTagline?: boolean;
}

export const BgyLogo: React.FC<BgyLogoProps> = ({
  size = 'md',
  animated = true,
  className = '',
  showTagline = false,
}) => {
  const sizeMap = {
    sm: { height: 26 },
    md: { height: 34 },
    lg: { height: 48 },
    xl: { height: 68 },
  };

  const current = sizeMap[size];
  const [hoveredSegment, setHoveredSegment] = React.useState<'b' | 'g' | 'y' | 'dot' | null>(null);
  const hoverSegments = {
    b: { start: 0, end: 0.46 },
    g: { start: 0.46, end: 0.73 },
    y: { start: 0.73, end: 0.95 },
    dot: { start: 0.95, end: 1 },
  };
  const activeSegment = hoveredSegment ? hoverSegments[hoveredSegment] : null;

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const bounds = event.currentTarget.getBoundingClientRect();
    const position = (event.clientX - bounds.left) / bounds.width;
    setHoveredSegment(position < 0.46 ? 'b' : position < 0.73 ? 'g' : position < 0.95 ? 'y' : 'dot');
  };

  return (
    <div className={`bgy-logo inline-flex flex-col items-start select-none ${className}`}>
      <motion.div
        className="bgy-logo-art relative inline-block"
        style={{ height: current.height }}
        initial={animated ? { opacity: 0, scale: 0.96 } : false}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', stiffness: 260, damping: 22, delay: 0.08 }}
        whileHover={{ scale: 1.04, y: -2 }}
        whileTap={{ scale: 0.97 }}
        onPointerMove={handlePointerMove}
        onPointerLeave={() => setHoveredSegment(null)}
      >
        <img
          src={logoImage}
          alt="BGY Footwear"
          className="bgy-logo-image block w-auto"
          style={{ height: current.height }}
          draggable={false}
        />
        {activeSegment && (
          <img
            src={logoImage}
            alt=""
            aria-hidden="true"
            className="bgy-logo-image bgy-logo-hover-overlay block w-auto"
            style={{
              height: current.height,
              clipPath: `inset(0 ${(1 - activeSegment.end) * 100}% 0 ${activeSegment.start * 100}%)`,
            }}
          />
        )}
        <img
          src={logoImage}
          alt=""
          aria-hidden="true"
          className="bgy-logo-dot block w-auto"
          style={{ height: current.height }}
          draggable={false}
        />
      </motion.div>

      {showTagline && (
        <span className="text-[10px] uppercase tracking-[0.3em] text-neutral-400 font-sans mt-0.5 font-medium">
          Modern Footwear
        </span>
      )}
    </div>
  );
};
