import React, { useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { CustomScreen } from "@/components/common";
import ScreenHeader from "@/components/common/ScreenHeader";
import AppText from "@/components/ui/Text";
import Colors from "@/constants/Colors";
import { Feather } from "@expo/vector-icons";
import { useSelector } from "react-redux";
import {
  useGetProgressPhotosQuery,
  useUploadProgressPhotoMutation,
  useDeleteProgressPhotoMutation,
  useMoveToNextWeekMutation,
} from "@/store/redux/user/services/userProgressApi";
import * as ImagePicker from "expo-image-picker";
import { getProgressPhotoUrl } from "@/constants/Paths";

const BodyProgressScreen = ({ navigation }) => {
  const { haveTrainer } = useSelector((state) => state.userAuth);
  const {
    data: progressData,
    isLoading,
    refetch,
    isFetching,
  } = useGetProgressPhotosQuery();
  const [uploadPhoto, { isLoading: isUploading }] =
    useUploadProgressPhotoMutation();
  const [deletePhoto, { isLoading: isDeleting }] =
    useDeleteProgressPhotoMutation();
  const [moveToNextWeek] = useMoveToNextWeekMutation();

  console.log("Progress Data:", progressData);

  const [selectedWeek, setSelectedWeek] = useState(null);

  const isPremium = !!haveTrainer;
  const maxPhotosPerWeek = isPremium ? 4 : 2;
  const photoTypes = isPremium
    ? ["front", "back", "left", "right"]
    : ["front", "back"];

  const currentWeek = progressData?.currentWeek || 1;
  const weeklyPhotos = progressData?.weeklyPhotos || [];

  // Set selected week to current week on load
  React.useEffect(() => {
    if (currentWeek && !selectedWeek) {
      setSelectedWeek(currentWeek);
    }
  }, [currentWeek]);

  const selectedWeekData = weeklyPhotos.find((w) => w.week === selectedWeek);
  const isCurrentWeek = selectedWeek === currentWeek;
  const isLocked = selectedWeekData?.locked || false;

  const handlePickImage = async (type) => {
    if (!isCurrentWeek) {
      Alert.alert("Info", "You can only upload photos for the current week");
      return;
    }

    if (isLocked) {
      Alert.alert(
        "Info",
        "This week is locked. Move to next week to continue."
      );
      return;
    }

    // Request permission
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission Required",
        "Please grant camera roll permissions to upload photos"
      );
      return;
    }

    // Pick image
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [3, 4],
      quality: 0.8,
    });

    if (result.canceled) return;

    const asset = result.assets[0];

    try {
      await uploadPhoto({
        photo: {
          uri: asset.uri,
          type: "image/jpeg",
          fileName: `progress-${Date.now()}.jpg`,
        },
        type,
      }).unwrap();

      Alert.alert("Success", "Photo uploaded successfully!");
    } catch (error) {
      console.error("Upload error:", error);
      Alert.alert("Error", error?.data?.message || "Failed to upload photo");
    }
  };

  const handleDeletePhoto = (photoId) => {
    if (!isCurrentWeek) {
      Alert.alert("Info", "You can only delete photos from the current week");
      return;
    }

    Alert.alert("Delete Photo", "Are you sure you want to delete this photo?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await deletePhoto(photoId).unwrap();
            Alert.alert("Success", "Photo deleted successfully");
          } catch (error) {
            Alert.alert("Error", "Failed to delete photo");
          }
        },
      },
    ]);
  };

  const handleMoveToNextWeek = () => {
    Alert.alert(
      "Move to Next Week",
      "This will lock current week photos. You won't be able to edit them. Continue?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Continue",
          onPress: async () => {
            try {
              await moveToNextWeek().unwrap();
              setSelectedWeek(currentWeek + 1);
              Alert.alert("Success", `Moved to Week ${currentWeek + 1}`);
            } catch (error) {
              Alert.alert("Error", "Failed to move to next week");
            }
          },
        },
      ]
    );
  };

  const getPhotoForType = (type) => {
    return selectedWeekData?.photos?.find((p) => p.type === type);
  };

  if (isLoading) {
    return (
      <CustomScreen>
        <ScreenHeader
          title="Body Progress"
          action={() => navigation.goBack()}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.BRAND} />
        </View>
      </CustomScreen>
    );
  }

  return (
    <CustomScreen>
      <ScreenHeader title="Body Progress" action={() => navigation.goBack()} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={isFetching}
            onRefresh={refetch}
            tintColor={Colors.BRAND}
          />
        }
      >
        {/* Header Info */}
        <View style={styles.headerCard}>
          <View style={styles.headerRow}>
            <View>
              <AppText font="Bold" style={styles.currentWeekText}>
                Week {currentWeek}
              </AppText>
              <AppText style={styles.currentWeekLabel}>Current Week</AppText>
            </View>
            {!isPremium && (
              <View style={styles.limitBadge}>
                <AppText style={styles.limitText}>
                  {maxPhotosPerWeek} photos/week
                </AppText>
              </View>
            )}
          </View>

          {isPremium && (
            <View style={styles.premiumBadge}>
              <Feather name="star" size={14} color="gold" />
              <AppText style={styles.premiumText}>
                Premium - 4 photos/week
              </AppText>
            </View>
          )}
        </View>

        {/* Week Selector */}
        {weeklyPhotos.length > 0 && (
          <View style={styles.weekSelector}>
            <AppText font="SemiBold" style={styles.selectorTitle}>
              Select Week
            </AppText>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.weekButtons}>
                {weeklyPhotos.map((weekData) => (
                  <TouchableOpacity
                    key={weekData.week}
                    style={[
                      styles.weekButton,
                      selectedWeek === weekData.week && styles.weekButtonActive,
                    ]}
                    onPress={() => setSelectedWeek(weekData.week)}
                  >
                    <AppText
                      style={[
                        styles.weekButtonText,
                        selectedWeek === weekData.week &&
                          styles.weekButtonTextActive,
                      ]}
                    >
                      Week {weekData.week}
                    </AppText>
                    {weekData.locked && (
                      <Feather
                        name="lock"
                        size={12}
                        color={
                          selectedWeek === weekData.week
                            ? Colors.TEXT
                            : Colors.TEXT_SECONDARY
                        }
                      />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>
        )}

        {/* Photo Grid */}
        {selectedWeekData ? (
          <View style={styles.photoSection}>
            <View style={styles.photoHeader}>
              <AppText font="Bold" style={styles.photoTitle}>
                Week {selectedWeek} Photos
              </AppText>
              {isLocked && (
                <View style={styles.lockedBadge}>
                  <Feather
                    name="lock"
                    size={12}
                    color={Colors.TEXT_SECONDARY}
                  />
                  <AppText style={styles.lockedText}>Locked</AppText>
                </View>
              )}
            </View>

            <View style={styles.photoGrid}>
              {photoTypes.map((type) => {
                const photo = getPhotoForType(type);
                return (
                  <View key={type} style={styles.photoSlot}>
                    <View style={styles.photoTypeHeader}>
                      <AppText style={styles.photoTypeLabel}>
                        {type.toUpperCase()}
                      </AppText>
                    </View>

                    {photo ? (
                      <View style={styles.photoContainer}>
                        <Image
                          source={{ uri: getProgressPhotoUrl(photo.filename) }}
                          style={styles.photoImage}
                        />
                        {isCurrentWeek && !isLocked && (
                          <View style={styles.photoActions}>
                            <TouchableOpacity
                              style={styles.actionBtn}
                              onPress={() => handlePickImage(type)}
                              disabled={isUploading}
                            >
                              <Feather name="edit-2" size={16} color="white" />
                            </TouchableOpacity>
                            <TouchableOpacity
                              style={[styles.actionBtn, styles.deleteBtn]}
                              onPress={() => handleDeletePhoto(photo._id)}
                              disabled={isDeleting}
                            >
                              <Feather name="trash-2" size={16} color="white" />
                            </TouchableOpacity>
                          </View>
                        )}
                      </View>
                    ) : (
                      <TouchableOpacity
                        style={styles.emptySlot}
                        onPress={() => handlePickImage(type)}
                        disabled={!isCurrentWeek || isLocked || isUploading}
                      >
                        {isUploading ? (
                          <ActivityIndicator
                            size="small"
                            color={Colors.BRAND}
                          />
                        ) : (
                          <>
                            <Feather
                              name="camera"
                              size={32}
                              color={Colors.TEXT_SECONDARY}
                            />
                            <AppText style={styles.emptySlotText}>
                              {isCurrentWeek && !isLocked
                                ? "Add Photo"
                                : "No Photo"}
                            </AppText>
                          </>
                        )}
                      </TouchableOpacity>
                    )}
                  </View>
                );
              })}
            </View>

            {/* Move to Next Week Button */}
            {isCurrentWeek &&
              !isLocked &&
              selectedWeekData?.photos?.length > 0 && (
                <TouchableOpacity
                  style={styles.nextWeekBtn}
                  onPress={handleMoveToNextWeek}
                >
                  <AppText style={styles.nextWeekText}>
                    Move to Next Week
                  </AppText>
                  <Feather
                    name="arrow-right"
                    size={16}
                    color={Colors.TEXT_BLACK}
                  />
                </TouchableOpacity>
              )}
          </View>
        ) : (
          <View style={styles.emptyState}>
            <Feather name="camera" size={64} color={Colors.TEXT_SECONDARY} />
            <AppText font="Bold" style={styles.emptyTitle}>
              Start Your Journey
            </AppText>
            <AppText style={styles.emptySubtitle}>
              Upload your first {maxPhotosPerWeek} photos to track your progress
            </AppText>
            <View style={styles.photoGrid}>
              {photoTypes.map((type) => (
                <View key={type} style={styles.photoSlot}>
                  <View style={styles.photoTypeHeader}>
                    <AppText style={styles.photoTypeLabel}>
                      {type.toUpperCase()}
                    </AppText>
                  </View>
                  <TouchableOpacity
                    style={styles.emptySlot}
                    onPress={() => handlePickImage(type)}
                    disabled={isUploading}
                  >
                    {isUploading ? (
                      <ActivityIndicator size="small" color={Colors.BRAND} />
                    ) : (
                      <>
                        <Feather
                          name="camera"
                          size={32}
                          color={Colors.TEXT_SECONDARY}
                        />
                        <AppText style={styles.emptySlotText}>
                          Add Photo
                        </AppText>
                      </>
                    )}
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Upgrade Banner for Free Users */}
        {!isPremium && (
          <View style={styles.upgradeBanner}>
            <Feather name="star" size={24} color="gold" />
            <View style={styles.upgradeContent}>
              <AppText font="Bold" style={styles.upgradeTitle}>
                Upgrade to Premium
              </AppText>
              <AppText style={styles.upgradeText}>
                Get 4 photos per week, trainer feedback, and advanced comparison
                tools
              </AppText>
            </View>
            <TouchableOpacity
              style={styles.upgradeBtn}
              onPress={() => navigation.navigate("Trainers")}
            >
              <AppText style={styles.upgradeBtnText}>Get Trainer</AppText>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </CustomScreen>
  );
};

export default BodyProgressScreen;

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  scrollContent: {
    paddingBottom: 60,
  },
  headerCard: {
    backgroundColor: Colors.CARD,
    padding: 20,
    borderRadius: 16,
    marginBottom: 20,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  currentWeekText: {
    fontSize: 28,
    color: Colors.TEXT,
  },
  currentWeekLabel: {
    fontSize: 12,
    color: Colors.TEXT_SECONDARY,
    marginTop: 4,
  },
  limitBadge: {
    backgroundColor: Colors.SECONDARY,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  limitText: {
    fontSize: 11,
    color: Colors.TEXT,
    fontWeight: "600",
  },
  premiumBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.BORDER,
  },
  premiumText: {
    fontSize: 12,
    color: Colors.TEXT_SECONDARY,
  },
  weekSelector: {
    marginBottom: 20,
  },
  selectorTitle: {
    fontSize: 14,
    color: Colors.TEXT,
    marginBottom: 12,
  },
  weekButtons: {
    flexDirection: "row",
    gap: 8,
  },
  weekButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: Colors.CARD,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.BORDER,
  },
  weekButtonActive: {
    backgroundColor: Colors.BRAND,
    borderColor: Colors.BRAND,
  },
  weekButtonText: {
    fontSize: 13,
    color: Colors.TEXT_SECONDARY,
    fontWeight: "600",
  },
  weekButtonTextActive: {
    color: Colors.TEXT_BLACK,
  },
  photoSection: {
    marginBottom: 20,
  },
  photoHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  photoTitle: {
    fontSize: 18,
    color: Colors.TEXT,
  },
  lockedBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: Colors.SECONDARY,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  lockedText: {
    fontSize: 11,
    color: Colors.TEXT_SECONDARY,
  },
  photoGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  photoSlot: {
    width: "48%",
  },
  photoTypeHeader: {
    marginBottom: 8,
  },
  photoTypeLabel: {
    fontSize: 11,
    color: Colors.TEXT_SECONDARY,
    fontWeight: "600",
  },
  photoContainer: {
    position: "relative",
    aspectRatio: 3 / 4,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: Colors.SECONDARY,
  },
  photoImage: {
    width: "100%",
    height: "100%",
  },
  photoActions: {
    position: "absolute",
    top: 8,
    right: 8,
    flexDirection: "row",
    gap: 8,
  },
  actionBtn: {
    backgroundColor: "rgba(0,0,0,0.6)",
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  deleteBtn: {
    backgroundColor: "rgba(220,38,38,0.8)",
  },
  emptySlot: {
    aspectRatio: 3 / 4,
    backgroundColor: Colors.CARD,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.BORDER,
    borderStyle: "dashed",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  emptySlotText: {
    fontSize: 12,
    color: Colors.TEXT_SECONDARY,
  },
  nextWeekBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: Colors.PRIMARY,
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 20,
  },
  nextWeekText: {
    fontSize: 14,
    color: Colors.TEXT_BLACK,
    fontWeight: "600",
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyTitle: {
    fontSize: 20,
    color: Colors.TEXT,
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 13,
    color: Colors.TEXT_SECONDARY,
    textAlign: "center",
    marginTop: 8,
    marginBottom: 32,
    paddingHorizontal: 40,
  },
  upgradeBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: Colors.CARD,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "gold",
  },
  upgradeContent: {
    flex: 1,
  },
  upgradeTitle: {
    fontSize: 14,
    color: Colors.TEXT,
    marginBottom: 4,
  },
  upgradeText: {
    fontSize: 11,
    color: Colors.TEXT_SECONDARY,
  },
  upgradeBtn: {
    backgroundColor: "gold",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  upgradeBtnText: {
    fontSize: 12,
    color: "black",
    fontWeight: "600",
  },
});
