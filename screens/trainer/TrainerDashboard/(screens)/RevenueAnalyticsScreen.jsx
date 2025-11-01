import React, { useState, useMemo } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Pressable,
  RefreshControl,
} from "react-native";
import { CustomScreen } from "@/components/common";
import ScreenHeader from "@/components/common/ScreenHeader";
import AppText from "@/components/ui/Text";
import Colors from "@/constants/Colors";
import { Feather } from "@expo/vector-icons";
import { useNavigate } from "@/hooks/useNavigation";
import { useGetDashboardClientsQuery } from "@/store/redux/trainer/services/trainerStatsApi";
import LineChart from "@/components/charts/LineChart";
import BarChart from "@/components/charts/BarChart";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, eachMonthOfInterval, startOfYear } from "date-fns";

const RevenueAnalyticsScreen = () => {
  const { goBack } = useNavigate();
  const [timeFilter, setTimeFilter] = useState("month"); // week, month, year
  
  const {
    data: clientsData,
    isLoading,
    refetch,
    isFetching,
  } = useGetDashboardClientsQuery({
    status: "all",
    limit: 1000,
  });

  console.log(clientsData)
  const clients = clientsData || [];

  // Time filter options
  const timeFilters = [
    { value: "week", label: "This Week" },
    { value: "month", label: "This Month" },
    { value: "year", label: "This Year" },
  ];

  // Process revenue data based on enrollments
  const revenueData = useMemo(() => {
    if (!clients || clients.length === 0) return { chart: [], total: 0, paid: 0, pending: 0 };

    const now = new Date();
    let dateRange = [];
    let groupBy = "day";
    let labelFormat = "MMM dd";

    if (timeFilter === "week") {
      // Last 7 days
      dateRange = Array.from({ length: 7 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (6 - i));
        return date;
      });
      groupBy = "day";
      labelFormat = "EEE"; // Mon, Tue, Wed
    } else if (timeFilter === "month") {
      // Last 4 weeks (group by week)
      dateRange = Array.from({ length: 4 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (21 - i * 7));
        return date;
      });
      groupBy = "week";
      labelFormat = "'W'w"; // W1, W2, W3, W4
    } else {
      // This year (by month)
      dateRange = eachMonthOfInterval({
        start: startOfYear(now),
        end: now,
      });
      groupBy = "month";
      labelFormat = "MMM"; // Jan, Feb, Mar
    }

    // Group revenue by date
    const revenueByDate = {};
    let totalRevenue = 0;
    let paidRevenue = 0;
    let pendingRevenue = 0;

    dateRange.forEach((date, index) => {
      const key = groupBy === "week" ? `W${index + 1}` : format(date, labelFormat);
      revenueByDate[key] = 0;
    });

    // Calculate revenue from enrollments
    clients.forEach((client) => {
      const enrollmentDate = new Date(client.enrolledAt);
      const amount = 50; // Default plan price

      let key;
      if (groupBy === "day") {
        key = format(enrollmentDate, labelFormat);
      } else if (groupBy === "week") {
        // Find which week this enrollment belongs to
        const weekIndex = dateRange.findIndex((weekStart, idx) => {
          const weekEnd = new Date(weekStart);
          weekEnd.setDate(weekEnd.getDate() + 7);
          return enrollmentDate >= weekStart && enrollmentDate < weekEnd;
        });
        if (weekIndex !== -1) {
          key = `W${weekIndex + 1}`;
        }
      } else {
        key = format(enrollmentDate, labelFormat);
      }

      if (key && revenueByDate[key] !== undefined) {
        revenueByDate[key] += amount;
      }

      totalRevenue += amount;
      paidRevenue += amount;
    });

    const chartData = Object.entries(revenueByDate).map(([date, revenue]) => ({
      x: date,
      y: revenue,
    }));

    return {
      chart: chartData,
      total: totalRevenue,
      paid: paidRevenue,
      pending: pendingRevenue,
    };
  }, [clients, timeFilter]);

  // Top earning periods
  const topPeriods = useMemo(() => {
    if (!revenueData.chart || revenueData.chart.length === 0) return [];
    
    return [...revenueData.chart]
      .sort((a, b) => b.y - a.y)
      .slice(0, 5);
  }, [revenueData]);

  // Revenue by status (pie chart data)
  const revenueByStatus = useMemo(() => {
    return [
      { x: "Paid", y: revenueData.paid },
      { x: "Pending", y: revenueData.pending },
    ].filter((item) => item.y > 0);
  }, [revenueData]);

  return (
    <CustomScreen>
      <ScreenHeader action={goBack} title="Revenue Analytics" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.container}
        refreshControl={
          <RefreshControl
            refreshing={isFetching}
            onRefresh={refetch}
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

        {/* Revenue Summary Cards */}
        <View style={styles.summaryContainer}>
          <View style={styles.summaryCard}>
            <View style={styles.summaryIcon}>
              <Feather name="dollar-sign" size={20} color={Colors.BRAND} />
            </View>
            <AppText style={styles.summaryLabel}>Total Revenue</AppText>
            <AppText font="Bold" style={styles.summaryValue}>
              ${revenueData.total}
            </AppText>
          </View>

          <View style={styles.summaryCard}>
            <View style={[styles.summaryIcon, { backgroundColor: `${Colors.SUCCESS}20` }]}>
              <Feather name="check-circle" size={20} color={Colors.SUCCESS} />
            </View>
            <AppText style={styles.summaryLabel}>Paid</AppText>
            <AppText font="Bold" style={[styles.summaryValue, { color: Colors.SUCCESS }]}>
              ${revenueData.paid}
            </AppText>
          </View>

          <View style={styles.summaryCard}>
            <View style={[styles.summaryIcon, { backgroundColor: `${Colors.WARNING}20` }]}>
              <Feather name="clock" size={20} color={Colors.WARNING} />
            </View>
            <AppText style={styles.summaryLabel}>Pending</AppText>
            <AppText font="Bold" style={[styles.summaryValue, { color: Colors.WARNING }]}>
              ${revenueData.pending}
            </AppText>
          </View>
        </View>

        {/* Revenue Trend Chart */}
        <View style={styles.section}>
          <LineChart
            data={revenueData.chart}
            title="Revenue Trend"
            yAxisLabel="Revenue ($)"
            color={Colors.BRAND}
          />
        </View>

        {/* Top Earning Periods */}
        {topPeriods.length > 0 && (
          <View style={styles.section}>
            <AppText font="Bold" style={styles.sectionTitle}>
              Top Earning Periods
            </AppText>
            <View style={styles.topPeriodsContainer}>
              {topPeriods.map((period, index) => (
                <View key={index} style={styles.topPeriodItem}>
                  <View style={styles.topPeriodRank}>
                    <AppText font="Bold" style={styles.topPeriodRankText}>
                      #{index + 1}
                    </AppText>
                  </View>
                  <View style={styles.topPeriodInfo}>
                    <AppText font="SemiBold" style={styles.topPeriodDate}>
                      {period.x}
                    </AppText>
                    <AppText style={styles.topPeriodLabel}>Revenue</AppText>
                  </View>
                  <AppText font="Bold" style={styles.topPeriodValue}>
                    ${period.y}
                  </AppText>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Revenue Comparison Bar Chart */}
        {revenueData.chart.length > 0 && (
          <View style={styles.section}>
            <BarChart
              data={revenueData.chart}
              title={`${timeFilter === "week" ? "Weekly" : timeFilter === "month" ? "Monthly" : "Yearly"} Comparison`}
              yAxisLabel="Revenue ($)"
              color={Colors.BRAND}
            />
          </View>
        )}

        {/* Insights */}
        <View style={styles.insightsCard}>
          <View style={styles.insightsHeader}>
            <Feather name="trending-up" size={20} color={Colors.BRAND} />
            <AppText font="Bold" style={styles.insightsTitle}>
              Insights
            </AppText>
          </View>
          <View style={styles.insightsList}>
            <View style={styles.insightItem}>
              <Feather name="users" size={16} color={Colors.TEXT_SECONDARY} />
              <AppText style={styles.insightText}>
                {clients.length} total enrollments
              </AppText>
            </View>
            <View style={styles.insightItem}>
              <Feather name="dollar-sign" size={16} color={Colors.TEXT_SECONDARY} />
              <AppText style={styles.insightText}>
                ${clients.length > 0 ? (revenueData.total / clients.length).toFixed(2) : 0} average per client
              </AppText>
            </View>
            <View style={styles.insightItem}>
              <Feather name="calendar" size={16} color={Colors.TEXT_SECONDARY} />
              <AppText style={styles.insightText}>
                Tracking {timeFilter === "week" ? "7 days" : timeFilter === "month" ? "30 days" : "12 months"}
              </AppText>
            </View>
          </View>
        </View>
      </ScrollView>
    </CustomScreen>
  );
};

export default RevenueAnalyticsScreen;

const styles = StyleSheet.create({
  container: {
    paddingBottom: 60,
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
    textAlign: "center",
  },
  filterChipTextActive: {
    color: Colors.TEXT_BLACK,
  },
  summaryContainer: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 24,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: Colors.CARD,
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.BORDER,
  },
  summaryIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: `${Colors.BRAND}20`,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 11,
    color: Colors.TEXT_SECONDARY,
    marginBottom: 4,
    textAlign: "center",
  },
  summaryValue: {
    fontSize: 18,
    color: Colors.TEXT,
    textAlign: "center",
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    color: Colors.TEXT,
    marginBottom: 16,
  },
  topPeriodsContainer: {
    gap: 12,
  },
  topPeriodItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: Colors.CARD,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.BORDER,
  },
  topPeriodRank: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.BRAND,
    alignItems: "center",
    justifyContent: "center",
  },
  topPeriodRankText: {
    fontSize: 12,
    color: Colors.TEXT_BLACK,
  },
  topPeriodInfo: {
    flex: 1,
  },
  topPeriodDate: {
    fontSize: 14,
    color: Colors.TEXT,
    marginBottom: 2,
  },
  topPeriodLabel: {
    fontSize: 11,
    color: Colors.TEXT_SECONDARY,
  },
  topPeriodValue: {
    fontSize: 16,
    color: Colors.BRAND,
  },
  insightsCard: {
    backgroundColor: Colors.CARD,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.BORDER,
    marginBottom: 24,
  },
  insightsHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 16,
  },
  insightsTitle: {
    fontSize: 16,
    color: Colors.TEXT,
  },
  insightsList: {
    gap: 12,
  },
  insightItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  insightText: {
    fontSize: 13,
    color: Colors.TEXT_SECONDARY,
  },
});
