/* data.js — single source of truth for the archive pages (Media/Gallery/Videos/
   Press), consumed by gallery.js / videos.js. Shapes:
     photos[]       — { id, category, src, alt, caption, meta, video?, tag?, featured?, placeholder }
     videos[]       — { id, category, youtubeId, channelUrl, title, thumb, alt, meta, date, placeholder }
     clips[]        — { id, src, poster, alt, label }
     press[]        — { id, source, title, url, excerpt, date, tier }
     pressMentions[]— { id, source, url?, note }
     performances[] — { year, events: [{ id, title, venue, role?, date, note? }] }
     teaching[]     — { id, role, org, location, period, subjects[], note }
     facilitation[] — { id, title, venue, role }
     affiliations[] — { id, role, org }
     theatreCredits[]— { id, work, role, venue }
   Categories: photos "PHOTOS"|"BTS"|"EVENTS", videos "LIVE"|"INTERVIEW"|"MUSIC". */

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
   PRESS / RECOGNITION — the AWARD (real, dated) followed by the REAL
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
    id: "p-bbc",
    source: "BBC",
    title: "Featured Saxophonist in the Guinness World Record Football Scarf Procession",
    url: "https://www.bbc.co.uk/news/articles/c0myr99njy3o",
    excerpt:
      "BBC coverage of the record-breaking 186-metre football scarf chain in Sheffield, where Olamide Sax led live saxophone through the Stand & Be Counted Theatre procession — a public celebration of belonging, migration and cultural identity.",
    date: "2026",
    tier: "feature",
  },
  {
    id: "p-guardian-atupa",
    source: "The Guardian",
    title: "Olamide Lights Up ÀTÙPÀ Stage Production with Multifaceted Performances",
    url: "https://guardian.ng/saturday-magazine/weekend-beats/olamide-lights-up-atupa-stage-production-with-multifaceted-performances/",
    excerpt:
      "An independent critical review by Michael Kolawole in The Guardian, highlighting Olamide Sax's performance in ÀTÙPÀ (The Spotlight) at CAST, Doncaster.",
    date: "2026",
    tier: "feature",
  },
  {
    id: "p-guardian-collective",
    source: "The Guardian",
    title: "Participation Before Performance: Olamide Sax at Collective Routes & Beyond",
    url: "https://guardian.ng/art/participation-before-performance-olamide-sax-at-collective-routes-beyond/",
    excerpt:
      "An independent critical review by Chinonso Ihekire in The Guardian on Olamide Sax's participatory practice at Collective Routes & Beyond, Danum Gallery, Library and Museum, Doncaster.",
    date: "2026",
    tier: "standard",
  },
  {
    id: "p-01",
    source: "New Telegraph",
    title: "Olamide Sax Commands Spotlight Stage in Sheffield, Delivers Stirring Performance Before Lord Mayor",
    url: "https://newtelegraphng.com/olamide-sax-ignites-the-stage-with-stirring-performance-in-sheffield/",
    excerpt:
      "A stirring Afro-fusion performance in Sheffield saw Olamide Sax command the spotlight stage before the Lord Mayor — a moment that underlined his growing presence on the UK's civic and cultural circuit.",
    date: "2026",
    tier: "feature",
  },
  {
    id: "p-02",
    source: "New Telegraph",
    title: "Olamide Sax Delivers Afro-Fusion Performance At Black And Minority Ethnic United Doncaster Event",
    url: "https://newtelegraphng.com/olamide-sax-delivers-afro-fusion-performance-at-black-and-minority-ethnic-united-doncaster-event/",
    excerpt:
      "At the Black and Minority Ethnic United Doncaster event, Olamide Sax delivered an Afro-fusion performance blending saxophone, voice and the rhythm of home for an audience of community and civic leaders.",
    date: "2026",
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
  {
    id: "p-star",
    source: "The Star",
    title: "Unforgettable Night as Sheffield Theatre Group Showcases Work",
    url: "https://www.thestar.co.uk/your-world/unforgettable-night-as-sheffield-theatre-group-showcases-work-6531919",
    excerpt:
      "The Star's coverage of Stand & Be Counted Theatre's Soapbox Spotlight in Sheffield, featuring Olamide Sax performing his original Afro-fusion work “Mama” — written, composed and performed on vocals and saxophone.",
    date: "2026",
    tier: "standard",
  },
];

/* Optional notable mentions — lighter than a full press entry (name + note). */
export const pressMentions = [
  { id: "m-01", source: "Utopia Theatre", note: "Open mic night, 1 March 2026 — featured performer." },
  { id: "m-02", source: "darts & Maya Productions", url: "https://wearedarts.org.uk/meet-the-artist-olamide-sax/", note: "Selected Artist, Artist Development Programme — artist profile published on the official site." },
  { id: "m-03", source: "ArtBomb UK", url: "https://www.artbombuk.com/post/beyond-the-scroll-preview", note: "Featured Artist, Beyond the Scroll — artist profile and biography published by ArtBomb." },
  { id: "m-04", source: "Stand & Be Counted Theatre", url: "https://www.sbctheatre.co.uk/productions/soapboxspotlight", note: "Featured Artist, Soapbox Spotlight — original work “Mama” published through the official programme." },
  { id: "m-05", source: "Black Pride Festival", url: "https://naijaukconnect.co.uk/2026/04/06/africa-to-the-world-oodaye-the-cradle-highlights-by-atupa-the-spotlight/", note: "Featured Artist — ÀTÙPÀ (The Spotlight) and Oòdayè (The Cradle)." },
];

/* ============================================================================
   PERFORMANCES — REAL, dated highlights from the CV (Oct 2025 → Jul 2026),
   plus the 2010 origin. Grouped by year. The Timeline page shows a CURATED
   subset of these as its dated spine; the full set is kept here as the
   source-of-truth record. No fabricated dates — every date is from the CV.
   Stable ids: e-<year>-nn.
   ========================================================================== */
export const performances = [
  {
    year: "2010",
    events: [
      { id: "e-2010-01", title: "The first rhythm", venue: "Yoruba percussion", role: null, date: "2010", note: "Beginnings in Yoruba percussion — cord/omele, djembe, talking drum, omele bàtá and ìyá ìlù bàtá." },
    ],
  },
  {
    year: "2025",
    events: [
      { id: "e-2025-01", title: "Nigeria in Doncaster Cultural Day", venue: "Doncaster", role: null, date: "Oct 2025", note: "Vocal, piano and saxophone performance." },
      { id: "e-2025-02", title: "BME United Doncaster", venue: "Doncaster", role: null, date: "Oct 2025", note: "Opening saxophone and vocal/piano performance for Black History Month." },
    ],
  },
  {
    year: "2026",
    events: [
      { id: "e-2026-01", title: "Soapbox Spotlight — \"Mama\"", venue: "Stand & Be Counted Theatre, Sheffield", role: "Writer, Composer & Performer", date: "Mar 2026", note: "Written, composed and performed original Afro-fusion work “Mama” (vocals & saxophone)." },
      { id: "e-2026-02", title: "Migration Action Celebration", venue: "CAST, Doncaster", role: null, date: "Mar 2026", note: "Featured saxophonist, keyboardist and djembe drummer." },
      { id: "e-2026-03", title: "Live with Arkadiusz Buja & Friends", venue: "Doncaster", role: null, date: "Mar 2026", note: "Guest performance." },
      { id: "e-2026-04", title: "ÀTÙPÀ (The Spotlight)", venue: "Black Pride Festival, CAST, Doncaster", role: "Adigún", date: "Apr 2026", note: "Opening saxophone performance." },
      { id: "e-2026-05", title: "Beyond the Scroll", venue: "ArtBomb UK, Doncaster", role: null, date: "Apr 2026", note: "Featured saxophonist; live collaboration with The Skintones UK and outdoor public performance activation." },
      { id: "e-2026-06", title: "Przystanek Doncaster Cultural Festival", venue: "Doncaster", role: null, date: "Apr 2026", note: "Guest saxophonist performing with The Klin Band." },
      { id: "e-2026-07", title: "Adira Food Pharmacy Launch", venue: "Sheffield", role: null, date: "May 2026", note: "Saxophone, piano & iya ilu bata before civic leaders and public-health stakeholders." },
      { id: "e-2026-08", title: "World Record Football Scarf Procession", venue: "Stand & Be Counted Theatre, Sheffield", role: null, date: "Jun 2026", note: "Live saxophone at the Guinness World Record football scarf procession (186 metres) — freedom, belonging, migration and cultural identity." },
      { id: "e-2026-09", title: "Manchester Africa Day Cultural Festival", venue: "Manchester", role: null, date: "Jun 2026", note: "Featured performing artist — vocals & saxophone." },
      { id: "e-2026-10", title: "Collective Routes & Beyond", venue: "Danum Gallery, Library and Museum, Doncaster", role: null, date: "Jun 2026", note: "Featured artist (saxophone) & participatory music facilitator." },
      { id: "e-2026-11", title: "Sharrow Festival", venue: "Sound Café Afrobeat ensemble, Sheffield", role: null, date: "Jul 2026", note: "Featured saxophonist in a live Afrobeat ensemble — contemporary African music with audience participation." },
      { id: "e-2026-12", title: "Best Instrumentalist of the Year", venue: "Eko Heritage Awards", role: null, date: "2026", note: "Winner — Eko Heritage Awards 2026." },
    ],
  },
];

/* ============================================================================
   TEACHING — paid music tuition. Source of truth for the Artistic Practice
   "Teaching & Creative Health" section.
   ========================================================================== */
export const teaching = [
  {
    id: "t-tirosh",
    role: "Music Tutor",
    org: "Tirosh Koncept",
    location: "Sheffield, UK",
    period: "2026–present",
    subjects: ["Saxophone", "Keyboard", "Recorder", "Drum kit"],
    note: "Paid tuition through the Music Enrichment & Extracurricular Club — building musicianship, creativity, confidence and collaborative performance for children and young people.",
  },
];

/* ============================================================================
   FACILITATION / CREATIVE HEALTH — participatory workshop credits. Mirrors
   the Artistic Practice facilitation strip. Graduate of the darts & Maya
   Productions Artist Development Programme in Creative Health & Participatory
   Arts.
   ========================================================================== */
export const facilitation = [
  { id: "f-01", title: "Singing for Memory", venue: "darts, Doncaster", role: "Supporting Facilitator (Music & Singing)" },
  { id: "f-02", title: "Dance On for Parkinson's", venue: "Armthorpe Community Centre, Doncaster", role: "Supporting Facilitator (Movement & Music)" },
  { id: "f-03", title: "Quirky Choir", venue: "darts, Doncaster", role: "Supporting Facilitator (Community Singing)" },
  { id: "f-04", title: "Community Drumming Session", venue: "CAST, Doncaster", role: "Supporting Facilitator (Rhythm & Participation)" },
  { id: "f-05", title: "Tuneful Chatter", venue: "Grange Lane, Doncaster", role: "Supporting Facilitator (Creative Health & Music)" },
  { id: "f-06", title: "Dance On: Strength & Balance", venue: "Woodfield, Doncaster", role: "Supporting Facilitator (Movement & Music)" },
  { id: "f-07", title: "ÀTÙPÀ Martini Workshop", venue: "Black Pride Festival", role: "Supporting Artist (Singing, Saxophone, Percussion) — 100+ participants incl. school children" },
];

/* ============================================================================
   AFFILIATIONS / POSITIONS — ongoing roles. Mirrors the About "Roles &
   Affiliations" strip.
   ========================================================================== */
export const affiliations = [
  { id: "a-01", role: "Founder & Lead Artist", org: "Lammy Wonder Music Entertainment" },
  { id: "a-02", role: "Resident Pianist", org: "RCCG Maranatha Parish, Doncaster" },
  { id: "a-03", role: "Featured Saxophonist", org: "The Skintones UK" },
  { id: "a-04", role: "Featured Saxophonist", org: "Sound Café UK" },
  { id: "a-05", role: "Artist Collaborator", org: "Stand & Be Counted Theatre" },
  { id: "a-06", role: "Artist Development Graduate", org: "darts & Maya Productions" },
];

/* ============================================================================
   THEATRE CREDITS — mirrors the About theatre credits list.
   ========================================================================== */
export const theatreCredits = [
  { id: "tc-01", work: "Oòdayè (The Cradle)", role: "Adigún", venue: "Black Pride Festival, Doncaster" },
  { id: "tc-02", work: "Mama", role: "Writer, Composer & Performer", venue: "SBC Soapbox Spotlight, Sheffield" },
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
