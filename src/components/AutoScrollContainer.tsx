import React from 'react';
import { motion } from 'motion/react';

interface AutoScrollContainerProps {
  children: React.ReactNode;
  speed?: number;
  pauseOnHover?: boolean;
}

export function AutoScrollContainer({ 
  children, 
  speed = 40, 
  pauseOnHover = true 
}: AutoScrollContainerProps) {
  return (
    <div className="overflow-hidden relative w-full">
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-8 bg-gradient-to-r from-slate-950 via-slate-950/90 to-transparent sm:w-12 md:w-20" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-8 bg-gradient-to-l from-slate-950 via-slate-950/90 to-transparent sm:w-12 md:w-20" />
      
      <motion.div
        className="flex gap-2 py-2 sm:gap-4 sm:py-3 md:gap-8 md:py-4"
        animate={{
          x: ["0%", "-50%"],
        }}
        transition={{
          x: {
            repeat: Infinity,
            repeatType: "loop",
            duration: speed,
            ease: "linear",
          },
        }}
        style={{ width: "fit-content" }}
        whileHover={pauseOnHover ? { animationPlayState: "paused" } : undefined}
      >
        <div className="flex min-w-max gap-2 sm:gap-4 md:gap-8">
          {children}
        </div>
        <div className="flex min-w-max gap-2 sm:gap-4 md:gap-8" aria-hidden="true">
          {children}
        </div>
      </motion.div>
    </div>
  );
}
