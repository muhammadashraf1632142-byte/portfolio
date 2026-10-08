import { ArrowIcon } from "@/components/layout/ArrowIcon";
import { SectionLabel } from "@/components/layout/SectionLabel";
import { Magnetic } from "@/components/motion/Magnetic";
import { profile } from "@/data/profile";
import { Avatar } from "@/components/motion/Avatar";
import { SceneMotion } from "@/components/motion/SceneMotion";

export function Contact() {
  return (
    <section id="contact" className="contact section-shell page-gutter" aria-labelledby="contact-heading">
      <SceneMotion>
      <SectionLabel number="08">The next conversation</SectionLabel>
      <h2 id="contact-heading" className="contact-heading" data-scene-title>
        Have an idea?<br /><span className="contact-serif">Let’s talk.</span>
      </h2>
      <div className="contact-character" data-depth="0.5"><Avatar pose="waving" /></div>
      <div className="contact-bottom">
        <p>
          An opportunity, a collaboration,<br />
          or something worth building together.
        </p>
        <Magnetic>
          <a className="contact-email" href={`mailto:${profile.email}`} data-cursor="link" data-avatar-cue="waving">
            {profile.email} <ArrowIcon />
          </a>
        </Magnetic>
      </div>
      </SceneMotion>
    </section>
  );
}
