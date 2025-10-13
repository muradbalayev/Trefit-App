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
} from '@/utils/notificationManager';

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
  const { socket, isConnected, on, off } = useSocket();
  
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [pendingNotification, setPendingNotification] = useState(null);
  const appState = useRef(AppState.currentState);
  const notificationListener = useRef();
  const responseListener = useRef();

  // Request permissions on mount
  useEffect(() => {
    const initNotifications = async () => {
      const granted = await requestNotificationPermissions();
      setPermissionGranted(granted);
    };

    initNotifications();
  }, []);

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

  // Listen for new messages from Socket.IO
  useEffect(() => {
    if (!socket || !isConnected || !permissionGranted) return;

    const handleNewMessage = (data) => {
      const { message } = data;
      
      // Only show notification if:
      // 1. Message is not from current user
      // 2. App is in background or inactive
      const isMyMessage = message.sender?._id === user?._id || message.sender === user?._id;
      const isAppInBackground = appState.current !== 'active';
      
      if (!isMyMessage && isAppInBackground) {
        const senderName = message.sender?.name || 'Someone';
        const messageContent = message.content || 'New message';
        
        showChatNotification({
          senderName,
          message: messageContent,
          chatId: message.chat,
          senderId: message.sender?._id || message.sender,
          senderRole: message.sender?.role || 'client',
        });
        
        // Increment unread count
        setUnreadCount((prev) => prev + 1);
      }
    };

    on('new_message', handleNewMessage);

    return () => {
      off('new_message', handleNewMessage);
    };
  }, [socket, isConnected, permissionGranted, user?._id, on, off]);

  // Track app state changes
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
        // App came to foreground - clear badge
        clearBadge();
        setUnreadCount(0);
      }
      
      appState.current = nextAppState;
      console.log('📱 App state:', nextAppState);
    });

    return () => {
      subscription.remove();
    };
  }, []);

  const value = {
    permissionGranted,
    unreadCount,
    pendingNotification,
    clearPendingNotification: () => setPendingNotification(null),
    clearBadge: () => {
      clearBadge();
      setUnreadCount(0);
    },
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export default NotificationContext;
