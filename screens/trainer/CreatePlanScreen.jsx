import React, { useState } from "react";
import { View, StyleSheet, ScrollView, Pressable, TextInput, Alert, TouchableOpacity } from "react-native";
import { useNavigate } from "@/hooks/useNavigation";
import Colors from "@/constants/Colors";
import Feather from "@expo/vector-icons/Feather";
import { CustomScreen, SelectModal, SuccessModal } from "@/components/common";
import ScreenHeader from "@/components/common/ScreenHeader";
import Section from "@/components/common/Section";
import AppText from "@/components/ui/Text";
import { useCreatePlanMutation } from "@/store/redux/trainer/services/trainerPlanApi";

const CreatePlanScreen = () => {
  const { navigate, goBack } = useNavigate();
  const [createPlan, { isLoading }] = useCreatePlanMutation();
  
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    goalType: "",
    durationWeeks: "",
    price: "",
    tags: "",
    difficulty: "beginner",
  });

  const [showGoalTypePicker, setShowGoalTypePicker] = useState(false);
  const [showDifficultyPicker, setShowDifficultyPicker] = useState(false);
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState([]);
  
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [createdPlanId, setCreatedPlanId] = useState(null);

  // Character limits
  const TITLE_MAX_LENGTH = 50;
  const DESCRIPTION_MAX_LENGTH = 300;

  const goalTypes = [
    { value: "general_fitness", label: "General Fitness" },
    { value: "weight_loss", label: "Weight Loss" },
    { value: "muscle_gain", label: "Muscle Gain" },
    { value: "strength", label: "Strength Training" },
  ];

  const difficulties = [
    { value: "beginner", label: "Beginner" },
    { value: "intermediate", label: "Intermediate" },
    { value: "advanced", label: "Advanced" },
  ];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    if (!formData.title.trim()) {
      Alert.alert("Error", "Plan title is required");
      return false;
    }
    if (!formData.description.trim()) {
      Alert.alert("Error", "Plan description is required");
      return false;
    }
    if (!formData.goalType) {
      Alert.alert("Error", "Please select a goal type");
      return false;
    }
    if (!formData.price.trim() || isNaN(formData.price) || parseFloat(formData.price) <= 0) {
      Alert.alert("Error", "Please enter a valid price");
      return false;
    }
    return true;
  };

  const addTag = () => {
    const trimmedTag = tagInput.trim();
    if (trimmedTag && !tags.includes(trimmedTag)) {
      setTags([...tags, trimmedTag]);
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleCreatePlan = async () => {
    if (!validateForm()) return;

    try {
      const planData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        goalType: formData.goalType,
        difficulty: formData.difficulty,
        price: parseFloat(formData.price.trim()),
        durationWeeks: formData.durationWeeks ? parseInt(formData.durationWeeks.trim()) : undefined,
        tags: tags,
      };
      
      const result = await createPlan(planData).unwrap();
      
      // Save created plan ID and show success modal
      setCreatedPlanId(result?.data?._id || result?._id);
      setShowSuccessModal(true);
    } catch (error) {
      console.error("Create plan error:", error);
      Alert.alert(
        "Error", 
        error?.data?.message || "Failed to create plan. Please try again."
      );
    }
  };

  const handleUploadPDF = () => {
    setShowSuccessModal(false);
    // Clear form before navigating to prevent duplicate plan creation
    setFormData({
      title: "",
      description: "",
      goalType: "",
      durationWeeks: "",
      price: "",
      tags: "",
      difficulty: "beginner",
    });
    setTags([]);
    // Navigate to upload screen with replace to prevent back to form
    navigate('UploadWorkoutProgram', { planId: createdPlanId, replace: true });
  };

  const handleSkipUpload = () => {
    setShowSuccessModal(false);
    // Clear form before navigating
    setFormData({
      title: "",
      description: "",
      goalType: "",
      durationWeeks: "",
      price: "",
      tags: "",
      difficulty: "beginner",
    });
    setTags([]);
    // Replace current screen to prevent going back to filled form
    navigate('Plans', { replace: true });
  };

  return (
    <CustomScreen>
      <ScreenHeader 
        title="Create New Plan" 
        action={() => goBack()}
      />
      <Section>
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Basic Information */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Feather name="edit-3" size={20} color={Colors.BRAND} />
              <AppText font="Bold" style={styles.sectionTitle}>Basic Information</AppText>
            </View>

            {/* Plan Title */}
            <View style={styles.inputGroup}>
            <View style={styles.labelRow}>
              <Feather name="type" size={16} color={Colors.BRAND} />
              <AppText style={styles.label}>Plan Title *</AppText>
            </View>
            <TextInput
              style={styles.textInput}
              value={formData.title}
              onChangeText={(value) => {
                if (value.length <= TITLE_MAX_LENGTH) {
                  handleInputChange("title", value);
                }
              }}
              placeholder="Enter plan title"
              placeholderTextColor={Colors.TEXT_SECONDARY}
              maxLength={TITLE_MAX_LENGTH}
            />
            <AppText style={styles.charCount}>
              {formData.title.length}/{TITLE_MAX_LENGTH}
            </AppText>
          </View>

          {/* Description */}
          <View style={styles.inputGroup}>
            <View style={styles.labelRow}>
              <Feather name="file-text" size={16} color={Colors.BRAND} />
              <AppText style={styles.label}>Description *</AppText>
            </View>
            <TextInput
              style={[styles.textInput, styles.textArea]}
              value={formData.description}
              onChangeText={(value) => {
                if (value.length <= DESCRIPTION_MAX_LENGTH) {
                  handleInputChange("description", value);
                }
              }}
              placeholder="Describe your plan in detail..."
              placeholderTextColor={Colors.TEXT_SECONDARY}
              multiline
              numberOfLines={6}
              maxLength={DESCRIPTION_MAX_LENGTH}
              textAlignVertical="top"
            />
            <AppText style={styles.charCount}>
              {formData.description.length}/{DESCRIPTION_MAX_LENGTH}
            </AppText>
          </View>
          </View>

          {/* Plan Details */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Feather name="settings" size={20} color={Colors.BRAND} />
              <AppText font="Bold" style={styles.sectionTitle}>Plan Details</AppText>
            </View>

            {/* Goal Type */}
            <View style={styles.inputGroup}>
              <View style={styles.labelRow}>
                <Feather name="target" size={16} color={Colors.BRAND} />
                <AppText style={styles.label}>Goal Type *</AppText>
              </View>
              <TouchableOpacity
                style={styles.pickerButton}
                onPress={() => setShowGoalTypePicker(true)}
              >
                <AppText style={formData.goalType ? styles.selectedText : styles.placeholderText}>
                  {goalTypes.find(opt => opt.value === formData.goalType)?.label || 'Select Goal Type'}
                </AppText>
                <Feather name="chevron-down" size={16} color={Colors.TEXT_SECONDARY} />
              </TouchableOpacity>
            </View>

            {/* Duration */}
            <View style={styles.inputGroup}>
              <View style={styles.labelRow}>
                <Feather name="clock" size={16} color={Colors.BRAND} />
                <AppText style={styles.label}>Duration (weeks)</AppText>
              </View>
              <TextInput
                style={styles.textInput}
                value={formData.durationWeeks}
                onChangeText={(value) => handleInputChange("durationWeeks", value)}
                placeholder="8"
                placeholderTextColor={Colors.TEXT_SECONDARY}
                keyboardType="numeric"
              />
            </View>
            
            {/* Price */}
            <View style={styles.inputGroup}>
              <View style={styles.labelRow}>
                <Feather name="dollar-sign" size={16} color={Colors.BRAND} />
                <AppText style={styles.label}>Price ($) *</AppText>
              </View>
              <TextInput
                style={styles.textInput}
                value={formData.price}
                onChangeText={(value) => handleInputChange("price", value)}
                placeholder="49.99"
                placeholderTextColor={Colors.TEXT_SECONDARY}
                keyboardType="numeric"
              />
            </View>

            {/* Difficulty */}
            <View style={styles.inputGroup}>
              <View style={styles.labelRow}>
                <Feather name="trending-up" size={16} color={Colors.BRAND} />
                <AppText style={styles.label}>Difficulty Level</AppText>
              </View>
              <TouchableOpacity
                style={styles.pickerButton}
                onPress={() => setShowDifficultyPicker(true)}
              >
                <AppText style={formData.difficulty ? styles.selectedText : styles.placeholderText}>
                  {difficulties.find(opt => opt.value === formData.difficulty)?.label || 'Select Difficulty'}
                </AppText>
                <Feather name="chevron-down" size={16} color={Colors.TEXT_SECONDARY} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Tags */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Feather name="tag" size={20} color={Colors.BRAND} />
              <AppText font="Bold" style={styles.sectionTitle}>Tags</AppText>
            </View>

            <View style={styles.tagsContainer}>
              {tags.map((tag, index) => (
                <View key={index} style={styles.tagChip}>
                  <AppText style={styles.tagText} font="SemiBold">{tag}</AppText>
                  <TouchableOpacity onPress={() => removeTag(tag)}>
                    <Feather name="x" size={14} color='black' />
                  </TouchableOpacity>
                </View>
              ))}
            </View>

            <View style={styles.tagInputContainer}>
              <TextInput
                style={styles.tagInput}
                value={tagInput}
                onChangeText={setTagInput}
                placeholder="Add tag..."
                placeholderTextColor={Colors.TEXT_SECONDARY}
                onSubmitEditing={addTag}
                returnKeyType="done"
              />
              <TouchableOpacity 
                style={styles.addTagButton}
                onPress={addTag}
                disabled={!tagInput.trim()}
              >
                <Feather name="plus-circle" size={24} color={tagInput.trim() ? Colors.BRAND : Colors.TEXT_SECONDARY} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Create Button */}
          <Pressable
            style={[styles.createButton, isLoading && styles.disabledButton]}
            onPress={handleCreatePlan}
            disabled={isLoading}
          >
            <AppText style={styles.createButtonText}>
              {isLoading ? "Creating..." : "Create Plan"}
            </AppText>
          </Pressable>
        </ScrollView>
      </Section>

      {/* Success Modal */}
      <SuccessModal
        visible={showSuccessModal}
        title="Plan Yaradıldı! 🎉"
        message="Plan uğurla yaradıldı"
        subMessage="İndi workout proqramı PDF yükləməlisiniz. PDF yüklənməmiş planlar client-lərə görünməyəcək və aktivləşməyəcək."
        iconName="check-circle"
        iconColor={Colors.SUCCESS}
        buttonText="Sonra Yüklə"
        onClose={handleSkipUpload}
        secondaryButtonText="PDF Yüklə"
        onSecondaryPress={handleUploadPDF}
      />

      {/* Goal Type Modal */}
      <SelectModal
        visible={showGoalTypePicker}
        onClose={() => setShowGoalTypePicker(false)}
        title="Select Goal Type"
        options={goalTypes}
        selectedValue={formData.goalType}
        onSelect={(value) => handleInputChange('goalType', value)}
      />

      {/* Difficulty Modal */}
      <SelectModal
        visible={showDifficultyPicker}
        onClose={() => setShowDifficultyPicker(false)}
        title="Select Difficulty"
        options={difficulties}
        selectedValue={formData.difficulty}
        onSelect={(value) => handleInputChange('difficulty', value)}
      />
    </CustomScreen>
  );
};

const styles = StyleSheet.create({
  section: {
    marginBottom: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    color: Colors.TEXT,
  },
  inputGroup: {
    marginBottom: 24,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    color: Colors.TEXT,
    fontWeight: "600",
    marginLeft: 4,
  },
  charCount: {
    fontSize: 11,
    color: Colors.TEXT_SECONDARY,
    textAlign: 'right',
    marginTop: 4,
  },
  textInput: {
    backgroundColor: Colors.CARD,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: Colors.TEXT,
    borderWidth: 1,
    borderColor: Colors.BORDER,
  },
  textArea: {
    minHeight: 120,
    maxHeight: 200,
    textAlignVertical: "top",
  },
  pickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.CARD,
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.BORDER,
  },
  selectedText: {
    flex: 1,
    fontSize: 14,
    color: Colors.TEXT,
  },
  placeholderText: {
    flex: 1,
    fontSize: 14,
    color: Colors.TEXT_SECONDARY,
  },
  row: {
    flexDirection: "row",
    gap: 16,
  },
  createButton: {
    backgroundColor: Colors.BRAND,
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    marginTop: 16,
    marginBottom: 120,
  },
  disabledButton: {
    opacity: 0.6,
  },
  createButtonText: {
    fontSize: 16,
    color: "black",
    fontWeight: "600",
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  tagChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.BRAND,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  tagText: {
    fontSize: 12,
    color: 'black',
  },
  tagInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  tagInput: {
    flex: 1,
    backgroundColor: Colors.CARD,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 18,
    fontSize: 14,
    color: Colors.TEXT,
    borderWidth: 1,
    borderColor: Colors.BORDER,
  },
  addTagButton: {
    padding: 4,
  },
});

export default CreatePlanScreen;
