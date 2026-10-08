import Link from "next/link";
import { profile } from "@/data/profile";
import { Magnetic } from "@/components/motion/Magnetic";

export function Navbar() {
  return (
    <header id="top" className="site-header page-gutter">
      <Link className="wordmark" href="/" aria-label={`${profile.name}, home`} data-cursor="link">
        m<span className="wordmark-slash">/</span>a<span className="accent">.</span>
      </Link>
      <p className="nav-location">Independent frontend<br />Cairo, Egypt</p>
      <nav aria-label="Main navigation">
        <ul className="flex items-center gap-2 sm:gap-6">
          {[
            { label: "Work", href: "/#work" },
            { label: "About", href: "/#about" },
            { label: "Contact", href: "/#contact" },
          ].map((item) => (
            <li key={item.label}>
              <Magnetic>
                <Link className="nav-link" href={item.href} data-cursor="link">{item.label}</Link>
              </Magnetic>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
