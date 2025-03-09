// @ts-check
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
  site: 'https://AALAM98mod100.github.io', // Replace with your GitHub username
  base: '/', // If deploying to a custom domain, use '/' otherwise use '/your-repo-name'
  trailingSlash: 'ignore',
  build: {
    // This ensures assets are loaded correctly on GitHub Pages
    assets: '_assets'
  }
});
