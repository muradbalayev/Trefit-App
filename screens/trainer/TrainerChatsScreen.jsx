import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, FlatList, Pressable, TextInput, RefreshControl } from "react-native";
import { useSelector } from "react-redux";
import { useNavigate } from "@/hooks/useNavigation";
import { useGetChatsQuery } from "@/store/redux/chat/services/chatApi";
import { useSocket } from "@/contexts/SocketContext";
import { Loading } from "@/components/common";
import Colors from "@/constants/Colors";
import Feather from "@expo/vector-icons/Feather";
import { CustomScreen } from "@/components/common";
import ScreenHeader from "@/components/common/ScreenHeader";
import AppText from "@/components/ui/Text";

const TrainerChatsScreen = () => {
  const { navigate, goBack } = useNavigate();
  const { user } = useSelector((state) => state.userAuth);
  const [searchQuery, setSearchQuery] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [realtimeChats, setRealtimeChats] = useState({});
  
  // Socket.IO
  const { socket, on, off } = useSocket();
  
  // Get trainer's chats from API (same endpoint, backend checks role)
  const { data: chatsData, isLoading, error, refetch } = useGetChatsQuery();
  
  // Pull to refresh handler
  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };
  
  // Listen for new messages to update last message
  useEffect(() => {
    if (!socket) return;
    
    const handleNewMessage = (data) => {
      const { message } = data;
      // Update last message for this chat
      setRealtimeChats(prev => ({
        ...prev,
        [message.chat]: {
          lastMessage: message.content,
          lastMessageTime: message.createdAt
        }
      }));
    };
    
    on('new_message', handleNewMessage);
    
    return () => {
      off('new_message', handleNewMessage);
    };
  }, [socket, on, off]);
  
  // Loading state
  if (isLoading) return <Loading />;
  
  // Error handling
  if (error) {
    console.error('Trainer chats error:', error);
  }
  
  const chats = Array.isArray(chatsData) ? chatsData : [];
  
  const filteredChats = chats.filter(chat =>
    (chat.clientName || chat.participantName)?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    
    // Less than 24 hours - show time
    if (diff < 24 * 60 * 60 * 1000) {
      return date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit', 
        hour12: false 
      });
    }
    
    // Less than 7 days - show day
    if (diff < 7 * 24 * 60 * 60 * 1000) {
      return date.toLocaleDateString('en-US', { weekday: 'short' });
    }
    
    // Older - show date
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const truncateMessage = (message, maxLength = 45) => {
    if (message.length <= maxLength) return message;
    return message.substring(0, maxLength) + "...";
  };

  const renderChatItem = ({ item: chat }) => {
    const clientName = chat.clientName || chat.participantName;
    const clientId = chat.clientId || chat.participantId;
    
    // Get real-time data if available
    const realtimeData = realtimeChats[chat.chatId];
    const lastMessage = realtimeData?.lastMessage || chat.lastMessage;
    const lastMessageTime = realtimeData?.lastMessageTime || chat.lastMessageTime || chat.lastActivity || chat.lastMessage?.createdAt;
    
    return (
      <Pressable
        style={styles.chatItem}
        onPress={() => navigate("ChatMessages", { 
          chatId: chat.chatId || chat.id,
          participantName: clientName,
          participantId: clientId,
          clientId: clientId
        })}
      >
        <View style={styles.avatarContainer}>
          <AppText style={styles.avatarText}>
            {clientName?.split(' ').map(n => n[0]).join('') || 'C'}
          </AppText>
        {chat.unreadCount > 0 && (
          <View style={styles.onlineIndicator} />
        )}
      </View>

      <View style={styles.chatContent}>
        <View style={styles.chatHeader}>
          <AppText style={styles.participantName} font="SemiBold">
            {clientName}
          </AppText>
          <AppText style={styles.timeText}>
            {formatTime(lastMessageTime)}
          </AppText>
        </View>

        <View style={styles.messageRow}>
          {lastMessage ? (
            <AppText 
              style={styles.lastMessage}
              numberOfLines={1}
            >
              {truncateMessage(typeof lastMessage === 'string' ? lastMessage : lastMessage.content || "No messages yet")}
            </AppText>
          ) : (
            <AppText style={styles.noMessageText} numberOfLines={1}>
              Start chatting with your client
            </AppText>
          )}
          
          {chat.unreadCount > 0 && (
            <View style={styles.unreadBadge}>
              <AppText style={styles.unreadCount}>
                {chat.unreadCount > 9 ? "9+" : chat.unreadCount}
              </AppText>
            </View>
          )}
        </View>
      </View>
    </Pressable>
    );
  };

  return (
    <CustomScreen>
      <ScreenHeader 
        title="Messages" 
        action={() => goBack()}
        actionButton={
          <Pressable style={styles.newChatButton}>
            <Feather name="edit" size={20} color={Colors.TEXT} />
          </Pressable>
        }
      />

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Feather name="search" size={20} color={Colors.TEXT_SECONDARY} />
          <TextInput
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search clients..."
            placeholderTextColor={Colors.TEXT_SECONDARY}
          />
          {searchQuery.length > 0 && (
            <Pressable onPress={() => setSearchQuery("")}>
              <Feather name="x" size={20} color={Colors.TEXT_SECONDARY} />
            </Pressable>
          )}
        </View>
      </View>

      {/* Active Clients Indicator */}
      {/* <View style={styles.statusContainer}>
        <View style={styles.activeIndicator}>
          <View style={styles.activeStatus} />
          <AppText style={styles.activeText}>
            {filteredChats.filter(chat => chat.unreadCount > 0).length} active conversations
          </AppText>
        </View>
      </View> */}

      {/* Chats List */}
      <FlatList
        data={filteredChats}
        renderItem={renderChatItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.chatsList}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[Colors.BRAND]}
            tintColor={Colors.BRAND}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Feather name="message-circle" size={48} color={Colors.TEXT_SECONDARY} />
            <AppText style={styles.emptyStateText}>No conversations yet</AppText>
            <AppText style={styles.emptyStateSubtext}>
              {searchQuery ? "No clients match your search" : "Start chatting with your clients"}
            </AppText>
          </View>
        }
      />
    </CustomScreen>
  );
};

const styles = StyleSheet.create({
  newChatButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: Colors.CARD,
    alignItems: "center",
    justifyContent: "center",
  },
  searchContainer: {
    marginVertical: 16,
  },
  searchInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.CARD,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 6,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: Colors.TEXT,
  },
  statusContainer: {
    marginBottom: 20,
  },
  activeIndicator: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  activeStatus: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.SUCCESS,
  },
  activeText: {
    fontSize: 14,
    color: Colors.TEXT_SECONDARY,
  },
  chatsList: {
    paddingBottom: 100,
  },
  chatItem: {
    flexDirection: "row",
    backgroundColor: Colors.CARD,
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    alignItems: "center",
    gap: 12,
  },
  avatarContainer: {
    position: "relative",
  },
  avatarText: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: Colors.BRAND,
    textAlign: "center",
    textAlignVertical: "center",
    fontSize: 16,
    color: "black",
    fontWeight: "600",
    lineHeight: 48,
  },
  onlineIndicator: {
    position: "absolute",
    top: -2,
    right: -2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: Colors.SUCCESS,
    borderWidth: 2,
    borderColor: Colors.CARD,
  },
  chatContent: {
    flex: 1,
    gap: 4,
  },
  chatHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  participantName: {
    fontSize: 16,
    color: Colors.TEXT,
  },
  timeText: {
    fontSize: 12,
    color: Colors.TEXT_SECONDARY,
  },
  messageRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  lastMessage: {
    fontSize: 14,
    color: Colors.TEXT_SECONDARY,
    flex: 1,
    marginRight: 8,
  },
  unreadMessage: {
    color: Colors.TEXT,
    fontWeight: "500",
  },
  noMessageText: {
    fontSize: 14,
    color: Colors.TEXT_SECONDARY,
    fontStyle: "italic",
    flex: 1,
    marginRight: 8,
  },
  unreadBadge: {
    backgroundColor: Colors.BRAND,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 6,
  },
  unreadCount: {
    fontSize: 12,
    color: "black",
    fontWeight: "600",
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  emptyStateText: {
    fontSize: 18,
    color: Colors.TEXT,
    fontWeight: "600",
    marginTop: 16,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: Colors.TEXT_SECONDARY,
    textAlign: "center",
    marginTop: 8,
    lineHeight: 20,
  },
});

export default TrainerChatsScreen;
