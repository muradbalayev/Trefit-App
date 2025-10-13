import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { API_URL } from "@/store/redux/apiConfig";
import * as SecureStore from 'expo-secure-store';
import { setCredentials, clearCredentials } from "../userAuthSlice";

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
