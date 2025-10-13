import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import SetUsernameScreen from '@/screens/auth/SetUsernameScreen';

const Stack = createStackNavigator();

const SetupNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="SetUsername" component={SetUsernameScreen} />
    </Stack.Navigator>
  );
};

export default SetupNavigator;
