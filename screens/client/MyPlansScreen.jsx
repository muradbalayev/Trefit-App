import React, { useState } from "react";
import { View, StyleSheet, FlatList, Pressable } from "react-native";
import { useSelector } from "react-redux";
import { useNavigate } from "@/hooks/useNavigation";
import Colors from "@/constants/Colors";
import Feather from "@expo/vector-icons/Feather";
import { CustomScreen } from "@/components/common";
import AppText from "@/components/ui/Text";
import { useGetMyEnrolledPlansQuery } from "@/store/redux/user/services/userPlanApi";
import { Loading } from "@/components/common";

const MyPlansScreen = () => {
  const { navigate } = useNavigate();
  const { user } = useSelector((state) => state.userAuth);
  const [activeTab, setActiveTab] = useState("active");

  const { 
    data: plansResponse, 
    isLoading, 
    error, 
    refetch 
  } = useGetMyEnrolledPlansQuery({
    page: 1,
    limit: 10
  });

  // Extract real API data
  const enrolledPlans = plansResponse?.plans || plansResponse || [];
  
  // Loading state
  if (isLoading) return <Loading />;
  
  // Error state
  if (error) {
    return (
      <CustomScreen>
        <View style={styles.errorContainer}>
          <Feather name="alert-circle" size={48} color={Colors.ERROR} />
          <AppText style={styles.errorText}>
            {error?.data?.message || 'Failed to load your plans'}
          </AppText>
          <Pressable style={styles.retryButton} onPress={refetch}>
            <AppText style={styles.retryButtonText}>Retry</AppText>
          </Pressable>
        </View>
      </CustomScreen>
    );
  }

  // Mock data for development fallback - remove when API is stable
  const mockPlans = enrolledPlans.length === 0 ? [
    {
      id: 1,
      plan: {
        title: "Muscle Building Masterclass",
        description: "Complete muscle building program for intermediate level",
        goalType: "muscle_gain",
        durationWeeks: 12,
        price: 89.99,
        trainer: {
          name: "John Smith",
          avatar: null,
          rating: 4.8
        }
      },
      enrolledAt: "2024-01-15T00:00:00Z",
      progress: 65,
      completedWeeks: 8,
      currentWeek: 9,
      status: "active",
      nextWorkout: "2024-02-05T10:00:00Z"
    },
    {
      id: 2,
      plan: {
        title: "Weight Loss Journey",
        description: "Effective weight loss program with nutrition guidance",
        goalType: "weight_loss",
        durationWeeks: 8,
        price: 59.99,
        trainer: {
          name: "Sarah Wilson", 
          avatar: null,
          rating: 4.9
        }
      },
      enrolledAt: "2024-01-01T00:00:00Z",
      progress: 100,
      completedWeeks: 8,
      currentWeek: 8,
      status: "completed",
      completedAt: "2024-02-26T00:00:00Z"
    }
  ] : [];

  // Use real API data first, fallback to mock data
  const allPlans = enrolledPlans.length > 0 ? enrolledPlans : mockPlans;
  
  const filteredPlans = allPlans.filter(enrollment => {
    if (activeTab === "active") return enrollment.status === "active";
    if (activeTab === "completed") return enrollment.status === "completed";
    return true;
  });

  const getGoalTypeColor = (goalType) => {
    const colors = {
      muscle_gain: Colors.SUCCESS,
      weight_loss: Colors.WARNING,
      strength: Colors.BRAND,
      general_fitness: Colors.SECONDARY,
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

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const renderPlanCard = ({ item: enrollment }) => (
    <Pressable
      style={styles.planCard}
      onPress={() => navigate("PlanDetails", { enrollmentId: enrollment.id })}
    >
      <View style={styles.planHeader}>
        <View style={[styles.goalTypeTag, { backgroundColor: getGoalTypeColor(enrollment.plan.goalType) }]}>
          <AppText style={styles.goalTypeText}>{getGoalTypeLabel(enrollment.plan.goalType)}</AppText>
        </View>
        <View style={[styles.statusBadge, { 
          backgroundColor: enrollment.status === "active" ? Colors.SUCCESS : Colors.TEXT_SECONDARY 
        }]}>
          <AppText style={styles.statusText}>
            {enrollment.status === "active" ? "Active" : "Completed"}
          </AppText>
        </View>
      </View>

      <AppText style={styles.planTitle}>{enrollment.plan.title}</AppText>
      <AppText style={styles.planDescription} numberOfLines={2}>
        {enrollment.plan.description}
      </AppText>

      <View style={styles.trainerInfo}>
        <View style={styles.trainerAvatar}>
          <AppText style={styles.trainerAvatarText}>
            {enrollment.plan.trainer.name.split(' ').map(n => n[0]).join('')}
          </AppText>
        </View>
        <View style={styles.trainerDetails}>
          <AppText style={styles.trainerName}>{enrollment.plan.trainer.name}</AppText>
          <View style={styles.ratingContainer}>
            <Feather name="star" size={12} color={Colors.WARNING} />
            <AppText style={styles.ratingText}>{enrollment.plan.trainer.rating}</AppText>
          </View>
        </View>
        <Pressable 
          style={styles.chatButton}
          onPress={() => navigate("ChatMessages", { 
            trainerId: enrollment.plan.trainer.id,
            trainerName: enrollment.plan.trainer.name
          })}
        >
          <Feather name="message-circle" size={16} color={Colors.BRAND} />
        </Pressable>
      </View>

      <View style={styles.progressSection}>
        <View style={styles.progressHeader}>
          <AppText style={styles.progressLabel}>Progress</AppText>
          <AppText style={styles.progressPercentage}>{enrollment.progress}%</AppText>
        </View>
        <View style={styles.progressBarContainer}>
          <View 
            style={[
              styles.progressBar, 
              { 
                width: `${enrollment.progress}%`,
                backgroundColor: getGoalTypeColor(enrollment.plan.goalType)
              }
            ]} 
          />
        </View>
        <AppText style={styles.weekInfo}>
          Week {enrollment.currentWeek} of {enrollment.plan.durationWeeks}
        </AppText>
      </View>

      {enrollment.status === "active" && enrollment.nextWorkout && (
        <View style={styles.nextWorkout}>
          <Feather name="calendar" size={14} color={Colors.TEXT_SECONDARY} />
          <AppText style={styles.nextWorkoutText}>
            Next workout: {formatDate(enrollment.nextWorkout)}
          </AppText>
        </View>
      )}
    </Pressable>
  );

  return (
    <CustomScreen>
      {/* Header */}
      <View style={styles.header}>
        <AppText style={styles.title}>My Plans</AppText>
        <Pressable 
          style={styles.searchButton}
          onPress={() => navigate("Trainers")}
        >
          <Feather name="search" size={20} color={Colors.TEXT} />
        </Pressable>
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterTabs}>
        {["active", "completed", "all"].map((tab) => (
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
          <AppText style={styles.loadingText}>Loading your plans...</AppText>
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
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Feather name="clipboard" size={48} color={Colors.TEXT_SECONDARY} />
              <AppText style={styles.emptyStateText}>No plans found</AppText>
              <AppText style={styles.emptyStateSubtext}>
                {activeTab === "all" ? "Enroll in a plan to get started" : `No ${activeTab} plans available`}
              </AppText>
              <Pressable 
                style={styles.browseButton}
                onPress={() => navigate("Trainers")}
              >
                <AppText style={styles.browseButtonText}>Browse Trainers</AppText>
              </Pressable>
            </View>
          }
        />
      )}
    </CustomScreen>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 10,
    paddingBottom: 20,
  },
  title: {
    fontSize: 28,
    color: Colors.TEXT,
    fontWeight: "bold",
  },
  searchButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: Colors.CARD,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: Colors.BORDER,
  },
  filterTabs: {
    flexDirection: "row",
    marginBottom: 20,
    gap: 12,
  },
  filterTab: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: Colors.CARD,
    alignItems: "center",
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
    fontWeight: "600",
  },
  plansList: {
    paddingBottom: 100,
  },
  planCard: {
    backgroundColor: Colors.CARD,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.BORDER,
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
    color: "black",
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
    fontSize: 20,
    color: Colors.TEXT,
    fontWeight: "bold",
    marginBottom: 8,
  },
  planDescription: {
    fontSize: 14,
    color: Colors.TEXT_SECONDARY,
    lineHeight: 20,
    marginBottom: 16,
  },
  trainerInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    gap: 12,
  },
  trainerAvatar: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: Colors.BRAND,
    alignItems: "center",
    justifyContent: "center",
  },
  trainerAvatarText: {
    fontSize: 14,
    color: "black",
    fontWeight: "600",
  },
  trainerDetails: {
    flex: 1,
  },
  trainerName: {
    fontSize: 14,
    color: Colors.TEXT,
    fontWeight: "500",
    marginBottom: 2,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  ratingText: {
    fontSize: 12,
    color: Colors.TEXT_SECONDARY,
  },
  chatButton: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: Colors.BRAND + "20",
    alignItems: "center",
    justifyContent: "center",
  },
  progressSection: {
    marginBottom: 12,
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 14,
    color: Colors.TEXT_SECONDARY,
  },
  progressPercentage: {
    fontSize: 16,
    color: Colors.TEXT,
    fontWeight: "600",
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: Colors.BACKGROUND,
    borderRadius: 4,
    marginBottom: 8,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
  },
  weekInfo: {
    fontSize: 12,
    color: Colors.TEXT_SECONDARY,
  },
  nextWorkout: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: Colors.BACKGROUND,
    padding: 8,
    borderRadius: 8,
  },
  nextWorkoutText: {
    fontSize: 12,
    color: Colors.TEXT_SECONDARY,
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
    marginBottom: 20,
    lineHeight: 20,
  },
  browseButton: {
    backgroundColor: Colors.BRAND,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  browseButtonText: {
    fontSize: 14,
    color: "black",
    fontWeight: "600",
  },
});

export default MyPlansScreen;
