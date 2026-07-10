/* ============================================================================
   breathLine.js — Olamide Sax V3 · THE BREATH LINE (the signature interaction)
   ----------------------------------------------------------------------------
   A single elegant aged-brass line, present from the first moment to the last.
   Three acts:
     BIRTH      — on hero load the line draws on, ASSEMBLES into an abstract
                  brass saxophone silhouette, holds a beat, then DISSOLVES,
                  handing off to the spine. (index.html only.)
     JOURNEY    — a persistent fixed edge-lane SCROLL-SPINE: progress indicator,
                  section connector, and visual thread. Scroll position drives
                  its draw/progress; scroll VELOCITY drives its flow/tension
                  (fast = tighter, slow = smooth, PAUSE = settle to a sustained
                  near-still shimmer). Graceful PEAKS swell at milestone
                  sections — musical phrasing, never waveform teeth.
     RESOLUTION — at the end, the line eases to rest and resolves into a brass
                  wordmark flourish beneath the invitation CTA. (index.html.)
     TIMELINE   — on timeline.html the line is the central spine the milestone
                  nodes sit on; it draws as you scroll toward the end.

   PROGRESSIVE ENHANCEMENT (same contract as reveal.js):
   Nothing here runs and NO SVG is injected unless GSAP + ScrollTrigger are
   present AND motion is allowed. If the engine is dead, the site keeps its
   static frame__spine / timeline__line as the elegant static brand motif; all
   content stays fully visible and scroll is untouched.

   Rendering: lightweight inline SVG paths. Draw-on via stroke-dashoffset;
   flow / peaks via a small set of hand-authored path "d" states we morph
   between by re-authoring control points (cheap string build, throttled).
   Only stroke-dashoffset / transform / opacity animate on the hot path (60fps).
   No MorphSVG / DrawSVG — hand-rolled. No mic, no audio.
   ========================================================================== */

import { $, $$, prefersReducedMotion } from "./utils.js";

const SVGNS = "http://www.w3.org/2000/svg";

/** The same engine-live gate reveal.js uses. */
function engineLive() {
  return (
    typeof window !== "undefined" &&
    window.gsap &&
    window.ScrollTrigger &&
    !prefersReducedMotion()
  );
}

/** Is this a small / touch screen? On mobile we calm the line and skip birth. */
function isCalmViewport() {
  return (
    window.matchMedia("(max-width: 640px)").matches ||
    window.matchMedia("(hover: none)").matches ||
    !window.matchMedia("(pointer: fine)").matches
  );
}

/* Small SVG element helper. */
function svgEl(name, attrs = {}) {
  const el = document.createElementNS(SVGNS, name);
  for (const k in attrs) el.setAttribute(k, attrs[k]);
  return el;
}

/* Shared brass gradient <defs> injected once per SVG so strokes read as aged
   brass warming into lit brass. */
function brassDefs(id, vertical = true) {
  const defs = svgEl("defs");
  const grad = svgEl("linearGradient", {
    id,
    x1: "0",
    y1: "0",
    x2: vertical ? "0" : "1",
    y2: vertical ? "1" : "0",
  });
  const stops = [
    ["0%", "var(--brass)", "0.35"],
    ["18%", "var(--brass)", "0.9"],
    ["50%", "var(--brass-light)", "1"],
    ["82%", "var(--brass)", "0.9"],
    ["100%", "var(--brass)", "0.35"],
  ];
  stops.forEach(([offset, color, op]) => {
    grad.appendChild(
      svgEl("stop", { offset, "stop-color": color, "stop-opacity": op })
    );
  });
  defs.appendChild(grad);
  return defs;
}

/* ========================================================================== */
/*  PUBLIC ENTRY                                                                */
/* ========================================================================== */
export function initBreathLine() {
  if (!engineLive()) return; // PE: static line stays, no animation, no inject.

  const gsap = window.gsap;
  const ScrollTrigger = window.ScrollTrigger;
  gsap.registerPlugin(ScrollTrigger);

  const calm = isCalmViewport();

  // The JOURNEY spine lives on every page (progress + thread).
  const spine = buildSpine(gsap, ScrollTrigger, calm);

  // BIRTH — index hero only. Coordinates with the hero title reveal.
  const birthHost = $("[data-breath-hero]");
  if (birthHost && !calm) {
    buildBirth(gsap, birthHost, spine);
  } else if (spine) {
    // No birth (mobile / other pages): the spine simply draws in gently.
    spine.introduce();
  }

  // RESOLUTION — index invitation only.
  const resolveHost = $("[data-breath-resolve]");
  if (resolveHost) buildResolve(gsap, ScrollTrigger, resolveHost);

  // TIMELINE spine — timeline.html only.
  const timelineHost = $("[data-timeline]");
  if (timelineHost) buildTimelineSpine(gsap, ScrollTrigger, timelineHost);

  // Recompute geometry after fonts/images settle (heights change → path recalcs).
  const refresh = () => spine && spine.resize();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(refresh);
  window.addEventListener("load", refresh, { once: true });
}

/* ========================================================================== */
/*  JOURNEY — the persistent scroll-spine                                       */
/* ========================================================================== */
function buildSpine(gsap, ScrollTrigger, calm) {
  // Build the fixed lane + SVG.
  const lane = document.createElement("div");
  lane.className = "breath-spine";
  lane.setAttribute("aria-hidden", "true");

  const svg = svgEl("svg", {
    class: "breath-spine__svg",
    preserveAspectRatio: "none",
    fill: "none",
  });
  svg.appendChild(brassDefs("breathSpineGrad", true));

  const bed = svgEl("path", { class: "breath-spine__bed" });
  const line = svgEl("path", { class: "breath-spine__line" });
  const glow = svgEl("circle", { class: "breath-spine__glow", r: calm ? 2 : 2.6 });
  glow.style.opacity = "0";

  svg.appendChild(bed);
  svg.appendChild(line);
  svg.appendChild(glow);
  lane.appendChild(svg);
  document.body.appendChild(lane);

  // Viewbox: a tall-ish coordinate space. Width is small (the wave amplitude
  // lives inside it). We use preserveAspectRatio:none so it stretches to lane.
  const W = 20;          // svg coord width
  let H = 1000;          // svg coord height (set on resize to lane px height)
  const midX = W / 2;

  // State the render loop reads.
  const state = {
    progress: 0,     // 0..1 scroll-through-page
    amp: 0,          // 0..1 current wave amplitude (velocity-driven)
    ampTarget: 0,    // where amp eases toward
    phase: 0,        // travelling phase for the flow shimmer
    peaks: [],       // {at:0..1, strength:0..1} milestone swells
    drawn: 0,        // 0..1 how much of the line has been "drawn on" (birth handoff)
  };

  // Peaks: place a graceful swell at each milestone section's vertical centre.
  // We compute their normalized document position on resize.
  const milestoneSelectors = [
    "[data-animate='featured-perf']",
    "[data-animate='featured-video']",
    "[data-animate='featured-gallery']",
    "[data-animate='featured-press']",
    "[data-craft-movement]",
    "[data-timeline-teaser]",
    "[data-animate='performances']",
    "[data-animate='videos']",
    "[data-animate='press']",
    "[data-animate='gallery']",
  ];

  function computePeaks() {
    const doc = document.documentElement;
    const total = Math.max(1, doc.scrollHeight - window.innerHeight);
    const els = [];
    milestoneSelectors.forEach((sel) => $$(sel).forEach((e) => els.push(e)));
    state.peaks = els
      .map((el) => {
        const rect = el.getBoundingClientRect();
        const centerDoc = rect.top + window.scrollY + rect.height / 2;
        // Normalized to the scroll range (approx — the traveler passes it).
        const at = Math.min(1, Math.max(0, (centerDoc - window.innerHeight / 2) / total));
        return { at, strength: 1 };
      })
      .filter((p) => p.at > 0.02 && p.at < 0.98);
  }

  function resize() {
    const px = lane.getBoundingClientRect().height || window.innerHeight;
    H = Math.max(200, Math.round(px));
    svg.setAttribute("viewBox", `0 0 ${W} ${H}`);
    computePeaks();
    render();
  }

  // Build the path "d" for the current state. The spine is a mostly-vertical
  // line down midX; velocity adds a gentle travelling sine wave (flow), and
  // milestone peaks add a localized graceful bulge (musical phrasing, not
  // teeth — a single smooth swell per milestone via a wide gaussian).
  const SEG = calm ? 26 : 40; // samples down the height
  function buildD() {
    const drawH = H * state.drawn;          // birth handoff: reveal from top
    const pts = [];
    for (let i = 0; i <= SEG; i++) {
      const t = i / SEG;                     // 0..1 down the lane
      const y = t * H;
      if (y > drawH + 0.5) break;            // only the drawn portion exists
      // Flow wave: amplitude scales with velocity (amp), calmer past progress.
      const flowAmp = (calm ? 0.9 : 2.2) * state.amp;
      const flow =
        Math.sin(t * Math.PI * (calm ? 5 : 7) + state.phase) *
        flowAmp *
        // taper the wave at the very top/bottom so ends stay clean
        Math.sin(t * Math.PI);

      // Milestone peaks: a wide, smooth gaussian swell toward the lane centre.
      let peak = 0;
      for (const p of state.peaks) {
        const d = t - p.at;
        const g = Math.exp(-(d * d) / (2 * 0.018 * 0.018)); // wide, graceful
        // Only bloom peaks the traveler has reached / is near (feels alive).
        const reach = smoothstep(p.at - 0.12, p.at, state.progress);
        peak += g * (calm ? 2.4 : 3.8) * reach;
      }

      const x = midX + flow + peak;
      pts.push([x, y]);
    }
    if (pts.length < 2) {
      // Nothing drawn yet — degenerate to a dot at top.
      return `M ${midX} 0`;
    }
    return catmullRom(pts);
  }

  // Static bed = full straight line (the lane never looks empty).
  function buildBedD() {
    return `M ${midX} 0 L ${midX} ${H}`;
  }

  let travelerY = 0;
  function render() {
    bed.setAttribute("d", buildBedD());
    const d = buildD();
    line.setAttribute("d", d);

    // Dash the line so it appears "drawn": we already limit points to drawn
    // portion, but a soft dash offset at the leading edge sells the draw.
    // Position the traveler glow at the current progress along the height.
    travelerY = state.progress * H;
    glow.setAttribute("cx", String(midX));
    glow.setAttribute("cy", String(travelerY));
  }

  // ── Scroll progress (draw + traveler) via ScrollTrigger scrub ──────────────
  ScrollTrigger.create({
    trigger: document.documentElement,
    start: "top top",
    end: "bottom bottom",
    onUpdate: (self) => {
      state.progress = self.progress;
      // Velocity → target amplitude. Normalize; clamp. Fast scroll = more flow.
      const v = Math.min(Math.abs(self.getVelocity()) / 1400, 1);
      state.ampTarget = v;
    },
  });

  // Settle to a near-still shimmer shortly after scroll stops (sustained note).
  let settleTimer = null;
  ScrollTrigger.addEventListener("scrollEnd", () => {
    clearTimeout(settleTimer);
    settleTimer = setTimeout(() => {
      state.ampTarget = 0;
    }, 140);
  });

  // ── Render loop (throttled to rAF via gsap.ticker) ─────────────────────────
  const shimmerSpeed = calm ? 0.012 : 0.02;
  function tick() {
    // Ease amplitude toward target (velocity in, settle out).
    state.amp += (state.ampTarget - state.amp) * 0.08;
    // A whisper of residual breathing even at rest — the sustained shimmer.
    const rest = 0.12;
    const effAmp = Math.max(state.amp, rest * (0.6 + 0.4 * Math.sin(state.phase * 0.6)));
    // Only advance phase enough to read as slow breathing.
    state.phase += shimmerSpeed + state.amp * 0.06;
    // Fade the traveler glow in once the line has been introduced.
    const targetGlow = state.drawn > 0.98 ? 0.85 : 0;
    const cur = parseFloat(glow.style.opacity || "0");
    glow.style.opacity = String(cur + (targetGlow - cur) * 0.08);
    // Push effective amp into state for buildD via a temp swap.
    const savedAmp = state.amp;
    state.amp = effAmp;
    render();
    state.amp = savedAmp;
  }
  gsap.ticker.add(tick);

  // ── Draw-on introduction (used when no birth act plays) ────────────────────
  function introduce() {
    gsap.to(state, {
      drawn: 1,
      duration: calm ? 1.1 : 1.6,
      ease: "power2.inOut",
    });
  }

  // Public API for the birth handoff.
  const api = {
    resize,
    introduce,
    // Instantly set the line fully drawn (birth already showed the line).
    handoffFromBirth() {
      gsap.to(state, { drawn: 1, duration: 0.9, ease: "power2.out" });
    },
    state,
    lane,
  };

  resize();
  window.addEventListener("resize", debounce(resize, 150));
  return api;
}

/* ========================================================================== */
/*  BIRTH — hero saxophone assembly (index.html)                                */
/* ========================================================================== */
function buildBirth(gsap, host, spine) {
  // Overlay SVG centred in the hero stage. Coordinate space 0..100 x 0..120.
  const wrap = document.createElement("div");
  wrap.className = "breath-birth";
  wrap.setAttribute("aria-hidden", "true");

  const svg = svgEl("svg", {
    class: "breath-birth__svg",
    viewBox: "0 0 100 120",
    preserveAspectRatio: "xMidYMid meet",
    fill: "none",
  });
  svg.appendChild(brassDefs("breathBirthGrad", true));

  // An abstract-brass saxophone SILHOUETTE — kept minimal & graceful rather
  // than photoreal: a single flowing stroke describing the neck curving down
  // into the body and flaring into the bell, plus a few "key" points of light.
  // Hand-authored for elegance (a clumsy literal sax would ruin the signature;
  // this reads as brass + horn without being fussy).
  const SAX_D =
    "M 50 8 " +               // mouthpiece top (on the eventual spine axis)
    "C 50 20 49 28 47 34 " +  // neck descending
    "C 45 41 41 46 41 54 " +  // curving into the body
    "C 41 66 43 78 47 88 " +  // body descending
    "C 50 96 55 100 61 101 " +// turning toward the bell
    "C 69 102 76 98 79 90 " + // bell flare outer
    "C 81 85 81 80 79 77";    // bell lip

  const path = svgEl("path", { class: "breath-birth__path", d: SAX_D });
  svg.appendChild(path);

  // Key points of light along the body.
  const keys = [
    [44, 50],
    [42.5, 60],
    [43.5, 70],
    [46, 80],
  ];
  const keyEls = keys.map(([cx, cy]) => {
    const c = svgEl("circle", { class: "breath-birth__key", cx, cy, r: 1.2 });
    c.style.opacity = "0";
    svg.appendChild(c);
    return c;
  });

  wrap.appendChild(svg);
  host.appendChild(wrap);

  // Prepare the draw-on: stroke-dash.
  const len = path.getTotalLength ? path.getTotalLength() : 300;
  gsap.set(path, { strokeDasharray: len, strokeDashoffset: len, opacity: 1 });
  gsap.set(wrap, { opacity: 0 });

  const tl = gsap.timeline({ delay: 0.15 });

  // 1) Fade the stage in + draw the horn on (assembles into the silhouette).
  tl.to(wrap, { opacity: 1, duration: 0.6, ease: "power1.out" }, 0);
  tl.to(
    path,
    { strokeDashoffset: 0, duration: 1.5, ease: "power2.inOut" },
    0.1
  );
  // 2) Keys light up as points of light (phrased, like notes).
  keyEls.forEach((k, i) => {
    tl.to(
      k,
      { opacity: 0.95, duration: 0.4, ease: "power1.out" },
      0.9 + i * 0.12
    );
  });
  // 3) Hold a breath.
  tl.to({}, { duration: 0.6 });
  // 4) Dissolve the silhouette, leaving the single line behind → hand to spine.
  tl.to(keyEls, { opacity: 0, duration: 0.5, ease: "power1.in" }, ">-0.1");
  tl.to(
    path,
    { opacity: 0, duration: 0.8, ease: "power2.inOut" },
    "<"
  );
  tl.to(wrap, { opacity: 0, duration: 0.6 }, "<0.2");
  tl.add(() => {
    // Hand off: the spine draws itself in as the sax dissolves.
    if (spine) spine.introduce();
    wrap.remove(); // clean up the birth overlay entirely.
  }, ">-0.4");

  return tl;
}

/* ========================================================================== */
/*  RESOLUTION — brass flourish beneath the wordmark (index.html)               */
/* ========================================================================== */
function buildResolve(gsap, ScrollTrigger, host) {
  const svg = svgEl("svg", {
    class: "breath-resolve__svg",
    viewBox: "0 0 300 60",
    preserveAspectRatio: "xMidYMid meet",
    fill: "none",
  });
  svg.appendChild(brassDefs("breathResolveGrad", false));

  // The line coming to rest: a long horizontal stroke that lifts into a small
  // grace curl at its centre (a signature flourish / the "signing" of the mark).
  const FLOURISH_D =
    "M 20 34 " +
    "C 70 34 110 34 140 34 " +
    "C 150 34 150 22 158 22 " +   // small rise (the flourish)
    "C 166 22 166 34 176 34 " +
    "C 210 34 250 34 280 34";
  const path = svgEl("path", { class: "breath-resolve__path", d: FLOURISH_D });
  svg.appendChild(path);

  const wrap = document.createElement("div");
  wrap.className = "breath-resolve";
  wrap.setAttribute("aria-hidden", "true");
  wrap.appendChild(svg);
  host.appendChild(wrap);

  const len = path.getTotalLength ? path.getTotalLength() : 400;
  gsap.set(path, { strokeDasharray: len, strokeDashoffset: len });

  // Draw the flourish as the invitation enters — the line resolves to rest.
  ScrollTrigger.create({
    trigger: host,
    start: "top 78%",
    once: true,
    onEnter: () => {
      gsap.to(path, {
        strokeDashoffset: 0,
        duration: 1.6,
        ease: "power2.inOut",
      });
    },
  });
}

/* ========================================================================== */
/*  TIMELINE spine — the central line the nodes sit on (timeline.html)          */
/* ========================================================================== */
function buildTimelineSpine(gsap, ScrollTrigger, host) {
  const staticLine = $("[data-breath-timeline]", host);
  // Overlay SVG matching the static line's geometry.
  const svg = svgEl("svg", {
    class: "breath-timeline__svg",
    preserveAspectRatio: "none",
    fill: "none",
  });
  svg.appendChild(brassDefs("breathSpineGrad", true));
  const line = svgEl("path", { class: "breath-timeline__line" });
  svg.appendChild(line);

  const wrap = document.createElement("div");
  wrap.className = "breath-timeline";
  wrap.setAttribute("aria-hidden", "true");
  wrap.appendChild(svg);
  host.appendChild(wrap);

  // Hide the static gradient bed while our drawn line is live (fallback stays
  // if JS/GSAP fail — we only reach here when the engine is on).
  if (staticLine) staticLine.style.opacity = "0.25";

  const W = 4;
  let H = 1000;
  const midX = W / 2;

  function resize() {
    const px = host.getBoundingClientRect().height || 1000;
    H = Math.max(200, Math.round(px));
    svg.setAttribute("viewBox", `0 0 ${W} ${H}`);
    line.setAttribute("d", `M ${midX} 0 L ${midX} ${H}`);
    const len = line.getTotalLength ? line.getTotalLength() : H;
    gsap.set(line, { strokeDasharray: len, strokeDashoffset: len });
    return len;
  }
  let len = resize();

  // The line DRAWS as you scroll through the timeline — reaching each node as
  // the nodes unfold (reveal.js batches the node reveals independently).
  ScrollTrigger.create({
    trigger: host,
    start: "top 70%",
    end: "bottom 80%",
    scrub: 0.6,
    onUpdate: (self) => {
      line.setAttribute("stroke-dashoffset", String(len * (1 - self.progress)));
    },
  });

  window.addEventListener("resize", debounce(() => (len = resize()), 150));
}

/* ========================================================================== */
/*  Small math / util helpers                                                   */
/* ========================================================================== */

/* Catmull-Rom → cubic bezier smoothing so the sampled points read as a single
   graceful curve (musical phrasing), never as jagged segments. */
function catmullRom(pts) {
  if (pts.length < 2) return "";
  let d = `M ${pts[0][0].toFixed(2)} ${pts[0][1].toFixed(2)}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] || pts[i];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2] || p2;
    const c1x = p1[0] + (p2[0] - p0[0]) / 6;
    const c1y = p1[1] + (p2[1] - p0[1]) / 6;
    const c2x = p2[0] - (p3[0] - p1[0]) / 6;
    const c2y = p2[1] - (p3[1] - p1[1]) / 6;
    d += ` C ${c1x.toFixed(2)} ${c1y.toFixed(2)} ${c2x.toFixed(2)} ${c2y.toFixed(
      2
    )} ${p2[0].toFixed(2)} ${p2[1].toFixed(2)}`;
  }
  return d;
}

/* Smooth 0..1 interpolation between edge0 and edge1. */
function smoothstep(edge0, edge1, x) {
  const t = Math.min(1, Math.max(0, (x - edge0) / (edge1 - edge0 || 1)));
  return t * t * (3 - 2 * t);
}

function debounce(fn, ms) {
  let id = null;
  return (...args) => {
    clearTimeout(id);
    id = setTimeout(() => fn(...args), ms);
  };
}
