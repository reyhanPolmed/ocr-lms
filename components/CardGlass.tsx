"use client";

import { cn } from "@/lib/utils";
import { motion, type HTMLMotionProps } from "framer-motion";
import { forwardRef, type ReactNode } from "react";

interface CardGlassProps extends HTMLMotionProps<"div"> {
  children: ReactNode;
  className?: string;
  strong?: boolean;
}

/**
 * CardGlass — Glassmorphic card with optional strong blur
 */
export const CardGlass = forwardRef<HTMLDivElement, CardGlassProps>(
  ({ children, className, strong = false, ...props }, ref) => {
    return (
      <motion.div
        ref={ref}
        className={cn(
          strong ? "glass-strong" : "glass",
          "rounded-2xl p-6",
          className
        )}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);

CardGlass.displayName = "CardGlass";
