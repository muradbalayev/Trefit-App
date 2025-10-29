import React, { useState, useRef, useEffect, useCallback, memo } from "react";
import { View, StyleSheet, FlatList, Pressable, TextInput, KeyboardAvoidingView, Platform, Alert, ActivityIndicator } from "react-native";
import { useSelector } from "react-redux";
import { useNavigate } from "@/hooks/useNavigation";
import Colors from "@/constants/Colors";
import Feather from "@expo/vector-icons/Feather";
import { CustomScreen, Loading } from "@/components/common";
import ScreenHeader from "@/components/common/ScreenHeader";
import Section from "@/components/common/Section";
import AppText from "@/components/ui/Text";
import { useGetChatWithUserQuery, useGetChatMessagesQuery } from "@/store/redux/chat/services/chatApi";
import { useSocket } from "@/contexts/SocketContext";
import { getCachedMessages, addMessageToCache } from "@/utils/chatCache";

// Skeleton loader for messages
const MessageSkeleton = memo(() => (
  <View style={styles.skeletonContainer}>
    {[1, 2, 3].map((i) => (
      <View key={i} style={[
        styles.skeletonMessage,
        i % 2 === 0 ? styles.skeletonRight : styles.skeletonLeft
      ]}>
        <View style={styles.skeletonBubble} />
      </View>
    ))}
  </View>
));

// Memoized message item component (outside main component)
const MessageItem = memo(({ msg, isMyMessage, showDateSeparator, senderName, formatDate, formatTime }) => (
  <View>
    {showDateSeparator && (
      <View style={styles.dateSeparator}>
        <AppText style={styles.dateText}>{formatDate(msg.createdAt)}</AppText>
      </View>
    )}
    
    <View style={[
      styles.messageContainer,
      isMyMessage ? styles.myMessageContainer : styles.theirMessageContainer
    ]}>
      <View style={[
        styles.messageBubble,
        isMyMessage ? styles.myMessageBubble : styles.theirMessageBubble
      ]}>
        {/* {!isMyMessage && (
          <AppText style={styles.senderName}>
            {senderName}
          </AppText>
        )} */}
        <AppText style={[
          styles.messageText,
          isMyMessage ? styles.myMessageText : styles.theirMessageText
        ]}>
          {msg.content}
        </AppText>
      </View>
      <AppText style={[
        styles.messageTime,
        isMyMessage ? styles.myMessageTime : styles.theirMessageTime
      ]}>
        {formatTime(msg.createdAt)}
      </AppText>
    </View>
  </View>
));

const ChatMessagesScreen = ({ route }) => {
  const { navigate, goBack } = useNavigate();
  const { user } = useSelector((state) => state.userAuth);
  
  const { 
    chatId, 
    participantName, 
    participantId, 
    recipientName, 
    recipientId,
    recipientType 
  } = route?.params || {};
  
  // Handle different parameter formats from different screens
  const actualRecipientId = participantId || recipientId;
  const actualRecipientName = participantName || recipientName;
  
  const [message, setMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [realtimeMessages, setRealtimeMessages] = useState([]);
  const [otherUserTyping, setOtherUserTyping] = useState(false);
  const [cachedMessages, setCachedMessages] = useState([]);
  const [showingCache, setShowingCache] = useState(false);
  const flatListRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  
  // Socket.IO hooks
  const { 
    socket, 
    isConnected, 
    sendMessage: socketSendMessage,
    markMessagesAsRead,
    startTyping,
    stopTyping,
    on,
    off
  } = useSocket();

  // Get or create chat with user
  const { data: chat, isLoading: chatLoading, error: chatError } = useGetChatWithUserQuery(actualRecipientId, {
    skip: !actualRecipientId
  });

  // Get messages for the chat
  const { data: messagesData, isLoading: messagesLoading, error: messagesError, refetch } = useGetChatMessagesQuery(
    { chatId: chat?._id }, 
    { skip: !chat?._id }
  );

  const apiMessages = messagesData || [];
  
  // Load cached messages on mount
  useEffect(() => {
    const loadCachedMessages = async () => {
      if (chat?._id) {
        const cached = await getCachedMessages(chat._id);
        if (cached && cached.length > 0) {
          setCachedMessages(cached);
          setShowingCache(true);
          console.log(`📦 Showing ${cached.length} cached messages while loading`);
        }
      }
    };
    
    loadCachedMessages();
  }, [chat?._id]);
  
  // Hide cache indicator when API data arrives
  useEffect(() => {
    if (messagesData && messagesData.length > 0) {
      setShowingCache(false);
    }
  }, [messagesData]);
  
  // Merge cached, API, and realtime messages
  const messagesToMerge = showingCache && !messagesData 
    ? [...cachedMessages, ...realtimeMessages]
    : [...apiMessages, ...realtimeMessages];
    
  const mergedMessages = messagesToMerge;
  const uniqueMessages = mergedMessages.reduce((acc, current) => {
    const existingIndex = acc.findIndex(msg => msg._id === current._id);
    if (existingIndex === -1) {
      acc.push(current);
    }
    return acc;
  }, []);
  
  const allMessages = uniqueMessages.sort((a, b) => 
    new Date(a.createdAt) - new Date(b.createdAt)
  );

  // Helper: Check if message is sent by current user
  const isMessageFromMe = (message) => {
    const currentUserId = user?._id?.toString();
    const senderId = message.sender?._id?.toString() || message.sender?.toString();
    
    // console.log('🔍 Comparing:', {
    //   currentUserId,
    //   senderId,
    //   isMatch: currentUserId === senderId,
    //   messageContent: message.content
    // });
    
    return currentUserId === senderId;
  };

  // Format time
  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit', 
      hour12: false 
    });
  };

  // Format date for separators
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return "Today";
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined
      });
    }
  };

  // Check if should show date separator
  const shouldShowDateSeparator = (current, previous) => {
    if (!previous) return true;
    
    const currentDate = new Date(current.createdAt).toDateString();
    const previousDate = new Date(previous.createdAt).toDateString();
    
    return currentDate !== previousDate;
  };

  // Socket.IO Effects
  useEffect(() => {
    if (!socket || !chat?._id) return;

    console.log('🔌 Setting up socket listeners for chat:', chat._id);

    // Listen for new messages
    const handleNewMessage = (data) => {
      console.log('📨 New message received:', data);
      const { message: newMessage } = data;
      
      // Add to cache
      if (chat?._id) {
        addMessageToCache(chat._id, newMessage);
      }
 
      // Add message to realtime list (remove temp message if exists)
      setRealtimeMessages(prev => {
        // Remove temp message if this is the real one
        const filtered = prev.filter(msg => !msg._id.toString().startsWith('temp-'));
        
        // Check if message already exists
        const exists = filtered.some(msg => msg._id === newMessage._id);
        if (!exists) {
          return [...filtered, newMessage];
        }
        return filtered;
      });
      
      // Auto-scroll to bottom
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    };

    // Listen for typing indicators
    const handleUserTyping = (data) => {
      const { userId, isTyping: typing } = data;
      if (userId !== user?.id && userId !== user?._id) {
        setOtherUserTyping(typing);
        
        if (typing) {
          // Auto-hide typing after 5 seconds
          setTimeout(() => setOtherUserTyping(false), 5000);
        }
      }
    };

    // Setup listeners
    on('new_message', handleNewMessage);
    on('user_typing', handleUserTyping);

    // Join this specific chat room
    socket.emit('join_chat', { chatId: chat._id });

    // Cleanup
    return () => {
      off('new_message', handleNewMessage);
      off('user_typing', handleUserTyping);
      console.log('🧹 Cleaned up socket listeners');
    };
  }, [socket, chat?._id, user?.id, user?._id]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (allMessages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [allMessages.length]);

  // Refetch messages when screen is focused
  useEffect(() => {
    if (chat?._id) {
      refetch();
    }
  }, [chat?._id]);

  // Clear realtime messages when leaving chat
  useEffect(() => {
    return () => {
      setRealtimeMessages([]);
    };
  }, []);

  // Handle typing indicators
  const handleTyping = (text) => {
    setMessage(text);
    
    if (chat?._id && socket && isConnected) {
      if (text.trim() && !isTyping) {
        setIsTyping(true);
        startTyping(chat._id);
      }
      
      // Clear existing timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      
      // Set new timeout to stop typing
      typingTimeoutRef.current = setTimeout(() => {
        if (isTyping) {
          setIsTyping(false);
          stopTyping(chat._id);
        }
      }, 2000);
    }
  };

  // Send message handler
  const handleSendMessage = async () => {
    if (!message.trim() || !chat?._id || !socket || !isConnected) return;
    
    const messageContent = message.trim();
    setMessage(""); // Clear input immediately
    
    try {
      // Send via Socket.IO (backend will emit back to both users)
      const success = socketSendMessage(chat._id, messageContent);
      
      if (!success) {
        Alert.alert("Connection Error", "Please check your internet connection");
        setMessage(messageContent); // Restore message on error
      }
      
      // Stop typing
      if (isTyping) {
        setIsTyping(false);
        stopTyping(chat._id);
      }
    } catch (error) {
      console.error('Send message error:', error);
      Alert.alert("Error", "Failed to send message");
      setMessage(messageContent); // Restore message on error
    }
  };

  // Navigate to profile based on user role
  const handleProfileNavigation = () => {
    if (user?.role === 'trainer') {
      navigate("ClientDetails", { clientId: actualRecipientId });
    } else {
      // Client viewing trainer profile
      navigate("TrainerDetails", { trainerId: actualRecipientId });
    }
  };

  // Render message item
  const renderMessage = useCallback(({ item: msg, index }) => {
    const isMyMessage = isMessageFromMe(msg);
    const previousMessage = index > 0 ? allMessages[index - 1] : null;
    const showDateSeparator = shouldShowDateSeparator(msg, previousMessage);
    const senderName = msg.sender?.name || msg.senderName || actualRecipientName;

    return (
      <MessageItem 
        msg={msg} 
        isMyMessage={isMyMessage} 
        showDateSeparator={showDateSeparator}
        senderName={senderName}
        formatDate={formatDate}
        formatTime={formatTime}
      />
    );
  }, [allMessages, user?._id, actualRecipientName]);

  // Loading state - show loader only if no cached data
  if ((chatLoading || messagesLoading) && cachedMessages.length === 0) {
    return (
      <Loading />
    );
  }

  // Error state
  if (chatError || messagesError) {
    return (
      <CustomScreen>
        <ScreenHeader title="Chat Error" action={() => goBack()} />
        <View style={styles.errorContainer}>
          <Feather name="alert-circle" size={48} color={Colors.ERROR} />
          <AppText style={styles.errorText}>
            {chatError?.data?.message || messagesError?.data?.message || 'Failed to load chat'}
          </AppText>
          <Pressable style={styles.retryBtn} onPress={() => {
            refetch();
          }}>
            <AppText style={styles.retryText}>Retry</AppText>
          </Pressable>
        </View>
      </CustomScreen>
    );
  }

  return (
    <CustomScreen>
      <View style={styles.headerContainer}>
        <ScreenHeader 
          title={actualRecipientName || "Chat"}
          action={() => goBack()}
          actionButton={
            <Pressable 
              style={styles.profileButton}
              onPress={handleProfileNavigation}
            >
              <Feather name="user" size={20} color={Colors.TEXT} />
            </Pressable>
          }
        />
      </View>

      <Section style={{ flex: 1 }}>
        <KeyboardAvoidingView 
          style={styles.container}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          keyboardVerticalOffset={Platform.OS === "ios" ? 60 : 20}
        >
          {/* Messages List */}
          <FlatList
            ref={flatListRef}
            data={allMessages}
            keyExtractor={(item) => item._id || item.id}
            renderItem={renderMessage}
            style={styles.messagesList}
            contentContainerStyle={styles.messagesContainer}
            showsVerticalScrollIndicator={false}
            removeClippedSubviews={true}
            maxToRenderPerBatch={10}
            updateCellsBatchingPeriod={50}
            initialNumToRender={15}
            windowSize={10}
            onContentSizeChange={() => {
              flatListRef.current?.scrollToEnd({ animated: true });
            }}
            ListHeaderComponent={() => (
              showingCache && messagesLoading ? (
                <View style={styles.loadingHeader}>
                  <ActivityIndicator size="small" color={Colors.BRAND} />
                  <AppText style={styles.loadingText}>Loading latest messages...</AppText>
                </View>
              ) : null
            )}
            ListEmptyComponent={() => (
              messagesLoading && cachedMessages.length === 0 ? (
                <MessageSkeleton />
              ) : (
                <View style={styles.emptyContainer}>
                  <Feather name="message-circle" size={48} color={Colors.TEXT_SECONDARY} />
                  <AppText style={styles.emptyText}>No messages yet</AppText>
                  <AppText style={styles.emptySubtext}>
                    Start the conversation with {actualRecipientName}
                  </AppText>
                </View>
              )
            )}
          />
   {otherUserTyping && (
            <View style={styles.typingContainer}>
              <AppText style={styles.typingText}>{actualRecipientName} is typing...</AppText>
            </View>
          )}

          {/* Message Input */}
          <View style={styles.inputContainer}>
            <View style={styles.messageInputContainer}>
            <TextInput
                style={styles.messageInput}
                value={message}
                onChangeText={handleTyping}
                placeholder="Type a message..."
                placeholderTextColor={Colors.TEXT_SECONDARY}
                multiline
                maxLength={1000}
              />
              <Pressable 
                style={[
                  styles.sendButton,
                  message.trim() ? styles.sendButtonActive : styles.sendButtonInactive
                ]}
                onPress={handleSendMessage}
                disabled={!message.trim() || !isConnected}
              >
                <Feather 
                  name="send" 
                  size={20} 
                  color={message.trim() && isConnected ? "black" : Colors.TEXT_SECONDARY} 
                />
              </Pressable>
            </View>
            
            {/* Connection Status */}
            {!isConnected && (
              <View style={styles.connectionStatus}>
                <Feather name="wifi-off" size={16} color={Colors.ERROR} />
                <AppText style={styles.connectionText}>Connecting...</AppText>
              </View>
            )}
          </View>
        </KeyboardAvoidingView>
      </Section>
    </CustomScreen>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerContainer: {
    backgroundColor: Colors.BACKGROUND,
    paddingTop: Platform.OS === 'ios' ? 0 : 0,
    borderBottomWidth: 1,
    borderBottomColor: Colors.BORDER,
    zIndex: 10,
  },
  errorText: {
    fontSize: 16,
    color: Colors.ERROR,
    textAlign: 'center',
  },
  retryBtn: {
    backgroundColor: Colors.BRAND,
  },
  profileButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: Colors.CARD,
    alignItems: "center",
    justifyContent: "center",
  },
  messagesContainer: {
    paddingVertical: 16,
    paddingBottom: 20,
  },
  dateSeparator: {
    alignItems: "center",
    marginVertical: 16,
  },
  dateText: {
    fontSize: 12,
    color: Colors.TEXT_SECONDARY,
    backgroundColor: Colors.CARD,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  messageContainer: {
    marginBottom: 6,
    alignItems: "flex-end",
  },
  myMessageContainer: {
    alignItems: "flex-end",
  },
  theirMessageContainer: {
    alignItems: "flex-start",
  },
  messageBubble: {
    maxWidth: "80%",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    marginBottom: 4,
  },
  myMessageBubble: {
    backgroundColor: Colors.BRAND,
    borderBottomRightRadius: 6,
  },
  theirMessageBubble: {
    backgroundColor: Colors.CARD,
    borderBottomLeftRadius: 6,
  },
  senderName: {
    fontSize: 12,
    color: Colors.TEXT_SECONDARY,
    marginBottom: 4,
    fontWeight: "500",
  },
  messageText: {
    fontSize: 16,
    lineHeight: 20,
  },
  myMessageText: {
    color: "black",
  },
  theirMessageText: {
    color: Colors.TEXT,
  },
  messageTime: {
    fontSize: 11,
    marginHorizontal: 4,
  },
  myMessageTime: {
    color: Colors.TEXT_SECONDARY,
    textAlign: "right",
  },
  typingContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  typingText: {
    fontSize: 14,
    color: Colors.TEXT_SECONDARY,
    fontStyle: 'italic',
  },
  theirMessageTime: {
    color: Colors.TEXT_SECONDARY,
    textAlign: "left",
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    color: Colors.TEXT_SECONDARY,
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: Colors.TEXT_SECONDARY,
    textAlign: "center",
  },
  inputContainer: {
    borderTopWidth: 1,
    borderTopColor: Colors.BORDER,
    backgroundColor: Colors.BACKGROUND,
  },
  messageInputContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingVertical: 12,
    gap: 12,
  },
  messageInput: {
    flex: 1,
    backgroundColor: Colors.CARD,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: Colors.TEXT,
    maxHeight: 100,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  sendButtonActive: {
    backgroundColor: Colors.BRAND,
  },
  sendButtonInactive: {
    opacity: 0.5,
  },
  skeletonContainer: {
    padding: 16,
    gap: 16,
  },
  skeletonMessage: {
    flexDirection: 'row',
  },
  skeletonLeft: {
    justifyContent: 'flex-start',
  },
  skeletonRight: {
    justifyContent: 'flex-end',
  },
  skeletonBubble: {
    width: '70%',
    height: 60,
    backgroundColor: Colors.CARD,
    borderRadius: 16,
    opacity: 0.5,
  },
  loadingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    backgroundColor: Colors.SECONDARY,
    borderRadius: 8,
    marginBottom: 16,
  },
  loadingText: {
    fontSize: 12,
    color: Colors.TEXT_SECONDARY,
  },
  connectionStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: Colors.ERROR + '20',
    gap: 8,
  },
  connectionText: {
    fontSize: 12,
    color: Colors.ERROR,
  },
});

export default ChatMessagesScreen;
