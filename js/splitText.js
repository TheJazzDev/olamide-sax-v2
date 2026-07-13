/* splitText.js — small a11y-safe text splitter (own replacement for GSAP's paid
   SplitText). Splits text into per-word spans in per-line masks. Preserves the
   readable text for AT (aria-label + visually-hidden copy; generated spans are
   aria-hidden). If the target already has child markup, it bails out of word-
   splitting and treats each existing line span as a unit. Returns {words,lines,revert}. */

/**
 * Split a heading/paragraph into aria-hidden word spans for kinetic reveal.
 * @param {HTMLElement} el
 * @returns {{ words: HTMLElement[], lines: HTMLElement[], revert: () => void }}
 */
export function splitToWords(el) {
  const original = el.textContent.replace(/\s+/g, " ").trim();

  // Preserve the readable text in the a11y tree.
  if (!el.hasAttribute("aria-label")) {
    el.setAttribute("aria-label", original);
  }

  const words = original.split(" ").filter(Boolean);
  const wordEls = [];

  // Build a single line-mask containing all words. Callers can group visually
  // via CSS; for our purposes one mask with word-level stagger reads musical.
  el.textContent = "";

  const line = document.createElement("span");
  line.className = "split-line";
  line.setAttribute("aria-hidden", "true");

  words.forEach((word, i) => {
    const w = document.createElement("span");
    w.className = "split-word";
    w.textContent = word;
    wordEls.push(w);
    line.appendChild(w);
    if (i < words.length - 1) {
      line.appendChild(document.createTextNode(" "));
    }
  });

  el.appendChild(line);

  function revert() {
    el.textContent = original;
    el.removeAttribute("aria-label");
  }

  return { words: wordEls, lines: [line], revert };
}

/**
 * Split each of an element's existing line spans into per-CHARACTER spans, so
 * the letters can be revealed one after another.
 *
 * The hero name is set in a connected script (Great Vibes), so the characters
 * must stay on the normal text flow — no inline-block per letter, which would
 * break the joins between letterforms. We therefore animate opacity/filter
 * only (never layout), and the letters keep kerning exactly as the browser set
 * them.
 *
 * A11y: the real text stays readable — we label the container and hide only the
 * generated spans from the a11y tree.
 *
 * @param {HTMLElement} el         the container (e.g. the <h1>)
 * @param {string} childSelector   the line spans inside it
 * @returns {{ chars: HTMLElement[], lines: HTMLElement[], revert: () => void }}
 */
export function splitByChars(el, childSelector) {
  const lines = Array.from(el.querySelectorAll(childSelector));
  const original = lines.map((l) => l.textContent);

  if (!el.hasAttribute("aria-label")) {
    el.setAttribute("aria-label", el.textContent.replace(/\s+/g, " ").trim());
  }

  const chars = [];
  lines.forEach((line) => {
    const text = line.textContent;
    line.textContent = "";
    line.setAttribute("aria-hidden", "true");
    for (const ch of text) {
      if (ch === " ") {
        line.appendChild(document.createTextNode(" "));
        continue;
      }
      const s = document.createElement("span");
      s.className = "split-char";
      s.textContent = ch;
      line.appendChild(s);
      chars.push(s);
    }
  });

  return {
    chars,
    lines,
    revert() {
      lines.forEach((l, i) => {
        l.textContent = original[i];
        l.removeAttribute("aria-hidden");
      });
      el.removeAttribute("aria-label");
    },
  };
}

/**
 * For elements built from existing line spans (e.g. the hero title with
 * .hero__title-line children) — reveal each existing line as a unit without
 * destroying markup. Keeps the real text intact; just tags the lines.
 * @param {HTMLElement} el
 * @param {string} childSelector
 * @returns {{ words: HTMLElement[], lines: HTMLElement[], revert: () => void }}
 */
export function splitByExistingLines(el, childSelector) {
  const lines = Array.from(el.querySelectorAll(childSelector));
  lines.forEach((l) => l.classList.add("split-word"));
  return {
    words: lines,
    lines,
    revert() {
      lines.forEach((l) => l.classList.remove("split-word"));
    },
  };
}
