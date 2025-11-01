import React from "react";
import { View, StyleSheet } from "react-native";
import { Feather, FontAwesome6 } from "@expo/vector-icons";
import AppText from "@/components/ui/Text";
import Colors from "@/constants/Colors";

const OverviewTab = ({ clientBasic, clientStats }) => {
  return (
    <View style={styles.tabPanel}>
      {/* Plan Info */}
      {clientBasic?.plan && (
        <View style={styles.section}>
          <AppText font="Bold" style={styles.sectionTitle}>
            Current Plan
          </AppText>
          <View style={styles.planCard}>
            <AppText font="SemiBold" style={styles.planTitle}>
              {clientBasic.plan.title}
            </AppText>
            {clientBasic.plan.description && (
              <AppText style={styles.planDescription}>
                {clientBasic.plan.description}
              </AppText>
            )}
            <View style={styles.planMeta}>
              <View style={styles.metaItem}>
                <Feather name="clock" size={14} color={Colors.TEXT_SECONDARY} />
                <AppText style={styles.metaText}>
                  {clientBasic.plan.durationWeeks} weeks
                </AppText>
              </View>
              <View style={styles.metaItem}>
                <Feather
                  name="dollar-sign"
                  size={14}
                  color={Colors.TEXT_SECONDARY}
                />
                <AppText style={styles.metaText}>
                  ${clientBasic.plan.price}
                </AppText>
              </View>
            </View>
          </View>
        </View>
      )}

      {/* Progress Stats */}
      {clientStats && (
        <View style={styles.section}>
          <AppText font="Bold" style={styles.sectionTitle}>
            Progress Overview
          </AppText>
          <View style={styles.progressGrid}>
            <View style={styles.progressItem}>
              <Feather name="calendar" size={20} color={Colors.PRIMARY} />
              <AppText style={styles.progressLabel}>Enrolled</AppText>
              <AppText font="SemiBold" style={styles.progressValue}>
                {clientStats.daysEnrolled} days ago
              </AppText>
            </View>
            <View style={styles.progressItem}>
              <Feather name="activity" size={20} color={Colors.SUCCESS} />
              <AppText style={styles.progressLabel}>Current Week</AppText>
              <AppText font="SemiBold" style={styles.progressValue}>
                Week {clientStats.currentWeek}
              </AppText>
            </View>
            {clientStats.startWeight && (
              <View style={styles.progressItem}>
                <Feather name="trending-down" size={20} color={Colors.INFO} />
                <AppText style={styles.progressLabel}>Weight</AppText>
                <AppText font="SemiBold" style={styles.progressValue}>
                  {clientStats.currentWeight || clientStats.startWeight}kg
                </AppText>
                {clientStats.weightChange && (
                  <AppText style={styles.weightChange}>
                    -{clientStats.weightChange}kg
                  </AppText>
                )}
              </View>
            )}
            <View style={styles.progressItem}>
              <FontAwesome6 name="fire-flame-curved" size={20} color="orange" />
              <AppText style={styles.progressLabel}>Streak</AppText>
              <AppText font="SemiBold" style={styles.progressValue}>
                {clientStats.streak} days
              </AppText>
            </View>
          </View>
        </View>
      )}

      {/* Task Completion Rate */}
      {clientStats && (
        <View style={styles.section}>
          <AppText font="Bold" style={styles.sectionTitle}>
            Task Performance
          </AppText>
          <View style={styles.taskCard}>
            <View style={styles.taskHeader}>
              <Feather name="check-circle" size={24} color={Colors.SUCCESS} />
              <View style={styles.taskInfo}>
                <AppText font="SemiBold" style={styles.taskValue}>
                  {clientStats.tasksCompleted} / {clientStats.totalTasks}
                </AppText>
                <AppText style={styles.taskLabel}>Tasks Completed</AppText>
              </View>
            </View>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${clientStats.taskCompletionRate}%` },
                ]}
              />
            </View>
            <AppText style={styles.completionRate}>
              {clientStats.taskCompletionRate}% completion rate
            </AppText>
          </View>
        </View>
      )}
    </View>
  );
};

export default OverviewTab;

const styles = StyleSheet.create({
  tabPanel: {
    gap: 16,
    paddingBottom: 40,
  },
  section: {
    gap: 12,
  },
  sectionTitle: {
    fontSize: 16,
    color: Colors.TEXT,
  },
  planCard: {
    backgroundColor: Colors.CARD,
    borderRadius: 12,
    padding: 16,
    gap: 8,
  },
  planTitle: {
    fontSize: 16,
    color: Colors.TEXT,
  },
  planDescription: {
    fontSize: 13,
    color: Colors.TEXT_SECONDARY,
    lineHeight: 18,
  },
  planMeta: {
    flexDirection: "row",
    gap: 16,
    marginTop: 8,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  metaText: {
    fontSize: 12,
    color: Colors.TEXT_SECONDARY,
  },
  progressGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  progressItem: {
    width: "48%",
    backgroundColor: Colors.CARD,
    borderRadius: 12,
    padding: 16,
    gap: 8,
  },
  progressLabel: {
    fontSize: 12,
    color: Colors.TEXT_SECONDARY,
  },
  progressValue: {
    fontSize: 16,
    color: Colors.TEXT,
  },
  weightChange: {
    fontSize: 12,
    color: Colors.SUCCESS,
  },
  taskCard: {
    backgroundColor: Colors.CARD,
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },
  taskHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  taskInfo: {
    flex: 1,
  },
  taskValue: {
    fontSize: 18,
    color: Colors.TEXT,
  },
  taskLabel: {
    fontSize: 13,
    color: Colors.TEXT_SECONDARY,
  },
  progressBar: {
    height: 8,
    backgroundColor: Colors.SECONDARY,
    borderRadius: 4,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: Colors.SUCCESS,
    borderRadius: 4,
  },
  completionRate: {
    fontSize: 12,
    color: Colors.TEXT_SECONDARY,
    textAlign: "center",
  },
});
