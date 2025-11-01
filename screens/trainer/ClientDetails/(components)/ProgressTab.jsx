import React from "react";
import {
  View,
  StyleSheet,
  Image,
  Pressable,
  ActivityIndicator,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import AppText from "@/components/ui/Text";
import Colors from "@/constants/Colors";
import { useGetClientProgressPhotosQuery } from "@/store/redux/trainer/services/trainerClientApi";
import { getProgressPhotoUrl } from "@/constants/Paths";

const WeekPhotos = ({ weekData, onViewAll }) => {
  return (
    <View style={styles.weekContainer}>
      <View style={styles.weekHeader}>
        <AppText font="SemiBold" style={styles.weekTitle}>
          Week {weekData.week}
        </AppText>
        {weekData.photos.length > 2 && (
          <Pressable onPress={onViewAll}>
            <AppText style={styles.viewAllLink}>View All</AppText>
          </Pressable>
        )}
      </View>

      <View style={styles.photoGrid}>
        {weekData.photos.slice(0, 2).map((photo, idx) => (
          <View key={idx} style={styles.photoItem}>
            <Image
              source={{ uri: getProgressPhotoUrl(photo.filename) }}
              style={styles.photoImage}
            />
            <View style={styles.photoOverlay}>
              <AppText style={styles.photoType}>{photo.type}</AppText>
            </View>
          </View>
        ))}
        {weekData.photos.length > 2 && (
          <Pressable style={styles.morePhotos} onPress={onViewAll}>
            <Feather name="plus" size={24} color={Colors.TEXT} />
            <AppText style={styles.moreText}>
              +{weekData.photos.length - 2}
            </AppText>
          </Pressable>
        )}
      </View>
    </View>
  );
};

const ProgressTab = ({ clientId, enrollmentId, onViewAllPhotos }) => {
  const {
    data: progressData,
    isLoading,
    error,
  } = useGetClientProgressPhotosQuery(clientId);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.BRAND} />
        <AppText style={styles.loadingText}>Loading progress photos...</AppText>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Feather name="alert-circle" size={48} color={Colors.ERROR} />
        <AppText style={styles.errorText}>Failed to load progress photos</AppText>
      </View>
    );
  }

  const weeklyPhotos = progressData?.weeklyPhotos || [];

  if (weeklyPhotos.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Feather name="camera" size={48} color={Colors.TEXT_SECONDARY} />
        <AppText font="SemiBold" style={styles.emptyTitle}>
          No Progress Photos
        </AppText>
        <AppText style={styles.emptyText}>
          Client hasn't uploaded any progress photos yet
        </AppText>
      </View>
    );
  }

  // Get last 2 weeks
  const lastTwoWeeks = weeklyPhotos.slice(-2).reverse();

  return (
    <View style={styles.tabPanel}>
      <View style={styles.section}>
        <AppText font="Bold" style={styles.sectionTitle}>
          Recent Progress Photos
        </AppText>
        <AppText style={styles.sectionSubtitle}>
          Showing last 2 weeks of progress
        </AppText>

        <View style={styles.weeksList}>
          {lastTwoWeeks.map((weekData) => (
            <WeekPhotos
              key={weekData.week}
              weekData={weekData}
              onViewAll={() => onViewAllPhotos?.(weekData.week)}
            />
          ))}
        </View>

        {weeklyPhotos.length > 2 && (
          <Pressable
            style={styles.viewAllButton}
            onPress={() => onViewAllPhotos?.("all")}
          >
            <AppText style={styles.viewAllButtonText}>
              View All Progress Photos
            </AppText>
            <Feather name="arrow-right" size={16} color={Colors.BRAND} />
          </Pressable>
        )}
      </View>

      {/* Progress Summary */}
      <View style={styles.section}>
        <AppText font="Bold" style={styles.sectionTitle}>
          Progress Summary
        </AppText>
        <View style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <Feather name="calendar" size={20} color={Colors.PRIMARY} />
              <AppText style={styles.summaryLabel}>Total Weeks</AppText>
              <AppText font="SemiBold" style={styles.summaryValue}>
                {weeklyPhotos.length}
              </AppText>
            </View>
            <View style={styles.summaryItem}>
              <Feather name="image" size={20} color={Colors.SUCCESS} />
              <AppText style={styles.summaryLabel}>Total Photos</AppText>
              <AppText font="SemiBold" style={styles.summaryValue}>
                {weeklyPhotos.reduce(
                  (sum, week) => sum + week.photos.length,
                  0
                )}
              </AppText>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
};

export default ProgressTab;

const styles = StyleSheet.create({
  tabPanel: {
    gap: 16,
    paddingBottom: 40,
  },
  section: {
    gap: 12,
  },
  sectionTitle: {
    fontSize: 16,
    color: Colors.TEXT,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: Colors.TEXT_SECONDARY,
  },
  weeksList: {
    gap: 16,
  },
  weekContainer: {
    backgroundColor: Colors.CARD,
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },
  weekHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  weekTitle: {
    fontSize: 15,
    color: Colors.TEXT,
  },
  viewAllLink: {
    fontSize: 13,
    color: Colors.BRAND,
  },
  photoGrid: {
    flexDirection: "row",
    gap: 8,
  },
  photoItem: {
    flex: 1,
    aspectRatio: 3 / 4,
    borderRadius: 8,
    overflow: "hidden",
    position: "relative",
  },
  photoImage: {
    width: "100%",
    height: "100%",
  },
  photoOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(0,0,0,0.6)",
    padding: 8,
  },
  photoType: {
    fontSize: 11,
    color: Colors.TEXT,
    textTransform: "capitalize",
    textAlign: "center",
  },
  morePhotos: {
    flex: 1,
    aspectRatio: 3 / 4,
    borderRadius: 8,
    backgroundColor: Colors.SECONDARY,
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
  moreText: {
    fontSize: 13,
    color: Colors.TEXT,
    fontWeight: "600",
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
  },
  viewAllButtonText: {
    fontSize: 14,
    color: Colors.BRAND,
    fontWeight: "600",
  },
  summaryCard: {
    backgroundColor: Colors.CARD,
    borderRadius: 12,
    padding: 16,
  },
  summaryRow: {
    flexDirection: "row",
    gap: 16,
  },
  summaryItem: {
    flex: 1,
    alignItems: "center",
    gap: 8,
  },
  summaryLabel: {
    fontSize: 12,
    color: Colors.TEXT_SECONDARY,
    textAlign: "center",
  },
  summaryValue: {
    fontSize: 18,
    color: Colors.TEXT,
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
