/* ============================================================================
   craft.js — Olamide Sax V3 · "The Craft" pinned scroll with cinematic cuts
   ----------------------------------------------------------------------------
   Three video panels stacked in the same spot; the section pins and scroll
   scrubs through a CUT between each pair. There are FOUR different cut styles;
   on every page load they're SHUFFLED and assigned so no two adjacent cuts are
   the same (and, when there are ≤4 cuts, all are distinct) — so the sequence
   feels fresh each visit and never repeats back-to-back:

     WIPE   — the incoming scene is revealed by a clip-path shape (iris bloom /
              letterbox slit / diagonal blade — itself rotated per use).
     SLIDE  — the incoming panel slides in from the side and covers; the
              outgoing recedes with depth.
     FLIP   — the stack turns in 3D: the outgoing tilts away as the incoming
              rotates in, like turning a giant card.
     PUNCH  — the incoming zooms out from the centre of the outgoing and punches
              through to fill the frame (dive-into-the-frame cut).

   Pinned + scrubbed, so scrolling back replays each cut in reverse. Every
   outgoing panel ends fully hidden — nothing lingers beneath.

   PROGRESSIVE ENHANCEMENT: no GSAP / reduced-motion / mobile → skip entirely;
   the CSS shows the panels as a readable vertical stack.
   ========================================================================== */

import { prefersReducedMotion } from "./utils.js";

export function initCraft() {
  const gsap = window.gsap;
  const ScrollTrigger = window.ScrollTrigger;

  const section = document.querySelector("[data-craft]");
  const viewport = document.querySelector("[data-craft-viewport]");
  const panels = gsap.utils
    ? gsap.utils.toArray("[data-craft-panel]")
    : [...document.querySelectorAll("[data-craft-panel]")];
  if (!section || !viewport || panels.length < 2) return;

  const isMobile = window.matchMedia("(max-width: 767px)").matches;
  if (!gsap || !ScrollTrigger || prefersReducedMotion() || isMobile) return;

  gsap.registerPlugin(ScrollTrigger);
  section.classList.add("is-stacked");

  // Reset every panel to a hidden, neutral state (panel 0 visible).
  panels.forEach((p, i) => {
    gsap.set(p, {
      zIndex: i,
      xPercent: 0,
      yPercent: 0,
      opacity: i === 0 ? 1 : 0,
      scale: 1,
      rotationY: 0,
      clipPath: "none",
      transformOrigin: "50% 50%",
      transformPerspective: 1200,
    });
  });

  const covers = panels.length - 1;   // number of cuts
  const START_HOLD = 0.35;
  const END_HOLD = 0.2;
  const total = START_HOLD + covers + END_HOLD;

  // ── Choose the cut styles for this load ─────────────────────────────────────
  // Shuffle the four styles; take one per cut. With ≤4 cuts all are distinct;
  // for more cuts we reshuffle and only forbid the same style twice in a row.
  const STYLES = ["wipe", "slide", "flip", "punch"];
  function shuffle(a) {
    const r = a.slice();
    for (let i = r.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [r[i], r[j]] = [r[j], r[i]];
    }
    return r;
  }
  const sequence = [];
  let bag = shuffle(STYLES);
  for (let c = 0; c < covers; c++) {
    if (!bag.length) bag = shuffle(STYLES);
    let pick = bag.shift();
    // Never repeat the previous cut's style back-to-back.
    if (sequence.length && pick === sequence[sequence.length - 1]) {
      if (bag.length) { bag.push(pick); pick = bag.shift(); }
    }
    sequence.push(pick);
  }

  const tl = gsap.timeline({
    defaults: { ease: "power2.inOut" },
    scrollTrigger: {
      trigger: viewport,
      pin: true,
      scrub: 1,
      start: "top top",
      end: () => "+=" + window.innerHeight * (total * 0.9),
      invalidateOnRefresh: true,
      anticipatePin: 1,
    },
  });

  // Opening hold on panel 1.
  tl.to({}, { duration: START_HOLD });

  // ── Cut builders. Each fills a 1-unit window at absolute position `at`,
  //    choreographing BOTH the outgoing (prev) and incoming (panel). ──────────
  function cut(style, prev, panel, at) {
    const media = panel.querySelector(".craft-panel__media");
    const text = panel.querySelector(".craft-panel__text");
    // Incoming media always settles from a gentle push-in; the label rises.
    const settleMedia = () => {
      if (media) tl.fromTo(media, { scale: 1.14 }, { scale: 1, duration: 1, ease: "power2.out" }, at);
    };
    const riseText = (offset = 0.25) => {
      if (text) tl.fromTo(text, { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7, ease: "power3.out" }, at + offset);
    };

    if (style === "wipe") {
      // A clip-path shape reveals the incoming; rotate through iris/slit/blade.
      const shapes = [
        ["circle(0% at 72% 42%)", "circle(150% at 72% 42%)"],           // iris
        ["inset(49.9% 0% 49.9% 0%)", "inset(0% 0% 0% 0%)"],             // letterbox slit
        ["polygon(0 0,0 0,0 100%,0 100%)", "polygon(0 0,100% 0,100% 100%,0 100%)"], // left→right wipe
      ];
      const [from, to] = shapes[Math.floor(Math.random() * shapes.length)];
      gsap.set(panel, { opacity: 1, clipPath: from });
      tl.to(panel, { clipPath: to, duration: 1, ease: "power2.inOut" }, at);
      // Outgoing simply holds then is hidden once covered.
      tl.to(prev, { scale: 1.04, duration: 1, ease: "power1.inOut" }, at);
      tl.set(prev, { opacity: 0 }, at + 0.98);
      settleMedia();
      riseText();
    } else if (style === "slide") {
      // Incoming slides in from the right and covers; outgoing recedes left.
      gsap.set(panel, { opacity: 1, xPercent: 100 });
      tl.to(panel, { xPercent: 0, duration: 1, ease: "power3.inOut" }, at);
      tl.to(prev, { xPercent: -14, scale: 0.92, opacity: 0.4, duration: 1, ease: "power2.inOut" }, at);
      tl.set(prev, { opacity: 0 }, at + 0.98);
      settleMedia();
      riseText(0.3);
    } else if (style === "flip") {
      // The stack turns in 3D: outgoing tilts away, incoming rotates in.
      gsap.set(panel, { opacity: 1, rotationY: -100, transformOrigin: "50% 50%" });
      tl.to(prev, { rotationY: 100, opacity: 0, duration: 1, ease: "power2.inOut" }, at);
      tl.fromTo(
        panel,
        { rotationY: -100 },
        { rotationY: 0, duration: 1, ease: "power2.inOut" },
        at
      );
      settleMedia();
      riseText(0.35);
    } else {
      // PUNCH — incoming zooms out from the centre of the outgoing to fill frame.
      gsap.set(panel, { opacity: 0, scale: 0.2, transformOrigin: "50% 50%" });
      tl.to(prev, { scale: 1.5, opacity: 0, duration: 1, ease: "power2.in" }, at);
      tl.fromTo(
        panel,
        { scale: 0.2, opacity: 0 },
        { scale: 1, opacity: 1, duration: 1, ease: "power3.out" },
        at
      );
      // media push-in a touch stronger for the dive feel
      if (media) tl.fromTo(media, { scale: 1.2 }, { scale: 1, duration: 1, ease: "power2.out" }, at);
      riseText(0.3);
    }
  }

  let at = START_HOLD;
  panels.slice(1).forEach((panel, idx) => {
    cut(sequence[idx], panels[idx], panel, at);
    at += 1;
  });

  // Beat on the last panel before the pin releases.
  tl.to({}, { duration: END_HOLD }, at);

  return () => tl.scrollTrigger && tl.scrollTrigger.kill();
}
