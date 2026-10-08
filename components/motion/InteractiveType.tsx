"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { useDesktopMotion } from "./useMotionCapabilities";
import { pointer } from "./pointer";

export function InteractiveType({ text, strength = 18 }: { text: string; strength?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const enabled = useDesktopMotion();

  useEffect(() => {
    const element = ref.current;
    if (!enabled || !element) return;
    const letters = Array.from(element.querySelectorAll<HTMLElement>(".type-letter"));
    const setters = letters.map((letter) => ({
      x: gsap.quickTo(letter, "x", { duration: 0.55, ease: "elastic.out(1, 0.55)" }),
      y: gsap.quickTo(letter, "y", { duration: 0.55, ease: "elastic.out(1, 0.55)" }),
      rotate: gsap.quickTo(letter, "rotation", { duration: 0.5, ease: "power3.out" }),
      scale: gsap.quickTo(letter, "scaleY", { duration: 0.5, ease: "power3.out" }),
    }));
    const scene = element.closest("section") ?? element;
    const move = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return;
      const rects = letters.map((letter) => letter.getBoundingClientRect());
      rects.forEach((rect, index) => {
        const dx = rect.left + rect.width / 2 - event.clientX;
        const dy = rect.top + rect.height / 2 - event.clientY;
        const distance = Math.hypot(dx, dy);
        const force = Math.max(0, 1 - distance / 155);
        const intensity = force * force;
        setters[index].x(dx / Math.max(distance, 12) * strength * intensity);
        setters[index].y(dy / Math.max(distance, 12) * strength * intensity);
        setters[index].rotate(gsap.utils.clamp(-9, 9, pointer.velocityX * 0.22) * intensity);
        setters[index].scale(1 + intensity * Math.min(0.3, pointer.speed / 200));
        letters[index].style.textShadow = pointer.speed > 24 && intensity > 0.25
          ? "3px 0 #b59aff, -3px 0 #92d9ad" : "none";
      });
    };
    const leave = () => setters.forEach((setter, index) => {
      setter.x(0); setter.y(0); setter.rotate(0); setter.scale(1);
      letters[index].style.textShadow = "none";
    });
    scene.addEventListener("pointermove", move);
    scene.addEventListener("pointerleave", leave);
    return () => {
      scene.removeEventListener("pointermove", move);
      scene.removeEventListener("pointerleave", leave);
      setters.forEach((setter) => Object.values(setter).forEach((quick) => quick.tween.kill()));
      gsap.set(letters, { clearProps: "transform,textShadow" });
    };
  }, [enabled, strength]);

  return (
    <span ref={ref} className="interactive-type" data-cursor="type" data-avatar-cue="looking">
      {text.split(" ").map((word, index) => (
        <span key={index}>
          {index > 0 ? " " : null}
          <span className="type-word">
            {Array.from(word).map((letter, letterIndex) => <span className="type-letter" key={letterIndex}>{letter}</span>)}
          </span>
        </span>
      ))}
    </span>
  );
}
