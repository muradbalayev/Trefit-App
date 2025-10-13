import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { API_URL } from "@/store/redux/apiConfig";
import * as SecureStore from 'expo-secure-store';
import { setCredentials, clearCredentials } from "../../user/userAuthSlice";

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

export const trainerClientApi = createApi({
  reducerPath: "trainerClientApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["TrainerClient", "TrainerClients"],
  endpoints: (build) => ({
    // Get trainer's clients from enrolled plans
    getMyClients: build.query({
      query: (params = {}) => {
        const { page = 1, limit = 10, planId, search } = params;
        const searchParams = new URLSearchParams({
          page: page.toString(),
          limit: limit.toString(),
        });
        
        if (planId) searchParams.append('planId', planId);
        if (search) searchParams.append('search', search);

        return `/user/trainer/clients?${searchParams.toString()}`;
      },
      transformResponse: (response) => {
        if (response?.success && response?.data) {
          return {
            data: response.data,
            pagination: response.pagination
          };
        }
        return response?.data || response;
      },
      providesTags: ["TrainerClients"],
    }),

    // Get specific client details
    getClientDetails: build.query({
      query: (clientId) => `/user/trainer/clients/${clientId}`,
      transformResponse: (response) => response?.data || response,
      providesTags: (result, error, clientId) => [
        { type: "TrainerClient", id: clientId }
      ],
    }),

    // Send message to client (will be used for chat)
    sendMessageToClient: build.mutation({
      query: ({ clientId, message }) => ({
        url: `/user/trainer/clients/${clientId}/message`,
        method: "POST",
        body: { message },
      }),
      // Bu chat messages-i invalidate edə bilər
    }),
  }),
});

export const {
  useGetMyClientsQuery,
  useGetClientDetailsQuery,
  useSendMessageToClientMutation,
} = trainerClientApi;
