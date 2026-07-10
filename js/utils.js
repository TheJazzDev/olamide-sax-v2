/* ============================================================================
   utils.js — Olamide Sax V2 · tiny shared DOM + environment helpers
   No dependencies. Every other module imports from here rather than
   re-implementing selectors/listeners/media-query checks.
   ========================================================================== */

/**
 * Query a single element.
 * @param {string} selector
 * @param {ParentNode} [scope]
 * @returns {Element|null}
 */
export function $(selector, scope = document) {
  return scope.querySelector(selector);
}

/**
 * Query all matching elements as a real array (not a live NodeList).
 * @param {string} selector
 * @param {ParentNode} [scope]
 * @returns {Element[]}
 */
export function $$(selector, scope = document) {
  return Array.from(scope.querySelectorAll(selector));
}

/**
 * Attach an event listener and return an unsubscribe function.
 * @param {EventTarget} target
 * @param {string} type
 * @param {EventListenerOrEventListenerObject} handler
 * @param {AddEventListenerOptions|boolean} [options]
 * @returns {() => void} off — call to remove the listener
 */
export function on(target, type, handler, options) {
  target.addEventListener(type, handler, options);
  return () => target.removeEventListener(type, handler, options);
}

/**
 * Whether the visitor has asked for reduced motion. Live-checked each call
 * (not cached) so callers can re-evaluate if the OS setting changes mid-session.
 * @returns {boolean}
 */
export function prefersReducedMotion() {
  return (
    typeof window !== "undefined" &&
    "matchMedia" in window &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}
