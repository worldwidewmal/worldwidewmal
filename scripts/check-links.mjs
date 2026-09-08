/**
 * Build-time integrity check over the generated site.
 *
 * Catches the failures that are invisible until someone hits them in
 * production: internal links to routes that were never built, images and
 * static assets that do not exist on disk, and in-page anchors or
 * aria-controls references pointing at ids that are not in the document.
 *
 * Exits non-zero on any finding, so a broken link fails the build rather than
 * being discovered after deployment. Run directly (`npm run check`) or as part
 * of `npm run publish:pages`.
 */
import { readdir, readFile, stat } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DIST = path.join(ROOT, 'dist');

/** Every attribute that can point at something that must exist. */
const URL_ATTRS = [
  ['href', /<(?:a|link)\b[^>]*?\bhref\s*=\s*["']([^"']+)["']/gi],
  ['src', /<(?:img|script|source|iframe|video|audio)\b[^>]*?\bsrc\s*=\s*["']([^"']+)["']/gi],
  ['srcset', /\bsrcset\s*=\s*["']([^"']+)["']/gi],
  ['aria-controls', /\baria-controls\s*=\s*["']([^"']+)["']/gi],
];

const isExternal = (u) => /^(https?:)?\/\//i.test(u) || /^(mailto:|tel:|data:)/i.test(u);

async function htmlFiles(dir, acc = []) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) await htmlFiles(full, acc);
    else if (entry.name.endsWith('.html')) acc.push(full);
  }
  return acc;
}

/** Resolve a site-root or relative URL to a file that should exist in dist. */
async function resolves(url, fromFile) {
  const clean = url.split('#')[0].split('?')[0];
  if (!clean) return true;

  const base = clean.startsWith('/')
    ? path.join(DIST, clean)
    : path.resolve(path.dirname(fromFile), clean);

  if (existsSync(base)) {
    const s = await stat(base);
    if (s.isFile()) return true;
    if (s.isDirectory()) return existsSync(path.join(base, 'index.html'));
  }
  // Extensionless route: /terms → /terms/index.html or /terms.html
  return existsSync(base + '.html') || existsSync(path.join(base, 'index.html'));
}

const problems = [];

function collect(html, re) {
  const out = [];
  let m;
  while ((m = re.exec(html)) !== null) out.push(m[1]);
  return out;
}

const files = await htmlFiles(DIST);
if (!files.length) {
  console.error('check-links: no HTML found in dist/ — run the build first.');
  process.exit(1);
}

for (const file of files) {
  const html = await readFile(file, 'utf8');
  const rel = path.relative(DIST, file);
  const ids = new Set(collect(html, /\bid\s*=\s*["']([^"']+)["']/gi));

  for (const [kind, re] of URL_ATTRS) {
    re.lastIndex = 0;
    for (const raw of collect(html, re)) {
      if (kind === 'aria-controls') {
        for (const id of raw.split(/\s+/).filter(Boolean)) {
          if (!ids.has(id)) problems.push(`${rel}: aria-controls="${id}" has no matching element`);
        }
        continue;
      }

      if (kind === 'srcset') {
        for (const cand of raw.split(',')) {
          const u = cand.trim().split(/\s+/)[0];
          if (!u || isExternal(u)) continue;
          if (!(await resolves(u, file))) problems.push(`${rel}: srcset entry not found — ${u}`);
        }
        continue;
      }

      if (isExternal(raw)) continue;

      if (raw.startsWith('#')) {
        const id = raw.slice(1);
        if (id && !ids.has(id)) problems.push(`${rel}: anchor ${raw} has no target`);
        continue;
      }

      if (!(await resolves(raw, file))) problems.push(`${rel}: ${kind} not found — ${raw}`);

      // A link to another page with a fragment must find that id there.
      const [target, frag] = raw.split('#');
      if (frag && target) {
        const page = target.startsWith('/')
          ? path.join(DIST, target, 'index.html')
          : path.resolve(path.dirname(file), target, 'index.html');
        if (existsSync(page)) {
          const other = await readFile(page, 'utf8');
          if (!new Set(collect(other, /\bid\s*=\s*["']([^"']+)["']/gi)).has(frag)) {
            problems.push(`${rel}: ${raw} — #${frag} not present on ${target}`);
          }
        }
      }
    }
  }
}

if (problems.length) {
  console.error(`\ncheck-links: ${problems.length} problem(s) found\n`);
  for (const p of problems) console.error('  ✗ ' + p);
  console.error('');
  process.exit(1);
}

console.log(`check-links: ${files.length} page(s) checked, no broken links or missing assets.`);
