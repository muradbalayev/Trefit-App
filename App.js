import 'react-native-gesture-handler';
import { enableScreens } from 'react-native-screens';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

enableScreens();
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppNavigator from '@/navigators/AppNavigator';
import Providers from '@/components/layouts/Providers';
import { StatusBar } from 'react-native';
import Colors from '@/constants/Colors';
import { useLoadFonts } from '@/hooks/useLoadFonts';
import { useEffect } from 'react';
import { requestNotificationPermissions } from '@/utils/notificationManager';

export default function App() {
  const fontsLoaded = useLoadFonts();

  useEffect(() => {
    // Request notification permissions
    requestNotificationPermissions();
  }, []);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <Providers>
          <StatusBar barStyle="light-content" backgroundColor={Colors.BACKGROUND} />
          <AppNavigator />
        </Providers>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
