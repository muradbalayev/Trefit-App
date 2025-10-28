import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import * as SecureStore from 'expo-secure-store';
import { setCredentials, clearCredentials } from "../userAuthSlice";
import { API_URL } from "@/constants/Variables";

// Base query with auth header
const baseQuery = fetchBaseQuery({
  baseUrl: API_URL,
  credentials: "include",
  prepareHeaders: (headers, { getState, endpoint }) => {
    const token = getState()?.userAuth?.accessToken;
    if (token) headers.set("Authorization", `Bearer ${token}`);
    
    // Don't set Content-Type for FormData (multipart/form-data)
    // Let fetch set it automatically with boundary
    if (endpoint === 'completeTask') {
      headers.delete('Content-Type');
    }
    
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

export const userTaskApi = createApi({
  reducerPath: "userTaskApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Task", "Tasks"],
  endpoints: (build) => ({
    // Get my tasks
    getMyTasks: build.query({
      query: (params = {}) => {
        const { status, page = 1, limit = 20 } = params;
        const searchParams = new URLSearchParams({
          page: page.toString(),
          limit: limit.toString(),
        });
        
        if (status && status !== 'all') searchParams.append('status', status);

        return `/user/tasks?${searchParams.toString()}`;
      },
      transformResponse: (response) => {
        if (response?.success && response?.tasks) {
          return {
            tasks: response.tasks,
            pagination: response.pagination
          };
        }
        return response;
      },
      providesTags: ["Tasks"],
    }),

    // Get task details
    getTaskDetails: build.query({
      query: (taskId) => `/user/tasks/${taskId}`,
      transformResponse: (response) => response?.data || response,
      providesTags: (result, error, taskId) => [
        { type: "Task", id: taskId }
      ],
    }),

    // Update task status (mark in progress)
    updateTaskStatus: build.mutation({
      query: ({ taskId, status }) => ({
        url: `/user/tasks/${taskId}/status`,
        method: "PATCH",
        body: { status },
      }),
      invalidatesTags: (result, error, { taskId }) => [
        { type: "Task", id: taskId },
        "Tasks"
      ],
    }),

    // Complete task (with media upload)
    completeTask: build.mutation({
      query: ({ taskId, formData }) => {
        console.log('Complete task API - taskId:', taskId, 'formData:', formData);
        return {
          url: `/user/tasks/${taskId}/complete`,
          method: "POST",
          body: formData,
          headers: {
            // Don't set Content-Type, let browser set it with boundary for FormData
          },
          formData: true,
        };
      },
      invalidatesTags: (result, error, { taskId }) => [
        { type: "Task", id: taskId },
        "Tasks"
      ],
    }),
  }),
});

export const {
  useGetMyTasksQuery,
  useGetTaskDetailsQuery,
  useUpdateTaskStatusMutation,
  useCompleteTaskMutation,
} = userTaskApi;
