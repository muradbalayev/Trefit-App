import React from "react";
import { View, StyleSheet, Image } from "react-native";
import AppText from "@/components/ui/Text";
import Colors from "@/constants/Colors";
import { Feather } from "@expo/vector-icons";
import { getProgressPhotoUrl } from "@/constants/Paths";

const PhotoGrid = ({ weekData, selectedWeek }) => {
  if (!weekData || weekData.photos.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Feather name="camera-off" size={48} color={Colors.TEXT_SECONDARY} />
        <AppText style={styles.emptyText}>
          No photos uploaded for Week {selectedWeek}
        </AppText>
      </View>
    );
  }

  const photoTypes = ["front", "back", "left", "right"];

  return (
    <View style={styles.photoGrid}>
      {photoTypes.map((type) => {
        const photo = weekData.photos.find((p) => p.type === type);

        return (
          <View key={type} style={styles.photoSlot}>
            <AppText style={styles.photoLabel}>
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </AppText>
            {photo ? (
              <Image
                source={{ uri: getProgressPhotoUrl(photo.filename) }}
                style={styles.photoImage}
                resizeMode="cover"
              />
            ) : (
              <View style={styles.emptyPhotoSlot}>
                <Feather name="image" size={32} color={Colors.TEXT_SECONDARY} />
                <AppText style={styles.emptyPhotoText}>Not uploaded</AppText>
              </View>
            )}
          </View>
        );
      })}
    </View>
  );
};

export default PhotoGrid;

const styles = StyleSheet.create({
  photoGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  photoSlot: {
    width: "48%",
    aspectRatio: 3 / 4,
  },
  photoLabel: {
    fontSize: 12,
    color: Colors.TEXT_SECONDARY,
    marginBottom: 6,
    textTransform: "capitalize",
  },
  photoImage: {
    width: "100%",
    height: "100%",
    borderRadius: 12,
    backgroundColor: Colors.CARD,
  },
  emptyPhotoSlot: {
    width: "100%",
    height: "100%",
    borderRadius: 12,
    backgroundColor: Colors.CARD,
    borderWidth: 1,
    borderColor: Colors.BORDER,
    borderStyle: "dashed",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  emptyPhotoText: {
    fontSize: 11,
    color: Colors.TEXT_SECONDARY,
  },
  emptyContainer: {
    padding: 40,
    alignItems: "center",
    gap: 12,
  },
  emptyText: {
    fontSize: 14,
    color: Colors.TEXT_SECONDARY,
    textAlign: "center",
  },
});
