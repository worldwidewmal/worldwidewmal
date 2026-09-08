// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import brandAssets from './scripts/brand-assets.mjs';

// Static output. `npm run publish:pages` builds to dist/ and copies the result
// to the repo root, which is what GitHub Pages serves for this domain.
export default defineConfig({
  site: 'https://worldwidewmal.com',
  output: 'static',
  trailingSlash: 'ignore',
  build: { format: 'directory', assets: 'assets/_astro' },
  devToolbar: { enabled: false },
  integrations: [
    // Regenerates the social card and favicons from logo.png on every build.
    brandAssets(),
    sitemap({
      // /portfolio is a redirect to Canva and 404 is an error page; neither
      // belongs in the index.
      filter: (page) => !/\/portfolio\/?$/.test(page) && !/\/404\/?$/.test(page),
      changefreq: 'monthly',
      lastmod: new Date(),
      serialize(item) {
        if (item.url === 'https://worldwidewmal.com/') {
          return { ...item, changefreq: 'monthly', priority: 1.0 };
        }
        return { ...item, priority: 0.6 };
      },
    }),
  ],
});
