import React, { useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Pressable,
  Alert,
  Image,
  TouchableOpacity,
  RefreshControl,
} from "react-native";
import { useNavigate } from "@/hooks/useNavigation";
import Colors from "@/constants/Colors";
import Feather from "@expo/vector-icons/Feather";
import { CustomScreen, Loading } from "@/components/common";
import AppText from "@/components/ui/Text";
import { useGetTrainerDetailsQuery } from "@/store/redux/user/services/userTrainerApi";
import { useEnrollInPlanMutation } from "@/store/redux/user/services/userPlanApi";
import ScreenHeader from "@/components/common/ScreenHeader";
import { getAvatarUrl } from "@/constants/Paths";

const TrainerDetailsScreen = ({ route }) => {
  const { navigate, goBack } = useNavigate();
  const { trainerId } = route?.params || {};

  // API hooks
  const {
    data: trainerData,
    isLoading,
    error,
    isFetching,
    refetch,
  } = useGetTrainerDetailsQuery(trainerId, {
    skip: !trainerId,
  });

  const [enrollInPlan, { isLoading: enrolling }] = useEnrollInPlanMutation();
  const [activeTab, setActiveTab] = useState("plans"); // 'plans' or 'about'

  const trainer = trainerData?.trainer;
  const plans = trainerData?.plans || [];

  // Loading state
  if (isLoading) {
    return (
      <CustomScreen>
        <View style={styles.loadingContainer}>
          <Loading />
        </View>
      </CustomScreen>
    );
  }

  // Error state
  if (error || !trainer) {
    return (
      <CustomScreen>
        <View style={styles.header}>
          <TouchableOpacity onPress={goBack} style={styles.backButton}>
            <Feather name="arrow-left" size={24} color={Colors.TEXT} />
          </TouchableOpacity>
        </View>
        <View style={styles.errorContainer}>
          <Feather name="alert-circle" size={48} color={Colors.ERROR} />
          <AppText style={styles.errorText}>
            {error?.data?.message || "Trainer not found"}
          </AppText>
          <TouchableOpacity style={styles.retryBtn} onPress={refetch}>
            <AppText style={styles.retryText}>Retry</AppText>
          </TouchableOpacity>
        </View>
      </CustomScreen>
    );
  }

  // Handle plan enrollment
  const handleEnrollInPlan = async (plan) => {
    Alert.alert(
      "Enroll in Plan",
      `Do you want to enroll in "${plan.title}" for $${plan.price}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Enroll",
          onPress: async () => {
            try {
              await enrollInPlan(plan._id).unwrap();

              Alert.alert(
                "Success!",
                "You've successfully enrolled in this plan. You can now chat with your trainer!",
                [
                  {
                    text: "Go Home",
                    onPress: () => navigate("Home"),
                  },
                ]
              );
            } catch (error) {
              const errorMsg =
                error?.data?.message || "Failed to enroll in plan";
              Alert.alert("Enrollment Failed", errorMsg);
            }
          },
        },
      ]
    );
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

  const getGoalTypeColor = (goalType) => {
    const colors = {
      muscle_gain: Colors.SUCCESS,
      weight_loss: Colors.WARNING,
      strength: Colors.BRAND,
      general_fitness: Colors.SECONDARY,
    };
    return colors[goalType] || Colors.BRAND;
  };

  return (
    <CustomScreen>
      <ScrollView 
      showsVerticalScrollIndicator={false} style={styles.container}  refreshControl={
                <RefreshControl
                  refreshing={isFetching}
                  onRefresh={refetch}
                  tintColor={Colors.BRAND}
                  colors={[Colors.BRAND]}
                  progressBackgroundColor={Colors.SECONDARY}
                />
              }> 
        {/* Header */}
        {/* <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigate("Trainers")}
            style={styles.backButton}
          >
            <Feather name="arrow-left" size={24} color={Colors.TEXT} />
          </TouchableOpacity>
          <AppText font="SemiBold" style={styles.headerTitle}>
            @{trainer.username}
          </AppText>
          <View style={styles.headerRight} />
        </View> */}
<ScreenHeader title={trainer?.username}  action={goBack}/>
        {/* Profile Section - Instagram Style */}
        <View style={styles.profileSection}>
          <View style={styles.profileHeader}>
            {/* Avatar */}
            <View style={styles.avatarWrapper}>
              {trainer.avatar ? (
                <Image source={{ uri: getAvatarUrl(trainer.avatar, 'webp') }} style={styles.avatar} />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <AppText font="Bold" style={styles.avatarText}>
                    {trainer.name?.charAt(0) || "T"}
                  </AppText>
                </View>
              )}
            </View>

            {/* Stats */}
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <AppText font="Bold" style={styles.statValue}>
                  {plans.length}
                </AppText>
                <AppText style={styles.statLabel}>Plans</AppText>
              </View>
              <View style={styles.statItem}>
                <AppText font="Bold" style={styles.statValue}>
                  {plans.reduce(
                    (sum, p) => sum + (p.clientsEnrolled?.length || 0),
                    0
                  )}
                </AppText>
                <AppText style={styles.statLabel}>Clients</AppText>
              </View>
              <View style={styles.statItem}>
                <AppText font="Bold" style={styles.statValue}>
                  5.0
                </AppText>
                <AppText style={styles.statLabel}>Rating</AppText>
              </View>
            </View>
          </View>

          {/* Name & Bio */}
          <View style={styles.profileInfo}>
            <AppText font="SemiBold" style={styles.trainerName}>
              {trainer.name}
            </AppText>
            {trainer.specialty && (
              <AppText style={styles.trainerSpecialty}>
                {trainer.specialty}
              </AppText>
            )}
            {trainer.bio && (
              <AppText style={styles.trainerBio}>{trainer.bio}</AppText>
            )}
            {(trainer.experienceYears || trainer.workPlace) && (
              <View style={styles.trainerMeta}>
                {trainer.experienceYears && (
                  <View style={styles.metaItem}>
                    <Feather
                      name="briefcase"
                      size={14}
                      color={Colors.TEXT_SECONDARY}
                    />
                    <AppText style={styles.metaText}>
                      {trainer.experienceYears} years exp.
                    </AppText>
                  </View>
                )}
                {trainer.workPlace && (
                  <View style={styles.metaItem}>
                    <Feather
                      name="map-pin"
                      size={14}
                      color={Colors.TEXT_SECONDARY}
                    />
                    <AppText style={styles.metaText}>
                      {trainer.workPlace}
                    </AppText>
                  </View>
                )}
              </View>
            )}
          </View>
        </View>

        {/* Tabs */}
        <View style={styles.tabsContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === "plans" && styles.activeTab]}
            onPress={() => setActiveTab("plans")}
          >
            <Feather
              name="grid"
              size={20}
              color={
                activeTab === "plans" ? Colors.PRIMARY : Colors.TEXT_SECONDARY
              }
            />
          </TouchableOpacity>
        </View>

        {/* Plans Grid */}
        <View style={styles.plansGrid}>
          {plans.length === 0 ? (
            <View style={styles.emptyState}>
              <Feather
                name="clipboard"
                size={48}
                color={Colors.TEXT_SECONDARY}
              />
              <AppText style={styles.emptyText}>No plans yet</AppText>
            </View>
          ) : (
            plans.map((plan) => (
              <TouchableOpacity
                key={plan._id}
                style={styles.planCard}
                onPress={() => navigate("PlanDetails", { planId: plan._id })}
                activeOpacity={0.8}
              >
                <View
                  style={[
                    styles.planBadge,
                    { backgroundColor: Colors.PRIMARY + "20" },
                  ]}
                >
                  <AppText font="SemiBold" style={styles.planBadgeText}>
                    {getGoalTypeLabel(plan.goalType)}
                  </AppText>
                </View>

                <View style={styles.planContent}>
                  <AppText
                    font="SemiBold"
                    style={styles.planTitle}
                    numberOfLines={2}
                  >
                    {plan.title}
                  </AppText>
                  <AppText style={styles.planDescription} numberOfLines={3}>
                    {plan.description}
                  </AppText>

                  <View style={styles.planFooter}>
                    <View style={styles.planMeta}>
                      <Feather
                        name="clock"
                        size={12}
                        color={Colors.TEXT_SECONDARY}
                      />
                      <AppText style={styles.planMetaText}>
                        {plan.durationWeeks}w
                      </AppText>
                    </View>
                    <View style={styles.planMeta}>
                      <Feather
                        name="users"
                        size={12}
                        color={Colors.TEXT_SECONDARY}
                      />
                      <AppText style={styles.planMetaText}>
                        {plan.clientsEnrolled?.length || 0}
                      </AppText>
                    </View>
                  </View>

                  <View style={styles.planPriceContainer}>
                    <AppText font="Bold" style={styles.planPrice}>
                      ${plan.price}
                    </AppText>
                    <Feather
                      name="arrow-right"
                      size={16}
                      color={Colors.PRIMARY}
                    />
                  </View>
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>
    </CustomScreen>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.BORDER,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 16,
    color: Colors.TEXT,
  },
  headerRight: {
    width: 32,
  },
  profileSection: {
    paddingVertical: 20,
  },
  profileHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  avatarWrapper: {
    marginRight: 24,
  },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 2,
    borderColor: Colors.SECONDARY,
  },
  avatarPlaceholder: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: Colors.PRIMARY,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontSize: 36,
    color: Colors.WHITE,
  },
  statsRow: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-around",
  },
  statItem: {
    alignItems: "center",
  },
  statValue: {
    fontSize: 18,
    color: Colors.TEXT,
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.TEXT_SECONDARY,
  },
  profileInfo: {
    marginTop: 4,
  },
  trainerName: {
    fontSize: 16,
    color: Colors.TEXT,
    marginBottom: 4,
  },
  trainerSpecialty: {
    fontSize: 13,
    color: Colors.PRIMARY,
    marginBottom: 8,
  },
  trainerBio: {
    fontSize: 14,
    color: Colors.TEXT,
    lineHeight: 20,
    marginBottom: 8,
  },
  trainerMeta: {
    flexDirection: "row",
    gap: 16,
    marginTop: 4,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  metaText: {
    fontSize: 12,
    color: Colors.TEXT_SECONDARY,
  },
  tabsContainer: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: Colors.BORDER,
  },
  tab: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  activeTab: {
    borderBottomColor: Colors.SECONDARY,
  },
  plansGrid: {
    paddingTop: 16,
  },
  planCard: {
    backgroundColor: Colors.CARD_BG,
    borderRadius: 16,
    marginBottom: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: Colors.BORDER,
  },
  planBadge: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  planBadgeText: {
    fontSize: 12,
    color: Colors.PRIMARY,
  },
  planContent: {
    padding: 16,
  },
  planTitle: {
    fontSize: 18,
    color: Colors.TEXT,
    marginBottom: 8,
  },
  planDescription: {
    fontSize: 14,
    color: Colors.TEXT_SECONDARY,
    lineHeight: 20,
    marginBottom: 12,
  },
  planFooter: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 12,
  },
  planMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  planMetaText: {
    fontSize: 12,
    color: Colors.TEXT_SECONDARY,
  },
  planPriceContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.BORDER,
  },
  planPrice: {
    fontSize: 20,
    color: Colors.PRIMARY,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: Colors.TEXT_SECONDARY,
    marginTop: 16,
  },
  errorContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
    paddingHorizontal: 32,
  },
  errorText: {
    fontSize: 16,
    color: Colors.ERROR,
    textAlign: "center",
  },
  retryBtn: {
    backgroundColor: Colors.PRIMARY,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryText: {
    color: Colors.WHITE,
    fontWeight: "600",
  },
  bottomSpacing: {
    height: 100,
  },
});

export default TrainerDetailsScreen;
