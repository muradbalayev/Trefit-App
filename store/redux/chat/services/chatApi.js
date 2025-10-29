import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "../../utils/baseQueryWithReauth";
import { 
  cacheMessages, 
  getCachedMessages, 
  cacheChats, 
  getCachedChats,
  addMessageToCache,
  updateChatLastMessage 
} from "@/utils/chatCache";

export const chatApi = createApi({
  reducerPath: "chatApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Chat", "Chats", "Messages"],
  endpoints: (build) => ({
    // Get all chats for current user
    getChats: build.query({
      query: (params = {}) => {
        return `/user/chats`;
      },
      transformResponse: (response) => response?.data || response,
      providesTags: ["Chats"],
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          // Cache chats list
          if (data && Array.isArray(data)) {
            await cacheChats(data);
          }
        } catch (error) {
          console.error('Error caching chats:', error);
        }
      },
    }),

    // Get or create chat with specific user
    getChatWithUser: build.query({
      query: (userId) => `/user/chat/with/${userId}`,
      transformResponse: (response) => response?.data || response,
      providesTags: (result, error, userId) => [
        { type: "Chat", id: userId }
      ],
    }),

    // Get messages for a specific chat
    getChatMessages: build.query({
      query: ({ chatId, page = 1, limit = 50 }) => {
        const searchParams = new URLSearchParams({
          page: page.toString(),
          limit: limit.toString(),
        });
        return `/user/chat/${chatId}/messages?${searchParams.toString()}`;
      },
      transformResponse: (response) => response?.data || response,
      providesTags: (result, error, { chatId }) => [
        { type: "Messages", id: chatId }
      ],
      // Optimistically update messages when new message is sent
      serializeQueryArgs: ({ endpointName, queryArgs }) => {
        const { chatId } = queryArgs;
        return `${endpointName}(${chatId})`;
      },
      async onQueryStarted({ chatId }, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          // Cache messages (son 40 mesaj)
          if (data && Array.isArray(data)) {
            await cacheMessages(chatId, data);
          }
        } catch (error) {
          console.error('Error caching messages:', error);
        }
      },
    }),

    // Send message (Socket.IO integration - backup HTTP endpoint)
    sendMessage: build.mutation({
      query: ({ chatId, content, type = "text" }) => ({
        url: `/user/chat/${chatId}/messages`,
        method: "POST", 
        body: { content, type },
      }),
      // Optimistically update the messages cache
      async onQueryStarted({ chatId, content, type }, { dispatch, queryFulfilled, getState }) {
        const patchResult = dispatch(
          chatApi.util.updateQueryData('getChatMessages', { chatId }, (draft) => {
            const tempMessage = {
              id: `temp-${Date.now()}`,
              content,
              type,
              senderId: getState()?.userAuth?.user?.id,
              createdAt: new Date().toISOString(),
              isTemp: true,
            };
            draft.unshift(tempMessage);
          })
        );

        try {
          const result = await queryFulfilled;
          // Replace temp message with real one
          dispatch(
            chatApi.util.updateQueryData('getChatMessages', { chatId }, (draft) => {
              const tempIndex = draft.findIndex(msg => msg.id === `temp-${Date.now()}`);
              if (tempIndex >= 0) {
                draft[tempIndex] = result.data;
              }
            })
          );
        } catch {
          patchResult.undo();
        }
      },
      invalidatesTags: (result, error, { chatId }) => [
        { type: "Messages", id: chatId },
        "Chats"
      ],
    }),

    // Mark messages as read
    markAsRead: build.mutation({
      query: (chatId) => ({
        url: `/user/chat/${chatId}/read`,
        method: "POST",
      }),
      invalidatesTags: (result, error, chatId) => [
        { type: "Chat", id: chatId },
        "Chats"
      ],
    }),

    // Delete message
    deleteMessage: build.mutation({
      query: ({ chatId, messageId }) => ({
        url: `/user/chat/${chatId}/messages/${messageId}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, { chatId }) => [
        { type: "Messages", id: chatId }
      ],
    }),
  }),
});

export const {
  useGetChatsQuery,
  useGetChatWithUserQuery,
  useGetChatMessagesQuery,
  useSendMessageMutation,
  useMarkAsReadMutation,
  useDeleteMessageMutation,
} = chatApi;
