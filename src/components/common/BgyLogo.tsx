import React from 'react';
import { motion } from 'motion/react';

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
      <svg
        role="img"
        aria-label="BGY Footwear"
        viewBox="0 0 1174 444"
        className="block w-auto"
        style={{ height: current.height }}
        xmlns="http://www.w3.org/2000/svg"
      >
        <g fill="#050505">
          <path d="M8 239 294 207 270 226 24 249 292 245 274 263 34 279 287 283 267 300 58 309 285 323 265 340 142 350 174 276 194 255Z" />
          <path d="M632 256 817 256 801 282 620 282Z" />
        </g>
        <motion.g
          className="bgy-letter"
          initial={animated ? { opacity: 0, x: -18 } : false}
          animate={{ opacity: 1, x: 0 }}
          transition={{ type: 'spring', stiffness: 260, damping: 22, delay: 0.08 }}
        >
          <text x="128" y="350" textLength="280" lengthAdjust="spacingAndGlyphs" fontFamily="Arial, Helvetica, sans-serif" fontSize="292" fontStyle="italic" fontWeight="900">B</text>
        </motion.g>
        <motion.g
          className="bgy-letter"
          initial={animated ? { opacity: 0, y: -14 } : false}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 260, damping: 22, delay: 0.2 }}
        >
          <text x="405" y="350" textLength="285" lengthAdjust="spacingAndGlyphs" fontFamily="Arial, Helvetica, sans-serif" fontSize="292" fontStyle="italic" fontWeight="900">G</text>
        </motion.g>
        <motion.g
          className="bgy-letter"
          initial={animated ? { opacity: 0, x: 18 } : false}
          animate={{ opacity: 1, x: 0 }}
          transition={{ type: 'spring', stiffness: 260, damping: 22, delay: 0.32 }}
        >
          <text x="690" y="350" textLength="320" lengthAdjust="spacingAndGlyphs" fontFamily="Arial, Helvetica, sans-serif" fontSize="292" fontStyle="italic" fontWeight="900">Y</text>
        </motion.g>
        <motion.g
          initial={animated ? { opacity: 0, scale: 0.82 } : false}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', stiffness: 220, damping: 18, delay: 0.36 }}
          style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
        >
          <path d="M213 285c17-17 42-22 70-32 31-11 60-33 82-57 12-13 22-20 33-18 10 2 17 13 21 29 5 17 14 29 28 42 13 13 18 27 9 39-9 13-27 21-53 26l-127 26c-31 6-59 2-75-11-17-14-10-31 12-44Z" fill="#fff" stroke="#050505" strokeWidth="12" strokeLinejoin="round" />
          <path d="M220 306c43 12 96 4 151-11l75-20c8 7 11 15 7 23-8 13-27 21-53 26l-127 26c-31 6-59 2-75-11-11-9-13-20-4-30Z" fill="#050505" stroke="#050505" strokeWidth="7" strokeLinejoin="round" />
          <path d="M278 274c30-8 54-22 77-46 16-16 29-29 40-30 9 0 15 13 19 29 4 15 14 28 28 41l-79 22c-31 9-64 17-92 14-14-1-20-13 7-30Z" fill="#050505" />
          <path d="m347 241 18 11m-2-26 20 12m-1-26 19 13m-2-25 16 15" fill="none" stroke="#fff" strokeWidth="9" strokeLinecap="round" />
          <path d="M225 316c51 12 104 3 163-13l53-14" fill="none" stroke="#fff" strokeWidth="7" strokeLinecap="round" />
        </motion.g>
        <motion.circle
          cx="1114"
          cy="205"
          r="32"
          fill="#f20d16"
          initial={animated ? { opacity: 0, scale: 0 } : false}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', stiffness: 320, damping: 14, delay: 0.52 }}
          style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
        />
      </svg>

      {showTagline && (
        <span className="text-[10px] uppercase tracking-[0.3em] text-neutral-400 font-sans mt-0.5 font-medium">
          Modern Footwear
        </span>
      )}
    </div>
  );
};
