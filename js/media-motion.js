/* media-motion.js — gallery reveal, timeline-node bloom, section blooms,
   featured-media blooms (all gated behind engineLive), + YouTube facade→iframe. */

import { $, $$, on, prefersReducedMotion } from "./utils.js";

function engineLive() {
  return (
    typeof window !== "undefined" &&
    window.gsap &&
    window.ScrollTrigger &&
    !prefersReducedMotion()
  );
}

export function initMediaMotion() {
  if (!engineLive()) return;

  const gsap = window.gsap;
  const ScrollTrigger = window.ScrollTrigger;
  gsap.registerPlugin(ScrollTrigger);

  buildGalleryMotion(gsap, ScrollTrigger);
  buildTimelineUnfold(gsap, ScrollTrigger);
  buildSectionTransitions(gsap, ScrollTrigger);
  buildFeaturedBlooms(gsap, ScrollTrigger);

  const refresh = () => ScrollTrigger.refresh();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(refresh);
  window.addEventListener("load", refresh, { once: true });
}

/* Gallery: each cell clip-wipes + settles in on its own scroll position, so the masonry cascades organically. */
function buildGalleryMotion(gsap, ScrollTrigger) {
  const grid = $("[data-gallery]");
  if (!grid) return;

  function revealCell(cell) {
    if (cell.dataset.revealed) return;
    cell.dataset.revealed = "1";
    const img = cell.querySelector(".gallery-cell__media > img");
    const cap = cell.querySelector(".gallery-cell__caption");
    const tl = gsap.timeline();
    if (img) {
      tl.to(img, { clipPath: "inset(0 0 0% 0)", y: "0%", scale: 1, duration: 1.05, ease: "power3.out" }, 0);
    }
    if (cap) {
      tl.to(cap, { opacity: 1, duration: 0.6, ease: "power2.out" }, 0.35);
    }
    cell.classList.remove("gallery-cell--pre");
  }

  // Backstop: reveal any armed cell already in view (batch.onEnter only fires on a cross-in.
  function revealVisible() {
    const vh = window.innerHeight || 0;
    $$(".gallery-cell--pre", grid).forEach((c) => {
      if (c.getBoundingClientRect().top < vh * 0.9) revealCell(c);
    });
  }

  function armCells() {
    const cells = $$(".gallery-cell", grid).filter((c) => !c.dataset.motionArmed);
    if (!cells.length) return;
    cells.forEach((c) => {
      c.dataset.motionArmed = "1";
      c.classList.add("gallery-cell--pre");
      wireCellClip(c);
      ScrollTrigger.create({ trigger: c, start: "top 88%", once: true, onEnter: () => revealCell(c) });
    });
    revealVisible();
  }

  ScrollTrigger.addEventListener("refresh", revealVisible);
  window.addEventListener("load", () => requestAnimationFrame(revealVisible), { once: true });
  // Background-tab rAF throttling stalls reveals; re-sweep when the tab shows.
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) requestAnimationFrame(revealVisible);
  });

  // Optional hover clip: a muted loop cross-fades over the still. Loaded on first
  // hover only, never eager.
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
      if (!loaded) { video.src = src; loaded = true; }
      const p = video.play();
      if (p && p.catch) p.catch(() => {});
      media.classList.add("is-clip-live");
    };
    const leave = () => {
      media.classList.remove("is-clip-live");
      if (video) { try { video.pause(); } catch (_) {} }
    };

    on(cell, "pointerenter", enter);
    on(cell, "pointerleave", leave);
  }

  armCells();
  const mo = new MutationObserver(() => { armCells(); ScrollTrigger.refresh(); });
  mo.observe(grid, { childList: true });
}

/* Timeline: bloom ONLY the decorative mark (aria-hidden) as each node arrives — reveal.js. */
function buildTimelineUnfold(gsap, ScrollTrigger) {
  const host = $("[data-timeline]");
  if (!host) return;
  const nodes = $$("[data-timeline-node]", host);
  if (!nodes.length) return;

  nodes.forEach((node) => {
    const mark = $(".timeline-milestone__mark", node);
    if (!mark) return;
    node.classList.add("timeline-milestone--unfold");
    gsap.set(mark, { scale: 0, opacity: 0, transformOrigin: "50% 50%" });
    gsap.to(mark, {
      scale: 1, opacity: 1, duration: 0.5, ease: "back.out(2)",
      scrollTrigger: { trigger: node, start: "top 78%", toggleActions: "play none none none" },
    });
  });

  ScrollTrigger.addEventListener("refresh", () => {
    const vh = window.innerHeight || 0;
    nodes.forEach((node) => {
      const mark = $(".timeline-milestone__mark", node);
      if (!mark || gsap.getProperty(mark, "opacity") >= 0.99) return;
      if (node.getBoundingClientRect().top < vh * 0.78) {
        gsap.to(mark, { scale: 1, opacity: 1, duration: 0.5, ease: "back.out(2)" });
      }
    });
  });
}

/* A low-opacity warm bloom fades up while each section is centred. */
function buildSectionTransitions(gsap, ScrollTrigger) {
  $$("main > section.section").forEach((section) => {
    if (section.matches(".hero, .craft")) return;   // these own their own atmosphere
    const bloom = document.createElement("span");
    bloom.className = "section-bloom";
    bloom.setAttribute("aria-hidden", "true");
    section.insertBefore(bloom, section.firstChild);
    gsap.set(bloom, { opacity: 0 });
    const up = () => gsap.to(bloom, { opacity: 1, duration: 1.1, ease: "power2.out" });
    const down = () => gsap.to(bloom, { opacity: 0, duration: 0.9, ease: "power2.out" });
    ScrollTrigger.create({
      trigger: section, start: "top 70%", end: "bottom 40%",
      onEnter: up, onLeave: down, onEnterBack: up, onLeaveBack: down,
    });
  });
}

/* Live Wall stills scale-settle + veil-lift on reach. */
function buildFeaturedBlooms(gsap, ScrollTrigger) {
  $$(".live-wall__cell .frame-media").forEach((el) => {
    gsap.set(el, { opacity: 0, scale: 1.04, transformOrigin: "50% 50%" });
    gsap.to(el, {
      opacity: 1, scale: 1, duration: 1.1, ease: "power3.out",
      scrollTrigger: { trigger: el, start: "top 85%", toggleActions: "play none none none" },
    });
  });
}

/* YouTube facade → iframe. NOT motion-gated (the video must always be reachable);
   the nocookie iframe is injected only on click/keyboard activation. */
export function initYouTubeFacades() {
  bindFacades();
  const grid = $("[data-videos]");
  if (grid) new MutationObserver(() => bindFacades()).observe(grid, { childList: true });
}

function bindFacades() {
  $$("[data-yt]").forEach((facade) => {
    const id = (facade.dataset.yt || "").trim();
    if (!id || id === "TODO") return;             // pending → keep channel link
    if (facade.dataset.ytBound) return;
    facade.dataset.ytBound = "1";
    const activate = () => swapInIframe(facade, id);
    on(facade, "click", (e) => { e.preventDefault(); activate(); });
    on(facade, "keydown", (e) => {
      if (e.key === "Enter" || e.key === " " || e.key === "Spacebar") { e.preventDefault(); activate(); }
    });
  });
}

function swapInIframe(facade, id) {
  if (facade.dataset.ytLive) return;
  facade.dataset.ytLive = "1";
  const media = $(".frame-media", facade) || facade;

  const iframe = document.createElement("iframe");
  iframe.className = "video-embed";
  iframe.src =
    "https://www.youtube-nocookie.com/embed/" +
    encodeURIComponent(id) +
    "?autoplay=1&rel=0&modestbranding=1&playsinline=1";
  iframe.title = facade.getAttribute("aria-label") || "YouTube video player";
  iframe.setAttribute("frameborder", "0");
  iframe.setAttribute("allow", "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share");
  iframe.setAttribute("allowfullscreen", "");
  iframe.setAttribute("referrerpolicy", "strict-origin-when-cross-origin");
  iframe.tabIndex = 0;

  facade.classList.add("is-live");
  facade.querySelectorAll(".video-facade__play, .video-facade__label").forEach((n) => n.remove());
  if (media !== facade) { media.innerHTML = ""; media.appendChild(iframe); }
  else { facade.innerHTML = ""; facade.appendChild(iframe); }

  facade.removeAttribute("role");
  facade.removeAttribute("tabindex");
  facade.removeAttribute("aria-label");
  requestAnimationFrame(() => { try { iframe.focus(); } catch (_) {} });
  if (window.ScrollTrigger) window.ScrollTrigger.refresh();
}
