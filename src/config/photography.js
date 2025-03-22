/**
 * Configuration for the photography section
 * Edit these values to experiment with different settings
 */

/**
 * Image loading configuration
 * Controls how many images to eagerly load (above the fold) vs. lazy load
 * Higher values mean more images load immediately = faster initial rendering but higher initial load time
 * Lower values mean fewer images load immediately = faster page load but delayed rendering of some images
 */
export const imageLoading = {
  // Main photography page - how many images to load eagerly in the grid
  // Default: 3 (usually visible without scrolling on desktop)
  mainPageCount: 6,
  
  // Collections page - how many collection cards to load eagerly
  // Default: 2 (usually visible in a 2-column layout)
  collectionsCount: 2,
  
  // Individual gallery page - how many images to load eagerly
  // Default: 3 (usually visible without scrolling)
  galleryCount: 6
};

/**
 * Other photography configuration settings can be added here in the future
 */ 