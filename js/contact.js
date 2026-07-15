/* contact.js — booking form, no backend. On submit, composes a mailto: from the
   fields and hands off to the email client. Exports initContact(); page-guarded
   on [data-booking-form]. To POST to a real backend, set FORM_ENDPOINT below.
   Expects: [data-booking-form] with #bf-name/#bf-email/#bf-subject/#bf-message,
   and [data-booking-status] (role=status) for feedback. */

import { $, on } from './utils.js';

/* The single booking address (matches the mailto: links across the site). */
const BOOKING_EMAIL = 'booking@olamidesax.co.uk';

/* Human labels for the enquiry-type <select> values (used in the subject). */
const SUBJECT_LABELS = {
  booking: 'Booking enquiry',
  collaboration: 'Collaboration enquiry',
  media: 'Media / Press enquiry',
  other: 'General enquiry',
};

const FORM_ENDPOINT = null; // set to a URL to POST instead of mailto:

/** Build the mailto: href from the collected field values. */
export function buildMailto(fields) {
  const subjectLabel = SUBJECT_LABELS[fields.subject] || SUBJECT_LABELS.other;
  const subject = `${subjectLabel} — ${fields.name || 'Website enquiry'}`;

  const bodyLines = [
    `Name: ${fields.name}`,
    `Email: ${fields.email}`,
    `Enquiry type: ${subjectLabel}`,
    '',
    'Message:',
    fields.message,
    '',
    '— Sent from olamidesax.com booking form',
  ];
  const body = bodyLines.join('\n');

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
    return el ? el.value.trim() : '';
  };
  return {
    name: get('name'),
    email: get('email'),
    subject: get('subject') || 'booking',
    message: get('message'),
  };
}

/* Minimal, accessible validation — returns "" when valid, else a message. */
function validate(fields) {
  if (!fields.name) return 'Please add your name.';
  if (!fields.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email))
    return 'Please add a valid email address.';
  if (!fields.message) return 'Please add a short message.';
  return '';
}

export function initContact() {
  const form = $('[data-booking-form]');
  if (!form) return; // page-guard

  const status = $('[data-booking-status]');

  const setStatus = (msg) => {
    if (status) status.textContent = msg || '';
  };

  on(form, 'submit', (event) => {
    event.preventDefault();

    const fields = readFields(form);
    const error = validate(fields);
    if (error) {
      setStatus(error);
      // Move focus to the first empty required control for keyboard users.
      const firstInvalid =
        (!fields.name && form.elements.namedItem('name')) ||
        (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email) &&
          form.elements.namedItem('email')) ||
        (!fields.message && form.elements.namedItem('message'));
      if (firstInvalid && firstInvalid.focus) firstInvalid.focus();
      return;
    }

    // Default (no backend): compose mailto: and hand off to the email client.
    if (!FORM_ENDPOINT) {
      const href = buildMailto(fields);
      setStatus('Opening your email app with the message ready to send…');
      window.location.href = href;
      return;
    }

    // With an endpoint wired, POST instead (uncomment submitToEndpoint above): setStatus("Sending…");
  });
}
