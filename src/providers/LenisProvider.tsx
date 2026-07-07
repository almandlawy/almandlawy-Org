/**
 * Lenis smooth scroll + GSAP ScrollTrigger sync.
 * Disabled when prefers-reduced-motion is on.
 */

import React, { useEffect, useState } from "react";
import { ReactLenis, useLenis } from "lenis/react";
import { ScrollTrigger } from "../lib/gsapConfig";
import { setLenisInstance } from "../lib/scrollNav";
import "lenis/dist/lenis.css";

function LenisGsapSync() {
  const lenis = useLenis();

  useEffect(() => {
    if (!lenis) return;

    setLenisInstance(lenis);

    const onScroll = () => ScrollTrigger.update();
    lenis.on("scroll", onScroll);

    return () => {
      lenis.off("scroll", onScroll);
      setLenisInstance(null);
    };
  }, [lenis]);

  return null;
}

export default function LenisProvider({ children }: { children: React.ReactNode }) {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => setEnabled(!mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  if (!enabled) {
    return <>{children}</>;
  }

  return (
    <ReactLenis
      root
      options={{
        lerp: 0.08,
        smoothWheel: true,
        stopInertiaOnNavigate: true,
      }}
    >
      <LenisGsapSync />
      {children}
    </ReactLenis>
  );
}
