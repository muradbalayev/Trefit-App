import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "../../utils/baseQueryWithReauth";



export const clientPlanApi = createApi({
  reducerPath: "clientPlanApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["ClientPlan", "ClientPlans"],
  endpoints: (build) => ({
    // Get available plans for clients (public plans)
    getAvailablePlans: build.query({
      query: (params = {}) => {
        const { page = 1, limit = 10, goalType, difficulty } = params;
        const searchParams = new URLSearchParams({
          page: page.toString(),
          limit: limit.toString(),
        });
        
        if (goalType) searchParams.append('goalType', goalType);
        if (difficulty) searchParams.append('difficulty', difficulty);

        return `/trainer/plans?isActive=true&${searchParams.toString()}`;
      },
      transformResponse: (response) => {
        // Transform backend response to frontend format
        if (response?.success && response?.data) {
          return {
            data: response.data.map(plan => ({
              ...plan,
              id: plan._id, // Map MongoDB _id to id
              clientsEnrolled: plan.clientsEnrolled?.length || 0,
              trainer: plan.createdBy // Map createdBy to trainer for client view
            })),
            pagination: response.pagination
          };
        }
        return response;
      },
      providesTags: ["ClientPlans"],
    }),

    // Get specific plan details for clients
    getPlanDetails: build.query({
      query: (planId) => `/trainer/plans/${planId}`,
      transformResponse: (response) => {
        // Transform single plan response for client view
        if (response?.success && response?.data) {
          return {
            ...response.data,
            id: response.data._id, // Map MongoDB _id to id
            clientsEnrolled: response.data.clientsEnrolled?.length || 0,
            trainer: response.data.createdBy // Map createdBy to trainer info
          };
        }
        return response?.data || response;
      },
      providesTags: (result, error, planId) => [
        { type: "ClientPlan", id: planId }
      ],
    }),

    // Enroll in a plan
    enrollInPlan: build.mutation({
      query: (planId) => ({
        url: `/user/plans/enroll/${planId}`,
        method: "POST",
      }),
      invalidatesTags: ["ClientPlans"],
    }),

    // Get client's enrolled plans
    getMyEnrollments: build.query({
      query: (params = {}) => {
        const { page = 1, limit = 10, status } = params;
        const searchParams = new URLSearchParams({
          page: page.toString(),
          limit: limit.toString(),
        });
        
        if (status) searchParams.append('status', status);

        return `/user/plans?${searchParams.toString()}`;
      },
      transformResponse: (response) => {
        if (response?.success && response?.data) {
          return {
            data: response.data.map(enrollment => ({
              ...enrollment,
              id: enrollment._id,
              plan: {
                ...enrollment.plan,
                id: enrollment.plan._id
              }
            })),
            pagination: response.pagination
          };
        }
        return response;
      },
      providesTags: ["ClientPlans"],
    }),
  }),
});

export const {
  useGetAvailablePlansQuery,
  useGetPlanDetailsQuery,
  useEnrollInPlanMutation,
  useGetMyEnrollmentsQuery,
} = clientPlanApi;
