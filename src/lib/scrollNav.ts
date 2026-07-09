/**
 * Lenis-aware scroll helpers — fall back to native scroll when Lenis is off.
 */

import type Lenis from "lenis";

const SECTION_ALIASES: Record<string, string> = {
  home: "hero",
  about: "about",
  contact: "contact",
};

let lenisInstance: Lenis | null = null;

export function setLenisInstance(instance: Lenis | null) {
  lenisInstance = instance;
}

export function scrollToTop(immediate = false) {
  if (lenisInstance) {
    lenisInstance.scrollTo(0, { immediate, force: immediate });
    return;
  }
  window.scrollTo({ top: 0, behavior: immediate ? "auto" : "smooth" });
}

export function scrollToElement(el: HTMLElement, immediate = false) {
  if (lenisInstance) {
    lenisInstance.scrollTo(el, { offset: 0, immediate, force: immediate });
    return;
  }
  el.scrollIntoView({ behavior: immediate ? "auto" : "smooth", block: "start" });
}

export function scrollToSection(sectionId: string, immediate = false) {
  const target = SECTION_ALIASES[sectionId] || sectionId;
  const el = document.getElementById(target);
  if (el) {
    scrollToElement(el, immediate);
  } else if (target === "hero") {
    scrollToTop(immediate);
  }
}
