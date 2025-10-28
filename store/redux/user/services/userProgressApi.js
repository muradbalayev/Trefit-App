import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { setCredentials, clearCredentials } from "../userAuthSlice";
import * as SecureStore from 'expo-secure-store';
import { API_URL } from "@/constants/Variables";

// Reauth logic for token refresh
const baseQueryWithReauth = async (args, api, extraOptions) => {
  const baseQuery = fetchBaseQuery({
    baseUrl: API_URL,
    credentials: 'include',
    prepareHeaders: (headers, { getState }) => {
      const token = getState()?.userAuth?.accessToken;
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      return headers;
    },
  });

  let result = await baseQuery(args, api, extraOptions);

  if (result?.error?.status === 401) {
    // Try to refresh token
    try {
      const refreshToken = await SecureStore.getItemAsync('auth_refresh_token');
      if (refreshToken) {
        const refreshResult = await baseQuery({
          url: '/user/auth/refresh',
          method: 'POST',
          body: { refreshToken }
        }, api, extraOptions);

        if (refreshResult?.data?.accessToken) {
          await SecureStore.setItemAsync('auth_access_token', refreshResult.data.accessToken);
          api.dispatch(setCredentials({ accessToken: refreshResult.data.accessToken }));
          result = await baseQuery(args, api, extraOptions);
        } else {
          api.dispatch(clearCredentials());
        }
      } else {
        api.dispatch(clearCredentials());
      }
    } catch (e) {
      api.dispatch(clearCredentials());
    }
  }
  return result;
};

export const userProgressApi = createApi({
  reducerPath: "userProgressApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["ProgressPhotos"],
  endpoints: (build) => ({
    // Get all progress photos (all weeks)
    getProgressPhotos: build.query({
      query: () => `/user/progress/photos`,
      transformResponse: (response) => response?.data || { currentWeek: 1, weeklyPhotos: [] },
      providesTags: ["ProgressPhotos"],
    }),

    // Upload progress photo for current week
    uploadProgressPhoto: build.mutation({
      query: ({ photo, type }) => {
        const formData = new FormData();
        formData.append('photo', {
          uri: photo.uri,
          type: photo.type || 'image/jpeg',
          name: photo.fileName || `progress-${Date.now()}.jpg`,
        });
        formData.append('type', type);

        return {
          url: '/user/progress/photos',
          method: 'POST',
          body: formData,
          formData: true,
        };
      },
      invalidatesTags: ["ProgressPhotos"],
    }),

    // Delete progress photo (only current week)
    deleteProgressPhoto: build.mutation({
      query: (photoId) => ({
        url: `/user/progress/photos/${photoId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ["ProgressPhotos"],
    }),

    // Move to next week (locks current week photos)
    moveToNextWeek: build.mutation({
      query: () => ({
        url: '/user/progress/next-week',
        method: 'POST',
      }),
      invalidatesTags: ["ProgressPhotos"],
    }),
  }),
});

export const {
  useGetProgressPhotosQuery,
  useUploadProgressPhotoMutation,
  useDeleteProgressPhotoMutation,
  useMoveToNextWeekMutation,
} = userProgressApi;
