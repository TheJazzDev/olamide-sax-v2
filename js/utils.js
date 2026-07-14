/* ============================================================================
   utils.js — Olamide Sax V2 · tiny shared DOM + environment helpers
   No dependencies. Every other module imports from here rather than
   re-implementing selectors/listeners/media-query checks.
   ========================================================================== */

/* * Query a single element. */
export function $(selector, scope = document) {
  return scope.querySelector(selector);
}

/* * Query all matching elements as a real array (not a live NodeList). */
export function $$(selector, scope = document) {
  return Array.from(scope.querySelectorAll(selector));
}

/* * Attach an event listener and return an unsubscribe function. */
export function on(target, type, handler, options) {
  target.addEventListener(type, handler, options);
  return () => target.removeEventListener(type, handler, options);
}

/* * Whether the visitor has asked for reduced motion. */
export function prefersReducedMotion() {
  return (
    typeof window !== "undefined" &&
    "matchMedia" in window &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}
