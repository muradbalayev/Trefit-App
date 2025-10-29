import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "@/store/redux/utils/baseQueryWithReauth";


export const trainerClientApi = createApi({
  reducerPath: "trainerClientApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["TrainerClient", "TrainerClients"],
  endpoints: (build) => ({
    // Get trainer's clients from enrolled plans
    getMyClients: build.query({
      query: (params = {}) => {
        const { page = 1, limit = 10, planId, search } = params;
        const searchParams = new URLSearchParams({
          page: page.toString(),
          limit: limit.toString(),
        });
        
        if (planId) searchParams.append('planId', planId);
        if (search) searchParams.append('search', search);

        return `/user/trainer/clients?${searchParams.toString()}`;
      },
      transformResponse: (response) => {
        if (response?.success && response?.data) {
          return {
            data: response.data,
            pagination: response.pagination
          };
        }
        return response?.data || response;
      },
      providesTags: ["TrainerClients"],
    }),

    // Get specific client details
    getClientDetails: build.query({
      query: (clientId) => `/user/trainer/clients/${clientId}`,
      transformResponse: (response) => response?.data || response,
      providesTags: (result, error, clientId) => [
        { type: "TrainerClient", id: clientId }
      ],
    }),

    // Send message to client (will be used for chat)
    sendMessageToClient: build.mutation({
      query: ({ clientId, message }) => ({
        url: `/user/trainer/clients/${clientId}/message`,
        method: "POST",
        body: { message },
      }),
      // Bu chat messages-i invalidate edə bilər
    }),
  }),
});

export const {
  useGetMyClientsQuery,
  useGetClientDetailsQuery,
  useSendMessageToClientMutation,
} = trainerClientApi;
