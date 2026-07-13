/* ============================================================================
   heroIntro.js — Olamide Sax V3 · cinematic hero entrance (home only)
   ----------------------------------------------------------------------------
   The "wow" arrival. A choreographed load sequence:
     1. the ambient video fades up from black,
     2. the award eyebrow rises in,
     3. THE NAME IS WRITTEN — a fountain pen enters frame and signs
        "Olamide Sax", lifting between the two words. See js/signature/;
        this module only sequences it against everything else.
     4. the roles + Enter cue settle in.

   The signature replaces the <h1>'s visual text at runtime; the real text stays
   in a visually-hidden span for assistive tech. With no JS, no GSAP, or under
   reduced-motion, nothing is touched — the plain Great Vibes name renders as-is.

   Any scroll / click / keypress SKIPS to the finished state: name fully inked,
   pen gone. A first-time visitor gets the film; an impatient one gets the site.
   ========================================================================== */

import { prefersReducedMotion } from "./utils.js";
import { initSignature } from "./signature/signature.js";

export function initHeroIntro() {
  const gsap = window.gsap;
  const hero =
    document.querySelector('[data-animate="hero"]') ||
    document.querySelector(".hero");
  const title = document.querySelector('[data-animate="hero-title"]');
  if (!hero || !title) return;

  // Progressive enhancement: no motion → leave everything visible as-is.
  if (!gsap || prefersReducedMotion()) return;

  const video = hero.querySelector(".hero__video");
  const eyebrow = hero.querySelector(".hero__eyebrow");
  const meta = hero.querySelector(".hero__meta");
  const cue = hero.querySelector(".hero__cue");

  // The geometry is baked and resolution-independent, so mobile runs the SAME
  // animation — just a little quicker, so the visitor reaches the site sooner.
  const isMobile = window.matchMedia("(max-width: 767px)").matches;
  const writeFor = isMobile ? 5.0 : 6.4;

  document.documentElement.classList.add("hero-intro-ready");

  if (video) gsap.set(video, { opacity: 0, scale: 1.08 });
  if (eyebrow) gsap.set(eyebrow, { opacity: 0, y: 20 });
  if (meta) gsap.set(meta, { opacity: 0, y: 18 });
  if (cue) gsap.set(cue, { opacity: 0, y: 12 });

  /* Swap the <h1>'s two words for the signature stage, keeping the text for AT. */
  const label = title.textContent.replace(/\s+/g, " ").trim();
  const sr = document.createElement("span");
  sr.className = "u-visually-hidden";
  sr.textContent = label;

  const stage = document.createElement("span");
  stage.className = "hero__signature";

  title.textContent = "";
  title.appendChild(sr);
  title.appendChild(stage);

  // on a phone the two words are STACKED — one shared baseline is far too
  // wide for a narrow screen (the full name is ~4.4x its own height)
  const sig = initSignature(stage, { duration: writeFor, stacked: isMobile });
  if (!sig) {
    title.textContent = label; // GSAP vanished — restore the plain name
    return;
  }

  const tl = gsap.timeline({ delay: 0.15 });

  if (video) {
    tl.to(video, { opacity: 1, scale: 1, duration: 1.6, ease: "power2.out" }, 0);
  }
  if (eyebrow) {
    tl.to(eyebrow, { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" }, 0.35);
  }

  // the writing itself
  const WRITE_AT = 0.55;
  tl.add(sig.timeline.play(), WRITE_AT);

  const ends = WRITE_AT + sig.timeline.duration();
  if (meta) {
    tl.to(meta, { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" }, ends - 0.6);
  }
  if (cue) {
    tl.to(cue, { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" }, ends - 0.4);
  }

  /* ── SKIP ──────────────────────────────────────────────────────────────── */
  let done = false;
  const off = () => {
    window.removeEventListener("wheel", finish);
    window.removeEventListener("touchstart", finish);
    window.removeEventListener("keydown", finish);
    window.removeEventListener("pointerdown", finish);
  };
  function finish() {
    if (done) return;
    done = true;
    tl.progress(1);
    off();
  }
  window.addEventListener("wheel", finish, { passive: true });
  window.addEventListener("touchstart", finish, { passive: true });
  window.addEventListener("keydown", finish);
  window.addEventListener("pointerdown", finish);
  tl.eventCallback("onComplete", () => {
    done = true;
    off();
  });

  return () => {
    off();
    tl.kill();
    sig.destroy();
  };
}
