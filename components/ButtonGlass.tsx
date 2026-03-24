"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { type ButtonHTMLAttributes, forwardRef } from "react";

interface ButtonGlassProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "teal" | "purple" | "outline";
}

/**
 * ButtonGlass — Premium glassmorphic button with variants
 */
export const ButtonGlass = forwardRef<HTMLButtonElement, ButtonGlassProps>(
  ({ children, className, variant = "default", ...props }, ref) => {
    const variantClasses = {
      default: "glass hover:bg-surface-hover",
      teal: "bg-teal/15 border border-teal/30 text-teal hover:bg-teal/25",
      purple: "bg-purple/15 border border-purple/30 text-purple hover:bg-purple/25",
      outline:
        "border border-border-custom bg-transparent hover:bg-surface text-foreground/70 hover:text-foreground",
    };

    return (
      <motion.button
        ref={ref}
        whileHover={{ scale: 1.03, y: -1 }}
        whileTap={{ scale: 0.97 }}
        className={cn(
          "inline-flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-medium",
          "transition-colors cursor-pointer backdrop-blur-md",
          variantClasses[variant],
          className
        )}
        {...(props as React.ComponentPropsWithoutRef<typeof motion.button>)}
      >
        {children}
      </motion.button>
    );
  }
);

ButtonGlass.displayName = "ButtonGlass";
