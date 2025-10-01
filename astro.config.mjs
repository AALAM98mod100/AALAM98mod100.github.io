// @ts-check
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
  site: 'https://www.ammaralam.me', // Updated to match your custom domain
  base: '/', // Correct for custom domain
  trailingSlash: 'ignore',
  build: {
    // This ensures assets are loaded correctly on GitHub Pages
    assets: '_assets'
  }
});
