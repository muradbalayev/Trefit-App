import React from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Pressable,
  ActivityIndicator,
  Image,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import AppText from "@/components/ui/Text";
import Colors from "@/constants/Colors";
import { useGetDashboardClientsQuery } from "@/store/redux/trainer/services/trainerStatsApi";
import { getAvatarUrl } from "@/constants/Paths";
import { FontAwesome6 } from "@expo/vector-icons";
import ClientCardSkeleton from "./ClientCardSkeleton";
import ArrowButton from "@/components/common/ArrowButton";

const ClientCard = ({ client, onPress }) => {
  const daysText = client.daysEnrolled === 1 ? "day" : "days";

  return (
    <Pressable style={styles.clientCard} onPress={onPress}>
      {/* Header with Avatar and Name */}
      <View style={styles.cardHeader}>
        <View style={styles.avatarContainer}>
          {client.clientAvatar ? (
            <Image
              source={{ uri: getAvatarUrl(client.clientAvatar, "webp") }}
              style={styles.avatar}
            />
          ) : (
            <View style={styles.clientAvatarPlaceholder}>
              <AppText style={styles.clientAvatarText}>
                {client.clientName?.charAt(0) || "U"}
              </AppText>
            </View>
          )}
        </View>

        <View style={styles.clientInfo}>
          <AppText font="SemiBold" style={styles.clientName}>
            {client.clientName}
          </AppText>
          <AppText style={styles.planTitle}>{client.planTitle}</AppText>
        </View>
<ArrowButton/>
        {/* <Feather name="chevron-right" size={20} color={Colors.TEXT_SECONDARY} /> */}
      </View>

      {/* Stats Grid */}
      <View style={styles.statsGrid}>
        {/* Days Enrolled */}
        <View style={styles.statItem}>
          <View
            style={[
              styles.statIcon,
              { backgroundColor: `${Colors.PRIMARY}15` },
            ]}
          >
            <Feather name="calendar" size={14} color={Colors.PRIMARY} />
          </View>
          <AppText style={styles.statValue}>{client.daysEnrolled}</AppText>
          <AppText style={styles.statLabel}>{daysText}</AppText>
        </View>

        {/* Tasks Completed */}
        <View style={styles.statItem}>
          <View
            style={[
              styles.statIcon,
              { backgroundColor: `${Colors.SUCCESS}15` },
            ]}
          >
            <Feather name="check-circle" size={14} color={Colors.SUCCESS} />
          </View>
          <AppText style={styles.statValue}>
            {client.tasksCompleted}/{client.totalTasks}
          </AppText>
          <AppText style={styles.statLabel}>Tasks</AppText>
        </View>

        {/* Streak */}
        <View style={styles.statItem}>
          <View
            style={[
              styles.statIcon,
              { backgroundColor: `${Colors.WARNING}15` },
            ]}
          >
            <FontAwesome6 name="fire-flame-curved" size={15} color="orange" />
          </View>
          <AppText style={styles.statValue}>{client.streak}</AppText>
          <AppText style={styles.statLabel}>Streak</AppText>
        </View>

        {/* Weight Change */}
        {client.weightChange && (
          <View style={styles.statItem}>
            <View
              style={[styles.statIcon, { backgroundColor: `${Colors.INFO}15` }]}
            >
              <Feather name="trending-down" size={14} color={Colors.INFO} />
            </View>
            <AppText style={styles.statValue}>{client.weightChange}kg</AppText>
            <AppText style={styles.statLabel}>Lost</AppText>
          </View>
        )}
      </View>

      {/* Bottom Info */}
      <View style={styles.cardFooter}>
        <View style={styles.footerItem}>
          <Feather
            name={client.hasWorkoutProgram ? "file-text" : "alert-circle"}
            size={12}
            color={client.hasWorkoutProgram ? Colors.SUCCESS : Colors.WARNING}
          />
          <AppText style={styles.footerText}>
            {client.hasWorkoutProgram
              ? client.workoutProgramType === "default"
                ? "Default PDF"
                : "Custom PDF"
              : "No PDF"}
          </AppText>
        </View>

        <View style={styles.footerItem}>
          <Feather
            name={client.hasProgressPhotos ? "image" : "camera-off"}
            size={12}
            color={
              client.hasProgressPhotos ? Colors.SUCCESS : Colors.TEXT_SECONDARY
            }
          />
          <AppText style={styles.footerText}>
            {client.hasProgressPhotos
              ? `Week ${client.latestPhotoWeek} photos`
              : "No photos"}
          </AppText>
        </View>

        <View style={styles.footerItem}>
          <Feather name="activity" size={12} color={Colors.BRAND} />
          <AppText style={styles.footerText}>Week {client.currentWeek}</AppText>
        </View>
      </View>
    </Pressable>
  );
};

const ClientDashboard = ({ onClientPress, onViewAll, limit = 2 }) => {
  const {
    data: clientsData,
    isLoading,
    error,
  } = useGetDashboardClientsQuery({
    status: "active",
    limit,
  });

  const clients = clientsData || [];
  
  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <AppText font="Bold" style={styles.title}>
            My Clients
          </AppText>
        </View>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {[1, 2].map((i) => (
            <ClientCardSkeleton key={i} />
          ))}
        </ScrollView>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Feather name="alert-circle" size={48} color={Colors.ERROR} />
        <AppText style={styles.errorText}>Failed to load clients</AppText>
      </View>
    );
  }

  if (clients.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Feather name="users" size={48} color={Colors.TEXT_SECONDARY} />
        <AppText style={styles.emptyTitle} font="SemiBold">
          No Active Clients
        </AppText>
        <AppText style={styles.emptyText}>
          Your clients will appear here once they enroll in your plans
        </AppText>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <AppText font="Bold" style={styles.title}>
         My Clients
        </AppText>
        {/* <AppText style={styles.subtitle}>
          {clients.length} {clients.length === 1 ? "client" : "clients"}
        </AppText> */}
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {clients.map((client) => (
          <ClientCard
            key={client.enrollmentId}
            client={client}
            onPress={() => onClientPress?.(client)}
          />
        ))}
        
        {onViewAll && clients.length >= limit && (
          <Pressable style={styles.viewAllButton} onPress={onViewAll}>
            <AppText font="SemiBold" style={styles.viewAllText}>
              Clients Dashboard
            </AppText>
            <Feather name="arrow-right" size={16} color={Colors.BRAND} />
          </Pressable>
        )}
      </ScrollView>
    </View>
  );
};

export default ClientDashboard;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    color: Colors.TEXT,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
    color: Colors.TEXT_SECONDARY,
  },
  scrollContent: {
    gap: 12,
    paddingBottom: 20,
  },
  clientCard: {
    backgroundColor: Colors.CARD,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.BORDER,
    gap: 12,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  avatarContainer: {
    width: 48,
    height: 48,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  clientAvatarPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.PRIMARY,
    alignItems: "center",
    justifyContent: "center",
  },
  clientAvatarText: {
    fontSize: 20,
    color: Colors.WHITE,
  },
  clientInfo: {
    flex: 1,
    gap: 2,
  },
  clientName: {
    fontSize: 16,
    color: Colors.TEXT,
  },
  planTitle: {
    fontSize: 13,
    color: Colors.TEXT_SECONDARY,
  },
  statsGrid: {
    flexDirection: "row",
    gap: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: Colors.BORDER,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
    gap: 4,
  },
  statIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  statValue: {
    fontSize: 14,
    color: Colors.TEXT,
    fontWeight: "600",
  },
  statLabel: {
    fontSize: 10,
    color: Colors.TEXT_SECONDARY,
  },
  cardFooter: {
    flexDirection: "row",
    gap: 12,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: Colors.BORDER,
  },
  footerItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  footerText: {
    fontSize: 11,
    color: Colors.TEXT_SECONDARY,
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    color: Colors.TEXT_SECONDARY,
  },
  errorContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
    gap: 12,
  },
  errorText: {
    fontSize: 14,
    color: Colors.ERROR,
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
    gap: 12,
  },
  emptyTitle: {
    fontSize: 16,
    color: Colors.TEXT,
  },
  emptyText: {
    fontSize: 13,
    color: Colors.TEXT_SECONDARY,
    textAlign: "center",
  },
  viewAllButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    padding: 16,
    backgroundColor: Colors.CARD,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.BORDER,
    marginTop: 4,
  },
  viewAllText: {
    fontSize: 14,
    color: Colors.BRAND,
  },
});
