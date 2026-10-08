import { SceneMotion } from "@/components/motion/SceneMotion";
import { ArrowIcon } from "@/components/layout/ArrowIcon";

export function Identity() {
  return (
    <section id="identity" className="identity-scene" aria-labelledby="identity-heading">
      <SceneMotion>
        <div className="identity-top page-gutter">
          <p className="eyebrow">A person behind the pixels</p>
          <p className="eyebrow muted">Cairo, Egypt / Open to the world</p>
        </div>
        <h2 id="identity-heading" className="identity-name" data-scene-title>Muhammad<br /><span>Ashraf.</span></h2>
        <div className="identity-bottom page-gutter">
          <p>Frontend developer.<br />Curious about what the web can feel like.</p>
          <a className="text-link" href="#coding" data-cursor="link">Inside my world <ArrowIcon direction="down" /></a>
        </div>
        <div className="scene-line" data-scene-line />
      </SceneMotion>
    </section>
  );
}
