"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

const INTERACTIVE_TARGETS = [
  ".hero",
  ".trust-bar",
  "main > .section",
  "main > .cta-banner",
  ".footer",
  ".hero-badge",
  ".hero-card",
  ".hero-card-metrics > div",
  ".trust-item",
  ".service-card",
  "#bbb .bbb-card",
  "#bbb .review-card",
  "#areas .area-chip",
  ".grid-4 .info-card",
  ".quote-form"
].join(", ");

export default function SiteInteractivity() {
  const pathname = usePathname();

  useEffect(() => {
    if (pathname.startsWith("/admin")) return;

    const elements = Array.from(
      document.querySelectorAll<HTMLElement>(INTERACTIVE_TARGETS)
    );
    if (!elements.length) return;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    elements.forEach((element, index) => {
      element.classList.add("scroll-highlight-target");
      element.style.setProperty(
        "--highlight-delay",
        `${Math.min((index % 6) * 40, 200)}ms`
      );
    });

    if (prefersReducedMotion || !("IntersectionObserver" in window)) {
      elements.forEach((element) => element.classList.add("is-inview"));
      return () => {
        elements.forEach((element) => {
          element.classList.remove("scroll-highlight-target", "is-inview");
          element.style.removeProperty("--highlight-delay");
        });
      };
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const target = entry.target as HTMLElement;
          target.classList.toggle("is-inview", entry.isIntersecting);
        });
      },
      {
        threshold: 0.18,
        rootMargin: "0px 0px -8% 0px"
      }
    );

    elements.forEach((element) => observer.observe(element));

    return () => {
      observer.disconnect();
      elements.forEach((element) => {
        element.classList.remove("scroll-highlight-target", "is-inview");
        element.style.removeProperty("--highlight-delay");
      });
    };
  }, [pathname]);

  return null;
}
