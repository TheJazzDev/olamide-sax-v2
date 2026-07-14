/* build.js — produce a minified static site into dist/ for Vercel.
   HTML → html-minifier-terser · CSS → lightningcss · JS module → bun bundle+minify.
   Vendor JS + assets are copied as-is (vendor is already minified). */

import { rmSync, mkdirSync, cpSync, readdirSync, statSync, readFileSync, writeFileSync, renameSync } from "node:fs";
import { join, dirname, extname, basename } from "node:path";
import { createHash } from "node:crypto";
import { minify as minifyHtml } from "html-minifier-terser";
import { transform as lightning } from "lightningcss";

const ROOT = import.meta.dir;
const OUT = join(ROOT, "dist");

// ── 1 · fresh dist ──────────────────────────────────────────────────────────
rmSync(OUT, { recursive: true, force: true });
mkdirSync(OUT, { recursive: true });

// ── 2 · copy everything deployable (assets, vendor, fonts, icons) ───────────
// The whole tree is copied first; we then OVERWRITE html/css/js with minified
// versions. Raw video sources are excluded via .vercelignore + git, and we skip
// build files here too.
const SKIP_TOP = new Set([
  "dist", "node_modules", ".git", ".vscode", ".idea", ".superpowers",
  "build.js", "package.json", "bun.lockb", "bun.lock",
  "vercel.json", ".vercelignore", ".gitignore",
]);
const SKIP_ASSET_DIRS = new Set(["source", "_work", "grades"]); // raw video sources

for (const name of readdirSync(ROOT)) {
  if (SKIP_TOP.has(name)) continue;
  cpSync(join(ROOT, name), join(OUT, name), {
    recursive: true,
    filter: (src) => {
      const base = src.split("/").pop();
      return !SKIP_ASSET_DIRS.has(base);
    },
  });
}

// ── 3 · minify CSS in place (in dist) ───────────────────────────────────────
function walk(dir, ext, fn) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    const st = statSync(p);
    if (st.isDirectory()) walk(p, ext, fn);
    else if (extname(p) === ext) fn(p);
  }
}

let cssCount = 0;
walk(join(OUT, "css"), ".css", (file) => {
  const code = readFileSync(file);
  const { code: min } = lightning({
    filename: file,
    code,
    minify: true,
  });
  writeFileSync(file, min);
  cssCount++;
});
console.log(`✓ minified ${cssCount} CSS files`);

// ── 4 · bundle + minify the JS module graph (js/main.js → js/main.js) ───────
// bun resolves all ./imports into one file and minifies. Vendor scripts are
// classic (already minified) and stay untouched.
const jsOut = join(OUT, "js");
const result = await Bun.build({
  entrypoints: [join(ROOT, "js/main.js")],
  outdir: jsOut,
  minify: true,
  target: "browser",
  naming: "[name].js", // → dist/js/main.js
});
if (!result.success) {
  console.error("JS build failed:");
  for (const m of result.logs) console.error(m);
  process.exit(1);
}
// Remove the now-unbundled individual module files from dist/js (main.js bundles
// them). Keep vendor/ and the bundled main.js.
for (const name of readdirSync(jsOut)) {
  if (name === "main.js" || name === "vendor") continue;
  const p = join(jsOut, name);
  if (statSync(p).isFile() && extname(p) === ".js") rmSync(p);
}
console.log("✓ bundled + minified JS → js/main.js");

// ── 4.5 · content-hash css/js filenames, then rewrite HTML refs ─────────────
// The HTML references assets by plain name (css/home.css, js/main.js). Vercel
// serves /css/* and /js/* with `immutable, max-age=1yr`, so browsers (mobile
// especially) never refetch a changed file that kept the same name — the deploy
// looks like it "didn't update". Fix: rename each file to include a hash of its
// CONTENTS (home.<hash>.css) so every change gets a NEW url, and rewrite every
// HTML reference to match. Unchanged files keep their hash → still cached.
const hashMap = new Map(); // "css/home.css" → "css/home.a1b2c3d4.css"

function hashFile(absPath, relDir) {
  const buf = readFileSync(absPath);
  const hash = createHash("sha256").update(buf).digest("hex").slice(0, 8);
  const ext = extname(absPath);
  const stem = basename(absPath, ext);
  const newBase = `${stem}.${hash}${ext}`;
  renameSync(absPath, join(dirname(absPath), newBase));
  hashMap.set(`${relDir}/${stem}${ext}`, `${relDir}/${newBase}`);
}

// Hash all CSS (dist/css/*) and the bundled + vendor JS (dist/js/**).
walk(join(OUT, "css"), ".css", (file) => hashFile(file, "css"));
walk(join(OUT, "js"), ".js", (file) => {
  // preserve the js/vendor/ subpath in the ref key
  const rel = file.slice(join(OUT).length + 1).split("/").slice(0, -1).join("/");
  hashFile(file, rel);
});
console.log(`✓ content-hashed ${hashMap.size} css/js files`);

// Rewrite the references across every HTML file. Longest keys first so
// "js/vendor/x.js" is replaced before a shorter accidental substring could be.
const refKeys = [...hashMap.keys()].sort((a, b) => b.length - a.length);
for (const name of readdirSync(OUT).filter((n) => extname(n) === ".html")) {
  const file = join(OUT, name);
  let html = readFileSync(file, "utf8");
  for (const key of refKeys) {
    html = html.split(key).join(hashMap.get(key));
  }
  writeFileSync(file, html);
}
console.log("✓ rewrote hashed refs in HTML");

// ── 5 · minify HTML in place (in dist) ──────────────────────────────────────
let htmlCount = 0;
const htmlFiles = readdirSync(OUT).filter((n) => extname(n) === ".html");
for (const name of htmlFiles) {
  const file = join(OUT, name);
  const html = readFileSync(file, "utf8");
  const min = await minifyHtml(html, {
    collapseWhitespace: true,
    removeComments: true,
    minifyCSS: true,      // inline <style> (the ink flash-guard)
    minifyJS: true,       // inline <script>
    removeRedundantAttributes: false, // keep type="module" etc.
    keepClosingSlash: true,
    caseSensitive: true,  // SVG/attr safety
  });
  writeFileSync(file, min);
  htmlCount++;
}
console.log(`✓ minified ${htmlCount} HTML files`);

console.log("\nBuild complete → dist/");
