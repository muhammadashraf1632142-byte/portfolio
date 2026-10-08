"use client";

import { useEffect, useRef, type ReactNode } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export function SceneMotion({ children, className = "" }: { children: ReactNode; className?: string }) {
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const element = root.current;
    if (!element) return;
    const media = gsap.matchMedia();
    media.add("(min-width: 1024px) and (hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)", () => {
      const light = { x: 400, y: 250 };
      const updateLight = () => {
        element.style.setProperty("--glow-x", `${light.x}px`);
        element.style.setProperty("--glow-y", `${light.y}px`);
      };
      const lightX = gsap.quickTo(light, "x", { duration: 0.8, ease: "power3.out", onUpdate: updateLight });
      const lightY = gsap.quickTo(light, "y", { duration: 0.8, ease: "power3.out" });
      const move = (event: PointerEvent) => {
        const rect = element.getBoundingClientRect();
        lightX(event.clientX - rect.left);
        lightY(event.clientY - rect.top);
      };
      element.addEventListener("pointermove", move, { passive: true });
      return () => {
        element.removeEventListener("pointermove", move);
        lightX.tween.kill(); lightY.tween.kill();
      };
    });
    media.add("(min-width: 768px) and (prefers-reduced-motion: no-preference)", () => {
      const context = gsap.context(() => {
        const sequence = gsap.timeline({
          scrollTrigger: { trigger: element, start: "top bottom", end: "bottom top", scrub: 0.8 },
        });
        element.querySelectorAll<HTMLElement>("[data-depth]").forEach((layer, index) => {
          const depth = Number(layer.dataset.depth) || 1;
          sequence.fromTo(layer, {
            y: depth * 65, rotationZ: index % 2 ? -3 : 3, scale: 0.96,
          }, { y: depth * -65, rotationZ: index % 2 ? 3 : -3, scale: 1.04, ease: "none", duration: 1 }, 0);
        });
        const title = element.querySelector("[data-scene-title]");
        if (title) {
          sequence.fromTo(title, { xPercent: 4 }, { xPercent: -4, duration: 1, ease: "none" }, 0);
          gsap.fromTo(title, { clipPath: "inset(0 0 100% 0)" }, {
            clipPath: "inset(0 0 0% 0)", ease: "none",
            scrollTrigger: { trigger: title, start: "top 95%", end: "top 65%", scrub: 0.35 },
          });
        }
        const line = element.querySelector("[data-scene-line]");
        if (line) sequence.fromTo(line, { scaleX: 0, transformOrigin: "left" }, { scaleX: 1, duration: 1, ease: "none" }, 0);
      }, element);
      return () => context.revert();
    });
    return () => media.revert();
  }, []);
  return <div ref={root} className={`scene-motion ${className}`}>{children}</div>;
}
