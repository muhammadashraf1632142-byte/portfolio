import { ArrowIcon } from "@/components/layout/ArrowIcon";
import { InteractiveType } from "@/components/motion/InteractiveType";
import { Magnetic } from "@/components/motion/Magnetic";
import { profile } from "@/data/profile";
import { Avatar } from "@/components/motion/Avatar";

export function Hero() {
  return (
    <section className="hero page-gutter" aria-labelledby="hero-heading">
      <div className="hero-intro">
        <p className="eyebrow">Muhammad Ashraf / Frontend developer</p>
        <p className="hero-edition eyebrow">Selected work — Vol. 01</p>
      </div>
      <h1 id="hero-heading" className="hero-heading" aria-label="Interfaces. Built to feel right.">
        <span className="reveal-mask" aria-hidden="true">
          <span className="reveal-line"><InteractiveType text="Interfaces." /></span>
        </span>
        <span className="reveal-mask" aria-hidden="true">
          <span className="reveal-line">
            <InteractiveType text="Built to feel" />{" "}
            <span className="hero-serif"><InteractiveType text="right." /></span>
          </span>
        </span>
      </h1>
      <div className="hero-bottom">
        <p className="hero-description">
          I build responsive, interactive web experiences
          with React and Next.js. Thoughtful code.
          A feeling for the details.
        </p>
        <Magnetic>
          <a className="round-link" href="#work" data-cursor="link" data-avatar-cue="pointing">
            <span>Explore<br />the work</span>
            <ArrowIcon direction="down" />
          </a>
        </Magnetic>
        <div className="hero-side-note">
          <div className="hero-character"><Avatar pose="looking" /></div>
          <p className="eyebrow">Code. Craft. Interaction.</p>
          <a className="text-link cv-link" href={profile.cv} download data-cursor="link">
            Download CV <span className="muted">(PDF)</span> <ArrowIcon direction="down" />
          </a>
        </div>
      </div>
      <div className="hero-baseline"><span>Scroll to discover</span><span>Code / Craft / Curiosity</span></div>
    </section>
  );
}
