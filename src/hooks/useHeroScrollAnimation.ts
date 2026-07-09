/**
 * GSAP ScrollTrigger — hero copy stagger + video parallax scrub.
 */

import { RefObject } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "../lib/gsapConfig";

export function useHeroScrollAnimation(
  sectionRef: RefObject<HTMLElement | null>,
  enabled: boolean
) {
  useGSAP(
    () => {
      if (!enabled || !sectionRef.current) return;

      const ctx = gsap.context(() => {
        const reveals = sectionRef.current!.querySelectorAll(".hero-reveal");
        if (reveals.length) {
          gsap.set(reveals, { opacity: 0, y: 28 });
          gsap.to(reveals, {
            opacity: 1,
            y: 0,
            duration: 0.75,
            stagger: 0.09,
            ease: "power3.out",
            scrollTrigger: {
              trigger: sectionRef.current,
              start: "top 78%",
              once: true,
            },
          });
        }

        const videoCol = sectionRef.current!.querySelector(".hero-video-col");
        if (videoCol) {
          gsap.fromTo(
            videoCol,
            { scale: 1.06 },
            {
              scale: 1,
              ease: "none",
              scrollTrigger: {
                trigger: sectionRef.current,
                start: "top bottom",
                end: "bottom top",
                scrub: 0.6,
              },
            }
          );
        }
      }, sectionRef);

      return () => ctx.revert();
    },
    { scope: sectionRef, dependencies: [enabled] }
  );
}
