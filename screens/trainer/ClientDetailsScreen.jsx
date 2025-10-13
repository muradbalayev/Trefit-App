import React from "react";
import { View, StyleSheet, ScrollView, Pressable, Alert, Linking } from "react-native";
import { useNavigate } from "@/hooks/useNavigation";
import Colors from "@/constants/Colors";
import Feather from "@expo/vector-icons/Feather";
import { CustomScreen, Loading } from "@/components/common";
import ScreenHeader from "@/components/common/ScreenHeader";
import Section from "@/components/common/Section";
import AppText from "@/components/ui/Text";
import { useGetClientDetailsQuery } from "@/store/redux/trainer/services/trainerClientApi";
import { useGetChatWithUserQuery } from "@/store/redux/chat/services/chatApi";

const ClientDetailsScreen = ({ route }) => {
  const { navigate, goBack } = useNavigate();
  const { clientId } = route?.params || {};

  // Real API hook
  const { data: client, isLoading, error, refetch } = useGetClientDetailsQuery(clientId, {
    skip: !clientId
  });

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getGoalTypeColor = (goalType) => {
    const colors = {
      muscle_gain: Colors.SUCCESS,
      weight_loss: Colors.WARNING,
      strength: Colors.BRAND,
      general_fitness: Colors.PRIMARY + "30",
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

  // Handle contact client
  const handleContactClient = (type) => {
    if (type === "email" && client?.email) {
      Linking.openURL(`mailto:${client.email}`);
    }
  };

  // Handle start chat
  const handleStartChat = () => {
    if (!client?._id) return;
    
    // Navigate to ChatMessages with client info
    navigate("ChatMessages", { 
      recipientId: client._id,
      recipientName: client.name,
      recipientType: "client"
    });
  };

  // Loading state
  if (isLoading) return <Loading />;

  // Error state
  if (error) {
    return (
      <CustomScreen>
        <ScreenHeader action={() => goBack()} title="Client Details" />
        <View style={styles.errorContainer}>
          <Feather name="alert-circle" size={48} color={Colors.ERROR} />
          <AppText style={styles.errorText}>
            {error?.data?.message || 'Failed to load client details'}
          </AppText>
          <Pressable style={styles.retryBtn} onPress={refetch}>
            <AppText style={styles.retryText}>Retry</AppText>
          </Pressable>
        </View>
      </CustomScreen>
    );
  }

  // No client data
  if (!client) {
    return (
      <CustomScreen>
        <ScreenHeader action={() => goBack()} title="Client Details" />
        <View style={styles.errorContainer}>
          <Feather name="search" size={48} color={Colors.TEXT_SECONDARY} />
          <AppText style={styles.errorText}>Client not found</AppText>
        </View>
      </CustomScreen>
    );
  }

  return (
    <CustomScreen>
      <ScreenHeader action={() => goBack()} title="Client Details" />
      
      <Section>
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Client Info Card */}
          <View style={styles.clientCard}>
            <View style={styles.clientHeader}>
              <View style={styles.avatarContainer}>
                <AppText style={styles.avatarText}>
                  {client.name ? client.name.split(' ').map(n => n[0]).join('') : 'C'}
                </AppText>
              </View>
              <View style={styles.clientInfo}>
                <AppText style={styles.clientName}>{client.name || 'Unknown Client'}</AppText>
                <AppText style={styles.clientEmail}>{client.email || ''}</AppText>
                <AppText style={styles.joinedDate}>
                  Joined {formatDate(client.joinedAt)}
                </AppText>
              </View>
            </View>
          </View>

          {/* Quick Actions */}
          <View style={styles.quickActionsSection}>
            <AppText style={styles.sectionTitle}>Quick Actions</AppText>
            <View style={styles.quickActionsGrid}>
              <Pressable 
                style={styles.quickActionButton}
                onPress={handleStartChat}
              >
                <View style={[styles.actionIcon, { backgroundColor: Colors.PRIMARY + "20" }]}>
                  <Feather name="message-circle" size={24} color={Colors.PRIMARY} />
                </View>
                <AppText style={styles.actionLabel}>Chat</AppText>
              </Pressable>

              <Pressable 
                style={styles.quickActionButton}
                onPress={() => navigate('CreateTask', {
                  clientId: client._id,
                  clientName: client.name,
                  enrollmentId: client.enrollmentId
                })}
              >
                <View style={[styles.actionIcon, { backgroundColor: Colors.SUCCESS + "20" }]}>
                  <Feather name="plus-circle" size={24} color={Colors.SUCCESS} />
                </View>
                <AppText style={styles.actionLabel}>New Task</AppText>
              </Pressable>

              <Pressable 
                style={styles.quickActionButton}
                onPress={() => {
                  console.log('Client data:', client);
                  console.log('PlanId:', client.planId);
                  console.log('EnrollmentId:', client.enrollmentId);
                  
                  if (!client.planId || !client.enrollmentId) {
                    Alert.alert('Xəta', 'Plan məlumatı tapılmadı. Səhifəni yeniləyin.');
                    return;
                  }
                  
                  navigate('UploadWorkoutProgram', {
                    planId: client.planId,
                    enrollmentId: client.enrollmentId,
                    clientName: client.name
                  });
                }}
              >
                <View style={[styles.actionIcon, { backgroundColor: Colors.WARNING + "20" }]}>
                  <Feather name="file-text" size={24} color={Colors.WARNING} />
                </View>
                <AppText style={styles.actionLabel}>Fərdi PDF</AppText>
              </Pressable>

              <Pressable 
                style={styles.quickActionButton}
                onPress={() => handleContactClient("email")}
              >
                <View style={[styles.actionIcon, { backgroundColor: Colors.BRAND + "20" }]}>
                  <Feather name="mail" size={24} color={Colors.BRAND} />
                </View>
                <AppText style={styles.actionLabel}>Email</AppText>
              </Pressable>
            </View>
          </View>

          {/* Client Plans */}
          {client.plans && client.plans.length > 0 && (
            <View style={styles.plansSection}>
              <AppText style={styles.sectionTitle}>Enrolled Plans ({client.plans.length})</AppText>
              <View style={styles.plansList}>
                {client.plans.map((plan, index) => (
                  <Pressable 
                    key={plan._id || index} 
                    style={styles.planItem}
                    onPress={() => navigate("TrainerPlanDetails", { planId: plan._id })}
                  >
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
                        <Feather name="clock" size={14} color={Colors.TEXT_SECONDARY} />
                        <AppText style={styles.metaText}>{plan.durationWeeks} weeks</AppText>
                      </View>
                      <View style={styles.metaItem}>
                        <Feather name="dollar-sign" size={14} color={Colors.TEXT_SECONDARY} />
                        <AppText style={styles.metaText}>${plan.price}</AppText>
                      </View>
                      <View style={styles.metaItem}>
                        <Feather name="calendar" size={14} color={Colors.TEXT_SECONDARY} />
                        <AppText style={styles.metaText}>Created {formatDate(plan.createdAt)}</AppText>
                      </View>
                    </View>
                    
                  </Pressable>
                ))}
              </View>
            </View>
          )}

        </ScrollView>
      </Section>
    </CustomScreen>
  );
};

const styles = StyleSheet.create({
  content: {
    flex: 1,
  },
  clientCard: {
    backgroundColor: Colors.CARD,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  clientHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatarContainer: {
    width: 60,
    height: 60,
    borderRadius: 15,
    backgroundColor: Colors.BRAND,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  avatarText: {
    fontSize: 20,
    color: "black",
    fontWeight: "600",
  },
  clientInfo: {
    flex: 1,
  },
  clientName: {
    fontSize: 24,
    color: Colors.TEXT,
    fontWeight: "bold",
    marginBottom: 4,
  },
  clientEmail: {
    fontSize: 16,
    color: Colors.TEXT_SECONDARY,
    marginBottom: 4,
  },
  joinedDate: {
    fontSize: 14,
    color: Colors.TEXT_SECONDARY,
  },
  sectionTitle: {
    fontSize: 18,
    color: Colors.TEXT,
    fontWeight: "600",
    marginBottom: 12,
  },
  quickActionsSection: {
    marginBottom: 24,
  },
  quickActionsGrid: {
    flexDirection: "row",
    gap: 12,
  },
  quickActionButton: {
    flex: 1,
    alignItems: "center",
    gap: 8,
  },
  actionIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  actionLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: Colors.TEXT,
    textAlign: "center",
  },
  plansSection: {
    marginBottom: 24,
  },
  plansList: {
    gap: 12,
  },
  planItem: {
    backgroundColor: Colors.CARD,
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },
  planHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  goalTypeTag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  goalTypeText: {
    fontSize: 12,
    color: Colors.TEXT_BRAND,
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
    fontSize: 18,
    color: Colors.TEXT,
    fontWeight: "600",
  },
  planDescription: {
    fontSize: 14,
    color: Colors.TEXT_SECONDARY,
    lineHeight: 20,
  },
  planMeta: {
    flexDirection: "row",
    gap: 16,
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
  actionSection: {
    marginBottom: 100,
  },
  chatButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.BRAND,
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  chatButtonText: {
    fontSize: 16,
    color: "black",
    fontWeight: "600",
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

export default ClientDetailsScreen;
