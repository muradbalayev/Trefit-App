import React, { useState, useEffect } from "react";
import { Text, View } from "react-native";
import {
  CardStyleInterpolators,
  createStackNavigator,
  TransitionPresets,
} from "@react-navigation/stack";
import { useNavigation } from "@react-navigation/native";
import { useNotifications } from "@/contexts/NotificationContext";
import HomeScreen from "@/screens/main/HomePage/HomeScreen";
import UserLayout from "@/components/layouts/UserLayout";
import ClientProfileScreen from "@/screens/main/ProfilePage/ClientProfileScreen";
import NotificationsScreen from "@/screens/main/NotificationsScreen/NotificationsScreen";
import TrainersScreen from "@/screens/main/TrainersScreen/TrainersScreen";
import TrainerDetailsScreen from "@/screens/main/TrainerDetailsScreen";

// Client-specific screens
import PlanDetailsScreen from "@/screens/client/PlanDetailsScreen";
import ChatScreen from "@/screens/client/ClientChatsScreen";
import ChatMessagesScreen from "@/screens/common/ChatMessagesScreen";
import WorkoutProgramScreen from "@/screens/client/WorkoutProgramScreen";
import ClientTasksScreen from "@/screens/client/ClientTasksScreen";
import TaskDetailScreen from "@/screens/client/TaskDetailScreen";

// Profile screens
import EditProfileScreen from "@/screens/main/ProfilePage/EditProfileScreen";
import ChangePasswordScreen from "@/screens/main/ProfilePage/ChangePasswordScreen";
import BodyProgressScreen from "@/screens/main/ProfilePage/BodyProgressScreen";

const Stack = createStackNavigator();
const UserNavigator = ({ haveTrainer }) => {
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
        recipientId: senderId,
        recipientName: senderName,
      });
      
      clearPendingNotification();
    }
  }, [pendingNotification, navigation, clearPendingNotification]);

  return (
    <UserLayout route={currentRoute} haveTrainer={haveTrainer}>
      <Stack.Navigator
        initialRouteName={currentRoute}
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
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Notifications" component={NotificationsScreen} />

        {/* Always available screens */}
        <Stack.Screen name="TrainerDetails" component={TrainerDetailsScreen} />
        <Stack.Screen name="Trainers" component={TrainersScreen} />
        
        {/* Client-specific screens - Always available */}
        <Stack.Screen name="Chat" component={ChatScreen} />
        <Stack.Screen name="ChatMessages" component={ChatMessagesScreen} />

        <Stack.Screen name="PlanDetails" component={PlanDetailsScreen} />
        
        {/* Workout & Tasks */}
        <Stack.Screen name="WorkoutProgram" component={WorkoutProgramScreen} />
        <Stack.Screen name="ClientTasks" component={ClientTasksScreen} />
        <Stack.Screen name="TaskDetail" component={TaskDetailScreen} />
        
        <Stack.Screen name="Profile" component={ClientProfileScreen} />
        <Stack.Screen name="EditProfile" component={EditProfileScreen} />
        <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} />
        <Stack.Screen name="BodyProgress" component={BodyProgressScreen} />
      </Stack.Navigator>
    </UserLayout>
  );
};

export default UserNavigator;
