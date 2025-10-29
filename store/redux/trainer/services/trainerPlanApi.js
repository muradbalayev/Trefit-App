import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "../../utils/baseQueryWithReauth";



export const trainerPlanApi = createApi({
  reducerPath: "trainerPlanApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["TrainerPlan", "TrainerPlans"],
  endpoints: (build) => ({
    // Create new plan
    createPlan: build.mutation({
      query: (planData) => ({
        url: "/user/trainer/plans",
        method: "POST",
        body: planData,
      }),
      invalidatesTags: ["TrainerPlans"],
    }),

    // Get trainer's plans with pagination and filters
    getMyPlans: build.query({
      query: (params = {}) => {
        const { page = 1, limit = 10, isActive } = params;
        const searchParams = new URLSearchParams({
          page: page.toString(),
          limit: limit.toString(),
        });
        
        if (isActive !== undefined) {
          searchParams.append('isActive', isActive.toString());
        }

        return `/user/trainer/plans?${searchParams.toString()}`;
      },
      transformResponse: (response) => {
        // Transform backend response to frontend format
        if (response?.success && response?.data) {
          return {
            data: response.data.map(plan => ({
              ...plan,
              id: plan._id, // Map MongoDB _id to id
              clientsEnrolled: plan.clientsEnrolled?.length || 0 // Convert array to count for display
            })),
            pagination: response.pagination
          };
        }
        return response;
      },
      providesTags: ["TrainerPlans"],
    }),

    // Get specific plan details
    getPlanDetails: build.query({
      query: (planId) => `/user/trainer/plans/${planId}`,
      transformResponse: (response) => response?.data || response,
      providesTags: (result, error, planId) => [
        { type: "TrainerPlan", id: planId }
      ],
    }),

    // Update plan
    updatePlan: build.mutation({
      query: ({ planId, planData }) => ({
        url: `/user/trainer/plans/${planId}`,
        method: "PUT",
        body: planData,
      }),
      invalidatesTags: (result, error, { planId }) => [
        { type: "TrainerPlan", id: planId },
        "TrainerPlans"
      ],
    }),

    // Delete plan (soft delete)
    deletePlan: build.mutation({
      query: (planId) => ({
        url: `/user/trainer/plans/${planId}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, planId) => [
        { type: "TrainerPlan", id: planId },
        "TrainerPlans"
      ],
    }),

    // Activate plan
    activatePlan: build.mutation({
      query: (planId) => ({
        url: `/user/trainer/plans/${planId}/activate`,
        method: "PATCH",
      }),
      invalidatesTags: (result, error, planId) => [
        { type: "TrainerPlan", id: planId },
        "TrainerPlans"
      ],
    }),

    // Deactivate plan
    deactivatePlan: build.mutation({
      query: (planId) => ({
        url: `/user/trainer/plans/${planId}/deactivate`,
        method: "PATCH",
      }),
      invalidatesTags: (result, error, planId) => [
        { type: "TrainerPlan", id: planId },
        "TrainerPlans"
      ],
    }),

    // Toggle plan status
    togglePlanStatus: build.mutation({
      query: (planId) => ({
        url: `/user/trainer/plans/${planId}/toggle-status`,
        method: "PATCH",
      }),
      invalidatesTags: (result, error, planId) => [
        { type: "TrainerPlan", id: planId },
        "TrainerPlans"
      ],
    }),
  }),
});

export const {
  useCreatePlanMutation,
  useGetMyPlansQuery,
  useGetPlanDetailsQuery,
  useUpdatePlanMutation,
  useDeletePlanMutation,
  useActivatePlanMutation,
  useDeactivatePlanMutation,
  useTogglePlanStatusMutation,
} = trainerPlanApi;
