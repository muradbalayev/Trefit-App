import React, { useState } from "react";
import { View, StyleSheet, ScrollView, Alert, Pressable, Image } from "react-native";
import * as ImagePicker from 'expo-image-picker';
import { useNavigate } from "@/hooks/useNavigation";
import Colors from "@/constants/Colors";
import Feather from "@expo/vector-icons/Feather";
import { CustomScreen, Loading, Input } from "@/components/common";
import ScreenHeader from "@/components/common/ScreenHeader";
import Section from "@/components/common/Section";
import AppText from "@/components/ui/Text";
import { useGetTaskDetailsQuery, useCompleteTaskMutation, useUpdateTaskStatusMutation } from "@/store/redux/user/services/userTaskApi";
import { IMAGE_URL } from "@/constants/Variables";

const TaskDetailScreen = ({ route }) => {
  const { navigate, goBack } = useNavigate();
  const { taskId } = route?.params || {};
  
  const { data: task, isLoading } = useGetTaskDetailsQuery(taskId, {
    skip: !taskId
  });
  console.log(task)
  
  const [completeTask, { isLoading: isCompleting }] = useCompleteTaskMutation();
  const [updateStatus] = useUpdateTaskStatusMutation();
  
  const [selectedImages, setSelectedImages] = useState([]);
  const [notes, setNotes] = useState("");

  const isCompleted = task?.status === "completed";
  const isPending = task?.status === "pending";

  const getTimeRemaining = (deadlineDate, status) => {
    // If completed, don't show overdue
    if (status === "completed") return { text: "Completed", color: Colors.SUCCESS };
    const now = new Date();
    const deadline = new Date(deadlineDate);
    const diff = deadline - now;
    const hours = Math.floor(diff / (1000 * 60 * 60));

    if (diff < 0) return { text: "Overdue", color: Colors.DANGER };
    if (hours < 2) return { text: `${hours} hour${hours > 1 ? 's' : ''} left`, color: Colors.DANGER };
    if (hours < 24) return { text: `${hours} hour${hours > 1 ? 's' : ''} left`, color: Colors.WARNING };
    const days = Math.floor(hours / 24);
    return { text: `${days} day${days > 1 ? 's' : ''} left`, color: Colors.TEXT_SECONDARY };
  };

  const pickImages = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('İcazə', 'Şəkil seçmək üçün icazə lazımdır');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        quality: 0.8,
        selectionLimit: 10 - selectedImages.length,
      });

      if (!result.canceled && result.assets) {
        setSelectedImages([...selectedImages, ...result.assets]);
      }
    } catch (error) {
      console.error('Image picker error:', error);
    }
  };

  const takePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('İcazə', 'Kamera istifadəsi üçün icazə lazımdır');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        quality: 0.8,
      });

      if (!result.canceled && result.assets) {
        setSelectedImages([...selectedImages, ...result.assets]);
      }
    } catch (error) {
      console.error('Camera error:', error);
    }
  };

  const removeImage = (index) => {
    setSelectedImages(selectedImages.filter((_, i) => i !== index));
  };

  const handleMarkInProgress = async () => {
    try {
      await updateStatus({ taskId, status: "in_progress" }).unwrap();
      Alert.alert("Uğurlu", "Task başladı");
    } catch (error) {
      Alert.alert("Xəta", error?.data?.message || "Xəta baş verdi");
    }
  };

  const handleComplete = async () => {
    // For photo tasks, require at least 1 image
    if (task?.type === 'photo' && selectedImages.length === 0) {
      Alert.alert("Error", "Please upload at least 1 photo");
      return;
    }

    try {
      const formData = new FormData();
      
      // IMPORTANT: Always append notes first (even if empty) for FormData to work
      formData.append('notes', notes.trim() || '');
      
      // Add images only if photo task
      if (task?.type === 'photo' && selectedImages.length > 0) {
        selectedImages.forEach((image, index) => {
          formData.append('media', {
            uri: image.uri,
            name: `task_${taskId}_${index}.jpg`,
            type: 'image/jpeg',
          });
        });
      }

      console.log('Completing task:', taskId, 'type:', task?.type, 'images:', selectedImages.length);

      await completeTask({ taskId, formData }).unwrap();
      
      Alert.alert(
        "Congratulations! 🎉",
        "Task completed successfully",
        [{ text: "OK", onPress: () => goBack() }]
      );
    } catch (error) {
      console.error('Complete task error:', error);
      Alert.alert("Error", error?.data?.message || "Failed to complete task");
    }
  };

  if (isLoading || isCompleting) {
    return (
      <CustomScreen>
        <Loading message={isCompleting ? "Yüklənir..." : ""} />
      </CustomScreen>
    );
  }

  if (!task) {
    return (
      <CustomScreen>
        <ScreenHeader title="Task" showBackButton />
        <View style={styles.errorContainer}>
          <AppText>Task tapılmadı</AppText>
        </View>
      </CustomScreen>
    );
  }

  const timeInfo = getTimeRemaining(task.deadlineDate, task.status);

  console.log('Task details:', {
    status: task.status,
    isCompleted,
    completion: task.completion,
    submittedMedia: task.completion?.submittedMedia,
    notes: task.completion?.notes
  });

  return (
    <CustomScreen>
      <ScreenHeader title="Task Details" action={goBack} />
      
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={{paddingBottom: 90}}>

        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <Feather 
              name={task.type === 'photo' ? 'camera' : task.type === 'checklist' ? 'check-square' : 'file-text'} 
              size={32} 
              color={Colors.PRIMARY} 
            />
          </View>
          <AppText style={styles.title}>{task.title}</AppText>
          
          <View style={styles.deadlineBox}>
            <Feather name="clock" size={16} color={timeInfo.color} />
            <AppText style={[styles.deadlineText, { color: timeInfo.color }]}>
              {timeInfo.text}
            </AppText>
          </View>
        </View>

        {task.description && (
          <Section title="Description">
            <AppText style={styles.description}>{task.description}</AppText>
          </Section>
        )}

        {task.trainer && (
          <Section title="Trainer">
            <View style={styles.trainerBox}>
              <Feather name="user" size={20} color={Colors.PRIMARY} />
              <AppText style={styles.trainerName}>{task.trainer.name}</AppText>
            </View>
          </Section>
        )}

        {task.referenceMedia && task.referenceMedia.length > 0 && (
          <Section title="Reference Images">
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.referenceScroll}>
              {task.referenceMedia.map((media, index) => (
                <Pressable key={index} onPress={() => {}}>
                  <Image source={{ uri: `${IMAGE_URL}/tasks/${media.filename}` }} style={styles.referenceImage} />
                </Pressable>
              ))}
            </ScrollView>
          </Section>
        )}

        {isCompleted ? (
          <>
            <View style={styles.completedBanner}>
              <Feather name="check-circle" size={24} color={Colors.SUCCESS} />
              <AppText style={styles.completedBannerText}>Task Completed!</AppText>
            </View>

            {task.completion?.completedAt && (
              <Section title="Completion Time">
                <View style={styles.completionTimeBox}>
                  <Feather name="calendar" size={16} color={Colors.SUCCESS} />
                  <AppText style={styles.completionTime}>
                    {new Date(task.completion.completedAt).toLocaleDateString('en-US', { 
                      month: 'short', 
                      day: 'numeric', 
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </AppText>
                </View>
              </Section>
            )}

            {task.completion?.notes && task.completion.notes.trim() && (
              <Section title="Your Notes">
                <View style={styles.notesBox}>
                  <AppText style={styles.notesText}>{task.completion.notes}</AppText>
                </View>
              </Section>
            )}
            
            {task.completion?.submittedMedia && task.completion.submittedMedia.length > 0 && (
              <Section title={`Submitted Photos (${task.completion.submittedMedia.length})`}>
                <View style={styles.imagesGrid}>
                  {task.completion.submittedMedia.map((media, index) => (
                    <Pressable key={index} onPress={() => {}}>
                      <Image source={{ uri: `${IMAGE_URL}/tasks/${media.filename}` }} style={styles.submittedImage} />
                    </Pressable>
                  ))}
                </View>
              </Section>
            )}
          </>
        ) : (
          <>
            {task.type === 'photo' && (
              <Section title="Upload Photos">
                <View style={styles.uploadButtons}>
                  <Pressable style={styles.uploadButton} onPress={takePhoto}>
                    <Feather name="camera" size={24} color={Colors.PRIMARY} />
                    <AppText style={styles.uploadButtonText}>Take Photo</AppText>
                  </Pressable>
                  
                  <Pressable style={styles.uploadButton} onPress={pickImages}>
                    <Feather name="image" size={24} color={Colors.PRIMARY} />
                    <AppText style={styles.uploadButtonText}>Gallery</AppText>
                  </Pressable>
                </View>

                {selectedImages.length > 0 && (
                  <View style={styles.imagesGrid}>
                    {selectedImages.map((image, index) => (
                      <View key={index} style={styles.imageContainer}>
                        <Image source={{ uri: image.uri }} style={styles.selectedImage} />
                        <Pressable style={styles.removeButton} onPress={() => removeImage(index)}>
                          <Feather name="x" size={16} color={Colors.WHITE} />
                        </Pressable>
                      </View>
                    ))}
                  </View>
                )}
              </Section>
            )}

            {task.type === 'checklist' && (
              <View style={styles.checklistInfo}>
                <Feather name="info" size={20} color={Colors.BRAND} />
                <AppText style={styles.checklistText}>
                  Click "Complete" button to mark this task as done
                </AppText>
              </View>
            )}

            <Section title="Notes (Optional)">
              <Input
                placeholder="Add notes..."
                value={notes}
                onChangeText={setNotes}
                multiline
                numberOfLines={3}
                maxLength={500}
              />
            </Section>

            <View style={styles.actionButtons}>
              <Pressable style={styles.completeButton} onPress={handleComplete}>
                <Feather name="check-circle" size={20} color={Colors.WHITE} />
                <AppText style={styles.completeButtonText}>Complete Task</AppText>
              </Pressable>
            </View>
          </>
        )}
        </View>
      </ScrollView>
    </CustomScreen>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingVertical: 20,
  },
  header: {
    alignItems: "center",
    marginBottom: 24,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.PRIMARY + "20",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: Colors.TEXT,
    textAlign: "center",
    marginBottom: 12,
  },
  deadlineBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.CARD,
    borderWidth: 1,
    borderColor: Colors.BORDER,
  },
  deadlineText: {
    fontSize: 14,
    fontWeight: "600",
  },
  description: {
    fontSize: 15,
    color: Colors.TEXT_SECONDARY,
    lineHeight: 22,
  },
  trainerBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 12,
    backgroundColor: Colors.CARD,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.BORDER,
  },
  trainerName: {
    fontSize: 15,
    fontWeight: "600",
    color: Colors.TEXT,
  },
  referenceScroll: {
    flexDirection: "row",
  },
  referenceImage: {
    width: 150,
    height: 150,
    borderRadius: 12,
    marginRight: 12,
  },
  sectionSubtitle: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.TEXT,
    marginBottom: 12,
  },
  uploadButtons: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 16,
  },
  uploadButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    padding: 16,
    backgroundColor: Colors.CARD,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.BORDER,
    borderStyle: "dashed",
  },
  uploadButtonText: {
    fontSize: 15,
    fontWeight: "500",
    color: Colors.PRIMARY,
  },
  imagesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  imageContainer: {
    position: "relative",
    width: 100,
    height: 100,
  },
  selectedImage: {
    width: "100%",
    height: "100%",
    borderRadius: 8,
  },
  submittedImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
  },
  removeButton: {
    position: "absolute",
    top: 4,
    right: 4,
    backgroundColor: Colors.DANGER,
    borderRadius: 12,
    width: 24,
    height: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  completedBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    padding: 16,
    marginTop: 20,
    backgroundColor: Colors.SUCCESS + "15",
    borderRadius: 12,
    marginBottom: 20,
    marginHorizontal: 20,
  },
  completedBannerText: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.SUCCESS,
  },
  completionTimeBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 12,
    backgroundColor: Colors.CARD,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.SUCCESS + "30",
  },
  completionTime: {
    fontSize: 15,
    fontWeight: "600",
    color: Colors.SUCCESS,
  },
  notesBox: {
    padding: 12,
    backgroundColor: Colors.CARD,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.BORDER,
  },
  notesText: {
    fontSize: 14,
    color: Colors.TEXT_SECONDARY,
    lineHeight: 20,
  },
  checklistInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 16,
    backgroundColor: Colors.BRAND + "10",
    borderRadius: 12,
    marginBottom: 16,
  },
  checklistText: {
    flex: 1,
    fontSize: 14,
    color: Colors.TEXT_SECONDARY,
    lineHeight: 20,
  },
  actionButtons: {
    gap: 12,
    marginTop: 24,
  },
  completeButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    padding: 16,
    backgroundColor: Colors.PRIMARY,
    borderRadius: 12,
  },
  completeButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.WHITE,
  },
  errorContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});

export default TaskDetailScreen;
