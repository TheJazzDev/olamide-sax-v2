/* build.js — produce a minified static site into dist/ for Vercel.
   HTML → html-minifier-terser · CSS → lightningcss · JS module → bun bundle+minify.
   Vendor JS + assets are copied as-is (vendor is already minified). */

import { rmSync, mkdirSync, cpSync, readdirSync, statSync, readFileSync, writeFileSync } from "node:fs";
import { join, dirname, extname } from "node:path";
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
  "dist", "node_modules", ".git", ".vscode", ".idea",
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
