/**
 * GSAP ScrollTrigger — batched desk service card reveals.
 */

import { RefObject } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, ScrollTrigger } from "../lib/gsapConfig";

export function useDeskServicesScrollAnimation(
  sectionRef: RefObject<HTMLElement | null>,
  enabled: boolean
) {
  useGSAP(
    () => {
      if (!enabled || !sectionRef.current) return;

      const ctx = gsap.context(() => {
        const header = sectionRef.current!.querySelector(".desk-services-header");
        if (header) {
          gsap.from(header, {
            opacity: 0,
            y: 24,
            duration: 0.65,
            ease: "power2.out",
            scrollTrigger: {
              trigger: header,
              start: "top 85%",
              once: true,
            },
          });
        }

        const cards = sectionRef.current!.querySelectorAll(".desk-service-card");
        if (!cards.length) return;

        gsap.set(cards, { opacity: 0, y: 36 });

        ScrollTrigger.batch(cards, {
          onEnter: (batch) => {
            gsap.to(batch, {
              opacity: 1,
              y: 0,
              duration: 0.55,
              stagger: 0.1,
              overwrite: true,
              ease: "power2.out",
            });
          },
          start: "top 90%",
          once: true,
        });
      }, sectionRef);

      return () => ctx.revert();
    },
    { scope: sectionRef, dependencies: [enabled] }
  );
}
