/* ============================================================================
   rootsReveal.js — Olamide Sax V3 · "The Roots" light interlude, animated
   ----------------------------------------------------------------------------
   · "2010 —" rolls up digit-by-digit out of masks (odometer clicking in).
   · The heritage photo develops (rising wipe + zoom settle) and keeps a
     gentle parallax drift while scrolling past (image rests pre-scaled so it
     can move inside its overflow-hidden frame).
   · Label, copy and link stagger in around the year.
   Page-guarded, reduced-motion + GSAP-absent safe: initial hidden states are
   set by GSAP only — CSS never hides content.
   ========================================================================== */

import { prefersReducedMotion } from "./utils.js";

export function initRootsReveal() {
  const section = document.querySelector(".roots");
  if (!section) return;
  if (prefersReducedMotion()) return;

  const gsap = window.gsap;
  const ScrollTrigger = window.ScrollTrigger;
  if (!gsap || !ScrollTrigger) return;
  gsap.registerPlugin(ScrollTrigger);

  const label = section.querySelector(".movement-index");
  const year = section.querySelector(".roots__year");
  const copy = section.querySelector(".roots__copy");
  const link = section.querySelector(".roots__link");
  const media = section.querySelector(".roots__media .frame-media");
  const img = media && media.querySelector("img");
  const caption = section.querySelector(".roots__media .exhibit-label");

  // Split "2010 —" into per-character masked spans so each can roll up
  // independently (spaces stay as plain text nodes).
  const digits = [];
  if (year) {
    const text = year.textContent;
    year.textContent = "";
    [...text].forEach((ch) => {
      if (!ch.trim()) {
        year.appendChild(document.createTextNode(ch));
        return;
      }
      const mask = document.createElement("span");
      mask.style.cssText =
        "display:inline-block;overflow:hidden;vertical-align:bottom;" +
        "padding-block:0.06em;margin-block:-0.06em;";
      const digit = document.createElement("span");
      digit.style.display = "inline-block";
      digit.textContent = ch;
      mask.appendChild(digit);
      year.appendChild(mask);
      digits.push(digit);
    });
  }

  const tl = gsap.timeline({
    defaults: { ease: "power3.out" },
    scrollTrigger: { trigger: section, start: "top 70%", once: true },
  });

  if (label) tl.from(label, { opacity: 0, x: -24, duration: 0.5 }, 0);
  if (digits.length) {
    tl.from(
      digits,
      { yPercent: 112, duration: 0.8, ease: "power4.out", stagger: 0.07 },
      0.1
    );
  }
  if (copy) tl.from(copy, { opacity: 0, y: 26, duration: 0.7 }, 0.45);
  if (link) tl.from(link, { opacity: 0, y: 16, duration: 0.5 }, 0.65);

  // ── The photo is DRAWN like an artist works, in three acts:
  //    1 · GUIDE — a hand-inked outline traces around the frame,
  //    2 · SKETCH — a grayscale underdrawing hatches in (thin diagonals),
  //    3 · PAINT — thick diagonal brush passes bring up the full colour,
  //        and the guide line fades away, its job done. ──
  const art = img && media ? buildDrawnImage(media, img) : null;
  if (art) {
    const prep = (path, i, alt) => {
      const len = path.getTotalLength();
      gsap.set(path, {
        strokeDasharray: len,
        strokeDashoffset: (alt && i % 2 ? -1 : 1) * len,
      });
    };
    art.border.forEach((p, i) => prep(p, i, false));
    art.hatch.forEach((p, i) => prep(p, i, true));
    art.paint.forEach((p, i) => prep(p, i, true));

    // 1 · the guide traces around the frame…
    tl.to(art.border, { strokeDashoffset: 0, duration: 0.55, ease: "power2.inOut" }, 0.1);
    // 2 · …the sketch hatches in fast…
    tl.to(
      art.hatch,
      { strokeDashoffset: 0, duration: 0.45, ease: "power1.inOut", stagger: 0.035 },
      0.4
    );
    // 3 · …the paint sweeps over it…
    tl.to(
      art.paint,
      { strokeDashoffset: 0, duration: 0.8, ease: "power2.inOut", stagger: 0.08 },
      0.95
    );
    // …and the guide line quietly leaves.
    tl.to(art.border, { opacity: 0, duration: 0.5, ease: "power1.out" }, 1.9);
  }
  if (caption) tl.from(caption, { opacity: 0, duration: 0.5 }, art ? 2.0 : 0.6);

  // Ongoing parallax while the photo passes through the viewport (the drawn
  // SVG replaces the img, so it drifts as one piece).
  const drift = media && media.querySelector(".roots__draw");
  if (drift) {
    gsap.fromTo(
      drift,
      { yPercent: -3 },
      {
        yPercent: 3,
        ease: "none",
        scrollTrigger: {
          trigger: media,
          start: "top bottom",
          end: "bottom top",
          scrub: true,
        },
      }
    );
  }
}

/* Replace the plain <img> with an inline SVG staging an artist's process:
   a grayscale SKETCH layer masked by thin diagonal hatch strokes, a full-
   colour PAINT layer masked by thick diagonal brush passes, and an inked
   GUIDE outline around the frame. All three stroke sets are returned to be
   dash-drawn by the timeline. Built only when motion is allowed, so no-JS /
   reduced-motion visitors keep the untouched <img>. */
function buildDrawnImage(media, img) {
  const NS = "http://www.w3.org/2000/svg";
  const W = 1200;
  const H = 1600; // matches the portrait's 3:4 frame
  const CX = W / 2;
  const CY = H / 2;
  const href = img.currentSrc || img.src;

  const svg = document.createElementNS(NS, "svg");
  svg.setAttribute("viewBox", `0 0 ${W} ${H}`);
  svg.setAttribute("preserveAspectRatio", "xMidYMid slice");
  svg.setAttribute("aria-hidden", "true");
  svg.classList.add("roots__draw");
  const defs = document.createElementNS(NS, "defs");
  svg.appendChild(defs);

  /* Build a mask of parallel wavy strokes, rotated to a hand angle. The rows
     overshoot the frame generously so full coverage survives the rotation. */
  const makeStrokeMask = (id, angle, spacing, width) => {
    const mask = document.createElementNS(NS, "mask");
    mask.setAttribute("id", id);
    const g = document.createElementNS(NS, "g");
    g.setAttribute("fill", "none");
    g.setAttribute("stroke", "#fff");
    g.setAttribute("stroke-linecap", "round");
    g.setAttribute("stroke-width", String(width));
    g.setAttribute("transform", `rotate(${angle} ${CX} ${CY})`);
    const paths = [];
    const AMP = 42;
    for (let y = -420; y <= H + 420; y += spacing) {
      const path = document.createElementNS(NS, "path");
      path.setAttribute(
        "d",
        `M ${-460} ${y} C ${W * 0.25} ${y - AMP}, ${W * 0.5} ${y + AMP}, ` +
          `${W * 0.75} ${y - AMP} S ${W + 460} ${y + AMP}, ${W + 460} ${y}`
      );
      g.appendChild(path);
      paths.push(path);
    }
    mask.appendChild(g);
    defs.appendChild(mask);
    return paths;
  };

  const addImage = (maskId, extraStyle) => {
    const image = document.createElementNS(NS, "image");
    image.setAttribute("href", href);
    image.setAttribute("width", String(W));
    image.setAttribute("height", String(H));
    image.setAttribute("preserveAspectRatio", "xMidYMid slice");
    image.setAttribute("mask", `url(#${maskId})`);
    if (extraStyle) image.setAttribute("style", extraStyle);
    svg.appendChild(image);
  };

  // SKETCH: thin, tighter hatch at one angle — grayscale underdrawing.
  const hatch = makeStrokeMask("roots-sketch-mask", 24, 130, 72);
  addImage(
    "roots-sketch-mask",
    "filter: grayscale(1) contrast(0.82) brightness(1.14);"
  );
  // PAINT: thick brush passes at the opposing angle — the full colour.
  const paint = makeStrokeMask("roots-paint-mask", -16, 185, 240);
  addImage("roots-paint-mask", "");

  // GUIDE: the inked outline the artist "boxes the composition" with.
  const borderPath = document.createElementNS(NS, "path");
  const inset = 26;
  borderPath.setAttribute(
    "d",
    `M ${inset} ${inset} H ${W - inset} V ${H - inset} H ${inset} Z`
  );
  borderPath.setAttribute("fill", "none");
  borderPath.setAttribute("stroke", "#0B0A08");
  borderPath.setAttribute("stroke-width", "5");
  svg.appendChild(borderPath);

  media.appendChild(svg);
  img.style.display = "none"; // the SVG is the presentation now
  return { border: [borderPath], hatch, paint };
}
