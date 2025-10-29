import { createApi } from "@reduxjs/toolkit/query/react";
import { API_URL } from "@/constants/Variables";
import { baseQueryWithReauth } from "../../utils/baseQueryWithReauth";


export const userPlanApi = createApi({
  reducerPath: "userPlanApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["UserPlan", "UserPlans", "TrainerPlans", "MyEnrolledPlans", "Account"],
  endpoints: (build) => ({
    // Get all active plans with filters and search
    getAllPlans: build.query({
      query: (params = {}) => {
        const { 
          page = 1, 
          limit = 10, 
          goalType, 
          difficulty, 
          minPrice, 
          maxPrice, 
          trainerId,
          search 
        } = params;
        
        const searchParams = new URLSearchParams({
          page: page.toString(),
          limit: limit.toString(),
        });
        
        if (goalType) searchParams.append('goalType', goalType);
        if (difficulty) searchParams.append('difficulty', difficulty);
        if (minPrice) searchParams.append('minPrice', minPrice.toString());
        if (maxPrice) searchParams.append('maxPrice', maxPrice.toString());
        if (trainerId) searchParams.append('trainerId', trainerId);
        if (search) searchParams.append('search', search);

        return `/user/plans?${searchParams.toString()}`;
      },
      transformResponse: (response) => response?.data || response,
      providesTags: ["UserPlans"],
    }),

    // Get specific trainer's plans
    getTrainerPlans: build.query({
      query: ({ trainerId, page = 1, limit = 10 }) => {
        const searchParams = new URLSearchParams({
          page: page.toString(),
          limit: limit.toString(),
        });
        return `/user/plans/trainer/${trainerId}?${searchParams.toString()}`;
      },
      transformResponse: (response) => response?.data || response,
      providesTags: (result, error, { trainerId }) => [
        { type: "TrainerPlans", id: trainerId }
      ],
    }),

    // Get plan details
    getPlanDetails: build.query({
      query: (planId) => `/user/plans/${planId}`,
      transformResponse: (response) => response?.data || response,
      providesTags: (result, error, planId) => [
        { type: "UserPlan", id: planId }
      ],
    }),

    // Enroll in a plan
    enrollInPlan: build.mutation({
      query: (planId) => ({
        url: `/user/plans/${planId}/enroll`,
        method: "POST",
      }),
      invalidatesTags: (result, error, planId) => [
        { type: "UserPlan", id: planId },
        "MyEnrolledPlans",
        "UserPlans",
        "Account" // Invalidate account to refresh user data in HomeScreen
      ],
    }),

    // Get my enrolled plans
    getMyEnrolledPlans: build.query({
      query: (params = {}) => {
        const { page = 1, limit = 10 } = params;
        const searchParams = new URLSearchParams({
          page: page.toString(),
          limit: limit.toString(),
        });
        return `/user/plans/my-plans?${searchParams.toString()}`;
      },
      transformResponse: (response) => response?.data || response,
      providesTags: ["MyEnrolledPlans"],
    }),
  }),
});

export const {
  useGetAllPlansQuery,
  useGetTrainerPlansQuery,
  useGetPlanDetailsQuery,
  useEnrollInPlanMutation,
  useGetMyEnrolledPlansQuery,
} = userPlanApi;
