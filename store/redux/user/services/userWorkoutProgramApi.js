import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import * as SecureStore from 'expo-secure-store';
import { setCredentials, clearCredentials } from "../userAuthSlice";
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

export const userWorkoutProgramApi = createApi({
  reducerPath: "userWorkoutProgramApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["WorkoutProgram"],
  endpoints: (build) => ({
    // Get my workout program (from enrolled plan)
    getMyWorkoutProgram: build.query({
      query: () => `/user/workout-program`,
      transformResponse: (response) => response?.data || response,
      providesTags: ["WorkoutProgram"],
    }),
    
    // Get download URL for workout file
    getWorkoutDownloadUrl: build.query({
      query: (programId) => ({
        url: `/user/workout-program/download/${programId}`,
        responseHandler: 'text', // Don't parse as JSON
      }),
      // Return the full URL with token for browser/WebView
      transformResponse: (response, meta, arg) => {
        return `${API_URL}/user/workout-program/download/${arg}`;
      },
    }),
  }),
});

export const {
  useGetMyWorkoutProgramQuery,
  useLazyGetWorkoutDownloadUrlQuery,
} = userWorkoutProgramApi;
