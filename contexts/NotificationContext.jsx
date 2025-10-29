import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { AppState } from 'react-native';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { useSocket } from './SocketContext';
import {
  requestNotificationPermissions,
  showChatNotification,
  clearBadge,
  getExpoPushToken,
  clearCachedPushToken,
} from '@/utils/notificationManager';
import { addMessageToCache } from '@/utils/chatCache';
import { useSavePushTokenMutation, useRemovePushTokenMutation } from '@/store/redux/user/services/userAuthApi';

// Check if running in Expo Go
const isExpoGo = Constants.appOwnership === 'expo';

const NotificationContext = createContext();

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const { user } = useSelector((state) => state.userAuth);
  const { socket, isConnected, lastMessage } = useSocket();
  const [savePushToken] = useSavePushTokenMutation();
  const [removePushToken] = useRemovePushTokenMutation();
  
  // Debug: Log current user on mount and changes
  useEffect(() => {
    console.log('👤 NotificationContext: Current user changed', {
      userId: user?._id,
      userName: user?.name,
      userRole: user?.role
    });
  }, [user?._id, user?.name]);
  
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [pendingNotification, setPendingNotification] = useState(null);
  const appState = useRef(AppState.currentState);
  const notificationListener = useRef();
  const responseListener = useRef();
  const messageCountRef = useRef(0); // Track messages for badge

  // Request permissions and register push token
  useEffect(() => {
    const initNotifications = async () => {
      if (!user?._id) {
        console.log('⏭️ No user logged in, skipping notification setup');
        return;
      }

      console.log('🔔 NotificationContext: Requesting permissions...');
      const granted = await requestNotificationPermissions();
      setPermissionGranted(granted);
      console.log('🔔 NotificationContext: Permission granted:', granted);

      if (granted) {
        // Get and save push token
        const pushToken = await getExpoPushToken();
        if (pushToken) {
          try {
            await savePushToken(pushToken).unwrap();
            console.log('✅ Push token registered with backend');
          } catch (error) {
            console.error('❌ Failed to register push token:', error);
          }
        }
      }
    };

    initNotifications();
  }, [user?._id]);

  // Handle notification received while app is in foreground
  useEffect(() => {
    // Skip in Expo Go
    if (isExpoGo || !Notifications.addNotificationReceivedListener) {
      return;
    }

    try {
      notificationListener.current = Notifications.addNotificationReceivedListener(
        (notification) => {
          console.log('📬 Notification received in foreground:', notification);
          // Notification is automatically shown by the handler
        }
      );
    } catch (error) {
      console.warn('⚠️ Could not add notification listener:', error.message);
    }

    return () => {
      if (notificationListener.current && Notifications.removeNotificationSubscription) {
        try {
          Notifications.removeNotificationSubscription(notificationListener.current);
        } catch (error) {
          console.warn('⚠️ Could not remove notification listener:', error.message);
        }
      }
    };
  }, []);

  // Handle notification tap (when user taps on notification)
  useEffect(() => {
    // Skip in Expo Go
    if (isExpoGo || !Notifications.addNotificationResponseReceivedListener) {
      return;
    }

    try {
      responseListener.current = Notifications.addNotificationResponseReceivedListener(
        (response) => {
          console.log('👆 Notification tapped:', response);
          
          const data = response.notification.request.content.data;
          
          if (data.type === 'chat_message') {
            // Store notification data for navigation
            setPendingNotification(data);
            
            // Clear badge when notification is tapped
            clearBadge();
          }
        }
      );
    } catch (error) {
      console.warn('⚠️ Could not add response listener:', error.message);
    }

    return () => {
      if (responseListener.current && Notifications.removeNotificationSubscription) {
        try {
          Notifications.removeNotificationSubscription(responseListener.current);
        } catch (error) {
          console.warn('⚠️ Could not remove response listener:', error.message);
        }
      }
    };
  }, [user?.role]);

  // Listen for new messages via global lastMessage from SocketContext
  useEffect(() => {
    console.log('🔔 NotificationContext: useEffect triggered', {
      hasLastMessage: !!lastMessage,
      uniqueKey: lastMessage?._uniqueKey,
      messageId: lastMessage?._id,
      timestamp: lastMessage?._timestamp,
      permissionGranted,
      userId: user?._id,
      appState: appState.current
    });
    
    if (!lastMessage || !permissionGranted) {
      console.log('⏭️ NotificationContext: Skipping - no message or permission');
      return;
    }
    
    // Helper function to normalize IDs
    const normalizeId = (id) => {
      if (!id) return null;
      if (typeof id === 'object' && id._id) {
        return id._id.toString().trim().toLowerCase();
      }
      return id.toString().trim().toLowerCase();
    };
    
    // Debug: Log raw sender data
    console.log('🔍 NotificationContext: Raw message data', {
      senderRaw: lastMessage.sender,
      senderType: typeof lastMessage.sender,
      senderId: lastMessage.sender?._id,
      senderString: lastMessage.sender?.toString?.()
    });
    
    // Normalize IDs to strings for comparison
    const senderId = normalizeId(
      typeof lastMessage.sender === 'object' && lastMessage.sender !== null
        ? lastMessage.sender._id || lastMessage.sender
        : lastMessage.sender
    );
    
    const currentUserId = normalizeId(user?._id);
    
    console.log('🔔 NotificationContext: Processing message from global state', {
      messageId: lastMessage._id,
      senderId,
      currentUserId,
      senderName: lastMessage.sender?.name || 'Unknown',
      appState: appState.current,
      isMatch: senderId === currentUserId
    });
    
    // Only show notification if:
    // 1. Message is not from current user
    // 2. App is in background or inactive
    const isMyMessage = senderId === currentUserId;
    const isAppInBackground = appState.current !== 'active';
    
    if (isMyMessage) {
      console.log('⏭️ NotificationContext: Message from self, skipping notification', {
        senderId,
        currentUserId
      });
      return;
    }
    
    if (!isAppInBackground) {
      console.log('⏭️ NotificationContext: App is active, skipping notification');
      return;
    }
    
    const senderName = lastMessage.sender?.name || 'Someone';
    const messageContent = lastMessage.content || 'New message';
    
    // Get chat ID (handle both string and object)
    const chatId = lastMessage.chat?._id || lastMessage.chat;
    
    console.log('📬 NotificationContext: Showing notification', { senderName, messageContent });
    
    // CRITICAL: Save message to cache so it appears when app opens
    addMessageToCache(chatId, lastMessage)
      .then(() => {
        console.log('💾 NotificationContext: Message saved to cache for background');
      })
      .catch((cacheError) => {
        console.error('❌ Failed to cache background message:', cacheError);
      });
    
    showChatNotification({
      senderName,
      message: messageContent,
      chatId,
      senderId: lastMessage.sender?._id || lastMessage.sender,
      senderRole: lastMessage.sender?.role || 'client',
    });
    
    // Increment message count for badge (handled by system)
    messageCountRef.current += 1;
  }, [lastMessage, permissionGranted, user?._id]);

  // Track app state changes
  useEffect(() => {
    console.log('📱 NotificationContext: Initial app state:', appState.current);
    
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      const previousState = appState.current;
      console.log('📱 App state change:', {
        from: previousState,
        to: nextAppState
      });
      
      if (previousState.match(/inactive|background/) && nextAppState === 'active') {
        // App came to foreground - clear badge and reset count
        console.log('🧹 App came to foreground - clearing notifications');
        clearBadge();
        messageCountRef.current = 0;
      }
      
      appState.current = nextAppState;
    });

    return () => {
      if (subscription?.remove) {
        subscription.remove();
      }
    };
  }, []);

  const value = {
    permissionGranted,
    pendingNotification,
    clearPendingNotification: () => setPendingNotification(null),
    clearNotificationBadge: () => {
      clearBadge();
      messageCountRef.current = 0;
    },
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export default NotificationContext;
