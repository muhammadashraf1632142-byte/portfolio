import Image from "next/image";
import { Avatar } from "@/components/motion/Avatar";
import { SceneMotion } from "@/components/motion/SceneMotion";
import { FloatingPanel } from "@/components/motion/FloatingPanel";
import { SectionLabel } from "@/components/layout/SectionLabel";
import { projects } from "@/data/projects";

export function Coding() {
  return (
    <section id="coding" className="coding-scene visual-scene page-gutter" aria-labelledby="coding-heading">
      <SceneMotion>
        <div className="scene-heading-row">
          <div>
            <SectionLabel number="01">Inside the build</SectionLabel>
            <h2 id="coding-heading" className="section-heading" data-scene-title>From a thought.<br /><span className="muted">To something real.</span></h2>
          </div>
          <p className="scene-note">Components, state, and a little curiosity.<br />Move through the workspace.</p>
        </div>
        <div className="coding-workspace">
          <div className="coding-orbit" aria-hidden="true"><span /><span /><span /></div>
          <div className="coding-character" data-depth="0.45"><Avatar pose="typing" /></div>
          <div className="code-panel-position" data-depth="1.1">
            <FloatingPanel className="code-panel">
              <div className="window-bar"><span className="window-dots" aria-hidden="true"><i /><i /><i /></span><span>interface.tsx</span></div>
              <pre><code><span className="code-purple">const</span>{" experience = {\n"}{"  structure: "}<span className="accent">&quot;reusable&quot;</span>{",\n"}{"  data: "}<span className="accent">&quot;connected&quot;</span>{",\n"}{"  details: "}<span className="accent">&quot;considered&quot;</span>{"\n};"}</code></pre>
              <div className="code-caret" aria-hidden="true" />
            </FloatingPanel>
          </div>
          <div className="browser-panel-position" data-depth="1.5">
            <FloatingPanel className="browser-panel" depth={1.3}>
              <div className="window-bar"><span>Gather / Feed</span><span className="window-status">Live interface</span></div>
              <Image src={projects[0].images[0].image} alt="The actual Gather feed, shown in the coding workspace." sizes="(min-width: 768px) 32vw, 72vw" placeholder="blur" />
            </FloatingPanel>
          </div>
          <div className="terminal-panel-position" data-depth="0.8">
            <FloatingPanel className="terminal-panel">
              <span className="eyebrow muted">A clear flow</span>
              <div className="terminal-flow"><span>fetch()</span><span>→</span><span>state</span><span>→</span><span>render</span></div>
              <span className="terminal-prompt accent">_<span className="sr-only"> Terminal prompt</span></span>
            </FloatingPanel>
          </div>
          <p className="workspace-caption eyebrow">Thinking in components. Building in layers.</p>
        </div>
      </SceneMotion>
    </section>
  );
}
