"use client";

import dynamic from "next/dynamic";
import { createContext, useCallback, useContext, useEffect, useRef, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useDesktopMotion } from "./useMotionCapabilities";

const MotionRuntime = dynamic(() => import("./MotionRuntime"), { ssr: false });
const TransitionContext = createContext<((href: string) => void) | null>(null);

export function usePageTransition() {
  return useContext(TransitionContext);
}

export function MotionProvider({ children }: { children: ReactNode }) {
  const enabled = useDesktopMotion();
  const pathname = usePathname();
  const router = useRouter();
  const pending = useRef<{ resolve: () => void; timer: ReturnType<typeof setTimeout> } | null>(null);
  const transition = useCallback((href: string) => {
    if (!enabled || !document.startViewTransition || pending.current) {
      router.push(href);
      return;
    }
    document.startViewTransition(() => new Promise<void>((resolve) => {
      const finish = () => {
        if (pending.current) clearTimeout(pending.current.timer);
        pending.current = null;
        resolve();
      };
      pending.current = { resolve: finish, timer: setTimeout(finish, 1800) };
      router.push(href);
    }));
  }, [enabled, router]);

  useEffect(() => {
    pending.current?.resolve();
  }, [pathname]);

  useEffect(() => () => pending.current?.resolve(), []);

  return (
    <TransitionContext.Provider value={transition}>
      {children}
      {enabled ? <MotionRuntime /> : null}
    </TransitionContext.Provider>
  );
}
