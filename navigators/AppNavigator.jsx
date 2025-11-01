import React, { useEffect, useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { useSelector, useDispatch } from "react-redux";
import AsyncStorage from '@react-native-async-storage/async-storage';
import AuthNavigator from "@/navigators/AuthNavigator";
import UserNavigator from "@/navigators/UserNavigator";
import SetupNavigator from "@/navigators/SetupNavigator";
import OnboardingNavigator from "@/navigators/OnboardingNavigator";
import { useGetAccountQuery } from "@/store/redux/user/services/userAccountApi";
import { useRefreshMutation, getTokens } from "@/store/redux/user/services/userAuthApi";
import { setCredentials } from "@/store/redux/user/userAuthSlice";
import { Loading } from "@/components/common";
import TrainerNavigator from "@/navigators/TrainerNavigator";

const AppNavigator = () => {
  const dispatch = useDispatch();
  const { isAuthenticated, role: authRole, needsUsernameSetup, haveTrainer } = useSelector((state) => state.userAuth);
  const [refresh] = useRefreshMutation();
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState(null);
  
  // Check onboarding status
  useEffect(() => {
    const checkOnboarding = async () => {
      try {
        const value = await AsyncStorage.getItem('hasSeenOnboarding');
        setHasSeenOnboarding(value === 'true');
      } catch (error) {
        console.log('Error checking onboarding:', error);
        setHasSeenOnboarding(false);
      }
    };
    
    checkOnboarding();
    
    // Listen for onboarding completion
    const interval = setInterval(async () => {
      const value = await AsyncStorage.getItem('hasSeenOnboarding');
      if (value === 'true' && hasSeenOnboarding === false) {
        setHasSeenOnboarding(true);
      }
    }, 500);
    
    return () => clearInterval(interval);
  }, [hasSeenOnboarding]);
  
  // Global token refresh on app start
  useEffect(() => {
    const initializeAuth = async () => {
      if (!isAuthenticated) {
        try {
          const { refreshToken } = await getTokens();
          if (refreshToken) {
            await refresh({ refreshToken }).unwrap();
          }
        } catch (error) {
          console.log('Auth initialization failed:', error);
          // Token invalid, user will be redirected to login
        }
      }
    };
    
    initializeAuth();
  }, []);

  const {
    data: account,
    isLoading,
    isUninitialized,
  } = useGetAccountQuery(undefined, { skip: !isAuthenticated, refetchOnMountOrArgChange: true });

  // Set user and role in Redux when account is loaded
  useEffect(() => {
    if (account) {
      dispatch(setCredentials({ 
        user: account,
        role: account.role,
        haveTrainer: account.plan?.trainerId || null
      }));
    }
  }, [account, dispatch]);

  // Show loading while checking onboarding status
  if (hasSeenOnboarding === null) {
    return <Loading />;
  }

  // Show onboarding if not seen yet and not authenticated
  if (!hasSeenOnboarding && !isAuthenticated) {
    return (
      <NavigationContainer>
        <OnboardingNavigator />
      </NavigationContainer>
    );
  }

  // Don't show loading on refetch, only on initial load
  if (!isAuthenticated) {
    return (
      <NavigationContainer>
        <AuthNavigator />
      </NavigationContainer>
    );
  }

  // If we have role from login, use it immediately for navigation
  // Otherwise wait for account to load
  if (isAuthenticated && authRole) {
    // We have role from login, can navigate immediately
    const navKey = account?._id || authRole;
    
    return (
      <NavigationContainer key={navKey}>
        {needsUsernameSetup === true || (account && !account.username) ? (
          <SetupNavigator />
        ) : authRole === "trainer" ? (
          <TrainerNavigator />
        ) : authRole === "client" ? (
          <UserNavigator haveTrainer={haveTrainer || account?.plan?.trainerId} />
        ) : (
          <UserNavigator />
        )}
      </NavigationContainer>
    );
  }
}

export default AppNavigator;
