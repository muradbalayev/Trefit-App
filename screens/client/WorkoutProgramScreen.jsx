import React, { useState } from "react";
import { View, StyleSheet, ScrollView, Pressable, Alert, Linking } from "react-native";
import { useNavigate } from "@/hooks/useNavigation";
import { useSelector } from 'react-redux';
import Colors from "@/constants/Colors";
import Feather from "@expo/vector-icons/Feather";
import { CustomScreen, Loading } from "@/components/common";
import ScreenHeader from "@/components/common/ScreenHeader";
import AppText from "@/components/ui/Text";
import { useGetMyWorkoutProgramQuery } from "@/store/redux/user/services/userWorkoutProgramApi";
import { API_URL } from "@/constants/Variables";

const WorkoutProgramScreen = () => {
  const { navigate, goBack } = useNavigate();
  
  const { data, isLoading, error } = useGetMyWorkoutProgramQuery();

  const program = data?.program;
  const plan = data?.plan;
  const enrollment = data?.enrollment;

  const token = useSelector((state) => state.userAuth.accessToken);

  // Debug: Log file info
  React.useEffect(() => {
    if (program?.file) {
      console.log('Workout Program File Info:', {
        fileName: program.file.fileName,
        originalName: program.file.originalName,
        fileSize: program.file.fileSize,
        mimeType: program.file.mimeType
      });
    }
  }, [program]);

  const handleDownloadPDF = async () => {
    if (!program?._id || !token) return;
    
    try {
      // Build protected download URL with token as query param
      const downloadUrl = `${API_URL}/user/workout-program/download/${program._id}?token=${token}`;
      
      console.log('Opening download URL in browser');
      
      // Open in browser - browser will handle download
      const canOpen = await Linking.canOpenURL(downloadUrl);
      if (canOpen) {
        await Linking.openURL(downloadUrl);
      } else {
        Alert.alert("Xəta", "Fayl açıla bilmədi");
      }
      
    } catch (error) {
      console.error('Download error:', error);
      Alert.alert(
        "Xəta", 
        "Fayl yüklənə bilmədi. Zəhmət olmasa yenidən cəhd edin."
      );
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return "0 KB";
    const kb = bytes / 1024;
    if (kb < 1024) return `${kb.toFixed(0)} KB`;
    const mb = kb / 1024;
    return `${mb.toFixed(1)} MB`;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('az-AZ', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <CustomScreen>
        <ScreenHeader title="Workout Program" />
        <Loading />
      </CustomScreen>
    );
  }

  if (error?.data?.code === 'NO_PROGRAM') {
    return (
      <CustomScreen>
        <ScreenHeader title="Workout Program" />
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIcon}>
            <Feather name="file-text" size={64} color={Colors.GRAY} />
          </View>
          <AppText style={styles.emptyTitle}>Workout Program Not Found</AppText>
          <AppText style={styles.emptyText}>
            Traineriniz tezliklə proqramınızı hazırlayacaq
          </AppText>
        </View>
      </CustomScreen>
    );
  }

  return (
    <CustomScreen>
      <ScreenHeader title="Workout Program" action={goBack}/>
      
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
        {/* Personalized Banner */}
        {program?.isPersonalized && (
          <View style={styles.personalizedBanner}>
            <Feather name="star" size={20} color={Colors.WARNING} />
            <AppText style={styles.personalizedText}>
              This is a personalized program prepared just for you
            </AppText>
          </View>
        )}

        {/* Main PDF Card */}
        <Pressable 
          style={styles.mainCard} 
          onPress={handleDownloadPDF}
        >
          <View style={styles.pdfIconLarge}>
            <Feather name="file-text" size={48} color={Colors.PRIMARY} />
            {program?.version > 1 && (
              <View style={styles.versionBadge}>
                <AppText style={styles.versionText}>v{program.version}</AppText>
              </View>
            )}
          </View>
          
          <AppText style={styles.mainTitle}>{program?.title}</AppText>
          
          {program?.description && (
            <AppText style={styles.mainDescription}>{program.description}</AppText>
          )}
          
          <View style={styles.fileInfoBox}>
            <View style={styles.fileInfoItem}>
              <Feather name="file" size={16} color={Colors.TEXT_SECONDARY} />
              <AppText style={styles.fileInfoText} numberOfLines={1}>
                {program?.file?.originalName || program?.file?.fileName || "Workout Program.pdf"}
              </AppText>
            </View>
            {program?.file?.fileSize && (
              <View style={styles.fileInfoItem}>
                <Feather name="hard-drive" size={16} color={Colors.TEXT_SECONDARY} />
                <AppText style={styles.fileInfoText}>
                  {formatFileSize(program?.file?.fileSize)}
                </AppText>
              </View>
            )}
          </View>

          <View style={styles.openButton}>
            <Feather name="download" size={20} color={Colors.WHITE} />
            <AppText style={styles.openButtonText}>Download</AppText>
          </View>
        </Pressable>

        {/* Info Cards Grid */}
        <View style={styles.infoGrid}>
          <View style={styles.infoCard}>
            <View style={styles.infoIconContainer}>
              <Feather name="user" size={24} color={Colors.PRIMARY} />
            </View>
            <AppText style={styles.infoLabel}>Trainer</AppText>
            <AppText style={styles.infoValue}>{program?.createdBy?.name}</AppText>
          </View>

          <View style={styles.infoCard}>
            <View style={styles.infoIconContainer}>
              <Feather name="calendar" size={24} color={Colors.SUCCESS} />
            </View>
            <AppText style={styles.infoLabel}>Downloaded</AppText>
            <AppText style={styles.infoValue}>
              {new Date(program?.createdAt).toLocaleDateString('az-AZ', { 
                day: 'numeric',
                month: 'short' 
              })}
            </AppText>
          </View>
        </View>

        {/* Plan Info Card */}
        <View style={styles.planCard}>
          <View style={styles.planHeader}>
            <Feather name="activity" size={24} color={Colors.BRAND} />
            <AppText style={styles.planTitle}>{plan?.title}</AppText>
          </View>
          
          {plan?.description && (
            <AppText style={styles.planDescription}>{plan.description}</AppText>
          )}
          
          <View style={styles.progressBox}>
            <View style={styles.progressItem}>
              <AppText style={styles.progressLabel}>Cari Həftə</AppText>
              <AppText style={styles.progressValue}>{enrollment?.currentWeek || 1}</AppText>
            </View>
            <View style={styles.divider} />
            <View style={styles.progressItem}>
              <AppText style={styles.progressLabel}>Tamamlanmış</AppText>
              <AppText style={styles.progressValue}>{enrollment?.completedWeeks || 0}</AppText>
            </View>
          </View>
        </View>

        {/* Update Info */}
        {program?.updatedAt && program.updatedAt !== program.createdAt && (
          <View style={styles.updateBox}>
            <Feather name="refresh-cw" size={16} color={Colors.SUCCESS} />
            <AppText style={styles.updateText}>
              Son yenilənmə: {formatDate(program.updatedAt)}
            </AppText>
          </View>
        )}
      </ScrollView>
    </CustomScreen>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingVertical: 20,
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingBottom: 80,
  },
  personalizedBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: Colors.WARNING + "20",
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: Colors.WARNING,
  },
  personalizedText: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.WARNING,
    flex: 1,
  },
  mainCard: {
    backgroundColor: Colors.CARD,
    borderRadius: 20,
    padding: 24,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: Colors.BORDER,
    alignItems: "center",
  },
  pdfIconLarge: {
    width: 96,
    height: 96,
    borderRadius: 20,
    backgroundColor: Colors.PRIMARY + "20",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
    position: "relative",
  },
  versionBadge: {
    position: "absolute",
    top: -8,
    right: -8,
    backgroundColor: Colors.BRAND,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.CARD,
  },
  versionText: {
    fontSize: 12,
    fontWeight: "700",
    color: Colors.TEXT,
  },
  mainTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: Colors.TEXT,
    textAlign: "center",
    marginBottom: 8,
  },
  mainDescription: {
    fontSize: 14,
    color: Colors.TEXT_SECONDARY,
    textAlign: "center",
    marginBottom: 20,
    lineHeight: 20,
  },
  fileInfoBox: {
    width: "100%",
    backgroundColor: Colors.BACKGROUND,
    borderRadius: 12,
    padding: 12,
    gap: 8,
    marginBottom: 20,
  },
  fileInfoItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  fileInfoText: {
    fontSize: 13,
    color: Colors.TEXT_SECONDARY,
    flex: 1,
  },
  openButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.PRIMARY,
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 16,
    gap: 10,
    width: "100%",
    elevation: 4,
    shadowColor: Colors.PRIMARY,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  openButtonText: {
    fontSize: 17,
    fontWeight: "700",
    color: Colors.WHITE,
  },
  openButtonDisabled: {
    opacity: 0.7,
  },
  infoGrid: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 20,
  },
  infoCard: {
    flex: 1,
    backgroundColor: Colors.CARD,
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.BORDER,
  },
  infoIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: Colors.PRIMARY + "20",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  infoLabel: {
    fontSize: 12,
    color: Colors.TEXT_SECONDARY,
    marginBottom: 4,
    textAlign: "center",
  },
  infoValue: {
    fontSize: 15,
    fontWeight: "700",
    color: Colors.TEXT,
    textAlign: "center",
  },
  planCard: {
    backgroundColor: Colors.CARD,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: Colors.BORDER,
  },
  planHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 12,
  },
  planTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.TEXT,
    flex: 1,
  },
  planDescription: {
    fontSize: 14,
    color: Colors.TEXT_SECONDARY,
    lineHeight: 20,
    marginBottom: 16,
  },
  progressBox: {
    flexDirection: "row",
    backgroundColor: Colors.PRIMARY + "10",
    borderRadius: 12,
    padding: 16,
  },
  progressItem: {
    flex: 1,
    alignItems: "center",
  },
  progressLabel: {
    fontSize: 12,
    color: Colors.TEXT_SECONDARY,
    marginBottom: 6,
  },
  progressValue: {
    fontSize: 24,
    fontWeight: "700",
    color: Colors.PRIMARY,
  },
  divider: {
    width: 1,
    backgroundColor: Colors.BORDER,
    marginHorizontal: 16,
  },
  updateBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: Colors.SUCCESS + "15",
    padding: 12,
    borderRadius: 10,
    marginBottom: 100,
  },
  updateText: {
    fontSize: 13,
    color: Colors.TEXT_SECONDARY,
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
  },
  emptyIcon: {
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: Colors.DARK,
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 15,
    color: Colors.GRAY,
    textAlign: "center",
    lineHeight: 22,
  },
});

export default WorkoutProgramScreen;
