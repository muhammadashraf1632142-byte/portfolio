"use client";
import { useEffect, useRef, type ReactNode } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
gsap.registerPlugin(ScrollTrigger);
const pinQuery = "(min-width: 1100px) and (min-height: 700px) and (hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)";

export function ProjectShowcase({ children }: { children: ReactNode }) {
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const stage = root.current;
    if (!stage) return;
    const media = gsap.matchMedia();
    media.add(pinQuery, () => {
      const panels = Array.from(stage.querySelectorAll<HTMLElement>(".project-panel"));
      const tabs = Array.from(stage.querySelectorAll<HTMLAnchorElement>(".project-nav a"));
      let focused: HTMLElement | null = null;
      const preserveFocus = () => {
        focused = document.activeElement instanceof HTMLElement && stage.contains(document.activeElement) ? document.activeElement : null;
      };
      const restoreFocus = () => {
        if (focused?.isConnected && document.activeElement !== focused) focused.focus({ preventScroll: true });
        focused = null;
      };
      ScrollTrigger.addEventListener("refreshInit", preserveFocus);
      ScrollTrigger.addEventListener("refresh", restoreFocus);
      const context = gsap.context(() => {
        gsap.set(stage, { height: "100svh" });
        gsap.set(panels, { position: "absolute", inset: 0, height: "100%", minHeight: 0 });
        gsap.set(panels[1], { yPercent: 105, autoAlpha: 0, clipPath: "inset(100% 0 0 0)" });
        const update = (progress: number) => {
          const active = progress > 0.5 ? 1 : 0;
          if (stage.dataset.active !== String(active)) {
            stage.dataset.active = String(active);
            panels.forEach((panel, index) => { panel.inert = index !== active; panel.setAttribute("aria-hidden", String(index !== active)); });
            tabs.forEach((tab, index) => {
              if (index === active) tab.setAttribute("aria-current", "true");
              else tab.removeAttribute("aria-current");
            });
          }
          const scatter = active === 0 ? gsap.utils.clamp(0, 1, (progress - 0.36) / 0.14) : gsap.utils.clamp(0, 1, (0.62 - progress) / 0.12);
          stage.dispatchEvent(new CustomEvent("project-progress", { detail: { index: active, scatter } }));
          const fill = stage.querySelector<HTMLElement>(".project-progress-fill");
          if (fill) fill.style.transform = `scaleX(${progress})`;
        };
        const sequence = gsap.timeline({
          onUpdate: () => update(sequence.progress()),
          scrollTrigger: {
            id: "project-showcase", trigger: stage, start: "top top", end: () => "+=" + window.innerHeight * 4.4,
            pin: true, scrub: 0.7, anticipatePin: 1, invalidateOnRefresh: true,
          },
        });
        const layers = (index: number) => ({
          title: panels[index].querySelector(".project-title"), image: panels[index].querySelector(".project-media-link"),
          meta: panels[index].querySelector(".project-meta"), back: panels[index].querySelector(".depth-screen-0"),
          front: panels[index].querySelector(".depth-screen-1"),
        });
        const first = layers(0), second = layers(1);
        sequence
          .fromTo(first.title, { xPercent: 3 }, { xPercent: -3, duration: 2.5, ease: "none" }, 0)
          .fromTo(first.image, { y: 25, rotation: -2, scale: 0.94 }, { y: -20, rotation: 0, scale: 1, duration: 1.4, ease: "none" }, 0)
          .fromTo(first.back, { xPercent: -8, y: 55, rotation: -9 }, { xPercent: -13, y: -65, rotation: -5, duration: 2.1, ease: "none" }, 0)
          .fromTo(first.front, { xPercent: 7, y: 80, rotation: 8 }, { xPercent: 12, y: 42, rotation: 4, duration: 2.1, ease: "none" }, 0)
          .to(first.meta, { y: -30, duration: 2.2, ease: "none" }, 0)
          .to(panels[0], { yPercent: -22, autoAlpha: 0, duration: 0.8, ease: "power2.inOut" }, 2.2)
          .to(panels[1], { yPercent: 0, autoAlpha: 1, clipPath: "inset(0% 0 0 0)", duration: 0.8, ease: "power2.inOut" }, 2.2)
          .fromTo(second.title, { xPercent: 5 }, { xPercent: -2, duration: 2.6, ease: "none" }, 2.8)
          .fromTo(second.image, { y: 60, scale: 0.94, rotation: 2 }, { y: -10, scale: 1, rotation: 0, duration: 1.6, ease: "none" }, 2.8)
          .fromTo(second.back, { y: 90, rotation: -8 }, { y: -65, rotation: -4, duration: 2.6, ease: "none" }, 2.8)
          .fromTo(second.front, { y: 90, rotation: 9 }, { y: 42, rotation: 5, duration: 2.6, ease: "none" }, 2.8)
          .fromTo(second.meta, { y: 35 }, { y: -10, duration: 2.6, ease: "none" }, 2.8);
        stage.dataset.pinned = "true";
        update(0);
      }, stage);
      const refresh = () => ScrollTrigger.refresh();
      document.fonts.ready.then(refresh);
      window.addEventListener("load", refresh);
      return () => {
        ScrollTrigger.removeEventListener("refreshInit", preserveFocus);
        ScrollTrigger.removeEventListener("refresh", restoreFocus);
        window.removeEventListener("load", refresh); context.revert();
        delete stage.dataset.pinned; delete stage.dataset.active;
        panels.forEach((panel) => { panel.inert = false; panel.removeAttribute("aria-hidden"); });
        tabs.forEach((tab) => tab.removeAttribute("aria-current"));
        stage.dispatchEvent(new CustomEvent("project-progress", { detail: { index: 0, scatter: 0 } }));
      };
    });
    return () => media.revert();
  }, []);
  return (
    <div ref={root} className="project-stage">
      {children}
      <div className="project-scroll-progress" aria-hidden="true"><span className="project-progress-fill" /></div>
      <nav className="project-nav" aria-label="Choose a featured project">
        <a href="#project-gather" data-cursor="link"><span>01</span> Gather</a>
        <span className="project-nav-rule" aria-hidden="true" />
        <a href="#project-freshcart" data-cursor="link"><span>02</span> FreshCart</a>
      </nav>
    </div>
  );
}
