import React, { useState } from "react";
import { View, StyleSheet, FlatList, Pressable, RefreshControl } from "react-native";
import { useNavigate } from "@/hooks/useNavigation";
import Colors from "@/constants/Colors";
import Feather from "@expo/vector-icons/Feather";
import { CustomScreen, Loading } from "@/components/common";
import ScreenHeader from "@/components/common/ScreenHeader";
import AppText from "@/components/ui/Text";
import { useGetMyTasksQuery } from "@/store/redux/user/services/userTaskApi";
import HorizontalFilter from "@/components/common/HorizontalFilter";

const ClientTasksScreen = () => {
  const { navigate, goBack } = useNavigate();
  const [selectedStatus, setSelectedStatus] = useState("all");
  
  const { data, isLoading, refetch, isFetching } = useGetMyTasksQuery({
    status: selectedStatus,
    page: 1,
    limit: 50,
  });

  const tasks = data?.tasks || [];
  console.log('Tasks:', tasks);

  // Filter by selected status
  const filteredTasks = selectedStatus === 'all' 
    ? tasks 
    : tasks.filter(t => t.status === selectedStatus);

  // Group tasks by urgency
  const urgentTasks = filteredTasks.filter(t => {
    const hoursRemaining = (new Date(t.deadlineDate) - new Date()) / (1000 * 60 * 60);
    return t.status !== 'completed' && hoursRemaining < 24 && hoursRemaining > 0;
  });

  const overdueTasks = filteredTasks.filter(t => t.status === 'overdue');
  const todayTasks = filteredTasks.filter(t => {
    const isToday = new Date(t.deadlineDate).toDateString() === new Date().toDateString();
    return t.status !== 'completed' && isToday;
  });
  const completedTasks = filteredTasks.filter(t => t.status === 'completed');
  
  // All other tasks
  const otherTasks = filteredTasks.filter(t => 
    !urgentTasks.includes(t) && 
    !overdueTasks.includes(t) && 
    !todayTasks.includes(t) && 
    !completedTasks.includes(t)
  );

  const statusFilters = [
    { value: "all", label: "All" },
    { value: "pending", label: "Pending" },
    { value: "in_progress", label: "In Progress" },
    { value: "completed", label: "Completed" },
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

  const getPriorityIcon = (priority) => {
    const icons = {
      low: "arrow-down",
      medium: "minus",
      high: "arrow-up",
    };
    return icons[priority] || "minus";
  };

  const getTimeRemaining = (deadlineDate, status) => {
    // If completed, don't show overdue
    if (status === "completed") return { text: "Completed", color: Colors.SUCCESS };
    
    const now = new Date();
    const deadline = new Date(deadlineDate);
    const diff = deadline - now;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (diff < 0) return { text: "Overdue", color: Colors.DANGER };
    if (hours < 2) return { text: `${hours} hour${hours > 1 ? 's' : ''} left`, color: Colors.DANGER };
    if (hours < 24) return { text: `${hours} hour${hours > 1 ? 's' : ''} left`, color: Colors.WARNING };
    if (days === 0) return { text: "Today", color: Colors.WARNING };
    return { text: `${days} day${days > 1 ? 's' : ''} left`, color: Colors.TEXT_SECONDARY };
  };

  const renderTask = ({ item }) => {
    const timeRemaining = getTimeRemaining(item.deadlineDate, item.status);
    
    return (
      <Pressable
        style={styles.taskCard}
        onPress={() => navigate("TaskDetail", { taskId: item.id })}
      >
        <View style={styles.taskHeader}>
          <View style={styles.iconContainer}>
            <Feather 
              name={item.type === 'photo' ? 'camera' : item.type === 'checklist' ? 'check-square' : 'file-text'} 
              size={24} 
              color={getStatusColor(item.status)} 
            />
          </View>
          
          <View style={styles.taskContent}>
            <View style={styles.taskTitleRow}>
              <AppText style={styles.taskTitle} numberOfLines={2}>
                {item.title}
              </AppText>
              {item.priority === 'high' && (
                <Feather name="alert-circle" size={18} color={Colors.PRIMARY} />
              )}
            </View>

            <View style={styles.taskMeta}>
              <Feather name="user" size={12} color={Colors.TEXT_SECONDARY} />
              <AppText style={styles.trainerName}>{item.trainer?.name}</AppText>
            </View>

{item.status !== 'completed' && (
              <View style={styles.deadlineRow}>
              <Feather name="clock" size={14} color={timeRemaining.color} />
              <AppText style={[styles.deadlineText, { color: timeRemaining.color }]}>
                {timeRemaining.text}
              </AppText>
            </View>
)}
            {item.status === 'completed' && (
              <View style={styles.completedBadge}>
                <Feather name="check-circle" size={14} color={Colors.SUCCESS} />
                <AppText style={styles.completedText}>Completed</AppText>
              </View>
            )}
          </View>

          <Feather name="chevron-right" size={20} color={Colors.TEXT_SECONDARY} />
        </View>
      </Pressable>
    );
  };

  const renderSection = (title, items, icon, color) => {
    if (items.length === 0) return null;
    
    return (
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Feather name={icon} size={20} color={color} />
          <AppText style={styles.sectionTitle}>{title}</AppText>
          <View style={[styles.badge, { backgroundColor: color + "20" }]}>
            <AppText style={[styles.badgeText, { color }]}>{items.length}</AppText>
          </View>
        </View>
        <FlatList
          data={items}
          renderItem={renderTask}
          keyExtractor={(item) => item.id}
          scrollEnabled={false}
        />
      </View>
    );
  };

  if (isLoading) {
    return (
      <CustomScreen>
        <ScreenHeader title="Tasks" action={goBack}/>
        <Loading />
      </CustomScreen>
    );
  }

  return (
    <CustomScreen>
      <ScreenHeader title="Tasks" action={goBack} />
      
      <HorizontalFilter
        filters={statusFilters}
        selectedValue={selectedStatus}
        onSelect={setSelectedStatus}
      />

      <FlatList
        data={[1]}
        renderItem={() => (
          <View>
            {renderSection("URGENT", urgentTasks, "alert-triangle", Colors.DANGER)}
            {renderSection("OVERDUE", overdueTasks, "alert-circle", Colors.DANGER)}
            {renderSection("TODAY", todayTasks, "calendar", Colors.WARNING)}
            {renderSection("TASKS", otherTasks, "menu", Colors.PRIMARY)}
            {renderSection("COMPLETED", completedTasks, "check-circle", Colors.SUCCESS)}
            
            {tasks.length === 0 && (
              <View style={styles.emptyState}>
                <Feather name="inbox" size={64} color={Colors.TEXT_SECONDARY} />
                <AppText style={styles.emptyText}>No tasks found</AppText>
              </View>
            )}
          </View>
        )}
        keyExtractor={() => "sections"}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={isFetching} onRefresh={refetch} />
        }
        showsVerticalScrollIndicator={false}
      />
    </CustomScreen>
  );
};

const styles = StyleSheet.create({
  listContent: {
    paddingVertical: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.TEXT,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    marginLeft: "auto",
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "600",
  },
  taskCard: {
    backgroundColor: Colors.CARD,
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: Colors.BORDER,
  },
  taskHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.PRIMARY + "15",
    alignItems: "center",
    justifyContent: "center",
  },
  taskContent: {
    flex: 1,
  },
  taskTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 4,
  },
  taskTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: Colors.TEXT,
    flex: 1,
  },
  taskMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 6,
  },
  trainerName: {
    fontSize: 12,
    color: Colors.TEXT_SECONDARY,
  },
  deadlineRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  deadlineText: {
    fontSize: 13,
    fontWeight: "500",
  },
  completedBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 6,
  },
  completedText: {
    fontSize: 12,
    color: Colors.SUCCESS,
    fontWeight: "500",
  },
  emptyState: {
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

export default ClientTasksScreen;
