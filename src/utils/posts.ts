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
 * Search-engine description for each topic page.
 * These never appear on the page. They only fill the <meta name="description">
 * tag, so that the topic pages do not share one generic snippet in results.
 */
export const TOPIC_SEO_DESCRIPTIONS: Record<TopicType, string> = {
  [Topic.BOOKS]: 'Reviews of the novels I read, and the arguments they make.',
  [Topic.ENGINEERING]: 'Notes on backend architecture, Django, and reading data honestly.',
  [Topic.REFLECTIONS]: 'Essays on learning, music, and the way we see.'
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
 * Summary of one topic that has at least one public post
 */
export interface TopicSummary {
  slug: TopicType;
  name: string;
  count: number;
}

/**
 * The topics that have at least one public post, in enum order.
 * This is the single definition of "a topic that exists" — topic pages are
 * generated from it, the topics index lists it, and post pages use it to
 * decide whether a topic is linkable.
 */
export function getTopicsWithPosts<T extends { frontmatter: { topics: TopicType[] | TopicType; private?: boolean } }>(
  posts: T[]
): TopicSummary[] {
  const publicPosts = filterPublicPosts(posts);
  return Object.values(Topic)
    .map(topic => ({
      slug: topic,
      name: TOPIC_NAMES[topic],
      count: filterPostsByTopic(publicPosts, topic).length
    }))
    .filter(entry => entry.count > 0);
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
