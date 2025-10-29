import { API_URL } from '@/constants/Variables';
import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import io from 'socket.io-client';

// Socket.IO server base URL (without /api path)
const SOCKET_URL = API_URL.replace('/api', '');

const SocketContext = createContext();

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

export const SocketProvider = ({ children }) => {
  const { accessToken, isAuthenticated } = useSelector((state) => state.userAuth);
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState(new Set());
  
  // Global event emitter for cross-component communication
  const [lastMessage, setLastMessage] = useState(null);
  
  // Reconnection state
  const [isReconnecting, setIsReconnecting] = useState(false);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;

  // Initialize socket connection
  useEffect(() => {
    if (isAuthenticated && accessToken) {
      console.log('🔌 Initializing Socket.IO connection to:', SOCKET_URL);
      console.log('🔑 Auth token:', accessToken ? 'Present' : 'Missing');
      
      const newSocket = io(SOCKET_URL, {
        auth: {
          token: accessToken
        },
        transports: ['websocket', 'polling'],
        timeout: 20000,
        forceNew: true,
        debug: true
      });

      // Connection event handlers
      newSocket.on('connect', () => {
        console.log('✅ Socket connected:', newSocket.id);
        setIsConnected(true);
        setIsReconnecting(false);
        reconnectAttempts.current = 0;
        
        // Join user's chats
        newSocket.emit('join_chats');
      });

      newSocket.on('disconnect', (reason) => {
        console.log('❌ Socket disconnected:', reason);
        setIsConnected(false);
      });

      newSocket.on('connect_error', (error) => {
        console.error('💥 Socket connection error:', error.message);
        console.error('💥 Error details:', error);
        setIsConnected(false);
        
        // Handle reconnection
        if (reconnectAttempts.current < maxReconnectAttempts) {
          setIsReconnecting(true);
          reconnectAttempts.current += 1;
          console.log(`🔄 Reconnection attempt ${reconnectAttempts.current}/${maxReconnectAttempts}`);
        }
      });

      // Chat events
      newSocket.on('joined_chats', (data) => {
        console.log(`📝 Joined ${data.chatCount} chats`);
      });

      newSocket.on('error', (error) => {
        console.error('⚠️ Socket error:', error.message);
      });

      // Global new_message listener - broadcasts to all components
      newSocket.on('new_message', (data) => {
        const timestamp = Date.now();
        
        console.log('🌐 SocketContext: Raw data from backend', {
          messageId: data.message?._id,
          senderField: data.message?.sender,
          senderType: typeof data.message?.sender,
          timestamp
        });
        
        console.log('🌐 SocketContext: Global new_message event', {
          messageId: data.message?._id,
          chatId: data.message?.chat,
          senderId: data.message?.sender?._id || data.message?.sender,
          senderName: data.message?.sender?.name,
          content: data.message?.content?.substring(0, 50)
        });
        
        // CRITICAL: Create completely new object to trigger React re-render
        // Use timestamp + messageId as unique key
        const broadcastMessage = {
          ...data.message,
          _timestamp: timestamp,
          _uniqueKey: `${data.message?._id}_${timestamp}`
        };
        
        console.log('📤 SocketContext: Broadcasting message', {
          uniqueKey: broadcastMessage._uniqueKey,
          senderId: broadcastMessage.sender?._id || broadcastMessage.sender
        });
        
        setLastMessage(broadcastMessage);
      });

      setSocket(newSocket);

      return () => {
        console.log('🔌 Cleaning up socket connection...');
        newSocket.disconnect();
        setSocket(null);
        setIsConnected(false);
      };
    } else {
      // User logged out or not authenticated
      if (socket) {
        console.log('🔌 User logged out, disconnecting socket...');
        socket.disconnect();
        setSocket(null);
        setIsConnected(false);
      }
    }
  }, [isAuthenticated, accessToken]);

  // Socket helper functions
  const joinChat = (chatId) => {
    if (socket && isConnected) {
      socket.emit('join_chat', { chatId });
    }
  };

  const leaveChat = (chatId) => {
    if (socket && isConnected) {
      socket.emit('leave_chat', { chatId });
    }
  };

  const sendMessage = (chatId, content, type = 'text', fileData = null) => {
    if (socket && isConnected) {
      socket.emit('send_message', {
        chatId,
        content,
        type,
        fileData
      });
      return true;
    }
    return false;
  };

  const markMessagesAsRead = (chatId) => {
    if (socket && isConnected) {
      socket.emit('mark_messages_read', { chatId });
    }
  };

  const startTyping = (chatId) => {
    if (socket && isConnected) {
      socket.emit('typing_start', { chatId });
    }
  };

  const stopTyping = (chatId) => {
    if (socket && isConnected) {
      socket.emit('typing_stop', { chatId });
    }
  };

  const createChat = (participantId) => {
    if (socket && isConnected) {
      socket.emit('create_chat', { participantId });
      return true;
    }
    return false;
  };

  // Subscribe to socket events (for components)
  const on = (event, callback) => {
    if (socket) {
      socket.on(event, callback);
    }
  };

  const off = (event, callback) => {
    if (socket) {
      socket.off(event, callback);
    }
  };

  const value = {
    socket,
    isConnected,
    isReconnecting,
    onlineUsers,
    lastMessage, // Global message broadcast
    
    // Helper functions
    joinChat,
    leaveChat,
    sendMessage,
    markMessagesAsRead,
    startTyping,
    stopTyping,
    createChat,
    on,
    off,
    
    // Connection state
    reconnectAttempts: reconnectAttempts.current,
    maxReconnectAttempts
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};

export default SocketContext;
