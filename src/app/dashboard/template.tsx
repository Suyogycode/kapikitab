"use client";

import React from 'react';
import { motion } from 'framer-motion';

export default function DashboardTemplate({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      // We removed the 'exit' prop because Next.js handles the unmounting cleanly here
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="h-full w-full"
    >
      {children}
    </motion.div>
  );
}