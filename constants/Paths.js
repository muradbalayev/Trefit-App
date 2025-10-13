import { IMAGE_URL } from './Variables'


const AVATAR_URL = IMAGE_URL + '/profile-photos'
const WORKOUT_URL = IMAGE_URL + '/workouts'
const PROGRESS_PHOTO_URL = IMAGE_URL + '/progress-photos'

/**
 * Build avatar URL with format (only 'lg' variant available)
 * @param {string} filename - Avatar filename from API (e.g., "profile-123.jpg")
 * @param {string} format - Image format: 'webp' | 'jpeg' (default: 'webp')
 * @returns {string} Full avatar URL
 */
const getAvatarUrl = (filename, format = 'webp') => {
  if (!filename) return null;
  
  const baseName = filename.replace(/\.[^/.]+$/, ''); // Remove extension
  return `${AVATAR_URL}/variants/lg/${baseName}.${format}`;
};

/**
 * Get original (optimized) avatar URL
 * @param {string} filename - Avatar filename from API
 * @returns {string} Full avatar URL
 */
 const getOriginalAvatarUrl = (filename) => {
  if (!filename) return null;
  return `${AVATAR_URL}/${filename}`;
};

/**
 * Get progress photo URL
 * @param {string} filename - Progress photo filename from API (e.g., "progress-123.webp")
 * @returns {string} Full progress photo URL
 */
const getProgressPhotoUrl = (filename) => {
  if (!filename) return null;
  return `${PROGRESS_PHOTO_URL}/${filename}`;
};

export { AVATAR_URL, WORKOUT_URL, PROGRESS_PHOTO_URL, getAvatarUrl, getOriginalAvatarUrl, getProgressPhotoUrl, IMAGE_URL }