# 🐛 Real-time Chat & Notification Debug Guide

## Test Scenario

### Setup:
- **Device 1**: Murad (Development Build)
- **Device 2**: Test User (Expo Go or Dev Build)

## Expected Console Logs

### 1. App Startup (Both Devices)

```
✅ Socket connected: xxx
📝 Joined 2 chats
🔔 NotificationContext: Requesting permissions...
🔔 NotificationContext: Permission granted: true
📱 NotificationContext: Initial app state: active
🔔 NotificationContext: Setup check {
  hasSocket: true,
  isConnected: true,
  permissionGranted: true,
  userId: "xxx"
}
✅ NotificationContext: Setting up new_message listener
```

### 2. Opening Chat Screen (Device 1 - Murad)

```
🔌 Setting up socket listeners for chat: 6900c1efa002d06470961c21
📝 User Murad joined chat: 6900c1efa002d06470961c21
```

### 3. Sending Message (Device 2 → Device 1)

#### Device 2 (Sender):
```
📤 Sending message...
```

#### Device 1 (Receiver - IN CHAT):
```
🌐 SocketContext: Global new_message event {
  messageId: "xxx",
  chatId: "6900c1efa002d06470961c21",
  sender: "Test User",
  content: "Hello Murad"
}
📨 New message received: {...}
✅ Adding new message to realtime list
```

#### Device 1 (Receiver - IN BACKGROUND):
```
🌐 SocketContext: Global new_message event {
  messageId: "xxx",
  chatId: "6900c1efa002d06470961c21",
  sender: "Test User",
  content: "Hello Murad"
}
🔔 NotificationContext: New message event {
  messageId: "xxx",
  senderId: "yyy",
  currentUserId: "zzz",
  appState: "background"
}
📬 NotificationContext: Showing notification {
  senderName: "Test User",
  messageContent: "Hello Murad"
}
📬 Chat notification shown: Test User
```

### 4. Chat List Update (Both Devices)

```
📨 ClientChatsScreen: New message for chat list {
  chatId: "6900c1efa002d06470961c21",
  content: "Hello Murad"
}
✅ ClientChatsScreen: Chat list updated
```

### 5. App State Changes (Device 1)

#### Going to Background:
```
📱 App state change: {
  from: "active",
  to: "background"
}
```

#### Coming to Foreground:
```
📱 App state change: {
  from: "background",
  to: "active"
}
🧹 App came to foreground - clearing notifications
```

## Troubleshooting

### ❌ Problem: No Socket Connection

**Symptoms:**
```
❌ Socket disconnected: transport close
💥 Socket connection error: ...
```

**Solutions:**
1. Check backend is running: `cd server && npm run dev`
2. Check API_URL in `constants/Variables.js`
3. Check network connectivity
4. Restart app

### ❌ Problem: Permission Not Granted

**Symptoms:**
```
🔔 NotificationContext: Permission granted: false
⏭️ NotificationContext: Skipping setup - missing requirements
```

**Solutions:**
1. Check if running in Expo Go (notifications disabled)
2. Build development build: `eas build --profile development --platform android`
3. Check device notification settings
4. Reinstall app and grant permission

### ❌ Problem: Messages Not Appearing in Chat

**Symptoms:**
```
🌐 SocketContext: Global new_message event {...}
⏭️ Message for different chat, skipping
```

**Solutions:**
1. Check chat IDs match
2. Verify `join_chat` was called
3. Check backend logs for room membership

### ❌ Problem: Chat List Not Updating

**Symptoms:**
- New message appears in chat screen
- Chat list doesn't update
- No log: `📨 ClientChatsScreen: New message for chat list`

**Solutions:**
1. Check if socket listener is set up
2. Verify chat ID normalization
3. Check `realtimeChats` state

### ❌ Problem: Notifications Not Showing

**Symptoms:**
```
🔔 NotificationContext: New message event {...}
⏭️ NotificationContext: App is active, skipping notification
```

**Solutions:**
1. Verify app is in background (not just minimized)
2. Check AppState: should be "background" or "inactive"
3. Check permission is granted
4. Verify not in Expo Go

## Common Issues

### Issue 1: "App is active" when it's in background

**Cause:** AppState not updating correctly

**Fix:**
```javascript
// Check console for:
📱 App state change: { from: "active", to: "background" }

// If not appearing, AppState listener not working
```

### Issue 2: Multiple notifications for same message

**Cause:** Multiple listeners registered

**Fix:**
- Check cleanup in useEffect
- Verify `off()` is called on unmount

### Issue 3: Chat ID mismatch

**Cause:** Backend sends object, frontend expects string

**Fix:**
```javascript
// Already fixed:
const chatId = message.chat?._id || message.chat;
```

## Testing Checklist

### Real-time Messages:
- [ ] Message appears immediately in chat screen
- [ ] No duplicate messages
- [ ] Auto-scroll to bottom
- [ ] Typing indicator works

### Notifications:
- [ ] Permission requested on first launch
- [ ] Notification shows when app in background
- [ ] No notification when app is active
- [ ] Notification clears when app opens
- [ ] Tapping notification opens chat

### Chat List:
- [ ] Last message updates in real-time
- [ ] Timestamp updates
- [ ] Works for both client and trainer
- [ ] No refresh needed

## Debug Commands

### Check Socket Connection:
```javascript
// In console:
socket.connected // should be true
socket.id // should have value
```

### Check Permission:
```javascript
// In NotificationContext:
console.log('Permission:', permissionGranted);
```

### Check AppState:
```javascript
// In NotificationContext:
console.log('Current AppState:', appState.current);
```

### Force Notification (Test):
```javascript
import { showChatNotification } from '@/utils/notificationManager';

showChatNotification({
  senderName: 'Test',
  message: 'Test message',
  chatId: '123',
  senderId: '456',
  senderRole: 'client'
});
```

## Expected Behavior Summary

| Scenario | Chat Screen | Chat List | Notification |
|----------|-------------|-----------|--------------|
| Message received (app active, in chat) | ✅ Shows immediately | ✅ Updates | ❌ No notification |
| Message received (app active, not in chat) | ❌ Not visible | ✅ Updates | ❌ No notification |
| Message received (app background) | ❌ Not visible | ✅ Updates | ✅ Shows notification |
| Own message sent | ✅ Shows immediately | ✅ Updates | ❌ No notification |

## Next Steps

1. **Run both devices**
2. **Open console on Device 1 (Murad)**
3. **Send message from Device 2**
4. **Check console logs match expected output**
5. **If not, identify which step failed**
6. **Use troubleshooting section**

## Contact

If issue persists after following this guide, provide:
- Full console logs from both devices
- Screenshots of issue
- Device info (OS, build type)
- Steps to reproduce
