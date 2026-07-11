/* ============================================================================
   media-motion.js — Olamide Sax V3 · Task 8
   Media interactions + scroll set-pieces against the REAL content.
   ----------------------------------------------------------------------------
   Exports:
     initMediaMotion()   — GSAP-driven set-pieces (Craft pin/cross-fade,
                           gallery reveal, timeline-node unfold, section blooms,
                           featured-media blooms). Fully behind engineLive().
     initYouTubeFacades() — facade → youtube-nocookie iframe on click / keyboard.
                           This is NOT gated behind motion: it is core UX (the
                           video must be reachable), so it runs whenever a real
                           youtubeId is present, even under reduced-motion / GSAP
                           absent. Facades with no id keep their channel link.

   PROGRESSIVE ENHANCEMENT (the contract):
   - Every motion effect is gated behind engineLive() (GSAP + ScrollTrigger
     loaded AND no prefers-reduced-motion). If the gate is closed we return
     early → content stays in its final, fully-visible state (motion.css only
     hides things under html.js-anim-ready, which reveal.js adds only when live).
   - No pin on mobile / coarse pointers → the Craft section degrades to the
     normal stacked reveal (handled by reveal.js's buildCraftAndNodes).
   - facade → iframe only injects the iframe ON activation (never eager).
   ========================================================================== */

import { $, $$, on, prefersReducedMotion } from "./utils.js";

/** GSAP + ScrollTrigger present AND motion allowed. Mirrors reveal.js. */
function engineLive() {
  return (
    typeof window !== "undefined" &&
    window.gsap &&
    window.ScrollTrigger &&
    !prefersReducedMotion()
  );
}

/** Pin-safe viewport: only pin on a genuine desktop (fine pointer + wide).
    On touch / narrow screens we must NOT pin (scroll-jacking risk), so the
    Craft section falls back to the stacked reveal from reveal.js. */
function canPin() {
  if (typeof window === "undefined" || !("matchMedia" in window)) return false;
  const wide = window.matchMedia("(min-width: 1024px)").matches;
  const fine = window.matchMedia("(pointer: fine)").matches;
  const noHover = window.matchMedia("(hover: none)").matches;
  return wide && fine && !noHover;
}

/* ========================================================================== */
/*  ENTRY — motion set-pieces                                                   */
/* ========================================================================== */
export function initMediaMotion() {
  if (!engineLive()) return; // PE: content already fully visible.

  const gsap = window.gsap;
  const ScrollTrigger = window.ScrollTrigger;
  gsap.registerPlugin(ScrollTrigger);

  // Craft now handled by the dedicated horizontal-scroll module (craft.js).
  // buildPinnedCraft(gsap, ScrollTrigger);  // SET ASIDE — replaced by craft.js
  buildGalleryMotion(gsap, ScrollTrigger);
  buildTimelineUnfold(gsap, ScrollTrigger);
  buildSectionTransitions(gsap, ScrollTrigger);
  buildFeaturedBlooms(gsap, ScrollTrigger);

  // Recompute after fonts + images settle (geometry-dependent triggers/pins).
  const refresh = () => ScrollTrigger.refresh();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(refresh);
  window.addEventListener("load", refresh, { once: true });
}

/* ========================================================================== */
/*  1 · PINNED CRAFT MOVEMENTS (index)                                          */
/*  Pin the Craft section and cross-fade Saxophone → Voice → Keys as the user   */
/*  scrolls. The ACTIVE movement's clip plays + comes forward; the others dim   */
/*  + pause. On non-desktop we skip the pin entirely (reveal.js already staged  */
/*  a stacked reveal), so there is no scroll trap on mobile.                     */
/* ========================================================================== */
function buildPinnedCraft(gsap, ScrollTrigger) {
  const section = $(".craft");
  const movements = $$("[data-craft-movement]");
  if (!section || movements.length < 2) return;

  // Non-desktop: no pin. reveal.js's buildCraftAndNodes reveals the stacked
  // movements normally. Bail so we never scroll-jack a phone/tablet.
  if (!canPin()) return;

  const movementsWrap = $(".craft__movements", section) || section;

  // reveal.js (which ran first) created a soft scroll-reveal ScrollTrigger for
  // each [data-craft-movement]. The pin scene now OWNS these elements' opacity,
  // so kill those triggers to avoid two timelines fighting over opacity.
  ScrollTrigger.getAll().forEach((st) => {
    const t = st.trigger || st.vars && st.vars.trigger;
    if (t && t.matches && t.matches("[data-craft-movement]")) st.kill();
  });

  // The pinned scene stacks the movements on top of one another. We tag a class
  // so media-motion.css (gated) can absolutely-position them into one frame;
  // without the class (JS off / reduced motion) they stay in normal flow.
  movementsWrap.classList.add("craft__movements--pinned");

  const videos = movements.map((m) => $("video", m));
  const count = movements.length;
  let current = 0;

  // One clip plays at a time (the active one). Others pause (perf). Under
  // reduced motion we never reach here (engineLive gate), so play() is safe.
  function setActiveClip(activeIndex) {
    videos.forEach((v, i) => {
      if (!v) return;
      if (i === activeIndex) {
        const p = v.play();
        if (p && p.catch) p.catch(() => {});
      } else {
        try {
          v.pause();
        } catch (_) {}
      }
    });
  }

  // Initial state: first movement on stage, rest hidden. We OWN opacity here
  // (reveal.js's craft triggers were killed above).
  gsap.set(movements, { opacity: 0, yPercent: 0 });
  gsap.set(movements[0], { opacity: 1 });
  movements[0].classList.add("is-active");
  setActiveClip(0);

  // Direct progress-driven cross-fade. The pin runs for `count` viewport-heights.
  // We map scroll progress → a continuous "stage position" in [0 .. count-1].
  // Each movement's opacity is a triangular window around its own index, so
  // consecutive movements cross-fade cleanly with a short dwell at each stop.
  // This is mathematically exact for the active-index tracking (no timeline
  // position guesswork), which keeps clip play/pause perfectly in sync.
  ScrollTrigger.create({
    trigger: section,
    start: "top top",
    end: () => "+=" + window.innerHeight * count,
    pin: true,
    pinSpacing: true,
    scrub: 0.5,
    anticipatePin: 1,
    invalidateOnRefresh: true,
    onUpdate: (self) => {
      // Bias so each movement gets a full-strength dwell before the next.
      const pos = self.progress * (count - 1); // 0 .. count-1
      movements.forEach((m, i) => {
        // Triangular falloff: full opacity at i, fading to ~0.1 one step away.
        const d = Math.abs(pos - i);
        const o = d >= 1 ? 0.1 : 1 - 0.9 * d;
        m.style.opacity = String(o);
        const y = d >= 1 ? 4 : 4 * d; // slight lift as it settles onto stage
        m.style.transform = "translateY(" + y + "%)";
      });
      // Active index = nearest movement to the current stage position.
      const idx = Math.max(0, Math.min(count - 1, Math.round(pos)));
      if (idx !== current) {
        current = idx;
        setActiveClip(idx);
        movements.forEach((m, i) => m.classList.toggle("is-active", i === idx));
      }
    },
  });
}

/* ========================================================================== */
/*  3 · GALLERY still → motion                                                  */
/*  Cells rise/fade in on scroll (batched stagger). Hover treatment lives in    */
/*  CSS. If a cell carries a data-clip (an associated video), hovering swaps in  */
/*  a muted looping clip that cross-fades over the still — graceful + optional.  */
/*  The gallery re-renders on filter change, so we (re)bind after each render    */
/*  via a MutationObserver on the grid.                                          */
/* ========================================================================== */
function buildGalleryMotion(gsap, ScrollTrigger) {
  const grid = $("[data-gallery]");
  if (!grid) return;

  // Reveal a set of cells with a phrased stagger.
  function reveal(cells) {
    if (!cells.length) return;
    gsap.to(cells, {
      opacity: 1,
      y: 0,
      duration: 0.7,
      ease: "power3.out",
      stagger: 0.07,
      overwrite: true,
    });
  }

  // Reveal every armed-but-still-hidden cell currently in / above the viewport.
  // This is the correctness backstop: batch.onEnter only fires when an element
  // CROSSES the start line from below, so cells already visible at arm time
  // (initial paint before layout settled, filter re-render while scrolled, page
  // loaded mid-scroll) would otherwise stay hidden. We call this after arming,
  // after ScrollTrigger.refresh, and on window load.
  function revealVisible() {
    const vh = window.innerHeight || 0;
    const pending = $$(".gallery-cell--pre", grid).filter((c) => {
      if (gsap.getProperty(c, "opacity") >= 0.99) return false;
      return c.getBoundingClientRect().top < vh * 0.92;
    });
    reveal(pending);
  }

  function armCells() {
    const cells = $$(".gallery-cell", grid).filter(
      (c) => !c.dataset.motionArmed
    );
    if (!cells.length) return;

    cells.forEach((c) => {
      c.dataset.motionArmed = "1";
      c.classList.add("gallery-cell--pre"); // gated pre-state (opacity:0, y)
      wireCellClip(c);
    });

    // Batch so a row phrases in together as it scrolls up into view.
    ScrollTrigger.batch(cells, {
      start: "top 92%",
      onEnter: (batch) => reveal(batch),
    });

    // …and reveal any that are already visible right now.
    revealVisible();
  }

  // Re-sweep once geometry settles (fonts/images) — first paint arms before
  // layout is final, so some in-view cells need a post-refresh reveal.
  ScrollTrigger.addEventListener("refresh", revealVisible);
  window.addEventListener("load", () => requestAnimationFrame(revealVisible), {
    once: true,
  });
  // If the page loaded in a BACKGROUND tab, GSAP's rAF ticker is throttled and
  // reveals can't run; when the tab becomes visible the ticker resumes, so
  // re-sweep then too (covers "focus without scrolling"). Content-safety net.
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) requestAnimationFrame(revealVisible);
  });

  // Optional still → clip cross-fade on hover (only when the cell has a clip).
  function wireCellClip(cell) {
    const media = $(".gallery-cell__media[data-clip]", cell);
    if (!media) return;
    const src = media.dataset.clip;
    if (!src) return;

    let video = null;
    let loaded = false;

    const enter = () => {
      if (!video) {
        video = document.createElement("video");
        video.muted = true;
        video.loop = true;
        video.playsInline = true;
        video.setAttribute("playsinline", "");
        video.preload = "none";
        video.className = "gallery-cell__clip";
        video.setAttribute("aria-hidden", "true");
        media.appendChild(video);
      }
      if (!loaded) {
        video.src = src; // load only on first hover — never eager.
        loaded = true;
      }
      const p = video.play();
      if (p && p.catch) p.catch(() => {});
      media.classList.add("is-clip-live");
    };
    const leave = () => {
      media.classList.remove("is-clip-live");
      if (video) {
        try {
          video.pause();
        } catch (_) {}
      }
    };

    on(cell, "pointerenter", enter);
    on(cell, "pointerleave", leave);
  }

  armCells();
  // Re-arm after filter re-renders (initGallery replaces grid.innerHTML).
  const mo = new MutationObserver(() => {
    armCells();
    ScrollTrigger.refresh();
  });
  mo.observe(grid, { childList: true });
}

/* ========================================================================== */
/*  4 · TIMELINE NODES unfold along the Breath Line                             */
/*  The Breath Line spine (breathLine.js) DRAWS downward as you scroll. Each     */
/*  node should feel like it EMERGES from the line as the line reaches it: the   */
/*  mark blooms first, then the body unfolds. We key each node to its own scroll */
/*  position so it syncs with the spine passing through it. Reduced-motion /     */
/*  no-engine → nodes are simply visible (reveal.js handles the fallback).       */
/* ========================================================================== */
function buildTimelineUnfold(gsap, ScrollTrigger) {
  const host = $("[data-timeline]");
  if (!host) return;
  const nodes = $$("[data-timeline-node]", host);
  if (!nodes.length) return;

  // DESIGN — PE-safe & additive:
  // reveal.js already owns the NODE's reveal (it batch-fades [data-timeline-node]
  // from the motion.css pre-state to visible on scroll — the existing Task-7
  // behavior). We do NOT re-drive the node body's opacity here: if we did and our
  // trigger failed to fire, the milestone text would be stuck hidden. Instead we
  // ONLY animate the decorative MARK — the dot on the spine — so it BLOOMS from
  // the line as the node arrives, giving the "emerging from the Breath Line"
  // feel. The mark is aria-hidden and purely ornamental, so even if this never
  // runs, no readable content is affected (the mark simply shows its CSS default).
  nodes.forEach((node) => {
    const mark = $(".timeline-milestone__mark", node);
    if (!mark) return;
    node.classList.add("timeline-milestone--unfold");

    // Pre-state via GSAP (not CSS) so it only exists once the engine is live.
    gsap.set(mark, { scale: 0, opacity: 0, transformOrigin: "50% 50%" });

    gsap.to(mark, {
      scale: 1,
      opacity: 1,
      duration: 0.5,
      ease: "back.out(2)",
      scrollTrigger: {
        trigger: node,
        // Fire as the spine reaches the node (spine draws ~70% of the viewport).
        start: "top 78%",
        toggleActions: "play none none none",
      },
    });
  });

  // Safety backstop: any mark still hidden but already in view (initial paint
  // before geometry settled) blooms on refresh — the mark never gets stuck.
  ScrollTrigger.addEventListener("refresh", () => {
    const vh = window.innerHeight || 0;
    nodes.forEach((node) => {
      const mark = $(".timeline-milestone__mark", node);
      if (!mark) return;
      if (gsap.getProperty(mark, "opacity") >= 0.99) return;
      if (node.getBoundingClientRect().top < vh * 0.78) {
        gsap.to(mark, { scale: 1, opacity: 1, duration: 0.5, ease: "back.out(2)" });
      }
    });
  });
}

/* ========================================================================== */
/*  5 · IMMERSIVE SECTION TRANSITIONS                                            */
/*  Subtle warm "stage bloom" as a major section becomes active, and eased      */
/*  ground/tone shifts across Ink↔Bone boundaries. Kept gentle — a whisper of   */
/*  warmth, never a flash, never covering text. We add a low-opacity radial     */
/*  bloom layer per section and fade it up while the section is centred.         */
/* ========================================================================== */
function buildSectionTransitions(gsap, ScrollTrigger) {
  const sections = $$("main > section.section");
  sections.forEach((section) => {
    // Skip the hero (its own load sequence owns first paint) and the pinned
    // Craft (the pin scene owns its own atmosphere).
    if (section.matches(".hero, .craft")) return;

    const bloom = document.createElement("span");
    bloom.className = "section-bloom";
    bloom.setAttribute("aria-hidden", "true");
    // Insert as first child so it sits behind content (z-index handled in CSS).
    section.insertBefore(bloom, section.firstChild);
    gsap.set(bloom, { opacity: 0 });

    ScrollTrigger.create({
      trigger: section,
      start: "top 70%",
      end: "bottom 40%",
      onEnter: () =>
        gsap.to(bloom, { opacity: 1, duration: 1.1, ease: "power2.out" }),
      onLeave: () =>
        gsap.to(bloom, { opacity: 0, duration: 0.9, ease: "power2.out" }),
      onEnterBack: () =>
        gsap.to(bloom, { opacity: 1, duration: 1.1, ease: "power2.out" }),
      onLeaveBack: () =>
        gsap.to(bloom, { opacity: 0, duration: 0.9, ease: "power2.out" }),
    });
  });
}

/* ========================================================================== */
/*  6 · FEATURED MEDIA BLOOMS                                                    */
/*  The home Featured Performance / Video / Gallery reveal cinematically: their  */
/*  media "blooms open" (scale-settle + veil lift) on reach. Transform/opacity   */
/*  only. reveal.js already staggers the text; this adds the media flourish.     */
/* ========================================================================== */
function buildFeaturedBlooms(gsap, ScrollTrigger) {
  // NOTE: .practice__media is intentionally NOT here — that section has its own
  // left/right slide-in entrance (see .practice.is-in in home.css / reveal.js);
  // a second opacity animation on its inner .frame-media would fight it.
  const targets = $$(".live-wall__cell .frame-media");
  targets.forEach((el) => {
    gsap.set(el, { opacity: 0, scale: 1.04, transformOrigin: "50% 50%" });
    gsap.to(el, {
      opacity: 1,
      scale: 1,
      duration: 1.1,
      ease: "power3.out",
      scrollTrigger: {
        trigger: el,
        start: "top 85%",
        toggleActions: "play none none none",
      },
    });
  });
}

/* ========================================================================== */
/*  2 · YOUTUBE FACADE → IFRAME on activate                                      */
/*  NOT gated behind motion — the video must always be reachable. Facades that   */
/*  carry a real youtubeId (data-yt) become click/keyboard triggers that swap    */
/*  in a privacy-friendly youtube-nocookie iframe IN PLACE, autoplaying, with    */
/*  focus moved onto the player. Facades without an id (channel links) are left  */
/*  untouched. The iframe is injected ONLY on activation (never eager).          */
/* ========================================================================== */
export function initYouTubeFacades() {
  bindFacades();

  // The videos archive (media.html) re-renders its grid on tab change, so
  // re-bind any freshly-rendered facades. Idempotent via data-ytBound.
  const grid = $("[data-videos]");
  if (grid) {
    const mo = new MutationObserver(() => bindFacades());
    mo.observe(grid, { childList: true });
  }
}

function bindFacades() {
  $$("[data-yt]").forEach((facade) => {
    const id = (facade.dataset.yt || "").trim();
    if (!id || id === "TODO") return; // pending → keep facade/channel-link.
    if (facade.dataset.ytBound) return;
    facade.dataset.ytBound = "1";

    const activate = () => swapInIframe(facade, id);

    on(facade, "click", (e) => {
      e.preventDefault();
      activate();
    });
    // Keyboard: role="button" must respond to Enter and Space.
    on(facade, "keydown", (e) => {
      if (e.key === "Enter" || e.key === " " || e.key === "Spacebar") {
        e.preventDefault();
        activate();
      }
    });
  });
}

/** Replace a facade's poster/play affordance with the live embed, in place. */
function swapInIframe(facade, id) {
  if (facade.dataset.ytLive) return;
  facade.dataset.ytLive = "1";

  const media = $(".frame-media", facade) || facade;

  const iframe = document.createElement("iframe");
  iframe.className = "video-embed";
  // Privacy-friendly host; autoplay on user activation; captions-friendly.
  iframe.src =
    "https://www.youtube-nocookie.com/embed/" +
    encodeURIComponent(id) +
    "?autoplay=1&rel=0&modestbranding=1&playsinline=1";
  iframe.title = facade.getAttribute("aria-label") || "YouTube video player";
  iframe.setAttribute("frameborder", "0");
  iframe.setAttribute(
    "allow",
    "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
  );
  iframe.setAttribute("allowfullscreen", "");
  iframe.setAttribute("referrerpolicy", "strict-origin-when-cross-origin");
  iframe.tabIndex = 0;

  // Clear the facade's non-media affordances (play mark, label, scrim) and the
  // poster so only the player remains, filling the frame.
  facade.classList.add("is-live");
  facade.querySelectorAll(".video-facade__play, .video-facade__label").forEach(
    (n) => n.remove()
  );
  if (media !== facade) {
    media.innerHTML = "";
    media.appendChild(iframe);
  } else {
    facade.innerHTML = "";
    facade.appendChild(iframe);
  }

  // The trigger element is no longer a button.
  facade.removeAttribute("role");
  facade.removeAttribute("tabindex");
  facade.removeAttribute("aria-label");

  // Move focus onto the player for keyboard users.
  requestAnimationFrame(() => {
    try {
      iframe.focus();
    } catch (_) {}
  });

  // If ScrollTrigger is live, geometry may have shifted (iframe ratio).
  if (window.ScrollTrigger) window.ScrollTrigger.refresh();
}
