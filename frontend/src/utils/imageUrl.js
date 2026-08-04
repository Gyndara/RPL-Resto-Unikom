/**
 * Helper function to construct full image URLs for menu items.
 * Handles absolute URLs (e.g. Unsplash, Cloudinary) and relative backend uploaded image paths.
 * Dynamically uses VITE_API_BASE_URL environment variable if present.
 */
export const getImageUrl = (url) => {
  if (!url) {
    return 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&q=80';
  }
  
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  
  // Extract backend origin (e.g., https://backend.onrender.com from https://backend.onrender.com/api)
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';
  const backendOrigin = apiBaseUrl.replace(/\/api\/?$/, '');
  
  const cleanPath = url.startsWith('/') ? url : `/${url}`;
  return `${backendOrigin}${cleanPath}`;
};

export default getImageUrl;
