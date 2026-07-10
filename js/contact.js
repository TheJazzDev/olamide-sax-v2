/* ============================================================================
   contact.js — Olamide Sax V2 · booking form (UI logic only, NO backend)
   The booking form is progressive-enhancement over a plain mailto: intent.
   On submit we compose a correct mailto: (subject + body built from the
   fields, each value encodeURIComponent-escaped) and hand off to the user's
   email client. No network request is made.

   Contract: exports `initContact()`. Page-guarded — no-ops if the booking
   form (`[data-booking-form]`) is absent, so main.js can call it on every page.

   Markup it expects (built statically in contact.html):
     [data-booking-form]    — the <form>
       #bf-name  #bf-email  #bf-subject (select)  #bf-message
     [data-booking-status]  — a role="status" aria-live line for feedback

   FUTURE ENDPOINT: to POST to a real backend instead of (or as well as)
   opening mailto:, set FORM_ENDPOINT below to your URL and the commented
   fetch() block will submit the JSON payload. Left inert by design (Task 5).
   ========================================================================== */

import { $, on } from "./utils.js";

/* The single booking address (matches the mailto: links across the site). */
const BOOKING_EMAIL = "Olaniyanolamidephillip@gmail.com";

/* Human labels for the enquiry-type <select> values (used in the subject). */
const SUBJECT_LABELS = {
  booking: "Booking enquiry",
  collaboration: "Collaboration enquiry",
  media: "Media / Press enquiry",
  other: "General enquiry",
};

/* --------------------------------------------------------------------------
   FUTURE ENDPOINT HOOK — leave null to keep the pure mailto: behaviour.
   When a backend exists, set this to the POST URL; see submitToEndpoint().
   -------------------------------------------------------------------------- */
const FORM_ENDPOINT = null; // e.g. "https://formspree.io/f/XXXX"

/** Build the mailto: href from the collected field values. */
export function buildMailto(fields) {
  const subjectLabel = SUBJECT_LABELS[fields.subject] || SUBJECT_LABELS.other;
  const subject = `${subjectLabel} — ${fields.name || "Website enquiry"}`;

  const bodyLines = [
    `Name: ${fields.name}`,
    `Email: ${fields.email}`,
    `Enquiry type: ${subjectLabel}`,
    "",
    "Message:",
    fields.message,
    "",
    "— Sent from olamidesax.com booking form",
  ];
  const body = bodyLines.join("\n");

  return (
    `mailto:${BOOKING_EMAIL}` +
    `?subject=${encodeURIComponent(subject)}` +
    `&body=${encodeURIComponent(body)}`
  );
}

/* Read the current field values off the form into a plain object. */
function readFields(form) {
  const get = (name) => {
    const el = form.elements.namedItem(name);
    return el ? el.value.trim() : "";
  };
  return {
    name: get("name"),
    email: get("email"),
    subject: get("subject") || "booking",
    message: get("message"),
  };
}

/* Minimal, accessible validation — returns "" when valid, else a message. */
function validate(fields) {
  if (!fields.name) return "Please add your name.";
  if (!fields.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email))
    return "Please add a valid email address.";
  if (!fields.message) return "Please add a short message.";
  return "";
}

/* --------------------------------------------------------------------------
   OPTIONAL backend submit — inert unless FORM_ENDPOINT is set. Kept here,
   clearly commented, so wiring a real endpoint later is a one-line change.
   -------------------------------------------------------------------------- */
// async function submitToEndpoint(fields) {
//   const res = await fetch(FORM_ENDPOINT, {
//     method: "POST",
//     headers: { "Content-Type": "application/json", Accept: "application/json" },
//     body: JSON.stringify(fields),
//   });
//   if (!res.ok) throw new Error(`Booking submit failed: ${res.status}`);
// }

export function initContact() {
  const form = $("[data-booking-form]");
  if (!form) return; // page-guard

  const status = $("[data-booking-status]");

  const setStatus = (msg) => {
    if (status) status.textContent = msg || "";
  };

  on(form, "submit", (event) => {
    event.preventDefault();

    const fields = readFields(form);
    const error = validate(fields);
    if (error) {
      setStatus(error);
      // Move focus to the first empty required control for keyboard users.
      const firstInvalid =
        (!fields.name && form.elements.namedItem("name")) ||
        (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email) &&
          form.elements.namedItem("email")) ||
        (!fields.message && form.elements.namedItem("message"));
      if (firstInvalid && firstInvalid.focus) firstInvalid.focus();
      return;
    }

    // Default (no backend): compose mailto: and hand off to the email client.
    if (!FORM_ENDPOINT) {
      const href = buildMailto(fields);
      setStatus("Opening your email app with the message ready to send…");
      window.location.href = href;
      return;
    }

    // With an endpoint wired, POST instead (uncomment submitToEndpoint above):
    // setStatus("Sending…");
    // submitToEndpoint(fields)
    //   .then(() => { setStatus("Thank you — your enquiry has been sent."); form.reset(); })
    //   .catch(() => { setStatus("Something went wrong — please email us directly."); });
  });
}
