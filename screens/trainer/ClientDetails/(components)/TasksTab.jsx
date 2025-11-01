import React from "react";
import { View, StyleSheet, ActivityIndicator, Pressable } from "react-native";
import { Feather } from "@expo/vector-icons";
import AppText from "@/components/ui/Text";
import Colors from "@/constants/Colors";
import { useGetMyTasksQuery } from "@/store/redux/trainer/services/trainerTaskApi";

const TaskCard = ({ task, onPress }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case "completed":
        return Colors.SUCCESS;
      case "overdue":
        return Colors.ERROR;
      case "in_progress":
        return Colors.WARNING;
      default:
        return Colors.TEXT_SECONDARY;
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "completed":
        return "check-circle";
      case "overdue":
        return "alert-circle";
      case "in_progress":
        return "clock";
      default:
        return "circle";
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  return (
    <Pressable style={styles.taskCard} onPress={onPress}>
      <View style={styles.taskHeader}>
        <Feather
          name={getStatusIcon(task.status)}
          size={20}
          color={getStatusColor(task.status)}
        />
        <View style={styles.taskInfo}>
          <AppText font="SemiBold" style={styles.taskTitle}>
            {task.title}
          </AppText>
          {task.description && (
            <AppText style={styles.taskDescription} numberOfLines={2}>
              {task.description}
            </AppText>
          )}
        </View>
      </View>

      <View style={styles.taskFooter}>
        <View style={styles.taskMeta}>
          <Feather name="calendar" size={12} color={Colors.TEXT_SECONDARY} />
          <AppText style={styles.metaText}>
            Due {formatDate(task.deadlineDate)}
          </AppText>
        </View>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: `${getStatusColor(task.status)}20` },
          ]}
        >
          <AppText
            style={[styles.statusText, { color: getStatusColor(task.status) }]}
          >
            {task.status}
          </AppText>
        </View>
      </View>
    </Pressable>
  );
};

const TasksTab = ({ clientId, enrollmentId, onTaskPress }) => {
  // Get last 3 days tasks
  const threeDaysAgo = new Date();
  threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

  const {
    data: tasksData,
    isLoading,
    error,
  } = useGetMyTasksQuery({
    clientId,
    status: "all",
    limit: 20,
  });

  const tasks = tasksData?.data || [];

  // Filter tasks from last 3 days
  const recentTasks = tasks.filter((task) => {
    const taskDate = new Date(task.createdAt);
    return taskDate >= threeDaysAgo;
  });

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.BRAND} />
        <AppText style={styles.loadingText}>Loading tasks...</AppText>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Feather name="alert-circle" size={48} color={Colors.ERROR} />
        <AppText style={styles.errorText}>Failed to load tasks</AppText>
      </View>
    );
  }

  if (recentTasks.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Feather name="clipboard" size={48} color={Colors.TEXT_SECONDARY} />
        <AppText font="SemiBold" style={styles.emptyTitle}>
          No Recent Tasks
        </AppText>
        <AppText style={styles.emptyText}>
          No tasks assigned in the last 3 days
        </AppText>
      </View>
    );
  }

  return (
    <View style={styles.tabPanel}>
      <View style={styles.section}>
        <AppText font="Bold" style={styles.sectionTitle}>
          Recent Tasks (Last 3 Days)
        </AppText>
        <View style={styles.tasksList}>
          {recentTasks.map((task) => (
            <TaskCard
              key={task._id}
              task={task}
              onPress={() => onTaskPress?.(task)}
            />
          ))}
        </View>
      </View>

      {/* Task Summary */}
      <View style={styles.section}>
        <AppText font="Bold" style={styles.sectionTitle}>
          Task Summary
        </AppText>
        <View style={styles.summaryGrid}>
          <View style={styles.summaryItem}>
            <Feather name="check-circle" size={20} color={Colors.SUCCESS} />
            <AppText font="SemiBold" style={styles.summaryValue}>
              {tasks.filter((t) => t.status === "completed").length}
            </AppText>
            <AppText style={styles.summaryLabel}>Completed</AppText>
          </View>
          <View style={styles.summaryItem}>
            <Feather name="clock" size={20} color={Colors.WARNING} />
            <AppText font="SemiBold" style={styles.summaryValue}>
              {tasks.filter((t) => t.status === "in_progress").length}
            </AppText>
            <AppText style={styles.summaryLabel}>In Progress</AppText>
          </View>
          <View style={styles.summaryItem}>
            <Feather name="alert-circle" size={20} color={Colors.ERROR} />
            <AppText font="SemiBold" style={styles.summaryValue}>
              {tasks.filter((t) => t.status === "overdue").length}
            </AppText>
            <AppText style={styles.summaryLabel}>Overdue</AppText>
          </View>
        </View>
      </View>
    </View>
  );
};

export default TasksTab;

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
  tasksList: {
    gap: 12,
  },
  taskCard: {
    backgroundColor: Colors.CARD,
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },
  taskHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  taskInfo: {
    flex: 1,
    gap: 4,
  },
  taskTitle: {
    fontSize: 15,
    color: Colors.TEXT,
  },
  taskDescription: {
    fontSize: 13,
    color: Colors.TEXT_SECONDARY,
    lineHeight: 18,
  },
  taskFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  taskMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  metaText: {
    fontSize: 12,
    color: Colors.TEXT_SECONDARY,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 11,
    fontWeight: "600",
    textTransform: "capitalize",
  },
  summaryGrid: {
    flexDirection: "row",
    gap: 12,
  },
  summaryItem: {
    flex: 1,
    backgroundColor: Colors.CARD,
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    gap: 8,
  },
  summaryValue: {
    fontSize: 20,
    color: Colors.TEXT,
  },
  summaryLabel: {
    fontSize: 11,
    color: Colors.TEXT_SECONDARY,
    textAlign: "center",
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    color: Colors.TEXT_SECONDARY,
  },
  errorContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
    gap: 12,
  },
  errorText: {
    fontSize: 14,
    color: Colors.ERROR,
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
    gap: 12,
  },
  emptyTitle: {
    fontSize: 16,
    color: Colors.TEXT,
  },
  emptyText: {
    fontSize: 13,
    color: Colors.TEXT_SECONDARY,
    textAlign: "center",
  },
});
