import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import * as SecureStore from 'expo-secure-store';
import { setCredentials, clearCredentials } from "../../user/userAuthSlice";
import { API_URL } from "@/constants/Variables";

// Base query with auth header
const baseQuery = fetchBaseQuery({
  baseUrl: API_URL,
  credentials: "include",
  prepareHeaders: (headers, { getState }) => {
    const token = getState()?.userAuth?.accessToken;
    if (token) headers.set("Authorization", `Bearer ${token}`);
    return headers;
  },
});

// Keys used in userAuthApi
const ACCESS_TOKEN_KEY = 'auth_access_token';
const REFRESH_TOKEN_KEY = 'auth_refresh_token';

// Wrapper that handles 401 -> try refresh -> retry original
const baseQueryWithReauth = async (args, api, extraOptions) => {
  let result = await baseQuery(args, api, extraOptions);
  if (result?.error?.status === 401) {
    try {
      const refreshToken = await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
      if (refreshToken) {
        const refreshResult = await baseQuery({
          url: "/user/auth/refresh",
          method: "POST",
          body: { refreshToken },
        }, api, extraOptions);

        const newAccess = refreshResult?.data?.accessToken;
        if (newAccess) {
          await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, newAccess);
          api.dispatch(setCredentials({ accessToken: newAccess }));
          // retry original request
          result = await baseQuery(args, api, extraOptions);
        } else {
          // refresh failed -> clear auth
          await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
          await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
          api.dispatch(clearCredentials());
        }
      } else {
        // no refresh token -> logout
        api.dispatch(clearCredentials());
      }
    } catch (e) {
      api.dispatch(clearCredentials());
    }
  }
  return result;
}

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
