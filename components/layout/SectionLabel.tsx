import type { ReactNode } from "react";

type SectionLabelProps = {
  number: string;
  children: ReactNode;
};

export function SectionLabel({ number, children }: SectionLabelProps) {
  return (
    <p className="section-label">
      <span aria-hidden="true">{number} /</span>
      {children}
    </p>
  );
}
