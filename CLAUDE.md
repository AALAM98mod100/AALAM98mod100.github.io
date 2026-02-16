# CLAUDE.md

## Project Overview

Personal website/blog for Ammar Alam, built with **Astro 5** and deployed to GitHub Pages at [www.ammaralam.me](https://www.ammaralam.me).

## Commands

- `npm run dev` — Local dev server at localhost:4321
- `npm run build` — Production build to `./dist/`
- `npm run preview` — Preview production build locally
- `npm run generate-thumbs` — Generate WebP thumbnails and upload to R2 (requires `wrangler` auth)

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
- Optimized 800px WebP thumbnails served in the gallery grid from `photography/thumbs/`
- Hero background uses an optimized 1920px WebP at `photography/light_beam-optimized.webp`
- `MasonryLayout.astro` uses `srcThumb` (not `thumb`) for the astro-lightgallery component
- Image filenames are listed in the `imageFilenames` array in `src/layouts/MasonryLayout.astro`

### Adding new photos

Images are **never committed to the repo** — `public/images/` is gitignored. All photography is served from Cloudflare R2 CDN.

1. Place original JPEGs in `public/images/`
2. Run `npm run generate-thumbs` — generates 800px WebP thumbnails and uploads both originals + thumbnails to R2 (requires `wrangler` auth)
3. Add filenames to the `imageFilenames` array in `src/layouts/MasonryLayout.astro`

## Configuration

- `astro.config.mjs` — Site URL, trailing slash, build settings
- Deployed via GitHub Pages with custom domain

## Documentation Lookup

Always use the Context7 MCP server when you need library/API documentation, code examples, setup or configuration steps — without me having to explicitly ask. This applies to any library or framework referenced in the project (Astro, LightGallery, Cloudflare, etc.).
