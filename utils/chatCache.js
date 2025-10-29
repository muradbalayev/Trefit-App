import AsyncStorage from '@react-native-async-storage/async-storage';

const CACHE_PREFIX = '@trefit_chat_';
const MESSAGES_CACHE_KEY = (chatId) => `${CACHE_PREFIX}messages_${chatId}`;
const CHATS_LIST_CACHE_KEY = `${CACHE_PREFIX}chats_list`;
const MAX_CACHED_MESSAGES = 40; // Son 40 mesaj
const CACHE_EXPIRY = 24 * 60 * 60 * 1000; // 24 saat

/**
 * Chat mesajlarını cache-ə yaz
 * @param {string} chatId - Chat ID
 * @param {Array} messages - Mesajlar array-i
 */
export const cacheMessages = async (chatId, messages) => {
  try {
    if (!chatId || !Array.isArray(messages)) return;

    // Son 40 mesajı götür (ən yenilər) - shallow copy yaradırıq
    const messagesToCache = [...messages]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, MAX_CACHED_MESSAGES);

    const cacheData = {
      messages: messagesToCache,
      timestamp: Date.now(),
      chatId,
    };

    await AsyncStorage.setItem(
      MESSAGES_CACHE_KEY(chatId),
      JSON.stringify(cacheData)
    );

    console.log(`✅ Cached ${messagesToCache.length} messages for chat ${chatId}`);
  } catch (error) {
    console.error('Error caching messages:', error);
  }
};

/**
 * Cache-dən mesajları oxu
 * @param {string} chatId - Chat ID
 * @returns {Array|null} - Cached mesajlar və ya null
 */
export const getCachedMessages = async (chatId) => {
  try {
    if (!chatId) return null;

    const cached = await AsyncStorage.getItem(MESSAGES_CACHE_KEY(chatId));
    if (!cached) return null;

    const cacheData = JSON.parse(cached);
    
    // Cache köhnədirsə, null qaytar
    const isExpired = Date.now() - cacheData.timestamp > CACHE_EXPIRY;
    if (isExpired) {
      await AsyncStorage.removeItem(MESSAGES_CACHE_KEY(chatId));
      console.log(`🗑️ Expired cache removed for chat ${chatId}`);
      return null;
    }

    console.log(`📦 Retrieved ${cacheData.messages.length} cached messages for chat ${chatId}`);
    return cacheData.messages;
  } catch (error) {
    console.error('Error getting cached messages:', error);
    return null;
  }
};

/**
 * Yeni mesaj əlavə et cache-ə
 * @param {string} chatId - Chat ID
 * @param {Object} newMessage - Yeni mesaj
 */
export const addMessageToCache = async (chatId, newMessage) => {
  try {
    if (!chatId || !newMessage) return;

    const cachedMessages = await getCachedMessages(chatId) || [];
    
    // Mesaj artıq cache-də varsa, əlavə etmə
    const exists = cachedMessages.some(msg => msg._id === newMessage._id);
    if (exists) return;

    // Yeni mesajı əlavə et və son 40-ı saxla - shallow copy
    const updatedMessages = [newMessage, ...cachedMessages]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, MAX_CACHED_MESSAGES);

    await cacheMessages(chatId, updatedMessages);
  } catch (error) {
    console.error('Error adding message to cache:', error);
  }
};

/**
 * Chat list-i cache-ə yaz
 * @param {Array} chats - Chatlar array-i
 */
export const cacheChats = async (chats) => {
  try {
    if (!Array.isArray(chats)) return;

    const cacheData = {
      chats,
      timestamp: Date.now(),
    };

    await AsyncStorage.setItem(
      CHATS_LIST_CACHE_KEY,
      JSON.stringify(cacheData)
    );

    console.log(`✅ Cached ${chats.length} chats`);
  } catch (error) {
    console.error('Error caching chats:', error);
  }
};

/**
 * Cache-dən chat list-i oxu
 * @returns {Array|null} - Cached chatlar və ya null
 */
export const getCachedChats = async () => {
  try {
    const cached = await AsyncStorage.getItem(CHATS_LIST_CACHE_KEY);
    if (!cached) return null;

    const cacheData = JSON.parse(cached);
    
    // Cache köhnədirsə, null qaytar
    const isExpired = Date.now() - cacheData.timestamp > CACHE_EXPIRY;
    if (isExpired) {
      await AsyncStorage.removeItem(CHATS_LIST_CACHE_KEY);
      console.log('🗑️ Expired chats cache removed');
      return null;
    }

    console.log(`📦 Retrieved ${cacheData.chats.length} cached chats`);
    return cacheData.chats;
  } catch (error) {
    console.error('Error getting cached chats:', error);
    return null;
  }
};

/**
 * Chat list-də son mesajı yenilə
 * @param {string} chatId - Chat ID
 * @param {string} lastMessage - Son mesaj
 * @param {string} lastMessageTime - Son mesaj vaxtı
 */
export const updateChatLastMessage = async (chatId, lastMessage, lastMessageTime) => {
  try {
    const cachedChats = await getCachedChats();
    if (!cachedChats) return;

    const updatedChats = cachedChats.map(chat => {
      if (chat.chatId === chatId || chat.id === chatId) {
        return {
          ...chat,
          lastMessage,
          lastMessageTime,
          lastActivity: lastMessageTime,
        };
      }
      return chat;
    });

    await cacheChats(updatedChats);
  } catch (error) {
    console.error('Error updating chat last message:', error);
  }
};

/**
 * Müəyyən chat üçün cache-i təmizlə
 * @param {string} chatId - Chat ID
 */
export const clearChatCache = async (chatId) => {
  try {
    await AsyncStorage.removeItem(MESSAGES_CACHE_KEY(chatId));
    console.log(`🗑️ Cleared cache for chat ${chatId}`);
  } catch (error) {
    console.error('Error clearing chat cache:', error);
  }
};

/**
 * Bütün chat cache-lərini təmizlə
 */
export const clearAllChatCaches = async () => {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const chatKeys = keys.filter(key => key.startsWith(CACHE_PREFIX));
    await AsyncStorage.multiRemove(chatKeys);
    console.log(`🗑️ Cleared ${chatKeys.length} chat caches`);
  } catch (error) {
    console.error('Error clearing all chat caches:', error);
  }
};
