// @ts-check
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
  site: 'https://www.ammaralam.me',
  trailingSlash: 'ignore',
  // Removed redirects as they're no longer needed with 'ignore' setting
});
