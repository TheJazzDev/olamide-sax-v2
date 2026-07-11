/* ============================================================================
   carousel.js — Olamide Sax V3 · "The Live Wall" tilted photo-wheel
   ----------------------------------------------------------------------------
   A big ring of photographs seen at an angle — a wheel lying tilted back into
   the screen. Every photo sits around the whole rim and is BILLBOARDED (always
   facing the viewer), so all of them are visible at once: the ones at the front
   of the wheel are large and low, the ones at the back are small, high and dim,
   receding into depth. Spinning the wheel carries photos around the rim.

   This is deliberately NOT a vertical cylinder/drum: a drum only ever shows the
   front ~3 photos face-on (the rest turn edge-on or hide behind). A tilted,
   billboarded wheel shows the entire ring at once — the "ring of pictures".

   Layout (per photo at wheel-angle a, measured from the front/bottom):
     nx =  sin(a)                      · horizontal position on the rim (−1..1)
     depth = cos(a)                    · +1 at front (near), −1 at back (far)
     x  = nx * RADIUS_X                · screen-x around the rim
     y  = -depth * RADIUS_Y * TILT     · front sits low, back rides up
     z  =  depth * RADIUS_Z            · front comes toward camera, back recedes
   Scale + opacity are driven by depth so the back of the wheel recedes.

   Interaction: drag / wheel to spin, click a photo to bring it to the front,
   ← / → to step. The front (nearest) photo is [data-active]; its caption shows.

   Entrance: on scroll-in the photos fly in from scattered off-screen positions
   and assemble into the wheel (ScrollTrigger, one-shot).

   PROGRESSIVE ENHANCEMENT: no GSAP / reduced-motion → do nothing; the CSS shows
   a plain horizontal-scroll row of the photos (fully usable).
   ========================================================================== */

import { prefersReducedMotion } from "./utils.js";

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

  root.classList.add("is-3d");

  const step = 360 / n;                      // degrees between photos around rim
  const DEG = Math.PI / 180;

  // Wheel dimensions, sized to the stage so it fills the width and reads big.
  function dims() {
    const w = stage.clientWidth || window.innerWidth;
    const h = stage.clientHeight || 480;
    return {
      rx: w * 0.43,      // horizontal spread of the rim (px from centre)
      ry: h * 0.30,      // vertical spread: back rides up, front sits low
      rz: w * 0.30,      // depth: how far front comes forward / back recedes
      // Shift the whole wheel up so the big front photos aren't jammed against
      // the bottom edge and the far rim has headroom at the top.
      cy: -h * 0.06,
    };
  }
  let D = dims();

  let rotation = 0;                          // target wheel spin (deg)
  // We animate a proxy's `.v` toward `rotation`; its onUpdate re-lays the wheel.
  // quickTo gives snappy, re-targetable easing without stacking tweens.
  const spin = { v: 0 };
  const setRot = gsap.quickTo(spin, "v", {
    duration: 0.9,
    ease: "power3.out",
    onUpdate: () => { if (root._assembled) placeAll(spin.v); },
  });

  // The single source of truth for a photo's pose on the wheel. `i` is its slot,
  // `rot` the current wheel rotation (deg). Billboarded: no rotateY, so it always
  // faces the viewer — depth only changes position, scale and opacity, which is
  // why the WHOLE ring stays visible (front large & low, back small, high & dim).
  function pose(i, rot) {
    const a = (i * step + rot) * DEG;
    const depth = Math.cos(a);               // +1 front (near) … −1 back (far)
    const t = (depth + 1) / 2;               // 0 at back … 1 at front
    return {
      x: Math.sin(a) * D.rx,                 // position around the rim
      y: depth * D.ry + D.cy,                // front LOW (near), back HIGH (far)
      z: depth * D.rz,                       // front toward camera, back away
      scale: 0.5 + t * 0.62,                 // ~0.5 far … ~1.12 near
      opacity: 0.28 + t * 0.72,              // dim far … full near
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

  // Which photo is at the front (nearest the viewer, largest, lowest)?
  function nearestIndex() {
    let best = 0;
    let bestDepth = -Infinity;
    items.forEach((_, i) => {
      const depth = Math.cos((i * step + rotation) * DEG);
      if (depth > bestDepth) { bestDepth = depth; best = i; }
    });
    return best;
  }

  function updateActive() {
    const active = nearestIndex();
    items.forEach((item, i) => {
      if (i === active) item.setAttribute("data-active", "");
      else item.removeAttribute("data-active");
    });
    if (captionEl) {
      const label = items[active].getAttribute("data-src") || "";
      const [source, moment] = label.split(" — ");
      captionEl.innerHTML = moment
        ? `<strong>${source}</strong> &nbsp; ${moment}`
        : `<strong>${source}</strong>`;
    }
  }

  function goToIndex(i) {
    // Rotate so photo i comes to the front (depth = +1 → its angle ≡ 0), by the
    // shortest path.
    let target = -i * step;
    target += Math.round((rotation - target) / 360) * 360;
    rotation = target;
    setRot(rotation);
    updateActive();
  }

  function snap() {
    goToIndex(nearestIndex());
  }

  // ── Entrance: fly in from scattered off-screen positions and assemble ──────
  function assemble() {
    if (root._assembled) return;
    root._assembled = true;
    rotation = 0;
    spin.v = 0;

    // Target (final) positions — the assembled wheel at rotation 0.
    const targets = items.map((_, i) => pose(i, 0));

    // Scattered start: fling each photo out to a random corner/edge, spun a bit.
    const vw = stage.clientWidth || window.innerWidth;
    const vh = stage.clientHeight || 480;
    const tl = gsap.timeline({
      onComplete: () => { placeAll(0); updateActive(); },
    });
    // Record final depths now so click hit-testing works during/after the fly-in.
    items.forEach((item, i) => { item._depth = targets[i].depth; });
    updateActive();
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
        scale: t.scale, opacity: t.opacity, rotationZ: 0,
        zIndex: t.zIndex,
        duration: 1.15,
        ease: "power3.out",
      }, i * 0.06);
    });
  }

  // Trigger the assembly when the section scrolls into view (one-shot). If
  // ScrollTrigger is missing, assemble immediately.
  if (ScrollTrigger) {
    ScrollTrigger.create({
      trigger: root,
      start: "top 78%",
      once: true,
      onEnter: assemble,
    });
    // If it's already on-screen at load, fire now.
    const r = root.getBoundingClientRect();
    if (r.top < window.innerHeight * 0.78) assemble();
  } else {
    assemble();
  }

  // ── Interactions ───────────────────────────────────────────────────────────
  // Click a photo → bring it to the front. In this billboarded wheel every photo
  // owns a real, hit-testable box, but they overlap; resolve the click to the
  // NEAREST (largest, front-most) photo under the pointer.
  function itemAtPoint(x, y) {
    let hit = -1;
    let hitDepth = -Infinity;
    items.forEach((item, i) => {
      const rect = item.getBoundingClientRect();
      if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) return;
      if ((item._depth ?? -1) > hitDepth) {
        hitDepth = item._depth ?? -1;
        hit = i;
      }
    });
    return hit;
  }

  stage.addEventListener("click", (e) => {
    if (root.classList.contains("was-dragging")) return;
    const i = itemAtPoint(e.clientX, e.clientY);
    if (i !== -1) goToIndex(i);
  });

  // Drag to spin. A press only becomes a drag past DRAG_THRESHOLD, so a plain
  // click still flows to the click handler above.
  const DRAG_THRESHOLD = 6;
  let pressing = false, dragging = false, startX = 0, startRot = 0, moved = 0;

  stage.addEventListener("pointerdown", (e) => {
    pressing = true; dragging = false; moved = 0;
    startX = e.clientX; startRot = rotation;
  });
  stage.addEventListener("pointermove", (e) => {
    if (!pressing) return;
    const dx = e.clientX - startX;
    moved = Math.max(moved, Math.abs(dx));
    if (!dragging && moved > DRAG_THRESHOLD) {
      dragging = true;
      root.classList.add("is-dragging");
      stage.setPointerCapture(e.pointerId);
    }
    if (dragging) {
      rotation = startRot + dx * 0.28;       // sensitivity
      setRot(rotation);
      updateActive();
    }
  });
  const endPress = () => {
    if (!pressing) return;
    pressing = false;
    if (dragging) {
      dragging = false;
      root.classList.remove("is-dragging");
      root.classList.add("was-dragging");
      setTimeout(() => root.classList.remove("was-dragging"), 0);
      snap();
    }
  };
  stage.addEventListener("pointerup", endPress);
  stage.addEventListener("pointercancel", endPress);

  // Wheel to spin.
  let wheelTimer = null;
  stage.addEventListener("wheel", (e) => {
    const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
    if (Math.abs(delta) < 4) return;
    e.preventDefault();
    rotation += delta * 0.1;
    setRot(rotation);
    updateActive();
    clearTimeout(wheelTimer);
    wheelTimer = setTimeout(snap, 140);
  }, { passive: false });

  // Keyboard.
  stage.setAttribute("tabindex", "0");
  stage.addEventListener("keydown", (e) => {
    if (e.key === "ArrowRight") { goToIndex(nearestIndex() + 1); e.preventDefault(); }
    else if (e.key === "ArrowLeft") { goToIndex(nearestIndex() - 1); e.preventDefault(); }
  });

  // Re-measure on resize and re-place.
  window.addEventListener("resize", () => {
    D = dims();
    if (root._assembled) placeAll(rotation);
  }, { passive: true });
}
