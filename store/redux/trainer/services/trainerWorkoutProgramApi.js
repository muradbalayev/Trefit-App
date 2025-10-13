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

export const trainerWorkoutProgramApi = createApi({
  reducerPath: "trainerWorkoutProgramApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["WorkoutProgram", "WorkoutPrograms"],
  endpoints: (build) => ({
    // Upload default workout program (PDF)
    uploadWorkoutProgram: build.mutation({
      query: ({ planId, formData }) => ({
        url: `/user/trainer/workout-program/${planId}`,
        method: "POST",
        body: formData,
      }),
      invalidatesTags: (result, error, { planId }) => [
        { type: "WorkoutProgram", id: planId },
        "WorkoutPrograms"
      ],
    }),

    // Upload personalized workout program (PDF) for specific client
    uploadPersonalizedWorkoutProgram: build.mutation({
      query: ({ planId, enrollmentId, formData }) => ({
        url: `/user/trainer/workout-program/${planId}/enrollment/${enrollmentId}`,
        method: "POST",
        body: formData,
      }),
      invalidatesTags: (result, error, { planId, enrollmentId }) => [
        { type: "WorkoutProgram", id: planId },
        { type: "WorkoutProgram", id: enrollmentId },
        "WorkoutPrograms"
      ],
    }),

    // Get workout program for plan
    getWorkoutProgram: build.query({
      query: (planId) => `/user/trainer/workout-program/${planId}`,
      transformResponse: (response) => response?.data || response,
      providesTags: (result, error, planId) => [
        { type: "WorkoutProgram", id: planId }
      ],
    }),

    // Delete workout program
    deleteWorkoutProgram: build.mutation({
      query: (planId) => ({
        url: `/user/trainer/workout-program/${planId}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, planId) => [
        { type: "WorkoutProgram", id: planId },
        "WorkoutPrograms"
      ],
    }),
  }),
});

export const {
  useUploadWorkoutProgramMutation,
  useUploadPersonalizedWorkoutProgramMutation,
  useGetWorkoutProgramQuery,
  useDeleteWorkoutProgramMutation,
} = trainerWorkoutProgramApi;
