# 📬 Trefit Notification System

## Overview
Local push notification system for real-time chat messages using Expo Notifications.

## Architecture

### Components
1. **NotificationContext** (`contexts/NotificationContext.jsx`)
   - Manages notification permissions
   - Listens to Socket.IO events
   - Handles app state changes
   - Provides notification API to app

2. **NotificationManager** (`utils/notificationManager.js`)
   - Low-level notification utilities
   - Permission requests
   - Channel configuration (Android)
   - Badge management

## Features

### ✅ Implemented
- **Permission Management**: Request and track notification permissions
- **Local Notifications**: Show notifications for incoming messages
- **Badge Management**: Auto-clear when app comes to foreground
- **Android Channels**: Dedicated channel for chat messages
- **Expo Go Detection**: Gracefully disable in development
- **App State Tracking**: Only notify when app is in background
- **Message Truncation**: Limit notification body to 100 chars

### 🎯 Behavior

#### When Message Arrives:
```
1. Check if message is from current user → Skip
2. Check if app is in foreground → Skip
3. Show notification with:
   - Title: Sender name
   - Body: Message content (max 100 chars)
   - Data: chatId, senderId, senderRole
```

#### When Notification Tapped:
```
1. Store notification data in context
2. Clear badge count
3. App navigates to chat (handled by app)
```

#### When App Comes to Foreground:
```
1. Clear all badges
2. Reset message count
3. Dismiss pending notifications
```

## Configuration

### Android Channel
- **ID**: `trefit-chat-messages`
- **Name**: Chat Messages
- **Importance**: HIGH
- **Sound**: Default
- **Vibration**: [0, 250, 250, 250]
- **Light Color**: #C0FF00 (Brand color)

### Permissions (app.json)
```json
{
  "android": {
    "permissions": [
      "RECEIVE_BOOT_COMPLETED",
      "VIBRATE",
      "WAKE_LOCK",
      "POST_NOTIFICATIONS"  // Android 13+
    ]
  },
  "ios": {
    "infoPlist": {
      "UIBackgroundModes": ["remote-notification"]
    }
  }
}
```

## Usage

### In Components
```javascript
import { useNotifications } from '@/contexts/NotificationContext';

function MyComponent() {
  const { 
    permissionGranted,
    pendingNotification,
    clearPendingNotification,
    clearNotificationBadge 
  } = useNotifications();

  // Check if user tapped notification
  useEffect(() => {
    if (pendingNotification) {
      // Navigate to chat
      navigate('ChatMessages', { 
        chatId: pendingNotification.chatId 
      });
      clearPendingNotification();
    }
  }, [pendingNotification]);

  return <View>...</View>;
}
```

### Manual Notification
```javascript
import { showChatNotification } from '@/utils/notificationManager';

showChatNotification({
  senderName: 'John Doe',
  message: 'Hey, how are you?',
  chatId: '123',
  senderId: '456',
  senderRole: 'client'
});
```

## Debugging

### Enable Logs
All notification actions are logged:
- ✅ Permission granted
- 📬 Notification shown
- 👆 Notification tapped
- 🧹 Badge cleared
- ⚠️ Warnings for Expo Go

### Common Issues

#### Notifications not showing
1. Check permission: `permissionGranted` should be `true`
2. Ensure app is in background
3. Verify Socket.IO connection
4. Check console for errors

#### Badge not clearing
1. Verify `clearBadge()` is called
2. Check app state transitions
3. Ensure `setBadgeCountAsync` is available

#### Android channel issues
1. Uninstall and reinstall app
2. Check Android version (13+ needs POST_NOTIFICATIONS)
3. Verify channel ID matches in all places

## Testing

### Development (Expo Go)
⚠️ Notifications are **disabled** in Expo Go. You'll see:
```
⚠️ Notifications not available in Expo Go
📬 Notification skipped (Expo Go): John Doe
```

### Production Build
1. Build with EAS: `eas build --platform android`
2. Install APK on device
3. Grant notification permission
4. Send message from another account
5. Put app in background
6. Verify notification appears

## Best Practices

### ✅ Do
- Always check `permissionGranted` before showing notifications
- Clear badges when app comes to foreground
- Truncate long messages
- Use proper channel IDs
- Handle Expo Go gracefully

### ❌ Don't
- Show notifications when app is active
- Show notifications for own messages
- Hardcode channel IDs in multiple places
- Forget to cleanup listeners
- Ignore permission denials

## Future Enhancements

### Planned
- [ ] Push notifications (FCM/APNs)
- [ ] Notification grouping by chat
- [ ] Custom notification sounds
- [ ] Rich notifications with images
- [ ] Action buttons (Reply, Mark as Read)
- [ ] Notification history

### Considerations
- Server-side push token management
- Background message handling
- Notification analytics
- User notification preferences

## References
- [Expo Notifications Docs](https://docs.expo.dev/versions/latest/sdk/notifications/)
- [Android Notification Channels](https://developer.android.com/develop/ui/views/notifications/channels)
- [iOS Background Modes](https://developer.apple.com/documentation/usernotifications)
