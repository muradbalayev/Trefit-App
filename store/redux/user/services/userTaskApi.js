import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "../../utils/baseQueryWithReauth";


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
