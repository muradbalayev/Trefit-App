import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import * as SecureStore from 'expo-secure-store';
import { setCredentials, clearCredentials } from "../../user/userAuthSlice";
import { API_URL } from "@/constants/Variables";

// Base query with auth header
const baseQuery = fetchBaseQuery({
  baseUrl: API_URL,
  credentials: "include",
  prepareHeaders: (headers, { getState }) => {
    const token = getState()?.userAuth?.accessToken;
    if (token) headers.set("Authorization", `Bearer ${token}`);
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
