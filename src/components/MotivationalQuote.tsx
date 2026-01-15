'use client';

import { motion } from 'framer-motion';
import { Quote, RefreshCw } from 'lucide-react';
import { MOTIVATIONAL_QUOTES } from '@/types/habit';
import { useState, useEffect } from 'react';

export function MotivationalQuote() {
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    // Set initial quote based on the day
    const today = new Date();
    const dayOfYear = Math.floor(
      (today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 86400000
    );
    setQuoteIndex(dayOfYear % MOTIVATIONAL_QUOTES.length);
  }, []);

  const refreshQuote = () => {
    setIsAnimating(true);
    setTimeout(() => {
      setQuoteIndex((prev) => (prev + 1) % MOTIVATIONAL_QUOTES.length);
      setIsAnimating(false);
    }, 200);
  };

  const quote = MOTIVATIONAL_QUOTES[quoteIndex];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass rounded-2xl p-5 mb-6 relative overflow-hidden"
    >
      {/* Decorative gradient */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-violet-500/20 to-transparent rounded-full blur-2xl" />

      <div className="flex items-start gap-3 relative">
        <div className="p-2 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 shadow-lg shadow-violet-500/30 shrink-0">
          <Quote className="w-4 h-4 text-white" />
        </div>

        <motion.div
          key={quoteIndex}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: isAnimating ? 0 : 1, x: isAnimating ? -20 : 0 }}
          transition={{ duration: 0.2 }}
          className="flex-1"
        >
          <p className="text-white/90 text-sm leading-relaxed mb-2">
            "{quote.quote}"
          </p>
          <p className="text-white/40 text-xs">— {quote.author}</p>
        </motion.div>

        <motion.button
          whileHover={{ scale: 1.1, rotate: 180 }}
          whileTap={{ scale: 0.9 }}
          onClick={refreshQuote}
          className="p-2 rounded-lg hover:bg-white/10 transition-colors shrink-0"
        >
          <RefreshCw className="w-4 h-4 text-white/40" />
        </motion.button>
      </div>
    </motion.div>
  );
}
