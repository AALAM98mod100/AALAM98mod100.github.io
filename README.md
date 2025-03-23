# Ammar Alam's Personal Website

This is the source code for my personal website, built with Astro. The site is deployed at [www.ammaralam.me](https://www.ammaralam.me).

## 🚀 Project Structure

The site is built as a personal blog with a clean, modular structure:

```text
src/
├── assets/         # Static assets like images and SVGs
├── components/     # Reusable UI components
│   └── PostList.astro   # Displays a list of blog posts
├── layouts/        # Page layout templates
│   ├── Layout.astro          # Base HTML structure
│   ├── BaseLayout.astro      # Layout with navigation and footer
│   ├── MarkdownPostLayout.astro # Adapter for markdown frontmatter
│   └── BlogPost.astro        # Layout specifically for blog posts
├── pages/          # All pages and blog posts (routes)
│   ├── index.astro      # Homepage
│   ├── 404.astro        # 404 error page
│   ├── books/           # Category folder for books posts
│   ├── technology/      # Category folder for technology posts
│   ├── life/            # Category folder for life posts
│   └── photography/     # Category folder for photography posts
├── styles/         # Centralized CSS styles
│   ├── global.css       # Variables, reset, and common styles
│   ├── layout.css       # Header, footer, and page layouts
│   ├── components.css   # Component specific styles
│   ├── blog.css         # Blog post styling
│   └── index.js         # Central import file for all styles
└── utils/          # Utility functions
    ├── date.ts          # Date formatting utilities
    └── posts.ts         # Post filtering, sorting, and type definitions
```

## 🏗️ How Components Work Together

### Layout Hierarchy

- `Layout.astro`: The root layout with HTML structure, head, metadata
- `BaseLayout.astro`: Extends Layout and adds navigation and footer
- `MarkdownPostLayout.astro`: Adapter that processes markdown frontmatter
- `BlogPost.astro`: Extends BaseLayout and adds specific blog post formatting

### Page Structure

- Each page imports `BaseLayout` to maintain consistent navigation/footer
- Blog posts use the `MarkdownPostLayout` which feeds data to `BlogPost` layout

### Component Flow

```
Layout.astro (Basic HTML) 
  ↳ BaseLayout.astro (Adds Navigation and Footer)
      ↳ Regular Pages (index.astro, about.astro, etc.)
      ↳ BlogPost.astro (For individual posts)
            ⬑ MarkdownPostLayout.astro (Processes frontmatter)
                ⬑ Markdown Blog Posts (.md files)
```

## 📝 Blog Post Handling

### Post Organization

- All posts are stored in a central `src/pages/posts/` directory
- Posts are organized by categories specified in their frontmatter
- A post can belong to multiple categories
- Categories are defined as TypeScript enums to prevent errors

### Post Processing

- `import.meta.glob()` fetches posts from the central posts directory
- `filterPublicPosts()` removes private posts
- `filterPostsByCategory()` filters posts by their categories
- `sortPostsByDate()` sorts posts by publication date

### Post Display

- `PostList.astro` component renders posts consistently across the site
- Handles empty states with custom messages
- Supports displaying multiple categories per post
- Dates are formatted using centralized date utilities in `src/utils/date.ts`

## 🆕 How to Add New Content

### Adding a New Blog Post

1. Create a new `.md` file in the central posts directory:
   ```
   src/pages/posts/new-post.md
   ```

2. Add the required frontmatter with one or more categories:
   ```md
   ---
   layout: ../../layouts/MarkdownPostLayout.astro
   title: "My New Post"
   description: "Description of the post"
   pubDate: 2023-12-15
   categories: ["books", "technology"]  # Single category as string or array of categories
   image: "/assets/img/my-post-image.jpg"   # Optional
   private: false                           # Optional
   ---

   Your blog post content here in Markdown...
   ```

3. The post will automatically appear in:
   - Each specified category page (books and technology in this example)
   - The homepage recent posts (if it's one of the most recent)

### Important Date Formatting

When adding posts, use the following format for dates in frontmatter:
- Use the YYYY-MM-DD format for `pubDate` (e.g., `2023-12-25`)
- This format ensures proper sorting and display of dates across the site
- All date formatting is handled by centralized utilities in `src/utils/date.ts`

### Adding a New Page

1. Create a new `.astro` file in the pages directory:
   ```
   src/pages/newpage.astro
   ```

2. Use the BaseLayout:
   ```astro
   ---
   import BaseLayout from '../layouts/BaseLayout.astro';
   ---

   <BaseLayout title="My New Page">
     <div class="page-content">
       <h1>My New Page</h1>
       <p>Content here...</p>
     </div>
   </BaseLayout>

   <style>
     .page-content {
       max-width: 800px;
       margin: 0 auto;
     }
   </style>
   ```

### Adding a New Category

1. Add the new category to the `Category` enum in `src/utils/posts.ts`
2. Create a new category page in `src/pages/newcategory/index.astro`
3. Update the Navigation component to include the new category

## 🔒 Private Posts Feature

Posts can be marked as private with `private: true` in the frontmatter. Private posts:

1. Won't appear in any listings or on the homepage
2. Are still accessible by direct URL
3. Display a warning banner if accessed directly

This allows you to work on draft posts while keeping them hidden from the main site.

## 🎨 CSS and Styling

The website uses a centralized CSS system to maintain consistency and reduce duplication:

1. **CSS Organization**:
   - All styles are in the `src/styles/` directory
   - Styles are organized into four main files:
     - `global.css`: Variables, reset, typography, and utility classes
     - `layout.css`: Header, footer, navigation, and page layouts
     - `components.css`: Reusable component styles (cards, buttons, etc.)
     - `blog.css`: Blog post specific styling

2. **CSS Variables**:
   - Global variables are defined in `global.css` for consistent theming
   - Use these variables instead of hard-coded values when adding new styles
   - Example variables: `--primary-color`, `--content-width`, `--shadow`

3. **Style Import System**:
   - All styles are centrally imported via `src/styles/index.js`
   - This single file is imported in `Layout.astro`
   - No need to import styles in individual components or pages

4. **Adding New Styles**:
   - Add page-specific styles to the appropriate CSS file
   - Follow existing patterns and naming conventions
   - Use CSS variables for consistency
   - Avoid inline styles in components

5. **Responsive Design**:
   - Media queries are in each CSS file near the related components
   - The site is mobile-friendly with adaptations for small screens

6. **Class Naming Conventions**:
   - Component wrappers: `.component-name`
   - Nested elements: `.component-name__element`
   - Modifiers: `.component-name--variant`

## ⚙️ Configuration Options

1. **Site Settings**:
   - Site URL and other settings are in `astro.config.mjs`
   - Metadata like title is in `Layout.astro`

2. **Post Renderers**:
   - Markdown rendering settings are handled by Astro automatically
   - You can customize markdown rendering by integrating plugins in astro.config.mjs

## 🔄 Making Future Changes

### To Modify the Design

1. Update styles in the appropriate CSS file in the `src/styles/` directory:
   - Site-wide typography, colors, and utilities: `global.css`
   - Layout elements like headers and footers: `layout.css`
   - Reusable components like cards and buttons: `components.css`
   - Blog post specific styling: `blog.css`

2. Use CSS variables defined in `global.css` for consistency

3. Avoid adding inline styles to components – put them in the appropriate CSS file instead

### To Add Features

1. **New Components**: Add them to the `components` directory
2. **Component Styles**: Add them to `components.css`
3. **Utilities**: Add them to the `utils` directory
4. **Layout Changes**: Modify the appropriate layout file

### To Extend Post Functionality

1. Update the `Frontmatter` interface in `src/utils/posts.ts`
2. Modify `PostList.astro` to display new frontmatter fields
3. Update `BlogPost.astro` for individual post display changes
4. Add any new blog-specific styles to `blog.css`

### To Add a New Category

1. Add the new category to the `Category` enum in `src/utils/posts.ts`
2. Create a new category page in `src/pages/newcategory/index.astro`
3. Update the Navigation component to include the new category

## 🧞 Commands

All commands are run from the root of the project, from a terminal:

| Command                   | Action                                           |
| :------------------------ | :----------------------------------------------- |
| `npm install`             | Installs dependencies                            |
| `npm run dev`             | Starts local dev server at `localhost:4321`      |
| `npm run build`           | Build your production site to `./dist/`          |
| `npm run preview`         | Preview your build locally, before deploying     |
| `npm run astro ...`       | Run CLI commands like `astro add`, `astro check` |
| `npm run astro -- --help` | Get help using the Astro CLI                     |

## 👀 Want to learn more?

Feel free to check [our documentation](https://docs.astro.build) or jump into our [Discord server](https://astro.build/chat).
