import React from "react";
import {
  ScrollView,
  StyleSheet,
  View,
  Alert,
  RefreshControl,
  ImageBackground,
} from "react-native";
import { CustomScreen } from "@/components/common";
import AppText from "@/components/ui/Text";
import Colors from "@/constants/Colors";
import Images from "@/constants/Images";
import Header from "./(components)/Header";
import OnboardSection from "./(components)/OnboardSection";
import MyCoachSection from "./(components)/MyCoachSection";
import ActivePlanCard from "./(components)/ActivePlanCard";
import StreakCard from "./(components)/StreakCard";
import WeightTrackerCard from "./(components)/WeightTrackerCard";
import QuickStatsCard from "./(components)/QuickStatsCard";
import QuickLinksWidget from "./(components)/QuickLinksWidget";
import { 
  useGetAccountQuery, 
  useDailyCheckInMutation,
  useUpdateWeightMutation 
} from "@/store/redux/user/services/userAccountApi";
import { useSelector } from "react-redux";
import TrainerSection from "./(components)/Trainers/TrainerSection";

const HomeScreen = ({ route }) => {
  const { isAuthenticated } = useSelector((state) => state.userAuth);
  const { data: user, refetch, isFetching } = useGetAccountQuery(undefined, {
    skip: !isAuthenticated,
    refetchOnFocus: true,
    refetchOnReconnect: true,
    refetchOnMountOrArgChange: true,
  });
  // console.log(user)

  // Refetch when screen receives params (e.g., after enrollment)
  React.useEffect(() => {
    if (route?.params?.refresh) {
      refetch();
    }
  }, [route?.params?.refresh, refetch]);

  const [dailyCheckIn, { isLoading: isCheckingIn }] = useDailyCheckInMutation();
  const [updateWeight, { isLoading: isUpdatingWeight }] = useUpdateWeightMutation();

  const hasActivePlan = Boolean(user?.plan?.planId);

  const handleCheckIn = async () => {
    try {
      const result = await dailyCheckIn().unwrap();
      Alert.alert(
        'Success!', 
        `Check-in successful! 🔥\nStreak: ${result.streak} days\nPoints: +10`
      );
    } catch (error) {
      const message = error?.data?.message || 'Failed to check in';
      Alert.alert('Info', message);
      console.error('Check-in error:', error);
    }
  };

  const handleUpdateWeight = async (weight) => {
    try {
      await updateWeight({ weight }).unwrap();
      Alert.alert('Success!', 'Weight updated successfully');
    } catch (error) {
      const message = error?.data?.message || 'Failed to update weight';
      Alert.alert('Error', message);
      console.error('Update weight error:', error);
    }
  };

  return (
    <CustomScreen isPaddingHorizontal={false} isPaddingVertical={false}>
      <ImageBackground
        source={Images.homeBg}
        style={styles.backgroundImage}
        imageStyle={styles.backgroundImageStyle}
        resizeMode="cover"
      >
        <View style={styles.overlay} />
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.container}  refreshControl={
            <RefreshControl
              refreshing={isFetching}
              onRefresh={refetch}
              tintColor={Colors.BRAND}
              colors={[Colors.BRAND]}
              progressBackgroundColor={Colors.SECONDARY}
            />
          }>
          <Header user={user} />
          <View style={styles.sections}>
          {hasActivePlan ? (
            <View>
              <MyCoachSection />
              <ActivePlanCard plan={user?.plan} />
              <QuickLinksWidget />
              <StreakCard 
                streak={user?.streak || 0} 
                points={user?.points || 0}
                onCheckIn={handleCheckIn}
                isLoading={isCheckingIn}
              />
              <WeightTrackerCard 
                currentWeight={user?.weight}
                onUpdateWeight={handleUpdateWeight}
                isLoading={isUpdatingWeight}
              />
              <QuickStatsCard plan={user?.plan} />
            </View>
          ) : (
            <View>
              <OnboardSection />
              <TrainerSection />
            </View>
          )}
          </View>
        </ScrollView>
      </ImageBackground>
    </CustomScreen>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
    // paddingVertical: 16,
    // paddingHorizontal: 20,
  },
  backgroundImageStyle: {
    opacity: 0.17,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'transparent',
  },
  container: {
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  sections: {
    flex: 1,
    paddingBottom: 80,
  },
  trainerName: {
    fontSize: 16,
    color: Colors.TEXT,
  },
  trainerTag: {
    fontSize: 12,
    color: Colors.TEXT_SECONDARY,
    marginTop: 2,
  },
});
