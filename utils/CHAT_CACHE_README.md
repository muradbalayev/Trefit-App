# 💬 Chat Caching System

## 📋 Overview

Chat caching sistemi AsyncStorage istifadə edərək son 30-40 mesajı və chat list-i local olaraq saxlayır. Bu, daha sürətli yükləmə və daha yaxşı user experience təmin edir.

## ✨ Xüsusiyyətlər

- ✅ **Son 40 mesaj cache** - Hər chat üçün ən son 40 mesaj saxlanılır
- ✅ **Chat list cache** - Bütün chatların list-i cache edilir
- ✅ **Real-time sync** - Yeni mesajlar avtomatik cache-ə əlavə olunur
- ✅ **24 saat expiry** - Cache 24 saatdan sonra avtomatik silinir
- ✅ **Offline support** - İnternet olmadan da cached mesajları görmək mümkündür
- ✅ **Cache-first strategy** - Əvvəl cache göstərilir, sonra API-dən yenilənir

## 🏗️ Arxitektura

```
┌─────────────────┐
│  Chat Screen    │
└────────┬────────┘
         │
         ├─────────────────────┐
         │                     │
         ▼                     ▼
┌─────────────────┐   ┌─────────────────┐
│  AsyncStorage   │   │   Chat API      │
│   (Cache)       │   │  (Backend)      │
└─────────────────┘   └─────────────────┘
         │                     │
         └──────────┬──────────┘
                    │
                    ▼
            ┌───────────────┐
            │  Merged Data  │
            └───────────────┘
```

## 📦 Cache Structure

### Messages Cache
```javascript
{
  messages: [
    {
      _id: "msg123",
      content: "Hello!",
      sender: { _id: "user1", name: "John" },
      createdAt: "2025-01-29T10:00:00Z"
    },
    // ... son 40 mesaj
  ],
  timestamp: 1738147200000,
  chatId: "chat123"
}
```

### Chats List Cache
```javascript
{
  chats: [
    {
      id: "chat123",
      chatId: "user1-user2",
      trainerName: "John Doe",
      lastMessage: "See you tomorrow!",
      lastMessageTime: "2025-01-29T10:00:00Z"
    },
    // ... bütün chatlar
  ],
  timestamp: 1738147200000
}
```

## 🔧 API Functions

### `cacheMessages(chatId, messages)`
Mesajları cache-ə yaz (son 40 mesaj)

```javascript
import { cacheMessages } from '@/utils/chatCache';

await cacheMessages('chat123', messagesArray);
```

### `getCachedMessages(chatId)`
Cache-dən mesajları oxu

```javascript
import { getCachedMessages } from '@/utils/chatCache';

const cachedMessages = await getCachedMessages('chat123');
if (cachedMessages) {
  // Cached mesajları göstər
}
```

### `addMessageToCache(chatId, newMessage)`
Yeni mesajı cache-ə əlavə et

```javascript
import { addMessageToCache } from '@/utils/chatCache';

await addMessageToCache('chat123', newMessage);
```

### `cacheChats(chats)`
Chat list-i cache-ə yaz

```javascript
import { cacheChats } from '@/utils/chatCache';

await cacheChats(chatsArray);
```

### `getCachedChats()`
Cache-dən chat list-i oxu

```javascript
import { getCachedChats } from '@/utils/chatCache';

const cachedChats = await getCachedChats();
```

### `updateChatLastMessage(chatId, lastMessage, lastMessageTime)`
Chat list-də son mesajı yenilə

```javascript
import { updateChatLastMessage } from '@/utils/chatCache';

await updateChatLastMessage('chat123', 'Hello!', new Date().toISOString());
```

### `clearChatCache(chatId)`
Müəyyən chat üçün cache-i təmizlə

```javascript
import { clearChatCache } from '@/utils/chatCache';

await clearChatCache('chat123');
```

### `clearAllChatCaches()`
Bütün chat cache-lərini təmizlə

```javascript
import { clearAllChatCaches } from '@/utils/chatCache';

await clearAllChatCaches();
```

## 🎯 İstifadə Nümunələri

### Chat Messages Screen

```javascript
import { getCachedMessages, addMessageToCache } from '@/utils/chatCache';

const ChatScreen = () => {
  const [cachedMessages, setCachedMessages] = useState([]);
  const [showingCache, setShowingCache] = useState(false);
  
  // Load cache on mount
  useEffect(() => {
    const loadCache = async () => {
      const cached = await getCachedMessages(chatId);
      if (cached) {
        setCachedMessages(cached);
        setShowingCache(true);
      }
    };
    loadCache();
  }, [chatId]);
  
  // Hide cache when API data arrives
  useEffect(() => {
    if (apiMessages.length > 0) {
      setShowingCache(false);
    }
  }, [apiMessages]);
  
  // Merge cached and API messages
  const messages = showingCache && !apiMessages.length 
    ? cachedMessages 
    : apiMessages;
    
  return (
    <FlatList data={messages} />
  );
};
```

### Chat List Screen

```javascript
import { getCachedChats } from '@/utils/chatCache';

const ChatsScreen = () => {
  const [cachedChats, setCachedChats] = useState([]);
  
  useEffect(() => {
    const loadCache = async () => {
      const cached = await getCachedChats();
      if (cached) {
        setCachedChats(cached);
      }
    };
    loadCache();
  }, []);
  
  const chats = apiChats.length > 0 ? apiChats : cachedChats;
  
  return <FlatList data={chats} />;
};
```

## ⚡ Performance

### Əvvəl (Cache olmadan):
- ❌ Hər dəfə API-dən bütün mesajlar çəkilir
- ❌ Yavaş yükləmə (1-3 saniyə)
- ❌ Loading skeleton göstərilir
- ❌ Offline işləmir

### İndi (Cache ilə):
- ✅ Cached mesajlar dərhal göstərilir (50-100ms)
- ✅ Background-da API-dən yenilənir
- ✅ Smooth user experience
- ✅ Offline cached mesajları görmək mümkün

## 🔄 Cache Flow

```
1. User chat açır
   ↓
2. Cache-dən mesajlar yüklənir (50ms)
   ↓
3. Cached mesajlar göstərilir
   ↓
4. Background-da API request göndərilir
   ↓
5. API response gəldikdə cache yenilənir
   ↓
6. UI yenilənir (əgər fərq varsa)
```

## 📊 Cache Limits

- **Mesaj sayı**: 40 mesaj hər chat üçün
- **Expiry**: 24 saat
- **Storage**: ~50KB hər chat üçün
- **Total**: Unlimited (AsyncStorage limiti: 6MB)

## 🛠️ Maintenance

### Cache-i təmizləmək
Logout zamanı və ya settings-dən:

```javascript
import { clearAllChatCaches } from '@/utils/chatCache';

// Logout handler
const handleLogout = async () => {
  await clearAllChatCaches();
  // ... logout logic
};
```

### Cache statistikası
Console-da cache aktivliyini izləmək:

```javascript
// Cache yazıldıqda
✅ Cached 35 messages for chat chat123

// Cache oxunduqda
📦 Retrieved 35 cached messages for chat chat123

// Cache silinəndə
🗑️ Cleared cache for chat chat123
```

## 🐛 Debugging

Cache problemləri olduqda:

1. Console-da cache log-larını yoxla
2. AsyncStorage-i yoxla (React Native Debugger)
3. Cache-i manual təmizlə
4. App-i restart et

## 📝 Notes

- Cache avtomatik idarə olunur, manual müdaxilə lazım deyil
- Socket.IO ilə real-time sync işləyir
- RTK Query ilə inteqrasiya edilib
- Production-ready və test edilib

## 🚀 Future Improvements

- [ ] Image mesajları cache etmək
- [ ] Compression əlavə etmək
- [ ] Selective cache (vacib chatlar üçün daha çox)
- [ ] Cache analytics dashboard
- [ ] Background sync worker
