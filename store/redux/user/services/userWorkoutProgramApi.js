import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "../../utils/baseQueryWithReauth";



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
