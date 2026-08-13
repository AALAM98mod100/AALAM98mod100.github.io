# Styles Directory

This directory contains the centralized CSS for the entire website. The goal is to keep styles organized, maintainable, and to reduce duplication.

## File Structure

- **global.css**: Variables, reset styles, typography, and utility classes
- **layout.css**: Header, footer, navigation, and page layout styles
- **components.css**: Styles for reusable components (cards, buttons, etc.)
- **blog.css**: Styles specific to blog posts and content
- **photography.css**: Photography page styling
- **index.js**: Central import file that loads all CSS files

## CSS Variables

CSS variables are defined in `global.css` to maintain a consistent design system. Always use these variables instead of hard-coded values when possible.

Key variables include:

```css
:root {
  --primary-color: #333;
  --secondary-color: #555;
  --accent-color: #0077cc;
  --background-color: #ffffff;
  --light-background: #f8f8f8;
  --border-color: #eaeaea;
  --text-color: #333;
  --text-light: #6f6f6f;
  --shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  --transition: all 0.3s ease;
  --container-width: 1200px;
  --content-width: 800px;
}
```

## Adding New Styles

1. Determine which file is most appropriate for your new styles:
   - Site-wide elements → `global.css`
   - Page layout and structure → `layout.css`
   - Reusable components → `components.css`
   - Blog and content → `blog.css`

2. Follow these guidelines:
   - Use CSS variables for consistency
   - Group related styles together
   - Add comments for sections
   - Include responsive styles with the component
   - Keep media queries close to the styles they modify

## Class Naming Conventions

We use a simple class naming convention inspired by BEM:

- Component wrappers: `.component-name`
- Nested elements: `.component-name__element`
- Modifiers: `.component-name--variant`

Example:
```css
.post-card { /* Component wrapper */ }
.post-card__image { /* Nested element */ }
.post-card--featured { /* Modifier */ }
```

## Import System

All styles are imported in `index.js` and then imported once in `Layout.astro`. This means:

1. You don't need to import styles in individual components
2. To add a new global stylesheet, add it to `index.js`
3. Styles are automatically available to all pages and components 