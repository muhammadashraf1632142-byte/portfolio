"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Avatar } from "@/components/motion/Avatar";
import { SectionLabel } from "@/components/layout/SectionLabel";
import { SceneMotion } from "@/components/motion/SceneMotion";
import { Magnetic } from "@/components/motion/Magnetic";

gsap.registerPlugin(ScrollTrigger);

const steps = [
  { title: "Understand", line: "Start with the purpose.", note: "What should the interface help someone do?" },
  { title: "Structure", line: "Give the idea a foundation.", note: "Break the interface into clear, reusable parts." },
  { title: "Build", line: "Make the pieces connect.", note: "Bring components, state, and real data together." },
  { title: "Refine", line: "Stay for the small details.", note: "Check small screens, keyboard access, and every state." },
];

export function Process() {
  const root = useRef<HTMLElement>(null);
  const line = useRef<SVGPathElement>(null);
  const [active, setActive] = useState(0);
  useEffect(() => {
    const media = gsap.matchMedia();
    media.add("(min-width: 768px) and (prefers-reduced-motion: no-preference)", () => {
      const path = line.current;
      if (!path) return;
      const length = path.getTotalLength();
      const context = gsap.context(() => {
        gsap.fromTo(path, { strokeDasharray: length, strokeDashoffset: length }, {
          strokeDashoffset: 0, ease: "none",
          scrollTrigger: {
            trigger: root.current, start: "top 70%", end: "bottom 35%", scrub: 0.6,
            onUpdate: (self) => setActive(Math.min(3, Math.floor(self.progress * 4))),
          },
        });
      }, root);
      return () => context.revert();
    });
    return () => media.revert();
  }, []);
  return (
    <section ref={root} id="process" className="process-scene visual-scene page-gutter" aria-labelledby="process-heading">
      <SceneMotion>
        <div className="scene-heading-row">
          <div>
            <SectionLabel number="06">How I build</SectionLabel>
            <h2 id="process-heading" className="section-heading" data-scene-title>A clear path.<br /><span className="muted">Room to explore.</span></h2>
          </div>
          <p className="scene-note">An idea is the beginning.<br />The details make it work.</p>
        </div>
        <div className="process-map">
          <svg className="process-connector" viewBox="0 0 1200 160" fill="none" preserveAspectRatio="none" aria-hidden="true">
            <path d="M10 80C160-65 270 225 400 80S640-65 790 80s220 145 400 0" stroke="#30382a" strokeWidth="2" />
            <path ref={line} d="M10 80C160-65 270 225 400 80S640-65 790 80s220 145 400 0" stroke="#d4ee75" strokeWidth="2" />
          </svg>
          <div className="process-steps">
            {steps.map((step, index) => (
              <button type="button" key={step.title} className="process-step" aria-pressed={active === index}
                onClick={() => setActive(index)} data-cursor="link" data-avatar-cue="pointing">
                <Magnetic><span className="process-node"><span>{String(index + 1).padStart(2, "0")}</span></span></Magnetic>
                <span className="process-step-title">{step.title}</span>
                <span className="process-step-line">{step.line}</span>
              </button>
            ))}
          </div>
          <div className="process-insight">
            <div className="process-character" data-depth="0.4"><Avatar pose="walking" /></div>
            <p aria-live="polite">{steps[active].note}</p>
            <span className="process-counter" aria-hidden="true">{String(active + 1).padStart(2, "0")}</span>
          </div>
        </div>
      </SceneMotion>
    </section>
  );
}
