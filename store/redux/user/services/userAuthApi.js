import { createApi } from "@reduxjs/toolkit/query/react";
import { setCredentials, clearCredentials } from "../userAuthSlice";
import * as SecureStore from 'expo-secure-store';
import { userAccountApi } from "./userAccountApi";
import { userProgressApi } from "./userProgressApi";
import { userPlanApi } from "./userPlanApi";
import { userTaskApi } from "./userTaskApi";
import { userTrainerApi } from "./userTrainerApi";
import { userWorkoutProgramApi } from "./userWorkoutProgramApi";
import { chatApi } from "@/store/redux/chat/services/chatApi";
import { clientPlanApi } from "@/store/redux/client/services/clientPlanApi";
import { trainerClientApi } from "@/store/redux/trainer/services/trainerClientApi";
import { trainerPlanApi } from "@/store/redux/trainer/services/trainerPlanApi";
import { trainerTaskApi } from "@/store/redux/trainer/services/trainerTaskApi";
import { trainerWorkoutProgramApi } from "@/store/redux/trainer/services/trainerWorkoutProgramApi";
import { clearAllChatCaches } from "@/utils/chatCache";
import { clearCachedPushToken } from "@/utils/notificationManager";
import { baseQueryWithReauth } from "@/store/redux/utils/baseQueryWithReauth";
import { trainerStatsApi } from "../../trainer/services/trainerStatsApi";


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
    resendVerification: build.mutation({
      query: (data) => ({
        url: "/user/auth/resend-verification",
        method: "POST",
        body: data, // { email }
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
          
          // Clear AsyncStorage chat caches
          await clearAllChatCaches();
          
          // Clear cached push token
          await clearCachedPushToken();
          
          dispatch(clearCredentials());
          
          // Reset ALL API states to clear user-specific cached data
          dispatch(userAuthApi.util.resetApiState()); 
          dispatch(userAccountApi.util.resetApiState());
          dispatch(userProgressApi.util.resetApiState());
          dispatch(userPlanApi.util.resetApiState());
          dispatch(userTaskApi.util.resetApiState());
          dispatch(userTrainerApi.util.resetApiState());
          dispatch(userWorkoutProgramApi.util.resetApiState());
          dispatch(chatApi.util.resetApiState());
          dispatch(clientPlanApi.util.resetApiState());
          dispatch(trainerClientApi.util.resetApiState());
          dispatch(trainerPlanApi.util.resetApiState());
          dispatch(trainerTaskApi.util.resetApiState());
          dispatch(trainerWorkoutProgramApi.util.resetApiState());
          dispatch(trainerStatsApi.util.resetApiState());
          
          console.log('✅ All API caches cleared on logout');
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
    savePushToken: build.mutation({
      query: (expoPushToken) => ({
        url: "/user/auth/push-token",
        method: "POST",
        body: { expoPushToken },
      }),
    }),
    removePushToken: build.mutation({
      query: () => ({
        url: "/user/auth/push-token",
        method: "DELETE",
      }),
    }),
  }),
});

export const {
  useRegisterMutation,
  useRegisterTrainerMutation,
  useVerifyEmailMutation,
  useResendVerificationMutation,
  useLoginMutation,
  useRefreshMutation,
  useLogoutMutation,
  useGetProfileQuery,
  useResetPasswordMutation,
  useForgotPasswordMutation,
  useSavePushTokenMutation,
  useRemovePushTokenMutation,
} = userAuthApi;
