import React, { useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
  Pressable,
  Image,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useNavigate } from "@/hooks/useNavigation";
import Colors from "@/constants/Colors";
import Feather from "@expo/vector-icons/Feather";
import { CustomScreen, Input, Loading, SelectModal } from "@/components/common";
import ScreenHeader from "@/components/common/ScreenHeader";
import Section from "@/components/common/Section";
import AppText from "@/components/ui/Text";
import { useCreateTaskMutation } from "@/store/redux/trainer/services/trainerTaskApi";

const CreateTaskScreen = ({ route }) => {
  const { navigate, goBack } = useNavigate();
  const { clientId, clientName, enrollmentId } = route?.params || {};

  const [createTask, { isLoading }] = useCreateTaskMutation();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    type: "checklist",
    deadlineDays: "1",
    priority: "medium",
  });

  const [referenceImages, setReferenceImages] = useState([]);
  const [showTypePicker, setShowTypePicker] = useState(false);
  const [showPriorityPicker, setShowPriorityPicker] = useState(false);

  const taskTypes = [
    { value: "checklist", label: ` Checklist` },
    { value: "photo", label: "Photo" },
  ];

  const priorities = [
    { value: "low", label: "Low" },
    { value: "medium", label: "Medium" },
    { value: "high", label: "High" },
  ];

  const pickImages = async () => {
    try {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("İcazə", "Şəkil seçmək üçün icazə lazımdır");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        quality: 0.8,
        selectionLimit: 5 - referenceImages.length,
      });

      if (!result.canceled && result.assets) {
        setReferenceImages([...referenceImages, ...result.assets]);
      }
    } catch (error) {
      console.error("Image picker error:", error);
    }
  };

  const removeImage = (index) => {
    setReferenceImages(referenceImages.filter((_, i) => i !== index));
  };

  const handleCreate = async () => {
    if (!formData.title.trim()) {
      Alert.alert("Error", "Task title is required");
      return;
    }

    if (!formData.deadlineDays || isNaN(formData.deadlineDays)) {
      Alert.alert("Error", "Please enter a valid deadline in days");
      return;
    }

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("assignedTo", clientId);
      formDataToSend.append("enrollmentId", enrollmentId);
      formDataToSend.append("title", formData.title.trim());
      formDataToSend.append("description", formData.description.trim());
      formDataToSend.append("type", formData.type);
      formDataToSend.append("deadlineDays", parseInt(formData.deadlineDays));
      formDataToSend.append("priority", formData.priority);

      // Add reference images
      referenceImages.forEach((image, index) => {
        formDataToSend.append("referenceMedia", {
          uri: image.uri,
          name: `reference_${index}.jpg`,
          type: "image/jpeg",
        });
      });

      await createTask(formDataToSend).unwrap();

      Alert.alert("Success!", `Task created for ${clientName}`, [
        { text: "OK", onPress: () => goBack() },
      ]);
    } catch (error) {
      console.error("Create task error:", error);
      Alert.alert("Error", error?.data?.message || "Failed to create task");
    }
  };

  if (isLoading) {
    return (
      <CustomScreen>
        <Loading message="Creating task..." />
      </CustomScreen>
    );
  }

  return (
    <CustomScreen>
      <ScreenHeader title="New Task" action={goBack} />

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
      >
        <ScrollView 
          style={styles.scrollView} 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >

        <View style={styles.clientBox}>
          <Feather name="user" size={20} color={Colors.PRIMARY} />
          <AppText style={styles.clientText}>{clientName}</AppText>
        </View>

        <Section title="Task Details">
          <Input
            label="Task Title *"
            placeholder="Upload meal photos"
            value={formData.title}
            onChangeText={(text) =>
              setFormData((prev) => ({ ...prev, title: text }))
            }
            maxLength={200}
          />

          <Input
            label="Description"
            placeholder="Take photos of your 3 meals today..."
            value={formData.description}
            onChangeText={(text) =>
              setFormData((prev) => ({ ...prev, description: text }))
            }
            multiline
            numberOfLines={4}
            maxLength={1000}
          />

          <View style={styles.inputGroup}>
            <View style={styles.labelRow}>
              <Feather name="list" size={16} color={Colors.BRAND} />
              <AppText style={styles.label}>Task Type *</AppText>
            </View>
            <TouchableOpacity
              style={styles.selectInput}
              onPress={() => setShowTypePicker(true)}
            >
              <AppText style={styles.selectedText}>
                {taskTypes.find((t) => t.value === formData.type)?.label}
              </AppText>
              <Feather
                name="chevron-down"
                size={16}
                color={Colors.TEXT_SECONDARY}
              />
            </TouchableOpacity>
          </View>

          <View style={styles.row}>
            <View style={styles.flex1}>
              <View style={styles.labelRow}>
                <Feather name="flag" size={16} color={Colors.BRAND} />
                <AppText style={styles.label}>Deadline (days)*</AppText>
              </View>
              <Input
                placeholder="1"
                value={formData.deadlineDays}
                onChangeText={(text) =>
                  setFormData((prev) => ({ ...prev, deadlineDays: text }))
                }
                keyboardType="number-pad"
                maxLength={2}
              />
            </View>

            <View style={styles.flex1}>
              <View style={styles.inputGroup}>
                <View style={styles.labelRow}>
                  <Feather name="flag" size={16} color={Colors.BRAND} />
                  <AppText style={styles.label}>Priority *</AppText>
                </View>
                <TouchableOpacity
                  style={styles.selectInput}
                  onPress={() => setShowPriorityPicker(true)}
                >
                  <AppText style={styles.selectedText}>
                    {
                      priorities.find((p) => p.value === formData.priority)
                        ?.label
                    }
                  </AppText>
                  <Feather
                    name="chevron-down"
                    size={16}
                    color={Colors.TEXT_SECONDARY}
                  />
                </TouchableOpacity>
              </View>
            </View>
          </View>

          <View style={styles.noteBox}>
            <Feather name="info" size={16} color={Colors.BRAND} />
            <AppText style={styles.noteText}>
              Client will have {formData.deadlineDays || "1"} day(s) to complete
              this task
            </AppText>
          </View>
        </Section>

        {formData.type === "photo" && (
          <Section title="Reference Images (Optional)">
            <AppText style={styles.sectionHint}>
              Add example images to help your client understand what you expect
            </AppText>
            <Pressable style={styles.addImageButton} onPress={pickImages}>
              <Feather name="image" size={24} color={Colors.PRIMARY} />
              <AppText style={styles.addImageText}>Add Reference Image</AppText>
            </Pressable>

            {referenceImages.length > 0 && (
              <View style={styles.imagesGrid}>
                {referenceImages.map((image, index) => (
                  <View key={index} style={styles.imageContainer}>
                    <Image source={{ uri: image.uri }} style={styles.image} />
                    <Pressable
                      style={styles.removeButton}
                      onPress={() => removeImage(index)}
                    >
                      <Feather name="x" size={16} color={Colors.WHITE} />
                    </Pressable>
                  </View>
                ))}
              </View>
            )}

            <AppText style={styles.hint}>Maximum 5 images</AppText>
          </Section>
        )}

        <Pressable style={styles.createButton} onPress={handleCreate}>
          <Feather name="check-circle" size={20} color={Colors.WHITE} />
          <AppText style={styles.createButtonText}>Create Task</AppText>
        </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>

      <SelectModal
        visible={showTypePicker}
        title="Task Type"
        options={taskTypes}
        selectedValue={formData.type}
        onSelect={(value) => {
          setFormData((prev) => ({ ...prev, type: value }));
          // Clear reference images if switching to checklist
          if (value === "checklist") {
            setReferenceImages([]);
          }
          setShowTypePicker(false);
        }}
        onClose={() => setShowTypePicker(false)}
      />

      <SelectModal
        visible={showPriorityPicker}
        title="Priority Level"
        options={priorities}
        selectedValue={formData.priority}
        onSelect={(value) => {
          setFormData((prev) => ({ ...prev, priority: value }));
          setShowPriorityPicker(false);
        }}
        onClose={() => setShowPriorityPicker(false)}
      />
    </CustomScreen>
  );
};

const styles = StyleSheet.create({
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 80,
  },
  clientBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.PRIMARY + "10",
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    gap: 8,
  },
  clientText: {
    fontSize: 15,
    fontWeight: "600",
    color: Colors.PRIMARY,
  },
  inputGroup: {
    marginBottom: 16,
  },
  labelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.TEXT,
  },
  selectInput: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: Colors.CARD,
    paddingHorizontal: 14,
    paddingVertical: 18,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.BORDER,
  },
  selectedText: {
    fontSize: 15,
    color: Colors.TEXT,
  },
  placeholderText: {
    fontSize: 15,
    color: Colors.TEXT_SECONDARY,
  },
  row: {
    flexDirection: "row",
    gap: 12,
  },
  flex1: {
    flex: 1,
  },
  addImageButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.LIGHT_GRAY,
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.BORDER,
    borderStyle: "dashed",
    gap: 8,
  },
  addImageText: {
    fontSize: 15,
    fontWeight: "500",
    color: Colors.PRIMARY,
  },
  imagesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginTop: 12,
  },
  imageContainer: {
    position: "relative",
    width: 100,
    height: 100,
  },
  image: {
    width: "100%",
    height: "100%",
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
  hint: {
    fontSize: 12,
    color: Colors.GRAY,
    marginTop: 8,
  },
  noteBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: Colors.BRAND + "10",
    padding: 12,
    borderRadius: 8,
    gap: 8,
    marginTop: 8,
  },
  noteText: {
    flex: 1,
    fontSize: 13,
    color: Colors.TEXT_SECONDARY,
    lineHeight: 18,
  },
  sectionHint: {
    fontSize: 13,
    color: Colors.TEXT_SECONDARY,
    marginBottom: 12,
    lineHeight: 18,
  },
  createButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.PRIMARY,
    padding: 16,
    borderRadius: 12,
    marginTop: 12,
    gap: 8,
  },
  createButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.WHITE,
  },
});

export default CreateTaskScreen;
