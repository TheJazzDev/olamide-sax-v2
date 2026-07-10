/* ============================================================================
   gallery.js — Olamide Sax V2 · gallery filter + render (UI logic only)
   Renders the scalable photo mosaic from data.js and filters it by category
   via accessible chips (aria-pressed, keyboard-operable). Images lazy-load
   (loading="lazy") so the grid stays performant at 100+ items. No GSAP.

   Contract: exports `initGallery()`. Page-guarded — no-ops if the gallery
   container (`[data-gallery]`) is absent, so main.js can call it on every page.

   Markup it expects (built statically in gallery.html):
     [data-gallery-filters]  — the chip row (chips are <button data-filter="KEY">)
     [data-gallery]          — the grid the cells are rendered into
     [data-gallery-empty]    — the empty state (hidden unless a filter is empty)
     [data-gallery-count]    — optional live count text
   Cells are VIDEO-FIRST: a poster image now, clip-ready (data-clip) for Task 8.
   ========================================================================== */

import { $, $$, on } from "./utils.js";
import { photos, PHOTO_CATEGORIES } from "./data.js";

/** Build one gallery cell (figure) for a photo record. */
function cellMarkup(photo) {
  const placeholderClass = photo.placeholder ? " is-placeholder" : "";
  const clipAttr = photo.video ? ` data-clip="${photo.video}"` : "";
  return `
    <figure class="gallery-cell" data-category="${photo.category}" data-id="${photo.id}">
      <div class="gallery-cell__media frame-media${placeholderClass}"${clipAttr}>
        <img src="${photo.src}" alt="${photo.alt}" loading="lazy" decoding="async" />
      </div>
      <figcaption class="gallery-cell__caption exhibit-label">
        <span class="exhibit-label__meta">${photo.meta}</span>
        <span class="exhibit-label__title">${photo.caption}</span>
      </figcaption>
    </figure>`;
}

export function initGallery() {
  const grid = $("[data-gallery]");
  const filters = $("[data-gallery-filters]");
  if (!grid) return;

  const empty = $("[data-gallery-empty]");
  const countEl = $("[data-gallery-count]");
  const chips = filters ? $$("[data-filter]", filters) : [];

  let active = "ALL";

  function render(categoryKey) {
    const list =
      categoryKey === "ALL"
        ? photos
        : photos.filter((p) => p.category === categoryKey);

    grid.innerHTML = list.map(cellMarkup).join("");

    // Empty state (defensive — a category could be emptied of real content).
    const isEmpty = list.length === 0;
    if (empty) empty.hidden = !isEmpty;
    grid.hidden = isEmpty;

    if (countEl) {
      const label =
        (PHOTO_CATEGORIES.find((c) => c.key === categoryKey) || {}).label || "All";
      countEl.textContent = `${list.length} ${list.length === 1 ? "frame" : "frames"} · ${label}`;
    }
  }

  function setActive(categoryKey) {
    active = categoryKey;
    chips.forEach((chip) => {
      const on = chip.dataset.filter === categoryKey;
      chip.setAttribute("aria-pressed", on ? "true" : "false");
      chip.classList.toggle("is-active", on);
    });
    render(categoryKey);
  }

  chips.forEach((chip) => {
    on(chip, "click", () => setActive(chip.dataset.filter));
  });

  // Initial paint.
  setActive(active);
}
