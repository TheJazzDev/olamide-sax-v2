# Olamide Sax — Website (v3)

The cinematic website for **Olamide Sax** (Olamide Phillips Olaniyan) — an Afro-Fusion artist,
multi-instrumentalist, participatory artist and creative facilitator based in the UK. Winner,
Eko Heritage Awards 2026 — Best Instrumentalist of the Year.

Built with **HTML5, CSS3, vanilla JavaScript (ES modules), and GSAP** — no framework, no build
step. Fully static; deployable to any static host.

Creative direction: *"The Breath Between Notes"* (V2 concept) — restrained editorial luxury made
unmistakably musical, with a signature **Breath Line** interaction. See `docs/`.

## Run locally
```bash
python3 -m http.server 8000   # then open http://localhost:8000
```

## Structure
```
index · about · artistic-practice · media · gallery · press · timeline · contact   (8 pages, flat)
partials/   nav.html, footer.html
css/        reset · tokens · typography · layout · frame · components · home ·
            archive · timeline · pages · animations · motion · responsive
js/         main · navigation · gallery · videos · contact · tabs · reveal ·
            smoothScroll · cursor · breathLine · data · utils   (ES modules)
assets/     images/ (real photography) · images/gallery/ · videos/ (loops + posters) ·
            fonts/ (self-hosted woff2) · vendor/ (GSAP + plugins)
docs/       creative concept (v1 + v2), build spec, content manifest
```

## Content
- Media/press/gallery content lives in `js/data.js` (28 real photos, press, performances).
- **Pending:** specific YouTube video IDs — the Videos section links to the channel
  (https://www.youtube.com/@Olamidesax) with facade slots (`youtubeId: "TODO"`) ready to fill.
- Ambient videos (hero loop + Craft clips) are muted and degrade to poster under reduced motion.

## Accessibility & motion
Motion is progressive enhancement: with JS off / GSAP failed / reduced-motion on, all content is
visible — nothing is hidden. Split-text keeps real text in the a11y tree.
