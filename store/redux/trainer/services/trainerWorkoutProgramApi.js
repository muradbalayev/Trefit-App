import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "../../utils/baseQueryWithReauth";



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
