"use client";

import Image, { type StaticImageData } from "next/image";
import dynamic from "next/dynamic";
import { Component, useCallback, useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import gsap from "gsap";
import { useDesktopMotion } from "@/components/motion/useMotionCapabilities";
import type { ImageInteraction } from "./ShaderCanvas";

const ShaderCanvas = dynamic(() => import("./ShaderCanvas"), { ssr: false });

class CanvasBoundary extends Component<
  { children: ReactNode; onFailure: () => void },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch() { this.props.onFailure(); }
  render() { return this.state.failed ? null : this.props.children; }
}

export function ProjectImage({ image, alt, priority = false }: {
  image: StaticImageData;
  alt: string;
  priority?: boolean;
}) {
  const wrapper = useRef<HTMLDivElement>(null);
  const surface = useRef<HTMLDivElement>(null);
  const enabled = useDesktopMotion();
  const [active, setActive] = useState(false);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const invalidate = useRef<(() => void) | null>(null);
  const interaction = useRef<ImageInteraction>({
    x: 0.5, y: 0.5, velocityX: 0, velocityY: 0,
    speed: 0, time: 0, hovering: false, progress: 0,
  });
  const onReady = useCallback(() => setReady(true), []);
  const onFailure = useCallback(() => setFailed(true), []);
  const onInvalidate = useCallback((value: () => void) => { invalidate.current = value; setReady(false); }, []);

  useEffect(() => {
    const element = wrapper.current;
    if (!element || !enabled) return;
    const hardware = navigator as Navigator & { deviceMemory?: number; connection?: { saveData?: boolean } };
    if ((hardware.deviceMemory !== undefined && hardware.deviceMemory <= 4) ||
      (hardware.hardwareConcurrency && hardware.hardwareConcurrency <= 4) ||
      hardware.connection?.saveData) return;
    let near = false;
    const stage = element.closest<HTMLElement>(".project-stage");
    const panel = element.closest<HTMLElement>("[data-project-index]");
    const update = () => {
      const selected = !stage?.dataset.pinned ||
        (stage.dataset.active ?? "0") === panel?.dataset.projectIndex;
      setActive(near && selected);
    };
    const observer = new IntersectionObserver(([entry]) => {
      near = entry.isIntersecting;
      update();
    }, { rootMargin: "100px" });
    observer.observe(element);
    const mutations = new MutationObserver(update);
    if (stage) mutations.observe(stage, { attributes: true, attributeFilter: ["data-active", "data-pinned"] });
    return () => { observer.disconnect(); mutations.disconnect(); invalidate.current = null; };
  }, [enabled]);

  useEffect(() => {
    const element = wrapper.current;
    const plane = surface.current;
    if (!element || !plane || !enabled) return;
    const rotateX = gsap.quickTo(plane, "rotationX", { duration: 0.6, ease: "power3.out" });
    const rotateY = gsap.quickTo(plane, "rotationY", { duration: 0.6, ease: "power3.out" });
    const move = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return;
      const rect = element.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width;
      const y = (event.clientY - rect.top) / rect.height;
      const now = performance.now();
      const elapsed = Math.max(8, now - interaction.current.time);
      const vx = (x - interaction.current.x) * rect.width * 16.67 / elapsed;
      const vy = (1 - y - interaction.current.y) * -rect.height * 16.67 / elapsed;
      interaction.current = {
        ...interaction.current,
        x, y: 1 - y,
        velocityX: vx, velocityY: vy,
        speed: Math.hypot(vx, vy), time: now, hovering: true,
      };
      rotateX((0.5 - y) * 3);
      rotateY((x - 0.5) * 4);
      invalidate.current?.();
    };
    const leave = () => {
      interaction.current.hovering = false;
      rotateX(0); rotateY(0);
      invalidate.current?.();
    };
    const stage = element.closest(".project-stage");
    const progress = (event: Event) => {
      const value = (event as CustomEvent<{ index: number; scatter: number }>).detail;
      const panel = element.closest<HTMLElement>("[data-project-index]");
      if (Number(panel?.dataset.projectIndex) !== value.index) return;
      interaction.current.progress = value.scatter;
      invalidate.current?.();
    };
    stage?.addEventListener("project-progress", progress);
    element.addEventListener("pointermove", move);
    element.addEventListener("pointerleave", leave);
    return () => {
      element.removeEventListener("pointermove", move);
      element.removeEventListener("pointerleave", leave);
      stage?.removeEventListener("project-progress", progress);
      rotateX.tween.kill(); rotateY.tween.kill();
      gsap.set(plane, { clearProps: "transform" });
    };
  }, [enabled]);

  return (
    <div ref={wrapper} className="image-interaction" style={{ "--image-ratio": image.width / image.height } as CSSProperties}>
      <div ref={surface} className="image-surface" data-webgl-ready={enabled && active && ready && !failed ? "true" : undefined}>
        <Image
          src={image}
          alt={alt}
          sizes="(min-width: 1600px) 1000px, (min-width: 1100px) 66vw, 92vw"
          priority={priority}
          placeholder="blur"
        />
        {enabled && active && !failed ? (
          <div className="shader-layer" aria-hidden="true" style={{ opacity: ready ? 1 : 0 }}>
            <CanvasBoundary onFailure={onFailure}>
              <ShaderCanvas
                src={image.src}
                interaction={interaction}
                onInvalidate={onInvalidate}
                onReady={onReady}
                onFailure={onFailure}
              />
            </CanvasBoundary>
          </div>
        ) : null}
      </div>
    </div>
  );
}
