import React, { useState } from "react";
import { View, StyleSheet, ScrollView, Pressable, TouchableOpacity } from "react-native";
import { useSelector } from "react-redux";
import { useNavigate } from "@/hooks/useNavigation";
import Colors from "@/constants/Colors";
import Feather from "@expo/vector-icons/Feather";
import { CustomScreen, SuccessModal } from "@/components/common";
import AppText from "@/components/ui/Text";
import { useGetAccountQuery } from "@/store/redux/user/services/userAccountApi";

const TrainerHomeScreen = () => {
  const { navigate } = useNavigate();
  const { isAuthenticated } = useSelector((state) => state.userAuth);
  const { data: user } = useGetAccountQuery(undefined, { skip: !isAuthenticated });
  const [showIncompleteModal, setShowIncompleteModal] = useState(false);

  // Mock data - gələcəkdə API-dən gələcək
  const stats = {
    totalPlans: 5,
    activeClients: 12,
    totalRevenue: 850,
    thisMonthRevenue: 320,
  };

  const recentActivities = [
    {
      id: 1,
      type: "new_client",
      message: "John Doe joined your 'Muscle Gain' plan",
      time: "2 hours ago",
    },
    {
      id: 2,
      type: "plan_view",
      message: "Your 'Weight Loss' plan was viewed 5 times",
      time: "4 hours ago",
    },
    {
      id: 3,
      type: "new_review",
      message: "Sarah left a 5-star review",
      time: "1 day ago",
    },
  ];

  return (
    <CustomScreen>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <AppText style={styles.greeting}>Good morning,</AppText>
            <AppText style={styles.userName}>{user?.name || "Trainer"}</AppText>
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

        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <StatCard
            title="Total Plans"
            value={stats.totalPlans}
            icon="clipboard"
            color={Colors.BRAND}
            onPress={() => navigate("Plans")}
          />
          <StatCard
            title="Active Clients"
            value={stats.activeClients}
            icon="users"
            color="#10B981"
            onPress={() => navigate("Clients")}
          />
        </View>

        <View style={styles.statsContainer}>
          <StatCard
            title="Total Revenue"
            value={`$${stats.totalRevenue}`}
            icon="dollar-sign"
            color="#8B5CF6"
          />
          <StatCard
            title="This Month"
            value={`$${stats.thisMonthRevenue}`}
            icon="trending-up"
            color="#F59E0B"
          />
        </View>

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
                const hasAccess = user?.trainerProfile?.hasAccessToCreatePlan === true;
                
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

        {/* Recent Activities */}
        <View style={styles.section}>
          <AppText style={styles.sectionTitle} font="Bold">
            Recent Activities
          </AppText>
          <View style={styles.activitiesContainer}>
            {recentActivities.map((activity) => (
              <ActivityItem key={activity.id} activity={activity} />
            ))}
          </View>
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

const StatCard = ({ title, value, icon, color, onPress }) => (
  <Pressable
    style={[styles.statCard, { borderLeftColor: color }]}
    onPress={onPress}
    disabled={!onPress}
  >
    <View style={styles.statContent}>
      <View style={styles.statHeader}>
        <Feather name={icon} size={20} color={color} />
        <AppText style={styles.statTitle}>{title}</AppText>
      </View>
      <AppText style={styles.statValue}>{value}</AppText>
    </View>
  </Pressable>
);

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

const ActivityItem = ({ activity }) => (
  <View style={styles.activityItem}>
    <View style={styles.activityIcon}>
      <Feather
        name={
          activity.type === "new_client"
            ? "user-plus"
            : activity.type === "plan_view"
              ? "eye"
              : "star"
        }
        size={16}
        color={Colors.BRAND}
      />
    </View>
    <View style={styles.activityContent}>
      <AppText style={styles.activityMessage} font="SemiBold">
        {activity.message}
      </AppText>
      <AppText style={styles.activityTime}>{activity.time}</AppText>
    </View>
  </View>
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
    fontSize: 24,
    fontWeight: "bold",
    marginTop: 4,
  },

  statsContainer: {
    flexDirection: "row",
    marginBottom: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.CARD,
    borderRadius: 16,
    padding: 16,
    borderLeftWidth: 4,
  },
  statContent: {
    gap: 12,
  },
  statHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  statTitle: {
    fontSize: 14,
    color: Colors.TEXT_SECONDARY,
    fontWeight: "500",
  },
  statValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: Colors.TEXT,
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
  activitiesContainer: {
    gap: 12,
  },
  activityItem: {
    flexDirection: "row",
    backgroundColor: Colors.CARD,
    padding: 16,
    borderRadius: 12,
    alignItems: "flex-start",
    gap: 12,
  },
  activityIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: Colors.BRAND + "20",
    alignItems: "center",
    justifyContent: "center",
  },
  activityContent: {
    flex: 1,
    gap: 4,
  },
  activityMessage: {
    color: Colors.TEXT,
    fontSize: 14,
  },
  activityTime: {
    fontSize: 12,
    color: Colors.TEXT_SECONDARY,
  },
});

export default TrainerHomeScreen;
