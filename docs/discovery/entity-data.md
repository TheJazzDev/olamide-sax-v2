# MusicBrainz & Wikidata — step-by-step setup (verified data)

These two free databases feed Google's knowledge graph and help build his
"musician" identity across the web. Both require you to **create a free account
and be logged in** to submit — they're community-edited, so a real person has to
enter them (they can't be created by a script/bot). Everything below is copy-
paste ready. All Wikidata IDs here were **verified live** (a couple in the old
draft were wrong — corrected below).

**Order:** do **MusicBrainz first** (5 min), then **Wikidata** (10 min).
Do them from the same session so the details stay consistent.

---

## 1 · MusicBrainz — https://musicbrainz.org

### Steps
1. Create an account (top-right "Create account") and log in.
2. Go to **Add → Add Artist** (or https://musicbrainz.org/artist/create).
3. Fill the form with the values below, then **Enter edit note**: "Creating
   artist page for Olamide Sax (Nigerian-born UK Afro-fusion saxophonist)."
4. Submit. (New artists appear immediately but may be auto-reviewed.)

### Field values (copy-paste)

| Field | Value |
|---|---|
| **Name** | `Olamide Sax` |
| **Sort name** | `Olamide Sax` |
| **Disambiguation** | `Nigerian-born UK Afro-fusion saxophonist` |
| **Type** | Person |
| **Begin area** | `Nigeria` |
| **Area** | `United Kingdom` |
| **Aliases** (add each) | `OlamideSax`, `Olamide Phillips Olaniyan`, `Olaniyan Olamide Phillips` |
| **Genres / tags** | `afro-fusion`, `afrobeats`, `saxophone`, `instrumental` |

> The **disambiguation** line matters most — it's what keeps him separate from
> the rapper "Olamide" in every database that pulls from MusicBrainz.

### After saving — add URL relationships
On the new artist page: **Edit → Add relationship → URL**, add each:
- Official homepage → `https://www.olamidesax.co.uk`
- YouTube → `https://www.youtube.com/@olamidesax`
- Instagram → `https://www.instagram.com/olamide.sax`
- (Add Audiomack / Spotify / Apple Music later when confirmed)

---

## 2 · Wikidata — https://www.wikidata.org

Wikidata has a **lower bar than a Wikipedia article** and directly feeds Google's
knowledge panel, so this is high-value and achievable now.

### Steps
1. Log in (you can reuse a Wikipedia/Wikimedia account if you have one).
2. **First, search** "Olamide Sax" to make sure no item exists yet
   (https://www.wikidata.org/wiki/Special:Search). If none, continue.
3. Go to **Special:NewItem** (https://www.wikidata.org/wiki/Special:NewItem).
4. Set the **Label**, **Description**, and **Also known as** (below).
5. Then add each **statement** below via "＋ add statement". When you type a
   property name it autocompletes; when you type a value, pick the matching item
   by its Q-number (given below, so you choose the right one).

### Label / description / aliases

| Field | Value |
|---|---|
| **Label (English)** | `Olamide Sax` |
| **Description (English)** | `Nigerian-born British musician and saxophonist` |
| **Also known as (English)** | `OlamideSax` · `Olamide Phillips Olaniyan` · `Olaniyan Olamide Phillips` |

### Statements (property → value, with the exact Q-IDs to pick)

| Property | Value to select |
|---|---|
| **instance of** (P31) | human — **Q5** |
| **occupation** (P106) | musician — **Q639669** |
| **occupation** (P106) | saxophonist — **Q12800682** |
| **country of citizenship** (P27) | Nigeria — **Q1033** |
| **instrument** (P1303) | saxophone — **Q9798** |
| **genre** (P136) | Afrobeats — **Q25099840** |
| **official website** (P856) | `https://www.olamidesax.co.uk` |
| **Instagram username** (P2003) | `olamide.sax` |
| **YouTube channel ID** (P2397) | `@olamidesax` |

> ⚠️ **Corrected from the earlier notes:** saxophone is **Q9798** (Q11405 is
> *flute*), and the genre is **Afrobeats Q25099840** (Q205560 is *trip hop*).
> Use the IDs above — they were verified.

### Add references (do this for the key statements)
For occupation / genre / instrument, click the statement → "add reference" →
property **reference URL (P854)** → paste one of his press links so the item is
sourced:
- `https://guardian.ng/saturday-magazine/weekend-beats/olamide-lights-up-atupa-stage-production-with-multifaceted-performances/`
- `https://www.bbc.co.uk/news/articles/c0myr99njy3o`
- `https://www.thestar.co.uk/your-world/unforgettable-night-as-sheffield-theatre-group-showcases-work-6531919`

### Optional but good
- Add **image (P18)** later if a freely-licensed photo is uploaded to Wikimedia
  Commons (don't upload a copyrighted press photo).
- Once the MusicBrainz artist exists, add its ID via **MusicBrainz artist ID
  (P434)** — this cross-links the two databases (a strong signal).

---

## Why we can't "auto-submit" these

Both sites are edited by a logged-in human and moderated by their communities;
entries created by an unattended tool get flagged or reverted. So the account
creation + submit has to be done by you (or whoever manages his profiles). The
work above is everything *except* the login — pre-filled and verified so it's a
quick job.

---

## The site's own machine-readable identity (already live)

The homepage already ships JSON-LD (schema.org) describing him as
Person + MusicGroup with alternateName "OlamideSax", genre, award, and 10 sameAs
links (socials + BBC/Guardian/Star/darts). That's the on-site half of the entity
signal; MusicBrainz + Wikidata are the off-site half. Once all three exist and
agree, Google has strong, consistent evidence for a proper knowledge entity.
