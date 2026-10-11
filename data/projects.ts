import type { StaticImageData } from "next/image";
import gatherCover from "@/public/projects/gather/Screenshot 2026-10-06 235012.png";
import gatherFeed from "@/public/projects/gather/Screenshot 2026-10-06 235951.png";
import gatherPeople from "@/public/projects/gather/Screenshot 2026-10-07 000043.png";
import gatherRegister from "@/public/projects/gather/Screenshot 2026-10-07 000154.png";
import freshcartCover from "@/public/projects/FreshCart/Screenshot 2026-10-07 000438.png";
import freshcartLogin from "@/public/projects/FreshCart/Screenshot 2026-10-07 000513.png";
import freshcartHome from "@/public/projects/FreshCart/Screenshot 2026-10-07 000615.png";
import freshcartShop from "@/public/projects/FreshCart/Screenshot 2026-10-07 000642.png";

export type ProjectImage = {
  image: StaticImageData;
  alt: string;
  caption: string;
};

export type Project = {
  slug: string;
  number: string;
  title: string;
  type: string;
  accent: string;
  description: string;
  liveUrl: string;
  technologies: readonly string[];
  highlights: readonly { title: string; description: string }[];
  images: readonly ProjectImage[];
};

export const projects: readonly Project[] = [
  {
    slug: "gather",
    number: "01",
    title: "Gather",
    type: "Social media web application",
    accent: "#b59aff",
    description:
      "A little less scrolling. A little more connection. A responsive, API-driven social frontend built around the people and moments that matter.",
    liveUrl: "https://gather-nu-bay.vercel.app",
    technologies: ["React", "JavaScript", "CSS", "REST API"],
    highlights: [
      { title: "Connected experiences", description: "Posts, comments, profiles, notifications, and saved posts, connected through REST APIs." },
      { title: "Every state considered", description: "Structured loading, error, and empty states keep the interface clear as content changes." },
      { title: "Reusable by intention", description: "Shared components, hooks, and API services give the social features a consistent structure." },
    ],
    images: [
      { image: gatherFeed, alt: "Gather home feed with post composer, navigation, and suggested connections.", caption: "The feed, built around connection" },
      { image: gatherPeople, alt: "Gather people discovery screen with follow controls.", caption: "Finding your people" },
      { image: gatherRegister, alt: "Gather registration screen with structured account fields.", caption: "A considered account flow" },
      { image: gatherCover, alt: "Gather login screen with its violet identity and two-column layout.", caption: "A welcoming entry point" },
    ],
  },
  {
    slug: "freshcart",
    number: "02",
    title: "FreshCart",
    type: "E-commerce web application",
    accent: "#92d9ad",
    description:
      "Everyday essentials. A considered shopping flow. A responsive storefront with product discovery, authentication, and API-driven cart interactions.",
    liveUrl: "https://fresh-cart-rho-lovat.vercel.app",
    technologies: ["Next.js", "React", "Tailwind CSS", "JavaScript", "REST API"],
    highlights: [
      { title: "From browsing to cart", description: "Product browsing, authentication, and cart flows connect the core shopping experience." },
      { title: "An API-driven frontend", description: "REST API integration and shared application state bring product and account data into the interface." },
      { title: "Built to adapt", description: "Reusable components, responsive layouts, and structured forms keep the experience consistent across screens." },
    ],
    images: [
      { image: freshcartCover, alt: "FreshCart storefront hero with green product panels and shopping actions.", caption: "A fresh first impression" },
      { image: freshcartShop, alt: "FreshCart product listing with search, filters, and product imagery.", caption: "Product discovery, made clear" },
      { image: freshcartHome, alt: "FreshCart homepage with fresh produce photography and category navigation.", caption: "The storefront in context" },
      { image: freshcartLogin, alt: "FreshCart login page with green editorial artwork and sign-in form.", caption: "A connected account experience" },
    ],
  },
];

export function getProject(slug: string) {
  return projects.find((project) => project.slug === slug);
}
