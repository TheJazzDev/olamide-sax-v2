/* ============================================================================
   navigation.js — Olamide Sax V2 · nav toggle + full-screen menu overlay
   Pure UI logic (no GSAP/motion engine — that is Task 6+). Handles: open/close
   via the .nav-toggle trigger, Escape + link-click to close, body scroll lock,
   a focus trap while open, and returning focus to the toggle on close.

   Contract: exports `initNavigation()`. Safe to call once per page; no-ops
   quietly if the nav/overlay markup is missing so pages without a nav never
   throw.
   ========================================================================== */

import { $, $$, on } from "./utils.js";

const FOCUSABLE_SELECTOR = [
  "a[href]",
  "button:not([disabled])",
  "textarea:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  '[tabindex]:not([tabindex="-1"])',
].join(",");

/* * An element is really visible/focusable if it has at least one client rect. */
function isVisible(el) {
  return el.getClientRects().length > 0;
}

function getFocusable(container) {
  return $$(FOCUSABLE_SELECTOR, container).filter(isVisible);
}

/* * Set aria-current="page" on the menu link that matches the current URL, so the active. */
function markCurrentPage(overlay) {
  const norm = (p) => {
    p = p.replace(/\/index\.html$/, "/").replace(/\.html$/, "");
    if (p !== "/" && p.endsWith("/")) p = p.slice(0, -1);
    return p === "" ? "/" : p;
  };
  const here = norm(window.location.pathname);
  $$(".menu-overlay__link", overlay).forEach((link) => {
    const target = norm(new URL(link.href, window.location.origin).pathname);
    if (target === here) link.setAttribute("aria-current", "page");
    else link.removeAttribute("aria-current");
  });
}

export function initNavigation() {
  const toggle = $("#nav-toggle") || $(".nav-toggle:not(.nav-toggle--close)");
  const overlay = $("#menu-overlay") || $(".menu-overlay");
  const closeBtn = $("#nav-close") || $(".nav-toggle--close");

  if (!toggle || !overlay) return;

  // Mark the current page's menu link so it reads as "you are here".
  markCurrentPage(overlay);

  let isOpen = false;
  let lastFocused = null;
  const cleanups = [];

  function open() {
    if (isOpen) return;
    isOpen = true;
    lastFocused = document.activeElement;

    // Compensate for the scrollbar width BEFORE locking scroll, so hiding the scrollbar doesn't.
    const sbw = window.innerWidth - document.documentElement.clientWidth;
    if (sbw > 0) document.body.style.setProperty("--sbw", sbw + "px");

    overlay.setAttribute("data-open", "");
    toggle.setAttribute("aria-expanded", "true");
    document.body.classList.add("has-menu-open");

    // Move focus into the overlay — prefer the close button, then the first focusable element (e.g.
    const focusables = getFocusable(overlay);
    const target = closeBtn && isVisible(closeBtn) ? closeBtn : focusables[0];
    if (target) target.focus();
  }

  function close() {
    if (!isOpen) return;
    isOpen = false;

    overlay.removeAttribute("data-open");
    toggle.setAttribute("aria-expanded", "false");
    document.body.classList.remove("has-menu-open");
    document.body.style.removeProperty("--sbw");

    const returnTo = lastFocused && document.contains(lastFocused) ? lastFocused : toggle;
    returnTo.focus();
    lastFocused = null;
  }

  function toggleOpen() {
    if (isOpen) close();
    else open();
  }

  cleanups.push(on(toggle, "click", toggleOpen));
  if (closeBtn) cleanups.push(on(closeBtn, "click", close));

  // Close when any link inside the overlay is activated, or when the click lands on the.
  cleanups.push(
    on(overlay, "click", (event) => {
      if (event.target === overlay) {
        close();
        return;
      }
      const link = event.target.closest("a[href]");
      if (link) close();
    })
  );

  // Escape closes; Tab is trapped within the overlay while open.
  cleanups.push(
    on(document, "keydown", (event) => {
      if (!isOpen) return;

      if (event.key === "Escape") {
        event.preventDefault();
        close();
        return;
      }

      if (event.key === "Tab") {
        const focusables = getFocusable(overlay);
        if (focusables.length === 0) return;

        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        const active = document.activeElement;

        if (event.shiftKey && (active === first || !overlay.contains(active))) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && active === last) {
          event.preventDefault();
          first.focus();
        }
      }
    })
  );

  return () => cleanups.forEach((off) => off());
}
