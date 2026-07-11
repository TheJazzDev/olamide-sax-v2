/* ============================================================================
   aboutReveal.js — Olamide Sax V3 · the About page's motion pass
   ----------------------------------------------------------------------------
   · Masthead (on load): eyebrow slides in, the NAME rises out of a mask
     (same language as the home hero), lead fades up, and the portrait
     "develops" — a rising wipe while the print settles from a slight zoom.
   · Portrait keeps a gentle parallax drift while scrolling past (the image
     is pre-scaled so it can move inside its overflow-hidden frame).
   · Pull-quote: the words BRIGHTEN one by one as you scroll — read aloud.
   · Movements: each biography beat staggers in (head from the left, then
     the paragraphs rise).
   · Invitation: a quiet centered rise.

   Page-guarded (no-ops off the About page), reduced-motion + GSAP-absent
   safe: initial hidden states are set by GSAP only — CSS never hides text.
   ========================================================================== */

import { $, $$, prefersReducedMotion } from "./utils.js";

/* Split ONLY the direct text nodes of an element into word spans, leaving
   child elements (the decorative quote marks) untouched. Opacity-only
   animation, so no layout-changing wrappers are needed. */
function splitWords(el) {
  const words = [];
  [...el.childNodes].forEach((node) => {
    if (node.nodeType !== Node.TEXT_NODE || !node.textContent.trim()) return;
    const frag = document.createDocumentFragment();
    node.textContent.split(/(\s+)/).forEach((part) => {
      if (!part) return;
      if (/^\s+$/.test(part)) {
        frag.appendChild(document.createTextNode(part));
      } else {
        const w = document.createElement("span");
        w.textContent = part;
        frag.appendChild(w);
        words.push(w);
      }
    });
    el.replaceChild(frag, node);
  });
  return words;
}

export function initAboutReveal() {
  const masthead = $(".about-head__inner");
  if (!masthead) return; // not the About page
  if (prefersReducedMotion()) return;

  const gsap = window.gsap;
  const ScrollTrigger = window.ScrollTrigger;
  if (!gsap || !ScrollTrigger) return;
  gsap.registerPlugin(ScrollTrigger);

  /* ── 1 · Masthead entrance (on load) ──────────────────────────────────── */
  const eyebrow = $(".archive-head__eyebrow", masthead);
  const title = $("#about-title");
  const lead = $(".archive-head__lead", masthead);
  const portrait = $(".about-head__portrait");
  const portraitImg = portrait && portrait.querySelector("img");
  const caption = portrait && portrait.querySelector(".about-head__caption");

  // Mask-wipe the name: wrap its content in an overflow-hidden line.
  let titleLine = null;
  if (title) {
    const mask = document.createElement("span");
    mask.style.cssText =
      "display:block;overflow:hidden;padding-block:0.08em;margin-block:-0.08em;";
    const line = document.createElement("span");
    line.style.display = "block";
    while (title.firstChild) line.appendChild(title.firstChild);
    mask.appendChild(line);
    title.appendChild(mask);
    titleLine = line;
  }

  const intro = gsap.timeline({ defaults: { ease: "power3.out" } });
  if (eyebrow) intro.from(eyebrow, { opacity: 0, x: -24, duration: 0.6 }, 0.1);
  if (titleLine)
    intro.from(titleLine, { yPercent: 115, duration: 1.0, ease: "power4.out" }, 0.2);
  if (lead) intro.from(lead, { opacity: 0, y: 28, duration: 0.8 }, 0.55);
  if (portrait) {
    // The print develops: a rising wipe reveals it…
    intro.fromTo(
      portrait,
      { clipPath: "inset(100% 0 0 0)" },
      { clipPath: "inset(0% 0 0 0)", duration: 1.1, ease: "power4.out",
        clearProps: "clipPath" },
      0.35
    );
  }
  if (portraitImg) {
    // …while the image settles from a slight zoom. It RESTS at 1.12 so the
    // parallax below can drift it inside the frame without exposing edges.
    intro.fromTo(
      portraitImg,
      { scale: 1.24 },
      { scale: 1.12, duration: 1.4, ease: "power3.out" },
      0.35
    );
  }
  if (caption) intro.from(caption, { opacity: 0, duration: 0.6 }, 1.15);

  /* ── 2 · Portrait parallax while scrolling past ───────────────────────── */
  if (portraitImg && portrait) {
    gsap.fromTo(
      portraitImg,
      { yPercent: -4 },
      {
        yPercent: 4,
        ease: "none",
        scrollTrigger: {
          trigger: portrait,
          start: "top bottom",
          end: "bottom top",
          scrub: true,
        },
      }
    );
  }

  /* ── 3 · Pull-quote: words brighten as you read down ──────────────────── */
  const quote = $(".about-quote__text");
  if (quote) {
    const words = splitWords(quote);
    if (words.length) {
      gsap.fromTo(words,
        { opacity: 0.14 },
        {
          opacity: 1,
          stagger: 0.05,
          ease: "none",
          scrollTrigger: {
            trigger: quote,
            start: "top 80%",
            end: "top 32%",
            scrub: true,
          },
        }
      );
    }
    const by = $(".about-quote__by");
    if (by) {
      gsap.from(by, {
        opacity: 0,
        y: 14,
        duration: 0.6,
        ease: "power3.out",
        scrollTrigger: { trigger: quote, start: "top 45%", once: true },
      });
    }
  }

  /* ── 4 · The Movements: each biography beat staggers in ───────────────── */
  $$(".movement").forEach((movement) => {
    const head = movement.querySelector(".movement__head");
    const paras = [...movement.querySelectorAll(".movement__body p")];
    const tl = gsap.timeline({
      defaults: { ease: "power3.out" },
      scrollTrigger: { trigger: movement, start: "top 78%", once: true },
    });
    if (head) tl.from(head, { opacity: 0, x: -32, duration: 0.6 }, 0);
    if (paras.length)
      tl.from(paras, { opacity: 0, y: 26, duration: 0.7, stagger: 0.12 }, 0.15);
  });

  /* ── 5 · Invitation: a quiet centered rise ────────────────────────────── */
  const invite = $(".invitation__inner");
  if (invite) {
    gsap.from([...invite.children], {
      opacity: 0,
      y: 30,
      duration: 0.8,
      stagger: 0.12,
      ease: "power3.out",
      scrollTrigger: { trigger: invite, start: "top 80%", once: true },
    });
  }
}
