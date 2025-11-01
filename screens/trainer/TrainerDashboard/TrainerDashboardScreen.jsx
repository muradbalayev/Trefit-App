import React, { useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Pressable,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { CustomScreen } from "@/components/common";
import ScreenHeader from "@/components/common/ScreenHeader";
import AppText from "@/components/ui/Text";
import Colors from "@/constants/Colors";
import { Feather } from "@expo/vector-icons";
import { useNavigate } from "@/hooks/useNavigation";
import { useGetTrainerStatsQuery } from "@/store/redux/trainer/services/trainerStatsApi";
import { useGetDashboardClientsQuery } from "@/store/redux/trainer/services/trainerStatsApi";

const TrainerDashboardScreen = () => {
  const { goBack, navigate } = useNavigate();
  const [timeFilter, setTimeFilter] = useState("month"); // week, month, year, all
  
  const {
    data: stats,
    isLoading: isLoadingStats,
    refetch: refetchStats,
    isFetching,
  } = useGetTrainerStatsQuery();

  const {
    data: clientsData,
    isLoading: isLoadingClients,
  } = useGetDashboardClientsQuery({
    status: "active",
    limit: 100,
  });

  const clients = clientsData || [];

  // Filter options
  const timeFilters = [
    { value: "week", label: "This Week" },
    { value: "month", label: "This Month" },
    { value: "year", label: "This Year" },
    { value: "all", label: "All Time" },
  ];

  const renderOverviewStats = () => (
    <View style={styles.section}>
      <AppText font="Bold" style={styles.sectionTitle}>
        Overview
      </AppText>
      <View style={styles.statsGrid}>
        <StatCard
          icon="users"
          label="Active Clients"
          value={stats?.overview?.activeClients || 0}
          color={Colors.BRAND}
        />
        <StatCard
          icon="user-check"
          label="Total Clients"
          value={
            (stats?.overview?.activeClients || 0) +
            (stats?.overview?.completedClients || 0)
          }
          color={Colors.SUCCESS}
        />
        <StatCard
          icon="file-text"
          label="Active Plans"
          value={stats?.overview?.activePlans || 0}
          color={Colors.INFO}
        />
        <StatCard
          icon="file"
          label="Total Plans"
          value={stats?.overview?.totalPlans || 0}
          color={Colors.TEXT_SECONDARY}
        />
      </View>
    </View>
  );

  const renderRevenueStats = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeaderRow}>
        <AppText font="Bold" style={styles.sectionTitle}>
          Revenue
        </AppText>
        <Pressable
          style={styles.viewDetailsButton}
          onPress={() => navigate("RevenueAnalytics")}
        >
          <AppText style={styles.viewDetailsText}>View Details</AppText>
          <Feather name="arrow-right" size={14} color={Colors.BRAND} />
        </Pressable>
      </View>
      <View style={styles.revenueCard}>
        <View style={styles.revenueHeader}>
          <View style={styles.revenueIcon}>
            <Feather name="dollar-sign" size={24} color={Colors.BRAND} />
          </View>
          <View style={styles.revenueInfo}>
            <AppText style={styles.revenueLabel}>Total Revenue</AppText>
            <AppText font="Bold" style={styles.revenueValue}>
              ${stats?.overview?.totalRevenue || 0}
            </AppText>
          </View>
        </View>
        <View style={styles.revenueDivider} />
        <View style={styles.revenueBreakdown}>
          <View style={styles.revenueItem}>
            <AppText style={styles.revenueItemLabel}>This Month</AppText>
            <AppText font="SemiBold" style={styles.revenueItemValue}>
              ${stats?.overview?.thisMonthRevenue || 0}
            </AppText>
          </View>
          <View style={styles.revenueItem}>
            <AppText style={styles.revenueItemLabel}>Pending</AppText>
            <AppText font="SemiBold" style={[styles.revenueItemValue, { color: Colors.WARNING }]}>
              $0
            </AppText>
          </View>
        </View>
      </View>
    </View>
  );

  const renderTaskStats = () => (
    <View style={styles.section}>
      <AppText font="Bold" style={styles.sectionTitle}>
        Tasks
      </AppText>
      <View style={styles.taskStatsContainer}>
        <View style={styles.taskStatCard}>
          <View style={styles.taskStatHeader}>
            <Feather name="check-circle" size={20} color={Colors.SUCCESS} />
            <AppText font="SemiBold" style={styles.taskStatValue}>
              {stats?.tasks?.completed || 0}
            </AppText>
          </View>
          <AppText style={styles.taskStatLabel}>Completed</AppText>
        </View>
        <View style={styles.taskStatCard}>
          <View style={styles.taskStatHeader}>
            <Feather name="clock" size={20} color={Colors.WARNING} />
            <AppText font="SemiBold" style={styles.taskStatValue}>
              {stats?.tasks?.pending || 0}
            </AppText>
          </View>
          <AppText style={styles.taskStatLabel}>Pending</AppText>
        </View>
        <View style={styles.taskStatCard}>
          <View style={styles.taskStatHeader}>
            <Feather name="list" size={20} color={Colors.BRAND} />
            <AppText font="SemiBold" style={styles.taskStatValue}>
              {stats?.tasks?.total || 0}
            </AppText>
          </View>
          <AppText style={styles.taskStatLabel}>Total</AppText>
        </View>
      </View>
    </View>
  );

  const renderRecentActivity = () => {
    if (!stats?.recentActivity || stats.recentActivity.length === 0) {
      return null;
    }

    return (
      <View style={styles.section}>
        <AppText font="Bold" style={styles.sectionTitle}>
          Recent Activity
        </AppText>
        <View style={styles.activityList}>
          {stats.recentActivity.slice(0, 5).map((activity, index) => (
            <View key={index} style={styles.activityItem}>
              <View style={styles.activityIcon}>
                <Feather name="user-plus" size={16} color={Colors.BRAND} />
              </View>
              <View style={styles.activityContent}>
                <AppText font="SemiBold" style={styles.activityTitle}>
                  {activity.clientName}
                </AppText>
                <AppText style={styles.activitySubtitle}>
                  Enrolled in {activity.planTitle}
                </AppText>
              </View>
              <AppText style={styles.activityTime}>
                {new Date(activity.enrolledAt).toLocaleDateString()}
              </AppText>
            </View>
          ))}
        </View>
      </View>
    );
  };

  const renderClientPerformance = () => {
    if (clients.length === 0) return null;

    // Calculate average completion rate
    const avgCompletionRate =
      clients.reduce((sum, client) => sum + (client.taskCompletionRate || 0), 0) /
      clients.length;

    return (
      <View style={styles.section}>
        <AppText font="Bold" style={styles.sectionTitle}>
          Client Performance
        </AppText>
        <View style={styles.performanceCard}>
          <View style={styles.performanceMetric}>
            <AppText style={styles.performanceLabel}>Avg. Task Completion</AppText>
            <AppText font="Bold" style={styles.performanceValue}>
              {avgCompletionRate.toFixed(0)}%
            </AppText>
          </View>
          <View style={styles.performanceMetric}>
            <AppText style={styles.performanceLabel}>Clients with Programs</AppText>
            <AppText font="Bold" style={styles.performanceValue}>
              {clients.filter((c) => c.hasWorkoutProgram).length}
            </AppText>
          </View>
        </View>
      </View>
    );
  };

  if (isLoadingStats || isLoadingClients) {
    return (
      <CustomScreen>
        <ScreenHeader action={goBack} title="Analytics Dashboard" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.BRAND} />
          <AppText style={styles.loadingText}>Loading analytics...</AppText>
        </View>
      </CustomScreen>
    );
  }

  return (
    <CustomScreen>
      <ScreenHeader action={goBack} title="Analytics Dashboard" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.container}
        refreshControl={
          <RefreshControl
            refreshing={isFetching}
            onRefresh={refetchStats}
            tintColor={Colors.BRAND}
            colors={[Colors.BRAND]}
          />
        }
      >
        {/* Time Filter */}
        <View style={styles.filterContainer}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterScroll}
          >
            {timeFilters.map((filter) => (
              <Pressable
                key={filter.value}
                style={[
                  styles.filterChip,
                  timeFilter === filter.value && styles.filterChipActive,
                ]}
                onPress={() => setTimeFilter(filter.value)}
              >
                <AppText
                  font={timeFilter === filter.value ? "SemiBold" : "Regular"}
                  style={[
                    styles.filterChipText,
                    timeFilter === filter.value && styles.filterChipTextActive,
                  ]}
                >
                  {filter.label}
                </AppText>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        {/* Overview Stats */}
        {renderOverviewStats()}

        {/* Revenue */}
        {renderRevenueStats()}

        {/* Tasks */}
        {renderTaskStats()}

        {/* Client Performance */}
        {renderClientPerformance()}

        {/* Recent Activity */}
        {renderRecentActivity()}
      </ScrollView>
    </CustomScreen>
  );
};

// StatCard Component
const StatCard = ({ icon, label, value, color }) => (
  <View style={styles.statCard}>
    <View style={[styles.statIcon, { backgroundColor: `${color}20` }]}>
      <Feather name={icon} size={20} color={color} />
    </View>
    <AppText font="Bold" style={styles.statValue}>
      {value}
    </AppText>
    <AppText style={styles.statLabel}>{label}</AppText>
  </View>
);

export default TrainerDashboardScreen;

const styles = StyleSheet.create({
  container: {
    paddingBottom: 60,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    color: Colors.TEXT_SECONDARY,
  },
  filterContainer: {
    marginBottom: 20,
  },
  filterScroll: {
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.CARD,
    borderWidth: 1,
    borderColor: Colors.BORDER,
  },
  filterChipActive: {
    backgroundColor: Colors.BRAND,
    borderColor: Colors.BRAND,
  },
  filterChipText: {
    fontSize: 13,
    color: Colors.TEXT,
  },
  filterChipTextActive: {
    color: Colors.TEXT_BLACK,
  },
  section: {
    marginBottom: 24,
    flex: 1,
    justifyContent: "center",
    flexDirection: "column",
    gap: 12,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    // marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    color: Colors.TEXT,
  },
  viewDetailsButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: Colors.SECONDARY,
    borderRadius: 8,
  },
  viewDetailsText: {
    fontSize: 12,
    color: Colors.BRAND,
    fontWeight: "600",
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  statCard: {
    width: "48%",
    backgroundColor: Colors.CARD,
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.BORDER,
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  statValue: {
    fontSize: 24,
    color: Colors.TEXT,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.TEXT_SECONDARY,
    textAlign: "center",
  },
  revenueCard: {
    backgroundColor: Colors.CARD,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.BORDER,
  },
  revenueHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  revenueIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: `${Colors.BRAND}20`,
    alignItems: "center",
    justifyContent: "center",
  },
  revenueInfo: {
    flex: 1,
  },
  revenueLabel: {
    fontSize: 14,
    color: Colors.TEXT_SECONDARY,
    marginBottom: 4,
  },
  revenueValue: {
    fontSize: 28,
    color: Colors.TEXT,
  },
  revenueDivider: {
    height: 1,
    backgroundColor: Colors.BORDER,
    marginVertical: 16,
  },
  revenueBreakdown: {
    flexDirection: "row",
    gap: 16,
  },
  revenueItem: {
    flex: 1,
  },
  revenueItemLabel: {
    fontSize: 12,
    color: Colors.TEXT_SECONDARY,
    marginBottom: 4,
  },
  revenueItemValue: {
    fontSize: 18,
    color: Colors.TEXT,
  },
  taskStatsContainer: {
    flexDirection: "row",
    gap: 12,
  },
  taskStatCard: {
    flex: 1,
    backgroundColor: Colors.CARD,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.BORDER,
  },
  taskStatHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  taskStatValue: {
    fontSize: 20,
    color: Colors.TEXT,
  },
  taskStatLabel: {
    fontSize: 12,
    color: Colors.TEXT_SECONDARY,
  },
  activityList: {
    gap: 12,
  },
  activityItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: Colors.CARD,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.BORDER,
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: `${Colors.BRAND}20`,
    alignItems: "center",
    justifyContent: "center",
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 14,
    color: Colors.TEXT,
    marginBottom: 2,
  },
  activitySubtitle: {
    fontSize: 12,
    color: Colors.TEXT_SECONDARY,
  },
  activityTime: {
    fontSize: 11,
    color: Colors.TEXT_SECONDARY,
  },
  performanceCard: {
    backgroundColor: Colors.CARD,
    borderRadius: 12,
    padding: 16,
    gap: 16,
    borderWidth: 1,
    borderColor: Colors.BORDER,
  },
  performanceMetric: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  performanceLabel: {
    fontSize: 14,
    color: Colors.TEXT_SECONDARY,
  },
  performanceValue: {
    fontSize: 20,
    color: Colors.TEXT,
  },
});
