import React from "react";
import { View, StyleSheet, Pressable } from "react-native";
import { Feather } from "@expo/vector-icons";
import AppText from "@/components/ui/Text";
import Colors from "@/constants/Colors";

const WorkoutTab = ({ clientStats, onUpload }) => {
  return (
    <View style={styles.tabPanel}>
      <View style={styles.section}>
        <AppText font="Bold" style={styles.sectionTitle}>
          Workout Program
        </AppText>

        {clientStats?.hasWorkoutProgram ? (
          <View style={styles.workoutCard}>
            <View style={styles.workoutHeader}>
              <View style={styles.iconContainer}>
                <Feather name="file-text" size={32} color={Colors.SUCCESS} />
              </View>
              <View style={styles.workoutInfo}>
                <AppText font="SemiBold" style={styles.workoutTitle}>
                  {clientStats.workoutProgramType === "personalized"
                    ? "Custom Workout Program"
                    : "Default Workout Program"}
                </AppText>
                <AppText style={styles.workoutSubtitle}>
                  PDF uploaded and ready
                </AppText>
              </View>
            </View>

            <View style={styles.workoutDetails}>
              <View style={styles.detailRow}>
                <Feather name="check-circle" size={16} color={Colors.SUCCESS} />
                <AppText style={styles.detailText}>
                  {clientStats.workoutProgramType === "personalized"
                    ? "Personalized for this client"
                    : "Standard plan template"}
                </AppText>
              </View>
              <View style={styles.detailRow}>
                <Feather name="file" size={16} color={Colors.TEXT_SECONDARY} />
                <AppText style={styles.detailText}>PDF format</AppText>
              </View>
            </View>

            <Pressable style={styles.uploadNewBtn} onPress={onUpload}>
              <Feather name="upload" size={16} color={Colors.BRAND} />
              <AppText style={styles.uploadNewText}>Upload New PDF</AppText>
            </Pressable>
          </View>
        ) : (
          <View style={styles.noWorkoutCard}>
            <View style={styles.noWorkoutIcon}>
              <Feather name="alert-circle" size={48} color={Colors.WARNING} />
            </View>
            <AppText font="SemiBold" style={styles.noWorkoutTitle}>
              No Workout Program
            </AppText>
            <AppText style={styles.noWorkoutText}>
              Upload a personalized workout PDF for this client to help them
              achieve their fitness goals
            </AppText>
            <Pressable style={styles.uploadBtn} onPress={onUpload}>
              <Feather name="upload" size={20} color="black" />
              <AppText style={styles.uploadBtnText}>Upload PDF</AppText>
            </Pressable>
          </View>
        )}
      </View>

      {/* Info Section */}
      <View style={styles.section}>
        <AppText font="Bold" style={styles.sectionTitle}>
          About Workout Programs
        </AppText>
        <View style={styles.infoCard}>
          <View style={styles.infoItem}>
            <Feather name="info" size={16} color={Colors.PRIMARY} />
            <AppText style={styles.infoText}>
              Upload a custom PDF workout plan tailored to your client's needs
            </AppText>
          </View>
          <View style={styles.infoItem}>
            <Feather name="zap" size={16} color={Colors.WARNING} />
            <AppText style={styles.infoText}>
              Clients can view and download their workout program anytime
            </AppText>
          </View>
          <View style={styles.infoItem}>
            <Feather name="refresh-cw" size={16} color={Colors.SUCCESS} />
            <AppText style={styles.infoText}>
              Update the program as your client progresses
            </AppText>
          </View>
        </View>
      </View>
    </View>
  );
};

export default WorkoutTab;

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
  workoutCard: {
    backgroundColor: Colors.CARD,
    borderRadius: 12,
    padding: 20,
    gap: 16,
  },
  workoutHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: `${Colors.SUCCESS}20`,
    alignItems: "center",
    justifyContent: "center",
  },
  workoutInfo: {
    flex: 1,
    gap: 4,
  },
  workoutTitle: {
    fontSize: 16,
    color: Colors.TEXT,
  },
  workoutSubtitle: {
    fontSize: 13,
    color: Colors.TEXT_SECONDARY,
  },
  workoutDetails: {
    gap: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.BORDER,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  detailText: {
    fontSize: 13,
    color: Colors.TEXT_SECONDARY,
  },
  uploadNewBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    padding: 12,
    backgroundColor: Colors.SECONDARY,
    borderRadius: 8,
  },
  uploadNewText: {
    fontSize: 14,
    color: Colors.BRAND,
    fontWeight: "600",
  },
  noWorkoutCard: {
    backgroundColor: Colors.CARD,
    borderRadius: 12,
    padding: 32,
    alignItems: "center",
    gap: 16,
  },
  noWorkoutIcon: {
    marginBottom: 8,
  },
  noWorkoutTitle: {
    fontSize: 18,
    color: Colors.TEXT,
    textAlign: "center",
  },
  noWorkoutText: {
    fontSize: 14,
    color: Colors.TEXT_SECONDARY,
    textAlign: "center",
    lineHeight: 20,
  },
  uploadBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 24,
    paddingVertical: 14,
    backgroundColor: Colors.BRAND,
    borderRadius: 12,
    marginTop: 8,
  },
  uploadBtnText: {
    fontSize: 15,
    color: "black",
    fontWeight: "600",
  },
  infoCard: {
    backgroundColor: Colors.CARD,
    borderRadius: 12,
    padding: 16,
    gap: 16,
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: Colors.TEXT_SECONDARY,
    lineHeight: 18,
  },
});
