'use client';

import { memo, useMemo } from 'react';
import { motion } from 'framer-motion';
import { formatDate } from '@/lib/dates';
import { Bell, BellOff } from 'lucide-react';
import Image from 'next/image';

interface HeaderProps {
  notificationPermission: NotificationPermission;
  onRequestNotification: () => void;
}

export const Header = memo(function Header({ notificationPermission, onRequestNotification }: HeaderProps) {
  const today = useMemo(() => new Date(), []);
  const formattedDate = useMemo(() => formatDate(today), [today]);

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <motion.div
            className="flex items-center gap-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            <motion.div
              animate={{
                y: [0, -3, 0],
              }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
              className="relative"
            >
              <Image
                src="/logo.png"
                alt="HabbitHero Logo"
                width={44}
                height={44}
                className="drop-shadow-[0_0_8px_rgba(139,92,246,0.5)]"
              />
            </motion.div>
            <h1 className="text-2xl font-bold text-gradient">
              HabbitHero
            </h1>
          </motion.div>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-white/50 text-sm mt-1 ml-14"
          >
            {formattedDate}
          </motion.p>
        </div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onRequestNotification}
          className={`p-3 rounded-xl transition-all ${
            notificationPermission === 'granted'
              ? 'bg-emerald-500/20 text-emerald-400 shadow-lg shadow-emerald-500/20'
              : 'glass text-white/50 hover:text-white/80'
          }`}
          title={
            notificationPermission === 'granted'
              ? 'Notifications enabled'
              : 'Enable notifications'
          }
        >
          {notificationPermission === 'granted' ? (
            <Bell className="w-5 h-5" />
          ) : (
            <BellOff className="w-5 h-5" />
          )}
        </motion.button>
      </div>
    </motion.header>
  );
});
