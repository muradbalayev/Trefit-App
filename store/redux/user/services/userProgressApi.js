import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "../../utils/baseQueryWithReauth";



export const userProgressApi = createApi({
  reducerPath: "userProgressApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["ProgressPhotos"],
  endpoints: (build) => ({
    // Get all progress photos (all weeks)
    getProgressPhotos: build.query({
      query: () => `/user/progress/photos`,
      transformResponse: (response) => response?.data || { currentWeek: 1, weeklyPhotos: [] },
      providesTags: (result, error, arg) => [
        { type: "ProgressPhotos", id: "LIST" }
      ],
      // Make cache user-specific by serializing with user ID
      serializeQueryArgs: ({ queryArgs, endpointName }) => {
        return endpointName; // Cache per endpoint, will be cleared on logout
      },
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
      // Optimistic update for immediate UI feedback
      async onQueryStarted({ photo, type }, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          // Update cache with full progress data from response
          if (data?.data) {
            dispatch(
              userProgressApi.util.updateQueryData('getProgressPhotos', undefined, (draft) => {
                // Update with fresh data from backend
                draft.currentWeek = data.data.currentWeek;
                draft.weeklyPhotos = data.data.weeklyPhotos;
              })
            );
          }
        } catch (error) {
          console.error('Upload photo cache update error:', error);
        }
      },
    }),

    // Delete progress photo (only current week)
    deleteProgressPhoto: build.mutation({
      query: (photoId) => ({
        url: `/user/progress/photos/${photoId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ["ProgressPhotos"],
      async onQueryStarted(photoId, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          // Update cache with fresh data
          if (data?.data) {
            dispatch(
              userProgressApi.util.updateQueryData('getProgressPhotos', undefined, (draft) => {
                draft.currentWeek = data.data.currentWeek;
                draft.weeklyPhotos = data.data.weeklyPhotos;
              })
            );
          }
        } catch (error) {
          console.error('Delete photo cache update error:', error);
        }
      },
    }),

    // Move to next week (locks current week photos)
    moveToNextWeek: build.mutation({
      query: () => ({
        url: '/user/progress/next-week',
        method: 'POST',
      }),
      invalidatesTags: ["ProgressPhotos"],
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          // Update cache with new week data
          if (data?.data) {
            dispatch(
              userProgressApi.util.updateQueryData('getProgressPhotos', undefined, (draft) => {
                draft.currentWeek = data.data.currentWeek;
                draft.weeklyPhotos = data.data.weeklyPhotos;
              })
            );
          }
        } catch (error) {
          console.error('Move to next week cache update error:', error);
        }
      },
    }),
  }),
});

export const {
  useGetProgressPhotosQuery,
  useUploadProgressPhotoMutation,
  useDeleteProgressPhotoMutation,
  useMoveToNextWeekMutation,
} = userProgressApi;
