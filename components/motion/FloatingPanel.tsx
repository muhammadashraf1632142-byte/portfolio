"use client";

import { motion, useMotionValue, useSpring } from "motion/react";
import { useDesktopMotion } from "./useMotionCapabilities";
import type { ReactNode } from "react";

export function FloatingPanel({ children, className = "", depth = 1 }: {
  children: ReactNode; className?: string; depth?: number;
}) {
  const enabled = useDesktopMotion();
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 130, damping: 15, mass: 0.8 });
  const springY = useSpring(y, { stiffness: 130, damping: 15, mass: 0.8 });
  const rotateX = useSpring(0, { stiffness: 160, damping: 18 });
  const rotateY = useSpring(0, { stiffness: 160, damping: 18 });
  return (
    <motion.div
      className={`floating-panel ${className}`}
      data-avatar-cue="pointing"
      style={{ x: enabled ? springX : 0, y: enabled ? springY : 0, rotateX: enabled ? rotateX : 0, rotateY: enabled ? rotateY : 0 }}
      onPointerMove={(event) => {
        if (!enabled || event.pointerType !== "mouse") return;
        const rect = event.currentTarget.getBoundingClientRect();
        const dx = event.clientX - rect.left - rect.width / 2;
        const dy = event.clientY - rect.top - rect.height / 2;
        x.set(-dx * 0.075 * depth); y.set(-dy * 0.075 * depth);
        rotateX.set(-dy / rect.height * 12); rotateY.set(dx / rect.width * 12);
      }}
      onPointerLeave={() => { x.set(0); y.set(0); rotateX.set(0); rotateY.set(0); }}
    >{children}</motion.div>
  );
}
