import React, { useState } from "react";
import { View, StyleSheet, FlatList, Pressable, RefreshControl } from "react-native";
import { useNavigate } from "@/hooks/useNavigation";
import Colors from "@/constants/Colors";
import Feather from "@expo/vector-icons/Feather";
import { CustomScreen, Loading } from "@/components/common";
import ScreenHeader from "@/components/common/ScreenHeader";
import AppText from "@/components/ui/Text";
import { useGetMyTasksQuery } from "@/store/redux/trainer/services/trainerTaskApi";
import HorizontalFilter from "@/components/common/HorizontalFilter";

const TrainerTasksScreen = () => {
  const { navigate, goBack } = useNavigate();
  const [selectedStatus, setSelectedStatus] = useState("all");
  
  const { data, isLoading, refetch, isFetching } = useGetMyTasksQuery({
    status: selectedStatus,
    page: 1,
    limit: 10,
  });

  const tasks = data?.data || [];

  const statusFilters = [
    { value: "all", label: "All", icon: "list" },
    { value: "pending", label: "Pending", icon: "clock" },
    { value: "in_progress", label: "In Progress", icon: "activity" },
    { value: "completed", label: "Completed", icon: "check-circle" },
    { value: "overdue", label: "Overdue", icon: "alert-circle" },
  ];

  const getStatusColor = (status) => {
    const colors = {
      pending: Colors.WARNING,
      in_progress: Colors.PRIMARY,
      completed: Colors.SUCCESS,
      overdue: Colors.DANGER,
    };
    return colors[status] || Colors.GRAY;
  };

  const getPriorityColor = (priority) => {
    const colors = {
      low: "#10B981",
      medium: "#F59E0B",
      high: "#EF4444",
    };
    return colors[priority] || Colors.GRAY;
  };

  const getTimeRemaining = (deadlineDate, status) => {
    // If completed, don't show overdue
    if (status === "completed") return "Completed";
    
    const now = new Date();
    const deadline = new Date(deadlineDate);
    const diff = deadline - now;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (diff < 0) return "Overdue";
    if (days > 0) return `${days} day${days > 1 ? 's' : ''}`;
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''}`;
    return "Today";
  };

  const renderTask = ({ item }) => (
    <Pressable
      style={styles.taskCard}
      onPress={() => navigate("TrainerTaskDetails", { taskId: item._id })}
    >
      <View style={styles.taskHeader}>
        <View style={styles.taskTitleRow}>
          <AppText style={styles.taskTitle}>{item.title}</AppText>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + "20" }]}>
            <AppText style={[styles.statusText, { color: getStatusColor(item.status) }]}>
              {item.status}
            </AppText>
          </View>
        </View>

        <View style={styles.taskMeta}>
          <View style={styles.metaItem}>
            <Feather name="user" size={14} color={Colors.TEXT_SECONDARY} />
            <AppText style={styles.metaText}>{item.assignedTo?.name}</AppText>
          </View>
          
          <View style={styles.metaItem}>
            <Feather name="clock" size={14} color={getStatusColor(item.status)} />
            <AppText style={[styles.metaText, { color: getStatusColor(item.status) }]}>
              {getTimeRemaining(item.deadlineDate, item.status)}
            </AppText>
          </View>

          {/* <View style={[styles.priorityDot, { backgroundColor: getPriorityColor(item.priority) }]} /> */}
        </View>
      </View>

      {item.description && (
        <AppText style={styles.taskDescription} numberOfLines={2}>
          {item.description}
        </AppText>
      )}

      <View style={styles.taskFooter}>
        <View style={styles.typeTag}>
          <AppText style={styles.typeText}>{item.type}</AppText>
        </View>
        
        {item.status === "completed" && item.completion?.completedAt && (
          <View style={{flexDirection: 'row', alignItems: 'center', gap: 6}}>
            <Feather name="check-circle" size={16} color={Colors.SUCCESS} />
            <AppText style={styles.completedText}>
              {new Date(item.completion.completedAt).toLocaleDateString()}
            </AppText>
          </View>
        )}
      </View>
    </Pressable>
  );

  const EmptyState = () => (
    <View style={styles.emptyState}>
      <Feather name="inbox" size={64} color={Colors.TEXT_SECONDARY} />
      <AppText style={styles.emptyText}>No tasks found</AppText>
    </View>
  );

  if (isLoading) {
    return (
      <CustomScreen>
        <ScreenHeader title="Tasks" />
        <Loading />
      </CustomScreen>
    );
  }

  return (
    <CustomScreen>
      <ScreenHeader title="Tasks" action={goBack}/>
      
      <View style={styles.container}>
        <HorizontalFilter
          filters={statusFilters}
          selectedValue={selectedStatus}
          onSelect={setSelectedStatus}
        />

        <FlatList
          data={tasks}
          renderItem={renderTask}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={EmptyState}
          refreshControl={
            <RefreshControl refreshing={isFetching} onRefresh={refetch} />
          }
          showsVerticalScrollIndicator={false}
        />
      </View>
    </CustomScreen>
  );
};

const styles = StyleSheet.create({
  container: {
    // flex: 1,
  },
  listContent: {
    paddingVertical: 20,
    flexGrow: 1,
  },
  taskCard: {
    backgroundColor: Colors.CARD,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.BORDER,
  },
  taskHeader: {
    marginBottom: 8,
  },
  taskTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.TEXT,
    flex: 1,
    marginRight: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 11,
    fontWeight: "600",
    textTransform: "uppercase",
  },
  taskMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  metaText: {
    fontSize: 13,
    color: Colors.TEXT_SECONDARY,
  },
  priorityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginLeft: "auto",
  },
  taskDescription: {
    fontSize: 14,
    color: Colors.TEXT_SECONDARY,
    marginBottom: 8,
    lineHeight: 20,
  },
  taskFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  typeTag: {
    backgroundColor: Colors.PRIMARY + "15",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  typeText: {
    fontSize: 12,
    color: Colors.PRIMARY,
    fontWeight: "600",
  },
  completedText: {
    fontSize: 12,
    color: Colors.SUCCESS,
  },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: Colors.TEXT_SECONDARY,
    marginTop: 16,
  },
});

export default TrainerTasksScreen;
