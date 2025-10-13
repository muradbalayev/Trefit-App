import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import Constants from 'expo-constants';

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
        await Notifications.setNotificationChannelAsync('chat-messages', {
          name: 'Chat Messages',
          importance: Notifications.AndroidImportance?.HIGH || 4,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#C0FF00',
          sound: 'default',
          enableVibrate: true,
        });
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

    await Notifications.scheduleNotificationAsync({
      content: {
        title: senderName,
        body: message,
        data: {
          type: 'chat_message',
          chatId,
          senderId,
          senderRole,
          senderName,
        },
        sound: 'default',
        badge: 1,
        priority: Notifications.AndroidNotificationPriority?.HIGH || 'high',
        vibrate: [0, 250, 250, 250],
      },
      trigger: null, // Show immediately
    });

    console.log('📬 Chat notification shown:', senderName);
  } catch (error) {
    console.error('❌ Error showing notification:', error.message);
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
