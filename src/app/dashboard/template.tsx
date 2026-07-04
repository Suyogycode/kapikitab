"use client";

import React from 'react';
import { motion } from 'framer-motion';

export default function DashboardTemplate({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }} // Smoother, natural easing curve
      className="h-full w-full"
    >
      {children}
    </motion.div>
  );
}