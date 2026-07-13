/* ============================================================================
   signaturePen.js — the pen that writes the name.
   ----------------------------------------------------------------------------
   A fountain pen held in fingertips, cropped hard. The brief asks for a luxury
   brand film, not a whiteboard explainer, and the surest way to stay out of the
   uncanny valley is to SHOW LESS: the nib, the barrel, two finger pads, and then
   nothing. What you don't draw, the viewer fills in.

   The NIB TIP is the group's origin (0, 0), so placing the pen is a plain
   translate to the writing point — no offset maths at the call site. That is
   what keeps the nib and the ink exactly coincident.

   The contact shadow does most of the work: it tightens and darkens on the page,
   softens and spreads on a lift. More than any amount of rendering, that is what
   makes flat vector art read as TOUCHING something.

   Drawn at roughly 260 units tall, in the same units as the signature glyphs
   (1000 per em), so it sits naturally against letters ~700 units tall.
   ========================================================================== */

const NS = "http://www.w3.org/2000/svg";
let uid = 0;

export function createPen() {
  const id = `sigpen-${uid++}`;
  const g = document.createElementNS(NS, "g");
  g.setAttribute("aria-hidden", "true");

  g.innerHTML = `
    <defs>
      <linearGradient id="${id}-barrel" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0"    stop-color="#0b0a09"/>
        <stop offset="0.30" stop-color="#3d342d"/>
        <stop offset="0.44" stop-color="#7a6c5e"/>
        <stop offset="0.55" stop-color="#292320"/>
        <stop offset="1"    stop-color="#090807"/>
      </linearGradient>
      <linearGradient id="${id}-nib" x1="0" y1="1" x2="1" y2="0">
        <stop offset="0"    stop-color="#8a6a2e"/>
        <stop offset="0.45" stop-color="#e6c67e"/>
        <stop offset="0.65" stop-color="#fff3d8"/>
        <stop offset="1"    stop-color="#9c7735"/>
      </linearGradient>
      <linearGradient id="${id}-band" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0"   stop-color="#8a6a2e"/>
        <stop offset="0.5" stop-color="#f2dca6"/>
        <stop offset="1"   stop-color="#8a6a2e"/>
      </linearGradient>
      <linearGradient id="${id}-skin" x1="0.1" y1="0" x2="0.8" y2="1">
        <stop offset="0"   stop-color="#b0815a"/>
        <stop offset="0.5" stop-color="#8a6040"/>
        <stop offset="1"   stop-color="#573a26"/>
      </linearGradient>
      <linearGradient id="${id}-skin2" x1="0" y1="0" x2="0.6" y2="1">
        <stop offset="0" stop-color="#96694a"/>
        <stop offset="1" stop-color="#4e3421"/>
      </linearGradient>
      <filter id="${id}-drop" x="-50%" y="-50%" width="200%" height="200%">
        <feDropShadow dx="10" dy="22" stdDeviation="16"
                      flood-color="#000" flood-opacity="0.45"/>
      </filter>
      <radialGradient id="${id}-contact">
        <stop offset="0"   stop-color="#000" stop-opacity="0.5"/>
        <stop offset="0.65" stop-color="#000" stop-opacity="0.14"/>
        <stop offset="1"   stop-color="#000" stop-opacity="0"/>
      </radialGradient>
    </defs>

    <!-- contact shadow, under everything, centred on the nib -->
    <ellipse data-contact cx="6" cy="10" rx="40" ry="16"
             fill="url(#${id}-contact)"/>

    <!-- one writing tilt, pivoting on the nib tip -->
    <g transform="rotate(-36 0 0)" filter="url(#${id}-drop)">
      <!-- nib: tapered gold blade with a slit and a breather hole -->
      <path d="M0 0 L-15 -74 Q0 -90 15 -74 Z" fill="url(#${id}-nib)"/>
      <path d="M0 -6 L0 -62" stroke="#5c4520" stroke-width="3.5"/>
      <circle cx="0" cy="-63" r="6" fill="#5c4520"/>
      <!-- grip -->
      <path d="M-17 -104 L17 -104 L14 -72 L-14 -72 Z" fill="#141110"/>
      <!-- barrel -->
      <rect x="-21" y="-370" width="42" height="270" rx="17"
            fill="url(#${id}-barrel)"/>
      <!-- gold band -->
      <rect x="-21" y="-392" width="42" height="24" rx="4"
            fill="url(#${id}-band)"/>
      <!-- cap, running up out of frame -->
      <rect x="-20" y="-560" width="40" height="172" rx="14"
            fill="url(#${id}-barrel)"/>

      <!-- finger pads. Only what touches the pen. -->
      <path d="M-22 -110 Q-74 -100 -98 -56 Q-114 -20 -84 -6
               Q-52 8 -22 -20 Q-8 -46 -16 -84 Z"
            fill="url(#${id}-skin2)"/>
      <path d="M14 -128 Q68 -148 108 -118 Q142 -90 122 -46
               Q100 -6 58 -18 Q24 -30 10 -66 Q0 -100 14 -128 Z"
            fill="url(#${id}-skin)"/>
      <path d="M-20 -172 Q-84 -182 -122 -146 Q-156 -112 -126 -80
               Q-100 -56 -58 -80 Q-24 -104 -20 -140 Z"
            fill="url(#${id}-skin)"/>
      <path d="M84 -108 Q108 -114 116 -90 Q108 -66 84 -70 Q74 -88 84 -108 Z"
            fill="#c99b76" opacity="0.45"/>
    </g>
  `;

  const contact = g.querySelector("[data-contact]");

  /* 1 = nib on the page (tight, dark). 0 = lifted (soft, spread). */
  function setContact(t) {
    const k = Math.max(0, Math.min(1, t));
    contact.setAttribute("rx", String(34 + (1 - k) * 40));
    contact.setAttribute("ry", String(13 + (1 - k) * 16));
    contact.setAttribute("opacity", String(0.3 + k * 0.7));
  }
  setContact(0);

  return { el: g, setContact };
}
