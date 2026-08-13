# CLAUDE.md

## Project Overview

Personal website/blog for Ammar Alam, built with **Astro 7** and deployed to GitHub Pages at [www.ammaralam.me](https://www.ammaralam.me).

## Commands

- `npm run dev` — Local dev server at localhost:4321
- `npm run build` — Production build to `./dist/`
- `npm run preview` — Preview production build locally
- `npm run upload-photo --file=<filename>` — Upload JPEG to R2 and immediately trigger the processing workflow (requires `wrangler` auth + `gh` CLI auth)
- `npm run process-photos` — Run the photo processing pipeline locally (requires R2 env vars)
- `npm run seed-manifest` — One-time migration: seeds manifest.json on R2 from existing photo-metadata.json (requires `wrangler` auth)
- `npm run generate-thumbs` — DEPRECATED. Use `upload-photo` instead.

## Architecture

### Layout hierarchy

```
Layout.astro → BaseLayout.astro → Pages / BlogPost.astro
                                         ↑ MarkdownPostLayout.astro ← .md posts
```

- `Layout.astro` — Root HTML shell, imports all styles from `src/styles/index.js`
- `BaseLayout.astro` — Adds navigation + footer
- `BlogPost.astro` — Blog post page wrapper
- `MarkdownPostLayout.astro` — Adapter mapping markdown frontmatter to BlogPost
- `PhotographyLayout.astro` / `MasonryLayout.astro` — Photography-specific layouts

### Blog posts

- All posts live in `src/pages/posts/*.md`
- Categories defined in `src/utils/posts.ts` as the `Category` enum: `books`, `technology`, `life`, `photography`
- Frontmatter requires `title`, `pubDate` (YYYY-MM-DD), and `categories` (string or array)
- Optional frontmatter: `description`, `image`, `private`
- Posts marked `private: true` are hidden from listings but accessible via direct URL
- `import.meta.glob()` must be called in `.astro` files directly (cannot be abstracted to utility)

### Styles

All CSS is centralized in `src/styles/` and imported via `src/styles/index.js` in Layout.astro:

- `global.css` — Variables (`--primary-color`, `--content-width`, `--shadow`), reset, typography
- `layout.css` — Header, footer, navigation
- `components.css` — Reusable component styles
- `blog.css` — Blog post styling
- `photography.css` — Photography page styling

Do not use inline styles. Use CSS variables from `global.css` for theming consistency.

### Key utilities

- `src/utils/posts.ts` — `filterPublicPosts()`, `sortPostsByDate()`, `filterPostsByCategory()`, `Frontmatter` interface
- `src/utils/date.ts` — `parseDate()` and date formatting

## Adding content

### New blog post

Create `src/pages/posts/my-post.md` with frontmatter:

```md
---
layout: ../../layouts/MarkdownPostLayout.astro
title: "Post Title"
pubDate: 2025-01-15
categories: ["technology"]
---
```

### New category

1. Add to `Category` enum in `src/utils/posts.ts`
2. Create `src/pages/newcategory/index.astro`
3. Update `src/components/Navigation.astro`

### Photography images

- All images hosted on Cloudflare R2 (bucket: `ammaralam-me`) at `https://cdn.ammaralam.me/photography/`
- Full-resolution originals served in LightGallery modal on click
- Optimized WebP thumbnails served in the gallery grid from `photography/thumbs/`
- Hero background uses an optimized 1920px WebP at `photography/light_beam-optimized.webp`
- Image registry is `photography/manifest.json` on R2 (fetched client-side by `MasonryLayout.astro`)
- `src/data/photo-metadata.json` is deleted — manifest.json on R2 is the single source of truth

### Adding new photos

Images are **never committed to the repo**. All photography is served from Cloudflare R2 CDN. No code edits are required to add photos.

**Quick (immediate):**
```
npm run upload-photo --file=my-photo.jpg
```
Uploads the JPEG to R2 and immediately triggers the GitHub Actions processing workflow. The image appears in the gallery after the workflow completes (~2 min).

**Batch (automated):**
1. Upload JPEG(s) to R2 directly via `wrangler r2 object put ammaralam-me/photography/<filename> --file=<filename>` or the Cloudflare Dashboard
2. The daily GitHub Actions workflow (runs at 2am UTC) will detect and process new images automatically

**How processing works (`scripts/process-new-photos.js`):**
- Lists R2 `photography/` prefix, compares against `manifest.json`
- Downloads new JPEGs, extracts EXIF, generates WebP thumbnails
- Uploads thumbnails to `photography/thumbs/`
- Updates `photography/manifest.json` on R2

**Required GitHub Secrets** (set once in repo Settings > Secrets):
- `CLOUDFLARE_ACCOUNT_ID`
- `R2_ACCESS_KEY_ID` (R2-specific API token, not global API key)
- `R2_SECRET_ACCESS_KEY`

**R2 CORS** must be configured on the `ammaralam-me` bucket to allow `fetch()` from `www.ammaralam.me`:
```
wrangler r2 bucket cors put ammaralam-me --rules='[{"AllowedOrigins":["https://www.ammaralam.me","https://ammaralam.me","http://localhost:4321"],"AllowedMethods":["GET"],"AllowedHeaders":["*"]}]'
```

## Configuration

- `astro.config.mjs` — Site URL, trailing slash, build settings
- Deployed via GitHub Pages with custom domain

## Documentation Lookup

Always use the Context7 MCP server when you need library/API documentation, code examples, setup or configuration steps — without me having to explicitly ask. This applies to any library or framework referenced in the project (Astro, LightGallery, Cloudflare, etc.).
