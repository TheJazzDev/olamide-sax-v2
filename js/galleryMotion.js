/* ============================================================================
   galleryMotion.js — Olamide Sax V3 · gallery wall motion
   ----------------------------------------------------------------------------
   Two effects on the masonry gallery wall:
     1. SKEW-ON-SCROLL — the whole wall leans slightly with scroll velocity
        (subtle, ≤3°), easing back to upright when scrolling stops. The signature
        "living wall" feel.
     2. CLICK-TO-ENLARGE — clicking a frame expands it to a centred lightbox via
        GSAP Flip (real FLIP transition, not a cut); clicking the backdrop or the
        frame again returns it to its exact spot in the wall.

   Self-gates: no GSAP / reduced-motion / touch-coarse → does nothing (the wall
   stays a clean, clickable masonry grid). Requires Flip for the enlarge; if Flip
   is absent, skew still runs and clicks open a plain centred overlay.

   Contract: exports initGalleryMotion(). Page-guarded (no-ops without [data-gallery]).
   ========================================================================== */

import { prefersReducedMotion } from "./utils.js";

export function initGalleryMotion() {
  const gsap = window.gsap;
  const Flip = window.Flip;
  const grid = document.querySelector("[data-gallery]");
  if (!grid) return;
  if (!gsap || prefersReducedMotion()) return;

  // ── 1 · Skew-on-scroll (per image) ──────────────────────────────────────────
  // Each photo leans on its OWN skew from scroll velocity (not the whole wall as
  // a block), with a slight per-cell variation so they don't move in lockstep —
  // giving the wall a lively, physical feel. Clamped tight so it reads as a lean,
  // never a wobble. Cells re-arm after a filter re-render.
  const MAX_SKEW = 3;              // degrees — subtle, editorial
  let velocity = 0;
  let skewers = [];               // { setSkew, factor } per cell

  function armSkew() {
    skewers = $$cells().map((cell, i) => {
      cell.style.willChange = "transform";
      // Alternate lean direction + vary magnitude a touch per cell.
      const factor = (i % 2 === 0 ? 1 : -1) * (0.8 + ((i * 37) % 5) * 0.1);
      return {
        setSkew: gsap.quickTo(cell, "skewY", { duration: 0.5, ease: "power3.out" }),
        factor,
      };
    });
  }
  function $$cells() {
    return Array.prototype.slice.call(grid.querySelectorAll(".gallery-cell"));
  }

  const lenis = window.__lenis || null;
  if (lenis) {
    lenis.on("scroll", ({ velocity: v }) => { velocity = v; });
  } else {
    let lastY = window.scrollY;
    window.addEventListener("scroll", () => {
      const y = window.scrollY;
      velocity = (y - lastY) * 0.6;
      lastY = y;
    }, { passive: true });
  }

  gsap.ticker.add(() => {
    // Map velocity → skew, clamped; decay toward 0 so each photo settles upright.
    const base = Math.max(-MAX_SKEW, Math.min(MAX_SKEW, velocity * 0.35));
    for (let i = 0; i < skewers.length; i++) {
      skewers[i].setSkew(base * skewers[i].factor);
    }
    velocity *= 0.9;
  });

  armSkew();
  // Re-arm the per-cell skewers after gallery.js re-renders on filter change.
  new MutationObserver(() => armSkew()).observe(grid, { childList: true });

  // ── 2 · Click-to-enlarge (Flip) ────────────────────────────────────────────
  // Build a lightbox layer once. The clicked cell's media is Flip-morphed into a
  // centred stage; a backdrop dims the page. Click backdrop / stage / Esc closes.
  let lightbox = document.querySelector("[data-gallery-lightbox]");
  if (!lightbox) {
    lightbox = document.createElement("div");
    lightbox.className = "gallery-lightbox";
    lightbox.setAttribute("data-gallery-lightbox", "");
    lightbox.setAttribute("aria-hidden", "true");
    lightbox.innerHTML = `<div class="gallery-lightbox__backdrop" data-lb-backdrop></div>`;
    document.body.appendChild(lightbox);
  }
  const backdrop = lightbox.querySelector("[data-lb-backdrop]");

  let openCell = null;   // the cell currently enlarged (hidden in place)

  // We NEVER remove the original cell from the grid — in a CSS multi-column
  // layout, removing one item re-balances every column (the "layout shift"). So
  // we CLONE the cell into the lightbox and Flip the clone from the original's
  // on-screen rect to a centred, large one. The original just fades in place;
  // on close the clone Flips back to it exactly, then is discarded. The grid DOM
  // is untouched throughout → no reflow, no shift.
  let clone = null;

  function open(cell) {
    if (openCell) return;
    openCell = cell;

    // Clone into the lightbox; the clone lands in its CSS-defined centred layout.
    clone = cell.cloneNode(true);
    clone.classList.add("gallery-lightbox__figure");
    clone.removeAttribute("data-id");
    lightbox.appendChild(clone);
    lightbox.classList.add("is-open");
    lightbox.setAttribute("aria-hidden", "false");
    cell.classList.add("gallery-cell--lifted"); // hide the original quietly

    if (!Flip) {
      gsap.set(backdrop, { opacity: 1 });
      return;
    }

    // The clone rests in its centred (large) CSS layout. Fit it ONTO the original
    // cell's small on-screen rect, capture THAT as the start, clear the fit so the
    // clone snaps to its large layout, then Flip from small → large. One clean
    // Flip; the grid DOM is never touched, so the wall never reflows.
    Flip.fit(clone, cell, { scale: false });
    const state = Flip.getState(clone);
    gsap.set(clone, { clearProps: "transform,width,height,top,left" });
    Flip.from(state, {
      duration: 0.55,
      ease: "power3.inOut",
      absolute: true,
      scale: false,
    });
    gsap.to(backdrop, { opacity: 1, duration: 0.4, ease: "power2.out" });
  }

  function close() {
    if (!openCell) return;
    const cell = openCell;

    const finish = () => {
      lightbox.classList.remove("is-open");
      lightbox.setAttribute("aria-hidden", "true");
      cell.classList.remove("gallery-cell--lifted");
      if (clone) { clone.remove(); clone = null; }
      openCell = null;
    };

    if (!Flip || !clone) {
      gsap.to(backdrop, { opacity: 0, duration: 0.3, ease: "power2.in", onComplete: finish });
      return;
    }

    // Capture the clone's current (large) state, fit it onto the original cell's
    // on-screen rect, then Flip from large → small back to exactly where the
    // photo lives in the wall. The original never moved, so nothing shifts.
    const state = Flip.getState(clone);
    Flip.fit(clone, cell, { scale: false });
    Flip.from(state, {
      duration: 0.5,
      ease: "power3.inOut",
      absolute: true,
      scale: false,
      onComplete: finish,
    });
    gsap.to(backdrop, { opacity: 0, duration: 0.4, ease: "power2.in" });
  }

  // Delegate clicks: a click on a cell opens it; a click on the lightbox
  // (backdrop or the enlarged clone) or Esc closes it.
  grid.addEventListener("click", (e) => {
    const cell = e.target.closest(".gallery-cell");
    if (cell) open(cell);
  });
  lightbox.addEventListener("click", () => close());
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") close();
  });

  // The grid DOM is NEVER touched by open/close (we clone), so any childList
  // change on the grid is a real re-render (gallery.js filter). Close if a cell
  // is enlarged — its original would otherwise be replaced out from under us.
  const mo = new MutationObserver(() => { if (openCell) close(); });
  mo.observe(grid, { childList: true });
}
