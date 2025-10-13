import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  TextInput,
  RefreshControl,
  TouchableOpacity,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigate } from "@/hooks/useNavigation";
import Colors from "@/constants/Colors";
import Feather from "@expo/vector-icons/Feather";
import { CustomScreen, Loading } from "@/components/common";
import AppText from "@/components/ui/Text";
import { useGetMyClientsQuery } from "@/store/redux/trainer/services/trainerClientApi";
import { useGetMyPlansQuery } from "@/store/redux/trainer/services/trainerPlanApi";
import { getAvatarUrl } from "@/constants/Paths";
import HorizontalFilter from "@/components/common/HorizontalFilter";

const ClientsScreen = () => {
  const { navigate } = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedPlanId, setSelectedPlanId] = useState("all");
  const [page, setPage] = useState(1);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Get trainer's plans for filter dropdown
  const { data: plansResponse } = useGetMyPlansQuery({
    page: 1,
    limit: 100, // Get all plans for filter
  });

  // Get clients with plan filter
  const {
    data: clientsResponse,
    isLoading,
    error,
    refetch,
    isFetching,
  } = useGetMyClientsQuery({
    page,
    limit: 10,
    planId: selectedPlanId === "all" ? undefined : selectedPlanId,
    search: debouncedSearch || undefined,
  });
  console.log(clientsResponse);

  // Get real data
  const clients = clientsResponse?.data || [];
  const plans = plansResponse?.data || [];
  const totalClients = clientsResponse?.pagination?.total || 0;
  console.log(clients);
  // Filter plans for dropdown
  const planFilterOptions = [
    { label: "All Plans", value: "all" },
    ...plans.map((plan) => ({
      label: plan.title,
      value: plan.id || plan._id,
    })),
  ];

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  // Loading state
  if (isLoading) return <Loading />;

  // Error state
  if (error) {
    return (
      <CustomScreen>
        <View style={styles.errorContainer}>
          <Feather name="alert-circle" size={48} color={Colors.ERROR} />
          <AppText style={styles.errorText}>
            {error?.data?.message || "Failed to load clients"}
          </AppText>
          <Pressable style={styles.retryBtn} onPress={refetch}>
            <AppText style={styles.retryText}>Retry</AppText>
          </Pressable>
        </View>
      </CustomScreen>
    );
  }

  // Backend handles filtering, no need for client-side filter

  const getProgressColor = (progress) => {
    if (progress >= 80) return "#10B981";
    if (progress >= 50) return "#F59E0B";
    return "#EF4444";
  };

  const renderClientCard = ({ item: client }) => (
    <Pressable
      style={styles.clientCard}
      onPress={() => navigate("ClientDetails", { clientId: client._id })}
    >
      <View style={styles.clientHeader}>
        <View style={styles.avatarContainer}>
          {client?.avatar ? (
            <Image
              source={{
                uri: getAvatarUrl(client.avatar,'webp'),
              }}
              style={styles.avatar}
            />
          ) : (
            <View style={styles.clientAvatarPlaceholder}>
              <AppText style={styles.clientAvatarText}>
                {client.name?.charAt(0) || "U"}
              </AppText>
            </View>
          )}

        </View>
        <View style={styles.clientInfo}>
          <AppText style={styles.clientName}>
            {client.name || "Unknown"}
          </AppText>
          <AppText style={styles.clientUsername}>
            @{client.username || ""}
          </AppText>
          <AppText style={styles.joinedDate}>
            Joined {formatDate(client.joinedAt)}
          </AppText>
        </View>
        <View style={styles.clientActions}>
          <TouchableOpacity
            style={styles.messageButton}
            onPress={() =>
              navigate("ChatMessages", {
                recipientId: client._id,
                recipientName: client.name,
                recipientType: "client",
              })
            }
          >
            <Feather name="message-circle" size={20} color={Colors.BRAND} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.planInfo}>
        <AppText style={styles.currentPlanLabel}>Current Plan</AppText>
        <AppText style={styles.currentPlanName}>
          {client.currentPlan || "No plan"}
        </AppText>
      </View>

      {/* Progress section removed for MVP */}
    </Pressable>
  );

  const filterOptions = [
    { value: "all", label: "All Clients" },
    { value: "active", label: "Active" },
    { value: "completed", label: "Completed" },
  ];

  return (
    <CustomScreen>
      {/* Header */}

      <View style={styles.header}>
        <AppText style={styles.title} font="SemiBold">
          My Clients
        </AppText>
        <View style={styles.clientCount}>
          <AppText style={styles.clientCountText}>{totalClients}</AppText>
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Feather name="search" size={20} color={Colors.TEXT_SECONDARY} />
          <TextInput
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search clients..."
            placeholderTextColor={Colors.TEXT_SECONDARY}
          />
          {searchQuery.length > 0 && (
            <Pressable onPress={() => setSearchQuery("")}>
              <Feather name="x" size={20} color={Colors.TEXT_SECONDARY} />
            </Pressable>
          )}
        </View>
      </View>

      {/* Plan Filter */}
      <HorizontalFilter
        filters={planFilterOptions}
        selectedValue={selectedPlanId}
        onSelect={setSelectedPlanId}
      />

      {/* Clients List */}
      <FlatList
        data={clients}
        renderItem={renderClientCard}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.clientsList}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isFetching}
            onRefresh={refetch}
            tintColor={Colors.BRAND}
            colors={[Colors.BRAND]}
          />
        }
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <Feather name="users" size={48} color={Colors.TEXT_SECONDARY} />
            <AppText style={styles.emptyText}>No clients found</AppText>
            {selectedPlanId !== "all" && (
              <AppText style={styles.emptySubtext}>
                Try selecting a different plan or search term
              </AppText>
            )}
          </View>
        )}
      />
    </CustomScreen>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
  },
  title: {
    fontSize: 24,
    color: Colors.TEXT,
  },
  clientCount: {
    backgroundColor: Colors.BRAND,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  clientCountText: {
    fontSize: 14,
    color: "black",
    fontWeight: "600",
  },
  searchContainer: {
    marginBottom: 16,
  },
  searchInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.CARD,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: Colors.TEXT,
  },
  clientsList: {
    paddingBottom: 100,
  },
  clientCard: {
    backgroundColor: Colors.CARD,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  clientHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  avatarContainer: {
    position: "relative",
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: Colors.SECONDARY,
  },
  avatarText: {
    fontSize: 18,
    color: "black",
    fontWeight: "600",
  },
  clientAvatarPlaceholder: {
    width: 56,
    height: 56,
    borderRadius: 28,
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
    marginLeft: 12,
  },
  clientName: {
    fontSize: 18,
    color: Colors.TEXT,
    fontWeight: "600",
    marginBottom: 2,
  },
  clientUsername: {
    fontSize: 14,
    color: Colors.TEXT_SECONDARY,
    marginBottom: 2,
  },
  joinedDate: {
    fontSize: 12,
    color: Colors.TEXT_SECONDARY,
  },
  clientActions: {
    flexDirection: "row",
    gap: 8,
  },
  messageButton: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: Colors.BACKGROUND,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: Colors.SECONDARY,
  },
  planInfo: {
    marginTop: 12,
  },
  currentPlanLabel: {
    fontSize: 12,
    color: Colors.TEXT_SECONDARY,
    marginBottom: 4,
  },
  currentPlanName: {
    fontSize: 16,
    color: Colors.TEXT,
    fontWeight: "500",
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    color: Colors.TEXT_SECONDARY,
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: Colors.TEXT_SECONDARY,
    textAlign: "center",
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
    color: "black",
    fontWeight: "600",
  },
});

export default ClientsScreen;
