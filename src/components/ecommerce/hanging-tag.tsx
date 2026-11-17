"use client";

import type { ReactNode } from "react";
import { MotionConfig, motion } from "motion/react";
import { cn } from "@/lib/utils";

/**
 * Etiqueta que "cuelga" de su agujero y se asienta con un leve vaivén al cargar la página.
 * Con prefers-reduced-motion, MotionConfig salta la animación y la etiqueta aparece quieta.
 */
export function HangingTag({
  index,
  children,
  className,
}: {
  index: number;
  children: ReactNode;
  className?: string;
}) {
  return (
    <MotionConfig reducedMotion="user">
      <motion.span
        className={cn("inline-block", className)}
        style={{ transformOrigin: "16px 50%" }}
        initial={{ rotate: -14 }}
        animate={{ rotate: 0 }}
        transition={{ type: "spring", stiffness: 120, damping: 8, delay: 0.25 + index * 0.12 }}
      >
        {children}
      </motion.span>
    </MotionConfig>
  );
}
