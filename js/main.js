/* ============================================================================
   main.js — Olamide Sax V2 · entry point (ES module)
   Imports feature modules and wires their inits on DOMContentLoaded. Every
   init is page-guarded internally (no-ops if its markup isn't present), so
   this file can be linked identically on every page regardless of which
   partials/sections that page includes. Keep this file thin — it only wires,
   it does not implement.
   ========================================================================== */

import { $, $$, prefersReducedMotion, isMobile } from "./utils.js";
import { initNavigation } from "./navigation.js";
import { initSmoothScroll } from "./smoothScroll.js";
import { initReveals } from "./reveal.js";
// SET ASIDE (signature under rework — uncomment to restore the Breath Line):
// import { initBreathLine } from "./breathLine.js";
// SET ASIDE (removed on request — uncomment to restore the custom cursor):
// import { initCursor } from "./cursor.js";
import { initGallery } from "./gallery.js";
import { initVideos } from "./videos.js";
import { initContact } from "./contact.js";
import { initMediaMotion, initYouTubeFacades } from "./media-motion.js";
import { initHeroAudio } from "./heroAudio.js";
import { initFooterReveal } from "./footerReveal.js";
import { initAboutReveal } from "./aboutReveal.js";
import { initRootsReveal } from "./rootsReveal.js";
import { initCraft } from "./craft.js";
import { initHeroIntro } from "./heroIntro.js";
import { initCarousel } from "./carousel.js";
import { initMarquee } from "./marquee.js";
import { initGalleryMotion } from "./galleryMotion.js";
import { initEpk } from "./epk.js";

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

/* The Statement's mobile backdrop video is preload="none" and doesn't autoplay,
   so it never competes with the hero on load. Start it (once) only when the
   Statement nears the viewport, and only on mobile — desktop uses the fixed hero
   video instead. Under reduced motion its source was already stripped above, so
   this is a no-op there. */
function initStatementBackdrop() {
  if (!isMobile() || prefersReducedMotion()) return;
  const video = $(".statement__video");
  if (!video || !("IntersectionObserver" in window)) return;

  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const p = video.play();
      if (p && p.catch) p.catch(() => {});   // autoplay-block → poster stays
      io.disconnect();
    });
  }, { rootMargin: "40% 0px" });   // warm it up just before it scrolls in
  io.observe(video);
}

function init() {
  initNavigation();
  setFooterYear();

  // GSAP motion foundation (Task 6). Order matters: smooth-scroll first so the
  // eased scroll is in place before reveals bind to ScrollTrigger, then reveals
  // (which add the .js-anim-ready gate only if GSAP loaded + motion allowed),
  // Each self-guards under reduced-motion / touch / GSAP-absent, so all are
  // safe to call unconditionally on every page.
  initSmoothScroll();
  // Cinematic hero entrance (home only) — mask-wipe name + choreographed
  // sequence. Runs before initReveals so it owns the hero title. Self-gated:
  // no-ops under reduced-motion / GSAP-absent (content stays visible).
  initHeroIntro();
  initReveals();
  // SET ASIDE (signature under rework — uncomment to restore the Breath Line):
  // initBreathLine();
  // SET ASIDE (removed on request — uncomment to restore the custom cursor):
  // initCursor();

  // Archive UI — each is page-guarded internally (no-ops if its markup is absent).
  // These RENDER their grids, so they must run before media-motion binds to the
  // freshly-rendered cells / facades.
  initGallery();
  initVideos();
  // Booking form — page-guarded (no-ops if the contact form is absent).
  initContact();
  // EPK page — "Download EPK (PDF)" print trigger. Page-guarded.
  initEpk();
  // Ambient sound toggle — page-guarded (home hero only). Click-to-play only.
  initHeroAudio();
  // Ambient videos → poster-only under reduced motion (no-ops if none present).
  // Runs BEFORE the pinned-Craft scene so, under reduced motion, the clips are
  // already stripped and the pin never builds (engineLive gate).
  guardAmbientVideos();
  // Mobile-only Statement backdrop video — lazily started when it scrolls near.
  initStatementBackdrop();

  // Task 8 — media interactions + scroll set-pieces.
  // initYouTubeFacades is NOT motion-gated (the video must always be reachable);
  // it binds only facades that carry a real id, leaving channel-links intact.
  initYouTubeFacades();
  // initMediaMotion is fully behind engineLive() (GSAP + motion). No-ops under
  // reduced-motion / GSAP-absent → content stays in its final visible state.
  initMediaMotion();
  // The Craft horizontal scroll (canonical GSAP pinned-horizontal recipe).
  // Self-gates: no-ops under reduced-motion / GSAP-absent / mobile.
  initCraft();
  // The Live Wall circular 3D carousel — self-gates (reduced-motion/GSAP-absent).
  initCarousel();
  // Stages & Recognition drifting credits marquee — self-gates (reduced-motion/GSAP-absent).
  initMarquee();
  // Gallery wall motion — skew-on-scroll + Flip click-to-enlarge. Page-guarded
  // (no-ops without [data-gallery]); self-gates on reduced-motion / GSAP-absent.
  initGalleryMotion();
  // The Coda: footer entrance timeline — self-gates (reduced-motion/GSAP-absent).
  initFooterReveal();
  // About page motion pass — page-guarded (no-ops off /about.html).
  initAboutReveal();
  // "The Roots" light interlude — digit roll-in + photo develop/parallax.
  initRootsReveal();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
