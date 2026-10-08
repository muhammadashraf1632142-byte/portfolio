"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { projects } from "@/data/projects";
import { useDesktopMotion } from "./useMotionCapabilities";

export function ImageTrail() {
  const root = useRef<HTMLDivElement>(null);
  const enabled = useDesktopMotion();
  useEffect(() => {
    const element = root.current;
    const scene = element?.closest("section");
    if (!enabled || !element || !scene) return;
    const echoes = Array.from(element.children) as HTMLElement[];
    let lastX = 0;
    let lastY = 0;
    let lastTime = 0;
    let slot = 0;
    const move = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return;
      const now = performance.now();
      const speed = Math.hypot(event.clientX - lastX, event.clientY - lastY);
      const dx = event.clientX - lastX;
      lastX = event.clientX; lastY = event.clientY;
      if (speed < 22 || now - lastTime < 95) return;
      lastTime = now;
      const rect = scene.getBoundingClientRect();
      const echo = echoes[slot++ % echoes.length];
      gsap.killTweensOf(echo);
      gsap.fromTo(echo, {
        x: event.clientX - rect.left - 90, y: event.clientY - rect.top - 50,
        rotation: gsap.utils.clamp(-15, 15, dx * 0.15), scale: 1, opacity: 0.7,
      }, {
        x: "+=" + dx * 0.25, y: "-=35", scale: 0.65, opacity: 0,
        duration: 0.8, ease: "power2.out",
      });
    };
    scene.addEventListener("pointermove", move, { passive: true });
    return () => { scene.removeEventListener("pointermove", move); gsap.killTweensOf(echoes); };
  }, [enabled]);
  return (
    <div ref={root} className="image-trails" aria-hidden="true">
      {Array.from({ length: 6 }, (_, index) => (
        <div className="image-echo" key={index}>
          <Image src={projects[index % 2].images[0].image} alt="" sizes="180px" />
        </div>
      ))}
    </div>
  );
}
