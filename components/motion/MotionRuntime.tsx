"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import { pointer } from "./pointer";
import "lenis/dist/lenis.css";

gsap.registerPlugin(ScrollTrigger);

export default function MotionRuntime() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    const cursor = cursorRef.current;
    const label = labelRef.current;
    if (!cursor || !label) return;
    const lenis = new Lenis({ lerp: 0.12, smoothWheel: true, syncTouch: false });
    lenis.on("scroll", ScrollTrigger.update);
    document.documentElement.dataset.motion = "enabled";
    let currentX = 0;
    let currentY = 0;
    let mode = "normal";
    let tone = "accent";
    let ready = false;
    const move = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return;
      const now = performance.now();
      const delta = Math.max(8, now - pointer.timestamp);
      pointer.previousX = pointer.x;
      pointer.previousY = pointer.y;
      pointer.velocityX = ready ? (event.clientX - pointer.x) * 16.67 / delta : 0;
      pointer.velocityY = ready ? (event.clientY - pointer.y) * 16.67 / delta : 0;
      pointer.speed = Math.hypot(pointer.velocityX, pointer.velocityY);
      pointer.x = event.clientX;
      pointer.y = event.clientY;
      pointer.timestamp = now;
      pointer.active = true;
      if (!ready) { currentX = pointer.x; currentY = pointer.y; ready = true; }
      cursor.style.opacity = "1";
      cursor.style.visibility = "visible";
      const target = event.target instanceof Element ? event.target.closest("[data-cursor], a, button, summary") : null;
      const nextMode = target?.getAttribute("data-cursor") || (target ? "link" : "normal");
      if (nextMode !== mode) {
        mode = nextMode;
        cursor.dataset.mode = mode;
        label.textContent = mode === "project" ? "VIEW PROJECT ↗" : mode === "drag" ? "DRAG ↔" : "";
      }
    };
    const hide = () => { pointer.active = false; cursor.style.opacity = "0"; };
    const visibility = () => {
      if (document.hidden) { lenis.stop(); hide(); }
      else { lenis.start(); ScrollTrigger.refresh(); }
    };
    const tick = (time: number, deltaTime: number) => {
      if (document.hidden) return;
      lenis.raf(time * 1000);
      if (!pointer.active) return;
      const lerp = 1 - Math.exp(-Math.min(deltaTime, 48) / 38);
      currentX += (pointer.x - currentX) * lerp;
      currentY += (pointer.y - currentY) * lerp;
      // Hit-test the visible cursor so contrast also updates during scrolling.
      const surface = document.elementFromPoint(currentX, currentY)?.closest("[data-cursor-tone]");
      const nextTone = surface?.getAttribute("data-cursor-tone") ?? "accent";
      if (nextTone !== tone) {
        tone = nextTone;
        cursor.dataset.tone = tone;
      }
      const moving = performance.now() - pointer.timestamp < 100;
      const stretch = mode === "normal" && moving ? Math.min(pointer.speed / 180, 0.25) : 0;
      const angle = moving ? Math.atan2(pointer.velocityY, pointer.velocityX) * 180 / Math.PI : 0;
      cursor.style.transform = `translate3d(${currentX}px, ${currentY}px, 0)`;
      const dot = cursor.firstElementChild as HTMLElement;
      dot.style.transform = `rotate(${angle}deg) scale(${1 + stretch}, ${1 - stretch * 0.45})`;
    };
    const anchor = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
      const link = event.target instanceof Element ? event.target.closest<HTMLAnchorElement>("a[href]") : null;
      if (!link || link.hasAttribute("download") || link.target === "_blank") return;
      const url = new URL(link.href, location.href);
      if (url.origin !== location.origin || url.pathname !== location.pathname || !url.hash) return;
      const target = document.getElementById(decodeURIComponent(url.hash.slice(1)));
      if (!target) return;
      event.preventDefault();
      const pinned = ScrollTrigger.getById("project-showcase");
      const index = target.dataset.projectIndex;
      const destination = pinned && index !== undefined
        ? pinned.start + (pinned.end - pinned.start) * (Number(index) === 0 ? 0.1 : 0.86)
        : target;
      history.pushState(null, "", url.hash);
      lenis.scrollTo(destination, {
        immediate: event.detail === 0,
        duration: event.detail === 0 ? 0 : 0.85,
        onComplete: () => {
          ScrollTrigger.update();
          if (index !== undefined) pinned?.getTween()?.progress(1);
          if (!target.hasAttribute("tabindex")) target.setAttribute("tabindex", "-1");
          target.focus({ preventScroll: true });
        },
      });
    };
    window.addEventListener("pointermove", move, { passive: true });
    document.addEventListener("pointerleave", hide);
    window.addEventListener("blur", hide);
    document.addEventListener("visibilitychange", visibility);
    document.addEventListener("click", anchor, true);
    gsap.ticker.add(tick);
    return () => {
      gsap.ticker.remove(tick);
      lenis.destroy();
      pointer.active = false;
      delete document.documentElement.dataset.motion;
      window.removeEventListener("pointermove", move);
      document.removeEventListener("pointerleave", hide);
      window.removeEventListener("blur", hide);
      document.removeEventListener("visibilitychange", visibility);
      document.removeEventListener("click", anchor, true);
    };
  }, []);

  useEffect(() => {
    const context = gsap.context(() => {
      if (document.querySelector(".hero")) {
        gsap.timeline({ defaults: { ease: "power3.out" } })
          .from(".hero .reveal-line", { yPercent: 112, skewY: 3, duration: 0.9, stagger: 0.1 })
          .from(".site-header", { y: -18, autoAlpha: 0, duration: 0.45 }, 0.35)
          .from(".hero-intro, .hero-bottom, .hero-baseline", { y: 16, autoAlpha: 0, duration: 0.55, stagger: 0.08 }, 0.55);
      }
      gsap.utils.toArray<HTMLElement>("[data-reveal]").forEach((element) => {
        gsap.from(element, {
          y: 32, autoAlpha: 0, duration: 0.8, ease: "power3.out",
          scrollTrigger: { trigger: element, start: "top 92%", toggleActions: "play none none none" },
        });
      });
    });
    const timer = window.setTimeout(() => ScrollTrigger.refresh(), 120);
    return () => { clearTimeout(timer); context.revert(); };
  }, [pathname]);

  return (
    <div ref={cursorRef} className="custom-cursor" data-mode="normal" aria-hidden="true">
      <div className="cursor-shape" />
      <span ref={labelRef} className="cursor-label" />
    </div>
  );
}
