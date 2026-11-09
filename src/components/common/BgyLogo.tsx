import React from 'react';
import { motion } from 'motion/react';
import logoImage from '../../../bgylogo.png';

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
    sm: { height: 26, fontSize: 'text-lg', gap: 'gap-1.5', redDot: 4 },
    md: { height: 34, fontSize: 'text-2xl', gap: 'gap-2', redDot: 5 },
    lg: { height: 48, fontSize: 'text-4xl', gap: 'gap-3', redDot: 7 },
    xl: { height: 68, fontSize: 'text-6xl', gap: 'gap-4', redDot: 9 },
  };

  const current = sizeMap[size];

  return (
    <div className={`bgy-logo inline-flex flex-col items-start select-none ${className}`}>
      <motion.img
        src={logoImage}
        alt="BGY Footwear"
        className="block w-auto"
        style={{ height: current.height }}
        initial={animated ? { opacity: 0, scale: 0.96 } : false}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', stiffness: 260, damping: 22, delay: 0.08 }}
      />

      {showTagline && (
        <span className="text-[10px] uppercase tracking-[0.3em] text-neutral-400 font-sans mt-0.5 font-medium">
          Modern Footwear
        </span>
      )}
    </div>
  );
};
