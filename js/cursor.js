/* ============================================================================
   cursor.js — Olamide Sax V2 · subtle custom cursor + hover magnetism
   ----------------------------------------------------------------------------
   A bone dot that eases behind the pointer, grows a magnetic pull toward
   interactive elements, and swells into a "VIEW / LISTEN / READ" label over
   media. Uses GSAP quickTo for 60fps transform-only motion.

   DISABLED (native cursor untouched) when:
     - prefers-reduced-motion is set, OR
     - the pointer is coarse / touch (pointer:fine + hover:hover required), OR
     - GSAP is not loaded.
   We add .has-custom-cursor (which hides the native cursor in CSS) ONLY when
   the custom cursor is actually active — so keyboard/touch users always keep a
   real cursor.
   ========================================================================== */

import { $$, on, prefersReducedMotion } from "./utils.js";

const MAGNETIC_SELECTOR = [
  ".btn",
  "a[href]",
  ".link-underline",
  ".card",
  ".gallery-cell",
  ".gallery__cell",
  "[data-gallery-cell]",
  ".tab",
  "[role='tab']",
  ".video-card",
  ".press-entry",
].join(",");

const LABEL_MAP = [
  { sel: "[data-cursor-label]", read: (el) => el.getAttribute("data-cursor-label") },
  { sel: ".video-card, [data-video], .featured-video", label: "LISTEN" },
  { sel: ".press-entry, .featured-press, [data-press]", label: "READ" },
  { sel: ".gallery-cell, .gallery__cell, [data-gallery-cell], .featured-gallery", label: "VIEW" },
];

export function initCursor() {
  if (typeof window === "undefined" || !window.gsap) return;
  if (prefersReducedMotion()) return;
  const fine = window.matchMedia("(pointer: fine)").matches;
  const hover = window.matchMedia("(hover: hover)").matches;
  if (!fine || !hover) return;

  const gsap = window.gsap;

  const dot = document.createElement("div");
  dot.className = "cursor-dot";
  dot.setAttribute("aria-hidden", "true");
  const label = document.createElement("div");
  label.className = "cursor-label";
  label.setAttribute("aria-hidden", "true");
  document.body.append(dot, label);
  document.documentElement.classList.add("has-custom-cursor");

  const xTo = gsap.quickTo(dot, "x", { duration: 0.25, ease: "power3.out" });
  const yTo = gsap.quickTo(dot, "y", { duration: 0.25, ease: "power3.out" });
  const lxTo = gsap.quickTo(label, "x", { duration: 0.4, ease: "power3.out" });
  const lyTo = gsap.quickTo(label, "y", { duration: 0.4, ease: "power3.out" });

  let visible = false;

  function move(e) {
    if (!visible) {
      visible = true;
      gsap.to([dot, label], { opacity: (i) => (i === 0 ? 1 : label._show ? 1 : 0), duration: 0.3 });
    }
    xTo(e.clientX);
    yTo(e.clientY);
    lxTo(e.clientX);
    lyTo(e.clientY);
  }

  function hide() {
    visible = false;
    gsap.to([dot, label], { opacity: 0, duration: 0.3 });
  }

  on(document, "pointermove", move, { passive: true });
  on(document, "pointerleave", hide);
  on(window, "blur", hide);

  // Resolve which label (if any) an element wants.
  function labelFor(el) {
    for (const entry of LABEL_MAP) {
      const match = el.closest(entry.sel);
      if (match) return entry.read ? entry.read(match) : entry.label;
    }
    return null;
  }

  // Delegate hover state on interactive elements: dot shrinks (dot hidden under
  // label) + magnetic pull; media targets swell the label.
  on(document, "pointerover", (e) => {
    const target = e.target.closest(MAGNETIC_SELECTOR);
    if (!target) return;

    const text = labelFor(target);
    if (text) {
      label.textContent = text;
      label._show = true;
      gsap.to(label, { scale: 1, opacity: 1, duration: 0.35, ease: "power3.out" });
      gsap.to(dot, { scale: 0, duration: 0.3, ease: "power3.out" });
    } else {
      gsap.to(dot, { scale: 2.4, duration: 0.3, ease: "power3.out" });
    }

    // Magnetism: nudge the element slightly toward the pointer while hovered.
    const onMagnet = (ev) => {
      const r = target.getBoundingClientRect();
      const relX = ev.clientX - (r.left + r.width / 2);
      const relY = ev.clientY - (r.top + r.height / 2);
      gsap.to(target, {
        x: relX * 0.18,
        y: relY * 0.18,
        duration: 0.5,
        ease: "power3.out",
      });
    };
    const offMagnet = () => {
      label._show = false;
      gsap.to(label, { scale: 0.6, opacity: 0, duration: 0.3, ease: "power3.out" });
      gsap.to(dot, { scale: 1, duration: 0.3, ease: "power3.out" });
      gsap.to(target, { x: 0, y: 0, duration: 0.6, ease: "elastic.out(1, 0.5)" });
      target.removeEventListener("pointermove", onMagnet);
      target.removeEventListener("pointerleave", offMagnet);
    };
    target.addEventListener("pointermove", onMagnet);
    target.addEventListener("pointerleave", offMagnet, { once: true });
  });
}
