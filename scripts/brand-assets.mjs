/**
 * Build-time brand asset generation.
 *
 * Everything here derives from one file — `public/logo.png`, the approved
 * WORLDWIDEWMAL mark. Nothing is redrawn, recoloured, cropped, or simplified:
 * the logo is only ever scaled proportionally and placed on the site's own
 * background colour. Replace logo.png and every derived asset regenerates.
 *
 * Outputs (all into public/, so they ship with any build):
 *   social-preview.png   1200x630 OG/Twitter card — logo only, no text
 *   favicon-16/32/48.png
 *   favicon.ico          the three sizes above, packed
 *   apple-touch-icon.png 180x180
 *   icon-192/512.png     for the web app manifest
 *
 * Runs as an Astro integration on astro:build:start, and is safe to re-run:
 * output is deterministic, and a missing `sharp` degrades to a warning rather
 * than failing the build (previously generated files stay in place).
 */
import { existsSync } from 'node:fs';
import { mkdir, writeFile, readFile } from 'node:fs/promises';
import path from 'node:path';

/** The site's background. The mark is designed against this exact tone. */
const BG = { r: 0x09, g: 0x08, b: 0x0a, alpha: 1 };

const SOCIAL = { w: 1200, h: 630 };
/** Logo height inside the card. The rest is deliberate negative space. */
const SOCIAL_LOGO_H = 400;

const FAVICONS = [16, 32, 48];
const ICONS = [
  { name: 'apple-touch-icon.png', size: 180 },
  { name: 'icon-192.png', size: 192 },
  { name: 'icon-512.png', size: 512 },
];

/**
 * Pack PNGs into an .ico. The format allows raw PNG payloads, so each entry is
 * just a directory record pointing at the encoded PNG — no BMP re-encoding.
 */
function buildIco(images) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // type: icon
  header.writeUInt16LE(images.length, 4);

  let offset = 6 + images.length * 16;
  const entries = [];
  for (const { size, data } of images) {
    const e = Buffer.alloc(16);
    e.writeUInt8(size >= 256 ? 0 : size, 0); // width  (0 means 256)
    e.writeUInt8(size >= 256 ? 0 : size, 1); // height
    e.writeUInt8(0, 2); // palette size
    e.writeUInt8(0, 3); // reserved
    e.writeUInt16LE(1, 4); // colour planes
    e.writeUInt16LE(32, 6); // bits per pixel
    e.writeUInt32LE(data.length, 8);
    e.writeUInt32LE(offset, 12);
    entries.push(e);
    offset += data.length;
  }
  return Buffer.concat([header, ...entries, ...images.map((i) => i.data)]);
}

export async function generateBrandAssets({ root, logger }) {
  const publicDir = path.join(root, 'public');
  const source = path.join(publicDir, 'logo.png');

  if (!existsSync(source)) {
    logger?.warn(`brand assets: ${source} not found, skipping generation`);
    return;
  }

  let sharp;
  try {
    ({ default: sharp } = await import('sharp'));
  } catch {
    logger?.warn('brand assets: sharp is not installed, keeping existing files');
    return;
  }

  await mkdir(publicDir, { recursive: true });
  const logo = await readFile(source);
  const written = [];

  // ── social preview: the mark alone, centred, on the brand background ──
  const scaled = await sharp(logo)
    .resize({ height: SOCIAL_LOGO_H, fit: 'inside', withoutEnlargement: true })
    .png()
    .toBuffer();

  const social = await sharp({
    create: { width: SOCIAL.w, height: SOCIAL.h, channels: 4, background: BG },
  })
    .composite([{ input: scaled, gravity: 'centre' }])
    .png({ compressionLevel: 9 })
    .toBuffer();

  await writeFile(path.join(publicDir, 'social-preview.png'), social);
  written.push('social-preview.png');

  // ── favicons ──
  const icoParts = [];
  for (const size of FAVICONS) {
    const png = await sharp(logo)
      .resize(size, size, { fit: 'contain', background: BG })
      .png({ compressionLevel: 9 })
      .toBuffer();
    await writeFile(path.join(publicDir, `favicon-${size}.png`), png);
    icoParts.push({ size, data: png });
    written.push(`favicon-${size}.png`);
  }
  await writeFile(path.join(publicDir, 'favicon.ico'), buildIco(icoParts));
  written.push('favicon.ico');

  for (const { name, size } of ICONS) {
    const png = await sharp(logo)
      .resize(size, size, { fit: 'contain', background: BG })
      .png({ compressionLevel: 9 })
      .toBuffer();
    await writeFile(path.join(publicDir, name), png);
    written.push(name);
  }

  logger?.info(`brand assets generated from logo.png: ${written.join(', ')}`);
}

/**
 * robots.txt, written at build time so it always points at the sitemap the
 * sitemap integration actually produced. /portfolio is a redirect to Canva and
 * has nothing to index.
 */
export async function generateRobots({ root, site, logger }) {
  const body = [
    'User-agent: *',
    'Allow: /',
    'Disallow: /portfolio',
    '',
    `Sitemap: ${new URL('sitemap-index.xml', site).href}`,
    '',
  ].join('\n');
  await writeFile(path.join(root, 'public', 'robots.txt'), body);
  logger?.info('robots.txt generated');
}

/**
 * Web app manifest, so the generated icons are actually used when the site is
 * added to a home screen.
 */
export async function generateManifest({ root, logger }) {
  const manifest = {
    name: 'Worldwidewmal',
    short_name: 'WWM',
    description: 'Creator-led content production for brands.',
    start_url: '/',
    display: 'standalone',
    background_color: '#09080a',
    theme_color: '#09080a',
    icons: [
      { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
  };
  await writeFile(
    path.join(root, 'public', 'site.webmanifest'),
    JSON.stringify(manifest, null, 2) + '\n'
  );
  logger?.info('site.webmanifest generated');
}

/** Astro integration wrapper. */
export default function brandAssets(SITE = 'https://worldwidewmal.com') {
  return {
    name: 'worldwidewmal:brand-assets',
    hooks: {
      'astro:build:start': async ({ logger }) => {
        const root = process.cwd();
        await generateBrandAssets({ root, logger });
        await generateRobots({ root, site: SITE, logger });
        await generateManifest({ root, logger });
      },
    },
  };
}
