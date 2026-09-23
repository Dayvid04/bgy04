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
    <div className={`inline-flex flex-col items-start select-none ${className}`}>
      <div className={`flex items-center ${current.gap} font-display font-black tracking-tighter`}>
        {/* B */}
        <motion.div
          className="relative flex items-center justify-center text-white"
          initial={animated ? { opacity: 0, x: -10 } : false}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <span className={`${current.fontSize} tracking-tighter font-extrabold hover:text-[#E50914] transition-colors duration-300`}>
            B
          </span>
        </motion.div>

        {/* G */}
        <motion.div
          className="relative flex items-center justify-center text-white"
          initial={animated ? { opacity: 0, y: -6 } : false}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.45 }}
        >
          <span className={`${current.fontSize} tracking-tighter font-extrabold hover:text-[#E50914] transition-colors duration-300`}>
            G
          </span>
        </motion.div>

        {/* Y */}
        <motion.div
          className="relative flex items-center justify-center text-white"
          initial={animated ? { opacity: 0, x: 10 } : false}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.75 }}
        >
          <span className={`${current.fontSize} tracking-tighter font-extrabold hover:text-[#E50914] transition-colors duration-300`}>
            Y
          </span>
          {/* Subtle signature red dot after Y */}
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#E50914] ml-1 mb-2"></span>
        </motion.div>
      </div>

      {showTagline && (
        <span className="text-[10px] uppercase tracking-[0.3em] text-neutral-400 font-sans mt-0.5 font-medium">
          Modern Footwear
        </span>
      )}
    </div>
  );
};
