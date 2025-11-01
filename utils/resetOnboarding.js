import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Reset onboarding flag for testing
 * Call this function to show onboarding again
 */
export const resetOnboarding = async () => {
  try {
    await AsyncStorage.removeItem('hasSeenOnboarding');
    console.log('✅ Onboarding reset successfully');
    return true;
  } catch (error) {
    console.error('❌ Error resetting onboarding:', error);
    return false;
  }
};

/**
 * Check if user has seen onboarding
 */
export const hasSeenOnboarding = async () => {
  try {
    const value = await AsyncStorage.getItem('hasSeenOnboarding');
    return value === 'true';
  } catch (error) {
    console.error('Error checking onboarding:', error);
    return false;
  }
};
