import React, { useState, useEffect } from "react";
import { 
  View, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Alert, 
  KeyboardAvoidingView, 
  Platform,
  Switch,
  TextInput
} from "react-native";
import { CustomScreen, Loading, Input, SelectModal } from "@/components/common";
import AppText from "@/components/ui/Text";
import Colors from "@/constants/Colors";
import { Feather } from "@expo/vector-icons";
import { 
  useGetPlanDetailsQuery,
  useUpdatePlanMutation,
  useTogglePlanStatusMutation 
} from "@/store/redux/trainer/services/trainerPlanApi";

const EditPlanScreen = ({ navigation, route }) => {
  const { planId } = route?.params || {};
  
  // API hooks
  const { data: planData, isLoading, error } = useGetPlanDetailsQuery(planId);
  const [updatePlan, { isLoading: isUpdating }] = useUpdatePlanMutation();
  const [toggleStatus, { isLoading: isToggling }] = useTogglePlanStatusMutation();

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    goalType: '',
    durationWeeks: '',
    price: '',
    difficulty: 'beginner',
    tags: [],
    isActive: true
  });

  const [showGoalTypePicker, setShowGoalTypePicker] = useState(false);
  const [showDifficultyPicker, setShowDifficultyPicker] = useState(false);
  const [tagInput, setTagInput] = useState('');

  // Character limits
  const TITLE_MAX_LENGTH = 50;
  const DESCRIPTION_MAX_LENGTH = 300;

  // Initialize form with plan data
  useEffect(() => {
    if (planData) {
      setFormData({
        title: planData.title || '',
        description: planData.description || '',
        goalType: planData.goalType || '',
        durationWeeks: planData.durationWeeks ? String(planData.durationWeeks) : '',
        price: planData.price ? String(planData.price) : '',
        difficulty: planData.difficulty || 'beginner',
        tags: planData.tags || [],
        isActive: planData.isActive !== undefined ? planData.isActive : false
      });
    } else if (!planId) {
      // If no planId provided, show error or redirect
      Alert.alert('Error', 'No plan ID provided', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    }
  }, [planData, planId, navigation]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    const trimmedTitle = formData.title.trim();
    const trimmedDescription = formData.description.trim();

    if (!trimmedTitle) {
      Alert.alert('Error', 'Plan title is required');
      return;
    }

    if (!trimmedDescription) {
      Alert.alert('Error', 'Plan description is required');
      return;
    }

    if (!formData.goalType) {
      Alert.alert('Error', 'Please select a goal type');
      return;
    }

    try {
      const payload = {
        title: trimmedTitle,
        description: trimmedDescription,
        goalType: formData.goalType,
        durationWeeks: formData.durationWeeks ? parseInt(formData.durationWeeks.trim()) : 0,
        price: formData.price ? parseFloat(formData.price.trim()) : 0,
        difficulty: formData.difficulty,
        tags: formData.tags.map(tag => tag.trim()).filter(tag => tag)
      };

      await updatePlan({ planId, planData: payload }).unwrap();
      Alert.alert('Success', 'Plan updated successfully!', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error) {
      console.error('Update plan error:', error);
      Alert.alert('Error', error?.data?.message || 'Failed to update plan');
    }
  };

  const handleToggleStatus = async () => {
    try {
      const result = await toggleStatus(planId).unwrap();
      Alert.alert('Success', result.message || 'Plan status updated successfully');
      // Update local state
      setFormData(prev => ({
        ...prev,
        isActive: !prev.isActive
      }));
    } catch (error) {
      console.error('Toggle status error:', error);
      Alert.alert('Error', error?.data?.message || 'Failed to update plan status');
    }
  };

  const addTag = () => {
    const trimmedTag = tagInput.trim();
    if (trimmedTag && !formData.tags.includes(trimmedTag)) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, trimmedTag]
      }));
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const goalTypeOptions = [
    { value: "general_fitness", label: "General Fitness" },
    { value: "weight_loss", label: "Weight Loss" },
    { value: "muscle_gain", label: "Muscle Gain" },
    { value: "strength", label: "Strength Training" },
  ];

  const difficultyOptions = [
    { value: "beginner", label: "Beginner" },
    { value: "intermediate", label: "Intermediate" },
    { value: "advanced", label: "Advanced" }
  ];

  if (isLoading) return <Loading />;

  if (error) {
    return (
      <CustomScreen>
        <View style={styles.errorContainer}>
          <Feather name="alert-circle" size={48} color={Colors.ERROR} />
          <AppText style={styles.errorText}>
            {error?.data?.message || 'Failed to load plan details'}
          </AppText>
          <TouchableOpacity style={styles.retryBtn} onPress={() => navigation.goBack()}>
            <AppText style={styles.retryText}>Go Back</AppText>
          </TouchableOpacity>
        </View>
      </CustomScreen>
    );
  }

  // Show loading state while form is initializing
  if (!planData && planId) {
    return <Loading />;
  }

  return (
    <CustomScreen>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Feather name="arrow-left" size={24} color={Colors.TEXT} />
          </TouchableOpacity>
          <AppText font="Bold" style={styles.headerTitle}>Edit Plan</AppText>
          <TouchableOpacity 
            onPress={handleSave} 
            style={[styles.saveBtn, isUpdating && styles.saveBtnDisabled]}
            disabled={isUpdating}
          >
            <AppText font="SemiBold" style={styles.saveBtnText}>
              {isUpdating ? 'Saving...' : 'Save'}
            </AppText>
          </TouchableOpacity>
        </View>

        <ScrollView 
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Plan Status */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Feather name="toggle-left" size={20} color={Colors.BRAND} />
              <AppText font="Bold" style={styles.sectionTitle}>Plan Status</AppText>
            </View>
            
            <View style={styles.statusContainer}>
              <View style={styles.statusInfo}>
                <AppText font="SemiBold" style={styles.statusLabel}>
                  {formData.isActive ? 'Active' : 'Inactive'}
                </AppText>
                <AppText style={styles.statusDescription}>
                  {formData.isActive 
                    ? 'Plan is visible to clients and available for purchase' 
                    : 'Plan is hidden from clients and not available for purchase'
                  }
                </AppText>
              </View>
              <TouchableOpacity 
                style={[
                  styles.statusToggle,
                  formData.isActive ? styles.activeToggle : styles.inactiveToggle
                ]}
                onPress={handleToggleStatus}
                disabled={isToggling}
              >
                {isToggling ? (
                  <AppText style={styles.toggleText}>...</AppText>
                ) : (
                  <AppText style={styles.toggleText}>
                    {formData.isActive ? 'Deactivate' : 'Activate'}
                  </AppText>
                )}
              </TouchableOpacity>
            </View>
          </View>

          {/* Basic Information */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Feather name="edit-3" size={20} color={Colors.BRAND} />
              <AppText font="Bold" style={styles.sectionTitle}>Basic Information</AppText>
            </View>

            <View style={styles.inputContainer}>
              <Input
                value={formData.title}
                onChangeText={(value) => {
                  if (value.length <= TITLE_MAX_LENGTH) {
                    handleInputChange('title', value);
                  }
                }}
                placeholder="Plan Title"
                iconName="type"
                style={styles.input}
                maxLength={TITLE_MAX_LENGTH}
              />
              <AppText style={styles.charCount}>
                {formData.title.length}/{TITLE_MAX_LENGTH}
              </AppText>
            </View>

            <View style={styles.inputContainer}>
              <View style={styles.textAreaWrapper}>
                <Feather name="file-text" size={16} color={Colors.BRAND} style={styles.textAreaIcon} />
                <TextInput
                  value={formData.description}
                  onChangeText={(value) => {
                    if (value.length <= DESCRIPTION_MAX_LENGTH) {
                      handleInputChange('description', value);
                    }
                  }}
                  placeholder="Plan Description (detailed information about your plan)"
                  placeholderTextColor={Colors.TEXT_SECONDARY}
                  multiline
                  numberOfLines={6}
                  style={styles.textArea}
                  textAlignVertical="top"
                  maxLength={DESCRIPTION_MAX_LENGTH}
                />
              </View>
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

            {/* Goal Type Picker */}
            <View style={styles.inputGroup}>
              <View style={styles.labelRow}>
                <Feather name="target" size={16} color={Colors.BRAND} />
                <AppText style={styles.label}>Goal Type</AppText>
              </View>
              <TouchableOpacity
                style={styles.pickerButton}
                onPress={() => setShowGoalTypePicker(true)}
              >
                <AppText style={formData.goalType ? styles.selectedText : styles.placeholderText}>
                  {goalTypeOptions.find(opt => opt.value === formData.goalType)?.label || 'Select Goal Type'}
                </AppText>
                <Feather name="chevron-down" size={16} color={Colors.TEXT_SECONDARY} />
              </TouchableOpacity>
            </View>

            <Input
              value={formData.durationWeeks}
              onChangeText={(value) => handleInputChange('durationWeeks', value)}
              placeholder="Duration (weeks)"
              iconName="clock"
              keyboardType="numeric"
              style={styles.input}
            />
            
            <Input
              value={formData.price}
              onChangeText={(value) => handleInputChange('price', value)}
              placeholder="Price ($)"
              iconName="dollar-sign"
              keyboardType="numeric"
              style={styles.input}
            />

            {/* Difficulty Picker */}
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
                  {difficultyOptions.find(opt => opt.value === formData.difficulty)?.label || 'Select Difficulty'}
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
              {formData.tags.map((tag, index) => (
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

          <View style={styles.bottomSpacing} />
        </ScrollView>

        {/* Goal Type Modal */}
        <SelectModal
          visible={showGoalTypePicker}
          onClose={() => setShowGoalTypePicker(false)}
          title="Select Goal Type"
          options={goalTypeOptions}
          selectedValue={formData.goalType}
          onSelect={(value) => handleInputChange('goalType', value)}
        />

        {/* Difficulty Modal */}
        <SelectModal
          visible={showDifficultyPicker}
          onClose={() => setShowDifficultyPicker(false)}
          title="Select Difficulty"
          options={difficultyOptions}
          selectedValue={formData.difficulty}
          onSelect={(value) => handleInputChange('difficulty', value)}
        />
      </KeyboardAvoidingView>
    </CustomScreen>
  );
};

export default EditPlanScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: Colors.BORDER,
  },
  backBtn: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    color: Colors.TEXT,
  },
  saveBtn: {
    backgroundColor: Colors.BRAND,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  saveBtnDisabled: {
    opacity: 0.6,
  },
  saveBtnText: {
    color: Colors.TEXT_BLACK,
    fontSize: 14,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingVertical: 20,
  },
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    color: Colors.TEXT,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.CARD,
    padding: 16,
    borderRadius: 12,
  },
  statusInfo: {
    flex: 1,
  },
  statusLabel: {
    fontSize: 16,
    color: Colors.TEXT,
    marginBottom: 4,
  },
  statusDescription: {
    fontSize: 12,
    color: Colors.TEXT_SECONDARY,
    lineHeight: 16,
  },
  statusToggle: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    minWidth: 80,
    alignItems: 'center',
  },
  activeToggle: {
    backgroundColor: Colors.WARNING || '#F59E0B',
  },
  inactiveToggle: {
    backgroundColor: Colors.SUCCESS || '#10B981',
  },
  toggleText: {
    fontSize: 12,
    color: 'white',
    fontWeight: '600',
  },
  input: {
    marginBottom: 4,
  },
  inputContainer: {
    marginBottom: 16,
  },
  charCount: {
    fontSize: 11,
    color: Colors.TEXT_SECONDARY,
    textAlign: 'right',
    marginTop: 4,
  },
  inputGroup: {
    marginBottom: 16,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  label: {
    fontSize: 12,
    color: Colors.TEXT_SECONDARY,
    marginLeft: 4,
  },
  textAreaWrapper: {
    position: 'relative',
  },
  textAreaIcon: {
    position: 'absolute',
    left: 14,
    top: 14,
    zIndex: 1,
  },
  textArea: {
    backgroundColor: Colors.CARD,
    borderRadius: 12,
    padding: 14,
    paddingLeft: 40,
    fontSize: 14,
    color: Colors.TEXT,
    borderWidth: 1,
    borderColor: Colors.BORDER,
    minHeight: 120,
    maxHeight: 200,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfInput: {
    flex: 1,
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
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  errorText: {
    fontSize: 16,
    color: Colors.ERROR,
    textAlign: 'center',
  },
  retryBtn: {
    backgroundColor: Colors.BRAND,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryText: {
    color: Colors.TEXT_BLACK,
    fontWeight: '600',
  },
  bottomSpacing: {
    height: 40,
  },
});
