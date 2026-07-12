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

  // ── 1 · Skew-on-scroll ──────────────────────────────────────────────────────
  // Drive a small skewY on the grid from scroll velocity. Prefer Lenis' velocity
  // (already smoothed); fall back to a hand-rolled delta. Clamp tight so it reads
  // as a lean, never a wobble.
  const MAX_SKEW = 3;              // degrees — subtle, editorial
  const setSkew = gsap.quickTo(grid, "skewY", { duration: 0.5, ease: "power3.out" });
  let velocity = 0;

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
    // Map velocity → skew, clamped; decay toward 0 so it settles upright.
    const target = Math.max(-MAX_SKEW, Math.min(MAX_SKEW, velocity * 0.35));
    setSkew(target);
    velocity *= 0.9;
  });
  // A stable transform origin so the skew pivots from the centre of the wall.
  gsap.set(grid, { transformOrigin: "50% 50%", force3D: true });

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

  let openCell = null;   // the cell currently enlarged
  let placeholder = null; // keeps the wall's layout while a cell is lifted out
  let isMorphing = false; // true during our own open/close DOM moves

  function open(cell) {
    if (openCell) return;
    openCell = cell;
    isMorphing = true;
    // Clear the flag after the moves + a frame so the observer ignores them.
    requestAnimationFrame(() => requestAnimationFrame(() => { isMorphing = false; }));

    if (!Flip) {
      // Fallback: simple centred clone (no Flip morph).
      lightbox.classList.add("is-open");
      lightbox.setAttribute("aria-hidden", "false");
      const clone = cell.cloneNode(true);
      clone.classList.add("gallery-lightbox__figure", "is-clone");
      lightbox.appendChild(clone);
      return;
    }

    // Record the cell's current position, then move it into the lightbox and
    // Flip from its old rect to the new (centred, large) one.
    const state = Flip.getState(cell, { props: "borderRadius" });

    // Leave a placeholder so the masonry doesn't reflow/collapse.
    placeholder = document.createElement("div");
    placeholder.style.height = cell.getBoundingClientRect().height + "px";
    placeholder.className = "gallery-cell gallery-cell--ghost";
    cell.parentNode.insertBefore(placeholder, cell);

    lightbox.classList.add("is-open");
    lightbox.setAttribute("aria-hidden", "false");
    cell.classList.add("gallery-lightbox__figure");
    lightbox.appendChild(cell);

    Flip.from(state, {
      duration: 0.6,
      ease: "power3.inOut",
      absolute: true,
      scale: false,
      onComplete: () => ScrollTrigger && window.ScrollTrigger && window.ScrollTrigger.refresh(),
    });
    gsap.to(backdrop, { opacity: 1, duration: 0.4, ease: "power2.out" });
  }

  function close() {
    if (!openCell) return;
    const cell = openCell;
    isMorphing = true;
    requestAnimationFrame(() => requestAnimationFrame(() => { isMorphing = false; }));

    if (!Flip) {
      lightbox.classList.remove("is-open");
      lightbox.setAttribute("aria-hidden", "true");
      const clone = lightbox.querySelector(".is-clone");
      if (clone) clone.remove();
      openCell = null;
      return;
    }

    const state = Flip.getState(cell, { props: "borderRadius" });
    // Put the cell back where the placeholder is holding its spot.
    if (placeholder && placeholder.parentNode) {
      placeholder.parentNode.insertBefore(cell, placeholder);
      placeholder.remove();
      placeholder = null;
    }
    cell.classList.remove("gallery-lightbox__figure");

    Flip.from(state, {
      duration: 0.55,
      ease: "power3.inOut",
      absolute: true,
      scale: false,
      onComplete: () => {
        lightbox.classList.remove("is-open");
        lightbox.setAttribute("aria-hidden", "true");
        window.ScrollTrigger && window.ScrollTrigger.refresh();
      },
    });
    gsap.to(backdrop, { opacity: 0, duration: 0.35, ease: "power2.in" });
    openCell = null;
  }

  // Delegate clicks: a click on a cell (not while enlarged) opens it; a click on
  // the enlarged cell or the backdrop closes it.
  grid.addEventListener("click", (e) => {
    const cell = e.target.closest(".gallery-cell");
    if (cell && !cell.classList.contains("gallery-cell--ghost")) open(cell);
  });
  lightbox.addEventListener("click", () => close());
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") close();
  });

  // If gallery.js re-renders the grid (filter change) while a cell is enlarged,
  // close it — the enlarged node would otherwise be orphaned. We must NOT react
  // to our OWN open/close DOM moves, so we skip while a transition is mid-flight
  // (isMorphing) and while a cell is open due to our lift-out.
  const mo = new MutationObserver((records) => {
    if (isMorphing) return;
    // Only a real re-render (gallery.js replaces innerHTML → many removed nodes)
    // should trigger a close, not our single lift-out/return of one cell.
    const bulk = records.some((r) => r.removedNodes.length > 2 || r.addedNodes.length > 2);
    if (bulk && openCell) close();
  });
  mo.observe(grid, { childList: true });
}
