import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BgyLogo } from './BgyLogo';

interface IntroShoeDropProps {
  onComplete: () => void;
}

export const IntroShoeDrop: React.FC<IntroShoeDropProps> = ({ onComplete }) => {
  const [phase, setPhase] = useState<'dropping' | 'settled' | 'logo' | 'fading'>('dropping');

  useEffect(() => {
    // Sequence timing
    const t1 = setTimeout(() => setPhase('settled'), 1200);
    const t2 = setTimeout(() => setPhase('logo'), 2000);
    const t3 = setTimeout(() => setPhase('fading'), 3800);
    const t4 = setTimeout(() => onComplete(), 4500);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, [onComplete]);

  return (
    <AnimatePresence>
      {phase !== 'fading' && (
        <motion.div
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#050505] text-white overflow-hidden select-none"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } }}
        >
          {/* Subtle noise and radial background lighting */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(30,30,30,0.6)_0%,rgba(5,5,5,1)_80%)] pointer-events-none" />

          {/* Skip Button */}
          <button
            onClick={onComplete}
            className="absolute top-8 right-8 z-30 text-xs font-sans uppercase tracking-[0.25em] text-neutral-400 hover:text-white px-4 py-2 border border-neutral-800 hover:border-neutral-500 rounded-full transition-all duration-300"
          >
            Skip Intro
          </button>

          {/* Massive Oversized subtle BGY wordmark behind the shoe */}
          <motion.div
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: phase === 'dropping' ? 0.08 : 0.15, scale: 1 }}
            transition={{ duration: 1.4, ease: 'easeOut' }}
          >
            <span className="font-display font-black text-[22vw] leading-none tracking-tighter text-white opacity-20 select-none">
              BGY
            </span>
          </motion.div>

          {/* Central Shoe Stage */}
          <div className="relative z-10 flex flex-col items-center justify-center w-full max-w-2xl px-6">
            {/* The Dropping Shoe with realistic physics & rotation */}
            <motion.div
              className="relative cursor-pointer"
              initial={{ y: -650, rotate: -22, scale: 1.15, opacity: 0 }}
              animate={{
                y: 0,
                rotate: -6,
                scale: 1,
                opacity: 1,
              }}
              transition={{
                type: 'spring',
                stiffness: 85,
                damping: 14,
                mass: 1.2,
                duration: 1.4,
              }}
            >
              <img
                src="https://images.unsplash.com/photo-1552346154-21d32810aba3?q=80&w=1200&auto=format&fit=crop"
                alt="BGY Flagship Aero-1"
                className="w-[340px] sm:w-[480px] md:w-[560px] h-auto object-contain drop-shadow-[0_25px_35px_rgba(0,0,0,0.9)] filter contrast-[1.05]"
              />

              {/* Red Laser Alignment Accent Line */}
              <motion.div
                className="absolute top-1/2 -left-10 w-6 h-[1px] bg-[#E50914]"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: 1.5, duration: 0.4 }}
              />
            </motion.div>

            {/* Dynamic Contact Shadow that grows as the shoe touches down */}
            <motion.div
              className="w-64 sm:w-96 h-8 bg-black/80 rounded-[100%] blur-xl -mt-6 pointer-events-none"
              initial={{ scale: 0.2, opacity: 0 }}
              animate={{ scale: 1, opacity: 0.9 }}
              transition={{ duration: 1.2, ease: 'easeOut' }}
            />

            {/* BGY Transitioning Logo Reveal: B -> G -> Y */}
            <div className="h-20 flex flex-col items-center justify-center mt-6">
              {phase !== 'dropping' && (
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                  className="flex flex-col items-center"
                >
                  <BgyLogo size="lg" showTagline={true} />
                  <motion.p
                    className="text-xs uppercase tracking-[0.3em] text-neutral-400 mt-2 font-mono"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 }}
                  >
                    Modern Footwear. Distinct Identity.
                  </motion.p>
                </motion.div>
              )}
            </div>
          </div>

          {/* Minimal Bottom Bar */}
          <div className="absolute bottom-8 left-8 right-8 flex justify-between items-center text-[10px] tracking-[0.2em] uppercase font-mono text-neutral-400 border-t border-neutral-900 pt-3">
            <span>BGY LABS / AUTUMN EDITION</span>
            <span className="text-[#E50914] flex items-center gap-1.5">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#E50914] animate-pulse"></span>
              INITIALIZING EXPERIENCE
            </span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
