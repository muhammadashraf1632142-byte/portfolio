"use client";

import { useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { capabilities } from "@/data/capabilities";
import { SectionLabel } from "@/components/layout/SectionLabel";
import { FloatingPanel } from "@/components/motion/FloatingPanel";
import { SceneMotion } from "@/components/motion/SceneMotion";
import { useMediaQuery } from "@/components/motion/useMotionCapabilities";

export function Skills() {
  const [active, setActive] = useState(0);
  const tabs = useRef<HTMLDivElement>(null);
  const reduced = useMediaQuery("(prefers-reduced-motion: reduce)");
  const category = capabilities[active];
  return (
    <section id="capabilities" className="skills-scene visual-scene page-gutter" aria-labelledby="skills-heading">
      <SceneMotion>
        <SectionLabel number="04">What I work with</SectionLabel>
        <h2 id="skills-heading" className="section-heading" data-scene-title>A connected toolkit.<br /><span className="muted">A frontend focus.</span></h2>
        <div
          ref={tabs}
          className="capability-tabs"
          role="tablist"
          aria-label="Capability categories"
          onKeyDown={(event) => {
            const next = event.key === "ArrowRight" ? (active + 1) % capabilities.length
              : event.key === "ArrowLeft" ? (active + capabilities.length - 1) % capabilities.length
              : event.key === "Home" ? 0 : event.key === "End" ? capabilities.length - 1 : null;
            if (next === null) return;
            event.preventDefault(); setActive(next);
            (tabs.current?.children[next] as HTMLButtonElement)?.focus();
          }}
        >
          {capabilities.map((group, index) => (
            <button type="button" key={group.id} id={`tab-${group.id}`} role="tab"
              aria-selected={active === index} aria-controls={`panel-${group.id}`} tabIndex={active === index ? 0 : -1}
              onClick={() => setActive(index)} data-cursor="link">
              <span>{String(index + 1).padStart(2, "0")}</span>{group.title}
            </button>
          ))}
        </div>
        <div className="capability-space">
          <div className="capability-rings" aria-hidden="true"><span /><span /></div>
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={category.id}
              id={`panel-${category.id}`}
              role="tabpanel"
              tabIndex={0}
              aria-labelledby={`tab-${category.id}`}
              className="capability-cloud"
              initial={reduced ? false : { opacity: 0, rotateX: 18, y: 30 }}
              animate={{ opacity: 1, rotateX: 0, y: 0 }}
              exit={reduced ? { opacity: 1 } : { opacity: 0, rotateX: -12, y: -20 }}
              transition={{ duration: reduced ? 0 : 0.35 }}
            >
              {category.items.map((item, index) => (
                <FloatingPanel className={`tech-label tech-label-${index}`} key={item} depth={1.5}>
                  <span className="tech-index">{String(index + 1).padStart(2, "0")}</span>
                  <span>{item}</span>
                </FloatingPanel>
              ))}
            </motion.div>
          </AnimatePresence>
          <p className="capability-note">{category.note}</p>
        </div>
      </SceneMotion>
    </section>
  );
}
