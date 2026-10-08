import Image from "next/image";
import type { CSSProperties } from "react";
import { ArrowIcon } from "@/components/layout/ArrowIcon";
import { SectionLabel } from "@/components/layout/SectionLabel";
import { ProjectShowcase } from "@/components/motion/ProjectShowcase";
import { InteractiveType } from "@/components/motion/InteractiveType";
import { FloatingPanel } from "@/components/motion/FloatingPanel";
import { Avatar } from "@/components/motion/Avatar";
import { TransitionLink } from "@/components/motion/TransitionLink";
import { ProjectImage } from "@/components/webgl/ProjectImage";
import { projects } from "@/data/projects";

export function Projects() {
  return (
    <section id="work" className="projects" aria-labelledby="work-heading">
      <div className="work-header page-gutter">
        <SectionLabel number="03">Selected work</SectionLabel>
        <div className="work-heading-row">
          <h2 id="work-heading" className="section-heading" data-reveal>
            Less ordinary.<br /><span className="muted">More considered.</span>
          </h2>
          <p className="work-caption">Two applications.<br />Built around real interactions.</p>
        </div>
        <div className="work-intro-line" aria-hidden="true"><span>SCROLL INTO THE WORK</span><ArrowIcon direction="down" /></div>
      </div>
      <ProjectShowcase>
        {projects.map((project, index) => (
          <article key={project.slug} id={`project-${project.slug}`} className="project-panel"
            data-project-index={index} aria-labelledby={`title-${project.slug}`} tabIndex={-1}
            style={{ "--project-accent": project.accent } as CSSProperties}>
            <div className="project-panel-inner page-gutter">
              <div className="project-topline">
                <p className="eyebrow">Project {project.number} / 02</p>
                <p className="eyebrow">{project.type}</p>
              </div>
              <h3 id={`title-${project.slug}`} className="project-title"
                style={{ viewTransitionName: `title-${project.slug}` }}>
                <InteractiveType text={project.title} strength={28} /><span className="project-title-dot">.</span>
              </h3>
              <div className="project-body">
                <div className="project-meta">
                  <p className="project-description">{project.description}</p>
                  <ul className="project-stack" aria-label={`${project.title} technology stack`}>
                    {project.technologies.map((tech) => <li key={tech}><FloatingPanel depth={1.5}>{tech}</FloatingPanel></li>)}
                  </ul>
                  <TransitionLink className="text-link project-cta" href={`/projects/${project.slug}`} data-avatar-cue="pointing">
                    Explore project <ArrowIcon />
                  </TransitionLink>
                  <div className="project-character"><Avatar pose="pointing" /></div>
                </div>
                <div className="project-media-wrap"
                  style={{ "--media-ratio": project.images[0].image.width / project.images[0].image.height } as CSSProperties}>
                  <div className="project-screen-stack">
                    {project.images.slice(1, 3).map((screen, screenIndex) => (
                      <figure className={`project-depth-screen depth-screen-${screenIndex}`} key={screen.image.src}>
                        <FloatingPanel depth={1.8}>
                          <Image src={screen.image} alt={screen.alt} sizes="(max-width: 767px) 55vw, 35vw" />
                          <figcaption>{screen.caption}</figcaption>
                        </FloatingPanel>
                      </figure>
                    ))}
                    <TransitionLink href={`/projects/${project.slug}`} className="project-media-link"
                      aria-label={`Explore ${project.title}`} data-cursor="project"
                      style={{ viewTransitionName: `image-${project.slug}` }}>
                      <ProjectImage image={project.images[0].image} alt={project.images[0].alt} />
                    </TransitionLink>
                  </div>
                  <p className="project-image-caption">
                    <span>{project.images[0].caption}</span>
                    <span className="desktop-hint">Disturb. Then reconstruct. <ArrowIcon /></span>
                  </p>
                </div>
              </div>
            </div>
          </article>
        ))}
      </ProjectShowcase>
    </section>
  );
}
