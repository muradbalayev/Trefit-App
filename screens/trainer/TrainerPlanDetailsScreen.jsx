import React from "react";
import { View, StyleSheet, ScrollView, Pressable, Alert } from "react-native";
import { useNavigate } from "@/hooks/useNavigation";
import Colors from "@/constants/Colors";
import Feather from "@expo/vector-icons/Feather";
import { CustomScreen, Loading } from "@/components/common";
import ScreenHeader from "@/components/common/ScreenHeader";
import Section from "@/components/common/Section";
import AppText from "@/components/ui/Text";
import { 
  useGetPlanDetailsQuery, 
  useTogglePlanStatusMutation, 
  useDeletePlanMutation 
} from "@/store/redux/trainer/services/trainerPlanApi";

const TrainerPlanDetailsScreen = ({ route }) => {
  const { navigate, goBack } = useNavigate();
  const { planId } = route?.params || {};
  
  // Real API hooks
  const { data: plan, isLoading, error, refetch } = useGetPlanDetailsQuery(planId, {
    skip: !planId
  });
  const [toggleStatus, { isLoading: isToggling }] = useTogglePlanStatusMutation();
  const [deletePlan, { isLoading: isDeleting }] = useDeletePlanMutation();

  // Handle status toggle
  const handleToggleStatus = async () => {
    if (!planId) return;
    
    try {
      const result = await toggleStatus(planId).unwrap();
      Alert.alert('Success', result.message || 'Plan status updated successfully');
    } catch (error) {
      console.error('Toggle status error:', error);
      Alert.alert('Error', error?.data?.message || 'Failed to update plan status');
    }
  };

  // Handle plan deletion  
  const handleDeletePlan = async () => {
    if (!planId) return;
    
    Alert.alert(
      "Delete Plan",
      "Are you sure you want to delete this plan? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deletePlan(planId).unwrap();
              Alert.alert('Success', 'Plan deleted successfully', [
                { text: 'OK', onPress: () => navigate('Plans') }
              ]);
            } catch (error) {
              console.error('Delete plan error:', error);
              Alert.alert('Error', error?.data?.message || 'Failed to delete plan');
            }
          }
        }
      ]
    );
  };

  const getGoalTypeColor = (goalType) => {
    const colors = {
      muscle_gain: Colors.SUCCESS,
      weight_loss: Colors.WARNING,
      strength: Colors.BRAND,
      general_fitness: Colors.PRIMARY + "20",
    };
    return colors[goalType] || Colors.BRAND;
  };

  const getGoalTypeLabel = (goalType) => {
    const labels = {
      muscle_gain: "Muscle Gain",
      weight_loss: "Weight Loss",
      strength: "Strength",
      general_fitness: "General Fitness",
    };
    return labels[goalType] || goalType;
  };

  const getDifficultyColor = (difficulty) => {
    const colors = {
      beginner: "#10B981",
      intermediate: "#F59E0B",
      advanced: "#EF4444",
    };
    return colors[difficulty] || "#6B7280";
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Loading state
  if (isLoading) return <Loading />;

  // Error state  
  if (error) {
    return (
      <CustomScreen>
        <ScreenHeader action={() => goBack()} title="Plan Details" />
        <View style={styles.errorContainer}>
          <Feather name="alert-circle" size={48} color={Colors.ERROR} />
          <AppText style={styles.errorText}>
            {error?.data?.message || 'Failed to load plan details'}
          </AppText>
          <Pressable style={styles.retryBtn} onPress={refetch}>
            <AppText style={styles.retryText}>Retry</AppText>
          </Pressable>
        </View>
      </CustomScreen>
    );
  }

  // No plan data
  if (!plan) {
    return (
      <CustomScreen>
        <ScreenHeader action={() => goBack()} title="Plan Details" />
        <View style={styles.errorContainer}>
          <Feather name="search" size={48} color={Colors.TEXT_SECONDARY} />
          <AppText style={styles.errorText}>Plan not found</AppText>
        </View>
      </CustomScreen>
    );
  }

  return (
    <CustomScreen>
      {/* Header */}
      <ScreenHeader 
        action={() => goBack()} 
        title="Plan Details" 
        actionButton={
          <Pressable style={styles.editButton} onPress={() => navigate("EditPlan", { planId })}>
            <Feather name="edit" color={Colors.WARNING} size={20}/>
          </Pressable>
        }
      />
      
      <Section>
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Plan Info Card */}
          <View style={styles.planCard}>
            <View style={styles.planHeader}>
              <View style={[styles.goalTypeTag, { backgroundColor: getGoalTypeColor(plan.goalType) }]}>
                <AppText style={styles.goalTypeText}>{getGoalTypeLabel(plan.goalType)}</AppText>
              </View>
              <View style={[styles.statusBadge, { backgroundColor: plan.isActive ? Colors.SUCCESS : Colors.TEXT_SECONDARY }]}>
                <AppText style={styles.statusText}>{plan.isActive ? "Active" : "Inactive"}</AppText>
              </View>
            </View>

            <AppText style={styles.planTitle}>{plan.title}</AppText>
            <AppText style={styles.planDescription}>{plan.description}</AppText>

            <View style={styles.planMeta}>
              <View style={styles.metaItem}>
                <Feather name="clock" size={16} color={Colors.TEXT_SECONDARY} />
                <AppText style={styles.metaText}>{plan.durationWeeks} weeks</AppText>
              </View>
              <View style={styles.metaItem}>
                <Feather name="dollar-sign" size={16} color={Colors.TEXT_SECONDARY} />
                <AppText style={styles.metaText}>${plan.price}</AppText>
              </View>
              <View style={styles.metaItem}>
                <Feather name="target" size={16} color={Colors.TEXT_SECONDARY} />
                <AppText style={[styles.metaText, { color: getDifficultyColor(plan.difficulty) }]}>
                  {plan.difficulty?.charAt(0).toUpperCase() + plan.difficulty?.slice(1)}
                </AppText>
              </View>
              <View style={styles.metaItem}>
                <Feather name="calendar" size={16} color={Colors.TEXT_SECONDARY} />
                <AppText style={styles.metaText}>Created {formatDate(plan.createdAt)}</AppText>
              </View>
            </View>

            {plan.tags && (
              <View style={styles.tags}>
                {plan.tags.map((tag, index) => (
                  <View key={index} style={styles.tag}>
                    <AppText style={styles.tagText}>#{tag}</AppText>
                  </View>
                ))}
              </View>
            )}
          </View>

          {/* Quick Actions */}
          <View style={styles.quickActionsSection}>
            <AppText style={styles.sectionTitle}>Quick Actions</AppText>
            <View style={styles.quickActionsRow}>
              <Pressable 
                style={styles.quickActionCard}
                onPress={() => navigate('UploadWorkoutProgram', { planId })}
              >
                <View style={[styles.quickActionIcon, { backgroundColor: Colors.PRIMARY + "20" }]}>
                  <Feather name="upload" size={24} color={Colors.PRIMARY} />
                </View>
                <AppText style={styles.quickActionText}>Upload PDF</AppText>
                <AppText style={styles.quickActionHint}>Workout proqramı</AppText>
              </Pressable>

              <Pressable 
                style={styles.quickActionCard}
                onPress={() => navigate('TrainerTasks')}
              >
                <View style={[styles.quickActionIcon, { backgroundColor: Colors.SUCCESS + "20" }]}>
                  <Feather name="check-square" size={24} color={Colors.SUCCESS} />
                </View>
                <AppText style={styles.quickActionText}>View Tasks</AppText>
                <AppText style={styles.quickActionHint}>Client tapşırıqlar</AppText>
              </Pressable>
            </View>
          </View>

          {/* Stats Cards */}
          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <Feather name="users" size={24} color={Colors.BRAND} />
              <AppText style={styles.statNumber}>{plan.clientsEnrolled?.length || 0}</AppText>
              <AppText style={styles.statLabel}>Enrolled</AppText>
            </View>
            <View style={styles.statCard}>
              <Feather name="star" size={24} color={Colors.WARNING} />
              <AppText style={styles.statNumber}>{plan.rating || 0}</AppText>
              <AppText style={styles.statLabel}>Rating</AppText>
            </View>
            <View style={styles.statCard}>
              <Feather name="dollar-sign" size={24} color={Colors.SUCCESS} />
              <AppText style={styles.statNumber}>${(plan.price * (plan.clientsEnrolled?.length || 0)).toFixed(0)}</AppText>
              <AppText style={styles.statLabel}>Revenue</AppText>
            </View>
          </View>

          {/* Enrolled Clients */}
          {plan.clientsEnrolled && plan.clientsEnrolled.length > 0 && (
            <View style={styles.clientsSection}>
              <AppText style={styles.sectionTitle}>Enrolled Clients ({plan.clientsEnrolled.length})</AppText>
              <View style={styles.clientsList}>
                {plan.clientsEnrolled.slice(0, 5).map((client, index) => (
                  <Pressable 
                    key={client._id || index} 
                    style={styles.clientItem}
                    onPress={() => navigate("ClientDetails", { clientId: client._id })}
                  >
                    <View style={styles.clientAvatar}>
                      <AppText style={styles.clientAvatarText}>
                        {client.name ? client.name.split(' ').map(n => n[0]).join('') : 'C'}
                      </AppText>
                    </View>
                    <View style={styles.clientInfo}>
                      <AppText style={styles.clientName}>{client.name || 'Client'}</AppText>
                      <AppText style={styles.clientEmail}>{client.email || ''}</AppText>
                    </View>
                    <Feather name="chevron-right" size={20} color={Colors.TEXT_SECONDARY} />
                  </Pressable>
                ))}
              </View>
            </View>
          )}

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <Pressable
              style={[
                styles.actionButton, 
                styles.toggleButton,
                (isToggling || isDeleting) && styles.actionButtonDisabled
              ]}
              onPress={handleToggleStatus}
              disabled={isToggling || isDeleting}
            >
              <Feather 
                name={plan.isActive ? "pause" : "play"} 
                size={20} 
                color={plan.isActive ? Colors.WARNING : Colors.SUCCESS} 
              />
              <AppText style={[styles.actionButtonText, { color: plan.isActive ? Colors.WARNING : Colors.SUCCESS }]}>
                {isToggling ? 'Updating...' : (plan.isActive ? "Deactivate" : "Activate")}
              </AppText>
            </Pressable>

            <Pressable
              style={[
                styles.actionButton, 
                styles.deleteButton,
                (isToggling || isDeleting) && styles.actionButtonDisabled
              ]}
              onPress={handleDeletePlan}
              disabled={isToggling || isDeleting}
            >
              <Feather name="trash-2" size={20} color="#EF4444" />
              <AppText style={[styles.actionButtonText, { color: "#EF4444" }]}>
                {isDeleting ? 'Deleting...' : 'Delete Plan'}
              </AppText>
            </Pressable>
          </View>
        </ScrollView>
      </Section>
    </CustomScreen>
  );
};

const styles = StyleSheet.create({
  content: {
    flex: 1,
  },
  editButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: Colors.CARD,
    alignItems: "center",
    justifyContent: "center",
  },
  planCard: {
    backgroundColor: Colors.CARD,
    borderColor: Colors.BORDER,
    borderWidth: 1,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  planHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  goalTypeTag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  goalTypeText: {
    fontSize: 12,
    color: Colors.PRIMARY,
    fontWeight: "600",
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    color: "white",
    fontWeight: "600",
  },
  planTitle: {
    fontSize: 24,
    color: Colors.TEXT,
    fontWeight: "bold",
    marginBottom: 8,
  },
  planDescription: {
    fontSize: 16,
    color: Colors.TEXT_SECONDARY,
    lineHeight: 24,
    marginBottom: 16,
  },
  planMeta: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
    marginBottom: 16,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  metaText: {
    fontSize: 14,
    color: Colors.TEXT,
    fontWeight: "500",
  },
  tags: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  tag: {
    backgroundColor: Colors.BACKGROUND,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  tagText: {
    fontSize: 12,
    color: Colors.TEXT_SECONDARY,
    fontWeight: "500",
  },
  quickActionsSection: {
    marginBottom: 20,
  },
  quickActionsRow: {
    flexDirection: "row",
    gap: 12,
  },
  quickActionCard: {
    flex: 1,
    backgroundColor: Colors.CARD,
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.BORDER,
  },
  quickActionIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  quickActionText: {
    fontSize: 15,
    fontWeight: "600",
    color: Colors.TEXT,
    marginBottom: 4,
  },
  quickActionHint: {
    fontSize: 12,
    color: Colors.TEXT_SECONDARY,
    textAlign: "center",
  },
  statsContainer: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.CARD,
    borderColor: Colors.BORDER,
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    gap: 8,
  },
  statNumber: {
    fontSize: 20,
    color: Colors.TEXT,
    fontWeight: "bold",
  },
  statLabel: {
    fontSize: 12,
    color: Colors.TEXT_SECONDARY,
  },
  clientsSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    color: Colors.TEXT,
    fontWeight: "600",
    marginBottom: 12,
  },
  clientsList: {
    gap: 8,
  },
  clientItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.CARD,
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  clientAvatar: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: Colors.BRAND,
    alignItems: "center",
    justifyContent: "center",
  },
  clientAvatarText: {
    fontSize: 14,
    color: "black",
    fontWeight: "600",
  },
  clientInfo: {
    flex: 1,
  },
  clientName: {
    fontSize: 16,
    color: Colors.TEXT,
    fontWeight: "500",
    marginBottom: 2,
  },
  clientEmail: {
    fontSize: 14,
    color: Colors.TEXT_SECONDARY,
  },
  actionButtons: {
    gap: 12,
    marginBottom: 120,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.CARD,
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  actionButtonDisabled: {
    opacity: 0.6,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  errorText: {
    fontSize: 16,
    color: Colors.ERROR,
    textAlign: 'center',
  },
  retryBtn: {
    backgroundColor: Colors.BRAND,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryText: {
    color: 'black',
    fontWeight: '600',
  },
});

export default TrainerPlanDetailsScreen;
