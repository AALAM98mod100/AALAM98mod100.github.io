# Topics Replace Categories — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the fixed four-value `Category` system with three broad `Topic` values, generate static topic pages, and redesign the post list row and post end matter as specified in the design handoff.

**Architecture:** Everything resolves at build time. `src/utils/posts.ts` holds the `Topic` enum, the per-topic display names, and the pure filter and ranking functions. `import.meta.glob` stays in `.astro` files. `PostList.astro` becomes the single row renderer, reused by the home page, the topic pages, and the "More like this" block through a `variant` prop. No client-side JavaScript is added.

**Tech Stack:** Astro 7, plain CSS in `src/styles/`, TypeScript, markdown posts in `src/pages/posts/`.

**Spec:** `docs/superpowers/specs/2026-08-12-topics-replace-categories-design.md`. The visual reference is `docs/superpowers/specs/2026-08-12-topics-replace-categories-mockup.html` (open it in a browser; it needs `support.js` from the original handoff folder beside it).

## Global Constraints

- **No inline styles.** All CSS lives in `src/styles/` and uses the variables in `global.css`. This is a repo rule from `CLAUDE.md`.
- **No new design tokens.** No new CSS variable, no card, no shadow, no border radius, no new type size, no new font.
- **No client-side JavaScript** in any part of this feature. All navigation is plain `<a>` links to static URLs.
- **One font family throughout:** `'Charter', 'Bitstream Charter', 'Sitka Text', Cambria, 'Times New Roman', Times, serif`. Montserrat and Cormorant Garamond are photography-only.
- **`import.meta.glob()` must be called directly in `.astro` files.** It cannot be moved into `src/utils/`.
- **The repo has no test framework and no devDependencies.** Verification for every task is `npm run build` followed by `grep` over the generated `dist/` HTML. Do not add a test runner.
- **Topic slugs are exactly:** `books`, `engineering`, `reflections`.
- **Topic display names are Title Case:** Books, Engineering, Reflections.
- **A topic page is generated only when the topic has at least one public post.** All three topics qualify today, so all three pages generate. Keep the rule anyway — it stops an empty page appearing the moment a topic is added.
- **Photography is not a blog topic.** `/photography/` is the gallery and stays as it is. No post is filed under a photography topic.

## Decisions already made (do not re-open)

| Question | Decision |
|---|---|
| Old category URLs | Delete the pages, add static redirects |
| List row date format | Short form, `Sep 2025` |
| `--text-light` contrast | Change `#777` to `#6f6f6f` |

---

## File Structure

| File | Responsibility | Change |
|---|---|---|
| `src/utils/posts.ts` | Topic enum, display names, pure filter and ranking functions | Modify |
| `src/utils/date.ts` | Date parsing and formatting | Modify — add `formatShortDate`, pin both formatters to UTC |
| `src/components/PostList.astro` | The one post-row renderer, in two sizes | Modify — full markup rewrite |
| `src/components/Navigation.astro` | Top navigation links | Modify — drop three links |
| `src/layouts/BlogPost.astro` | Post page shell, header meta, end matter | Modify |
| `src/layouts/MarkdownPostLayout.astro` | Frontmatter-to-BlogPost adapter | Modify — pass `topics` and `url` |
| `src/layouts/BaseLayout.astro` | Nav and footer shell | Modify — add footer link |
| `src/pages/topics/index.astro` | Lists every topic that has public posts | **Create** |
| `src/pages/topics/[topic].astro` | One topic, all its public posts | **Create** |
| `src/pages/posts/*.md` (8 files) | Content | Modify — `categories:` becomes `topics:` |
| `src/pages/books/`, `technology/`, `life/` | Old category pages | **Delete** |
| `astro.config.mjs` | Site config | Modify — add `redirects` |
| `src/styles/components.css` | Post row styles | Modify — replace card rules with row rules |
| `src/styles/blog.css` | Post page styles | Modify — drop tag rules, add end-matter rules |
| `src/styles/global.css` | Design tokens | Modify — one token value |
| `src/styles/layout.css` | Header and footer | Modify — footer becomes two-column |

---

## Task 1: Topic data model, date helper, and content migration

Renames the concept everywhere and migrates all eight posts. After this task the site builds and reads correctly, but has no topic UI yet: category badges, category links, and the rendered tag lines are gone, and nothing replaces them. That is intentional — the UI arrives in Tasks 2, 3 and 5.

**Files:**
- Modify: `src/utils/posts.ts` (whole file)
- Modify: `src/utils/date.ts:4-19` (add `formatShortDate`, pin to UTC)
- Modify: `src/components/PostList.astro:1-54`
- Modify: `src/components/Navigation.astro:2-8`
- Modify: `src/layouts/BlogPost.astro:1-105`
- Modify: `src/layouts/MarkdownPostLayout.astro:9-20`
- Modify: all 8 files in `src/pages/posts/*.md` (frontmatter only)
- Delete: `src/pages/books/index.astro`, `src/pages/technology/index.astro`, `src/pages/life/index.astro` (and the now-empty directories)

**Interfaces:**
- Consumes: nothing from earlier tasks.
- Produces, from `src/utils/posts.ts`:
  - `enum Topic { BOOKS = 'books', ENGINEERING = 'engineering', REFLECTIONS = 'reflections' }`
  - `type TopicType = \`${Topic}\``
  - `const TOPIC_NAMES: Record<TopicType, string>` — the Title Case display name for each slug
  - `interface Frontmatter` — `categories` replaced by `topics: TopicType[] | TopicType`
  - `function getPostTopics(frontmatter: { topics: TopicType[] | TopicType }): TopicType[]`
  - `function filterPostsByTopic<T extends { frontmatter: { topics: TopicType[] | TopicType } }>(posts: T[], topic: TopicType): T[]`
  - `function getRelatedPosts<T extends { url?: string | undefined; frontmatter: Frontmatter }>(allPosts: T[], currentUrl: string, currentTopics: TopicType[], currentTags: string[], limit?: number): T[]`
  - `filterPublicPosts` and `sortPostsByDate` are unchanged.
- Produces, from `src/utils/date.ts`:
  - `function formatShortDate(dateString: string | Date): string` — returns `"Sep 2025"`

- [ ] **Step 1: Rewrite `src/utils/posts.ts`**

Replace the entire file with:

```ts
import { parseDate } from './date';

/**
 * Enum of valid post topics
 */
export enum Topic {
  BOOKS = 'books',
  ENGINEERING = 'engineering',
  REFLECTIONS = 'reflections'
}

/**
 * Type for topic values
 */
export type TopicType = `${Topic}`;

/**
 * Title Case display name for each topic slug.
 * A slug is lowercase and hyphenated; this map is what a reader sees.
 */
export const TOPIC_NAMES: Record<TopicType, string> = {
  [Topic.BOOKS]: 'Books',
  [Topic.ENGINEERING]: 'Engineering',
  [Topic.REFLECTIONS]: 'Reflections'
};

/**
 * Post frontmatter type definition
 */
export interface Frontmatter {
  title: string;
  description?: string;
  pubDate: string | Date;
  updatedDate?: string | Date;
  image?: string;
  private?: boolean;
  topics: TopicType[] | TopicType;
  /** Free-form. Kept as a ranking signal for related posts. Never rendered. */
  tags?: string[];
}

/**
 * Normalises the topics field, which may be a single value or an array
 */
export function getPostTopics(frontmatter: { topics: TopicType[] | TopicType }): TopicType[] {
  const { topics } = frontmatter;
  if (!topics) return [];
  return Array.isArray(topics) ? topics : [topics];
}

/**
 * Filters out private posts
 */
export function filterPublicPosts<T extends { frontmatter: { private?: boolean } }>(
  posts: T[]
): T[] {
  return posts.filter(post => !post.frontmatter.private);
}

/**
 * Sorts posts by date, most recent first
 * Uses the centralized date parsing utility for consistent handling
 */
export function sortPostsByDate<T extends { frontmatter: { pubDate: string | Date } }>(
  posts: T[]
): T[] {
  return [...posts].sort((a, b) => {
    const dateA = parseDate(a.frontmatter.pubDate) || new Date(0);
    const dateB = parseDate(b.frontmatter.pubDate) || new Date(0);
    return dateB.getTime() - dateA.getTime();
  });
}

/**
 * Filters posts by topic
 */
export function filterPostsByTopic<T extends { frontmatter: { topics: TopicType[] | TopicType } }>(
  posts: T[],
  topic: TopicType
): T[] {
  return posts.filter(post => getPostTopics(post.frontmatter).includes(topic));
}

/**
 * Finds related posts for a given post.
 *
 * Candidates are public posts that share at least one topic. Tags rank within
 * that set rather than selecting it, so an untagged post still gets neighbours.
 */
export function getRelatedPosts<T extends { url?: string | undefined; frontmatter: Frontmatter }>(
  allPosts: T[],
  currentUrl: string,
  currentTopics: TopicType[],
  currentTags: string[],
  limit = 3
): T[] {
  const tagSet = new Set(currentTags);

  const candidates = filterPublicPosts(allPosts).filter(post => {
    if (post.url === currentUrl) return false;
    return getPostTopics(post.frontmatter).some(topic => currentTopics.includes(topic));
  });

  const sharedTagCount = (post: T) =>
    (post.frontmatter.tags ?? []).filter(tag => tagSet.has(tag)).length;

  return [...candidates]
    .sort((a, b) => {
      const diff = sharedTagCount(b) - sharedTagCount(a);
      if (diff !== 0) return diff;
      const dateA = parseDate(a.frontmatter.pubDate) || new Date(0);
      const dateB = parseDate(b.frontmatter.pubDate) || new Date(0);
      return dateB.getTime() - dateA.getTime();
    })
    .slice(0, limit);
}

// Note: The loadPosts function is intentionally not implemented because
// import.meta.glob() needs to be called directly in the .astro file.
// It cannot be imported from a utility file.
```

- [ ] **Step 2: Add `formatShortDate` and pin both formatters to UTC in `src/utils/date.ts`**

`pubDate` values such as `2022-08-01` parse as UTC midnight. Formatting them in a timezone behind UTC shifts them back one day, which turns `Aug 2022` into `Jul 2022`. Production builds run in UTC so this bug is invisible today, but the dev server on a US machine shows the wrong month. Add `timeZone: 'UTC'` to both formatters.

Replace `formatDate` and add `formatShortDate` above `parseDate`:

```ts
/**
 * Safely formats a date string or Date object to a readable format
 * Dates are formatted in UTC so that a bare YYYY-MM-DD never shifts a day
 */
export function formatDate(dateString: string | Date): string {
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return "Unknown date";
    }
    return date.toLocaleDateString('en-us', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      timeZone: 'UTC',
    });
  } catch (e) {
    console.error(`Error formatting date: ${dateString}`, e);
    return "Unknown date";
  }
}

/**
 * Formats a date as a short month and year, for example "Sep 2025"
 * Used in post list rows, where a narrow right-hand column keeps titles wide
 */
export function formatShortDate(dateString: string | Date): string {
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return "Unknown date";
    }
    return date.toLocaleDateString('en-us', {
      year: 'numeric',
      month: 'short',
      timeZone: 'UTC',
    });
  } catch (e) {
    console.error(`Error formatting date: ${dateString}`, e);
    return "Unknown date";
  }
}
```

- [ ] **Step 3: Migrate the frontmatter of all eight posts**

Edit each file's frontmatter. Change the key and the value together. Leave `tags`, `image`, `private`, `description` and everything else untouched.

| File | Replace this line | With this line |
|---|---|---|
| `src/pages/posts/2016-09-26-why-time.md` | `categories: ["life"]` | `topics: ["reflections"]` |
| `src/pages/posts/2022-08-01-alamut.md` | `categories: ["books"]` | `topics: ["books"]` |
| `src/pages/posts/2022-08-09-vision-in-my-life.md` | `category: life` | `topics: ["reflections"]` |
| `src/pages/posts/2022-09-05-shini-bahar.md` | `categories: ["life"]` | `topics: ["reflections"]` |
| `src/pages/posts/2023-03-26-the-brothers-karamazov.md` | `categories: ["books"]` | `topics: ["books"]` |
| `src/pages/posts/2023-10-12-debevec-malik-crf-part-1.md` | `categories: ["technology"]` | `topics: ["engineering"]` |
| `src/pages/posts/2025-09-29-learnings-from-using-clean-arch-django.md` | `categories: ["technology"]` | `topics: ["engineering"]` |
| `src/pages/posts/2026-08-09-learn-statistics.md` | `categories: ["technology"]` | `topics: ["engineering"]` |

Note that `2022-08-09-vision-in-my-life.md` uses the singular key `category:` with an unquoted value. It is the odd one out. It has no topic today and is assigned Reflections.

The result is three topics, each holding at least two posts:

| Topic | Posts | Public |
|---|---|---|
| Books | Alamut, The Brothers Karamazov | 2 |
| Engineering | Django architecture, Statistics *(private)*, Debevec CRF *(private)* | 1 |
| Reflections | Exams should not be timed, Shini Bahar, Vision in my life *(private)* | 2 |

- [ ] **Step 4: Verify no post still carries a category key**

Run:

```bash
grep -rn "^categories:\|^category:" src/pages/posts/
```

Expected: no output.

Run:

```bash
grep -c "^topics:" src/pages/posts/*.md
```

Expected: every file reports `1`.

- [ ] **Step 5: Delete the three category pages**

```bash
rm -rf src/pages/books src/pages/technology src/pages/life
```

- [ ] **Step 6: Trim the navigation**

In `src/components/Navigation.astro`, replace the `navItems` array:

```ts
const navItems = [
  { title: 'Resume', path: 'https://cdn.ammaralam.me/resume.pdf' },
  { title: 'Photography', path: '/photography/' },
];
```

Leave the rest of the file, including the theme toggle and its script, exactly as it is.

- [ ] **Step 7: Strip categories and tags out of `PostList.astro`**

Replace the whole file. The markup is a temporary shape; Task 2 rewrites it into the final grid row. This step only removes the category badge, the tag line, and the dead `CategoryType` import so the build passes.

```astro
---
import type { MarkdownInstance } from 'astro';
import type { Frontmatter } from '../utils/posts';

interface Props {
  posts: MarkdownInstance<Frontmatter>[];
  emptyMessage?: string;
}

const {
  posts,
  emptyMessage = "No posts available yet. Check back soon!"
} = Astro.props;
---

<div class="posts-list">
  {posts.length > 0 ? (
    posts.map((post) => (
      <div class="post-card">
        <a href={post.url}>
          <div class="post-details">
            <div class="post-title-row">
              <h2>{post.frontmatter.title}</h2>
            </div>
            {post.frontmatter.description && (
              <p class="post-description">{post.frontmatter.description}</p>
            )}
          </div>
        </a>
      </div>
    ))
  ) : (
    <div class="no-posts-message">
      <p>{emptyMessage}</p>
    </div>
  )}
</div>
```

- [ ] **Step 8: Rename the prop and remove the category and tag blocks in `BlogPost.astro`**

Four edits to `src/layouts/BlogPost.astro`:

1. Change the import on line 3 from `CategoryType` to `TopicType`, and add `getPostTopics`:

```ts
import type { TopicType } from '../utils/posts';
import { getPostTopics } from '../utils/posts';
```

2. In `interface Props`, replace `categories: CategoryType[] | CategoryType;` with:

```ts
  topics: TopicType[] | TopicType;
  url?: string;
```

3. In the destructuring block, replace `categories,` with `topics,` and add `url,`. Then replace the `// Process categories` line and `const categoryArray = ...` with:

```ts
const topicList = getPostTopics({ topics });
```

4. Delete two blocks from the markup. First, the separator and category list — remove these six lines in full:

```astro
        <span class="blog-meta-separator">&middot;</span>
        <div class="blog-categories">
          {categoryArray.map(category => (
            <a href={`/${category}/`} class="post-category">{category}</a>
          ))}
        </div>
```

Second, the entire `.blog-tags` block, including the inline tag SVG:

```astro
      {tags && tags.length > 0 && (
        <div class="blog-tags">
          <svg ...></svg>
          {tags.map(t => `#${t}`).join(', ')}
        </div>
      )}
```

Keep the `tags` prop in the interface and the destructuring. Task 5 uses it to rank related posts.

The header meta should now end with the reading time, reading `August 1, 2022 · 12 min`.

- [ ] **Step 9: Pass `topics` and `url` in `MarkdownPostLayout.astro`**

Astro gives a markdown layout a `url` prop. Forward it so `BlogPost` can exclude the current post from its own related list in Task 5.

```astro
---
import BlogPost from './BlogPost.astro';
const { frontmatter, rawContent, url } = Astro.props;

const wordCount = rawContent().split(/\s+/).filter(Boolean).length;
const readingTime = Math.ceil(wordCount / 200);
---

<BlogPost
  title={frontmatter.title}
  description={frontmatter.description}
  pubDate={frontmatter.pubDate}
  updatedDate={frontmatter.updatedDate}
  topics={frontmatter.topics}
  private={frontmatter.private}
  tags={frontmatter.tags}
  readingTime={readingTime}
  url={url}
>
  <slot />
</BlogPost>
```

- [ ] **Step 10: Build and verify the removal**

Run:

```bash
npm run build
```

Expected: the build succeeds with no TypeScript error.

Run:

```bash
grep -rl "post-category\|blog-tags\|blog-categories" dist/ || echo "CLEAN"
```

Expected: `CLEAN`.

```bash
ls dist/books dist/technology dist/life 2>&1
```

Expected: three "No such file or directory" errors.

```bash
grep -o "Aug 2022\|August 1, 2022" dist/posts/2022-08-01-alamut/index.html | head -1
```

Expected: `August 1, 2022` — confirms the UTC pin did not shift the day.

- [ ] **Step 11: Commit**

```bash
git add src/utils/posts.ts src/utils/date.ts src/components/PostList.astro \
  src/components/Navigation.astro src/layouts/BlogPost.astro \
  src/layouts/MarkdownPostLayout.astro src/pages/posts/
git add -A src/pages/books src/pages/technology src/pages/life
git commit -m "refactor: replace post categories with topics

Rename the Category enum to Topic with three values, migrate all eight
posts, and remove the category pages, nav links, badges and rendered
tag lines. Tags stay in frontmatter as a ranking signal only."
```

---

## Task 2: Redesign the post row

Turns the bordered card into the flat grid row from Screen 1, and adds the date the category badge used to sit next to. A `variant` prop gives the smaller size that Task 5 needs for "More like this", so there is only ever one row renderer.

**Files:**
- Modify: `src/components/PostList.astro` (whole file)
- Modify: `src/styles/components.css:1-94` and `:146-155`

**Interfaces:**
- Consumes: `formatShortDate` from `src/utils/date.ts` and `Frontmatter` from `src/utils/posts.ts` (Task 1).
- Produces: `PostList` accepts `posts`, `emptyMessage?`, and `variant?: 'default' | 'compact'`. CSS classes `.posts-list`, `.posts-list--compact`, `.post-row`, `.post-row-title`, `.post-row-date`, `.post-row-description`.

- [ ] **Step 1: Rewrite `src/components/PostList.astro`**

```astro
---
import type { MarkdownInstance } from 'astro';
import type { Frontmatter } from '../utils/posts';
import { formatShortDate } from '../utils/date';

interface Props {
  posts: MarkdownInstance<Frontmatter>[];
  emptyMessage?: string;
  /** 'compact' is the reduced scale used by the related-posts block */
  variant?: 'default' | 'compact';
}

const {
  posts,
  emptyMessage = "No posts available yet. Check back soon!",
  variant = 'default'
} = Astro.props;

function isoDate(value: string | Date): string {
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return value;
  }
  const date = new Date(value);
  return isNaN(date.getTime()) ? '' : date.toISOString().slice(0, 10);
}
---

<div class:list={['posts-list', variant === 'compact' && 'posts-list--compact']}>
  {posts.length > 0 ? (
    posts.map((post) => (
      <a class="post-row" href={post.url}>
        <h2 class="post-row-title">{post.frontmatter.title}</h2>
        <time class="post-row-date" datetime={isoDate(post.frontmatter.pubDate)}>
          {formatShortDate(post.frontmatter.pubDate)}
        </time>
        {post.frontmatter.description && (
          <p class="post-row-description">{post.frontmatter.description}</p>
        )}
      </a>
    ))
  ) : (
    <div class="no-posts-message">
      <p>{emptyMessage}</p>
    </div>
  )}
</div>
```

Note the `<h2>` inside an `<a>`. That is valid HTML — a heading is flow content and `<a>` may wrap flow content.

- [ ] **Step 2: Replace the post card CSS in `src/styles/components.css`**

Delete lines 3 to 94 — everything from the `/* Post List */` comment through the `.post-description` rule, which covers `.posts-list`, `.no-posts-message`, `.post-card`, `.post-card:hover`, `.post-card a`, `.post-image`, `.post-details`, `.post-details h2`, `.post-title-row`, `.post-title-row h2`, `.post-date`, `.post-categories`, `.post-category`, `.post-tags` and `.post-description`. Put this in their place:

```css
/* Post List */
.posts-list {
  margin-top: 2rem;
}

.no-posts-message {
  padding: 2rem 0;
  color: var(--text-light);
}

/* Post Row */
.post-row {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 4px 20px;
  align-items: baseline;
  padding: 20px 0 18px;
  border-bottom: 1px solid var(--border-color);
  text-decoration: none;
  color: inherit;
}

.post-row-title {
  margin: 0;
  font-size: 21px;
  line-height: 1.3;
  color: var(--primary-color);
  transition: var(--transition);
}

.post-row:hover .post-row-title {
  color: var(--accent-color);
}

.post-row-date {
  font-size: 14px;
  color: var(--text-light);
  white-space: nowrap;
}

.post-row-description {
  grid-column: 1 / -1;
  margin: 0;
  font-size: 16px;
  line-height: 1.55;
  max-width: 62ch;
  color: var(--secondary-color);
}

/* Compact rows, used by the related-posts block */
.posts-list--compact {
  margin-top: 0;
}

.posts-list--compact .post-row-title {
  font-size: 19px;
}

.posts-list--compact .post-row-description {
  font-size: 15.5px;
}

.posts-list--compact .post-row:last-child {
  border-bottom: none;
}
```

- [ ] **Step 3: Replace the responsive block at the end of `src/styles/components.css`**

The old block styles `.post-card a` and `.post-image`, which no longer exist. Replace the whole `@media (max-width: 768px)` block with:

```css
/* Responsive Adjustments */
@media (max-width: 768px) {
  .post-row {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .post-row-description {
    max-width: none;
  }
}
```

- [ ] **Step 4: Build and verify the row**

```bash
npm run build
```

Expected: success.

```bash
grep -o 'class="post-row"' dist/index.html | wc -l
```

Expected: `5` — the five public posts.

```bash
grep -o "Sep 2025\|Mar 2023\|Sep 2022\|Aug 2022\|Sep 2016" dist/index.html | sort -u
```

Expected: all five short dates, one per line. `Sep 2016` confirms the 2016 post, `Aug 2022` confirms Alamut did not shift to July.

```bash
grep -c "post-card\|post-image\|post-title-row" dist/index.html || echo "CLEAN"
```

Expected: `CLEAN`.

- [ ] **Step 5: Look at the page**

Run `npm run dev` and open `http://localhost:4321/`. Compare against Screen 1 in the mockup. Check both themes with the toggle. Then narrow the window below 768px and confirm the row stacks to title, date, description. Stop the dev server.

- [ ] **Step 6: Commit**

```bash
git add src/components/PostList.astro src/styles/components.css
git commit -m "feat: replace post cards with flat grid rows and short dates"
```

---

## Task 3: Topic pages

Adds `/topics/` and `/topics/<slug>/`. Both reuse `PostList`.

**Files:**
- Create: `src/pages/topics/index.astro`
- Create: `src/pages/topics/[topic].astro`
- Modify: `src/styles/components.css` (append)

**Interfaces:**
- Consumes: `Topic`, `TopicType`, `TOPIC_NAMES`, `filterPublicPosts`, `filterPostsByTopic`, `sortPostsByDate` from `src/utils/posts.ts`; `PostList` from Task 2.
- Produces: routes `/topics/` and `/topics/<slug>/` for every topic with at least one public post. CSS classes `.topic-index-list`, `.topic-index-item`, `.topic-index-count`, `.back-link`.

Neither page carries a topic description. A topic page is an `h1`, the post rows, and the way back. The topics index is a list of names with counts.

- [ ] **Step 1: Create `src/pages/topics/[topic].astro`**

```astro
---
import type { MarkdownInstance } from 'astro';
import BaseLayout from '../../layouts/BaseLayout.astro';
import PostList from '../../components/PostList.astro';
import type { Frontmatter, TopicType } from '../../utils/posts';
import {
  Topic,
  TOPIC_NAMES,
  filterPublicPosts,
  filterPostsByTopic,
  sortPostsByDate
} from '../../utils/posts';

export async function getStaticPaths() {
  const allPosts = Object.values(
    import.meta.glob<MarkdownInstance<Frontmatter>>('../posts/*.md', { eager: true })
  );
  const publicPosts = filterPublicPosts(allPosts);

  return Object.values(Topic)
    .map(topic => ({
      topic,
      posts: sortPostsByDate(filterPostsByTopic(publicPosts, topic))
    }))
    // A topic with no public posts gets no page
    .filter(entry => entry.posts.length > 0)
    .map(entry => ({
      params: { topic: entry.topic },
      props: { topic: entry.topic, posts: entry.posts }
    }));
}

interface Props {
  topic: TopicType;
  posts: MarkdownInstance<Frontmatter>[];
}

const { topic, posts } = Astro.props;
const name = TOPIC_NAMES[topic];
---

<BaseLayout title={name}>
  <div class="page-content">
    <h1>{name}</h1>

    <PostList posts={posts} />

    <a class="back-link" href="/">All posts</a>
  </div>
</BaseLayout>
```

- [ ] **Step 2: Create `src/pages/topics/index.astro`**

```astro
---
import type { MarkdownInstance } from 'astro';
import BaseLayout from '../../layouts/BaseLayout.astro';
import type { Frontmatter } from '../../utils/posts';
import {
  Topic,
  TOPIC_NAMES,
  filterPublicPosts,
  filterPostsByTopic
} from '../../utils/posts';

const allPosts = Object.values(
  import.meta.glob<MarkdownInstance<Frontmatter>>('../posts/*.md', { eager: true })
);
const publicPosts = filterPublicPosts(allPosts);

const topics = Object.values(Topic)
  .map(topic => ({
    slug: topic,
    name: TOPIC_NAMES[topic],
    count: filterPostsByTopic(publicPosts, topic).length
  }))
  .filter(entry => entry.count > 0);
---

<BaseLayout title="Topics">
  <div class="page-content">
    <h1>Topics</h1>

    <div class="topic-index-list">
      {topics.map(entry => (
        <div class="topic-index-item">
          <a href={`/topics/${entry.slug}/`}>{entry.name}</a>
          <span class="topic-index-count">
            {entry.count} {entry.count === 1 ? 'post' : 'posts'}
          </span>
        </div>
      ))}
    </div>

    <a class="back-link" href="/">All posts</a>
  </div>
</BaseLayout>
```

- [ ] **Step 3: Append the topic page CSS to `src/styles/components.css`**

Add above the `/* Responsive Adjustments */` block:

```css
/* Topic Pages */
.topic-index-list {
  margin-top: 2rem;
}

.topic-index-item {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 4px 20px;
  align-items: baseline;
  padding: 20px 0 18px;
  border-bottom: 1px solid var(--border-color);
}

.topic-index-item a {
  font-size: 21px;
  line-height: 1.3;
  color: var(--accent-color);
  text-decoration: none;
}

.topic-index-count {
  font-size: 14px;
  color: var(--text-light);
  white-space: nowrap;
}

.back-link {
  display: inline-block;
  margin-top: 30px;
  font-size: 16px;
  color: var(--accent-color);
}
```

- [ ] **Step 4: Build and verify the routes**

```bash
npm run build && ls dist/topics
```

Expected exactly, in this order: `books`, `engineering`, `index.html`, `reflections`.

```bash
grep -o "<h1>[^<]*</h1>" dist/topics/engineering/index.html
```

Expected: `<h1>Engineering</h1>`.

```bash
grep -o 'class="post-row"' dist/topics/books/index.html | wc -l
```

Expected: `2` — Alamut and Karamazov.

```bash
grep -o "1 post\|2 posts" dist/topics/index.html | sort | uniq -c
```

Expected: `2 posts` twice — Books and Reflections — and `1 post` once, for Engineering.

- [ ] **Step 5: Commit**

```bash
git add src/pages/topics src/styles/components.css
git commit -m "feat: add topic index and per-topic pages"
```

---

## Task 4: Redirect the old category URLs

Astro emits a static HTML page with a meta refresh for each entry in `redirects`, which is what GitHub Pages needs. This task comes after Task 3 so that every redirect target already exists.

**Files:**
- Modify: `astro.config.mjs`

**Interfaces:**
- Consumes: the routes created in Task 3.
- Produces: `dist/books/index.html`, `dist/technology/index.html`, `dist/life/index.html`, each redirecting.

- [ ] **Step 1: Add the `redirects` block to `astro.config.mjs`**

All three old categories map one-to-one onto a topic, so no redirect has to guess. Every `technology` post became Engineering, and every `life` post became Reflections.

```js
// @ts-check
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
  site: 'https://www.ammaralam.me', // Updated to match your custom domain
  base: '/', // Correct for custom domain
  trailingSlash: 'ignore',
  redirects: {
    // Retired category pages. Kept so existing inbound links stay alive.
    '/books': '/topics/books/',
    '/technology': '/topics/engineering/',
    '/life': '/topics/reflections/'
  },
  build: {
    // This ensures assets are loaded correctly on GitHub Pages
    assets: '_assets'
  }
});
```

- [ ] **Step 2: Build and verify each redirect**

```bash
npm run build
```

Expected: success.

```bash
grep -o 'url=[^"]*' dist/books/index.html
```

Expected: `url=/topics/books/`.

```bash
grep -o 'url=[^"]*' dist/technology/index.html
```

Expected: `url=/topics/engineering/`.

```bash
grep -o 'url=[^"]*' dist/life/index.html
```

Expected: `url=/topics/reflections/`.

If any of the three files is missing, the redirect key needs a trailing slash to match `trailingSlash: 'ignore'`. Try `'/books/'` and rebuild before changing anything else.

- [ ] **Step 3: Commit**

```bash
git add astro.config.mjs
git commit -m "feat: redirect retired category URLs to topic pages"
```

---

## Task 5: Post end matter — Posted in and More like this

**Files:**
- Modify: `src/layouts/BlogPost.astro`
- Modify: `src/styles/blog.css:63-71` (remove `.blog-tags`) and `:85-89` (remove `.blog-categories`), then append

**Interfaces:**
- Consumes: `getRelatedPosts`, `getPostTopics`, `TOPIC_NAMES` from Task 1; `PostList` with `variant="compact"` from Task 2; `topics`, `tags` and `url` props wired in Task 1.
- Produces: CSS classes `.posted-in`, `.posted-in-label`, `.more-like-this`, `.more-like-this-heading`.

- [ ] **Step 1: Load all posts and compute related posts in `BlogPost.astro`**

`BlogPost.astro` is an `.astro` file, so it may call `import.meta.glob` itself. The path from `src/layouts/` to the posts is `../pages/posts/*.md`.

Task 1 already added `import type { TopicType } from '../utils/posts';` and `import { getPostTopics } from '../utils/posts';`. **Extend those two lines** rather than adding duplicates, and add two new ones. The import block should end up as:

```ts
import type { MarkdownInstance } from 'astro';
import BaseLayout from './BaseLayout.astro';
import PostList from '../components/PostList.astro';
import type { Frontmatter, TopicType } from '../utils/posts';
import { getPostTopics, getRelatedPosts, TOPIC_NAMES } from '../utils/posts';
import { formatDate, parseDate } from '../utils/date';
```

Then, below `const topicList = getPostTopics({ topics });` from Task 1, add:

```ts
const allPosts = Object.values(
  import.meta.glob<MarkdownInstance<Frontmatter>>('../pages/posts/*.md', { eager: true })
);

const relatedPosts = getRelatedPosts(allPosts, url ?? '', topicList, tags ?? []);
```

- [ ] **Step 2: Add the end matter after `.blog-content`**

Replace the closing part of the markup so that the two new blocks sit inside `<article>`, after the content div:

```astro
    <div class="blog-content">
      <slot />
    </div>

    {topicList.length > 0 && (
      <div class="posted-in">
        <span class="posted-in-label">Posted in:</span>
        {topicList.map(topic => (
          <a href={`/topics/${topic}/`}>{TOPIC_NAMES[topic]}</a>
        ))}
      </div>
    )}

    {relatedPosts.length > 0 && (
      <section class="more-like-this">
        <h2 class="more-like-this-heading">More like this</h2>
        <PostList posts={relatedPosts} variant="compact" />
      </section>
    )}
  </article>
```

- [ ] **Step 3: Remove the dead rules from `src/styles/blog.css`**

Delete the `.blog-tags` rule (lines 63-71) and the `.blog-categories` rule (lines 85-89). Both target markup that Task 1 removed.

- [ ] **Step 4: Append the end matter CSS to `src/styles/blog.css`**

```css
/* Post End Matter */
.posted-in {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 4px 8px;
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px solid var(--border-color);
  font-size: 16px;
}

.posted-in-label {
  color: var(--text-light);
}

.posted-in a {
  display: inline-block;
  padding: 6px 0;
  color: var(--accent-color);
}

.more-like-this {
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px solid var(--border-color);
}

.more-like-this-heading {
  margin: 0;
  font-size: 14.5px;
  font-weight: normal;
  letter-spacing: 0.03em;
  color: var(--text-light);
}
```

The `padding: 6px 0` on the topic links gives the tap target the height it needs at 390px, where `Posted in:` wraps to a second line.

- [ ] **Step 5: Build and verify the end matter**

```bash
npm run build
```

Expected: success.

```bash
grep -o 'Posted in:.\{0,120\}' dist/posts/2022-08-01-alamut/index.html
```

Expected: the label followed by one link to `/topics/books/` with the text `Books`.

```bash
grep -o "More like this" dist/posts/2022-08-01-alamut/index.html
```

Expected: one match. Alamut shares the Books topic with Karamazov.

```bash
grep -o 'href="/posts/[^"]*"' dist/posts/2022-08-01-alamut/index.html
```

Expected: `/posts/2023-03-26-the-brothers-karamazov` — and **not** Alamut's own URL. This proves the self-exclusion works and that an untagged post (Karamazov has no tags) is still found.

```bash
grep -c "More like this" dist/posts/2025-09-29-learnings-from-using-clean-arch-django/index.html || echo "OMITTED"
```

Expected: `OMITTED`. The Django post is the only public Engineering post, so the block is dropped entirely. The two other Engineering posts are private and are never candidates.

```bash
grep -o "#book\|#review\|#thoughts" dist/posts/2022-08-01-alamut/index.html || echo "NO TAGS RENDERED"
```

Expected: `NO TAGS RENDERED`.

- [ ] **Step 6: Look at a post page**

Run `npm run dev` and open `http://localhost:4321/posts/2022-08-01-alamut`. Confirm the header meta reads `August 1, 2022 · N min` with no category and no tag line. Confirm the two end-matter blocks match Screen 2. Check both themes. Narrow to 390px and confirm `Posted in:` wraps cleanly. Stop the dev server.

- [ ] **Step 7: Commit**

```bash
git add src/layouts/BlogPost.astro src/styles/blog.css
git commit -m "feat: add Posted in and More like this to post pages"
```

---

## Task 6: Footer link and contrast fix

The footer link is the only browse affordance outside an article. Without it the topic pages are reachable only from inside posts, which is weak for search and a dead end for a visitor who lands on one.

**Files:**
- Modify: `src/layouts/BaseLayout.astro:20-22`
- Modify: `src/styles/layout.css:111-116`
- Modify: `src/styles/global.css:10`

**Interfaces:**
- Consumes: the `/topics/` route from Task 3.
- Produces: CSS classes `.footer-inner`, `.footer-link`.

- [ ] **Step 1: Add the footer link in `src/layouts/BaseLayout.astro`**

Replace the `<footer>` block:

```astro
  <footer>
    <div class="footer-inner">
      <p>&copy; {new Date().getFullYear()} Ammar Alam. All rights reserved.</p>
      <a class="footer-link" href="/topics/">All topics</a>
    </div>
  </footer>
```

- [ ] **Step 2: Make the footer two-column in `src/styles/layout.css`**

Replace the `footer` rule:

```css
/* Footer */
footer {
  padding: 1rem;
  background-color: var(--light-background);
  border-top: 1px solid var(--border-color);
}

.footer-inner {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
  gap: 0.5rem 1rem;
  max-width: var(--content-width);
  margin: 0 auto;
}

.footer-inner p {
  margin: 0;
}

.footer-link {
  color: var(--accent-color);
}
```

- [ ] **Step 3: Raise the contrast of `--text-light` in `src/styles/global.css`**

On line 10, change:

```css
  --text-light: #777;
```

to:

```css
  --text-light: #6f6f6f;
```

`#777` is 4.48:1 on white, marginally under WCAG AA for body text, and this design puts dates and the `Posted in:` label on that token. `#6f6f6f` is 4.9:1 and looks the same. Leave the dark theme value `#8a8a8e` alone — it already passes.

- [ ] **Step 4: Build and verify**

```bash
npm run build
```

Expected: success.

```bash
grep -o 'href="/topics/">All topics' dist/index.html
```

Expected: one match. Repeat on a post page and a topic page:

```bash
grep -c "All topics" dist/posts/2022-08-01-alamut/index.html dist/topics/books/index.html
```

Expected: `1` for each file.

```bash
grep -rn "#777" src/styles/ || echo "TOKEN UPDATED"
```

Expected: `TOKEN UPDATED`.

- [ ] **Step 5: Commit**

```bash
git add src/layouts/BaseLayout.astro src/styles/layout.css src/styles/global.css
git commit -m "feat: add All topics footer link, raise --text-light contrast"
```

---

## Task 7: Final pass

**Files:**
- Modify: `CLAUDE.md`
- Modify: `src/pages/posts/2025-09-29-learnings-from-using-clean-arch-django.md` (frontmatter only)

- [ ] **Step 1: Fix the duplicated description**

`2025-09-29-learnings-from-using-clean-arch-django.md` has a `description` identical to its `title`, so its row prints the same sentence twice. This was tolerable when the category badge shared the row. The description is now the row's only prose.

Change the `description` line to:

```yaml
description: "Three years of Django taught me that the best architecture advice ends in 'it depends'."
```

This is Ammar's copy to accept or replace. Nothing else depends on it.

- [ ] **Step 2: Update `CLAUDE.md`**

Three sections describe the old system. Edit them:

1. Under **Blog posts**, replace the categories line with:

```md
- Topics defined in `src/utils/posts.ts` as the `Topic` enum: `books`, `engineering`, `reflections`
- Title Case display names live in `TOPIC_NAMES` in the same file
- Frontmatter requires `title`, `pubDate` (YYYY-MM-DD), and `topics` (string or array)
- Optional frontmatter: `description`, `image`, `private`, `tags`
- `tags` is free-form and is never rendered. It only ranks related posts within a topic.
```

2. Under **Adding content > New blog post**, change `categories: ["technology"]` to `topics: ["engineering"]`.

3. Replace the whole **New category** section with:

```md
### New topic

A new topic earns its existence at **two** posts. Until then, put the post in the
nearest existing topic. Never delete a topic — one that stops growing just stays
small. If two topics must merge, add a redirect in `astro.config.mjs`.

1. Add the value to the `Topic` enum in `src/utils/posts.ts`
2. Add its Title Case display name to `TOPIC_NAMES`
3. Set `topics:` on the posts

The page at `/topics/<slug>/` generates itself, but only once the topic has at
least one public post.
```

4. Under **Key utilities**, change `filterPostsByCategory()` to `filterPostsByTopic()`, and add `getPostTopics()`, `getRelatedPosts()` and `TOPIC_NAMES`.

- [ ] **Step 3: Full verification sweep**

```bash
npm run build
```

Expected: success, with no warning about an unresolved link.

```bash
grep -rn "Category\|categories\|CategoryType\|filterPostsByCategory" src/ || echo "NO CATEGORY REFERENCES"
```

Expected: `NO CATEGORY REFERENCES`.

```bash
ls dist/topics && ls dist/books dist/technology dist/life
```

Expected: three topic directories plus `index.html`, and the three redirect directories present.

```bash
grep -o 'class="post-row"' dist/index.html | wc -l
```

Expected: `5`.

- [ ] **Step 4: Read every page once**

Run `npm run dev` and open each of these. Check both light and dark themes on each.

- `/` — five rows, no badges, no tag lines, short dates on the right
- `/topics/` — three topic names with post counts
- `/topics/books/` — two rows, `All posts` link at the bottom
- `/topics/reflections/` — two rows
- `/topics/engineering/` — one row
- `/posts/2022-08-01-alamut` — `Posted in: Books`, one related post
- `/posts/2022-09-05-shini-bahar` — `Posted in: Reflections`, one related post
- `/posts/2025-09-29-learnings-from-using-clean-arch-django` — `Posted in: Engineering`, no related block
- `/life` — redirects to `/topics/reflections/`
- `/photography/` — the gallery, unchanged

Stop the dev server.

- [ ] **Step 5: Commit**

```bash
git add CLAUDE.md src/pages/posts/2025-09-29-learnings-from-using-clean-arch-django.md
git commit -m "docs: update CLAUDE.md for topics, rewrite duplicated description"
```

---

## Deferred, by design

The handoff specifies a **topic line** — a single wrapping row of topic links with counts — and deliberately defers building it. At five public posts a browse control is louder than the thing it filters. Do not build it in this plan.

Turn it on when one of these is true:

1. One topic passes five posts. Add the line to that topic page only.
2. The home list stops being scannable, at roughly 25 posts. Add it under the intro.
3. Topics pass eight. Replace the line with a single `by topic` disclosure.

The full visual specification is in the design document, under "Deferred: the topic line".

## Open items for Ammar

- **The Debevec CRF post sits in Engineering.** It is a technical piece about recovering a camera response function. It is private today. When you publish it, decide whether it still belongs there or whether photography writing has earned its own topic.
- **The growth rule.** A new topic earns its existence at two posts. Until then a post goes in the nearest existing topic. Never delete a topic; one that stops growing just stays small. If two must merge, add a redirect in `astro.config.mjs`.
