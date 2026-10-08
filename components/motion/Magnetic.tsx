"use client";

import { useRef, type ReactNode } from "react";
import { motion, useMotionValue, useSpring } from "motion/react";
import { useDesktopMotion } from "./useMotionCapabilities";

export function Magnetic({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const enabled = useDesktopMotion();
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 280, damping: 24, mass: 0.4 });
  const springY = useSpring(y, { stiffness: 280, damping: 24, mass: 0.4 });

  return (
    <motion.div
      ref={ref}
      className="magnetic"
      style={{ x: enabled ? springX : 0, y: enabled ? springY : 0 }}
      onPointerMove={(event) => {
        if (!enabled || event.pointerType !== "mouse" || !ref.current) return;
        const rect = ref.current.getBoundingClientRect();
        x.set((event.clientX - rect.left - rect.width / 2) * 0.12);
        y.set((event.clientY - rect.top - rect.height / 2) * 0.12);
      }}
      onPointerLeave={() => { x.set(0); y.set(0); }}
    >
      {children}
    </motion.div>
  );
}
