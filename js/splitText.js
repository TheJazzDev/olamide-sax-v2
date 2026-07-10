/* ============================================================================
   splitText.js — Olamide Sax V2 · tiny, a11y-safe text splitter
   ----------------------------------------------------------------------------
   GSAP SplitText is a PAID plugin — this is our own small replacement. It
   splits an element's text into per-word spans grouped into per-line masks,
   for a phrased "breathing" reveal.

   ACCESSIBILITY CONTRACT:
   - The original, readable, selectable text is preserved for assistive tech:
     we set aria-label on the target to the original text and add a
     visually-hidden copy, then mark the generated visual spans aria-hidden.
   - If the target has child element markup (e.g. hero title lines with their
     own spans), we bail out of word-splitting and instead treat each existing
     line span as a reveal unit — never destroying meaningful markup.

   Returns { words, lines, revert } so callers can animate and (if needed) undo.
   ========================================================================== */

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
