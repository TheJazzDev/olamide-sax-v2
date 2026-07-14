/* carousel.js — "The Live Wall" tilted photo-wheel: a billboarded ring of photos
   scrubbed 360° by scroll, spun by horizontal drag, tilted by vertical drag,
   click-to-front. Reduced-motion/no-GSAP → CSS falls back to a scroll row. */

import { prefersReducedMotion, isMobile } from "./utils.js";

export function initCarousel() {
  const gsap = window.gsap;
  const ScrollTrigger = window.ScrollTrigger;
  const root = document.querySelector("[data-carousel]");
  const ring = document.querySelector("[data-carousel-ring]");
  const stage = document.querySelector("[data-carousel-stage]");
  const captionEl = document.querySelector("[data-carousel-caption]");
  if (!root || !ring || !stage) return;
  if (!gsap || prefersReducedMotion()) return;

  const items = Array.from(ring.querySelectorAll("[data-carousel-item]"));
  const n = items.length;
  if (n < 3) return;

  // ── MOBILE: no ring ─────────────────────────────────────────────────────────
  // The tilted 3D wheel clumps the photos together on a phone and re-renders the
  // whole ring every scroll frame (heavy). On mobile we drop it entirely and
  // show a clean scrollable photo column (CSS .is-flat), each image revealing on
  // scroll — no per-frame work, no 3D.
  if (isMobile()) {
    initCarouselFlat(gsap, ScrollTrigger, root, items, prefersReducedMotion);
    return;
  }

  root.classList.add("is-3d");

  // Discovery hint — a quiet cue in the bottom-LEFT corner of the wheel. It fades
  // on the first drag/click OR once the section has scrolled ~30% out of view
  // (see the ScrollTrigger below), so it never lingers over the photos.
  let hintEl = stage.querySelector("[data-carousel-hint]");
  if (!hintEl) {
    hintEl = document.createElement("p");
    hintEl.className = "carousel__hint";
    hintEl.setAttribute("data-carousel-hint", "");
    hintEl.setAttribute("aria-hidden", "true");
    hintEl.innerHTML =
      `<span>Drag</span> to spin <i aria-hidden="true">·</i> <span>Click</span> to bring forward`;
    stage.appendChild(hintEl);
  }
  let hintDismissed = false;
  function dismissHint() {
    if (hintDismissed) return;
    hintDismissed = true;
    root.classList.add("hint-gone");
  }

  const step = 360 / n;                       // degrees between photos around rim
  const DEG = Math.PI / 180;

  // ── Rotation state ──────────────────────────────────────────────────────────
  // The ring's total rotation = scrollRot (from the pinned scroll) + dragRot
  // (from horizontal dragging) + clickRot (eased offset when a photo is clicked
  // to the front). Keeping them separate means scroll and drag never fight.
  let scrollRot = 0;   // set directly by the scroll scrub (no easing → no bounce)
  let dragRot = 0;     // added by horizontal drag
  const clickRot = { v: 0 }; // eased offset applied when clicking a photo forward
  let tilt = 1;        // 1 = default tilt; >1 flatter (bird's-eye), <1 upright

  function rotationNow() {
    return scrollRot + dragRot + clickRot.v;
  }

  // Wheel dimensions, sized to the stage.
  const isPhone = window.matchMedia("(max-width: 767px)").matches;
  function dims() {
    const w = stage.clientWidth || window.innerWidth;
    const h = stage.clientHeight || 480;
    return {
      rx: w * (isPhone ? 0.34 : 0.43),          // horizontal spread from centre
      ry: h * (isPhone ? 0.22 : 0.30) * tilt,   // vertical spread
      rz: w * (isPhone ? 0.40 : 0.30) / tilt,   // depth
      cy: -h * 0.05,                            // headroom nudge up
    };
  }
  let D = dims();

  // The single source of truth for a photo's pose on the wheel.
  function pose(i, rot) {
    const a = (i * step + rot) * DEG;
    const depth = Math.cos(a);               // +1 front (near) … −1 back (far)
    const t = (depth + 1) / 2;               // 0 at back … 1 at front
    return {
      x: Math.sin(a) * D.rx,                 // position around the rim
      y: depth * D.ry + D.cy,                // front LOW (near), back HIGH (far)
      z: depth * D.rz,                       // front toward camera, back away
      scale: 0.52 + t * 0.6,                 // depth read comes from SCALE only …
      opacity: 1,                            // … NOT opacity — all photos full-bright
      zIndex: Math.round(t * 1000),          // near photos paint over far ones
      depth,
    };
  }

  function place(item, i, rot) {
    const p = pose(i, rot);
    gsap.set(item, {
      xPercent: -50, yPercent: -50,
      x: p.x, y: p.y, z: p.z,
      scale: p.scale, opacity: p.opacity, zIndex: p.zIndex,
    });
    item._depth = p.depth;
  }

  function placeAll(rot) {
    items.forEach((item, i) => place(item, i, rot));
  }

  // Redraw + keep the active photo current, from the live rotation.
  function render() {
    if (!root._assembled) return;
    placeAll(rotationNow());
    updateActive();
  }

  // Which photo is at the front (nearest the viewer)?
  function nearestIndex(rot = rotationNow()) {
    let best = 0, bestDepth = -Infinity;
    items.forEach((_, i) => {
      const depth = Math.cos((i * step + rot) * DEG);
      if (depth > bestDepth) { bestDepth = depth; best = i; }
    });
    return best;
  }

  let activeIdx = -1;
  function updateActive() {
    const active = nearestIndex();
    if (active === activeIdx) return;
    activeIdx = active;
    items.forEach((item, i) => {
      if (i === active) item.setAttribute("data-active", "");
      else item.removeAttribute("data-active");
    });
    // The caption now lives on the front photo itself (base of the image), so the separate under-ring caption element is no longer used.
  }

  function captionHTML(item) {
    const label = item.getAttribute("data-src") || "";
    const [source, moment] = label.split(" — ");
    return moment
      ? `<span class="cap-src">${source}</span><span class="cap-moment">${moment}</span>`
      : `<span class="cap-src">${source}</span>`;
  }

  // Click a photo → ease it to the front by nudging clickRot along the shortest path (added on top of the scroll position).
  function bringToFront(i) {
    const rot = rotationNow();
    // angle of photo i right now, relative to front (0)
    let a = ((i * step + rot) % 360 + 360) % 360;
    if (a > 180) a -= 360;
    // to face front we must rotate by -a
    gsap.to(clickRot, {
      v: clickRot.v - a,
      duration: 0.8,
      ease: "power3.out",
      onUpdate: render,
    });
  }

  // Give each photo its own caption node, pinned to the base of the image.
  items.forEach((item) => {
    let cap = item.querySelector("[data-item-cap]");
    if (!cap) {
      cap = document.createElement("span");
      cap.className = "carousel__item-cap";
      cap.setAttribute("data-item-cap", "");
      item.appendChild(cap);
    }
    cap.innerHTML = captionHTML(item);
  });

  // ── Entrance: fly in from scattered off-screen positions and assemble ───────
  function assemble() {
    if (root._assembled) return;
    root._assembled = true;
    scrollRot = 0; dragRot = 0; clickRot.v = 0;

    const targets = items.map((_, i) => pose(i, 0));
    const vw = stage.clientWidth || window.innerWidth;
    const vh = stage.clientHeight || 480;

    items.forEach((item, i) => { item._depth = targets[i].depth; });
    activeIdx = -1; updateActive();

    const tl = gsap.timeline({ onComplete: () => { placeAll(0); } });
    items.forEach((item, i) => {
      const corner = i % 4;
      const ox = (corner === 0 || corner === 3 ? -1 : 1) * (vw * 0.7 + Math.random() * vw * 0.4);
      const oy = (corner < 2 ? -1 : 1) * (vh * 0.8 + Math.random() * vh * 0.5);
      gsap.set(item, {
        xPercent: -50, yPercent: -50,
        x: ox, y: oy, z: -400,
        scale: 0.3, opacity: 0, rotationZ: (Math.random() - 0.5) * 40,
      });
    });
    items.forEach((item, i) => {
      const t = targets[i];
      tl.to(item, {
        x: t.x, y: t.y, z: t.z,
        scale: t.scale, opacity: 1, rotationZ: 0, zIndex: t.zIndex,
        duration: 1.15, ease: "power3.out",
      }, i * 0.06);
    });
  }

  // ── Scroll-scrub: rotate the ring a full 360° as the section travels the ─── viewport.
  if (ScrollTrigger) {
    ScrollTrigger.create({
      trigger: root,
      start: "top 85%",     // ring enters from the bottom
      end: "bottom 15%",    // …until it leaves at the top
      scrub: 0.6,           // gentle smoothing, NOT a snap-back
      onUpdate: (self) => {
        scrollRot = self.progress * 360;   // 0 → 360 across the travel
        render();
      },
    });
    // Fly-in as it comes into view.
    ScrollTrigger.create({
      trigger: root,
      start: "top 82%",
      once: true,
      onEnter: assemble,
    });
    const r = root.getBoundingClientRect();
    if (r.top < window.innerHeight * 0.82) assemble();

    // Hide the hint once the section has scrolled ~30% out of view (either
    // direction), so it never sits on the photos as you scroll away. It also
    // comes back if you scroll back into the section (unless already dismissed
    // by an interaction). Range: top of section 30% off the top edge (scrolling
    // down) ↔ bottom of section 30% up from the bottom edge (scrolling up).
    ScrollTrigger.create({
      trigger: root,
      start: "top -30%",       // 30% of the section scrolled past the top
      end: "bottom 30%",       // 30% before the bottom re-enters from below
      onToggle: (self) => {
        if (hintDismissed) return;         // an interaction already killed it
        root.classList.toggle("hint-out", !self.isActive);
      },
    });
  } else {
    assemble();
  }

  // ── Click: bring a photo to the front ───────────────────────────────────────
  function itemAtPoint(x, y) {
    let hit = -1, hitDepth = -Infinity;
    items.forEach((item, i) => {
      const rect = item.getBoundingClientRect();
      if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) return;
      if ((item._depth ?? -1) > hitDepth) { hitDepth = item._depth ?? -1; hit = i; }
    });
    return hit;
  }

  stage.addEventListener("click", (e) => {
    if (root.classList.contains("was-dragging")) return;
    const i = itemAtPoint(e.clientX, e.clientY);
    if (i !== -1) { dismissHint(); bringToFront(i); }
  });

  // ── Drag: horizontal = spin (grab the photo), vertical = tilt the wheel ─────
  const DRAG_SENSITIVITY = 0.22;   // deg of ring rotation per px dragged
  const DRAG_THRESHOLD = 6;
  let pressing = false, dragging = false, axis = null;
  let startX = 0, startY = 0, startDragRot = 0, startTilt = 1, moved = 0;
  // Velocity tracking + proxy for the release momentum ("elastic" glide).
  let lastMoveX = 0, lastMoveT = 0, velRot = 0;   // velRot: deg/ms of dragRot
  const dragProxy = { v: 0 };                     // gsap tweens this on release

  stage.addEventListener("pointerdown", (e) => {
    pressing = true; dragging = false; axis = null; moved = 0;
    startX = e.clientX; startY = e.clientY;
    startDragRot = dragRot; startTilt = tilt;
    lastMoveX = e.clientX; lastMoveT = e.timeStamp || performance.now();
    velRot = 0;
    dismissHint();                 // any interaction clears the hint
    // Capture the pointer to the stage immediately so EVERY subsequent move routes here — even.
    try { stage.setPointerCapture(e.pointerId); } catch (_) {}
    // A fresh grab cancels any in-flight momentum glide.
    gsap.killTweensOf(dragProxy);
  });
  stage.addEventListener("pointermove", (e) => {
    if (!pressing) return;
    const dx = e.clientX - startX;
    const dy = e.clientY - startY;
    moved = Math.max(moved, Math.hypot(dx, dy));
    if (!dragging && moved > DRAG_THRESHOLD) {
      dragging = true;
      axis = Math.abs(dx) >= Math.abs(dy) ? "x" : "y";
      root.classList.add("is-dragging");
      root.classList.add(axis === "x" ? "is-dragging--x" : "is-dragging--y");
    }
    if (!dragging) return;
    if (axis === "x") {
      // Positive dx (drag right) should carry the front photo to the right, i.e.
      dragRot = startDragRot - dx * DRAG_SENSITIVITY;
      // Track instantaneous rotational velocity for the release glide.
      const now = e.timeStamp || performance.now();
      const dt = now - lastMoveT;
      if (dt > 0) {
        const stepVel = -(e.clientX - lastMoveX) * DRAG_SENSITIVITY / dt; // deg/ms
        // Smooth so a jittery last frame doesn't dominate the throw.
        velRot = velRot * 0.6 + stepVel * 0.4;
        lastMoveX = e.clientX;
        lastMoveT = now;
      }
    } else {
      // Drag up → flatten (bird's-eye, tilt >1); drag down → upright (tilt <1).
      tilt = Math.min(1.7, Math.max(0.55, startTilt - dy * 0.0016));
      D = dims();
    }
    render();
  });

  // Momentum glide: on release, keep the ring spinning in the drag direction and ease it to.
  function flingMomentum() {
    // Ignore tiny flicks (they'd just add jitter); let those settle where they are.
    if (Math.abs(velRot) < 0.02) return;
    // Project a throw distance from the release velocity.
    let throwDeg = velRot * 180;
    const MAX = 900;                      // at most ~2.5 turns of coast
    throwDeg = Math.max(-MAX, Math.min(MAX, throwDeg));
    dragProxy.v = dragRot;
    gsap.to(dragProxy, {
      v: dragRot + throwDeg,
      duration: 1.1,
      ease: "power2.out",               // decelerating coast
      onUpdate: () => { dragRot = dragProxy.v; render(); },
    });
  }

  const endPress = () => {
    if (!pressing) return;
    pressing = false;
    if (dragging) {
      dragging = false;
      root.classList.remove("is-dragging", "is-dragging--x", "is-dragging--y");
      // Suppress the click that trails a drag.
      root.classList.add("was-dragging");
      setTimeout(() => root.classList.remove("was-dragging"), 0);
      if (axis === "x") flingMomentum();   // let the throw coast to a rest
    }
  };
  stage.addEventListener("pointerup", endPress);
  stage.addEventListener("pointercancel", endPress);

  // ── Keyboard: step the ring ─────────────────────────────────────────────────
  stage.setAttribute("tabindex", "0");
  stage.addEventListener("keydown", (e) => {
    if (e.key === "ArrowRight") { bringToFront((nearestIndex() + 1 + n) % n); e.preventDefault(); }
    else if (e.key === "ArrowLeft") { bringToFront((nearestIndex() - 1 + n) % n); e.preventDefault(); }
  });

  // Re-measure on resize.
  window.addEventListener("resize", () => {
    D = dims();
    if (ScrollTrigger) ScrollTrigger.refresh();
    render();
  }, { passive: true });
}

/* Flat mobile Live Wall: a clean scrollable column of the same photos, each
   captioned and revealing gently on scroll. No 3D, no per-frame render loop. */
function initCarouselFlat(gsap, ScrollTrigger, root, items) {
  root.classList.add("is-flat");

  // Same caption content the 3D path builds, pinned under each image.
  items.forEach((item) => {
    const label = item.getAttribute("data-src") || "";
    const [source, moment] = label.split(" — ");
    let cap = item.querySelector("[data-item-cap]");
    if (!cap) {
      cap = document.createElement("span");
      cap.className = "carousel__item-cap";
      cap.setAttribute("data-item-cap", "");
      item.appendChild(cap);
    }
    cap.innerHTML = moment
      ? `<span class="cap-src">${source}</span><span class="cap-moment">${moment}</span>`
      : `<span class="cap-src">${source}</span>`;
  });

  // A light reveal per card — one ScrollTrigger.batch, no per-frame ticker.
  gsap.set(items, { opacity: 0, y: 24 });
  if (ScrollTrigger) {
    ScrollTrigger.batch(items, {
      start: "top 88%",
      once: true,
      onEnter: (batch) =>
        gsap.to(batch, { opacity: 1, y: 0, duration: 0.6, stagger: 0.08, ease: "power2.out" }),
    });
  } else {
    gsap.to(items, { opacity: 1, y: 0, duration: 0.5, stagger: 0.06 });
  }
}
