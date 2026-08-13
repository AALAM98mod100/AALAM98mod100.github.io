# Handoff: Topics replace categories on ammaralam.me

## Overview

Remove the fixed four-value category system and replace it with five broad **topics**. The home page becomes a plain chronological list of posts. Topics are named at the end of each article and link to generated topic pages. Navigation carries no topic links. There is no filtering UI on the home page and no client-side JavaScript in any of this.

Three decisions drive the design:

1. **Topics are an explicit, validated field — not derived from tags.** Three of the eight posts (Karamazov, Shini Bahar, Vision in my life) carry no tags at all. Anything derived from tags leaves them homeless.
2. **The free-form `tags` array stays in frontmatter and stops being rendered.** It becomes a ranking signal for related posts and nothing else. No tag cleanup is required before shipping.
3. **Browsing by topic is deferred, not undesigned.** At five public posts a filter control is louder than the thing it filters. The control is specified at the end of this document; turn it on at volume.

## About the design files

`Topics handoff.dc.html` in this folder is a **design reference created in HTML** — a prototype showing intended look and structure, not production code to copy. The task is to recreate these designs in the existing Astro codebase using its established patterns: `.astro` components, class-based CSS in `src/styles/`, and the CSS variables already defined in `global.css`.

The mockup frames are drawn with the site's real light-theme token values and real post content so measurements and relationships can be read directly. They use inline styles because of the medium they were authored in. **The build must not use inline styles** — per the repo's own CLAUDE.md, all CSS lives in `src/styles/` and uses variables from `global.css`.

To view: open `Topics handoff.dc.html` in a browser (`support.js` must sit beside it).

## Fidelity

**High fidelity.** Colors, typography, and spacing are taken from the live stylesheet and should be matched. Every value used already exists in the codebase; the design introduces no new design token, no card, no shadow, no border radius, no new type size, and no new font.

The one open visual decision is the list-row date format (see Screen 1).

---

## Current state (what exists today)

| Concern | Today |
|---|---|
| Category enum | `Category` in `src/utils/posts.ts` — `books`, `technology`, `life`, `photography` |
| Frontmatter | `categories: CategoryType[] \| CategoryType` (required), `tags?: string[]` (optional) |
| Nav | `src/components/Navigation.astro` — Resume, Books, Technology, Life, Photography |
| Category pages | `src/pages/books/index.astro`, `technology/index.astro`, `life/index.astro` |
| Home | `src/pages/index.astro` → `PostList.astro`, all public posts, newest first |
| List row | title + category badge on one row, description below, `#tag  #tag` line below that |
| Post header | `BlogPost.astro` — date · read time · category link, then a `.blog-tags` line reading `#book, #review, #thoughts, #bartol, #alamut` |
| Posts | 8 in `src/pages/posts/*.md`, 5 public, 3 `private: true` |

---

## The five topics

| Topic | Slug | Public (+private) | Contains |
|---|---|---|---|
| Books | `books` | 2 | Alamut, The Brothers Karamazov |
| Software Engineering | `software-engineering` | 1 (+1) | Clean architecture in Django; *Everyone should learn statistics* (private) |
| Education | `education` | 1 | Exams should not be timed |
| Music | `music` | 1 | Shini Bahar |
| Photography | `photography` | 0 (+2) | Debevec CRF part 1 (private), The role of Vision on my life (private) |

Per-post assignment:

| Post file | Today | Topic(s) |
|---|---|---|
| `2025-09-29-learnings-from-using-clean-arch-django.md` | technology | Software Engineering |
| `2023-03-26-the-brothers-karamazov.md` | books | Books |
| `2022-09-05-shini-bahar.md` | life | Music |
| `2022-08-01-alamut.md` | books | Books |
| `2016-09-26-why-time.md` | life | Education |
| `2026-08-09-learn-statistics.md` *(private)* | technology | Software Engineering |
| `2023-10-12-debevec-malik-crf-part-1.md` *(private)* | technology | Photography |
| `2022-08-09-vision-in-my-life.md` *(private)* | — | Photography |

Notes:

- **Photography has no public posts.** Keep the enum value; render nothing until one of its posts is published. `/topics/photography/` should not be generated for an empty topic.
- **Photography name collision.** `/topics/photography/` (blog) sits next to `/photography/` (the gallery, unrelated). Survivable, but rename the topic to *Computational Photography* if it reads wrong once the CRF post is public.
- **Growth rule.** A new topic earns existence at **two** posts. Until then a post goes in the nearest existing topic. *Religion & Faith* is the likely sixth; Alamut sits in Books until it has company.
- **Never delete a topic.** A topic that stops growing just stays small. If two must become one, ship a redirect.

## Tag vocabulary

Tags stay exactly as they are and stop being rendered. No cleanup pass is needed — the tags that read badly in a UI (`article`, `series`, `multi-part`, `crf`, `hdri`, `bartol`) are fine as invisible ranking signal.

Current tags by post, for reference:

- Clean architecture in Django — `python, django, clean-architecture, architecture, backend`
- Alamut — `book, review, thoughts, bartol, alamut`
- Exams should not be timed — `thoughts, education`
- Learn statistics *(private)* — `statistics, learning`
- Debevec CRF *(private)* — `article, computational-photography, software, hdr, hdri, crf, multi-part, series`
- Karamazov, Shini Bahar, Vision in my life — **none**

Going forward: tags are optional and free-form. Three or more posts sharing a tag that has no topic is the signal that a new topic is due.

---

## Screens

### Screen 1 — Home (`src/pages/index.astro` + `src/components/PostList.astro`)

**Purpose:** the reader sees the latest writing immediately. Nothing above the list but the existing typewriter heading and intro.

**Layout:** unchanged shell — nav, `.home-content`, typewriter `h1`, intro paragraph, `<hr class="section-divider">`, then the post list. Single column at `--content-width` (800px).

**Post row** — CSS grid, `grid-template-columns: 1fr auto`, `gap: 4px 20px`, `align-items: baseline`, `padding: 20px 0 18px`, `border-bottom: 1px solid var(--border-color)`:

| Element | Grid position | Style |
|---|---|---|
| Title | col 1, row 1 | 21px / line-height 1.3 / `--primary-color` |
| Date | col 2, row 1 | 14px / `--text-light` / `white-space: nowrap` |
| Description | spans both, row 2 | 16px / line-height 1.55 / `--secondary-color` / `max-width: 62ch` |

Whole row remains wrapped in `<a href={post.url}>` as today.

**Changes to `PostList.astro`:**

- Remove the `.post-categories` / `.post-category` span block and the `renderCategories` helper.
- Remove the `.post-tags` line (`{post.frontmatter.tags.map(t => '#'+t).join('  ')}`).
- Add a date in the vacated right-hand slot. `PostList` renders no date today — it will need `formatDate` from `src/utils/date.ts`.
- **Open decision:** the mockup shows a short form (`Sep 2025`) to keep the row narrow. The site's `formatDate` produces the long form (`September 29, 2025`), which is used on post pages. Either is acceptable; short is recommended for the list.

**Content note (not a code change):** `2025-09-29-learnings-from-using-clean-arch-django.md` has a `description` identical to its `title`, so the row renders the same sentence twice. The mockup shows this verbatim and flags it in red. It was tolerable when the category badge shared the row; now the description is the row's only prose. Worth a one-line rewrite in the frontmatter — Ammar's call, no dev work implied.

**Footer:** add a single `All topics` link (`--accent-color`) pointing at `/topics/`, right-aligned opposite the copyright. This is the only browse affordance on the page — without it the topic pages are reachable only from inside articles, which is weak for search and a dead end for anyone landing on one.

**Empty state:** the existing `emptyMessage` prop still applies. There is no filter, so there is no "nothing matched" state anywhere in this design.

---

### Screen 2 — Post page (`src/layouts/BlogPost.astro`)

**Purpose:** the article, then one quiet offer of where to go next.

**Header changes:**

- Keep `.blog-title`, the date, the separator, and `.blog-reading-time` exactly as they are.
- **Remove** the `.blog-categories` block and its `·` separator from `.blog-meta`.
- **Remove** the entire `.blog-tags` block — the tag SVG icon and the `#book, #review, ...` string. Deleted, not relocated.

Result: header meta reads `August 1, 2022 · 12 min`.

**New end matter**, after `.blog-content`, in order:

1. **Posted in** — `border-top: 1px solid var(--border-color)`, `padding-top: 20px`, `display: flex; flex-wrap: wrap; align-items: baseline; gap: 4px 8px`, font-size 16px. Label `Posted in:` in `--text-light`; each topic an `<a>` in `--accent-color` linking to `/topics/<slug>/`. No hashes, no commas, no pills. Title Case names. Usually one topic; two when a post genuinely spans; never three at this size.
2. **More like this** — `margin-top: 30px`, `border-top: 1px solid var(--border-color)`, `padding-top: 20px`. Heading `More like this`, 14.5px, `letter-spacing: 0.03em`, `--text-light`. Then up to three rows using the same grid as Screen 1 at reduced scale (title 19px, date 14px, description 15.5px). No border under the last row.

**Related-post algorithm:**

```
candidates = public posts sharing ≥1 topic with this post, excluding self
rank by: count of shared tags DESC, then pubDate DESC
take 3
if candidates is empty, render nothing (omit the whole block)
```

Tags rank *within* a topic rather than selecting the candidate set. This is deliberate: untagged posts still get neighbours (Alamut → Karamazov, which has no tags), and the two-part CRF series will still pair correctly on `crf` / `multi-part` / `series` without a series field.

---

### Screen 3 — Topic page (`src/pages/topics/[topic].astro`, new)

**Purpose:** every post in one topic, and the way back.

**Layout:** `h1` = topic name (Title Case, 34px). Below it a **hand-written one-line description** — 17px, `--secondary-color`, `max-width: 52ch`. This is authored per topic, not generated; it is the only thing that makes the page feel written rather than queried, and it is what a search visitor lands on.

Then the same post rows as Screen 1, then a single `All posts` link (`--accent-color`) to `/`.

Deliberately **no row of sibling topics** on this page — that reintroduces browsing one level down.

Suggested descriptions (edit freely):

- **Books** — "Two posts. Mostly novels, occasionally the argument a novel is making."
- **Software Engineering** — write from the Django work.
- **Education** — write from the mastery-based-learning argument.
- **Music** — one post; keep it to a sentence.

**`src/pages/topics/index.astro` (new):** same layout, listing the topics that have at least one public post, each with its description and post count.

---

### Screen 4 — Mobile (390px)

No filter row, no panel, no sidebar, so **there is no mobile-specific behaviour to build**. The row grid collapses to a stacked flex column (title, date, description) below the existing 768px breakpoint.

The one thing to verify: `Posted in:` wraps to a second line at 390px. Each topic link needs `display: inline-block` and enough vertical padding to clear a 44px tap target.

---

## Interactions & behavior

- All navigation is plain `<a>` links to static URLs. No JS, no state, no query params, no hash routing.
- Link hover: inherits the global `a:hover` rule (`color: var(--primary-color)`, `transition: var(--transition)`). No new hover treatment.
- Theme toggle, typewriter animation, and photography gallery are untouched.
- Back button is the only "clear filter" affordance needed, because filtering is navigation.

## State management

None. Everything resolves at build time via `import.meta.glob` and `getStaticPaths`.

## Data / schema changes

`src/utils/posts.ts`:

```ts
export enum Topic {
  BOOKS = 'books',
  SOFTWARE_ENGINEERING = 'software-engineering',
  EDUCATION = 'education',
  MUSIC = 'music',
  PHOTOGRAPHY = 'photography'
}
export type TopicType = `${Topic}`;

export interface Frontmatter {
  title: string;
  description?: string;
  pubDate: string | Date;
  image?: string;
  private?: boolean;
  topics: TopicType[] | TopicType;   // was: categories
  tags?: string[];                    // unchanged, no longer rendered
}

export function filterPostsByTopic<T extends { frontmatter: { topics: TopicType[] | TopicType } }>(
  posts: T[], topic: TopicType
): T[]
```

`filterPublicPosts`, `sortPostsByDate`, `parseDate` and `formatDate` are unchanged. Keep the array-or-scalar normalising that `filterPostsByCategory` does today. `import.meta.glob()` must still be called directly in `.astro` files.

Frontmatter migration across all 8 posts: rename `categories:` → `topics:` and set the value per the table above.

## Design tokens

All already defined in `src/styles/global.css`. **No new variables.**

| Role in this design | Variable | Light | Dark |
|---|---|---|---|
| Post title, active topic | `--primary-color` | `#333` | `#e8e6e1` |
| Description text | `--secondary-color` | `#555` | `#b0aaa0` |
| Topic links, All topics, All posts | `--accent-color` | `#0077cc` | `#5aabff` |
| Dates, `Posted in:`, `More like this` | `--text-light` | `#777` | `#8a8a8e` |
| Row rules, section rules | `--border-color` | `#eaeaea` | `#3a3a3c` |
| Page background | `--background-color` | `#ffffff` | `#1c1c1e` |
| Column width | `--content-width` | `800px` | — |

**Typography:** one family throughout — `'Charter', 'Bitstream Charter', 'Sitka Text', Cambria, 'Times New Roman', Times, serif`. Montserrat and Cormorant Garamond are photography-only and are not used here.

Sizes used: 34px page/post titles · 21px list titles · 19px related titles · 17px topic description · 16px body + Posted in · 15.5px related description · 14.5px More like this · 14px dates.

**Accessibility fix worth making:** `--text-light: #777` is 4.48:1 on white — marginally under WCAG AA for body text, and this design puts dates and the `Posted in:` label on it. `#6f6f6f` is 4.9:1 and visually identical. The dark value `#8a8a8e` already passes.

**Not used:** `--shadow`, `--light-background`, border radius, any card treatment.

## New CSS classes

Add to `src/styles/components.css`: `.post-date` (a rule with this name already exists but is unused by `PostList`), `.posted-in`, `.more-like-this`. Remove or stop using `.post-categories`, `.post-tags` (list) and `.blog-tags` (post) once the markup is gone.

## Files touched

| File | Change |
|---|---|
| `src/utils/posts.ts` | `Category` → `Topic`, `filterPostsByCategory` → `filterPostsByTopic`, `Frontmatter.categories` → `topics` |
| `src/components/PostList.astro` | Remove badges + tag line, add date |
| `src/components/Navigation.astro` | Remove Books / Technology / Life items |
| `src/layouts/BlogPost.astro` | Remove category link + `.blog-tags`; add Posted in and More like this |
| `src/layouts/MarkdownPostLayout.astro` | Pass `topics` instead of `categories` |
| `src/pages/topics/[topic].astro` | **New** — `getStaticPaths` over topics with ≥1 public post |
| `src/pages/topics/index.astro` | **New** |
| `src/pages/posts/*.md` (8 files) | `categories:` → `topics:` |
| `src/pages/books/`, `technology/`, `life/` | **Delete**, redirect to `/topics/` |
| `src/styles/components.css`, `blog.css` | Add the three classes above, retire the removed ones |

Trailing slashes should follow whatever `astro.config.mjs` already sets.

## Deferred: the topic line

Designed, specified, not built now.

A single wrapping line of topic links with counts, placed under the intro on the home page and above the heading on topic pages. All links in `--accent-color`; on a topic page the current one drops to `--primary-color` and is not a link. Counts at 13px in `--text-light`. `display: flex; flex-wrap: wrap; gap: 6px 22px`, 16px.

Only topics with at least one public post appear, matching the topic-page rule — so this line has four entries today, not five.

Turn it on when:

1. **One topic passes five posts** — add it to that topic page only, so a reader can move sideways.
2. **The home list stops being scannable, around 25 posts** — add it under the intro.
3. **Past eight topics** — replace the line with a single `by topic` disclosure that opens the list. A row of links that long is the failure mode; at 30 topics it pushes the writing below the fold on mobile.

## Assets

None. No images, icons, or fonts are added. Two existing inline SVG icons are removed (the category-adjacent tag icon in `BlogPost.astro`); the calendar and clock icons in `.blog-meta` stay.

## Files in this bundle

- `Topics handoff.dc.html` — the design reference (4 screens + specification)
- `support.js` — runtime required to open the HTML file locally
