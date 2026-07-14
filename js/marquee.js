/* ============================================================================
   marquee.js — Olamide Sax V3 · "Stages & Recognition" drifting credits bands
   ----------------------------------------------------------------------------
   Continuous horizontal drifts of venue / festival / award / collaborator
   names. Supports MULTIPLE tracks, each with its own direction via
   data-marquee-dir ("1" = leftward drift, "-1" = rightward) — the two bands
   run counter-current. Each track is duplicated so the loop is seamless
   (when it passes half its width, it wraps). Driven by GSAP's ticker (one
   rAF for the whole site); scroll velocity from Lenis (or window scroll)
   nudges speed + direction, easing back to a slow idle drift.

   PROGRESSIVE ENHANCEMENT: no GSAP / reduced-motion → do nothing; the CSS
   leaves the credits as static, wrapping lists of the same names.
   ========================================================================== */

import { prefersReducedMotion, isMobile } from "./utils.js";

export function initMarquee() {
  const gsap = window.gsap;
  const tracks = [...document.querySelectorAll("[data-marquee-track]")];
  if (!tracks.length) return;
  if (!gsap || prefersReducedMotion()) return;

  // Flag the section so CSS switches from the wrapping fallback to rows.
  const section = tracks[0].closest(".credits");
  if (section) section.classList.add("is-live");

  // One shared scroll-velocity signal for every band. On mobile we keep the
  // idle drift (a cheap transform) but DON'T couple it to scroll — that means no
  // per-scroll-event work and no speed spikes competing with the scroll itself.
  const mobile = isMobile();
  let velocity = 0;
  const lenis = window.__lenis || null;
  let lastScrollY = window.scrollY;
  if (!mobile) {
    if (lenis) {
      lenis.on("scroll", ({ velocity: v }) => { velocity = v * 3.0; });
    } else {
      window.addEventListener(
        "scroll",
        () => {
          const y = window.scrollY;
          velocity = (y - lastScrollY) * 1.5;
          lastScrollY = y;
        },
        { passive: true }
      );
    }
  }

  const bands = tracks.map((track) => {
    // Duplicate the items once for a seamless wrap.
    Array.from(track.children).forEach((node) => {
      const clone = node.cloneNode(true);
      clone.setAttribute("aria-hidden", "true");
      track.appendChild(clone);
    });
    const band = {
      dir: parseFloat(track.dataset.marqueeDir || "1"), // 1 = drift left
      x: 0,
      half: 0,
      setX: gsap.quickSetter(track, "x", "px"),
      measure() { band.half = track.scrollWidth / 2; },
    };
    band.measure();
    return band;
  });

  const measureAll = () => bands.forEach((b) => b.measure());
  window.addEventListener("resize", measureAll, { passive: true });

  const IDLE = 0.4; // px/frame idle drift
  gsap.ticker.add(() => {
    bands.forEach((b) => {
      b.x -= (IDLE + velocity) * b.dir;
      if (b.half > 0) {
        if (b.x <= -b.half) b.x += b.half;
        else if (b.x > 0) b.x -= b.half;
      }
      b.setX(b.x);
    });
    velocity *= 0.9; // decay back toward the idle drift
  });
}
