import React from 'react'
import { CardStyleInterpolators, createStackNavigator, TransitionPresets } from '@react-navigation/stack'
import SplashScreen from '@/screens/auth/SplashScreen'
import LoginScreen from '@/screens/auth/LoginScreen'
import RegisterScreen from '@/screens/auth/RegisterScreen'
import RegisterTrainerScreen from '@/screens/auth/RegisterTrainerScreen'
import EmailVerificationScreen from '@/screens/auth/EmailVerificationScreen'

const Stack = createStackNavigator();

const AuthNavigator = () => {
  return (
  <Stack.Navigator initialRouteName='Splash'    
          screenOptions={{
            headerShown: false,
            gestureEnabled: true,
            gestureDirection: "horizontal",
            ...TransitionPresets.SlideFromRightIOS,
            cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
          }}
      >
    <Stack.Screen name="Splash" component={SplashScreen} />
    <Stack.Screen name="Register" component={RegisterScreen} />
    <Stack.Screen name="RegisterAsTrainer" component={RegisterTrainerScreen} />
    <Stack.Screen name="EmailVerification" component={EmailVerificationScreen} />
    <Stack.Screen name="Login" component={LoginScreen} />
  </Stack.Navigator>
  )
}

export default AuthNavigator
