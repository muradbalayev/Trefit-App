import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { setCredentials, clearCredentials } from "../userAuthSlice";
import * as SecureStore from 'expo-secure-store';
import { API_URL } from "@/constants/Variables";

// Reauth logic for token refresh
const baseQueryWithReauth = async (args, api, extraOptions) => {
  const baseQuery = fetchBaseQuery({
    baseUrl: API_URL,
    credentials: 'include',
    prepareHeaders: (headers, { getState }) => {
      const token = getState()?.userAuth?.accessToken;
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      return headers;
    },
  });

  let result = await baseQuery(args, api, extraOptions);

  if (result?.error?.status === 401) {
    // Try to refresh token
    try {
      const refreshToken = await SecureStore.getItemAsync('auth_refresh_token');
      if (refreshToken) {
        const refreshResult = await baseQuery({
          url: '/user/auth/refresh',
          method: 'POST',
          body: { refreshToken }
        }, api, extraOptions);

        if (refreshResult?.data?.accessToken) {
          await SecureStore.setItemAsync('auth_access_token', refreshResult.data.accessToken);
          api.dispatch(setCredentials({ accessToken: refreshResult.data.accessToken }));
          result = await baseQuery(args, api, extraOptions);
        } else {
          api.dispatch(clearCredentials());
        }
      } else {
        api.dispatch(clearCredentials());
      }
    } catch (e) {
      api.dispatch(clearCredentials());
    }
  }
  return result;
};

export const userTrainerApi = createApi({
  reducerPath: "userTrainerApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Trainers", "TrainerDetails", "MyTrainer"],
  endpoints: (build) => ({
    // Get all trainers - simple approach
    getAllTrainers: build.query({
      query: (params = {}) => {
        const { page = 1, limit = 20, search = '' } = params;
        const searchParams = new URLSearchParams({
          page: page.toString(),
          limit: limit.toString(),
        });
        if (search) {
          searchParams.append('search', search);
        }
        return `/user/trainers?${searchParams.toString()}`;
      },
      transformResponse: (response) => {
        console.log('getAllTrainers API Response:', response);
        return response?.data || [];
      },
      providesTags: ["Trainers"],
    }),

    // Get trainer details with plans
    getTrainerDetails: build.query({
      query: (trainerId) => `/user/trainers/${trainerId}`,
      transformResponse: (response) => response?.data || response,
      providesTags: (result, error, trainerId) => [
        { type: "TrainerDetails", id: trainerId }
      ],
    }),

    // Get my current trainer (from active enrollment)
    getMyTrainer: build.query({
      query: () => `/user/trainers/my-trainer`,
      transformResponse: (response) => response?.trainer || null,
      providesTags: ["MyTrainer"],
    }),
  }),
});

export const {
  useGetAllTrainersQuery,
  useGetTrainerDetailsQuery,
  useGetMyTrainerQuery,
} = userTrainerApi;
