import { createApi } from "@reduxjs/toolkit/query/react";
import { setCredentials } from "../userAuthSlice";
import { baseQueryWithReauth } from "@/store/redux/utils/baseQueryWithReauth";


export const userAccountApi = createApi({
  reducerPath: "userAccountApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Account"],
  endpoints: (build) => ({
    getAccount: build.query({
      query: () => "/user/account/me",
      transformResponse: (resp) => resp?.user ?? resp,
      providesTags: ["Account"],
    }),
    setUsername: build.mutation({
      query: (payload) => ({
        url: "/user/account/username",
        method: "POST",
        body: payload, // { username }
      }),
      invalidatesTags: ["Account"],
    }),
    updateProfile: build.mutation({
      query: (payload) => ({
        url: "/user/account/profile",
        method: "PUT",
        body: payload, // { name, age, gender, height, weight, goals }
      }),
      invalidatesTags: ["Account"],
      async onQueryStarted(_, { dispatch, queryFulfilled, getState }) {
        try {
          const { data } = await queryFulfilled; // expects { success, message, user }
          if (data?.user) {
            const current = getState()?.userAuth;
            dispatch(setCredentials({
              user: data.user,
              // preserve existing token/role
              accessToken: current?.accessToken,
              role: current?.role ?? data.user?.role,
            }));
          }
        } catch (_) {}
      },
    }),
    updateTrainerProfile: build.mutation({
      query: (payload) => ({
        url: "/user/account/trainer-profile",
        method: "PUT",
        body: payload, // { name, age, gender, height, weight, specialty, bio, experienceYears, workPlace, location, social }
      }),
      invalidatesTags: ["Account"],
      async onQueryStarted(_, { dispatch, queryFulfilled, getState }) {
        try {
          const { data } = await queryFulfilled; // expects { success, message, user }
          if (data?.user) {
            const current = getState()?.userAuth;
            dispatch(setCredentials({
              user: data.user,
              accessToken: current?.accessToken,
              role: current?.role ?? data.user?.role,
            }));
          }
        } catch (_) {}
      },
    }),
    uploadAvatar: build.mutation({
      query: (formData) => ({
        url: "/user/account/avatar",
        method: "POST",
        body: formData,
      }),
      invalidatesTags: ["Account"],
    }),
    updateAvatar: build.mutation({
      query: (formData) => ({
        url: "/user/account/avatar",
        method: "PUT",
        body: formData,
      }),
      invalidatesTags: ["Account"],
    }),
    changePassword: build.mutation({
      query: (payload) => ({
        url: "/user/account/change-password",
        method: "POST",
        body: payload, // { currentPassword, newPassword }
      }),
    }),
    dailyCheckIn: build.mutation({
      query: () => ({
        url: "/user/account/check-in",
        method: "POST",
      }),
      invalidatesTags: ["Account"],
    }),
    updateWeight: build.mutation({
      query: (payload) => ({
        url: "/user/account/weight",
        method: "PUT",
        body: payload, // { weight }
      }),
      invalidatesTags: ["Account"],
    }),
  }),
});

export const { 
  useGetAccountQuery, 
  useSetUsernameMutation,
  useUpdateProfileMutation,
  useUpdateTrainerProfileMutation,
  useUploadAvatarMutation,
  useUpdateAvatarMutation,
  useChangePasswordMutation,
  useDailyCheckInMutation,
  useUpdateWeightMutation
} = userAccountApi;
