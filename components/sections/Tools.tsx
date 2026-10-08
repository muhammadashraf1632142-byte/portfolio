import { SceneMotion } from "@/components/motion/SceneMotion";
import { FloatingPanel } from "@/components/motion/FloatingPanel";
import { SectionLabel } from "@/components/layout/SectionLabel";

export function Tools() {
  return (
    <section id="stack" className="tools-scene visual-scene page-gutter" aria-labelledby="tools-heading">
      <SceneMotion>
        <SectionLabel number="07">The everyday stack</SectionLabel>
        <h2 id="tools-heading" className="section-heading" data-scene-title>Ideas become components.<br /><span className="muted">Components become experiences.</span></h2>
        <div className="stack-machine">
          <div className="stack-rail" aria-hidden="true" />
          {[
            { name: "React", caption: "Compose the interface", mark: "{ }" },
            { name: "Next.js", caption: "Give it a structure", mark: "/" },
            { name: "JavaScript", caption: "Connect the behavior", mark: "JS" },
            { name: "CSS", caption: "Consider the surface", mark: "*" },
          ].map((tool, index) => (
            <div className="stack-position" data-depth={0.3 + index * 0.25} key={tool.name}>
              <FloatingPanel className="stack-tool" depth={1.3}>
                <span className="stack-mark" aria-hidden="true">{tool.mark}</span>
                <h3>{tool.name}</h3><p>{tool.caption}</p>
              </FloatingPanel>
            </div>
          ))}
        </div>
        <div className="stack-bottom"><span>Git / GitHub / VS Code / Vercel</span><span>From the editor to the browser.</span></div>
      </SceneMotion>
    </section>
  );
}
