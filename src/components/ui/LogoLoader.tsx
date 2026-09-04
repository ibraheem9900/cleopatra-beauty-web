"use client";

import { motion, useReducedMotion } from "framer-motion";
import CrownIcon from "./CrownIcon";

export default function LogoLoader() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <div className="flex flex-col items-center select-none px-6">
      {/* Animated emblem — crown inside a slowly rotating dashed gold ring */}
      <div className="relative w-24 h-24 sm:w-28 sm:h-28 mb-6">
        {!shouldReduceMotion && (
          <motion.div
            className="absolute inset-0 rounded-full border-2 border-dashed border-gold/40"
            animate={{ rotate: 360 }}
            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
            aria-hidden="true"
          />
        )}
        <div className="absolute inset-2 rounded-full bg-gold/10 border border-gold/20" />
        <motion.div
          className="absolute inset-0 flex items-center justify-center text-gold"
          animate={shouldReduceMotion ? {} : { scale: [1, 1.08, 1] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
        >
          <CrownIcon className="w-10 h-10 sm:w-12 sm:h-12" />
        </motion.div>
      </div>

      {/* Wordmark */}
      <div className="font-serif text-2xl sm:text-3xl font-semibold tracking-[0.3em] text-foreground">
        CLEOPATRA
      </div>
      <div className="text-[10px] tracking-[0.4em] uppercase text-muted mt-2">
        Timeless Beauty
      </div>

      {/* Loader bar */}
      <div
        className="w-44 sm:w-52 h-[3px] rounded-full bg-warm-beige mt-8 overflow-hidden relative"
        role="progressbar"
        aria-label="Loading"
      >
        <motion.div
          className="absolute inset-y-0 left-0 bg-gold rounded-full"
          initial={{ width: "0%" }}
          animate={
            shouldReduceMotion
              ? { width: "70%" }
              : { width: ["0%", "100%", "55%", "100%", "0%"] }
          }
          transition={
            shouldReduceMotion
              ? { duration: 0.6 }
              : { duration: 2.4, repeat: Infinity, ease: "easeInOut" }
          }
        />
      </div>
    </div>
  );
}