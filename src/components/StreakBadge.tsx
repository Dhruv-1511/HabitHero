'use client';

import { motion } from 'framer-motion';
import { Flame } from 'lucide-react';

interface StreakBadgeProps {
  streak: number;
}

export function StreakBadge({ streak }: StreakBadgeProps) {
  const isMilestone = streak === 7 || streak === 30 || streak === 100 || streak === 365;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex items-center gap-0.5"
    >
      <motion.div
        animate={{
          rotate: [0, -10, 10, -10, 0],
        }}
        transition={{
          duration: 0.5,
          repeat: Infinity,
          repeatDelay: 2,
        }}
      >
        <Flame
          className={`w-3 h-3 ${
            isMilestone ? 'text-orange-400 drop-shadow-[0_0_6px_rgba(251,146,60,0.6)]' : 'text-orange-400/70'
          }`}
        />
      </motion.div>
      <motion.span
        key={streak}
        initial={{ scale: 1.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className={`text-[10px] font-medium ${
          isMilestone ? 'text-orange-400' : 'text-white/50'
        }`}
      >
        {streak}
      </motion.span>
    </motion.div>
  );
}
