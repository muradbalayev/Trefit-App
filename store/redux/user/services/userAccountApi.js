import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { API_URL } from "@/store/redux/apiConfig";
import * as SecureStore from 'expo-secure-store';
import { setCredentials, clearCredentials } from "../userAuthSlice";

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

export const userAccountApi = createApi({
  reducerPath: "userAccountApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Account"],
  endpoints: (build) => ({
    getAccount: build.query({
      query: () => "/user/account/me",
      transformResponse: (resp) => resp?.user ?? resp,
      providesTags: ["Account"],
    }),
    setUsername: build.mutation({
      query: (payload) => ({
        url: "/user/account/username",
        method: "POST",
        body: payload, // { username }
      }),
      invalidatesTags: ["Account"],
    }),
    updateProfile: build.mutation({
      query: (payload) => ({
        url: "/user/account/profile",
        method: "PUT",
        body: payload, // { name, age, gender, height, weight, goals }
      }),
      invalidatesTags: ["Account"],
      async onQueryStarted(_, { dispatch, queryFulfilled, getState }) {
        try {
          const { data } = await queryFulfilled; // expects { success, message, user }
          if (data?.user) {
            const current = getState()?.userAuth;
            dispatch(setCredentials({
              user: data.user,
              // preserve existing token/role
              accessToken: current?.accessToken,
              role: current?.role ?? data.user?.role,
            }));
          }
        } catch (_) {}
      },
    }),
    updateTrainerProfile: build.mutation({
      query: (payload) => ({
        url: "/user/account/trainer-profile",
        method: "PUT",
        body: payload, // { name, age, gender, height, weight, specialty, bio, experienceYears, workPlace, location, social }
      }),
      invalidatesTags: ["Account"],
      async onQueryStarted(_, { dispatch, queryFulfilled, getState }) {
        try {
          const { data } = await queryFulfilled; // expects { success, message, user }
          if (data?.user) {
            const current = getState()?.userAuth;
            dispatch(setCredentials({
              user: data.user,
              accessToken: current?.accessToken,
              role: current?.role ?? data.user?.role,
            }));
          }
        } catch (_) {}
      },
    }),
    uploadAvatar: build.mutation({
      query: (formData) => ({
        url: "/user/account/avatar",
        method: "POST",
        body: formData,
      }),
      invalidatesTags: ["Account"],
    }),
    updateAvatar: build.mutation({
      query: (formData) => ({
        url: "/user/account/avatar",
        method: "PUT",
        body: formData,
      }),
      invalidatesTags: ["Account"],
    }),
    changePassword: build.mutation({
      query: (payload) => ({
        url: "/user/account/change-password",
        method: "POST",
        body: payload, // { currentPassword, newPassword }
      }),
    }),
    dailyCheckIn: build.mutation({
      query: () => ({
        url: "/user/account/check-in",
        method: "POST",
      }),
      invalidatesTags: ["Account"],
    }),
    updateWeight: build.mutation({
      query: (payload) => ({
        url: "/user/account/weight",
        method: "PUT",
        body: payload, // { weight }
      }),
      invalidatesTags: ["Account"],
    }),
  }),
});

export const { 
  useGetAccountQuery, 
  useSetUsernameMutation,
  useUpdateProfileMutation,
  useUpdateTrainerProfileMutation,
  useUploadAvatarMutation,
  useUpdateAvatarMutation,
  useChangePasswordMutation,
  useDailyCheckInMutation,
  useUpdateWeightMutation
} = userAccountApi;
