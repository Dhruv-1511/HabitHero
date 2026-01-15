'use client';

import { motion } from 'framer-motion';

const colors = ['#10B981', '#8B5CF6', '#F59E0B', '#EC4899', '#3B82F6'];

export function Confetti() {
  const particles = Array.from({ length: 12 }, (_, i) => ({
    id: i,
    color: colors[i % colors.length],
    x: (Math.random() - 0.5) * 200,
    y: (Math.random() - 0.5) * 200 - 50,
    rotation: Math.random() * 360,
    scale: 0.5 + Math.random() * 0.5,
  }));

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute left-1/2 top-1/2 w-2 h-2 rounded-full"
          style={{ backgroundColor: particle.color }}
          initial={{
            x: 0,
            y: 0,
            scale: 0,
            opacity: 1,
          }}
          animate={{
            x: particle.x,
            y: particle.y,
            scale: particle.scale,
            opacity: 0,
            rotate: particle.rotation,
          }}
          transition={{
            duration: 0.8,
            ease: 'easeOut',
          }}
        />
      ))}
    </div>
  );
}
