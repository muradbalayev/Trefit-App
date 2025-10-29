import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Constants
const ANDROID_CHANNEL_ID = 'trefit-chat-messages';
const ANDROID_CHANNEL_NAME = 'Chat Messages';
const NOTIFICATION_SOUND = 'default';
const VIBRATION_PATTERN = [0, 250, 250, 250];

// Check if running in Expo Go
const isExpoGo = Constants.appOwnership === 'expo';

// Configure notification behavior only if not in Expo Go
if (!isExpoGo && Notifications.setNotificationHandler) {
  try {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
        priority: Notifications.AndroidNotificationPriority?.HIGH || 'high',
      }),
    });
  } catch (error) {
    console.warn('⚠️ Could not set notification handler:', error.message);
  }
}

/**
 * Request notification permissions
 * @returns {Promise<boolean>} - Whether permission was granted
 */
export const requestNotificationPermissions = async () => {
  // Skip in Expo Go
  if (isExpoGo) {
    console.warn('⚠️ Notifications not available in Expo Go');
    return false;
  }

  try {
    if (!Notifications.getPermissionsAsync) {
      console.warn('⚠️ Notification API not available');
      return false;
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.warn('⚠️ Notification permission denied');
      return false;
    }

    console.log('✅ Notification permission granted');

    // Configure Android notification channel
    if (Platform.OS === 'android' && Notifications.setNotificationChannelAsync) {
      try {
        // Delete old channel if exists (to reset settings)
        try {
          await Notifications.deleteNotificationChannelAsync(ANDROID_CHANNEL_ID);
        } catch (e) {
          // Channel might not exist, ignore
        }
        
        // Create fresh channel
        await Notifications.setNotificationChannelAsync(ANDROID_CHANNEL_ID, {
          name: ANDROID_CHANNEL_NAME,
          importance: Notifications.AndroidImportance?.MAX || 5, // MAX instead of HIGH
          vibrationPattern: VIBRATION_PATTERN,
          lightColor: '#C0FF00',
          sound: NOTIFICATION_SOUND,
          enableVibrate: true,
          showBadge: true,
          enableLights: true,
          lockscreenVisibility: Notifications.AndroidNotificationVisibility?.PUBLIC || 1,
          bypassDnd: false,
        });
        console.log('✅ Android notification channel created with MAX importance');
      } catch (channelError) {
        console.warn('⚠️ Could not create notification channel:', channelError.message);
      }
    }

    return true;
  } catch (error) {
    console.error('❌ Error requesting notification permissions:', error);
    return false;
  }
};

/**
 * Get Expo Push Token
 */
export const getExpoPushToken = async () => {
  if (isExpoGo) {
    console.log('⏭️ Expo Go - push token not available');
    return null;
  }

  if (!Device.isDevice) {
    console.log('⏭️ Not a physical device - push token not available');
    return null;
  }

  try {
    // Check if we have a cached token
    const cachedToken = await AsyncStorage.getItem('expoPushToken');
    if (cachedToken) {
      console.log('✅ Using cached push token');
      return cachedToken;
    }

    // Get new token
    const { data: token } = await Notifications.getExpoPushTokenAsync({
      projectId: Constants.expoConfig?.extra?.eas?.projectId,
    });

    if (token) {
      // Cache the token
      await AsyncStorage.setItem('expoPushToken', token);
      console.log('✅ Expo push token obtained:', token.substring(0, 30) + '...');
      return token;
    }

    return null;
  } catch (error) {
    console.error('❌ Error getting push token:', error);
    return null;
  }
};

/**
 * Clear cached push token
 */
export const clearCachedPushToken = async () => {
  try {
    await AsyncStorage.removeItem('expoPushToken');
    console.log('✅ Cached push token cleared');
  } catch (error) {
    console.error('❌ Error clearing push token:', error);
  }
};

/**
 * Show local notification for new chat message
 * @param {Object} params - Notification parameters
 * @param {string} params.senderName - Name of message sender
 * @param {string} params.message - Message content
 * @param {string} params.chatId - Chat ID for navigation
 * @param {string} params.senderId - Sender user ID
 * @param {string} params.senderRole - Sender role (client/trainer)
 */
export const showChatNotification = async ({
  senderName,
  message,
  chatId,
  senderId,
  senderRole = 'client',
}) => {
  // Skip in Expo Go
  if (isExpoGo) {
    console.log('📬 Notification skipped (Expo Go):', senderName);
    return;
  }

  try {
    if (!Notifications.scheduleNotificationAsync) {
      console.warn('⚠️ scheduleNotificationAsync not available');
      return;
    }

    // Generate unique identifier for this notification
    const notificationIdentifier = `chat_${chatId}_${Date.now()}`;

    const notificationConfig = {
      identifier: notificationIdentifier,
      content: {
        title: senderName,
        body: message.length > 100 ? message.substring(0, 100) + '...' : message,
        data: {
          type: 'chat_message',
          chatId,
          senderId,
          senderRole,
          senderName,
        },
        sound: NOTIFICATION_SOUND,
        priority: Notifications.AndroidNotificationPriority?.HIGH || 'high',
        autoDismiss: true, // Auto dismiss after tap
        sticky: false, // Don't make it persistent
      },
      trigger: null, // Show immediately
    };

    // Add Android-specific config
    if (Platform.OS === 'android') {
      notificationConfig.content.channelId = ANDROID_CHANNEL_ID;
      notificationConfig.content.vibrate = VIBRATION_PATTERN;
    }

    const notificationId = await Notifications.scheduleNotificationAsync(notificationConfig);

    console.log('📬 Chat notification shown:', {
      senderName,
      notificationId,
      identifier: notificationIdentifier
    });
    
    return notificationId;
  } catch (error) {
    console.error('❌ Error showing notification:', error.message);
    return null;
  }
};

/**
 * Clear all notifications
 */
export const clearAllNotifications = async () => {
  if (isExpoGo || !Notifications.dismissAllNotificationsAsync) return;
  
  try {
    await Notifications.dismissAllNotificationsAsync();
    console.log('🧹 All notifications cleared');
  } catch (error) {
    console.error('❌ Error clearing notifications:', error.message);
  }
};

/**
 * Clear notification badge
 */
export const clearBadge = async () => {
  if (isExpoGo || !Notifications.setBadgeCountAsync) return;
  
  try {
    await Notifications.setBadgeCountAsync(0);
  } catch (error) {
    console.error('❌ Error clearing badge:', error.message);
  }
};

/**
 * Set notification badge count
 * @param {number} count - Badge count
 */
export const setBadgeCount = async (count) => {
  if (isExpoGo || !Notifications.setBadgeCountAsync) return;
  
  try {
    await Notifications.setBadgeCountAsync(count);
  } catch (error) {
    console.error('❌ Error setting badge count:', error.message);
  }
};

/**
 * Cancel specific notification
 * @param {string} notificationId - Notification ID to cancel
 */
export const cancelNotification = async (notificationId) => {
  if (isExpoGo || !Notifications.dismissNotificationAsync) return;
  
  try {
    await Notifications.dismissNotificationAsync(notificationId);
  } catch (error) {
    console.error('❌ Error canceling notification:', error.message);
  }
};
