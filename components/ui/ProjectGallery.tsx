"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import type { ProjectImage } from "@/data/projects";
import { ArrowIcon } from "@/components/layout/ArrowIcon";
import { useMediaQuery } from "@/components/motion/useMotionCapabilities";

export function ProjectGallery({ images, title }: { images: readonly ProjectImage[]; title: string }) {
  const track = useRef<HTMLDivElement>(null);
  const drag = useRef<{ x: number; scroll: number } | null>(null);
  const frame = useRef(0);
  const [index, setIndex] = useState(0);
  const reduced = useMediaQuery("(prefers-reduced-motion: reduce)");
  const show = (next: number) => {
    const element = track.current;
    const slide = element?.children[next] as HTMLElement | undefined;
    if (!element || !slide) return;
    element.scrollTo({ left: slide.offsetLeft, behavior: reduced ? "instant" : "smooth" });
  };
  useEffect(() => () => cancelAnimationFrame(frame.current), []);

  return (
    <div className="project-gallery">
      <div className="gallery-topline">
        <p className="eyebrow">Inside the application</p>
        <div className="gallery-controls">
          <p aria-live="polite" aria-atomic="true">{String(index + 1).padStart(2, "0")} / {String(images.length).padStart(2, "0")}</p>
          <button type="button" aria-label="Previous screenshot" disabled={index === 0} onClick={() => show(index - 1)}>
            <ArrowIcon />
          </button>
          <button type="button" aria-label="Next screenshot" disabled={index === images.length - 1} onClick={() => show(index + 1)}>
            <ArrowIcon />
          </button>
        </div>
      </div>
      <div
        ref={track}
        className="gallery-track"
        role="region"
        aria-label={`${title} screenshot gallery. Use left and right arrow keys to browse.`}
        aria-roledescription="carousel"
        tabIndex={0}
        data-cursor="drag"
        onKeyDown={(event) => {
          if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
            event.preventDefault();
            show(Math.max(0, Math.min(images.length - 1, index + (event.key === "ArrowRight" ? 1 : -1))));
          }
        }}
        onScroll={() => {
          cancelAnimationFrame(frame.current);
          frame.current = requestAnimationFrame(() => {
            const element = track.current;
            const second = element?.children[1] as HTMLElement | undefined;
            if (element && second) setIndex(Math.min(images.length - 1, Math.round(element.scrollLeft / second.offsetLeft)));
          });
        }}
        onPointerDown={(event) => {
          if (event.pointerType !== "mouse" || event.button !== 0) return;
          drag.current = { x: event.clientX, scroll: event.currentTarget.scrollLeft };
          event.currentTarget.setPointerCapture(event.pointerId);
          event.currentTarget.dataset.dragging = "true";
        }}
        onPointerMove={(event) => {
          if (drag.current) event.currentTarget.scrollLeft = drag.current.scroll - (event.clientX - drag.current.x);
        }}
        onLostPointerCapture={(event) => {
          drag.current = null;
          delete event.currentTarget.dataset.dragging;
          const second = event.currentTarget.children[1] as HTMLElement | undefined;
          if (second) show(Math.round(event.currentTarget.scrollLeft / second.offsetLeft));
        }}
        onPointerUp={(event) => {
          if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
        }}
        onPointerCancel={() => { drag.current = null; }}
      >
        {images.map(({ image, alt, caption }, imageIndex) => (
          <figure className="gallery-slide" key={image.src} aria-label={`Screenshot ${imageIndex + 1} of ${images.length}`}>
            <Image src={image} alt={alt} sizes="(min-width: 1600px) 1472px, 92vw" draggable={false} placeholder="blur" />
            <figcaption><span>{caption}</span><span>{String(imageIndex + 1).padStart(2, "0")}</span></figcaption>
          </figure>
        ))}
      </div>
      <p className="gallery-hint">Drag, swipe, or use the arrows to take a closer look.</p>
    </div>
  );
}
