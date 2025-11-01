import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "../../utils/baseQueryWithReauth";

export const trainerStatsApi = createApi({
  reducerPath: "trainerStatsApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["TrainerStats", "DashboardClients"],
  endpoints: (builder) => ({
    // Get trainer overview statistics
    getTrainerStats: builder.query({
      query: () => "/user/trainer/stats",
      transformResponse: (response) => response?.data || response,
      providesTags: ["TrainerStats"],
    }),

    // Get detailed client list for dashboard
    getDashboardClients: builder.query({
      query: ({ status = "active", limit = 20 } = {}) => {
        const params = new URLSearchParams({
          status,
          limit: limit.toString(),
        });
        return `/user/trainer/stats/clients?${params.toString()}`;
      },
      transformResponse: (response) => response?.data || response,
      providesTags: ["DashboardClients"],
    }),
  }),
});

export const {
  useGetTrainerStatsQuery,
  useGetDashboardClientsQuery,
} = trainerStatsApi;
