import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "../../utils/baseQueryWithReauth";



export const trainerTaskApi = createApi({
  reducerPath: "trainerTaskApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Task", "Tasks", "ClientTasks"],
  endpoints: (build) => ({
    // Create task for client
    createTask: build.mutation({
      query: (formData) => ({
        url: `/user/trainer/tasks`,
        method: "POST",
        body: formData,
      }),
      invalidatesTags: ["Tasks", "ClientTasks"],
    }),

    // Get all my tasks (trainer)
    getMyTasks: build.query({
      query: (params = {}) => {
        const { clientId, status, page = 1, limit = 20 } = params;
        const searchParams = new URLSearchParams({
          page: page.toString(),
          limit: limit.toString(),
        });
        
        if (clientId) searchParams.append('clientId', clientId);
        if (status && status !== 'all') searchParams.append('status', status);

        return `/user/trainer/tasks?${searchParams.toString()}`;
      },
      transformResponse: (response) => {
        if (response?.success && response?.data) {
          return {
            data: response.data,
            pagination: response.pagination
          };
        }
        return response;
      },
      providesTags: ["Tasks"],
    }),

    // Get tasks for specific client
    getClientTasks: build.query({
      query: ({ clientId, status }) => {
        const searchParams = new URLSearchParams();
        if (status && status !== 'all') searchParams.append('status', status);
        return `/user/trainer/tasks/client/${clientId}?${searchParams.toString()}`;
      },
      transformResponse: (response) => response?.data || response,
      providesTags: (result, error, { clientId }) => [
        { type: "ClientTasks", id: clientId }
      ],
    }),

    // Get task details
    getTaskDetails: build.query({
      query: (taskId) => `/user/trainer/tasks/${taskId}`,
      transformResponse: (response) => response?.data || response,
      providesTags: (result, error, taskId) => [
        { type: "Task", id: taskId }
      ],
    }),

    // Update task
    updateTask: build.mutation({
      query: ({ taskId, taskData }) => ({
        url: `/user/trainer/tasks/${taskId}`,
        method: "PUT",
        body: taskData,
      }),
      invalidatesTags: (result, error, { taskId }) => [
        { type: "Task", id: taskId },
        "Tasks",
        "ClientTasks"
      ],
    }),

    // Delete task
    deleteTask: build.mutation({
      query: (taskId) => ({
        url: `/user/trainer/tasks/${taskId}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, taskId) => [
        { type: "Task", id: taskId },
        "Tasks",
        "ClientTasks"
      ],
    }),
  }),
});

export const {
  useCreateTaskMutation,
  useGetMyTasksQuery,
  useGetClientTasksQuery,
  useGetTaskDetailsQuery,
  useUpdateTaskMutation,
  useDeleteTaskMutation,
} = trainerTaskApi;
