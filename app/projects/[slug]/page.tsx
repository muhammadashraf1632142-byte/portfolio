import type { CSSProperties } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { projects, getProject } from "@/data/projects";
import { ArrowIcon } from "@/components/layout/ArrowIcon";
import { SectionLabel } from "@/components/layout/SectionLabel";
import { TransitionLink } from "@/components/motion/TransitionLink";
import { ProjectImage } from "@/components/webgl/ProjectImage";
import { ProjectGallery } from "@/components/ui/ProjectGallery";

type ProjectPageProps = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return projects.map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({ params }: ProjectPageProps): Promise<Metadata> {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) notFound();
  return { title: project.title, description: project.description };
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) notFound();
  const next = projects[(projects.indexOf(project) + 1) % projects.length];

  return (
    <main
      id="main-content"
      className="project-detail"
      tabIndex={-1}
      style={{ "--project-accent": project.accent } as CSSProperties}
    >
      <section className="detail-hero page-gutter" aria-labelledby="detail-heading">
        <TransitionLink className="text-link back-link" href="/#work">
          <ArrowIcon /> Back to selected work
        </TransitionLink>
        <div className="detail-topline eyebrow"><span>Project {project.number} / 02</span><span>{project.type}</span></div>
        <h1 id="detail-heading" className="detail-title" style={{ viewTransitionName: `title-${project.slug}` }}>
          {project.title}<span className="project-title-dot">.</span>
        </h1>
        <div className="detail-summary">
          <p>{project.description}</p>
          <dl>
            <div><dt>Role</dt><dd>Frontend development</dd></div>
            <div><dt>Stack</dt><dd>{project.technologies.join(" / ")}</dd></div>
          </dl>
          <a className="text-link live-link" href={project.liveUrl} target="_blank" rel="noopener noreferrer" data-cursor="link">
            Visit live site <ArrowIcon /><span className="sr-only"> (opens in a new tab)</span>
          </a>
        </div>
        <div className="detail-cover" style={{ viewTransitionName: `image-${project.slug}` }}>
          <ProjectImage image={project.images[0].image} alt={project.images[0].alt} priority />
        </div>
      </section>

      <section className="detail-highlights section-shell page-gutter" aria-labelledby="highlights-heading">
        <div>
          <SectionLabel number="01">The frontend underneath</SectionLabel>
          <h2 id="highlights-heading" className="statement-heading" data-reveal>Built beyond<br /><span className="muted">the first impression.</span></h2>
        </div>
        <ol className="highlight-list">
          {project.highlights.map((highlight, index) => (
            <li key={highlight.title}>
              <span className="eyebrow">{String(index + 1).padStart(2, "0")}</span>
              <div><h3>{highlight.title}</h3><p>{highlight.description}</p></div>
            </li>
          ))}
        </ol>
      </section>

      <section className="detail-gallery page-gutter" aria-label={`${project.title} interface screenshots`}>
        <ProjectGallery images={project.images.slice(1)} title={project.title} />
      </section>

      <section className="next-project section-shell page-gutter" aria-labelledby="next-project-heading">
        <p className="eyebrow">Keep exploring / Next project</p>
        <TransitionLink href={`/projects/${next.slug}`} className="next-project-link" data-cursor="project">
          <h2 id="next-project-heading">{next.title}<span className="accent">.</span></h2>
          <ArrowIcon />
        </TransitionLink>
      </section>
    </main>
  );
}
