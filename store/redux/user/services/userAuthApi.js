import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { setCredentials, clearCredentials } from "../userAuthSlice";
import * as SecureStore from 'expo-secure-store';
import { userAccountApi } from "./userAccountApi";
import { chatApi } from "@/store/redux/chat/services/chatApi";
import { API_URL } from "@/constants/Variables";


// Token storage keys
const ACCESS_TOKEN_KEY = 'auth_access_token';
const REFRESH_TOKEN_KEY = 'auth_refresh_token';

// Save tokens to secure storage
export const saveTokens = async (accessToken, refreshToken) => {
  try {
    if (accessToken) {
      await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, accessToken);
    }
    if (refreshToken) {
      await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, refreshToken);
    }
    return true;
  } catch (error) {
    console.error('Error saving tokens:', error);
    return false;
  }
};

// Get tokens from secure storage
export const getTokens = async () => {
  try {
    const accessToken = await SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
    const refreshToken = await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
    return { accessToken, refreshToken };
  } catch (error) {
    console.error('Error getting tokens:', error);
    return { accessToken: null, refreshToken: null };
  }
};

// Remove tokens from secure storage
export const removeTokens = async () => {
  try {
    await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
    await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
    return true;
  } catch (error) {
    console.error('Error removing tokens:', error);
    return false;
  }
};

// Base query with auth header and credentials
const baseQuery = fetchBaseQuery({
  baseUrl: API_URL,
  credentials: 'include', // Important for cookies
  prepareHeaders: (headers, { getState }) => {
    const token = getState()?.userAuth?.accessToken;
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
    return headers;
  },
});

// Base query with automatic token refresh on 401
const baseQueryWithReauth = async (args, api, extraOptions) => {
  let result = await baseQuery(args, api, extraOptions);

  // If we get a 401 error, try to refresh the token
  if (result?.error?.status === 401) {
    console.log('401 detected, attempting token refresh...');
    
    // Get refresh token from secure storage
    const { refreshToken } = await getTokens();
    
    if (refreshToken) {
      // Try to refresh the token
      const refreshResult = await baseQuery(
        {
          url: '/user/auth/refresh',
          method: 'POST',
          body: { refreshToken },
        },
        api,
        extraOptions
      );

      if (refreshResult?.data?.accessToken) {
        // Store the new token
        await saveTokens(refreshResult.data.accessToken, null);
        api.dispatch(setCredentials({ accessToken: refreshResult.data.accessToken }));
        
        // Retry the original query with new token
        result = await baseQuery(args, api, extraOptions);
      } else {
        // Refresh failed, logout user
        console.log('Token refresh failed, logging out...');
        await removeTokens();
        api.dispatch(clearCredentials());
      }
    } else {
      // No refresh token, logout user
      console.log('No refresh token found, logging out...');
      await removeTokens();
      api.dispatch(clearCredentials());
    }
  }

  return result;
};

export const userAuthApi = createApi({
  reducerPath: "userAuthApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ['User', 'Account'],
  endpoints: (build) => ({
    register: build.mutation({
      query: (credentials) => ({
        url: "/user/auth/register",
        method: "POST",
        body: credentials,
      }),
    }),
    registerTrainer: build.mutation({
      // payload must be a FormData instance with fields and files: cv (required), certifications[] (optional)
      query: (formData) => ({
        url: "/user/auth/register/trainer",
        method: "POST",
        body: formData,
        // FormData üçün Content-Type avtomatik set olunur, manual set etmə
        formData: true,
      }),
    }),
    verifyEmail: build.mutation({
      query: (data) => ({
        url: "/user/auth/verify-email",
        method: "POST",
        body: data, // { code }
      }),
    }),
    forgotPassword: build.mutation({
      query: (payload) => ({
        url: "/user/auth/forgot-password",
        method: "POST",
        body: payload, // { email }
      }),
    }),
    resetPassword: build.mutation({
      query: ({ token, password }) => ({
        url: `/user/auth/reset-password/${token}`,
        method: "POST",
        body: { password },
      }),
    }),
    login: build.mutation({
      query: (credentials) => ({
        url: "/user/auth/login",
        method: "POST",
        body: credentials,
      }),
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          // Save tokens to secure storage
          if (data?.accessToken && data?.refreshToken) {
            await saveTokens(data.accessToken, data.refreshToken);
            // Ensure Redux holds the access token and role immediately for instant navigation
            dispatch(setCredentials({ 
              accessToken: data.accessToken,
              role: data.user?.role,
              user: data.user,
              // Bring needsUsernameSetup explicitly for immediate navigation
              needsUsernameSetup: typeof data.user?.needsUsernameSetup !== 'undefined'
                ? data.user.needsUsernameSetup
                : (typeof data.user?.username !== 'undefined' ? !data.user.username : null),
              // Set haveTrainer from login response
              haveTrainer: data.user?.haveTrainer || null,
            }));
            // Clear any cached account from previous session to avoid navigator flash
            dispatch(userAccountApi.util.resetApiState());
          }
        } catch (error) {
          console.error('Login error:', error);
        }
      }
    }),
    refresh: build.mutation({
      query: (refreshToken) => ({
        url: "/user/auth/refresh",
        method: "POST",
        body: refreshToken ? { refreshToken } : undefined,
      }),
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          // Save new access token to secure storage
          if (data?.accessToken) {
            await saveTokens(data.accessToken, null);
            // Update Redux state
            dispatch(setCredentials({ accessToken: data.accessToken }));
          }
        } catch (error) {
          console.error('Refresh error:', error);
        }
      }
    }),
    logout: build.mutation({
      query: () => ({
        url: "/user/auth/logout",
        method: "POST",
      }),
      invalidatesTags: ["User", "Account"],
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          await removeTokens();
          dispatch(clearCredentials());
          // Reset all API states
          dispatch(userAuthApi.util.resetApiState()); 
          dispatch(userAccountApi.util.resetApiState());
          dispatch(chatApi.util.resetApiState());
        } catch (error) {
          console.error('Logout error:', error);
        }
      }
    }),
    getProfile: build.query({
      query: () => "/user/auth/check-auth",
      transformResponse: (response) => response?.user,
      providesTags: ['User'],
    }),
  }),
});

export const {
  useRegisterMutation,
  useRegisterTrainerMutation,
  useVerifyEmailMutation,
  useLoginMutation,
  useRefreshMutation,
  useLogoutMutation,
  useGetProfileQuery,
  useResetPasswordMutation,
  useForgotPasswordMutation,
} = userAuthApi;
