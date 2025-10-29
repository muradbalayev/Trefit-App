import React, { useState, useEffect } from "react";
import { View, StyleSheet, FlatList, Pressable, TextInput, RefreshControl } from "react-native";
import { useSelector } from "react-redux";
import { useNavigate } from "@/hooks/useNavigation";
import { useGetChatsQuery } from "@/store/redux/chat/services/chatApi";
import { useSocket } from "@/contexts/SocketContext";
import { getCachedChats, updateChatLastMessage } from "@/utils/chatCache";
import { Loading } from "@/components/common";
import Colors from "@/constants/Colors";
import Feather from "@expo/vector-icons/Feather";
import { CustomScreen } from "@/components/common";
import AppText from "@/components/ui/Text";
import ScreenHeader from "@/components/common/ScreenHeader";

const ClientChatsScreen = () => {
  const { navigate, goBack } = useNavigate();
  const { user } = useSelector((state) => state.userAuth);
  const [searchQuery, setSearchQuery] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [realtimeChats, setRealtimeChats] = useState({});
  const { socket, lastMessage } = useSocket();
  const [cachedChats, setCachedChats] = useState([]);
  const [showingCache, setShowingCache] = useState(false);
  
  // All hooks must be called before any conditional returns
  const { data: chatsData, isLoading, error, refetch } = useGetChatsQuery();
  
  // Load cached chats on mount
  useEffect(() => {
    const loadCachedChats = async () => {
      const cached = await getCachedChats();
      if (cached && cached.length > 0) {
        setCachedChats(cached);
        setShowingCache(true);
        console.log(`📦 Client: Showing ${cached.length} cached chats`);
      }
    };
    loadCachedChats();
  }, []);
  
  // Hide cache indicator when API data arrives
  useEffect(() => {
    if (chatsData && chatsData.length > 0) {
      setShowingCache(false);
    }
  }, [chatsData]);
  
  // Pull to refresh handler
  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };
  
  // Listen for new messages via global lastMessage state
  useEffect(() => {
    if (!lastMessage) return;
    
    console.log('📨 ClientChatsScreen: New message from global state', {
      chatId: lastMessage.chat,
      content: lastMessage.content?.substring(0, 30)
    });
    
    // Get chat ID (handle both string and object)
    const chatId = lastMessage.chat?._id || lastMessage.chat;
    
    // Update cache
    updateChatLastMessage(chatId, lastMessage.content, lastMessage.createdAt);
    
    // Update last message for this chat
    setRealtimeChats(prev => ({
      ...prev,
      [chatId]: {
        lastMessage: lastMessage.content,
        lastMessageTime: lastMessage.createdAt
      }
    }));
    
    console.log('✅ ClientChatsScreen: Chat list updated');
  }, [lastMessage]);
  
  // Loading state (after all hooks)
  if (isLoading) return <Loading />;
  
  // Error handling
  if (error) {
    console.error('Client chats error:', error);
  }
  
  // Use cached chats if API data not loaded yet
  const chatsToShow = showingCache && !chatsData ? cachedChats : chatsData;
  const chats = Array.isArray(chatsToShow) ? chatsToShow : [];

  const filteredChats = chats.filter(chat =>
    chat.trainerName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    chat.planTitle?.toLowerCase().includes(searchQuery.toLowerCase())
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
  const truncateMessage = (message, maxLength = 50) => {
    if (message.length <= maxLength) return message;
    return message.substring(0, maxLength) + "...";
  };

  const renderChatItem = ({ item: chat }) => {
    // Get real-time data if available
    const realtimeData = realtimeChats[chat.chatId];
    const lastMessage = realtimeData?.lastMessage || chat.lastMessage;
    const lastMessageTime = realtimeData?.lastMessageTime || chat.lastMessageTime || chat.lastActivity;
    
    return (
      <Pressable
        style={styles.chatItem}
        onPress={() => navigate("ChatMessages", { 
          participantId: chat.trainerId,
          participantName: chat.trainerName,
          chatId: chat.chatId 
        })}
      >
        <View style={styles.avatarContainer}>
          <AppText style={styles.avatarText}>
            {chat.trainerName?.split(' ').map(n => n[0]).join('') || 'T'}
          </AppText>
          {chat.unreadCount > 0 && (
            <View style={styles.onlineIndicator} />
          )}
        </View>

      <View style={styles.chatContent}>
        <View style={styles.chatHeader}>
          <AppText style={styles.trainerName} font="SemiBold">
            {chat.trainerName}
          </AppText>
          <AppText style={styles.timeText}>
            {formatTime(lastMessageTime)}
          </AppText>
        </View>

        <AppText style={styles.planTitle} numberOfLines={1}>
          {chat.planTitle}
        </AppText>

        <View style={styles.messageRow}>
          {lastMessage ? (
            <AppText 
              style={styles.lastMessage}
              numberOfLines={1}
            >
              {truncateMessage(lastMessage)}
            </AppText>
          ) : (
            <AppText style={styles.noMessageText} numberOfLines={1}>
              Start chatting with your trainer
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
}

  return (
    <CustomScreen>
      {/* Header */}
      <ScreenHeader title="Messages" action={goBack}/>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Feather name="search" size={20} color={Colors.TEXT_SECONDARY} />
          <TextInput
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search trainers or plans..."
            placeholderTextColor={Colors.TEXT_SECONDARY}
          />
          {searchQuery.length > 0 && (
            <Pressable onPress={() => setSearchQuery("")}>
              <Feather name="x" size={20} color={Colors.TEXT_SECONDARY} />
            </Pressable>
          )}
        </View>
      </View>

      {/* Active Trainers Indicator */}
      <View style={styles.statusContainer}>
        <View style={styles.activeIndicator}>
          <View style={styles.activeStatus} />
          <AppText style={styles.activeText}>
            {filteredChats.filter(chat => chat.unreadCount > 0).length} unread conversations
          </AppText>
        </View>
      </View>

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
            <AppText style={styles.emptyStateText}>No trainers to chat with</AppText>
            <AppText style={styles.emptyStateSubtext}>
              {searchQuery 
                ? "No trainers match your search" 
                : "Enroll in a plan to start chatting with your trainer"
              }
            </AppText>
            {!searchQuery && (
              <Pressable 
                style={styles.browseButton}
                onPress={() => navigate("Trainers")}
              >
                <AppText style={styles.browseButtonText}>Browse Trainers</AppText>
              </Pressable>
            )}
          </View>
        }
      />
    </CustomScreen>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 10,
    paddingBottom: 20,
  },
  title: {
    fontSize: 28,
    color: Colors.TEXT,
    fontWeight: "bold",
  },
  headerActions: {
    flexDirection: "row",
    gap: 8,
  },
  headerButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: Colors.CARD,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: Colors.BORDER,
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
    backgroundColor: Colors.BRAND,
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
  trainerName: {
    fontSize: 16,
    color: Colors.TEXT,
  },
  timeText: {
    fontSize: 12,
    color: Colors.TEXT_SECONDARY,
  },
  planTitle: {
    fontSize: 13,
    color: Colors.BRAND,
    fontWeight: "500",
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
    marginBottom: 20,
    lineHeight: 20,
  },
  browseButton: {
    backgroundColor: Colors.BRAND,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  browseButtonText: {
    fontSize: 14,
    color: "black",
    fontWeight: "600",
  },
});

export default ClientChatsScreen;
