/* craft.js — "The Craft": stacked video panels, pinned + scrubbed. Each cut
   between panels uses one of 5 styles (wipe/slide/flip/punch/glitch), shuffled
   per load so no two adjacent cuts match. Reduced-motion/no-GSAP → CSS stack. */

import { prefersReducedMotion, isMobile } from "./utils.js";

export function initCraft() {
  const gsap = window.gsap;
  const ScrollTrigger = window.ScrollTrigger;

  const section = document.querySelector("[data-craft]");
  const viewport = document.querySelector("[data-craft-viewport]");
  const panels = gsap.utils
    ? gsap.utils.toArray("[data-craft-panel]")
    : [...document.querySelectorAll("[data-craft-panel]")];
  if (!section || !viewport || panels.length < 2) return;

  if (!gsap || !ScrollTrigger || prefersReducedMotion()) return;

  gsap.registerPlugin(ScrollTrigger);
  section.classList.add("is-stacked");

  // ── MOBILE: a light, cheap version ─────────────────────────────────────────
  // The desktop cuts animate CSS filter blur, drop-shadow RGB-splits and 3D
  // flips on full-screen video every scroll frame — that is what makes the
  // pinned scrub feel jumpy on phones. On mobile we keep the pin+scrub but
  // swap in opacity-only crossfades (GPU-trivial), so it tracks the scroll
  // smoothly. No blur, no drop-shadow, no 3D.
  if (isMobile()) {
    initCraftMobile(gsap, panels, viewport);
    return;
  }

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
      filter: "none",
      transformOrigin: "50% 50%",
      transformPerspective: 1200,
    });
  });

  // A full-bleed white FLASH overlay for the cut moment (editing-style).
  let flash = viewport.querySelector("[data-craft-flash]");
  if (!flash) {
    flash = document.createElement("div");
    flash.className = "craft-flash";
    flash.setAttribute("data-craft-flash", "");
    flash.setAttribute("aria-hidden", "true");
    viewport.appendChild(flash);
  }
  gsap.set(flash, { opacity: 0 });

  const covers = panels.length - 1;   // number of cuts
  const START_HOLD = 0.1;             // brief dwell on the first video
  const END_HOLD = 0.1;               // brief dwell on the last video
  const total = START_HOLD + covers + END_HOLD;

  // ── Choose the cut styles for this load ───────────────────────────────────── Shuffle the styles;
  const STYLES = ["wipe", "slide", "flip", "punch", "glitch"];
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
      // Tighter scrub → the transition tracks the scroll closely (less lag before the next video responds) while staying smooth.
      scrub: 0.4,
      start: "top top",
      // Shorter scroll distance per cut → you reach the next video sooner.
      end: () => "+=" + window.innerHeight * (total * 0.6),
      invalidateOnRefresh: true,
      anticipatePin: 1,
    },
  });

  // Opening hold on panel 1.
  tl.to({}, { duration: START_HOLD });

  // ── Cut builders.
  const D = 0.82;              // transition duration (most of the window)
  const LEAD = 0.08;           // tiny dwell before the cut fires

  function cut(style, prev, panel, at) {
    const media = panel.querySelector(".craft-panel__media");
    const text = panel.querySelector(".craft-panel__text");
    const t0 = at + LEAD;      // the cut fires here

    const settleMedia = (from = 1.22) => {
      if (media) tl.fromTo(media, { scale: from }, { scale: 1, duration: D + 0.25, ease: "power3.out" }, t0);
    };
    const riseText = () => {
      if (text) tl.fromTo(text, { y: 55, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5, ease: "power3.out" }, t0 + D * 0.4);
    };
    const hidePrevAtEnd = () => tl.set(prev, { opacity: 0 }, t0 + D + 0.001);
    // A quick white flash punched at the cut instant — bright at mid-cut, gone.
    const punchFlash = (peak = 0.55) => {
      tl.to(flash, { opacity: peak, duration: D * 0.35, ease: "power2.in" }, t0 + D * 0.15);
      tl.to(flash, { opacity: 0, duration: D * 0.5, ease: "power2.out" }, t0 + D * 0.5);
    };
    // Motion blur on a moving panel: ramp blur up then back to 0 (via CSS filter).
    const motionBlur = (target, px) => {
      tl.fromTo(target, { filter: "blur(0px)" }, { filter: `blur(${px}px)`, duration: D * 0.5, ease: "power2.in" }, t0);
      tl.to(target, { filter: "blur(0px)", duration: D * 0.5, ease: "power2.out" }, t0 + D * 0.5);
    };

    if (style === "wipe") {
      // Fast clip-path reveal — iris bloom or a directional edge sweep.
      const shapes = [
        ["circle(0% at 50% 50%)", "circle(150% at 50% 50%)"],
        ["circle(0% at 78% 40%)", "circle(150% at 78% 40%)"],
        ["inset(0% 100% 0% 0%)", "inset(0% 0% 0% 0%)"],
        ["inset(0% 0% 0% 100%)", "inset(0% 0% 0% 0%)"],
        ["polygon(0 0,0 0,-40% 100%,-40% 100%)", "polygon(0 0,140% 0,100% 100%,0 100%)"],
      ];
      const [from, to] = shapes[Math.floor(Math.random() * shapes.length)];
      gsap.set(panel, { opacity: 1, scale: 1, clipPath: from });
      tl.to(panel, { clipPath: to, duration: D, ease: "power4.inOut" }, t0);
      tl.to(prev, { scale: 1.08, duration: D, ease: "power2.in" }, t0);
      hidePrevAtEnd(); settleMedia(1.16); riseText();
    } else if (style === "slide") {
      // Hard filmstrip advance with a MOTION-BLUR streak on both panels.
      gsap.set(panel, { opacity: 1, xPercent: 110, scale: 1 });
      tl.to(panel, { xPercent: 0, duration: D, ease: "power4.inOut" }, t0);
      tl.to(prev, { xPercent: -70, scale: 0.82, opacity: 0.3, duration: D, ease: "power4.inOut" }, t0);
      motionBlur(panel, 14); motionBlur(prev, 14);
      hidePrevAtEnd(); settleMedia(1.12); riseText();
    } else if (style === "flip") {
      // Fast full 3D card turn with a flash at the edge-on midpoint.
      gsap.set(panel, { opacity: 1, rotationY: -130, scale: 0.9, transformOrigin: "50% 50%" });
      tl.to(prev, { rotationY: 130, opacity: 0, scale: 0.88, duration: D, ease: "power3.inOut" }, t0);
      tl.fromTo(panel, { rotationY: -130, scale: 0.9 }, { rotationY: 0, scale: 1, duration: D, ease: "power3.inOut" }, t0);
      punchFlash(0.35);
      settleMedia(1.18); riseText();
    } else if (style === "punch") {
      // Dive-into-the-frame: incoming explodes from a point + ZOOM-BLUR;
      gsap.set(panel, { opacity: 0, scale: 0.04, transformOrigin: "50% 50%" });
      tl.to(prev, { scale: 2.4, opacity: 0, duration: D, ease: "power3.in" }, t0);
      tl.fromTo(panel, { scale: 0.04, opacity: 0 }, { scale: 1, opacity: 1, duration: D, ease: "power4.out" }, t0);
      motionBlur(panel, 18);
      punchFlash(0.7);
      if (media) tl.fromTo(media, { scale: 1.4 }, { scale: 1, duration: D + 0.25, ease: "power3.out" }, t0);
      riseText();
    } else {
      // GLITCH — a hard cut with an RGB-split jitter: the incoming snaps in while its channels.
      gsap.set(panel, { opacity: 1, scale: 1, x: 0, filter: "none" });
      // Jump-cut the outgoing away almost immediately.
      tl.to(prev, { opacity: 0, duration: D * 0.2, ease: "steps(2)" }, t0 + D * 0.15);
      // The incoming jitters horizontally + drop-shadow RGB fringe, then locks.
      tl.fromTo(panel,
        { x: -18, filter: "drop-shadow(10px 0 0 rgba(255,0,80,0.7)) drop-shadow(-10px 0 0 rgba(0,200,255,0.7))" },
        { x: 0, filter: "drop-shadow(0 0 0 rgba(255,0,80,0)) drop-shadow(0 0 0 rgba(0,200,255,0))", duration: D, ease: "steps(6)" },
        t0
      );
      punchFlash(0.4);
      settleMedia(1.1); riseText();
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

/* Lightweight mobile Craft: pinned + scrubbed, but each cut is a plain
   opacity crossfade with a small settle-scale on the incoming media. No
   filter/blur/drop-shadow/3D, so the GPU is never asked to re-rasterise a
   full-screen video mid-scroll — the scrub stays smooth. */
function initCraftMobile(gsap, panels, viewport) {
  panels.forEach((p, i) => {
    gsap.set(p, {
      zIndex: i,
      opacity: i === 0 ? 1 : 0,
      xPercent: 0,
      yPercent: 0,
      scale: 1,
      rotationY: 0,
      clipPath: "none",
      filter: "none",
    });
  });

  const covers = panels.length - 1;
  const START_HOLD = 0.15;
  const END_HOLD = 0.15;
  const total = START_HOLD + covers + END_HOLD;

  const tl = gsap.timeline({
    defaults: { ease: "power1.inOut" },
    scrollTrigger: {
      trigger: viewport,
      pin: true,
      scrub: 0.5,
      start: "top top",
      end: () => "+=" + window.innerHeight * (total * 0.7),
      invalidateOnRefresh: true,
      anticipatePin: 1,
    },
  });

  tl.to({}, { duration: START_HOLD });

  const D = 0.7;
  let at = START_HOLD;
  panels.slice(1).forEach((panel, idx) => {
    const prev = panels[idx];
    const media = panel.querySelector(".craft-panel__media");
    const text = panel.querySelector(".craft-panel__text");

    gsap.set(panel, { opacity: 0, scale: 1 });
    tl.to(panel, { opacity: 1, duration: D }, at);
    tl.to(prev, { opacity: 0, duration: D }, at);
    if (media) tl.fromTo(media, { scale: 1.08 }, { scale: 1, duration: D + 0.15, ease: "power2.out" }, at);
    if (text) tl.fromTo(text, { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.4, ease: "power2.out" }, at + D * 0.4);
    at += 1;
  });

  tl.to({}, { duration: END_HOLD }, at);

  return () => tl.scrollTrigger && tl.scrollTrigger.kill();
}
