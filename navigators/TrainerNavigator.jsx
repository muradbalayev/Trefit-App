import React, { useState, useEffect } from "react";
import {
  CardStyleInterpolators,
  createStackNavigator,
  TransitionPresets,
} from "@react-navigation/stack";
import { useNavigation } from "@react-navigation/native";
import { useNotifications } from "@/contexts/NotificationContext";
import TrainerLayout from "@/components/layouts/TrainerLayout";
import TrainerProfileScreen from "@/screens/trainer/TrainerProfile/TrainerProfileScreen";
import NotificationsScreen from "@/screens/main/NotificationsScreen/NotificationsScreen";

// Trainer-specific screens (bu screen-lər yaradılmalıdır)
import TrainerHomeScreen from "@/screens/trainer/TrainerHomePage/TrainerHomeScreen";

import PlansScreen from "@/screens/trainer/PlansScreen";
import CreatePlanScreen from "@/screens/trainer/CreatePlanScreen";
import TrainerPlanDetailsScreen from "@/screens/trainer/TrainerPlanDetailsScreen";
import EditPlanScreen from "@/screens/trainer/EditPlanScreen";
import ClientsScreen from "@/screens/trainer/ClientsScreen";
import ClientDetailsScreen from "@/screens/trainer/ClientDetails/ClientDetailsScreen";
import ChatScreen from "@/screens/trainer/TrainerChatsScreen";
import TrainerChatMessagesScreen from "@/screens/trainer/TrainerChatMessagesScreen";
import UploadWorkoutProgramScreen from "@/screens/trainer/UploadWorkoutProgramScreen";
import CreateTaskScreen from "@/screens/trainer/CreateTaskScreen";
import TrainerTasksScreen from "@/screens/trainer/TrainerTasksScreen";
import TrainerTaskDetailsScreen from "@/screens/trainer/TrainerTaskDetailsScreen";

// Profile screens
import EditTrainerProfileScreen from "@/screens/trainer/TrainerProfile/EditTrainerProfileScreen";
import ChangePasswordScreen from "@/screens/main/ProfilePage/ChangePasswordScreen";
import ClientDashboardScreen from "@/screens/trainer/ClientDashboardScreen";
import ClientProgressPhotosScreen from "@/screens/trainer/ClientProgressPhotos/ClientProgressPhotosScreen";
import TrainerDashboardScreen from "@/screens/trainer/TrainerDashboard/TrainerDashboardScreen";
import RevenueAnalyticsScreen from "@/screens/trainer/TrainerDashboard/(screens)/RevenueAnalyticsScreen";

const Stack = createStackNavigator();

const TrainerNavigator = () => {
  const [currentRoute, setCurrentRoute] = useState("Home");
  const navigation = useNavigation();
  const { pendingNotification, clearPendingNotification } = useNotifications();

  // Handle notification tap navigation
  useEffect(() => {
    if (pendingNotification) {
      const { chatId, senderId, senderName } = pendingNotification;
      
      navigation.navigate('ChatMessages', {
        chatId,
        participantId: senderId,
        participantName: senderName,
        clientId: senderId,
      });
      
      clearPendingNotification();
    }
  }, [pendingNotification, navigation, clearPendingNotification]);

  return (
    <TrainerLayout route={currentRoute}>
      <Stack.Navigator
        initialRouteName="Home"
        id={undefined}
        screenOptions={{
          headerShown: false,
          cardStyleInterpolator: ({ current }) => ({
            cardStyle: { opacity: current.progress },
          }),
          transitionSpec: {
            open: { animation: 'timing', config: { duration: 200 } },
            close: { animation: 'timing', config: { duration: 200 } },
          },
        }}
        screenListeners={{
          state: (e) => {
            const route = e.data?.state?.routes[e.data.state.index]?.name;
            if (route) {
              setCurrentRoute(route);
            }
          },
        }}
      >
        {/* Home Tab */}
        <Stack.Screen name="Home" component={TrainerHomeScreen} />
        <Stack.Screen name="Notifications" component={NotificationsScreen} />

        {/* Plans Tab */}
        <Stack.Screen name="Plans" component={PlansScreen} />
        <Stack.Screen name="CreatePlan" component={CreatePlanScreen} />
        <Stack.Screen name="TrainerPlanDetails" component={TrainerPlanDetailsScreen} />
        <Stack.Screen name="EditPlan" component={EditPlanScreen} />

        {/* Clients Tab */}
        <Stack.Screen name="Clients" component={ClientsScreen} />
        <Stack.Screen name="ClientDetails" component={ClientDetailsScreen} />
        <Stack.Screen name="ClientDashboard" component={ClientDashboardScreen} />
        <Stack.Screen name="ClientProgressPhotos" component={ClientProgressPhotosScreen} />
        <Stack.Screen name="TrainerDashboard" component={TrainerDashboardScreen} />
        <Stack.Screen name="RevenueAnalytics" component={RevenueAnalyticsScreen} />

        {/* Chat Screens */}
        <Stack.Screen name="Chat" component={ChatScreen} />
        <Stack.Screen name="ChatMessages" component={TrainerChatMessagesScreen} />

        {/* Workout Program & Tasks */}
        <Stack.Screen name="UploadWorkoutProgram" component={UploadWorkoutProgramScreen} />
        <Stack.Screen name="CreateTask" component={CreateTaskScreen} />
        <Stack.Screen name="TrainerTasks" component={TrainerTasksScreen} />
        <Stack.Screen name="TrainerTaskDetails" component={TrainerTaskDetailsScreen} />

        {/* Profile Tab */}
        <Stack.Screen name="Profile" component={TrainerProfileScreen} />
        <Stack.Screen name="EditProfile" component={EditTrainerProfileScreen} />
        <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} />
      </Stack.Navigator>
    </TrainerLayout>
  );
};

export default TrainerNavigator;
