import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import userAuthReducer from './user/userAuthSlice';
import { userAuthApi } from "./user/services/userAuthApi";
import { userAccountApi } from "./user/services/userAccountApi";
import { userPlanApi } from "./user/services/userPlanApi";
import { userTrainerApi } from "./user/services/userTrainerApi";
import { trainerPlanApi } from './trainer/services/trainerPlanApi';
import { trainerClientApi as trainerClientAPIService } from './trainer/services/trainerClientApi';
import { trainerWorkoutProgramApi } from './trainer/services/trainerWorkoutProgramApi';
import { trainerTaskApi } from './trainer/services/trainerTaskApi';
import { clientPlanApi } from './client/services/clientPlanApi';
import { chatApi } from './chat/services/chatApi';
import { userWorkoutProgramApi } from './user/services/userWorkoutProgramApi';
import { userTaskApi } from './user/services/userTaskApi';
import { userProgressApi } from './user/services/userProgressApi';

export const store = configureStore({
  reducer: {
    userAuth: userAuthReducer,
    [userAuthApi.reducerPath]: userAuthApi.reducer,
    [userAccountApi.reducerPath]: userAccountApi.reducer,
    [userPlanApi.reducerPath]: userPlanApi.reducer,
    [userTrainerApi.reducerPath]: userTrainerApi.reducer,
    [trainerPlanApi.reducerPath]: trainerPlanApi.reducer,
    [trainerClientAPIService.reducerPath]: trainerClientAPIService.reducer,
    [trainerWorkoutProgramApi.reducerPath]: trainerWorkoutProgramApi.reducer,
    [trainerTaskApi.reducerPath]: trainerTaskApi.reducer,
    [clientPlanApi.reducerPath]: clientPlanApi.reducer,
    [chatApi.reducerPath]: chatApi.reducer,
    [userWorkoutProgramApi.reducerPath]: userWorkoutProgramApi.reducer,
    [userTaskApi.reducerPath]: userTaskApi.reducer,
    [userProgressApi.reducerPath]: userProgressApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      userAuthApi.middleware, 
      userAccountApi.middleware,
      userPlanApi.middleware,
      userTrainerApi.middleware,
      trainerPlanApi.middleware,
      trainerClientAPIService.middleware,
      trainerWorkoutProgramApi.middleware,
      trainerTaskApi.middleware,
      clientPlanApi.middleware,
      chatApi.middleware,
      userWorkoutProgramApi.middleware,
      userTaskApi.middleware,
      userProgressApi.middleware
    ),
});

// Enable refetchOnFocus and other useful RTK Query features
setupListeners(store.dispatch);

export default store;
