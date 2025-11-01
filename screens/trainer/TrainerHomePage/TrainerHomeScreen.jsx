import React, { useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Pressable,
  TouchableOpacity,
  RefreshControl,
} from "react-native";
import { useSelector } from "react-redux";
import { useNavigate } from "@/hooks/useNavigation";
import Colors from "@/constants/Colors";
import Feather from "@expo/vector-icons/Feather";
import { CustomScreen, Loading, SuccessModal } from "@/components/common";
import AppText from "@/components/ui/Text";
import { useGetAccountQuery } from "@/store/redux/user/services/userAccountApi";
import { useGetTrainerStatsQuery } from "@/store/redux/trainer/services/trainerStatsApi";
import StatsOverview from "./(components)/StatsOverview";
import ClientDashboard from "./(components)/ClientDashboard";

const TrainerHomeScreen = () => {
  const { navigate } = useNavigate();
  const { isAuthenticated } = useSelector((state) => state.userAuth);
  const {
    data: user,
    refetch: refetchUser,
    isFetching,
    isLoading
  } = useGetAccountQuery(undefined, { skip: !isAuthenticated });
  const { 
    data: statsData, 
    isLoading: statsLoading,
    refetch: refetchStats 
  } = useGetTrainerStatsQuery(
    undefined,
    {
      skip: !isAuthenticated,
    }
  );

  const handleRefresh = async () => {
    await Promise.all([refetchUser(), refetchStats()]);
  };
  const [showIncompleteModal, setShowIncompleteModal] = useState(false);

  // Extract stats from API response
  const stats = statsData?.overview || {
    totalPlans: 0,
    activeClients: 0,
    totalRevenue: 0,
    thisMonthRevenue: 0,
  };

  const handleClientPress = (client) => {
    navigate("ClientDetails", {
      clientId: client.clientId,
      enrollmentId: client.enrollmentId,
    });
  };

  if (isLoading) return <Loading />;

  return (
    <CustomScreen>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isFetching || statsLoading}
            onRefresh={handleRefresh}
            tintColor={Colors.BRAND}
            colors={[Colors.BRAND]}
            progressBackgroundColor={Colors.SECONDARY}
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <AppText style={styles.greeting}>Hello,</AppText>
            <AppText style={styles.userName} font="Bold">
              {user?.name || "Trainer"}
            </AppText>
          </View>
          <View style={styles.iconContainer}>
            <TouchableOpacity
              style={styles.icon}
              onPress={() => navigate("Notifications")}
            >
              <Feather name="bell" size={24} color={Colors.TEXT} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.icon}
              onPress={() => navigate("Chat")}
            >
              <Feather name="message-circle" size={24} color={Colors.TEXT} />
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.container}>
          <StatsOverview stats={stats} onNavigate={navigate} isLoading={statsLoading} />

          {/* Quick Actions */}
          <View style={styles.section}>
            <AppText style={styles.sectionTitle} font="Bold">
              Quick Actions
            </AppText>
            <View style={styles.quickActions}>
              <ActionButton
                title="Create New Plan"
                icon="plus"
                color={Colors.BRAND}
                onPress={() => {
                  // Check if profile is complete
                  // Default to false if undefined (for backward compatibility)
                  const hasAccess =
                    user?.trainerProfile?.hasAccessToCreatePlan === true;

                  if (!hasAccess) {
                    setShowIncompleteModal(true);
                  } else {
                    navigate("CreatePlan");
                  }
                }}
              />
              <ActionButton
                title="View All Plans"
                icon="list"
                color="white"
                onPress={() => navigate("Plans")}
              />
            </View>
          </View>

          {/* Client Dashboard */}
          <View style={styles.section}>
            <ClientDashboard 
              onClientPress={handleClientPress} 
              onViewAll={() => navigate("ClientDashboard")}
              limit={2}
            />
          </View>
        </View>
      </ScrollView>

      {/* Profile Incomplete Modal */}
      <SuccessModal
        visible={showIncompleteModal}
        title="Profilinizi Tamamlayın"
        message="Plan yaratmaq üçün profilinizi tamamlamalısınız. Bio, ən azı bir sosial media linki və lokasiya məlumatlarınızı əlavə edin."
        buttonText="Profilə Get"
        onClose={() => {
          setShowIncompleteModal(false);
          navigate("EditProfile");
        }}
        iconName="alert-circle"
        iconColor={Colors.WARNING}
      />
    </CustomScreen>
  );
};

const ActionButton = ({ title, icon, color, onPress }) => (
  <Pressable
    style={[styles.actionButton, { backgroundColor: color }]}
    onPress={onPress}
  >
    <Feather name={icon} size={24} color="black" />
    <AppText style={styles.actionButtonText} font="SemiBold">
      {title}
    </AppText>
  </Pressable>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.BACKGROUND,
    paddingBottom: 60,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 10,
    paddingBottom: 20,
  },
  iconContainer: {
    flexDirection: "row",
    gap: 8,
  },
  icon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: Colors.CARD,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: Colors.BORDER,
  },
  greeting: {
    fontSize: 16,
    fontWeight: "400",
  },
  userName: {
    fontSize: 22,
    marginTop: 4,
  },

  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    color: Colors.TEXT,
    marginBottom: 16,
  },
  quickActions: {
    flexDirection: "row",
    gap: 12,
  },
  actionButton: {
    flex: 1,
    padding: 16,
    borderRadius: 16,
    alignItems: "center",
    gap: 8,
  },
  actionButtonText: {
    fontSize: 14,
    color: "black",
    fontWeight: "600",
  },
});

export default TrainerHomeScreen;
