# CLAUDE.md

## Project Overview

Personal website/blog for Ammar Alam, built with **Astro 5** and deployed to GitHub Pages at [www.ammaralam.me](https://www.ammaralam.me).

## Commands

- `npm run dev` — Local dev server at localhost:4321
- `npm run build` — Production build to `./dist/`
- `npm run preview` — Preview production build locally

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

## Configuration

- `astro.config.mjs` — Site URL, trailing slash, build settings
- Deployed via GitHub Pages with custom domain
- Photography images hosted on Cloudflare R2
