# Next Steps: Photography Gallery

## CSS Columns Masonry Layout

Replace the adaptive (justified) layout with a custom CSS-columns masonry layout to get:
- Full uncropped images
- Consistent gaps/padding
- Pinterest-style waterfall grid
- LightGallery still opens on click

### Implementation
- Replace `layout={}` prop with a custom slot inside `<LightGallery>`
- Use CSS `column-count` / `column-gap` for the masonry grid
- Each image maintains its natural aspect ratio (no cropping)
- Responsive column counts (e.g. 3 on desktop, 2 on tablet, 1 on mobile)
