import React, { useState, useEffect } from "react";
import { 
  StyleSheet, 
  View, 
  FlatList, 
  Image, 
  Pressable, 
  TextInput,
  RefreshControl 
} from "react-native";
import { useNavigate } from "@/hooks/useNavigation";
import Colors from "@/constants/Colors";
import Feather from "@expo/vector-icons/Feather";
import AppText from "@/components/ui/Text";
import Card from "@/components/common/Card";
import Section from "@/components/common/Section";
import { CustomScreen, Loading } from "@/components/common";
import { useGetAllTrainersQuery } from "@/store/redux/user/services/userTrainerApi";
import { useSelector } from "react-redux";
import { getAvatarUrl } from "@/constants/Paths";

const TrainersScreen = () => {
  // All hooks must be at the top level - no conditional usage
  const { navigate } = useNavigate();
  const { user } = useSelector((state) => state.userAuth);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Check if user has a trainer
  const hasTrainer = Boolean(user?.trainerId);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 500); // 500ms delay

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Simple API call without complex caching
  const { 
    data: trainersResponse, 
    isLoading, 
    error,
    refetch,
    isFetching
  } = useGetAllTrainersQuery({
    page: 1, // Hələlik yalnız birinci səhifə
    limit: 20,
    search: debouncedSearch
  });

  // Use trainers directly from API  
  const trainers = trainersResponse || [];
  console.log(trainers)

  // Loading state for initial load
  if (isLoading) {
    return <Loading />;
  }

  // Error state
  if (error) {
    return (
      <CustomScreen>
        <View style={styles.errorContainer}>
          <Feather name="alert-circle" size={48} color={Colors.ERROR} />
          <AppText style={styles.errorText}>
            {error?.data?.message || 'Failed to load trainers'}
          </AppText>
          <Pressable style={styles.retryBtn} onPress={refetch}>
            <AppText style={styles.retryText}>Retry</AppText>
          </Pressable>
        </View>
      </CustomScreen>
    );
  }

  const handlePress = (trainer) => {
    navigate("TrainerDetails", { trainerId: trainer._id });
  };

  // Pull to refresh - simple function without useCallback
  const onRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refetch();
    } finally {
      setIsRefreshing(false);
    }
  };

  const renderTrainer = ({ item: trainer }) => (
    <Pressable
      onPress={() => handlePress(trainer)}
      style={{ marginBottom: 16 }}
    >
      <Card>
        <View style={styles.trainerRow}>
          <View style={styles.avatarContainer}>
            {trainer.avatar ? (
              <Image source={{ uri: getAvatarUrl(trainer.avatar,'webp') }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <AppText style={styles.avatarText}>
                  {trainer.name?.charAt(0) || 'T'}
                </AppText>
              </View>
            )}
          </View>
          <View style={{ flex: 1 }}>
            <AppText font="SemiBold" style={styles.name}>
              {trainer.name}
            </AppText>
            
            {trainer.specialty && (
              <AppText style={styles.specialty}>
                {trainer.specialty}
              </AppText>
            )}
            
            <View style={styles.trainerMeta}>
              {trainer.planCount > 0 && (
                <View style={styles.metaItem}>
                  <Feather name="clipboard" size={12} color={Colors.TEXT_SECONDARY} />
                  <AppText style={styles.metaText}>
                    {trainer.planCount} plans
                  </AppText>
                </View>
              )}
              
              {trainer.experienceYears > 0 && (
                <View style={styles.metaItem}>
                  <Feather name="briefcase" size={12} color={Colors.TEXT_SECONDARY} />
                  <AppText style={styles.metaText}>
                    {trainer.experienceYears}y exp.
                  </AppText>
                </View>
              )}
              
              {trainer.workPlace && (
                <View style={styles.metaItem}>
                  <Feather name="map-pin" size={12} color={Colors.TEXT_SECONDARY} />
                  <AppText style={styles.metaText} numberOfLines={1}>
                    {trainer.workPlace}
                  </AppText>
                </View>
              )}
            </View>
          </View>
          <Feather name="chevron-right" size={20} color={Colors.TEXT_SECONDARY} />
        </View>
      </Card>
    </Pressable>
  );


  return (
    <CustomScreen>
      <Section>
        <View style={styles.header}>
          <AppText font="Bold" style={styles.headerTitle}>
            {hasTrainer ? "Explore More Trainers" : "Unlock your potential"}
          </AppText>
          <AppText style={styles.headerSubtitle}>
            {hasTrainer 
              ? "Discover additional trainers and plans to enhance your fitness journey."
              : "Match with expert trainers. Choose a plan, start chatting, and begin your transformation."
            }
          </AppText>
        </View>

        {/* Search */}
        <View style={styles.searchContainer}>
          <View style={styles.searchInputContainer}>
            <Feather name="search" size={20} color={Colors.TEXT_SECONDARY} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search trainers..."
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
        </View>

        {/* Trainers List */}
        <FlatList
          data={trainers}
          renderItem={renderTrainer}
          keyExtractor={(item) => item._id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.trainersList}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={onRefresh}
              colors={[Colors.BRAND]}
            />
          }
          ListEmptyComponent={() => (
            <View style={styles.emptyContainer}>
              <Feather name="users" size={48} color={Colors.TEXT_SECONDARY} />
              <AppText style={styles.emptyText}>
                {debouncedSearch ? "No trainers found" : "No trainers available"}
              </AppText>
              <AppText style={styles.emptySubtext}>
                {debouncedSearch 
                  ? "Try adjusting your search criteria" 
                  : "Check back later for new trainers"
                }
              </AppText>
            </View>
          )}
        />
      </Section>
    </CustomScreen>
  );
};

const styles = StyleSheet.create({
  header: {
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 28,
    color: Colors.TEXT,
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: Colors.TEXT_SECONDARY,
    lineHeight: 22,
  },
  searchContainer: {
    marginBottom: 20,
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
  trainersList: {
    paddingBottom: 100,
  },
  trainerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  avatarContainer: {
    width: 60,
    height: 60,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: Colors.PRIMARY + '20',
  },
  avatarPlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.PRIMARY,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontSize: 20,
    color: Colors.WHITE,
    fontWeight: "600",
  },
  name: {
    fontSize: 16,
    color: Colors.TEXT,
    marginBottom: 4,
  },
  specialty: {
    fontSize: 13,
    color: Colors.PRIMARY,
    marginBottom: 8,
  },
  trainerMeta: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 12,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  metaText: {
    fontSize: 11,
    color: Colors.TEXT_SECONDARY,
  },
  footerLoader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 20,
    gap: 8,
  },
  loadingText: {
    fontSize: 14,
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
    color: Colors.ERROR,
    marginTop: 16,
    marginBottom: 20,
  },
  retryBtn: {
    backgroundColor: Colors.BRAND,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  retryText: {
    fontSize: 14,
    color: "black",
    fontWeight: "600",
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    color: Colors.TEXT,
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: Colors.TEXT_SECONDARY,
    textAlign: "center",
  },
});

export default TrainersScreen;
