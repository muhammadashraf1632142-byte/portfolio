import { SectionLabel } from "@/components/layout/SectionLabel";

const capabilities = [
  { label: "Frontend", items: "React / Next.js / JavaScript / Tailwind CSS" },
  { label: "Foundations", items: "Responsive interfaces / Reusable components / REST APIs" },
  { label: "In practice", items: "State management / Form validation / UI polish" },
];

export function About() {
  return (
    <section id="about" className="about section-shell page-gutter" aria-labelledby="about-heading">
      <SectionLabel number="02">Behind the interface</SectionLabel>
      <div className="about-content">
        <h2 id="about-heading" className="statement-heading" data-reveal>
          Code with structure.<br />
          <span className="muted">Interfaces with purpose.</span>
        </h2>
        <div className="about-copy">
          <p>
            I’m Muhammad, a frontend developer in Cairo focused on React and
            Next.js. I enjoy turning ideas into responsive interfaces, reusable
            components, and applications that work with real data.
          </p>
          <p>
            This portfolio is a space to explore the expressive side of the web:
            interaction, creative coding, and the small details that make an
            interface feel considered.
          </p>
        </div>
        <dl className="practice-list">
          {capabilities.map((capability) => (
            <div key={capability.label}>
              <dt>{capability.label}</dt><dd>{capability.items}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
