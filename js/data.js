/* ============================================================================
   data.js — Olamide Sax V2 · the living-archive data model (ES module)
   Single source of truth for the scalable archive pages (Media / Gallery /
   Videos / Press). This is the REAL-CONTENT pass: photos, clips, press and
   performances are populated from processed assets and the content manifest.

   Contract (consumed by gallery.js / videos.js and the archive pages):
     photos[]        — { id, category, src, alt, caption, meta, video?, tag?, featured?, placeholder }
     videos[]        — { id, category, youtubeId, channelUrl, title, thumb, alt, meta, date, placeholder }
     clips[]         — { id, src, poster, alt, label }  (local silent loop clips)
     press[]         — { id, source, title, url, excerpt, date, tier }
     performances[]  — { year, events: [{ id, title, venue, role?, date, note? }] }

   Categories are stable string enums so filter chips / tabs can key off them:
     PHOTO CATEGORIES : "PHOTOS" | "BTS" | "EVENTS"
     VIDEO CATEGORIES : "LIVE"   | "INTERVIEW" | "MUSIC"

   NOTE: `photos[].video` stays null here — the gallery cells remain image-only
   for this pass. The three local silent loops live in `clips` and are wired
   directly into the Home hero + Craft movements (video-first, poster fallback,
   reduced-motion → poster only).
   ========================================================================== */

/* Real gallery images live under assets/images/gallery/. */
const GALLERY = "assets/images/gallery/";

/* ============================================================================
   PHOTO CATEGORY LABELS — display strings for chips / captions.
   ========================================================================== */
export const PHOTO_CATEGORIES = [
  { key: "ALL", label: "All" },
  { key: "PHOTOS", label: "Photos" },
  { key: "BTS", label: "Behind the Scenes" },
  { key: "EVENTS", label: "Events" },
];

export const VIDEO_CATEGORIES = [
  { key: "ALL", label: "All" },
  { key: "LIVE", label: "Live" },
  { key: "INTERVIEW", label: "Interviews" },
  { key: "MUSIC", label: "Music Videos" },
];

/* ============================================================================
   GALLERY PHOTOS — 28 REAL optimized photographs mapped to categories per the
   content manifest. Hero-grade frames are marked `featured:true`. `video` is
   reserved (null) — cells are image-only this pass.
     PHOTOS  — portraits, saxophone studies, instrument detail
     EVENTS  — live/stage: festivals, SBC procession, Sheffield, fashion show
     BTS     — participatory: drumming circles, workshops, dance
   Stable ids: g-01 … g-28.
   ========================================================================== */
export const photos = [
  /* ── Hero-grade / PHOTOS ─────────────────────────────────────────────── */
  { id: "g-01", category: "PHOTOS", src: GALLERY + "sax-bw-01.jpg",        alt: "Black-and-white portrait of Olamide Sax mid-performance on saxophone.",                caption: "The breath between notes",       meta: "Portrait · B&W",        tag: "Portrait",                         featured: true,  video: null },
  { id: "g-02", category: "PHOTOS", src: GALLERY + "portrait-sbc-01.jpg",  alt: "Portrait of Olamide Sax against the Stand & Be Counted Theatre blue backdrop.",       caption: "Held against the blue",          meta: "Portrait · SBC",        tag: "Stand & Be Counted Theatre",       featured: true,  video: null },
  { id: "g-03", category: "PHOTOS", src: GALLERY + "sax-motion-01.jpg",    alt: "Olamide Sax caught mid-motion, leaning into a saxophone phrase.",                      caption: "A held note, in motion",         meta: "Live · Saxophone",      tag: "Live",                             featured: true,  video: null },
  { id: "g-04", category: "PHOTOS", src: GALLERY + "sax-detail-01.jpg",    alt: "Macro detail of Olamide Sax's saxophone keys and bell.",                               caption: "The instrument, up close",       meta: "Detail · Instrument",   tag: "Detail",                           featured: false, video: null },

  /* ── EVENTS — live / stage ───────────────────────────────────────────── */
  { id: "g-05", category: "EVENTS", src: GALLERY + "festival-01.jpg",      alt: "Olamide Sax performing high-energy saxophone at Sharrow Festival.",                    caption: "Sharrow, in full cry",           meta: "Sharrow Festival · Live", tag: "Sharrow Festival",               featured: true,  video: null },
  { id: "g-06", category: "EVENTS", src: GALLERY + "festival-close-01.jpg",alt: "Close-up of Olamide Sax mid-solo at Sharrow Festival.",                                caption: "Eyes closed, full breath",       meta: "Sharrow Festival · Live", tag: "Sharrow Festival",               featured: true,  video: null },
  { id: "g-07", category: "EVENTS", src: GALLERY + "sbc-stage-01.jpg",     alt: "Olamide Sax on the Stand & Be Counted red-backdrop stage during the procession.",     caption: "The record-breaking procession", meta: "Stand & Be Counted · Stage", tag: "Stand & Be Counted Theatre",  featured: true,  video: null },
  { id: "g-08", category: "EVENTS", src: GALLERY + "festival-02.jpg",      alt: "Olamide Sax performing with the Sound Café Afrobeat ensemble at Sharrow Festival.",    caption: "With the Afrobeat ensemble",     meta: "Sharrow Festival · Live", tag: "Sharrow Festival",               featured: false, video: null },
  { id: "g-09", category: "EVENTS", src: GALLERY + "sbc-stage-02.jpg",     alt: "Olamide Sax on stage during the Stand & Be Counted Theatre procession.",               caption: "Leading the celebration",        meta: "Stand & Be Counted · Stage", tag: "Stand & Be Counted Theatre",  featured: false, video: null },
  { id: "g-10", category: "EVENTS", src: GALLERY + "sbc-stage-03.jpg",     alt: "Olamide Sax performing saxophone at the Stand & Be Counted event.",                    caption: "Music for thousands",            meta: "Stand & Be Counted · Stage", tag: "Stand & Be Counted Theatre",  featured: false, video: null },
  { id: "g-11", category: "EVENTS", src: GALLERY + "sbc-stage-04.jpg",     alt: "Olamide Sax on the Stand & Be Counted stage under warm light.",                        caption: "Community, in procession",       meta: "Stand & Be Counted · Stage", tag: "Stand & Be Counted Theatre",  featured: false, video: null },
  { id: "g-12", category: "EVENTS", src: GALLERY + "sbc-stage-05.jpg",     alt: "Olamide Sax mid-performance at the Stand & Be Counted procession.",                    caption: "The horn carries the crowd",     meta: "Stand & Be Counted · Stage", tag: "Stand & Be Counted Theatre",  featured: false, video: null },
  { id: "g-13", category: "EVENTS", src: GALLERY + "sbc-outdoor-01.jpg",   alt: "Olamide Sax performing outdoors during the Stand & Be Counted procession.",           caption: "Out into the street",            meta: "Stand & Be Counted · Outdoor", tag: "Stand & Be Counted Theatre", featured: false, video: null },
  { id: "g-14", category: "EVENTS", src: GALLERY + "fashion-01.jpg",       alt: "Olamide Sax playing live saxophone at the Eco Art Fashion Show.",                      caption: "Live sax on the runway",         meta: "Eco Art Fashion Show · Live", tag: "Eco Art Fashion Show",        featured: false, video: null },
  { id: "g-15", category: "EVENTS", src: GALLERY + "sax-hall-01.jpg",      alt: "Olamide Sax performing saxophone in a hall before a seated audience.",                 caption: "The hall, held",                 meta: "Live · Hall",           tag: "Live",                             featured: false, video: null },
  { id: "g-16", category: "EVENTS", src: GALLERY + "sax-hall-02.jpg",      alt: "Olamide Sax mid-set in a concert hall.",                                              caption: "A room in listening",            meta: "Live · Hall",           tag: "Live",                             featured: false, video: null },
  { id: "g-17", category: "EVENTS", src: GALLERY + "sax-mic-01.jpg",       alt: "Olamide Sax at the microphone, saxophone in hand, on stage.",                          caption: "Voice and horn together",        meta: "Live · Stage",          tag: "Live",                             featured: false, video: null },
  { id: "g-18", category: "EVENTS", src: GALLERY + "sax-market-01.jpg",    alt: "Olamide Sax performing saxophone at an outdoor market event.",                         caption: "Music in the market",            meta: "Live · Outdoor",        tag: "Live",                             featured: false, video: null },
  { id: "g-19", category: "EVENTS", src: GALLERY + "sheffield-01.jpg",     alt: "Olamide Sax performing in Sheffield before civic dignitaries.",                        caption: "Spotlight, Sheffield",           meta: "Sheffield · Civic",     tag: "Sheffield",                        featured: false, video: null },
  { id: "g-20", category: "EVENTS", src: GALLERY + "sheffield-02.jpg",     alt: "Olamide Sax on the Sheffield spotlight stage.",                                        caption: "Before the Lord Mayor",          meta: "Sheffield · Civic",     tag: "Sheffield",                        featured: false, video: null },

  /* ── BTS — participatory / workshops / drumming circles / dance ──────── */
  { id: "g-21", category: "BTS",    src: GALLERY + "circle-01.jpg",        alt: "A community drumming circle led by Olamide Sax.",                                      caption: "The circle gathers",             meta: "Participatory · Circle", tag: "Participatory",                   featured: false, video: null },
  { id: "g-22", category: "BTS",    src: GALLERY + "circle-02.jpg",        alt: "Participants drumming together in a workshop circle.",                                 caption: "Everyone keeps time",            meta: "Participatory · Circle", tag: "Participatory",                   featured: false, video: null },
  { id: "g-23", category: "BTS",    src: GALLERY + "circle-03.jpg",        alt: "A drumming circle in full flow during a community workshop.",                          caption: "Rhythm, shared",                 meta: "Participatory · Circle", tag: "Participatory",                   featured: false, video: null },
  { id: "g-24", category: "BTS",    src: GALLERY + "circle-04.jpg",        alt: "Hands and drums in a participatory drumming circle.",                                  caption: "Hands on the skin",              meta: "Participatory · Circle", tag: "Participatory",                   featured: false, video: null },
  { id: "g-25", category: "BTS",    src: GALLERY + "workshop-01.jpg",      alt: "Olamide Sax facilitating a music and wellbeing workshop.",                             caption: "The workshop room",              meta: "Participatory · Workshop", tag: "Participatory",                 featured: false, video: null },
  { id: "g-26", category: "BTS",    src: GALLERY + "drums-stage-01.jpg",   alt: "Traditional drums set up on stage before a performance.",                              caption: "Drums, before the set",          meta: "Behind the scenes",     tag: "Participatory",                    featured: false, video: null },
  { id: "g-27", category: "BTS",    src: GALLERY + "participatory-01.jpg", alt: "Audience members taking part in a participatory performance with Olamide Sax.",        caption: "Inviting people in",             meta: "Participatory",         tag: "Participatory",                    featured: false, video: null },
  { id: "g-28", category: "BTS",    src: GALLERY + "festival-dance-01.jpg",alt: "Festival-goers dancing during an Olamide Sax performance.",                            caption: "The room begins to move",        meta: "Participatory · Dance", tag: "Participatory",                    featured: false, video: null },
];

/* ============================================================================
   LOCAL CLIPS — the three processed silent loop videos (+ hero loop). Muted,
   autoplay, looping, poster fallback. Wired directly into Home (hero + Craft).
   Under prefers-reduced-motion the consuming markup shows the poster only.
   ========================================================================== */
export const clips = [
  { id: "clip-hero",          src: "assets/videos/hero-loop.mp4",          poster: "assets/videos/hero-poster.jpg",          alt: "Ambient loop of Olamide Sax performing on saxophone.",                    label: "Hero" },
  { id: "clip-saxophone",     src: "assets/videos/clip-saxophone.mp4",     poster: "assets/videos/clip-saxophone-poster.jpg",     alt: "Short silent loop of Olamide Sax playing saxophone.",                 label: "Saxophone" },
  { id: "clip-festival",      src: "assets/videos/clip-festival.mp4",      poster: "assets/videos/clip-festival-poster.jpg",      alt: "Short silent loop of a high-energy festival performance.",            label: "Festival" },
  { id: "clip-participatory", src: "assets/videos/clip-participatory.mp4", poster: "assets/videos/clip-participatory-poster.jpg", alt: "Short silent loop of a participatory drumming and dance moment.", label: "Participatory" },
];

/** Look a clip up by id (returns undefined if absent). */
export function clipById(id) {
  return clips.find((c) => c.id === id);
}

/* ============================================================================
   VIDEOS — FACADE cards seeded from Olamide's REAL performances. Specific
   YouTube video ids could NOT be scraped (consent-wall). Each card therefore
   carries `youtubeId: "TODO"` and links to the CHANNEL as the primary CTA;
   the poster (`thumb`) reuses a relevant real gallery photograph.
   TODO(youtube): replace each youtubeId "TODO" with the real 11-char id once
   Olamide supplies the specific video links (channel: @Olamidesax).
   ========================================================================== */
const CHANNEL_URL = "https://www.youtube.com/@Olamidesax";

export const videos = [
  { id: "v-01", category: "LIVE", youtubeId: "TODO", channelUrl: CHANNEL_URL, title: "World Record Football Scarf Procession — Stand & Be Counted Theatre", thumb: GALLERY + "sbc-stage-01.jpg",      alt: "Olamide Sax leading live saxophone during the record-breaking public procession.", meta: "Live", date: "Recent", placeholder: false },
  { id: "v-02", category: "LIVE", youtubeId: "TODO", channelUrl: CHANNEL_URL, title: "Eco Art Fashion Show — Live Afro-Fusion Saxophone",                    thumb: GALLERY + "fashion-01.jpg",        alt: "Olamide Sax playing live saxophone at the Eco Art Fashion Show.",                   meta: "Live", date: "Recent", placeholder: false },
  { id: "v-03", category: "LIVE", youtubeId: "TODO", channelUrl: CHANNEL_URL, title: "Sharrow Festival — Sound Café Afrobeat Ensemble",                      thumb: GALLERY + "festival-01.jpg",       alt: "Olamide Sax performing with the Sound Café Afrobeat ensemble at Sharrow Festival.", meta: "Live", date: "Recent", placeholder: false },
  { id: "v-04", category: "LIVE", youtubeId: "TODO", channelUrl: CHANNEL_URL, title: "Spotlight, Sheffield — Before the Lord Mayor",                         thumb: GALLERY + "sheffield-01.jpg",      alt: "Olamide Sax performing in Sheffield before the Lord Mayor.",                        meta: "Live", date: "Recent", placeholder: false },
  { id: "v-05", category: "LIVE", youtubeId: "TODO", channelUrl: CHANNEL_URL, title: "Open Mic Night — Utopia Theatre",                                     thumb: GALLERY + "sax-mic-01.jpg",        alt: "Olamide Sax at an intimate open-mic set, saxophone and microphone.",                meta: "Live", date: "1 Mar 2026", placeholder: false },
];

/* ============================================================================
   PRESS / RECOGNITION — the AWARD (real, dated) followed by the 3 REAL
   published articles, verbatim. URLs are the real, verified article URLs.
   Tiers: "award" | "feature" | "standard".
   ========================================================================== */
export const press = [
  {
    id: "p-award",
    source: "Eko Heritage Awards",
    title: "Best Instrumentalist of the Year",
    url: "#",
    excerpt:
      "Winner — Eko Heritage Awards 2026 · Best Instrumentalist of the Year. Recognition for a decade of Afro-fusion performance across the UK's stages, festivals and cultural events.",
    date: "2026",
    tier: "award",
    note: "Winner — Eko Heritage Awards 2026",
  },
  {
    id: "p-01",
    source: "New Telegraph",
    title: "Olamide Sax Commands Spotlight Stage in Sheffield, Delivers Stirring Performance Before Lord Mayor",
    url: "https://newtelegraphng.com/olamide-sax-ignites-the-stage-with-stirring-performance-in-sheffield/",
    excerpt:
      "A stirring Afro-fusion performance in Sheffield saw Olamide Sax command the spotlight stage before the Lord Mayor — a moment that underlined his growing presence on the UK's civic and cultural circuit.",
    date: "2024",
    tier: "feature",
  },
  {
    id: "p-02",
    source: "New Telegraph",
    title: "Olamide Sax Delivers Afro-Fusion Performance At Black And Minority Ethnic United Doncaster Event",
    url: "https://newtelegraphng.com/olamide-sax-delivers-afro-fusion-performance-at-black-and-minority-ethnic-united-doncaster-event/",
    excerpt:
      "At the Black and Minority Ethnic United Doncaster event, Olamide Sax delivered an Afro-fusion performance blending saxophone, voice and the rhythm of home for an audience of community and civic leaders.",
    date: "2024",
    tier: "standard",
  },
  {
    id: "p-03",
    source: "The Nation",
    title: "Olamide Sax Thrills Guests at Open Mic",
    url: "https://thenationonlineng.net/olamide-sax-thrills-guests-at-open-mic/",
    excerpt:
      "Olamide Sax thrilled guests at an open mic night, turning an intimate room into a stage with an improvisational set that moved between saxophone, keys and vocals.",
    date: "2026",
    tier: "standard",
  },
];

/* Optional notable mentions — lighter than a full press entry (name + note). */
export const pressMentions = [
  { id: "m-01", source: "Utopia Theatre", note: "Open mic night, 1 March 2026 — featured performer." },
  { id: "m-02", source: "darts × Maya Productions", note: "Traineeship in participatory arts." },
  { id: "m-03", source: "ArtBomb UK", note: "Collaborative participatory performance." },
];

/* ============================================================================
   PERFORMANCES — REAL recent highlights + salvaged events. Grouped by year
   ONLY where the manifest gives a real date (2026). Undated highlights sit
   under a "Recent Highlights" era label — no fabricated years.
   Stable ids: e-<era>-nn.
   ========================================================================== */
export const performances = [
  {
    year: "Recent Highlights",
    events: [
      { id: "e-rec-01", title: "World Record Football Scarf Procession", venue: "Stand & Be Counted Theatre", role: null, date: "Recent", note: "Leading live saxophone during the record-breaking public procession — thousands brought together through music, celebration and community participation." },
      { id: "e-rec-02", title: "Eco Art Fashion Show", venue: "Multidisciplinary collaboration", role: null, date: "Recent", note: "Live Afro-fusion saxophone woven through sustainable fashion, visual arts and audience interaction." },
      { id: "e-rec-03", title: "Sharrow Festival", venue: "Sound Café Afrobeat ensemble", role: null, date: "Recent", note: "A featured member of Sound Café's Afrobeat ensemble — high-energy sets, a shared celebration of rhythm, dance and cultural exchange." },
      { id: "e-rec-04", title: "ÀTÙPÀ", venue: "CAST", role: "Adigun", date: "Recent", note: "Opening saxophone; performing the role of Adigun." },
      { id: "e-rec-05", title: "BME United Doncaster", venue: "Doncaster", role: null, date: "Recent", note: "Afro-fusion performance for community and civic leaders during Black History Month." },
      { id: "e-rec-06", title: "Spotlight, Sheffield", venue: "Sheffield", role: null, date: "Recent", note: "A stirring performance before the Lord Mayor of Sheffield." },
    ],
  },
  {
    year: "2026",
    events: [
      { id: "e-2026-01", title: "Best Instrumentalist of the Year", venue: "Eko Heritage Awards", role: null, date: "2026", note: "Winner — Eko Heritage Awards 2026." },
      { id: "e-2026-02", title: "Open Mic Night", venue: "Utopia Theatre", role: null, date: "1 Mar 2026", note: "An intimate improvisational set — saxophone, keys and vocals." },
    ],
  },
];

/* ============================================================================
   Small helpers — pure, no DOM. Kept here so the archive pages share one
   filtering vocabulary rather than each re-implementing it.
   ========================================================================== */

/** Photos matching a category key ("ALL" returns everything). */
export function photosByCategory(key) {
  if (!key || key === "ALL") return photos.slice();
  return photos.filter((p) => p.category === key);
}

/** Videos matching a category key ("ALL" returns everything). */
export function videosByCategory(key) {
  if (!key || key === "ALL") return videos.slice();
  return videos.filter((v) => v.category === key);
}
