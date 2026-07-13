/* ============================================================================
   heroIntro.js — Olamide Sax V3 · cinematic hero entrance (home only)
   ----------------------------------------------------------------------------
   The "wow" arrival. A choreographed load sequence:
     1. the ambient video fades up from black,
     2. the award eyebrow rises in,
     3. the NAME WRITES ITSELF — each line becomes SVG text whose letterform
        outlines are stroke-drawn on (dash-offset → 0) like a signature being
        inked, then the solid fill blooms up through the strokes,
     4. the roles + Enter cue settle in.

   The SVG swap happens at runtime AFTER fonts are ready (so glyph metrics are
   exact); the original text is preserved for accessibility in a visually-
   hidden span. Under reduced-motion / no GSAP, nothing is touched — the
   plain HTML name renders as-is (heroIntro bails before any DOM change).
   ========================================================================== */

import { prefersReducedMotion } from "./utils.js";

let signatureCount = 0;

/* Swap one .hero__title-line's text for an SVG <text> that matches the HTML
   metrics exactly (font-size 100 units = 1em, viewBox from getBBox).

   The WRITING: the solid text sits behind a mask whose only white content is
   a PEN-ROUTE path — generated from the measured box of every character, the
   route dips and rises THROUGH each letter (an S per glyph, like a cursive
   hand) — stroked as wide as a pen nib. Drawing that path (dash-offset → 0)
   makes the ink appear along the pen's travel: written, not unveiled.
   Returns { svg, pen } — pen is the mask path to draw. */
function buildSignatureLine(line) {
  const NS = "http://www.w3.org/2000/svg";
  const content = line.textContent;
  const maskId = `hero-signature-${signatureCount++}`;

  const svg = document.createElementNS(NS, "svg");
  svg.setAttribute("aria-hidden", "true");
  svg.style.display = "block";
  svg.style.overflow = "visible";

  const text = document.createElementNS(NS, "text");
  text.textContent = content;
  text.setAttribute("x", "0");
  text.setAttribute("y", "0");
  // 100 user-units per em → getBBox maps straight back to em fractions.
  text.setAttribute(
    "style",
    "font-family: var(--font-script); font-weight: 400;" +
      "font-size: 100px; letter-spacing: 0; fill: currentColor;"
  );
  text.setAttribute("mask", `url(#${maskId})`);
  svg.appendChild(text);

  // Keep the real text for AT, swap the visual for the SVG.
  const sr = document.createElement("span");
  sr.className = "u-visually-hidden";
  sr.textContent = content;
  line.textContent = "";
  line.appendChild(sr);
  line.appendChild(svg);

  // Fit the viewBox to the rendered glyphs (fonts are ready by now).
  const box = text.getBBox();
  const pad = 6; // breathing room for flourish tips
  svg.setAttribute(
    "viewBox",
    `${box.x - pad} ${box.y - pad} ${box.width + pad * 2} ${box.height + pad * 2}`
  );
  svg.style.width = (box.width + pad * 2) / 100 + "em";
  svg.style.height = (box.height + pad * 2) / 100 + "em";

  // ── Build the pen route from real glyph geometry ──
  // For every character: an S-curve through its measured box — rise toward
  // the tops, dive through the bottoms — so the drawing front travels the way
  // a hand does, letter by letter, not as a flat sweep.
  const n = text.getNumberOfChars();
  // Gentler undulation: a steep S sliced glyphs visibly as it passed. The
  // wide nib (below) still covers full height as the front moves through.
  const yTop = box.y + box.height * 0.3;
  const yBot = box.y + box.height * 0.7;
  const yMid = box.y + box.height * 0.5;
  let d = "";
  for (let i = 0; i < n; i++) {
    const ext = text.getExtentOfChar(i);
    const x0 = ext.x;
    const w = Math.max(ext.width, 8);
    if (i === 0) d = `M ${x0 - 4} ${yMid} `;
    d +=
      `C ${x0 + w * 0.2} ${yTop}, ${x0 + w * 0.35} ${yTop}, ${x0 + w * 0.5} ${yMid} ` +
      `C ${x0 + w * 0.65} ${yBot}, ${x0 + w * 0.8} ${yBot}, ${x0 + w} ${yMid} `;
  }

  const mask = document.createElementNS(NS, "mask");
  mask.setAttribute("id", maskId);
  const pen = document.createElementNS(NS, "path");
  pen.setAttribute("d", d);
  pen.setAttribute("fill", "none");
  pen.setAttribute("stroke", "#fff");
  // BUTT caps — round caps render protruding dots at the dash boundaries
  // even when the pen is fully "undrawn" (that was the stray fragment of a
  // letter appearing before its line started writing).
  pen.setAttribute("stroke-linecap", "butt");
  pen.setAttribute("stroke-linejoin", "round");
  // Nib wide enough that the undulating route paints the full glyph height
  // (ascenders + descender flourishes) as the front moves through.
  pen.setAttribute("stroke-width", String(box.height * 0.85));
  mask.appendChild(pen);
  const defs = document.createElementNS(NS, "defs");
  defs.appendChild(mask);
  svg.insertBefore(defs, text);

  return { svg, pen };
}

/* ── The WRITING HAND ───────────────────────────────────────────────────────
   A large stylised illustration: a hand gripping a fountain pen, drawn as
   inline SVG. The artwork's coordinate system puts the NIB TIP at (0, 0)
   with the pen + hand extending up-right at a natural writing tilt — so the
   wrapper's translate puts the nib exactly on the writing point.
   Returns { el, penG, handG } — the pen and hand are separate groups so the
   pen can be FLIPPED AWAY at the end while the hand withdraws. */
function createWritingHand() {
  const el = document.createElement("div");
  el.className = "hero__hand";
  el.setAttribute("aria-hidden", "true");
  el.style.cssText =
    "position:fixed;left:0;top:0;z-index:80;pointer-events:none;" +
    "will-change:transform;";
  el.innerHTML =
    // viewBox: nib tip at (0,0); art extends up (−y) and right (+x).
    // max-width:none — the site reset clamps svg to max-width:100%, and the
    // wrapper is a zero-size point, so without this the art crushes to ~0px.
    '<svg viewBox="-70 -300 340 340" width="340" height="340"' +
    ' style="position:absolute;left:-70px;top:-300px;display:block;overflow:visible;' +
    "max-width:none;max-height:none;\">" +
    // Everything shares one 32° writing tilt, pivoting on the nib tip.
    '<g transform="rotate(32 0 0)">' +
    // ── THE PEN (its own group so it can be thrown) ──
    '<g data-pen>' +
    '<path d="M0 0 L-8 -30 Q0 -40 8 -30 Z" fill="#D8B87E"/>' + // nib
    '<line x1="0" y1="-4" x2="0" y2="-28" stroke="#7A5B26" stroke-width="1.6"/>' +
    '<rect x="-9" y="-40" width="18" height="12" rx="3" fill="#0B0A08"/>' + // collar
    '<rect x="-10" y="-128" width="20" height="90" rx="8" fill="#1D1712"/>' + // barrel
    '<rect x="-6.5" y="-122" width="3" height="80" rx="1.5" fill="#F3EDE3" opacity="0.16"/>' +
    '<rect x="-10" y="-140" width="20" height="13" rx="3" fill="#B8863B"/>' + // cap ring
    '<rect x="-8" y="-162" width="16" height="23" rx="7" fill="#1D1712"/>' + // cap
    "</g>" +
    // ── THE HAND (rich warm skin; simple confident shapes) ──
    '<g data-hand>' +
    // forearm + white cuff coming from upper-right
    '<path d="M60 -150 L150 -230 L195 -175 L98 -95 Z" fill="#5D3E26"/>' +
    '<path d="M92 -170 L138 -212 L165 -178 L118 -138 Z" fill="#F3EDE3"/>' +
    // back of hand
    '<path d="M18 -60 Q10 -110 45 -128 Q88 -148 108 -118 Q122 -96 104 -72 Q80 -44 46 -46 Q24 -48 18 -60 Z" fill="#7A5233"/>' +
    // curled middle/ring/little fingers wrapping the barrel
    '<path d="M20 -96 Q-16 -92 -14 -76 Q-12 -60 14 -62 Q30 -64 30 -78 Q30 -92 20 -96 Z" fill="#835A38"/>' +
    '<path d="M22 -76 Q-18 -70 -15 -55 Q-12 -41 15 -44 Q30 -47 30 -60 Q29 -72 22 -76 Z" fill="#7A5233"/>' +
    '<path d="M24 -56 Q-14 -49 -11 -36 Q-8 -24 16 -27 Q29 -30 29 -42 Q28 -52 24 -56 Z" fill="#6B4A2F"/>' +
    // index finger running down the barrel toward the nib
    '<path d="M34 -52 Q18 -34 4 -20 Q-6 -10 -13 -19 Q-18 -27 -8 -38 Q10 -58 30 -68 Q40 -64 34 -52 Z" fill="#835A38"/>' +
    // thumb pressing across the barrel
    '<path d="M42 -92 Q16 -78 -2 -64 Q-14 -54 -20 -64 Q-24 -74 -10 -84 Q14 -100 40 -106 Q48 -98 42 -92 Z" fill="#8A6040"/>' +
    "</g>" +
    "</g>" +
    "</svg>";
  document.body.appendChild(el);
  return {
    el,
    penG: el.querySelector("[data-pen]"),
    handG: el.querySelector("[data-hand]"),
  };
}

/* Screen-space point of a pen route at a given eased ratio, recomputed live
   each frame. Falls back to rect interpolation if the CTM is unavailable. */
function penPointAt(svg, path, ratio) {
  const r = Math.max(0, Math.min(1, ratio));
  try {
    const len = path.getTotalLength();
    const m = svg.getScreenCTM();
    if (!m) throw new Error("no CTM");
    const a = path.getPointAtLength(r * len).matrixTransform(m);
    return { x: a.x, y: a.y };
  } catch (_) {
    const rect = svg.getBoundingClientRect();
    return { x: rect.left + rect.width * r, y: rect.top + rect.height * 0.55 };
  }
}

export function initHeroIntro() {
  const gsap = window.gsap;
  const hero =
    document.querySelector('[data-animate="hero"]') ||
    document.querySelector(".hero");
  const title = document.querySelector('[data-animate="hero-title"]');
  if (!hero || !title) return;

  // Progressive enhancement: no motion → leave everything visible as-is.
  if (!gsap || prefersReducedMotion()) return;

  const lines = Array.from(title.querySelectorAll(".hero__title-line"));
  const video = hero.querySelector(".hero__video");
  const eyebrow = hero.querySelector(".hero__eyebrow");
  const meta = hero.querySelector(".hero__meta");
  const cue = hero.querySelector(".hero__cue");

  // The SVG signature-drawing (hand + pen tracing the letters) relies on precise
  // glyph geometry and is desktop-grade; on phones it mis-measures and leaves a
  // broken shape. On small screens run a SIMPLE, reliable reveal instead: the
  // plain name lines rise + fade in behind their masks, no SVG swap.
  const isMobile = window.matchMedia("(max-width: 767px)").matches;
  if (isMobile) {
    document.documentElement.classList.add("hero-intro-ready");
    gsap.set(lines, { opacity: 0, yPercent: 40 });
    if (video) gsap.set(video, { opacity: 0, scale: 1.06 });
    if (eyebrow) gsap.set(eyebrow, { opacity: 0, y: 16 });
    if (meta) gsap.set(meta, { opacity: 0, y: 14 });
    if (cue) gsap.set(cue, { opacity: 0, y: 10 });
    const tlm = gsap.timeline({ delay: 0.1 });
    if (video) tlm.to(video, { opacity: 1, scale: 1, duration: 1.3, ease: "power2.out" }, 0);
    if (eyebrow) tlm.to(eyebrow, { opacity: 1, y: 0, duration: 0.7, ease: "power3.out" }, 0.25);
    tlm.to(lines, { opacity: 1, yPercent: 0, duration: 0.9, ease: "power3.out", stagger: 0.12 }, 0.4);
    if (meta) tlm.to(meta, { opacity: 1, y: 0, duration: 0.7, ease: "power3.out" }, 0.9);
    if (cue) tlm.to(cue, { opacity: 1, y: 0, duration: 0.6, ease: "power3.out" }, 1.05);
    return () => tlm && tlm.kill();
  }

  // Pre-hide everything that will be choreographed (lines hidden via opacity
  // until the SVG swap has happened — no flash of the un-drawn name).
  document.documentElement.classList.add("hero-intro-ready");
  gsap.set(lines, { opacity: 0 });
  if (video) gsap.set(video, { opacity: 0, scale: 1.08 });
  if (eyebrow) gsap.set(eyebrow, { opacity: 0, y: 20 });
  if (meta) gsap.set(meta, { opacity: 0, y: 18 });
  if (cue) gsap.set(cue, { opacity: 0, y: 12 });

  // Glyph metrics need the display font — wait for it, then build + play.
  const ready =
    document.fonts && document.fonts.ready
      ? document.fonts.ready
      : Promise.resolve();

  let tl;
  ready.then(() => {
    const built = lines.map((line) => buildSignatureLine(line));
    // Each line starts fully "unwritten": its pen route is fully undrawn, so
    // the mask hides all the ink until the pen travels through the letters.
    built.forEach(({ pen }) => {
      // Small padding on the dash so no sliver can peek at either boundary.
      const len = pen.getTotalLength() + 4;
      gsap.set(pen, { strokeDasharray: len, strokeDashoffset: len });
    });
    gsap.set(lines, { opacity: 1 });

    tl = gsap.timeline({ delay: 0.15 });

    // 1 · Video fades up from black + eases from a slight zoom.
    if (video) {
      tl.to(video, { opacity: 1, scale: 1, duration: 1.6, ease: "power2.out" }, 0);
    }
    // 2 · Award eyebrow rises in.
    if (eyebrow) {
      tl.to(eyebrow, { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" }, 0.35);
    }
    // 3 · THE NAME is WRITTEN by a HAND HOLDING A PEN — the hand enters from
    //     off-screen, the nib rides the route while the ink appears behind
    //     it, it moves to the second line, signs it, and FLIPS THE PEN AWAY.
    const hand = createWritingHand();
    const handScale = () => {
      const rect = built[0].svg.getBoundingClientRect();
      // Art is 340px tall; make hand+pen ≈ 1.5× the height of the word.
      return Math.max(0.45, (rect.height * 1.5) / 340);
    };
    const placeHand = (svg, path, ratio, wobble = 0) => {
      const p = penPointAt(svg, path, ratio);
      gsap.set(hand.el, {
        x: p.x,
        y: p.y,
        rotation: wobble,
        scale: handScale(),
        transformOrigin: "0px 0px",
      });
    };

    let at = 0.6;
    // The hand ENTERS: sweeps in from off-screen bottom-right to the "O".
    const enter = { t: 0 };
    tl.to(
      enter,
      {
        t: 1,
        duration: 0.9,
        ease: "power3.out",
        onUpdate() {
          const to = penPointAt(built[0].svg, built[0].pen, 0);
          const fromX = window.innerWidth + 260;
          const fromY = window.innerHeight * 0.95;
          const t = enter.t;
          gsap.set(hand.el, {
            x: fromX + (to.x - fromX) * t,
            y: fromY + (to.y - fromY) * t,
            rotation: (1 - t) * 10,
            scale: handScale(),
            transformOrigin: "0px 0px",
          });
        },
      },
      at - 0.9
    );

    built.forEach(({ svg, pen }, i) => {
      // Writing pace scales with the word length. Deliberate, ceremonial —
      // a signature is signed, not scribbled.
      const chars = lines[i].textContent.length;
      const dur = Math.max(1.3, chars * 0.34);
      tl.to(
        pen,
        {
          strokeDashoffset: 0,
          duration: dur,
          ease: "power1.inOut",
          onUpdate() {
            // A whisper of wobble so the hand feels alive, not mechanical.
            placeHand(svg, pen, this.ratio, Math.sin(this.ratio * 34) * 1.3);
          },
        },
        at
      );
      at += dur;

      // Move to the next line: the hand lifts in a small arc between words.
      const next = built[i + 1];
      if (next) {
        const hop = { t: 0 };
        tl.to(
          hop,
          {
            t: 1,
            duration: 0.5,
            ease: "power1.inOut",
            onUpdate() {
              const from = penPointAt(svg, pen, 1);
              const to = penPointAt(next.svg, next.pen, 0);
              const t = hop.t;
              const lift = Math.sin(t * Math.PI) * 90; // the hand lifts
              gsap.set(hand.el, {
                x: from.x + (to.x - from.x) * t,
                y: from.y + (to.y - from.y) * t - lift,
                rotation: 0,
                scale: handScale(),
                transformOrigin: "0px 0px",
              });
            },
          },
          at
        );
        at += 0.5;
      }
    });

    // …then FLIP THE PEN AWAY: the pen leaves the hand spinning up-right,
    // while the hand withdraws off the bottom-right.
    tl.to(
      hand.penG,
      {
        x: 380,
        y: -560,
        rotation: 660,
        opacity: 0,
        transformOrigin: "0px 0px",
        duration: 0.75,
        ease: "power2.in",
      },
      at + 0.05
    );
    tl.to(
      hand.el,
      {
        x: "+=" + window.innerWidth * 0.4,
        y: "+=" + window.innerHeight * 0.55,
        rotation: 14,
        opacity: 0,
        duration: 0.8,
        ease: "power2.in",
        onComplete: () => hand.el.remove(),
      },
      at + 0.2
    );

    // 4 · Roles + Enter cue settle in after the name lands.
    if (meta) {
      tl.to(meta, { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" }, at + 0.35);
    }
    if (cue) {
      tl.to(cue, { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" }, at + 0.55);
    }
  });

  return () => tl && tl.kill();
}
