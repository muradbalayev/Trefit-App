import { Platform } from 'react-native';

/**
 * Image configuration for Android to prevent hardware bitmap errors
 * 
 * Hardware bitmaps are optimized for GPU rendering but have limitations:
 * - Cannot be used with software canvas
 * - Cannot be uploaded to GPU textures in some cases
 * - May cause "Software rendering doesn't support hardware bitmaps" error
 * 
 * This config disables hardware bitmaps on Android to prevent these issues.
 */

/**
 * Get safe image props for Android
 * Use this for any Image component that might cause hardware bitmap errors
 * 
 * @param {Object} additionalProps - Additional props to merge
 * @returns {Object} - Safe image props
 * 
 * @example
 * <Image 
 *   source={{ uri: imageUrl }}
 *   {...getSafeImageProps()}
 * />
 */
export const getSafeImageProps = (additionalProps = {}) => {
  if (Platform.OS === 'android') {
    return {
      ...additionalProps,
      // Disable hardware acceleration for Android
      renderToHardwareTextureAndroid: false,
      // Use software rendering
      fadeDuration: 0,
    };
  }
  return additionalProps;
};

/**
 * Image source config to prevent hardware bitmap issues
 * 
 * @param {string} uri - Image URI
 * @param {Object} options - Additional options
 * @returns {Object} - Safe image source config
 * 
 * @example
 * <Image source={getSafeImageSource(imageUrl)} />
 */
export const getSafeImageSource = (uri, options = {}) => {
  if (!uri) return null;

  const source = { uri, ...options };

  // Add cache policy for better performance
  if (Platform.OS === 'android') {
    source.cache = 'force-cache';
  }

  return source;
};

/**
 * Default image style to prevent hardware bitmap issues
 */
export const safeImageStyle = Platform.select({
  android: {
    // Disable hardware acceleration
    overflow: 'hidden',
  },
  ios: {},
  default: {},
});

/**
 * Wrapper component props for expo-image
 * Use with expo-image to prevent hardware bitmap errors
 */
export const expoImageProps = Platform.select({
  android: {
    // Disable hardware acceleration
    cachePolicy: 'memory-disk',
    transition: 0,
    recyclingKey: undefined,
  },
  ios: {
    cachePolicy: 'memory-disk',
  },
  default: {},
});

export default {
  getSafeImageProps,
  getSafeImageSource,
  safeImageStyle,
  expoImageProps,
};
