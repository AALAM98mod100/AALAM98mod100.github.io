// Gallery Lightbox Functionality

document.addEventListener('DOMContentLoaded', () => {
  // Elements
  const lightbox = document.querySelector('.lightbox');
  if (!lightbox) return; // Exit if no lightbox element found
  
  const lightboxImage = lightbox.querySelector('.lightbox-image');
  const lightboxCaption = lightbox.querySelector('.lightbox-caption');
  const closeButton = lightbox.querySelector('.lightbox-close');
  const prevButton = lightbox.querySelector('.lightbox-prev');
  const nextButton = lightbox.querySelector('.lightbox-next');
  
  // Gallery items - select both old and new class names for compatibility
  const galleryItems = document.querySelectorAll('.gallery-item, .masonry-item');
  let currentIndex = 0;
  
  // Open lightbox when gallery item is clicked
  galleryItems.forEach((item, index) => {
    // Only attach click event to gallery items without links
    if (!item.querySelector('a')) {
      item.addEventListener('click', (e) => {
        e.preventDefault();
        const imgSrc = item.querySelector('img').src;
        const caption = item.querySelector('.caption')?.textContent || '';
        
        openLightbox(imgSrc, caption, index);
      });
    }
  });
  
  // Close lightbox when close button is clicked
  if (closeButton) {
    closeButton.addEventListener('click', closeLightbox);
  }
  
  // Close lightbox when clicking outside the image
  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) {
      closeLightbox();
    }
  });
  
  // Navigate with keyboard arrows
  document.addEventListener('keydown', (e) => {
    if (!lightbox.classList.contains('active')) return;
    
    if (e.key === 'Escape') {
      closeLightbox();
    } else if (e.key === 'ArrowLeft') {
      showPrevImage();
    } else if (e.key === 'ArrowRight') {
      showNextImage();
    }
  });
  
  // Navigation buttons
  if (prevButton) {
    prevButton.addEventListener('click', showPrevImage);
  }
  
  if (nextButton) {
    nextButton.addEventListener('click', showNextImage);
  }
  
  // Functions
  function openLightbox(src, caption, index) {
    lightboxImage.src = src;
    lightboxCaption.textContent = caption;
    currentIndex = index;
    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden'; // Prevent scrolling
  }
  
  function closeLightbox() {
    lightbox.classList.remove('active');
    document.body.style.overflow = ''; // Re-enable scrolling
  }
  
  function showPrevImage() {
    // Filter out items with links for lightbox navigation
    const lightboxGalleryItems = Array.from(galleryItems).filter(item => !item.querySelector('a'));
    
    currentIndex = (currentIndex - 1 + lightboxGalleryItems.length) % lightboxGalleryItems.length;
    const prevItem = lightboxGalleryItems[currentIndex];
    const imgSrc = prevItem.querySelector('img').src;
    const caption = prevItem.querySelector('.caption')?.textContent || '';
    
    lightboxImage.src = imgSrc;
    lightboxCaption.textContent = caption;
  }
  
  function showNextImage() {
    // Filter out items with links for lightbox navigation
    const lightboxGalleryItems = Array.from(galleryItems).filter(item => !item.querySelector('a'));
    
    currentIndex = (currentIndex + 1) % lightboxGalleryItems.length;
    const nextItem = lightboxGalleryItems[currentIndex];
    const imgSrc = nextItem.querySelector('img').src;
    const caption = nextItem.querySelector('.caption')?.textContent || '';
    
    lightboxImage.src = imgSrc;
    lightboxCaption.textContent = caption;
  }
}); 