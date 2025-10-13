import React, { useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { useSelector, useDispatch } from "react-redux";
import AuthNavigator from "@/navigators/AuthNavigator";
import UserNavigator from "@/navigators/UserNavigator";
import SetupNavigator from "@/navigators/SetupNavigator";
import { useGetAccountQuery } from "@/store/redux/user/services/userAccountApi";
import { useRefreshMutation, getTokens } from "@/store/redux/user/services/userAuthApi";
import { setCredentials } from "@/store/redux/user/userAuthSlice";
import { Loading } from "@/components/common";
import TrainerNavigator from "@/navigators/TrainerNavigator";

const AppNavigator = () => {
  const dispatch = useDispatch();
  const { isAuthenticated, role: authRole, needsUsernameSetup, haveTrainer } = useSelector((state) => state.userAuth);
  const [refresh] = useRefreshMutation();
  
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
