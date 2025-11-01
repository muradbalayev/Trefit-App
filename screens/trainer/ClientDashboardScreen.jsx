import React, { useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
  ActivityIndicator,
  Image,
} from "react-native";
import { Feather, FontAwesome6 } from "@expo/vector-icons";
import AppText from "@/components/ui/Text";
import Colors from "@/constants/Colors";
import { CustomScreen } from "@/components/common";
import { useGetDashboardClientsQuery } from "@/store/redux/trainer/services/trainerStatsApi";
import { useNavigate } from "@/hooks/useNavigation";
import { getAvatarUrl } from "@/constants/Paths";
import ScreenHeader from "@/components/common/ScreenHeader";
import FilterModal from "@/components/common/FilterModal";
import ClientCardSkeleton from "./TrainerHomePage/(components)/ClientCardSkeleton";

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

        <Feather name="chevron-right" size={20} color={Colors.TEXT_SECONDARY} />
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

const ClientDashboardScreen = () => {
  const { navigate, goBack } = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("active");
  const [weekFilter, setWeekFilter] = useState("all");
  const [showFilterModal, setShowFilterModal] = useState(false);

  const {
    data: clientsData,
    isLoading,
    error,
  } = useGetDashboardClientsQuery({
    status: statusFilter,
    limit: 100,
    search: searchQuery,
  });

  const clients = clientsData || [];

  // Apply local week filter only (search is done on backend)
  const filteredClients = clients.filter((client) => {
    const matchesWeek =
      weekFilter === "all" ||
      (weekFilter === "1-4" && client.currentWeek <= 4) ||
      (weekFilter === "5-8" &&
        client.currentWeek >= 5 &&
        client.currentWeek <= 8) ||
      (weekFilter === "9+" && client.currentWeek >= 9);

    return matchesWeek;
  });

  const handleClientPress = (client) => {
    navigate("ClientDetails", {
      clientId: client.clientId,
      enrollmentId: client.enrollmentId,
    });
  };

  const handleResetFilters = () => {
    setStatusFilter("active");
    setWeekFilter("all");
    setSearchQuery("");
  };

  const filterGroups = [
    {
      label: "Status",
      options: [
        {
          value: "active",
          label: "Active",
          active: statusFilter === "active",
          onPress: setStatusFilter,
        },
        {
          value: "completed",
          label: "Completed",
          active: statusFilter === "completed",
          onPress: setStatusFilter,
        },
        {
          value: "paused",
          label: "Paused",
          active: statusFilter === "paused",
          onPress: setStatusFilter,
        },
        {
          value: "all",
          label: "All",
          active: statusFilter === "all",
          onPress: setStatusFilter,
        },
      ],
    },
    {
      label: "Week Range",
      options: [
        {
          value: "all",
          label: "All Weeks",
          active: weekFilter === "all",
          onPress: setWeekFilter,
        },
        {
          value: "1-4",
          label: "Week 1-4",
          active: weekFilter === "1-4",
          onPress: setWeekFilter,
        },
        {
          value: "5-8",
          label: "Week 5-8",
          active: weekFilter === "5-8",
          onPress: setWeekFilter,
        },
        {
          value: "9+",
          label: "Week 9+",
          active: weekFilter === "9+",
          onPress: setWeekFilter,
        },
      ],
    },
  ];

  const activeFiltersCount = 
    (statusFilter !== "active" ? 1 : 0) + 
    (weekFilter !== "all" ? 1 : 0);

  return (
    <CustomScreen>
      <View style={styles.container}>
        {/* Header */}
        <ScreenHeader 
          title="Client Dashboard" 
          action={goBack}
          actionButton={
            <Pressable 
              style={styles.filterButton} 
              onPress={() => setShowFilterModal(true)}
            >
              <Feather name="filter" size={20} color={Colors.TEXT} />
              {activeFiltersCount > 0 && (
                <View style={styles.filterBadge}>
                  <AppText style={styles.filterBadgeText}>{activeFiltersCount}</AppText>
                </View>
              )}
            </Pressable>
          }
        />

        {/* <View style={styles.header}>
          <AppText font="Bold" style={styles.title}>
            Client Dashboard
          </AppText>
          <AppText style={styles.subtitle}>
            {filteredClients.length} {filteredClients.length === 1 ? "client" : "clients"}
          </AppText>
        </View> */}

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Feather name="search" size={20} color={Colors.TEXT_SECONDARY} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by name or username..."
            placeholderTextColor={Colors.TEXT_SECONDARY}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <Pressable onPress={() => setSearchQuery("")}>
              <Feather name="x" size={20} color={Colors.TEXT_SECONDARY} />
            </Pressable>
          )}
        </View>

        {/* Active Filters Display */}
        {activeFiltersCount > 0 && (
          <View style={styles.activeFiltersContainer}>
            <AppText style={styles.activeFiltersText}>
              {activeFiltersCount} filter{activeFiltersCount > 1 ? "s" : ""} active
            </AppText>
            <Pressable onPress={handleResetFilters}>
              <AppText style={styles.clearFiltersText}>Clear all</AppText>
            </Pressable>
          </View>
        )}

        {/* Client List */}
        {isLoading ? (
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {[1, 2, 3, 4, 5].map((i) => (
              <ClientCardSkeleton key={i} />
            ))}
          </ScrollView>
        ) : error ? (
          <View style={styles.errorContainer}>
            <Feather name="alert-circle" size={48} color={Colors.ERROR} />
            <AppText style={styles.errorText}>Failed to load clients</AppText>
          </View>
        ) : filteredClients.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Feather name="users" size={48} color={Colors.TEXT_SECONDARY} />
            <AppText style={styles.emptyTitle} font="SemiBold">
              No Clients Found
            </AppText>
            <AppText style={styles.emptyText}>
              {searchQuery || weekFilter !== "all"
                ? "Try adjusting your filters"
                : "Your clients will appear here once they enroll"}
            </AppText>
          </View>
        ) : (
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {filteredClients.map((client) => (
              <ClientCard
                key={client.enrollmentId}
                client={client}
                onPress={() => handleClientPress(client)}
              />
            ))}
          </ScrollView>
        )}
      </View>

      {/* Filter Modal */}
      <FilterModal
        visible={showFilterModal}
        onClose={() => setShowFilterModal(false)}
        title="Filter Clients"
        filterGroups={filterGroups}
        onReset={handleResetFilters}
      />
    </CustomScreen>
  );
};

export default ClientDashboardScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    color: Colors.TEXT,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.TEXT_SECONDARY,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.CARD,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: Colors.BORDER,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: Colors.TEXT,
  },
  filterButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: Colors.CARD,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: Colors.BORDER,
    position: "relative",
  },
  filterBadge: {
    position: "absolute",
    top: -4,
    right: -4,
    backgroundColor: Colors.BRAND,
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
  },
  filterBadgeText: {
    fontSize: 10,
    color: Colors.TEXT_BLACK,
    fontWeight: "600",
  },
  activeFiltersContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: Colors.CARD,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.BORDER,
  },
  activeFiltersText: {
    fontSize: 13,
    color: Colors.TEXT,
  },
  clearFiltersText: {
    fontSize: 13,
    color: Colors.BRAND,
    fontWeight: "600",
  },
  scrollContent: {
    gap: 12,
    paddingBottom: 80,
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
    color: Colors.TEXT_BLACK,
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
});
