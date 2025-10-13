import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  accessToken: null,
  user: null,
  role: null,
  isAuthenticated: false,
  // If true, user must complete username setup. Comes from login response or account details
  needsUsernameSetup: null,
  // Trainer ID if user has active trainer, null otherwise
  haveTrainer: null,
};

const userAuthSlice = createSlice({
  name: "userAuth",
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      const { accessToken, user, role, needsUsernameSetup, haveTrainer } = action.payload || {};
      if (typeof accessToken !== "undefined") state.accessToken = accessToken;
      if (typeof user !== "undefined") state.user = user;
      if (typeof role !== "undefined") state.role = role;
      if (typeof needsUsernameSetup !== "undefined") {
        state.needsUsernameSetup = needsUsernameSetup;
      } else if (typeof user !== "undefined" && user) {
        // Fallback: infer from user object if provided
        if (typeof user.needsUsernameSetup !== "undefined") {
          state.needsUsernameSetup = user.needsUsernameSetup;
        } else if (typeof user.username !== "undefined") {
          state.needsUsernameSetup = !user.username;
        }
      }
      // Set haveTrainer from payload or user object
      if (typeof haveTrainer !== "undefined") {
        state.haveTrainer = haveTrainer;
      } else if (typeof user !== "undefined" && user) {
        state.haveTrainer = user.haveTrainer || null;
      }
      state.isAuthenticated = !!state.accessToken;
    },
    clearCredentials: (state) => {
      state.accessToken = null;
      state.user = null;
      state.role = null;
      state.isAuthenticated = false;
      state.needsUsernameSetup = null;
      state.haveTrainer = null;
    },
  },
});

export const { setCredentials, clearCredentials } = userAuthSlice.actions;
export default userAuthSlice.reducer;
