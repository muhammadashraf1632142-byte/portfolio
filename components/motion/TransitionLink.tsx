"use client";

import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";
import { usePageTransition } from "./MotionProvider";

type TransitionLinkProps = {
  href: string;
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  "aria-label"?: string;
  "data-cursor"?: string;
};

export function TransitionLink({ href, children, ...props }: TransitionLinkProps) {
  const transition = usePageTransition();
  return (
    <Link
      href={href}
      data-cursor="link"
      {...props}
      onClick={(event) => {
        if (!transition || !document.startViewTransition ||
          event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
        event.preventDefault();
        transition(href);
      }}
    >
      {children}
    </Link>
  );
}
