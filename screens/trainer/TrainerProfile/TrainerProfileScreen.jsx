import {
  StyleSheet,
  View,
  Image,
  Pressable,
  Alert,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
} from "react-native";
import React, { useState } from "react";
import { CustomScreen, Loading, SuccessModal } from "@/components/common";
import AppText from "@/components/ui/Text";
import Colors from "@/constants/Colors";
import {
  useGetAccountQuery,
  useUpdateProfileMutation,
  useUploadAvatarMutation,
} from "@/store/redux/user/services/userAccountApi";
import { useLogoutMutation } from "@/store/redux/user/services/userAuthApi";
import { useGetTrainerStatsQuery } from "@/store/redux/trainer/services/trainerStatsApi";
import { Feather } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";
import { useNavigate } from "@/hooks/useNavigation";
import { getAvatarUrl } from "@/constants/Paths";

const TrainerProfileScreen = ({ navigation }) => {
  const { data: user, isFetching, isError, refetch } = useGetAccountQuery();
  const { data: stats, isLoading: isLoadingStats } = useGetTrainerStatsQuery();
  const [logout, { isLoading: isLoggingOut }] = useLogoutMutation();
  const { navigate } = useNavigate();

  const [updateProfile, { isLoading: isUpdatingProfile }] =
    useUpdateProfileMutation();
  const [uploadAvatar, { isLoading: isUploadingAvatar }] =
    useUploadAvatarMutation();
  const [showIncompleteModal, setShowIncompleteModal] = useState(false);

  const onLogout = async () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          try {
            await logout().unwrap();
          } catch (e) {
            Alert.alert("Logout failed", "Please try again.");
          }
        },
      },
    ]);
  };

  const handleAvatarUpload = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ["image/*"],
        copyToCacheDirectory: true,
      });

      if (result.canceled) return;

      const asset = result.assets[0];
      const formData = new FormData();
      formData.append("avatar", {
        uri: asset.uri,
        type: asset.mimeType,
        name: asset.name,
      });

      await uploadAvatar(formData).unwrap();
      await refetch();
      Alert.alert("Success", "Avatar updated successfully!");
    } catch (error) {
      console.error("Avatar upload error:", error);
      Alert.alert("Error", "Failed to update avatar. Please try again.");
    }
  };
  
  const navigateToEditProfile = () => {
    navigation.navigate("EditProfile");
  };

  const navigateToChangePassword = () => {
    navigation.navigate("ChangePassword");
  };

  const navigateToNotifications = () => {
    navigation.navigate("Notifications");
  };

  if (isFetching) return <Loading />;
  if (isError) {
    return (
      <CustomScreen>
        <View style={styles.errorContainer}>
          <Feather name="alert-circle" size={48} color={Colors.ERROR} />
          <AppText style={styles.errorText}>Failed to load profile</AppText>
          <TouchableOpacity style={styles.retryBtn} onPress={refetch}>
            <AppText style={styles.retryText}>Retry</AppText>
          </TouchableOpacity>
        </View>
      </CustomScreen>
    );
  }

  return (
    <CustomScreen>
      <View style={styles.topBar}>
        <AppText font="Bold" style={styles.headerTitle}>
          @{user?.username || "no-username"}
        </AppText>
        <Pressable
          onPress={onLogout}
          style={styles.logoutBtn}
          disabled={isLoggingOut}
        >
          <Feather name="log-out" size={16} color="white" />
          <AppText font="SemiBold" style={styles.logoutText}>
            {isLoggingOut ? "Logging out..." : "Logout"}
          </AppText>
        </Pressable>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={isFetching}
            onRefresh={refetch}
            tintColor={Colors.BRAND}
            colors={[Colors.BRAND]}
            progressBackgroundColor={Colors.SECONDARY}
          />
        }
      >
        {/* Trainer Header */}
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            <Image
              source={{
                uri:
                  user?.avatar ?
                  getAvatarUrl(user.avatar, 'webp') :
                  "https://www.tenforums.com/attachments/user-accounts-family-safety/322690d1615743307-user-account-image-log-user.png",
              }}
              style={styles.avatar}
            />
            <TouchableOpacity
              style={styles.avatarEditBtn}
              onPress={handleAvatarUpload}
              disabled={isUploadingAvatar}
            >
              <Feather
                name={isUploadingAvatar ? "loader" : "camera"}
                size={16}
                color="white"
              />
            </TouchableOpacity>
          </View>

          <View style={styles.userInfo}>
            <AppText font="SemiBold" style={styles.userName}>
              {user?.name || "No Name"}
            </AppText>

            <View style={styles.userMeta}>
              {/* <View style={styles.metaItem}>
                <Feather name="mail" size={14} color={Colors.TEXT_SECONDARY} />
                <AppText style={styles.metaText}>{user?.email}</AppText>
              </View> */}
              <View style={[styles.roleBadge, styles.trainerBadge]}>
                <Feather name="award" size={12} color="black" />
                <AppText style={styles.roleText}>TRAINER</AppText>
              </View>
            </View>
            <View style={styles.verificationStatus}>
              <Feather
                name={user?.isVerified ? "check-circle" : "clock"}
                size={14}
                color={user?.isVerified ? Colors.SUCCESS : Colors.WARNING}
              />
              <AppText
                style={[
                  styles.verificationText,
                  {
                    color: user?.isVerified ? Colors.SUCCESS : Colors.WARNING,
                  },
                ]}
              >
                {user?.isVerified ? "Verified Trainer" : "Pending Verification"}
              </AppText>
            </View>
          </View>
        </View>

        {/* Trainer Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <View style={styles.statIcon}>
              <Feather name="users" size={20} color={Colors.BRAND} />
            </View>
            <AppText font="Bold" style={styles.statValue}>
              {isLoadingStats ? "..." : stats?.overview?.activeClients || 0}
            </AppText>
            <AppText style={styles.statLabel}>Clients</AppText>
          </View>

          <View style={styles.statCard}>
            <View style={styles.statIcon}>
              <Feather name="file-text" size={20} color={Colors.BRAND} />
            </View>
            <AppText font="Bold" style={styles.statValue}>
              {isLoadingStats ? "..." : stats?.overview?.activePlans || 0}
            </AppText>
            <AppText style={styles.statLabel}>Plans</AppText>
          </View>

          <View style={styles.statCard}>
            <View style={styles.statIcon}>
              <Feather name="dollar-sign" size={20} color={Colors.BRAND} />
            </View>
            <AppText font="Bold" style={styles.statValue}>
              {isLoadingStats ? "..." : `$${stats?.overview?.thisMonthRevenue || 0}`}
            </AppText>
            <AppText style={styles.statLabel}>Revenue</AppText>
          </View>

          <View style={styles.statCard}>
            <View style={styles.statIcon}>
              <Feather name="check-circle" size={20} color={Colors.BRAND} />
            </View>
            <AppText font="Bold" style={styles.statValue}>
              {isLoadingStats ? "..." : stats?.tasks?.completed || 0}
            </AppText>
            <AppText style={styles.statLabel}>Tasks</AppText>
          </View>
        </View>

        {/* Dashboard Buttons */}
        <View style={styles.dashboardButtons}>
          <Pressable
            style={styles.dashboardButton}
            onPress={() => navigate("ClientDashboard")}
          >
            <Feather name="users" size={18} color={Colors.BRAND} />
            <AppText font="SemiBold" style={styles.dashboardButtonText}>
              Clients Dashboard
            </AppText>
            <Feather name="arrow-right" size={16} color={Colors.BRAND} />
          </Pressable>

          <Pressable
            style={styles.dashboardButton}
            onPress={() => navigate("TrainerDashboard")}
          >
            <Feather name="bar-chart-2" size={18} color={Colors.BRAND} />
            <AppText font="SemiBold" style={styles.dashboardButtonText}>
              Analytics Dashboard
            </AppText>
            <Feather name="arrow-right" size={16} color={Colors.BRAND} />
          </Pressable>
        </View>

        {/* Professional Info Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Feather name="briefcase" size={20} color={Colors.BRAND} />
            <AppText font="Bold" style={styles.sectionTitle}>
              Professional Information
            </AppText>
            <TouchableOpacity
              style={styles.editBtn}
              onPress={navigateToEditProfile}
            >
              <Feather name="edit-2" size={16} color={Colors.BRAND} />
              <AppText style={styles.editBtnText}>Edit</AppText>
            </TouchableOpacity>
          </View>

          <View style={styles.infoGrid}>
            <InfoCard icon="clock" label="Experience" value="5+ years" />
            <InfoCard icon="award" label="Certifications" value="NASM, ACE" />
            <InfoCard
              icon="target"
              label="Specialties"
              value="Strength Training"
            />
            <InfoCard icon="trending-up" label="Success Rate" value="95%" />
          </View>
        </View>

        {/* Personal Info Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Feather name="user" size={20} color={Colors.BRAND} />
            <AppText font="Bold" style={styles.sectionTitle}>
              Personal Information
            </AppText>
          </View>

          <View style={styles.infoGrid}>
            <InfoCard
              icon="user"
              label="Age"
              value={user?.age ? `${user.age} years` : "Not set"}
            />
            <InfoCard
              icon="users"
              label="Gender"
              value={user?.gender || "Not set"}
            />
            <InfoCard
              icon="trending-up"
              label="Height"
              value={user?.height ? `${user.height} cm` : "Not set"}
            />
            <InfoCard
              icon="activity"
              label="Weight"
              value={user?.weight ? `${user.weight} kg` : "Not set"}
            />
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Feather name="zap" size={20} color={Colors.BRAND} />
            <AppText font="Bold" style={styles.sectionTitle}>
              Quick Actions
            </AppText>
          </View>
          <View style={styles.actionsGrid}>
            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => {
                // Check if profile is complete
                console.log('hasAccessToCreatePlan:', user?.trainerProfile?.hasAccessToCreatePlan);
                console.log('trainerProfile:', user?.trainerProfile);
                if (!user?.trainerProfile?.hasAccessToCreatePlan) {
                  setShowIncompleteModal(true);
                } else {
                  navigate("CreatePlan");
                }
              }}
            >
              <Feather name="plus-circle" size={24} color={Colors.BRAND} />
              <AppText style={styles.actionText}>Create Plan</AppText>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => navigation.navigate("Clients")}
            >
              <Feather name="users" size={24} color={Colors.BRAND} />
              <AppText style={styles.actionText}>View Clients</AppText>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => navigation.navigate("Plans")}
            >
              <Feather name="file-text" size={24} color={Colors.BRAND} />
              <AppText style={styles.actionText}>My Plans</AppText>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => navigation.navigate("Chat")}
            >
              <Feather name="message-circle" size={24} color={Colors.BRAND} />
              <AppText style={styles.actionText}>Messages</AppText>
            </TouchableOpacity>
          </View>
        </View>

        {/* Settings Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Feather name="settings" size={20} color={Colors.BRAND} />
            <AppText font="Bold" style={styles.sectionTitle}>
              Settings
            </AppText>
          </View>

          <TouchableOpacity
            style={styles.settingItem}
            onPress={navigateToChangePassword}
          >
            <View style={styles.settingLeft}>
              <Feather name="lock" size={20} color={Colors.TEXT_SECONDARY} />
              <AppText style={styles.settingText}>Change Password</AppText>
            </View>
            <Feather
              name="chevron-right"
              size={20}
              color={Colors.TEXT_SECONDARY}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.settingItem}
            onPress={navigateToNotifications}
          >
            <View style={styles.settingLeft}>
              <Feather name="bell" size={20} color={Colors.TEXT_SECONDARY} />
              <AppText style={styles.settingText}>Notifications</AppText>
            </View>
            <Feather
              name="chevron-right"
              size={20}
              color={Colors.TEXT_SECONDARY}
            />
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Feather name="shield" size={20} color={Colors.TEXT_SECONDARY} />
              <AppText style={styles.settingText}>Privacy</AppText>
            </View>
            <Feather
              name="chevron-right"
              size={20}
              color={Colors.TEXT_SECONDARY}
            />
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Feather
                name="help-circle"
                size={20}
                color={Colors.TEXT_SECONDARY}
              />
              <AppText style={styles.settingText}>Help & Support</AppText>
            </View>
            <Feather
              name="chevron-right"
              size={20}
              color={Colors.TEXT_SECONDARY}
            />
          </TouchableOpacity>
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>
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

const InfoCard = ({ icon, label, value }) => (
  <View style={styles.infoCard}>
    <View style={styles.infoIcon}>
      <Feather name={icon} size={16} color={Colors.BRAND} />
    </View>
    <AppText style={styles.infoLabel}>{label}</AppText>
    <AppText font="SemiBold" style={styles.infoValue}>
      {value}
    </AppText>
  </View>
);

export default TrainerProfileScreen;

const styles = StyleSheet.create({
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
    paddingTop: 10,
  },
  headerTitle: {
    fontSize: 22,
    color: 'lightgray',
  },
  logoutBtn: {
    backgroundColor: Colors.ERROR,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  logoutText: {
    color: "white",
    fontSize: 12,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  profileHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 16,
    marginBottom: 24,
    padding: 20,
    backgroundColor: Colors.CARD,
    borderRadius: 16,
  },
  avatarContainer: {
    position: "relative",
  },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 2,
    borderColor: Colors.BORDER,
  },
  avatarEditBtn: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: Colors.BORDER,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: Colors.BACKGROUND,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 20,
    color: Colors.TEXT,
  },
  userHandle: {
    fontSize: 14,
    color: Colors.TEXT_SECONDARY,
    marginTop: 2,
  },
  userMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginTop: 8,
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
  roleBadge: {
    backgroundColor: Colors.SECONDARY,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  trainerBadge: {
    backgroundColor: Colors.BRAND,
  },
  roleText: {
    fontSize: 10,
    color: "black",
    fontWeight: "600",
  },
  verificationStatus: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 8,
  },
  verificationText: {
    fontSize: 12,
    fontWeight: "600",
  },
  statsContainer: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 16,
  },
  dashboardButtons: {
    gap: 12,
    marginBottom: 24,
  },
  dashboardButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: Colors.CARD,
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.BORDER,
  },
  dashboardButtonText: {
    flex: 1,
    fontSize: 14,
    color: Colors.TEXT,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.CARD,
    padding: 12,
    borderRadius: 12,
    alignItems: "center",
  },
  statIcon: {
    marginBottom: 6,
  },
  statValue: {
    fontSize: 18,
    color: Colors.TEXT,
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 10,
    color: Colors.TEXT_SECONDARY,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 16,
  },
  sectionTitle: {
    flex: 1,
    fontSize: 16,
    color: Colors.TEXT,
  },
  editBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: Colors.SECONDARY,
    borderRadius: 8,
  },
  editBtnText: {
    fontSize: 12,
    color: Colors.BRAND,
    fontWeight: "600",
  },
  infoGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  infoCard: {
    width: "48%",
    backgroundColor: Colors.CARD,
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  infoIcon: {
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 12,
    color: Colors.TEXT_SECONDARY,
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 14,
    color: Colors.TEXT,
    textAlign: "center",
  },
  actionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  actionCard: {
    width: "48%",
    backgroundColor: Colors.CARD,
    padding: 20,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 2,
    borderColor: Colors.BORDER,
    borderStyle: "dashed",
  },
  actionText: {
    fontSize: 12,
    color: Colors.TEXT,
    marginTop: 8,
    fontWeight: "600",
  },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: Colors.CARD,
    borderRadius: 12,
    marginBottom: 8,
  },
  settingLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  settingText: {
    fontSize: 14,
    color: Colors.TEXT,
  },
  errorContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
  },
  errorText: {
    fontSize: 16,
    color: Colors.ERROR,
    textAlign: "center",
  },
  retryBtn: {
    backgroundColor: Colors.BRAND,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryText: {
    color: "white",
    fontWeight: "600",
  },
  bottomSpacing: {
    height: 20,
  },
});
