"use client";

import { motion } from "framer-motion";

/**
 * LoadingSpinner — Glassmorphic loading overlay with pulsing ring
 */
export function LoadingSpinner() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="flex flex-col items-center gap-6 py-12"
    >
      {/* Glass spinner container */}
      <div className="relative">
        {/* Outer glow ring */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-teal to-purple blur-xl opacity-30 animate-pulse-glow" />

        {/* Spinner ring */}
        <div className="relative w-20 h-20 glass rounded-full flex items-center justify-center">
          <svg className="w-16 h-16 animate-spin-slow" viewBox="0 0 64 64">
            <circle
              cx="32"
              cy="32"
              r="28"
              fill="none"
              stroke="url(#gradient)"
              strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray="120"
              strokeDashoffset="40"
            />
            <defs>
              <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#14b8a6" />
                <stop offset="100%" stopColor="#a855f7" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      </div>

      {/* Status text */}
      <div className="text-center space-y-1">
        <p className="text-foreground/90 font-medium text-base animate-pulse-glow">
          Memproses gambar...
        </p>
        <p className="text-muted text-sm">
          AI sedang mengenali teks dalam gambar Anda
        </p>
      </div>
    </motion.div>
  );
}
