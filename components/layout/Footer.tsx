import { ArrowIcon } from "./ArrowIcon";
import { profile } from "@/data/profile";

export function Footer() {
  return (
    <footer className="site-footer page-gutter">
      <p>© {profile.name}</p>
      <p className="footer-note">Code with structure. Interfaces with purpose.</p>
      <a className="text-link" href="#top" data-cursor="link">
        Back to top <ArrowIcon />
      </a>
    </footer>
  );
}
