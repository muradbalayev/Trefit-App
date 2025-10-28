import React, { useState, useRef, useEffect, useCallback, memo } from "react";
import { View, StyleSheet, FlatList, Pressable, TextInput, KeyboardAvoidingView, Platform, Alert } from "react-native";
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

// Memoized message item component (outside main component)
const MessageItem = memo(({ msg, isMyMessage, showDateSeparator, formatDate, formatTime }) => (
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

const TrainerChatMessagesScreen = ({ route }) => {
  const { navigate, goBack } = useNavigate();
  const { user } = useSelector((state) => state.userAuth);
  
  const { 
    chatId, 
    participantName, 
    participantId, 
    recipientName, 
    recipientId,
    clientId
  } = route?.params || {};
  
  // Handle different parameter formats from different screens
  const actualClientId = participantId || recipientId || clientId;
  const actualClientName = participantName || recipientName;
  
  const [message, setMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [realtimeMessages, setRealtimeMessages] = useState([]);
  const [otherUserTyping, setOtherUserTyping] = useState(false);
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

  // Get or create chat with client
  const { data: chat, isLoading: chatLoading, error: chatError } = useGetChatWithUserQuery(actualClientId, {
    skip: !actualClientId
  });

  // Get messages for the chat
  const { data: messagesData, isLoading: messagesLoading, error: messagesError, refetch } = useGetChatMessagesQuery(
    { chatId: chat?._id }, 
    { skip: !chat?._id }
  );

  // Socket.IO Effects - MUST be before any conditional returns
  useEffect(() => {
    if (!socket || !chat?._id) return;

    console.log('🔌 Trainer: Setting up socket listeners for chat:', chat._id);

    // Listen for new messages
    const handleNewMessage = (data) => {
      console.log('📨 Trainer: New message received:', data);
      const { message: newMessage } = data;
      
      // Add message to realtime list (remove temp message if exists)
      setRealtimeMessages(prev => {
        const filtered = prev.filter(msg => !msg._id.toString().startsWith('temp-'));
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
      console.log('🧹 Trainer: Cleaned up socket listeners');
    };
  }, [socket, chat?._id, user?.id, user?._id]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (allMessages && allMessages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [allMessages]);

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

  // Helper functions - defined BEFORE conditional returns
  const apiMessages = messagesData || [];
  
  const mergedMessages = [...apiMessages, ...realtimeMessages];
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

  const isMessageFromMe = useCallback((message) => {
    const currentUserId = user?._id?.toString();
    const senderId = message.sender?._id?.toString() || message.sender?.toString();
    return currentUserId === senderId;
  }, [user?._id]);

  const formatTime = useCallback((dateString) => {
    return new Date(dateString).toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit', 
      hour12: false 
    });
  }, []);

  const formatDate = useCallback((dateString) => {
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
        day: 'numeric' 
      });
    }
  }, []);

  const shouldShowDateSeparator = useCallback((currentMessage, previousMessage) => {
    if (!previousMessage) return true;
    const currentDate = new Date(currentMessage.createdAt).toDateString();
    const previousDate = new Date(previousMessage.createdAt).toDateString();
    return currentDate !== previousDate;
  }, []);

  const renderMessage = useCallback(({ item: msg, index }) => {
    const isMyMessage = isMessageFromMe(msg);
    const previousMessage = index > 0 ? allMessages[index - 1] : null;
    const showDateSeparator = shouldShowDateSeparator(msg, previousMessage);

    return (
      <MessageItem 
        msg={msg} 
        isMyMessage={isMyMessage} 
        showDateSeparator={showDateSeparator}
        formatDate={formatDate}
        formatTime={formatTime}
      />
    );
  }, [allMessages, isMessageFromMe, shouldShowDateSeparator, formatDate, formatTime]);

  // Handle typing indicators
  const handleTyping = (text) => {
    setMessage(text);
    
    if (chat?._id && socket && isConnected) {
      if (text.trim() && !isTyping) {
        setIsTyping(true);
        startTyping(chat._id);
      }
      
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      
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
    setMessage("");
    
    try {
      const success = socketSendMessage(chat._id, messageContent);
      
      if (!success) {
        Alert.alert("Connection Error", "Please check your internet connection");
        setMessage(messageContent);
      }
      
      if (isTyping) {
        setIsTyping(false);
        stopTyping(chat._id);
      }
    } catch (error) {
      console.error('Send message error:', error);
      Alert.alert("Error", "Failed to send message");
      setMessage(messageContent);
    }
  };

  // Check loading/error states AFTER all hooks
  const isLoading = chatLoading || messagesLoading;
  const hasError = chatError || messagesError;

  // Render loading state
  if (isLoading) {
    return <Loading />;
  }

  // Render error state
  if (hasError) {
    return (
      <CustomScreen>
        <ScreenHeader title="Error" action={() => goBack()} />
        <View style={styles.emptyContainer}>
          <AppText style={styles.emptyText}>
            {chatError?.message || messagesError?.message || "Failed to load chat"}
          </AppText>
          <Pressable style={styles.retryBtn} onPress={() => refetch()}>
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
          title={actualClientName || "Chat"}
          action={() => goBack()}
          actionButton={
            <Pressable 
              style={styles.profileButton}
              onPress={() => navigate("ClientDetails", { clientId: actualClientId })}
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
          keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 20}
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
            ListEmptyComponent={() => (
              <View style={styles.emptyContainer}>
                <Feather name="message-circle" size={64} color={Colors.TEXT_SECONDARY} />
                <AppText style={styles.emptyText}>
                  No messages yet
                </AppText>
                <AppText style={styles.emptySubtext}>
                  Start the conversation with {actualClientName}
                </AppText>
              </View>
            )}
          />

          {/* Typing Indicator */}
          {otherUserTyping && (
            <View style={styles.typingContainer}>
              <AppText style={styles.typingText}>{actualClientName} is typing...</AppText>
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
  profileButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: Colors.CARD,
    alignItems: "center",
    justifyContent: "center",
  },
  messagesList: {
    flex: 1,
  },
  messagesContainer: {
    paddingVertical: 16,
    paddingBottom: 20,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    color: Colors.TEXT,
    marginTop: 16,
    fontWeight: '600',
  },
  emptySubtext: {
    fontSize: 14,
    color: Colors.TEXT_SECONDARY,
    marginTop: 8,
    textAlign: 'center',
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  errorText: {
    fontSize: 16,
    color: Colors.ERROR,
    textAlign: 'center',
  },
  retryBtn: {
    backgroundColor: Colors.BRAND,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  retryText: {
    color: 'black',
    fontSize: 16,
    fontWeight: '600',
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
    paddingVertical: 4,
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
    borderBottomRightRadius: 8,
  },
  theirMessageBubble: {
    backgroundColor: Colors.CARD,
    borderBottomLeftRadius: 8,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  myMessageText: {
    color: "black",
  },
  theirMessageText: {
    color: Colors.TEXT,
  },
  messageTime: {
    fontSize: 11,
    marginBottom: 8,
  },
  myMessageTime: {
    color: Colors.TEXT_SECONDARY,
    textAlign: "right",
  },
  theirMessageTime: {
    color: Colors.TEXT_SECONDARY,
    textAlign: "left",
  },
  typingContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  typingText: {
    fontSize: 12,
    color: Colors.TEXT_SECONDARY,
    fontStyle: 'italic',
  },
  inputContainer: {
    paddingVertical: 12,
    backgroundColor: Colors.BACKGROUND,
    borderTopWidth: 1,
    borderTopColor: Colors.BORDER,
  },
  messageInputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 12,
  },
  messageInput: {
    flex: 1,
    backgroundColor: Colors.CARD,
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: Colors.TEXT,
    maxHeight: 100,
    minHeight: 44,
    borderWidth: 1,
    borderColor: Colors.BORDER,
  },
  connectionStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 8,
    backgroundColor: Colors.ERROR + '20',
    borderRadius: 8,
    marginTop: 8,
  },
  connectionText: {
    fontSize: 12,
    color: Colors.ERROR,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  sendButtonActive: {
    backgroundColor: Colors.BRAND,
  },
  sendButtonInactive: {
    backgroundColor: Colors.CARD,
  },
});

export default TrainerChatMessagesScreen;
