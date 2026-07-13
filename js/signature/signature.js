/* ============================================================================
   signature.js — the name writes itself.
   ----------------------------------------------------------------------------
   Builds the signature SVG and returns a GSAP timeline that performs it.

   HOW IT WORKS — and why it is this simple
   ----------------------------------------
   The visible ink is the real Great Vibes outline (signatureGlyphs.js), so the
   finished wordmark is exactly the wordmark the site already uses. Each WORD
   sits behind a mask, and the mask is a rectangle whose right edge sweeps across
   the word. The pen's nib is placed AT that same edge. One number drives both,
   so ink can never appear ahead of the nib — they are the same value.

   An earlier attempt tried to recover a true pen "centreline" through each
   letter and ride the nib along it. That is a research problem for a
   high-contrast script face, it never converged, and — this is the part that
   matters — it was never what carried the illusion anyway. What the eye actually
   reads is: ink appearing under a moving nib, in the right order, with pauses
   and lifts where a hand would take them. A swept edge delivers all of that.

   The pen also rides the ink's own vertical profile: at each moment we sample
   how high the ink reaches at the sweep's x, and put the nib there. So the pen
   rises over ascenders and drops into descenders instead of gliding along a flat
   line — which is most of what sells "a hand is doing this".
   ========================================================================== */

import { LETTERS, VIEWBOX } from "./signatureGlyphs.js";
import { createPen } from "./signaturePen.js";

const NS = "http://www.w3.org/2000/svg";
let uid = 0;

const el = (name, attrs = {}) => {
  const n = document.createElementNS(NS, name);
  for (const k in attrs) n.setAttribute(k, String(attrs[k]));
  return n;
};

export function initSignature(host, opts = {}) {
  const gsap = window.gsap;
  if (!gsap || !host) return null;

  const id = `sig-${uid++}`;
  const total = opts.duration || 6.4;
  /* STACKED: on a narrow screen one shared baseline is far too wide (the full
     name is ~4.4x its own height), so the words are set on two lines instead —
     the pen simply lifts DOWN-AND-LEFT to the second line rather than across.
     Same animation, different geometry. */
  const stacked = !!opts.stacked;
  const LINE_DROP = 780;      // baseline-to-baseline, font units
  const dy = (w) => (stacked && w === 1 ? LINE_DROP : 0);
  const dx = (w) => (stacked && w === 1 ? 260 : 0);   // indent the second line

  const svg = el("svg", {
    "aria-hidden": "true",
    viewBox: `${VIEWBOX.x} ${VIEWBOX.y} ${VIEWBOX.w} ${VIEWBOX.h}`,
    fill: "none",
  });
  svg.style.display = "block";
  svg.style.width = "100%";
  svg.style.height = "auto";
  svg.style.overflow = "visible";

  const defs = el("defs");
  svg.appendChild(defs);

  /* Two words → two masks. Everything inside a word is written in one connected
     breath; between the words the pen LIFTS. */
  const words = [[], []];
  LETTERS.forEach((L) => words[L.word].push(L));

  const built = words.map((letters, w) => {
    const mid = `${id}-w${w}`;
    /* A <mask> has its own REGION, and it clips anything outside it. The default
       region is -10%/-10%/120%/120% of the masked element's bounding box — which
       for a wordmark this wide and short silently guillotines the tops off the
       letters no matter how tall you make the rect inside. (That cost hours: the
       rect was always big enough; the REGION never was.) Pin the region to user
       space, generously, and the mask stops clipping and only reveals. */
    const mask = el("mask", {
      id: mid,
      maskUnits: "userSpaceOnUse",
      maskContentUnits: "userSpaceOnUse",
      x: VIEWBOX.x - 2000,
      y: VIEWBOX.y - 2000,
      width: VIEWBOX.w + 4000,
      height: VIEWBOX.h + 4000,
    });
    const wipe = el("rect", {
      x: VIEWBOX.x,
      y: VIEWBOX.y,
      width: 0,
      height: VIEWBOX.h,
      fill: "#fff",
    });
    mask.appendChild(wipe);
    defs.appendChild(mask);

    const ox = w === 1 ? dx(w) - (letters[0] ? letters[0].x : 0) : 0;
    const oy = dy(w);
    const g = el("g", { mask: `url(#${mid})` });
    letters.forEach((L) => {
      const lg = el("g", {
        transform: `translate(${L.x + ox},${oy}) scale(1,-1)`,
      });
      lg.appendChild(el("path", { d: L.d, fill: "currentColor" }));
      g.appendChild(lg);
      if (L.dot) {
        const dg = el("g", {
          transform: `translate(${L.x + L.dot.dx + ox},${oy}) scale(1,-1)`,
        });
        dg.appendChild(el("path", { d: L.dot.d, fill: "currentColor" }));
        g.appendChild(dg);
      }
    });
    svg.appendChild(g);
    return { letters, mask, wipe, g };
  });

  const pen = createPen();
  const penWrap = el("g");
  penWrap.appendChild(pen.el);
  svg.appendChild(penWrap);
  host.appendChild(svg);

  /* Measure each word's real inked extent, then FIT THE FRAME TO THE INK.

     A glyph's ADVANCE is not how far its ink reaches — Great Vibes is a
     connected script whose letters overhang their advances considerably (the S's
     flourish climbs 18 units above where the metrics say the line should stop).
     Guessing a viewBox from the metrics therefore slices the tops off the
     letters. So: measure what actually rendered, and size both the viewBox and
     the masks from that, with room to spare. */
  built.forEach((b) => {
    const bb = b.g.getBBox();
    b.x0 = bb.x - 20;
    b.x1 = bb.x + bb.width + 20;
    b.top = bb.y;
    b.bottom = bb.y + bb.height;
  });

  const PAD = 40;
  const inkX0 = Math.min(...built.map((b) => b.x0)) - PAD;
  const inkX1 = Math.max(...built.map((b) => b.x1)) + PAD;
  const inkY0 = Math.min(...built.map((b) => b.top)) - PAD;
  const inkY1 = Math.max(...built.map((b) => b.bottom)) + PAD;
  const frame = {
    x: inkX0,
    y: inkY0,
    w: inkX1 - inkX0,
    h: inkY1 - inkY0,
  };
  svg.setAttribute("viewBox", `${frame.x} ${frame.y} ${frame.w} ${frame.h}`);

  built.forEach((b) => {
    // the mask REGION must cover the ink generously (see the note where it is
    // created) — re-pin it now that we know the real frame
    b.mask.setAttribute("x", String(frame.x - 2000));
    b.mask.setAttribute("y", String(frame.y - 2000));
    b.mask.setAttribute("width", String(frame.w + 4000));
    b.mask.setAttribute("height", String(frame.h + 4000));
    gsap.set(b.wipe, {
      attr: { x: b.x0, y: frame.y, height: frame.h, width: 0 },
    });
  });

  /* THE INK PROFILE — how high the ink reaches at a given x.
     We probe the rendered glyphs once, at build time, so at run time putting the
     nib on the ink is a table lookup. This is what makes the pen climb the l's
     ascender and dip into the y of a descender instead of sliding along a rule. */
  const STEPS = 220;
  built.forEach((b) => {
    const prof = new Array(STEPS);
    const paths = Array.from(b.g.querySelectorAll("path"));
    // sample each path's box; for each column keep the highest ink (min y in SVG)
    const boxes = paths.map((p) => {
      const bb = p.getBBox();
      const m = p.parentNode.transform.baseVal.consolidate();
      const t = m ? m.matrix : null;
      // the letter groups are translate(x) scale(1,-1)
      const tx = t ? t.e : 0;
      return {
        x0: tx + bb.x,
        x1: tx + bb.x + bb.width,
        // after scale(1,-1): svg y runs from -(y+h) to -y
        top: -(bb.y + bb.height),
        bot: -bb.y,
      };
    });
    for (let i = 0; i < STEPS; i++) {
      const x = b.x0 + ((b.x1 - b.x0) * i) / (STEPS - 1);
      let top = null;
      let bot = null;
      for (const bx of boxes) {
        if (x < bx.x0 || x > bx.x1) continue;
        if (top === null || bx.top < top) top = bx.top;
        if (bot === null || bx.bot > bot) bot = bx.bot;
      }
      // where the NIB sits: near the bottom of the ink column (a nib writes at
      // the foot of the stroke it is currently laying), with a little lift.
      prof[i] = bot === null ? 0 : bot - (bot - top) * 0.18;
    }
    // smooth the profile so the pen glides rather than jitters between letters
    for (let pass = 0; pass < 6; pass++) {
      for (let i = 1; i < STEPS - 1; i++) {
        prof[i] = (prof[i - 1] + prof[i] * 2 + prof[i + 1]) / 4;
      }
    }
    b.prof = prof;
  });

  const inkY = (b, x) => {
    const f = ((x - b.x0) / (b.x1 - b.x0)) * (STEPS - 1);
    const i = Math.max(0, Math.min(STEPS - 2, Math.floor(f)));
    const g = f - i;
    return b.prof[i] + (b.prof[i + 1] - b.prof[i]) * g;
  };

  /* The pen art is ~560 units tall in its own space; the letters are ~700.
     Scale so the nib reads as a real instrument against the writing. */
  const place = (x, y, contact, rot = 0) => {
    gsap.set(penWrap, {
      x,
      y,
      rotation: rot,
      transformOrigin: "0px 0px",
    });
    pen.setContact(contact);
  };

  const tl = gsap.timeline({ paused: true });

  // the pen arrives from off-frame, low and to the right, as a right hand does
  const start = { x: frame.x + frame.w * 1.06, y: frame.y + frame.h * 1.15 };
  place(start.x, start.y, 0);

  const w0 = built[0];
  const w1 = built[1];

  // budget: entry · write "Olamide" · lift · write "Sax" · rest · exit
  const T_IN = total * 0.10;
  const T_W0 = total * 0.42;
  const T_LIFT = total * 0.10;
  const T_W1 = total * 0.26;
  const T_REST = total * 0.06;

  /* 1 · The hand enters and sets the nib down on the first letter. */
  const p0 = { x: w0.x0 + 10, y: inkY(w0, w0.x0 + 10) };
  const entry = { t: 0 };
  tl.to(entry, {
    t: 1,
    duration: T_IN,
    ease: "power3.out",
    onUpdate: () => {
      const t = entry.t;
      place(
        start.x + (p0.x - start.x) * t,
        start.y + (p0.y - start.y) * t,
        t * t,               // contact only lands right at the end
        (1 - t) * 8
      );
    },
  });

  /* 2 · "Olamide" is written. The wipe edge and the nib are ONE value. */
  const a = { t: 0 };
  tl.to(a, {
    t: 1,
    duration: T_W0,
    ease: "power1.inOut",
    onUpdate: () => {
      const x = w0.x0 + (w0.x1 - w0.x0) * a.t;
      gsap.set(w0.wipe, { attr: { width: x - w0.x0 } });
      // a whisper of wrist, so it is not a machine
      place(x, inkY(w0, x), 1, Math.sin(a.t * 26) * 1.8);
    },
  });

  /* 3 · THE LIFT. The pen rises, travels to the second word, and comes back
         down. Nothing is drawn. This pause is the piece breathing, and it is
         the beat that most says "a person is doing this". */
  const from = { x: w0.x1, y: inkY(w0, w0.x1) };
  const to = { x: w1.x0 + 10, y: inkY(w1, w1.x0 + 10) };
  const lift = { t: 0 };
  tl.to(lift, {
    t: 1,
    duration: T_LIFT,
    ease: "power2.inOut",
    onUpdate: () => {
      const t = lift.t;
      const arc = Math.sin(t * Math.PI);
      // One line: the pen hops OVER the gap. Two lines: it must carry down and
      // back to the left, so lift it clear rather than arcing further up.
      const rise = stacked ? 200 : 260;
      place(
        from.x + (to.x - from.x) * t,
        from.y + (to.y - from.y) * t - arc * rise,
        1 - arc,                       // contact releases and returns
        -arc * 7
      );
    },
  });

  /* 4 · "Sax" — a touch quicker; a hand signing off accelerates. */
  const b = { t: 0 };
  tl.to(b, {
    t: 1,
    duration: T_W1,
    ease: "power1.in",
    onUpdate: () => {
      const x = w1.x0 + (w1.x1 - w1.x0) * b.t;
      gsap.set(w1.wipe, { attr: { width: x - w1.x0 } });
      place(x, inkY(w1, x), 1, Math.sin(b.t * 26) * 1.8);
    },
  });

  /* 5 · A beat, then the hand withdraws and leaves the name standing. */
  tl.to({}, { duration: T_REST });
  tl.to(penWrap, {
    x: frame.x + frame.w * 1.1,
    y: frame.y + frame.h * 1.25,
    rotation: 12,
    opacity: 0,
    duration: total * 0.16,
    ease: "power2.in",
    onComplete: () => penWrap.remove(),
  });

  return {
    timeline: tl,
    svg,
    destroy() {
      tl.kill();
      svg.remove();
    },
  };
}
