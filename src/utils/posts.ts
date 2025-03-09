import type { MarkdownInstance } from 'astro';

/**
 * Enum of valid post categories
 */
export enum Category {
  BOOKS = 'books',
  TECHNOLOGY = 'technology',
  LIFE = 'life',
  PHOTOGRAPHY = 'photography'
}

/**
 * Type for category values
 */
export type CategoryType = `${Category}`;

/**
 * Post frontmatter type definition
 */
export interface Frontmatter {
  title: string;
  description?: string;
  pubDate: string | Date;
  image?: string;
  private?: boolean;
  categories: CategoryType[] | CategoryType; // Now supports single category or array of categories
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
 */
export function sortPostsByDate<T extends { frontmatter: { pubDate: string | Date } }>(
  posts: T[]
): T[] {
  return [...posts].sort(
    (a, b) => new Date(b.frontmatter.pubDate).valueOf() - new Date(a.frontmatter.pubDate).valueOf()
  );
}

/**
 * Filters posts by category
 */
export function filterPostsByCategory<T extends { frontmatter: { categories: CategoryType[] | CategoryType } }>(
  posts: T[],
  category: CategoryType
): T[] {
  return posts.filter(post => {
    const categories = Array.isArray(post.frontmatter.categories) 
      ? post.frontmatter.categories 
      : [post.frontmatter.categories];
    return categories.includes(category);
  });
}

// Note: The loadPosts function is intentionally not implemented because
// Astro.glob() needs to be called directly in the .astro file.
// It cannot be imported from a utility file. 