/**
 * Utility functions for handling photos in the photography section
 */

import { imageLoading } from '../config/photography.js';

/**
 * Takes all photo galleries and extracts a set number of photos from each to create a flattened array
 * @param {Array} galleries - Array of photo gallery objects
 * @param {number} photosPerGallery - Number of photos to extract from each gallery (default: 2)
 * @returns {Array} - Flattened array of photos with gallery info attached
 */
export function getSamplePhotos(galleries, photosPerGallery = 2) {
  if (!galleries || !galleries.length) return [];
  
  const samplePhotos = [];
  
  galleries.forEach(gallery => {
    // Take a sample of photos from each gallery
    const galleryPhotos = gallery.photos.slice(0, photosPerGallery).map(photo => ({
      ...photo,
      galleryId: gallery.id,
      galleryTitle: gallery.title,
    }));
    
    samplePhotos.push(...galleryPhotos);
  });
  
  // Shuffle the photos for a more interesting grid
  return shuffleArray(samplePhotos);
}

/**
 * Type definition for valid loading values
 * @typedef {"eager" | "lazy"} LoadingValue
 */

/**
 * Determines if an image should be eagerly loaded based on its index and the page type
 * @param {number} index - The index of the image in the list
 * @param {string} pageType - The type of page ('main', 'collections', or 'gallery')
 * @returns {"eager" | "lazy"} - Either "eager" or "lazy" for the loading attribute
 */
export function getImageLoadingStrategy(index, pageType = 'main') {
  let threshold;
  
  switch (pageType) {
    case 'main':
      threshold = imageLoading.mainPageCount;
      break;
    case 'collections':
      threshold = imageLoading.collectionsCount;
      break;
    case 'gallery':
      threshold = imageLoading.galleryCount;
      break;
    default:
      threshold = 0;
  }
  
  return index < threshold ? "eager" : "lazy";
}

/**
 * Shuffle an array using the Fisher-Yates algorithm
 * @param {Array} array - Array to shuffle
 * @returns {Array} - Shuffled array
 */
function shuffleArray(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
} 