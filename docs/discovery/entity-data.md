# Entity data — MusicBrainz & Wikidata (ready to enter)

Prepared, source-checked data so the achievable-now database entries in
`discovery-guide.md` Part A can be created quickly. All facts trace to the CV /
verified press — nothing invented.

---

## MusicBrainz (https://musicbrainz.org — free account, then "Add Artist")

| Field | Value |
|---|---|
| **Name** | Olamide Sax |
| **Sort name** | Olamide Sax |
| **Type** | Person |
| **Gender** | (as applicable) |
| **Area** | United Kingdom |
| **Begin area** | Nigeria |
| **Aliases** | OlamideSax; Olamide Phillips Olaniyan; Olaniyan Olamide Phillips |
| **Disambiguation** | Nigerian-born UK Afro-fusion saxophonist (distinguishes from the rapper Olamide) |
| **Tags/genres** | afro-fusion, afrobeat, saxophone, instrumental |

**Relationships / URLs to add (MusicBrainz "add relationship" → URL):**
- Official homepage → https://www.olamidesax.co.uk
- YouTube → https://youtube.com/@olamidesax
- Instagram → https://www.instagram.com/olamide.sax
- (Audiomack / Spotify / Apple Music → add when confirmed)

> The **disambiguation** line is important — it's what stops him being confused
> with the rapper "Olamide" in databases that pull from MusicBrainz.

---

## Wikidata (https://www.wikidata.org — "Create a new item")

Lower bar than a full Wikipedia article; feeds Google's knowledge graph directly.

| Property | Value |
|---|---|
| **Label (en)** | Olamide Sax |
| **Description (en)** | Nigerian-born British musician and saxophonist |
| **Also known as** | OlamideSax; Olamide Phillips Olaniyan |
| **instance of** (P31) | human (Q5) |
| **occupation** (P106) | musician (Q639669); saxophonist (Q12800682) |
| **country of citizenship** (P27) | Nigeria (Q1033) |
| **residence / work location** (P937) | Yorkshire / United Kingdom |
| **instrument** (P1303) | saxophone (Q11405); keyboard; vocals |
| **genre** (P136) | Afrobeat (Q205560); Afro-fusion |
| **official website** (P856) | https://www.olamidesax.co.uk |
| **Instagram username** (P2003) | olamide.sax |
| **YouTube channel ID** (P2397) | @olamidesax |

**Reference each statement** with the press URLs where possible (Guardian, BBC,
The Star) so the item is well-sourced.

> A well-sourced Wikidata item + MusicBrainz entry + the site's JSON-LD is the
> trio that most helps Google build a proper knowledge entity for him — and none
> of them require the Wikipedia notability bar.

---

## The site's own machine-readable identity (already live)

The homepage already ships JSON-LD (schema.org) describing him as a
Person + MusicGroup with alternateName "OlamideSax", genre, award, and 10 sameAs
links (socials + BBC/Guardian/Star/darts). That's the on-site half of the entity
signal; MusicBrainz + Wikidata are the off-site half.
