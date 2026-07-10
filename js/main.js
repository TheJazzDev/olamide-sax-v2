/* ============================================================================
   main.js — Olamide Sax V2 · entry point (ES module)
   Imports feature modules and wires their inits on DOMContentLoaded. Every
   init is page-guarded internally (no-ops if its markup isn't present), so
   this file can be linked identically on every page regardless of which
   partials/sections that page includes. Keep this file thin — it only wires,
   it does not implement.
   ========================================================================== */

import { $, $$, prefersReducedMotion } from "./utils.js";
import { initNavigation } from "./navigation.js";
import { initSmoothScroll } from "./smoothScroll.js";
import { initReveals } from "./reveal.js";
import { initBreathLine } from "./breathLine.js";
import { initCursor } from "./cursor.js";
import { initGallery } from "./gallery.js";
import { initVideos } from "./videos.js";
import { initContact } from "./contact.js";

function setFooterYear() {
  const yearEl = $("[data-year]");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());
}

/* Reduced-motion guard for the local silent-loop videos (hero + Craft). These
   are marked [data-ambient-video]. Under prefers-reduced-motion we pause them
   and drop their sources so only the poster/still remains — no autoplay, no
   motion. This is self-contained and does NOT touch the GSAP/Breath hooks. */
function guardAmbientVideos() {
  if (!prefersReducedMotion()) return;
  $$("[data-ambient-video]").forEach((video) => {
    video.autoplay = false;
    video.removeAttribute("autoplay");
    try {
      video.pause();
    } catch (_) {}
    // Drop sources so nothing loads/plays; poster stays visible.
    $$("source", video).forEach((s) => s.removeAttribute("src"));
    video.removeAttribute("src");
    video.load();
  });
}

function init() {
  initNavigation();
  setFooterYear();

  // GSAP motion foundation (Task 6). Order matters: smooth-scroll first so the
  // eased scroll is in place before reveals bind to ScrollTrigger, then reveals
  // (which add the .js-anim-ready gate only if GSAP loaded + motion allowed),
  // then the custom cursor. Each self-guards under reduced-motion / touch /
  // GSAP-absent, so all are safe to call unconditionally on every page.
  initSmoothScroll();
  initReveals();
  // THE BREATH LINE (Task 7). After reveals so .js-anim-ready + the hero title
  // reveal are in place (birth coordinates with the title), before the cursor.
  // Self-gated: injects nothing under GSAP-absent / reduced-motion / JS-off.
  initBreathLine();
  initCursor();

  // Archive UI — each is page-guarded internally (no-ops if its markup is absent).
  initGallery();
  initVideos();
  // Booking form — page-guarded (no-ops if the contact form is absent).
  initContact();
  // Ambient videos → poster-only under reduced motion (no-ops if none present).
  guardAmbientVideos();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
