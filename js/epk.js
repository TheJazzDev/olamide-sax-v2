/* epk.js — EPK page: "Download EPK (PDF)" triggers the browser's print dialog.
   A print stylesheet (css/epk.css @media print) reshapes the page into a clean,
   branded PDF. Page-guarded: no-ops if the print button is absent. */

import { $ } from "./utils.js";

export function initEpk() {
  const btn = $("[data-epk-print]");
  if (!btn) return;

  btn.addEventListener("click", () => {
    // Let the click's focus ring settle, then open the print dialog. The user
    // chooses "Save as PDF" as the destination.
    window.print();
  });
}
