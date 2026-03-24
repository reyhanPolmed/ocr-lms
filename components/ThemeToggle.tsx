"use client";

import { motion } from "framer-motion";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "./ThemeProvider";

/**
 * ThemeToggle — Glassmorphic pill-style toggle for dark/light mode
 */
export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <motion.button
      onClick={toggleTheme}
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.95 }}
      className="glass fixed top-5 right-5 z-50 flex items-center gap-2 rounded-full px-4 py-2.5 cursor-pointer
                 text-foreground/80 hover:text-foreground transition-colors"
      aria-label="Toggle theme"
    >
      {theme === "dark" ? (
        <>
          <Sun size={16} className="text-amber-400" />
          <span className="text-xs font-medium tracking-wide">Light</span>
        </>
      ) : (
        <>
          <Moon size={16} className="text-indigo-400" />
          <span className="text-xs font-medium tracking-wide">Dark</span>
        </>
      )}
    </motion.button>
  );
}
