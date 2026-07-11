/* ============================================================================
   videos.js — Olamide Sax V2 · video archive tabs + facade render (UI only)
   Renders YouTube FACADE cards from data.js and switches them with accessible
   category tabs. FACADE = thumbnail + play affordance + a data-yt hook; there
   is NO live iframe (Task 8 wires facade → iframe on activate). No GSAP.

   Contract: exports `initVideos()`. Page/section-guarded — no-ops if the
   videos container (`[data-videos]`) is absent.

   Markup it expects (built statically in media.html):
     [data-videos-tabs]   — tablist row (tabs are <button data-tab="KEY" role="tab">)
     [data-videos]        — the grid facade cards render into
     [data-videos-empty]  — the empty state
   ========================================================================== */

import { $, $$, on } from "./utils.js";
import { videos } from "./data.js";

/** Build one facade card for a video record. NO iframe — poster + play mark.
    Until real YouTube ids land (youtubeId === "TODO"), the facade is a link to
    the channel; when an id is present, it becomes a facade → iframe trigger. */
function cardMarkup(video) {
  const placeholderClass = video.placeholder ? " is-placeholder" : "";
  const pending = !video.youtubeId || video.youtubeId === "TODO";
  const channel = video.channelUrl || "https://www.youtube.com/@Olamidesax";

  const media = `
        <div class="frame-media">
          <img src="${video.thumb}" alt="${video.alt}" loading="lazy" decoding="async" />
        </div>
        <span class="video-facade__play" aria-hidden="true">
          <span class="video-facade__play-mark">
            <svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
          </span>
        </span>
        <span class="video-facade__label"><span>${video.meta}</span></span>`;

  // TODO(youtube): when video.youtubeId is a real id, this branch becomes the
  // facade → iframe trigger (Task 8). Until then it opens the channel.
  const facade = pending
    ? `<a class="video-card__facade video-facade${placeholderClass}"
           href="${channel}" target="_blank" rel="noopener noreferrer"
           aria-label="Watch on YouTube: ${video.title} (opens the channel — specific link coming soon)">${media}
      </a>`
    : `<div class="video-card__facade video-facade${placeholderClass}"
           role="button" tabindex="0"
           data-yt="${video.youtubeId}"
           aria-label="Play video: ${video.title} (opens embedded player)">${media}
      </div>`;

  return `
    <article class="video-card" id="${video.id}" data-category="${video.category}" data-id="${video.id}">
      ${facade}
      <div class="video-card__foot">
        <h3 class="video-card__title">${video.title}</h3>
        <p class="video-card__meta">${video.meta} · ${video.date}</p>
      </div>
    </article>`;
}

/* Deep links (e.g. /media.html#v-03 from the home Craft panels): once the
   grid has rendered, scroll the addressed card into view and pulse it so
   the visitor sees WHICH performance they were sent to. */
function scrollToHashCard(grid) {
  const id = decodeURIComponent(window.location.hash.slice(1));
  if (!id) return;
  const card = id && grid.querySelector(`[data-id="${CSS.escape(id)}"]`);
  if (!card) return;
  requestAnimationFrame(() => {
    card.scrollIntoView({ behavior: "smooth", block: "center" });
    card.classList.add("is-linked");
    setTimeout(() => card.classList.remove("is-linked"), 2600);
  });
}

export function initVideos() {
  const grid = $("[data-videos]");
  const tabsRow = $("[data-videos-tabs]");
  if (!grid) return;

  const empty = $("[data-videos-empty]");
  const tabs = tabsRow ? $$("[data-tab]", tabsRow) : [];

  let active = "ALL";

  function render(categoryKey) {
    const list =
      categoryKey === "ALL"
        ? videos
        : videos.filter((v) => v.category === categoryKey);

    grid.innerHTML = list.map(cardMarkup).join("");

    const isEmpty = list.length === 0;
    if (empty) empty.hidden = !isEmpty;
    grid.hidden = isEmpty;
  }

  function setActive(categoryKey) {
    active = categoryKey;
    tabs.forEach((tab) => {
      const on = tab.dataset.tab === categoryKey;
      tab.setAttribute("aria-selected", on ? "true" : "false");
      tab.setAttribute("tabindex", on ? "0" : "-1");
      tab.classList.toggle("is-active", on);
    });
    render(categoryKey);
  }

  tabs.forEach((tab, i) => {
    on(tab, "click", () => setActive(tab.dataset.tab));

    // Roving-tabindex keyboard support for the tablist (Left/Right/Home/End).
    on(tab, "keydown", (event) => {
      let next = -1;
      if (event.key === "ArrowRight" || event.key === "ArrowDown") next = (i + 1) % tabs.length;
      else if (event.key === "ArrowLeft" || event.key === "ArrowUp") next = (i - 1 + tabs.length) % tabs.length;
      else if (event.key === "Home") next = 0;
      else if (event.key === "End") next = tabs.length - 1;
      if (next < 0) return;
      event.preventDefault();
      const target = tabs[next];
      setActive(target.dataset.tab);
      target.focus();
    });
  });

  setActive(active);

  // Honour deep links from the home Craft panels — AFTER the first render.
  scrollToHashCard(grid);
}
