/**
 * Copy the Astro build in dist/ to the repo root, which is what GitHub Pages
 * serves for worldwidewmal.com.
 *
 * GitHub Pages does not run an Astro build, so the generated output is
 * committed alongside the source. Run `npm run publish:pages`, then commit.
 * Files listed in KEEP are never touched.
 */
import { cp, readdir, rm, stat, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DIST = path.join(ROOT, 'dist');

/** Repo files that are not build output and must survive publishing. */
const KEEP = new Set([
  '.git', '.github', '.gitignore', 'node_modules', 'dist', 'src', 'scripts',
  'public', 'package.json', 'package-lock.json', 'astro.config.mjs',
  'tsconfig.json', '.astro', 'README.md', 'CNAME', '_config.yml',
]);

if (!existsSync(DIST)) {
  console.error('dist/ not found — run `npm run build` first.');
  process.exit(1);
}

// 1. Clear previously published output from the root.
for (const entry of await readdir(ROOT)) {
  if (KEEP.has(entry)) continue;
  await rm(path.join(ROOT, entry), { recursive: true, force: true });
}

// 2. Copy the fresh build to the root.
for (const entry of await readdir(DIST)) {
  await cp(path.join(DIST, entry), path.join(ROOT, entry), { recursive: true });
}

// 3. Tell GitHub Pages not to run the output through Jekyll, which would
//    otherwise ignore any directory starting with an underscore.
await mkdir(ROOT, { recursive: true });
await cp(path.join(DIST, 'index.html'), path.join(ROOT, 'index.html'));
const { writeFile } = await import('node:fs/promises');
await writeFile(path.join(ROOT, '.nojekyll'), '');

const published = await readdir(ROOT);
console.log('Published to repo root:', published.filter((f) => !KEEP.has(f)).join(', '));
