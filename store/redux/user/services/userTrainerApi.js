import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "../../utils/baseQueryWithReauth";


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
