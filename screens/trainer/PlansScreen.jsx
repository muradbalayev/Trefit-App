import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, Pressable, FlatList, RefreshControl, ActivityIndicator, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigate } from "@/hooks/useNavigation";
import { useSelector } from "react-redux";
import Colors from "@/constants/Colors";
import Feather from "@expo/vector-icons/Feather";
import AppText from "@/components/ui/Text";
import { CustomScreen, Loading, SuccessModal } from "@/components/common";
import { 
  useGetMyPlansQuery,
  useTogglePlanStatusMutation,
  useActivatePlanMutation,
  useDeactivatePlanMutation 
} from "@/store/redux/trainer/services/trainerPlanApi";
import { useGetAccountQuery } from "@/store/redux/user/services/userAccountApi";

const PlansScreen = () => {
  const { navigate } = useNavigate();
  const [activeTab, setActiveTab] = useState("all");
  const [page, setPage] = useState(1);
  const [showIncompleteModal, setShowIncompleteModal] = useState(false);
  
  const { isAuthenticated } = useSelector((state) => state.userAuth);
  const { data: user } = useGetAccountQuery(undefined, { skip: !isAuthenticated });

  // Real API data
  const { 
    data: plansResponse, 
    isLoading, 
    error, 
    refetch,
    isFetching 
  } = useGetMyPlansQuery({
    page,
    limit: 10,
    isActive: activeTab === "all" ? undefined : activeTab === "active"
  });

  // Mutations for plan status
  const [togglePlanStatus, { isLoading: isToggling }] = useTogglePlanStatusMutation();
  const [activatePlan, { isLoading: isActivating }] = useActivatePlanMutation();
  const [deactivatePlan, { isLoading: isDeactivating }] = useDeactivatePlanMutation();

  // Get plans from API response (transformation handled in API service)
  const plans = plansResponse?.data || [];
  const totalCount = plansResponse?.pagination?.total || 0;
  
  // Filter plans based on active tab
  const filteredPlans = plans.filter(plan => {
    if (activeTab === "all") return true;
    if (activeTab === "active") return plan.isActive;
    if (activeTab === "inactive") return !plan.isActive;
    return true;
  });

  // Handler functions for plan status
  const handleToggleStatus = async (planId, currentStatus) => {
    try {
      const result = await togglePlanStatus(planId).unwrap();
      Alert.alert(
        'Success', 
        result.message || `Plan ${!currentStatus ? 'activated' : 'deactivated'} successfully`
      );
    } catch (error) {
      console.error('Toggle status error:', error);
      Alert.alert('Error', error?.data?.message || 'Failed to update plan status');
    }
  };

  const handleActivatePlan = async (planId) => {
    try {
      const result = await activatePlan(planId).unwrap();
      Alert.alert('Success', result.message || 'Plan activated successfully');
    } catch (error) {
      console.error('Activate plan error:', error);
      Alert.alert('Error', error?.data?.message || 'Failed to activate plan');
    }
  };

  const handleDeactivatePlan = async (planId) => {
    try {
      const result = await deactivatePlan(planId).unwrap();
      Alert.alert('Success', result.message || 'Plan deactivated successfully');
    } catch (error) {
      console.error('Deactivate plan error:', error);
      Alert.alert('Error', error?.data?.message || 'Failed to deactivate plan');
    }
  };

  // Loading state
  if (isLoading && !isFetching) {
    return <Loading />
  }

  const getGoalTypeLabel = (goalType) => {
    const labels = {
      muscle_gain: "Muscle Gain",
      weight_loss: "Weight Loss",
      strength: "Strength",
      general_fitness: "General Fitness",
    };
    return labels[goalType] || goalType;
  };

  const getGoalTypeColor = (goalType) => {
    const colors = {
      muscle_gain: Colors.PRIMARY + "30",
      weight_loss: Colors.PRIMARY + "30",
      strength: Colors.PRIMARY + "30",
      general_fitness: Colors.PRIMARY + "30",
    };
    return colors[goalType] || Colors.BRAND;
  };

  const renderPlanCard = ({ item: plan }) => (
    <Pressable
      style={[styles.planCard, !plan.isActive && styles.inactivePlanCard]}
      onPress={() => navigate("TrainerPlanDetails", { planId: plan.id })}
    >
      <View style={styles.planHeader}>
        <View style={[styles.goalTypeTag, { backgroundColor: getGoalTypeColor(plan.goalType) }]}>
          <AppText style={styles.goalTypeText}>{getGoalTypeLabel(plan.goalType)}</AppText>
        </View>
        <View style={styles.planActions}>
          {/* Status Toggle Button */}
   
          
          <Pressable 
            style={styles.actionButton}
            onPress={() => navigate("EditPlan", { planId: plan.id })}
          >
            <Feather name="edit" size={16} color={Colors.TEXT_SECONDARY} />
          </Pressable>
        </View>
      </View>

      <AppText style={styles.planTitle}>{plan.title}</AppText>
      <AppText style={styles.planDescription}>{plan.description}</AppText>

      <View style={styles.planStats}>
        <View style={styles.statItem}>
          <Feather name="clock" size={14} color={Colors.TEXT_SECONDARY} />
          <AppText style={styles.statText}>{plan.durationWeeks} weeks</AppText>
        </View>
        <View style={styles.statItem}>
          <Feather name="users" size={14} color={Colors.TEXT_SECONDARY} />
          <AppText style={styles.statText}>{plan.clientsEnrolled} clients</AppText>
        </View>
        <View style={styles.statItem}>
          <Feather name="star" size={14} color={Colors.TEXT_SECONDARY} />
          <AppText style={styles.statText}>{plan.rating} ({plan.reviewCount})</AppText>
        </View>
      </View>

      <View style={styles.planFooter}>
        <AppText style={styles.planPrice}>${plan.price}</AppText>
        <View style={[styles.statusBadge, { backgroundColor: plan.isActive ? Colors.SUCCESS : Colors.WARNING }]}>
          <AppText style={styles.statusText}>{plan.isActive ? "Active" : "Inactive"}</AppText>
        </View>
      </View>
    </Pressable>
  );

  return (
<CustomScreen>

    {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <AppText style={styles.title}>My Plans</AppText>
          <View style={styles.planCount}>
            <AppText style={styles.planCountText}>
              {totalCount}
            </AppText>
          </View>
        </View>
        <Pressable
          style={styles.createButton}
          onPress={() => {
            // Check if profile is complete
            const hasAccess = user?.trainerProfile?.hasAccessToCreatePlan === true;
            
            if (!hasAccess) {
              setShowIncompleteModal(true);
            } else {
              navigate("CreatePlan");
            }
          }}
        >
          <Feather name="plus" size={20} color="black" />
        </Pressable>
      </View>
      

      {/* Filter Tabs */}
      <View style={styles.filterTabs}>
        {["all", "active", "inactive"].map((tab) => (
          <Pressable
            key={tab}
            style={[styles.filterTab, activeTab === tab && styles.activeFilterTab]}
            onPress={() => setActiveTab(tab)}
          >
            <AppText style={[styles.filterTabText, activeTab === tab && styles.activeFilterTabText]}>
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </AppText>
          </Pressable>
        ))}
      </View>

      {/* Plans List */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <AppText style={styles.loadingText}>Loading plans...</AppText>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Feather name="alert-circle" size={48} color={Colors.WARNING} />
          <AppText style={styles.errorText}>Failed to load plans</AppText>
          <Pressable style={styles.retryButton} onPress={() => refetch()}>
            <AppText style={styles.retryButtonText}>Retry</AppText>
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={filteredPlans}
          renderItem={renderPlanCard}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.plansList}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isFetching}
              onRefresh={refetch}
              tintColor={Colors.BRAND}
              colors={[Colors.BRAND]}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Feather name="clipboard" size={48} color={Colors.TEXT_SECONDARY} />
              <AppText style={styles.emptyStateText}>No plans found</AppText>
              <AppText style={styles.emptyStateSubtext}>
                {activeTab === "all" ? "Create your first plan to get started" : `No ${activeTab} plans available`}
              </AppText>
            </View>
          }
        />
      )}

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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.BACKGROUND,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 10,
    paddingBottom: 20,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  title: {
    fontSize: 28,
    color: Colors.TEXT,
    fontWeight: "bold",
  },
  planCount: {
    backgroundColor: Colors.BRAND,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    minWidth: 24,
    alignItems: "center",
  },
  planCountText: {
    fontSize: 12,
    color: "black",
    fontWeight: "600",
  },
  createButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: Colors.BRAND,
    alignItems: "center",
    justifyContent: "center",
  },
  filterTabs: {
    flexDirection: "row",
    marginBottom: 20,
    gap: 12,
  },
  filterTab: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: Colors.CARD,
    borderWidth: 1,
    borderColor: Colors.BORDER,
  },
  activeFilterTab: {
    backgroundColor: Colors.BRAND,
    borderColor: Colors.BRAND,
  },
  filterTabText: {
    fontSize: 14,
    color: Colors.TEXT_SECONDARY,
    fontWeight: "500",
  },
  activeFilterTabText: {
    color: "black",
  },
  plansList: {
    paddingBottom: 100,
  },
  planCard: {
    backgroundColor: Colors.CARD,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.BORDER,
  },
  inactivePlanCard: {
    opacity: 0.7,
  },
  planHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  goalTypeTag: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  goalTypeText: {
    fontSize: 12,
    color: Colors.TEXT_BRAND,
    fontWeight: "600",
  },
  planActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  statusButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    minWidth: 60,
    justifyContent: "center",
  },
  activeStatusButton: {
    backgroundColor: Colors.SUCCESS || "#10B981",
  },
  inactiveStatusButton: {
    backgroundColor: Colors.WARNING || "#F59E0B",
  },
  statusButtonText: {
    fontSize: 10,
    color: "white",
    fontWeight: "600",
  },
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.CARD,
    alignItems: "center",
    justifyContent: "center",
  },
  planTitle: {
    fontSize: 18,
    color: Colors.TEXT,
    fontWeight: "600",
    marginBottom: 4,
  },
  planDescription: {
    fontSize: 14,
    color: Colors.TEXT_SECONDARY,
    lineHeight: 20,
    marginBottom: 16,
  },
  planStats: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 16,
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  statText: {
    fontSize: 12,
    color: Colors.TEXT_SECONDARY,
  },
  planFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  planPrice: {
    fontSize: 20,
    color: Colors.TEXT,
    fontWeight: "bold",
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    color: Colors.TEXT,
    fontWeight: "600",
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  emptyStateText: {
    fontSize: 18,
    color: Colors.TEXT,
    fontWeight: "600",
    marginTop: 16,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: Colors.TEXT_SECONDARY,
    textAlign: "center",
    marginTop: 8,
    lineHeight: 20,
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  loadingText: {
    fontSize: 16,
    color: Colors.TEXT_SECONDARY,
  },
  errorContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  errorText: {
    fontSize: 16,
    color: Colors.TEXT,
    marginTop: 16,
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: Colors.BRAND,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  retryButtonText: {
    fontSize: 14,
    color: "black",
    fontWeight: "600",
  },
});

export default PlansScreen;
