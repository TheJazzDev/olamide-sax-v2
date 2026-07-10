/* ============================================================================
   reveal.js — Olamide Sax V2 · GSAP + ScrollTrigger reveals + kinetic type
   ----------------------------------------------------------------------------
   The heart of the motion foundation. Exports initReveals().

   PROGRESSIVE ENHANCEMENT GATE (the a11y contract):
   Nothing here runs — and the CSS pre-state gate `.js-anim-ready` is NEVER
   added — unless BOTH are true:
     (1) window.gsap + ScrollTrigger actually loaded, and
     (2) motion is allowed (no prefers-reduced-motion).
   If either fails, we return early and every [data-animate] element renders in
   its final, fully-visible state (motion.css only hides things UNDER the gate).

   What it does when live:
   - Adds html.js-anim-ready (arms the CSS pre-states).
   - Cinematic page-LOAD sequence on each page's hero (staged, on first paint).
   - [data-animate="fade"] → soft fade+rise on scroll, staggering siblings.
   - Kinetic "breathing" split-text on hero titles / [data-animate="split"] /
     [data-animate="hero-title"] / [data-animate="kinetic-line"] with a
     phrased (non-uniform) stagger. Real text stays in the a11y tree.
   - One subtle scroll-velocity "breathing" headline per view (bounded, slow).
   - Craft movements, timeline nodes, featured sections reveal softly.
   ========================================================================== */

import { $, $$, prefersReducedMotion } from "./utils.js";
import { splitToWords, splitByExistingLines } from "./splitText.js";

const READY_CLASS = "js-anim-ready";

/** Both guards must pass for any motion / pre-state to apply. */
function engineLive() {
  return (
    typeof window !== "undefined" &&
    window.gsap &&
    window.ScrollTrigger &&
    !prefersReducedMotion()
  );
}

export function initReveals() {
  if (!engineLive()) return; // PE: content shows in final state, no gate class.

  const gsap = window.gsap;
  const ScrollTrigger = window.ScrollTrigger;
  gsap.registerPlugin(ScrollTrigger);

  // Arm the CSS pre-states ONLY now that GSAP + motion are confirmed.
  document.documentElement.classList.add(READY_CLASS);

  // Force a clean starting frame so the pre-states are painted before we animate.
  gsap.set("[data-animate='fade'], .reveal-item", { clearProps: "" });

  buildHeroLoad(gsap);
  buildKineticType(gsap, ScrollTrigger);
  buildScrollReveals(gsap, ScrollTrigger);
  buildCraftAndNodes(gsap, ScrollTrigger);
  buildBreathingHeadline(gsap, ScrollTrigger);

  // Layout settles after fonts + images — refresh so triggers use final geometry.
  const refresh = () => ScrollTrigger.refresh();
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(refresh);
  }
  window.addEventListener("load", refresh, { once: true });
}

/* ── Cinematic page-LOAD hero sequence (distinct from scroll reveals) ─────── */
function buildHeroLoad(gsap) {
  const hero = $("[data-animate='hero']") || $(".hero");
  if (!hero) return;

  const eyebrow = $(".hero__eyebrow, .archive-head__eyebrow, .eyebrow", hero);
  const meta = $(".hero__meta", hero);
  const cue = $(".hero__cue", hero);
  const portrait = $(".hero__portrait, .archive-head__media", hero);

  const tl = gsap.timeline({
    defaults: { ease: "power3.out", duration: 0.9 },
    delay: 0.15,
  });

  if (eyebrow) {
    gsap.set(eyebrow, { opacity: 0, y: 16 });
    tl.to(eyebrow, { opacity: 1, y: 0, duration: 0.7 }, 0);
  }
  // The hero title itself is handled by buildKineticType (split words), which
  // we cue slightly after the eyebrow via its own load trigger.
  if (meta) {
    gsap.set(meta, { opacity: 0, y: 14 });
    tl.to(meta, { opacity: 1, y: 0 }, 0.55);
  }
  if (cue) {
    gsap.set(cue, { opacity: 0, y: 10 });
    tl.to(cue, { opacity: 1, y: 0, duration: 0.7 }, 0.75);
  }
  if (portrait) {
    gsap.set(portrait, { opacity: 0, y: 24, scale: 1.02 });
    tl.to(portrait, { opacity: 1, y: 0, scale: 1, duration: 1.1 }, 0.2);
  }
}

/* ── Kinetic "breathing" split-text reveals (phrased, musical stagger) ────── */
function buildKineticType(gsap, ScrollTrigger) {
  // Hero title: reveal its existing line spans on LOAD, phrased.
  const heroTitle = $("[data-animate='hero-title']");
  if (heroTitle) {
    const hasLineSpans = heroTitle.querySelector(".hero__title-line");
    const split = hasLineSpans
      ? splitByExistingLines(heroTitle, ".hero__title-line")
      : splitToWords(heroTitle);

    gsap.set(split.words, { yPercent: 110, opacity: 0 });
    gsap.to(split.words, {
      yPercent: 0,
      opacity: 1,
      duration: 1.1,
      ease: "power4.out",
      // Phrased stagger: not a uniform march — a musical "swing".
      stagger: { each: 0.14, ease: "sine.inOut" },
      delay: 0.35,
    });
  }

  // Other kinetic lines / explicit splits: reveal on scroll, phrased.
  const splitTargets = $$(
    "[data-animate='split'], [data-animate='kinetic-line']"
  );
  splitTargets.forEach((el) => {
    const split = splitToWords(el);
    gsap.set(split.words, { yPercent: 60, opacity: 0 });
    gsap.to(split.words, {
      yPercent: 0,
      opacity: 1,
      duration: 0.9,
      ease: "power3.out",
      stagger: { each: 0.05, from: "start", ease: "sine.inOut" },
      scrollTrigger: {
        trigger: el,
        start: "top 82%",
        toggleActions: "play none none none",
      },
    });
  });
}

/* ── Generic scroll fade reveals ([data-animate='fade'] + section content) ── */
function buildScrollReveals(gsap, ScrollTrigger) {
  // Explicit fade hooks — stagger siblings that share a parent container.
  const fades = $$("[data-animate='fade']");
  const byParent = new Map();
  fades.forEach((el) => {
    const key = el.parentElement || document.body;
    if (!byParent.has(key)) byParent.set(key, []);
    byParent.get(key).push(el);
  });
  byParent.forEach((group) => {
    gsap.to(group, {
      opacity: 1,
      y: 0,
      duration: 0.9,
      ease: "power3.out",
      stagger: 0.12,
      scrollTrigger: {
        trigger: group[0],
        start: "top 85%",
        toggleActions: "play none none none",
      },
    });
  });

  // Section-level [data-animate] hooks (statement, roots, featured-*, press,
  // etc.): softly rise their meaningful inner content. We tag reveal-item onto
  // the section's direct content children so the section box stays laid out
  // (protecting sticky offsets + anchor targets), then animate those.
  const SECTION_HOOKS = [
    "statement",
    "roots",
    "featured-perf",
    "featured-video",
    "featured-gallery",
    "featured-press",
    "timeline-teaser",
    "invitation",
    "sound",
    "genres",
    "repertoire",
    "participatory",
    "contexts",
    "movements",
    "about-quote",
    "performances",
    "videos",
    "press",
    "gallery",
    "contact",
    "archive-head",
  ];

  SECTION_HOOKS.forEach((name) => {
    $$(`[data-animate='${name}']`).forEach((section) => {
      const container = $(".container", section) || section;
      // Reveal the container's direct children as staggered items, but skip
      // decorative holds and already-split kinetic lines.
      const items = Array.from(container.children).filter((c) => {
        if (c.matches("[data-animate='kinetic-line'], [data-animate='split']"))
          return false;
        if (c.classList.contains("statement__hold")) return false;
        return true;
      });
      if (!items.length) return;
      items.forEach((c) => c.classList.add("reveal-item"));
      gsap.to(items, {
        opacity: 1,
        y: 0,
        duration: 0.85,
        ease: "power3.out",
        stagger: 0.1,
        scrollTrigger: {
          trigger: section,
          start: "top 80%",
          toggleActions: "play none none none",
        },
      });
    });
  });
}

/* ── Craft movements + timeline nodes: soft cinematic rise ────────────────── */
function buildCraftAndNodes(gsap, ScrollTrigger) {
  $$("[data-craft-movement]").forEach((el) => {
    gsap.to(el, {
      opacity: 1,
      y: 0,
      duration: 1,
      ease: "power3.out",
      scrollTrigger: {
        trigger: el,
        start: "top 80%",
        toggleActions: "play none none none",
      },
    });
  });

  const nodes = $$("[data-timeline-node]");
  if (nodes.length) {
    // Group so consecutive nodes phrase in, rather than each firing alone.
    ScrollTrigger.batch(nodes, {
      start: "top 88%",
      onEnter: (batch) =>
        gsap.to(batch, {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: "power3.out",
          stagger: 0.12,
          overwrite: true,
        }),
    });
  }
}

/* ── ONE subtle scroll-velocity "breathing" headline per view ─────────────── */
/* Elegant, slow, bounded — letters/lines drift on fast scroll and settle on
   pause. Never bouncy. We pick the hero title if present, else the first
   kinetic line. */
function buildBreathingHeadline(gsap, ScrollTrigger) {
  const target =
    $("[data-animate='hero-title'] .hero__title-line") &&
    $("[data-animate='hero-title']");
  const el = target || $("[data-animate='kinetic-line']");
  if (!el) return;

  const units =
    $$(".split-word", el).length > 0 ? $$(".split-word", el) : [el];

  // Transform-only breathing (compositor-friendly, no layout reflow): a gentle
  // lift + a whisper of vertical "swell" — like a held note. Keep off any
  // layout-triggering property (e.g. letter-spacing) to protect 60fps.
  units.forEach((u) => {
    u.style.willChange = "transform";
    u.style.transformOrigin = "center bottom";
  });
  let yTo = units.map((u) =>
    gsap.quickTo(u, "y", { duration: 0.7, ease: "power2.out" })
  );
  let scaleTo = units.map((u) =>
    gsap.quickTo(u, "scaleY", { duration: 0.7, ease: "power2.out" })
  );

  // Bounds: lift up to ~4px, swell up to ~1.5% — subtle.
  ScrollTrigger.create({
    trigger: el,
    start: "top bottom",
    end: "bottom top",
    onUpdate: (self) => {
      const v = Math.min(Math.abs(self.getVelocity()) / 1200, 1); // 0..1
      const lift = -4 * v; // px
      const swell = 1 + 0.015 * v; // scaleY
      units.forEach((_, i) => {
        yTo[i](lift);
        scaleTo[i](swell);
      });
    },
    onLeave: () => settle(),
    onLeaveBack: () => settle(),
  });

  function settle() {
    units.forEach((_, i) => {
      yTo[i](0);
      scaleTo[i](1);
    });
  }

  // Settle back to rest shortly after scrolling stops (the "sustained note").
  let settleTimer = null;
  ScrollTrigger.addEventListener("scrollEnd", () => {
    clearTimeout(settleTimer);
    settleTimer = setTimeout(settle, 120);
  });
}
