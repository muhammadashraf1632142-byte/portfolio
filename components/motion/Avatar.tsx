"use client";

import { useEffect, useId, useRef } from "react";
import gsap from "gsap";
import { useMediaQuery } from "./useMotionCapabilities";

export type AvatarPose = "idle" | "looking" | "typing" | "walking" | "pointing" | "painting" | "waving";

type AvatarProps = {
  pose?: AvatarPose;
  className?: string;
  onPaint?: (progress: number) => void;
};

// A single articulated SVG rig is reused across all scenes, with independent
// arm, leg, face, laptop, and brush timelines. Nothing is a pose image swap.
export function Avatar({ pose = "idle", className = "", onPaint }: AvatarProps) {
  const root = useRef<HTMLDivElement>(null);
  const id = useId();
  const resting = pose === "idle" || pose === "looking";
  const reduced = useMediaQuery("(prefers-reduced-motion: reduce)");

  useEffect(() => {
    const element = root.current;
    if (!element || reduced || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const scene = element.closest("section") ?? element;
    const part = (name: string) => element.querySelector<SVGElement>(`[data-part="${name}"]`)!;
    const startsFolded = pose === "idle" || pose === "looking";
    let visible = false;
    let intersecting = false;
    const stage = element.closest<HTMLElement>(".project-stage");
    const panel = element.closest<HTMLElement>("[data-project-index]");
    let current: AvatarPose = pose;
    let entered = false;
    let poseTimeline: gsap.core.Timeline | null = null;
    let previousCue: Element | null = null;
    const context = gsap.context(() => {
      gsap.set(part("left-arm"), { svgOrigin: "118 193" });
      gsap.set(part("right-arm"), { svgOrigin: "202 193" });
      gsap.set(part("left-leg"), { svgOrigin: "139 257" });
      gsap.set(part("right-leg"), { svgOrigin: "182 257" });
      gsap.set(part("head"), { svgOrigin: "160 151" });
      gsap.set(part("eyes"), { svgOrigin: "160 117" });
      gsap.set(part("laptop"), { svgOrigin: "160 279" });
      gsap.set(part("brush"), { autoAlpha: 0 });
      gsap.set(part("laptop"), { autoAlpha: pose === "typing" ? 1 : 0 });
      gsap.set([part("chair"), part("hands")], { autoAlpha: pose === "typing" ? 1 : 0 });
    }, element);
    const breathing = gsap.timeline({ paused: true, repeat: -1, yoyo: true })
      .to(part("torso"), { y: -2.5, scaleY: 1.015, transformOrigin: "50% 100%", duration: 2.2, ease: "sine.inOut" })
      .to(part("head"), { y: -1.5, duration: 2.2, ease: "sine.inOut" }, 0);
    const blink = gsap.timeline({ paused: true, repeat: -1, repeatDelay: 3.2 })
      .to(part("eyes"), { scaleY: 0.05, duration: 0.09 })
      .to(part("eyes"), { scaleY: 1, duration: 0.13 })
      .to(part("eyes"), { scaleY: 0.05, duration: 0.08 }, "+=0.16")
      .to(part("eyes"), { scaleY: 1, duration: 0.12 });
    const headX = gsap.quickTo(part("head"), "x", { duration: 0.65, ease: "power3.out" });
    const headRotation = gsap.quickTo(part("head"), "rotation", { duration: 0.65, ease: "power3.out" });
    const eyeX = gsap.quickTo(part("pupils"), "x", { duration: 0.35, ease: "power2.out" });
    const eyeY = gsap.quickTo(part("pupils"), "y", { duration: 0.35, ease: "power2.out" });

    const setPose = (next: AvatarPose) => {
      current = next;
      element.dataset.state = next;
      poseTimeline?.kill();
      gsap.to([part("left-arm"), part("right-arm"), part("left-leg"), part("right-leg")], {
        rotation: 0, x: 0, y: 0, duration: 0.3, overwrite: true,
      });
      gsap.to(part("laptop"), { autoAlpha: next === "typing" ? 1 : 0, duration: 0.3 });
      gsap.to([part("chair"), part("hands")], { autoAlpha: next === "typing" ? 1 : 0, duration: 0.3 });
      gsap.to(element.querySelector(".avatar-leg-left"), { attr: { d: next === "typing" ? "M136 250 118 305 130 379" : "M136 250 133 312 130 379" }, duration: 0.45 });
      gsap.to(element.querySelector(".avatar-leg-right"), { attr: { d: next === "typing" ? "M181 250 201 305 189 379" : "M181 250 185 312 189 379" }, duration: 0.45 });
      gsap.to(part("brush"), { autoAlpha: next === "painting" ? 1 : 0, duration: 0.25 });
      const folded = next === "idle" || next === "looking";
      gsap.to(element.querySelector(".avatar-arm-left"), { attr: { d: folded ? "M114 211 Q102 233 121 235 L179 224" : "M114 211 Q103 233 111 238 L120 253" }, duration: 0.35 });
      gsap.to(element.querySelector(".avatar-arm-right"), { attr: { d: folded ? "M205 211 Q216 234 196 235 L134 228" : "M205 211 Q217 233 213 237 L202 253" }, duration: 0.35 });
      gsap.to(part("left-hand"), { x: (folded ? 179 : 120) - (startsFolded ? 179 : 120), y: (folded ? 224 : 253) - (startsFolded ? 224 : 253), duration: 0.35 });
      gsap.to(part("right-hand"), { x: (folded ? 134 : 202) - (startsFolded ? 134 : 202), y: (folded ? 228 : 253) - (startsFolded ? 228 : 253), duration: 0.35 });
      const sequence = gsap.timeline({ paused: !visible, repeat: -1, delay: 0.25 });
      if (next === "typing") {
        sequence
          .to(part("left-arm"), { rotation: -19, x: 12, y: -3, duration: 0.16, ease: "sine.inOut" })
          .to(part("right-arm"), { rotation: 20, x: -12, y: -2, duration: 0.14 }, 0)
          .to(part("left-arm"), { rotation: -13, y: 2, duration: 0.13 })
          .to(part("right-arm"), { rotation: 14, y: 3, duration: 0.12 }, "<")
          .to(part("left-arm"), { rotation: -18, y: -2, duration: 0.21 })
          .to(part("right-arm"), { rotation: 19, y: -3, duration: 0.18 }, "<")
          .to(part("left-arm"), { rotation: -14, y: 1, duration: 0.15 })
          .to(part("right-arm"), { rotation: 14, y: 2, duration: 0.15 }, "<")
          .to(part("hands"), { y: -3, x: 1, duration: 0.15, yoyo: true, repeat: 5 }, 0)
          .to(part("screen-glow"), { opacity: 0.35, duration: 0.6 }, 0)
          .to(part("screen-glow"), { opacity: 0.2, duration: 0.5 })
          .fromTo(element.querySelectorAll(".avatar-code-line"), { strokeDashoffset: 72 }, {
            strokeDashoffset: 0, stagger: 0.09, duration: 0.55, ease: "steps(6)",
          }, 0);
      } else if (next === "pointing") {
        sequence.to(part("right-arm"), { rotation: -104, duration: 0.65, ease: "back.out(1.4)" })
          .to(part("right-arm"), { rotation: -96, duration: 1.1, ease: "sine.inOut" })
          .to(part("right-arm"), { rotation: -102, duration: 1.1, ease: "sine.inOut" });
      } else if (next === "waving") {
        sequence.to(part("right-arm"), { rotation: -155, duration: 0.65, ease: "back.out(1.4)" })
          .to(part("right-arm"), { rotation: -137, duration: 0.25, yoyo: true, repeat: 5, ease: "sine.inOut" })
          .to(part("right-arm"), { rotation: -110, duration: 0.5 }, "+=0.7")
          .to(part("right-arm"), { rotation: -155, duration: 0.65 }, "+=1.4");
      } else if (next === "painting") {
        sequence.to(part("right-arm"), { rotation: -66, duration: 0.75, ease: "sine.inOut" })
          .to(part("right-arm"), { rotation: -101, duration: 0.9, ease: "sine.inOut" })
          .to(part("right-arm"), { rotation: -66, duration: 0.8, ease: "sine.inOut" });
        sequence.eventCallback("onUpdate", () => onPaint?.(sequence.progress()));
      } else if (next === "walking") {
        sequence.to(part("left-leg"), { rotation: 13, duration: 0.28, yoyo: true, repeat: 1 })
          .to(part("right-leg"), { rotation: -13, duration: 0.28, yoyo: true, repeat: 1 }, 0)
          .to(part("left-arm"), { rotation: -10, duration: 0.28, yoyo: true, repeat: 1 }, 0)
          .to(part("right-arm"), { rotation: 10, duration: 0.28, yoyo: true, repeat: 1 }, 0);
      } else {
        sequence.to(part("left-arm"), { rotation: 3, duration: 2.1, yoyo: true, repeat: 1, ease: "sine.inOut" })
          .to(part("right-arm"), { rotation: -3, duration: 2.1, yoyo: true, repeat: 1, ease: "sine.inOut" }, 0);
      }
      poseTimeline = sequence;
    };
    const enter = gsap.timeline({ paused: true });
    const updateVisibility = () => {
      const selected = !stage?.dataset.pinned || (stage.dataset.active ?? "0") === panel?.dataset.projectIndex;
      visible = intersecting && selected && !document.hidden;
      element.dataset.animating = String(visible);
      if (visible) {
        breathing.play(); blink.play();
        if (!entered) {
          entered = true;
          setPose("walking");
          enter.fromTo(part("rig"), { x: -55, rotation: -3 }, {
            x: 0, rotation: 0, duration: 1, ease: "power3.out",
            onComplete: () => setPose(pose),
          }).play();
        } else { poseTimeline?.play(); if (enter.progress() < 1) enter.play(); }
      } else { breathing.pause(); blink.pause(); poseTimeline?.pause(); enter.pause(); }
    };
    const observer = new IntersectionObserver(([entry]) => {
      intersecting = entry.isIntersecting;
      updateVisibility();
    }, { threshold: 0.08 });
    observer.observe(element);
    const mutations = new MutationObserver(updateVisibility);
    if (stage) mutations.observe(stage, { attributes: true, attributeFilter: ["data-active", "data-pinned"] });
    const look = (event: PointerEvent) => {
      if (!visible || event.pointerType !== "mouse") return;
      const rect = element.getBoundingClientRect();
      const dx = gsap.utils.clamp(-1, 1, (event.clientX - rect.left - rect.width / 2) / 300);
      const dy = gsap.utils.clamp(-1, 1, (event.clientY - rect.top - rect.height * 0.33) / 280);
      headX(dx * 5); headRotation(dx * 7); eyeX(dx * 4); eyeY(dy * 2.5);
      const target = event.target instanceof Element ? event.target.closest("[data-avatar-cue]") : null;
      const cue = target?.getAttribute("data-avatar-cue") as AvatarPose | null;
      const next = cue && scene.contains(target) ? cue : pose;
      if (entered && !enter.isActive() && next !== current) setPose(next);
      else if (entered && !enter.isActive() && cue === "waving" && target !== previousCue) poseTimeline?.restart();
      previousCue = target;
    };
    const visibility = updateVisibility;
    window.addEventListener("pointermove", look, { passive: true });
    document.addEventListener("visibilitychange", visibility);
    return () => {
      observer.disconnect();
      mutations.disconnect();
      window.removeEventListener("pointermove", look);
      document.removeEventListener("visibilitychange", visibility);
      breathing.kill(); blink.kill(); poseTimeline?.kill(); enter.kill();
      [headX, headRotation, eyeX, eyeY].forEach((setter) => setter.tween.kill());
      gsap.killTweensOf(element.querySelectorAll("[data-part]"));
      gsap.killTweensOf(element.querySelectorAll(".avatar-leg-left, .avatar-leg-right, .avatar-arm-left, .avatar-arm-right"));
      gsap.set(element.querySelector(".avatar-arm-left"), { attr: { d: startsFolded ? "M114 211 Q102 233 121 235 L179 224" : "M114 211 Q103 233 111 238 L120 253" } });
      gsap.set(element.querySelector(".avatar-arm-right"), { attr: { d: startsFolded ? "M205 211 Q216 234 196 235 L134 228" : "M205 211 Q217 233 213 237 L202 253" } });
      context.revert();
      gsap.set(element.querySelectorAll("[data-part], .avatar-code-line"), { clearProps: "transform,opacity,visibility,strokeDashoffset" });
      delete element.dataset.animating;
      element.dataset.state = pose;
    };
  }, [pose, reduced, onPaint]);

  return (
    <div ref={root} className={`avatar avatar--${pose} ${className}`} data-state={pose} data-avatar>
      <svg viewBox="0 0 320 420" fill="none" role="img" aria-label="Animated avatar of Muhammad" focusable="false">
        <defs>
          <linearGradient id={`polo-${id}`} x1="116" y1="175" x2="211" y2="265" gradientUnits="userSpaceOnUse">
            <stop stopColor="#3d4a64" /><stop offset="1" stopColor="#202c43" />
          </linearGradient>
          <linearGradient id={`skin-${id}`} x1="125" y1="90" x2="197" y2="161" gradientUnits="userSpaceOnUse">
            <stop stopColor="#fff0c9" /><stop offset=".6" stopColor="#eddbb6" /><stop offset="1" stopColor="#cfb58d" />
          </linearGradient>
          <linearGradient id={`hair-${id}`} x1="132" y1="38" x2="198" y2="99" gradientUnits="userSpaceOnUse">
            <stop stopColor="#a49380" /><stop offset=".55" stopColor="#857260" /><stop offset="1" stopColor="#60503f" />
          </linearGradient>
          <linearGradient id={`trousers-${id}`} x1="116" y1="252" x2="203" y2="317" gradientUnits="userSpaceOnUse">
            <stop stopColor="#e0dfd7" /><stop offset="1" stopColor="#b8b8af" />
          </linearGradient>
        </defs>
        <ellipse cx="160" cy="397" rx="72" ry="9" fill="#000" opacity=".35" />
        <g data-part="rig">
          <g data-part="chair">
            <path d="M114 267h94" stroke="#9cac79" strokeWidth="10" strokeLinecap="round" />
            <path d="m124 272-10 118m83-118 10 118" stroke="#5d7046" strokeWidth="7" strokeLinecap="round" />
          </g>
          <g data-part="left-leg">
            <path className="avatar-leg-left" d="M136 250 133 312 130 379" stroke={`url(#trousers-${id})`} strokeWidth="29" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M118 379h26l6 15h-45c-1-9 5-15 13-15Z" fill="#564534" />
            <path d="M106 393h44" stroke="#342b23" strokeWidth="3" strokeLinecap="round" />
            <path d="m121 383 13 2" stroke="#7d6751" strokeWidth="2" strokeLinecap="round" />
          </g>
          <g data-part="right-leg">
            <path className="avatar-leg-right" d="M181 250 185 312 189 379" stroke="#c5c5bc" strokeWidth="29" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M181 379h26c9 0 14 7 15 15h-47l6-15Z" fill="#4d3e30" />
            <path d="M176 393h46" stroke="#302820" strokeWidth="3" strokeLinecap="round" />
            <path d="m189 383 13 2" stroke="#79624c" strokeWidth="2" strokeLinecap="round" />
          </g>
          <g data-part="bag">
            <path d="M207 194c9-1 16 3 17 13l-1 78c0 6-4 10-10 10h-15l-1-90c0-7 3-10 10-11Z" fill="#6d4937" />
            <path d="m214 202 2 83" stroke="#8b624b" strokeWidth="2" opacity=".65" />
            <path d="M201 268h21" stroke="#4f3428" strokeWidth="2" />
          </g>
          <g data-part="torso">
            <path d="M142 146h36v37h-36z" fill={`url(#skin-${id})`} />
            <path d="M117 180c20-15 65-15 86 0l7 78c-28 10-72 10-100 0l7-78Z" fill={`url(#polo-${id})`} />
            <path d="m139 170 21 22 20-22-7-8h-28l-6 8Z" fill="#f2e6c7" />
            <path d="m140 168-9 9 9 17m40-26 9 9-10 17" stroke="#ccd1d5" strokeWidth="2" strokeLinejoin="round" />
            <path d="M160 192v17" stroke="#1d273b" strokeWidth="3" />
            <circle cx="160" cy="199" r="1.5" fill="#aab1bb" />
            <path d="M117 256c29 6 59 6 89 0" stroke="#1c263a" strokeWidth="2" />
            <path d="M191 175c10-1 17 7 17 17l-4 57" stroke="#90674e" strokeWidth="6" strokeLinecap="round" />
            <path d="M191 175c10-1 17 7 17 17l-4 57" stroke="#ba9474" strokeWidth="1.5" strokeLinecap="round" opacity=".5" />
          </g>
          <g data-part="right-arm">
            <path d="M201 181c12 3 19 14 17 30l-23 5-6-26 12-9Z" fill="#2a374f" />
            <path d="m197 212 19-4" stroke="#c3c9cc" strokeWidth="2.5" />
            <path className="avatar-arm-right" d={resting ? "M205 211 Q216 234 196 235 L134 228" : "M205 211 Q217 233 213 237 L202 253"} stroke="#e2cfaa" strokeWidth="18" strokeLinecap="round" strokeLinejoin="round" />
            <g data-part="right-hand">
              <ellipse cx={resting ? 134 : 202} cy={resting ? 228 : 253} rx="10" ry="9" fill="#ead8b2" />
              <path d={resting ? "m128 224 12 1" : "m196 249 12 1"} stroke="#c5ac87" strokeWidth="1.2" strokeLinecap="round" />
            </g>
            <g data-part="brush">
              <path d="m204 252 7 48" stroke="#c5a574" strokeWidth="5" strokeLinecap="round" />
              <path d="m209 287 7-1 2 18-9 1z" fill="#d4ee75" />
              <circle className="brush-tip" cx="214" cy="304" r="5" fill="#d4ee75" />
            </g>
          </g>
          <g data-part="left-arm">
            <path d="M119 181c-13 2-20 13-19 30l24 5 6-26-11-9Z" fill="#35425b" />
            <path d="m102 208 20 4" stroke="#d2d6d7" strokeWidth="2.5" />
            <path className="avatar-arm-left" d={resting ? "M114 211 Q102 233 121 235 L179 224" : "M114 211 Q103 233 111 238 L120 253"} stroke="#f4e5bf" strokeWidth="18" strokeLinecap="round" strokeLinejoin="round" />
            <g data-part="left-hand">
              <ellipse cx={resting ? 179 : 120} cy={resting ? 224 : 253} rx="11" ry="9" fill="#f3e3bd" />
              <path d={resting ? "m173 220 12 1" : "m114 249 12 1"} stroke="#cbb58e" strokeWidth="1.2" strokeLinecap="round" />
            </g>
          </g>
          <g data-part="head">
            <g transform="translate(32 30.2) scale(.8)">
              <ellipse cx="114" cy="116" rx="9" ry="13" fill="#d5bd96" />
              <ellipse cx="206" cy="116" rx="9" ry="13" fill="#d5bd96" />
              <path d="M115 94c0-29 90-29 90 0v38c-2 28-19 42-45 42s-43-14-45-42V94Z" fill={`url(#skin-${id})`} />
              <ellipse cx="129" cy="132" rx="10" ry="5" fill="#e9b39b" opacity=".2" />
              <ellipse cx="190" cy="132" rx="10" ry="5" fill="#e9b39b" opacity=".2" />
              <path d="M116 132c10 4 13 1 19 6 8-6 15-9 25-9s18 3 26 9c7-5 12-3 18-6l-4 16c-5 19-18 28-40 28-24 0-37-12-42-29l-2-15Z" fill="#65513b" />
              <path d="M139 141c5-7 13-9 21-9 9 0 16 3 22 9l-4 7c-13-5-25-5-36 0l-3-7Z" fill="#55432e" />
              <path d="M140 147c11-8 30-8 42 0-2 14-12 21-22 21s-18-7-20-21Z" fill="#c3926b" />
              <path d="M143 148c11 5 24 5 36 0-4 9-9 12-18 12-8 0-14-3-18-12Z" fill="#fff9e5" />
              <path d="M148 162c8 5 17 5 25 0" stroke="#a57b58" strokeWidth="1.5" strokeLinecap="round" />
              <path d="m158 116-3 13c3 2 6 2 10 0" stroke="#c3a17b" strokeWidth="2" strokeLinecap="round" />
              <path d="M126 99c7-4 15-4 22 0m24 0c7-4 14-3 21 1" stroke="#61513e" strokeWidth="4" strokeLinecap="round" />
              <g data-part="eyes">
                <path d="M128 115c6-9 17-9 23 0-6 7-17 7-23 0Zm42 0c6-9 17-9 23 0-6 7-17 7-23 0Z" fill="#fffaf0" />
                <g data-part="pupils">
                  <ellipse cx="139" cy="115" rx="4.5" ry="6" fill="#514636" /><ellipse cx="181" cy="115" rx="4.5" ry="6" fill="#514636" />
                  <ellipse cx="139" cy="115" rx="2.5" ry="4" fill="#252720" /><ellipse cx="181" cy="115" rx="2.5" ry="4" fill="#252720" />
                  <circle cx="140" cy="112" r="1.5" fill="#fff" /><circle cx="182" cy="112" r="1.5" fill="#fff" />
                </g>
              </g>
              <g data-part="glasses" stroke="#a09d89" strokeWidth="3" fill="none">
                <rect x="122" y="104" width="33" height="24" rx="8" />
                <rect x="166" y="104" width="33" height="24" rx="8" />
                <path d="M155 111c4-3 7-3 11 0m-44 1-8-3m85 3 7-3" strokeLinecap="round" />
                <path d="m126 108 9 1m35-1 8 1" stroke="#fff9dc" strokeWidth="1.5" opacity=".6" strokeLinecap="round" />
              </g>
              <path d="M111 105c-8-6-8-15-4-22-7-6-5-16 1-20-3-8 3-15 11-17 0-9 8-15 17-13 5-8 14-10 22-5 7-9 17-8 23-1 11-4 19 1 21 10 12 0 18 7 17 17 10 5 13 14 7 23 7 8 3 18-5 22l-12 9-5-20c-12 2-24-4-31-12-7 12-18 16-29 10-4 9-13 12-24 10l-9 19Z" fill={`url(#hair-${id})`} />
              <g strokeLinecap="round" fill="none">
                <path d="M117 70c-8-5-5-15 4-17m6-12c-5 7-1 14 7 14m10-21c-8 4-9 14-2 18m17-19c7-4 14 1 13 8m12-9c-4 10 3 16 11 15m7-2c-5 7-1 16 7 17" stroke="#b09d86" strokeWidth="5" opacity=".7" />
                <path d="M115 84c6-8 13-10 20-5m4-19c-9-1-15 5-13 13m30-24c-7-2-14 4-13 11m22-15c10-3 17 5 13 13m14-3c-3 11 2 17 11 18m11-3c6 4 5 12-1 17m-61-18c7 4 15-1 17-9" stroke="#75614e" strokeWidth="5" />
                <path d="M113 95c5-4 8-9 9-14m19 3c8-2 12-7 12-13m24 5c7 7 14 9 23 7m8 7 4 10" stroke="#5d4d3d" strokeWidth="3.5" opacity=".65" />
              </g>
            </g>
          </g>
          <g data-part="laptop" className="avatar-laptop">
            <path d="M82 218h156l-12 68H95l-13-68Z" fill="#20271e" stroke="#8d9a7c" strokeWidth="2" />
            <path d="M91 226h138l-9 49H101l-10-49Z" fill="#11180f" />
            <path data-part="screen-glow" d="M91 226h138l-9 49H101l-10-49Z" fill="#d4ee75" opacity=".2" />
            <g stroke="#d4ee75" strokeWidth="3" strokeLinecap="round">
              <path className="avatar-code-line" d="M109 237h44" strokeDasharray="72" /><path className="avatar-code-line" d="M118 247h61" strokeDasharray="72" />
              <path className="avatar-code-line" d="M118 257h38" strokeDasharray="72" /><path className="avatar-code-line" d="M109 267h19" strokeDasharray="72" />
            </g>
            <path d="M75 286h170l-9 8H84l-9-8Z" fill="#a1ad92" />
          </g>
          <g data-part="hands" fill="#eedbb5">
            <ellipse cx="123" cy="284" rx="11" ry="6" /><ellipse cx="195" cy="284" rx="11" ry="6" />
          </g>
        </g>
      </svg>
    </div>
  );
}
