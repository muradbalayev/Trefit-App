import React, { useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Image,
} from "react-native";
import { useNavigate } from "@/hooks/useNavigation";
import Colors from "@/constants/Colors";
import Feather from "@expo/vector-icons/Feather";
import { CustomScreen, Loading, SuccessModal, ConfirmModal } from "@/components/common";
import AppText from "@/components/ui/Text";
import { useGetPlanDetailsQuery } from "@/store/redux/user/services/userPlanApi";
import { useEnrollInPlanMutation } from "@/store/redux/user/services/userPlanApi";
import ScreenHeader from "@/components/common/ScreenHeader";
import { useSelector } from "react-redux";
import { getAvatarUrl } from "@/constants/Paths";

const PlanDetailsScreen = ({ route }) => {
  const { navigate, goBack } = useNavigate();
  const { planId } = route?.params || {}; // Changed from enrollmentId to planId

  const { user } = useSelector((state) => state.userAuth);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showEnrollSuccess, setShowEnrollSuccess] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Real API hooks
  const {
    data: plan,
    isLoading,
    error,
    refetch,
  } = useGetPlanDetailsQuery(planId, {
    skip: !planId,
  });

  const [enrollInPlan, { isLoading: isEnrolling }] = useEnrollInPlanMutation();

  const enrolled = plan?.clientsEnrolled?.some(
    (client) => client._id === user?._id
  );

  // Enrollment gating
  // Prefer backend-computed flag when provided; otherwise, compute locally from user fields
  const localCanEnroll = (() => {
    const u = user || {};
    const hasAge = typeof u.age === "number" && u.age > 0;
    const hasGender = typeof u.gender === "string" && ["male", "female", "other"].includes(u.gender);
    const hasHeight = typeof u.height === "number" && u.height > 0;
    const hasWeight = typeof u.weight === "number" && u.weight > 0;
    const hasGoals = Array.isArray(u.goals) && u.goals.length > 0;
    return hasAge && hasGender && hasHeight && hasWeight && hasGoals;
  })();

  const canEnroll = (user?.hasAccessToEnroll ?? localCanEnroll) === true;

  // Handle enrollment
  const handleEnrollment = async () => {
    if (!planId) return;

    if (!canEnroll) {
      setShowProfileModal(true);
      return;
    }
    // Open confirm modal instead of native alert
    setShowConfirm(true);
  };

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
  if (error || !plan) {
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
            {error?.data?.message || "Plan not found"}
          </AppText>
          <TouchableOpacity style={styles.retryBtn} onPress={refetch}>
            <AppText style={styles.retryText}>Retry</AppText>
          </TouchableOpacity>
        </View>
      </CustomScreen>
    );
  }

  const getGoalTypeColor = (goalType) => {
    const colors = {
      muscle_gain: Colors.BRAND + "30",
      weight_loss: Colors.BRAND + "30",
      strength: Colors.BRAND + "30",
      general_fitness: Colors.BRAND + "30",
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

  return (
    <CustomScreen>
      {/* Modals */}
      <SuccessModal
        visible={showProfileModal}
        title="Complete Profile"
        message="To enroll in a plan, please complete your profile (age, gender, height, weight, goals)."
        buttonText="Complete Now"
        iconName="user-check"
        iconColor={Colors.PRIMARY}
        onClose={() => {
          setShowProfileModal(false);
          navigate("EditProfile");
        }}
      />

      <SuccessModal
        visible={showEnrollSuccess}
        title="Success!"
        message="You've successfully enrolled in this plan."
        buttonText="Go Home"
        iconName="check-circle"
        iconColor={Colors.SUCCESS}
        onClose={() => {
          setShowEnrollSuccess(false);
          navigate("Home", { refresh: Date.now() });
        }}
      />
      
      <ConfirmModal
        visible={showConfirm}
        title="Enroll in Plan"
        message={`Do you want to enroll in "${plan?.title}" for $${plan?.price}?`}
        confirmText="Enroll"
        cancelText="Cancel"
        iconName="arrow-right-circle"
        iconColor={Colors.PRIMARY}
        onCancel={() => setShowConfirm(false)}
        onConfirm={async () => {
          try {
            await enrollInPlan(planId).unwrap();
            setShowConfirm(false);
            setShowEnrollSuccess(true);
          } catch (error) {
            setShowConfirm(false);
            const errorMsg = error?.data?.message || "Failed to enroll in plan";
            Alert.alert("Enrollment Failed", errorMsg);
          }
        }}
      />
      <ScrollView showsVerticalScrollIndicator={false} style={styles.container}>
        {/* Header */}
        <ScreenHeader action={() => goBack()} title="Plan Details" />

        <View style={styles.content}>
          {/* Plan Header */}
          <View style={styles.planHeader}>
            <View
              style={[
                styles.goalTypeTag,
                { backgroundColor: getGoalTypeColor(plan.goalType) },
              ]}
            >
              <AppText font="SemiBold" style={styles.goalTypeText}>
                {getGoalTypeLabel(plan.goalType)}
              </AppText>
            </View>
          </View>

          <AppText font="Bold" style={styles.planTitle}>
            {plan.title}
          </AppText>
          <AppText style={styles.planDescription}>{plan.description}</AppText>

          {/* Plan Info Cards */}
          <View style={styles.infoGrid}>
            <View style={styles.infoCard}>
              <Feather name="clock" size={20} color={Colors.PRIMARY} />
              <AppText font="Bold" style={styles.infoValue}>
                {plan.durationWeeks}
              </AppText>
              <AppText style={styles.infoLabel}>Weeks</AppText>
            </View>

            <View style={styles.infoCard}>
              <Feather name="users" size={20} color={Colors.PRIMARY} />
              <AppText font="Bold" style={styles.infoValue}>
                {plan.clientsEnrolled?.length || 0}
              </AppText>
              <AppText style={styles.infoLabel}>Enrolled</AppText>
            </View>
          </View>
          <View style={styles.infoCard}>
            <Feather name="trending-up" size={20} color={Colors.PRIMARY} />
            <AppText font="SemiBold" style={styles.infoValue}>
              {plan.difficulty.charAt(0).toUpperCase() +
                plan.difficulty.slice(1) || "Beginner"}
            </AppText>
            <AppText style={styles.infoLabel}>Difficulty</AppText>
          </View>
          {/* Trainer Info */}
          {plan.createdBy && (
            <TouchableOpacity
              style={styles.trainerCard}
              onPress={() =>
                navigate("TrainerDetails", { trainerId: plan.createdBy._id })
              }
            >
              <View style={styles.trainerHeader}>
                <AppText font="SemiBold" style={styles.sectionTitle}>
                  Created by
                </AppText>
                <Feather
                  name="chevron-right"
                  size={20}
                  color={Colors.TEXT_SECONDARY}
                />
              </View>

              <View style={styles.trainerInfo}>
                {plan.createdBy.avatar ? (
                  <Image
                    source={{ uri: getAvatarUrl(plan.createdBy.avatar) }}
                    style={styles.trainerAvatar}
                  />
                ) : (
                  <View style={styles.trainerAvatarPlaceholder}>
                    <AppText font="Bold" style={styles.trainerAvatarText}>
                      {plan.createdBy.name?.charAt(0) || "T"}
                    </AppText>
                  </View>
                )}

                <View style={styles.trainerDetails}>
                  <AppText font="SemiBold" style={styles.trainerName}>
                    {plan.createdBy.name || "Trainer"}
                  </AppText>
                  <AppText style={styles.trainerUsername}>
                    @{plan.createdBy.username || "trainer"}
                  </AppText>
                </View>
              </View>
            </TouchableOpacity>
          )}

          {/* Tags */}
          {plan.tags && plan.tags.length > 0 && (
            <View style={styles.tagsSection}>
              <AppText font="SemiBold" style={styles.sectionTitle}>
                Tags
              </AppText>
              <View style={styles.tagsList}>
                {plan.tags.map((tag, index) => (
                  <View key={index} style={styles.tag}>
                    <AppText style={styles.tagText}>{tag}</AppText>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Price & Enroll Button */}
          <View style={styles.bottomSection}>
            <View style={styles.priceContainer}>
              <AppText style={styles.priceLabel}>Price</AppText>
              <AppText font="Bold" style={styles.priceValue}>
                ${plan.price}
              </AppText>
            </View>
            {!enrolled ? (
              <TouchableOpacity
                style={[
                  styles.enrollButton,
                  isEnrolling && styles.enrollButtonDisabled,
                ]}
                onPress={handleEnrollment}
                disabled={isEnrolling}
              >
                <AppText font="SemiBold" style={styles.enrollButtonText}>
                  {isEnrolling ? "Enrolling..." : "Enroll Now"}
                </AppText>
                <Feather name="arrow-right" size={20} color={Colors.WHITE} />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={[
                  styles.enrollButton,
                  styles.enrollButtonDisabled,
                ]}
                onPress={handleEnrollment}
                disabled={true}
              >
                <AppText font="SemiBold" style={styles.enrollButtonText}>
                 Enrolled
                </AppText>
                <Feather name="check-circle" size={20} color={Colors.WHITE} />
              </TouchableOpacity>
            )}
          </View>
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
  content: {
    paddingTop: 20,
  },
  planHeader: {
    marginBottom: 16,
  },
  goalTypeTag: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    alignSelf: "flex-start",
  },
  goalTypeText: {
    fontSize: 12,
    color: Colors.BRAND,
  },
  planTitle: {
    fontSize: 28,
    color: Colors.TEXT,
    marginBottom: 12,
  },
  planDescription: {
    fontSize: 16,
    color: Colors.TEXT_SECONDARY,
    lineHeight: 24,
    marginBottom: 24,
  },
  infoGrid: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 12,
  },
  infoCard: {
    flex: 1,
    backgroundColor: Colors.CARD_BG,
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    gap: 8,
    borderWidth: 1,
    borderColor: Colors.BORDER,
  },
  infoValue: {
    fontSize: 16,
    color: Colors.TEXT,
  },
  infoLabel: {
    fontSize: 12,
    color: Colors.TEXT_SECONDARY,
  },
  trainerCard: {
    marginTop: 12,
    backgroundColor: Colors.CARD_BG,
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: Colors.BORDER,
  },
  trainerHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    color: Colors.TEXT,
  },
  trainerInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  trainerAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 2,
    borderColor: Colors.SECONDARY,
  },
  trainerAvatarPlaceholder: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.PRIMARY,
    alignItems: "center",
    justifyContent: "center",
  },
  trainerAvatarText: {
    fontSize: 20,
    color: Colors.WHITE,
  },
  trainerDetails: {
    flex: 1,
  },
  trainerName: {
    fontSize: 16,
    color: Colors.TEXT,
    marginBottom: 2,
  },
  trainerUsername: {
    fontSize: 14,
    color: Colors.TEXT_SECONDARY,
  },
  tagsSection: {
    marginBottom: 24,
  },
  tagsList: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 12,
  },
  tag: {
    backgroundColor: Colors.PRIMARY + "20",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  tagText: {
    fontSize: 12,
    color: Colors.PRIMARY,
  },
  bottomSection: {
    marginTop: "auto",
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: Colors.BORDER,
  },
  priceContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  priceLabel: {
    fontSize: 16,
    color: Colors.TEXT_SECONDARY,
  },
  priceValue: {
    fontSize: 32,
    color: Colors.PRIMARY,
  },
  enrollButton: {
    backgroundColor: Colors.PRIMARY,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 16,
    borderRadius: 12,
  },
  enrollButtonDisabled: {
    opacity: 0.6,
  },
  enrollButtonText: {
    fontSize: 16,
    color: Colors.WHITE,
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

export default PlanDetailsScreen;
