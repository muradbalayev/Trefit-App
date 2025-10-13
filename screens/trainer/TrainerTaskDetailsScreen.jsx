import React from "react";
import { View, StyleSheet, ScrollView, Image, Pressable } from "react-native";
import { useNavigate } from "@/hooks/useNavigation";
import Colors from "@/constants/Colors";
import Feather from "@expo/vector-icons/Feather";
import { CustomScreen, Loading } from "@/components/common";
import ScreenHeader from "@/components/common/ScreenHeader";
import Section from "@/components/common/Section";
import AppText from "@/components/ui/Text";
import { useGetTaskDetailsQuery } from "@/store/redux/trainer/services/trainerTaskApi";

const TrainerTaskDetailsScreen = ({ route }) => {
  const { goBack } = useNavigate();
  const { taskId } = route?.params || {};
  
  const { data: task, isLoading } = useGetTaskDetailsQuery(taskId, {
    skip: !taskId
  });

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

  const getTimeRemaining = (deadlineDate) => {
    const now = new Date();
    const deadline = new Date(deadlineDate);
    const diff = deadline - now;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (diff < 0) return { text: "Overdue", color: Colors.DANGER };
    if (days > 0) return { text: `${days} day${days > 1 ? 's' : ''}`, color: Colors.TEXT_SECONDARY };
    if (hours > 0) return { text: `${hours} hour${hours > 1 ? 's' : ''}`, color: Colors.WARNING };
    return { text: "Today", color: Colors.WARNING };
  };

  if (isLoading) {
    return (
      <CustomScreen>
        <ScreenHeader title="Task Details" action={goBack} />
        <Loading />
      </CustomScreen>
    );
  }

  if (!task) {
    return (
      <CustomScreen>
        <ScreenHeader title="Task Details" action={goBack} />
        <View style={styles.errorContainer}>
          <Feather name="alert-circle" size={48} color={Colors.DANGER} />
          <AppText style={styles.errorText}>Task not found</AppText>
        </View>
      </CustomScreen>
    );
  }

  const timeInfo = getTimeRemaining(task.deadlineDate);
  const isCompleted = task.status === "completed";

  return (
    <CustomScreen>
      <ScreenHeader title="Task Details" action={goBack} />
      
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <Feather 
              name={task.type === 'photo' ? 'camera' : task.type === 'checklist' ? 'check-square' : 'file-text'} 
              size={32} 
              color={Colors.PRIMARY} 
            />
          </View>
          
          <AppText style={styles.title}>{task.title}</AppText>
          
          <View style={styles.badges}>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(task.status) + "20" }]}>
              <AppText style={[styles.statusText, { color: getStatusColor(task.status) }]}>
                {task.status}
              </AppText>
            </View>
            
            <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(task.priority) + "20" }]}>
              <AppText style={[styles.priorityText, { color: getPriorityColor(task.priority) }]}>
                {task.priority}
              </AppText>
            </View>
          </View>
        </View>

        {/* Client Info */}
        <Section title="Assigned To">
          <View style={styles.clientBox}>
            <Feather name="user" size={20} color={Colors.PRIMARY} />
            <AppText style={styles.clientName}>{task.assignedTo?.name}</AppText>
            <AppText style={styles.clientUsername}>@{task.assignedTo?.username}</AppText>
          </View>
        </Section>

        {/* Task Info */}
        <Section title="Task Information">
          <View style={styles.infoRow}>
            <Feather name="calendar" size={16} color={Colors.TEXT_SECONDARY} />
            <AppText style={styles.infoLabel}>Created:</AppText>
            <AppText style={styles.infoValue}>
              {new Date(task.createdAt).toLocaleDateString('en-US', { 
                month: 'short', 
                day: 'numeric', 
                year: 'numeric' 
              })}
            </AppText>
          </View>

          <View style={styles.infoRow}>
            <Feather name="clock" size={16} color={timeInfo.color} />
            <AppText style={styles.infoLabel}>Deadline:</AppText>
            <AppText style={[styles.infoValue, { color: timeInfo.color }]}>
              {new Date(task.deadlineDate).toLocaleDateString('en-US', { 
                month: 'short', 
                day: 'numeric', 
                hour: '2-digit',
                minute: '2-digit'
              })} ({timeInfo.text})
            </AppText>
          </View>

          <View style={styles.infoRow}>
            <Feather name="tag" size={16} color={Colors.TEXT_SECONDARY} />
            <AppText style={styles.infoLabel}>Type:</AppText>
            <AppText style={styles.infoValue}>{task.type}</AppText>
          </View>
        </Section>

        {/* Description */}
        {task.description && (
          <Section title="Description">
            <AppText style={styles.description}>{task.description}</AppText>
          </Section>
        )}

        {/* Reference Images */}
        {task.referenceMedia && task.referenceMedia.length > 0 && (
          <Section title="Reference Images">
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.referenceScroll}>
              {task.referenceMedia.map((media, index) => (
                <Pressable key={index} onPress={() => {}}>
                  <Image source={{ uri: media.url }} style={styles.referenceImage} />
                </Pressable>
              ))}
            </ScrollView>
          </Section>
        )}

        {/* Completion Info */}
        {isCompleted && task.completion && (
          <Section title="Completion Details">
            <View style={styles.completionBox}>
              <View style={styles.completionHeader}>
                <Feather name="check-circle" size={24} color={Colors.SUCCESS} />
                <AppText style={styles.completionTitle}>Task Completed!</AppText>
              </View>

              <View style={styles.completionInfo}>
                <View style={styles.infoRow}>
                  <Feather name="calendar" size={16} color={Colors.SUCCESS} />
                  <AppText style={styles.infoLabel}>Completed At:</AppText>
                  <AppText style={styles.completedTime}>
                    {new Date(task.completion.completedAt).toLocaleDateString('en-US', { 
                      month: 'short', 
                      day: 'numeric', 
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </AppText>
                </View>

                {task.completion.notes && (
                  <View style={styles.notesBox}>
                    <AppText style={styles.notesLabel}>Notes:</AppText>
                    <AppText style={styles.notesText}>{task.completion.notes}</AppText>
                  </View>
                )}

                {task.completion.submittedMedia && task.completion.submittedMedia.length > 0 && (
                  <View style={styles.submittedSection}>
                    <AppText style={styles.submittedLabel}>Submitted Photos ({task.completion.submittedMedia.length}):</AppText>
                    <View style={styles.imagesGrid}>
                      {task.completion.submittedMedia.map((media, index) => (
                        <Pressable key={index} onPress={() => {}}>
                          <Image source={{ uri: media.url }} style={styles.submittedImage} />
                        </Pressable>
                      ))}
                    </View>
                  </View>
                )}
              </View>
            </View>
          </Section>
        )}

        {/* Pending Status */}
        {!isCompleted && (
          <View style={styles.pendingBox}>
            <Feather name="clock" size={20} color={Colors.WARNING} />
            <AppText style={styles.pendingText}>
              Waiting for client to complete this task
            </AppText>
          </View>
        )}
      </ScrollView>
    </CustomScreen>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingVertical: 20,
  },
  header: {
    alignItems: "center",
    marginBottom: 24,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.PRIMARY + "20",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: Colors.TEXT,
    textAlign: "center",
    marginBottom: 12,
  },
  badges: {
    flexDirection: "row",
    gap: 8,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
    textTransform: "uppercase",
  },
  priorityBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  priorityText: {
    fontSize: 12,
    fontWeight: "600",
    textTransform: "capitalize",
  },
  clientBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 12,
    backgroundColor: Colors.CARD,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.BORDER,
  },
  clientName: {
    fontSize: 15,
    fontWeight: "600",
    color: Colors.TEXT,
  },
  clientUsername: {
    fontSize: 13,
    color: Colors.TEXT_SECONDARY,
    marginLeft: "auto",
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  infoLabel: {
    fontSize: 14,
    color: Colors.TEXT_SECONDARY,
    minWidth: 80,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: "500",
    color: Colors.TEXT,
    flex: 1,
  },
  description: {
    fontSize: 15,
    color: Colors.TEXT_SECONDARY,
    lineHeight: 22,
  },
  referenceScroll: {
    flexDirection: "row",
  },
  referenceImage: {
    width: 150,
    height: 150,
    borderRadius: 12,
    marginRight: 12,
  },
  completionBox: {
    backgroundColor: Colors.SUCCESS + "10",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.SUCCESS + "30",
  },
  completionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 16,
  },
  completionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.SUCCESS,
  },
  completionInfo: {
    gap: 12,
  },
  completedTime: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.SUCCESS,
    flex: 1,
  },
  notesBox: {
    backgroundColor: Colors.CARD,
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  notesLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: Colors.TEXT,
    marginBottom: 6,
  },
  notesText: {
    fontSize: 14,
    color: Colors.TEXT_SECONDARY,
    lineHeight: 20,
  },
  submittedSection: {
    marginTop: 12,
  },
  submittedLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.TEXT,
    marginBottom: 12,
  },
  imagesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  submittedImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
  },
  pendingBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 16,
    backgroundColor: Colors.WARNING + "10",
    borderRadius: 12,
    marginTop: 16,
  },
  pendingText: {
    flex: 1,
    fontSize: 14,
    color: Colors.TEXT_SECONDARY,
    lineHeight: 20,
  },
  errorContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
  },
  errorText: {
    fontSize: 16,
    color: Colors.TEXT_SECONDARY,
  },
});

export default TrainerTaskDetailsScreen;
