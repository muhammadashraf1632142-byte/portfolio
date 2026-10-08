import Link from "next/link";
import { ArrowIcon } from "@/components/layout/ArrowIcon";

export default function NotFound() {
  return (
    <main id="main-content" className="not-found page-gutter" tabIndex={-1}>
      <p className="eyebrow">404 / A wrong turn</p>
      <h1 className="section-heading">Nothing here.<br /><span className="muted">Plenty to explore.</span></h1>
      <Link className="text-link" href="/" data-cursor="link">Back to the portfolio <ArrowIcon /></Link>
    </main>
  );
}
