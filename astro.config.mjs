// @ts-check
import { defineConfig } from 'astro/config';

// Static output. `npm run publish:pages` builds to dist/ and copies the result
// to the repo root, which is what GitHub Pages serves for this domain.
export default defineConfig({
  site: 'https://worldwidewmal.com',
  output: 'static',
  trailingSlash: 'ignore',
  build: { format: 'directory', assets: 'assets/_astro' },
  devToolbar: { enabled: false }
});
