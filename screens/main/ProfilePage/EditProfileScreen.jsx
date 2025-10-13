import {
  StyleSheet,
  View,
  ScrollView,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import React, { useState, useEffect } from "react";
import { CustomScreen, Loading, Input } from "@/components/common";
import AppText from "@/components/ui/Text";
import Colors from "@/constants/Colors";
import {
  useGetAccountQuery,
  useUpdateProfileMutation,
} from "@/store/redux/user/services/userAccountApi";
import { Feather } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";

const EditProfileScreen = ({ navigation }) => {
  const { data: user, isFetching } = useGetAccountQuery();
  const [updateProfile, { isLoading: isUpdating }] = useUpdateProfileMutation();

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    age: "",
    gender: "",
    height: "",
    weight: "",
    goals: [],
  });

  const [showGenderPicker, setShowGenderPicker] = useState(false);

  // Initialize form with user data
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        age: user.age ? String(user.age) : "",
        gender: user.gender || "",
        height: user.height ? String(user.height) : "",
        weight: user.weight ? String(user.weight) : "",
        goals: user.goals || [],
      });
    }
  }, [user]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = async () => {
    try {
      const payload = {
        name: formData.name.trim(),
        age: formData.age ? parseInt(formData.age) : undefined,
        gender: formData.gender || undefined,
        height: formData.height ? parseFloat(formData.height) : undefined,
        weight: formData.weight ? parseFloat(formData.weight) : undefined,
        goals: formData.goals,
      };

      // Remove undefined values
      const cleanPayload = Object.fromEntries(
        Object.entries(payload).filter(
          ([_, value]) => value !== undefined && value !== ""
        )
      );

      await updateProfile(cleanPayload).unwrap();
      Alert.alert("Success", "Profile updated successfully!", [
        { text: "OK", onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      console.error("Update profile error:", error);
      Alert.alert(
        "Error",
        error?.data?.message || "Failed to update profile. Please try again."
      );
    }
  };

  const toggleGoal = (goal) => {
    setFormData((prev) => ({
      ...prev,
      goals: prev.goals.includes(goal)
        ? prev.goals.filter((g) => g !== goal)
        : [...prev.goals, goal],
    }));
  };

  const availableGoals = [
    "Weight Loss",
    "Muscle Gain",
    "Strength Training",
    "Endurance",
    "Flexibility",
    "General Fitness",
    "Sports Performance",
  ];

  if (isFetching) return <Loading />;

  return (
    <CustomScreen>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backBtn}
          >
            <Feather name="arrow-left" size={24} color={Colors.TEXT} />
          </TouchableOpacity>
          <AppText font="Bold" style={styles.headerTitle}>
            Edit Profile
          </AppText>
          <TouchableOpacity
            onPress={handleSave}
            style={[styles.saveBtn, isUpdating && styles.saveBtnDisabled]}
            disabled={isUpdating}
          >
            <AppText font="SemiBold" style={styles.saveBtnText}>
              {isUpdating ? "Saving..." : "Save"}
            </AppText>
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Basic Information */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Feather name="user" size={20} color={Colors.BRAND} />
              <AppText font="Bold" style={styles.sectionTitle}>
                Basic Information
              </AppText>
            </View>

            <Input
              value={formData.name}
              onChangeText={(value) => handleInputChange("name", value)}
              placeholder="Full Name"
              iconName="user"
              style={styles.input}
            />
            <Input
              value={formData.email}
              onChangeText={(value) => handleInputChange("email", value)}
              placeholder="Email"
              iconName="mail"
              disabled={true}
              style={styles.input}
            />

            <Input
              value={formData.age}
              onChangeText={(value) => handleInputChange("age", value)}
              placeholder="Age"
              iconName="calendar"
              keyboardType="numeric"
              style={styles.input}
            />

            <TouchableOpacity
              style={styles.pickerButton}
              onPress={() => setShowGenderPicker(!showGenderPicker)}
            >
              <Feather name="users" size={20} color={Colors.TEXT_SECONDARY} />
              <AppText style={styles.pickerButtonText}>
                {formData.gender || "Select Gender"}
              </AppText>
              <Feather
                name="chevron-down"
                size={20}
                color={Colors.TEXT_SECONDARY}
              />
            </TouchableOpacity>

            {showGenderPicker && (
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={formData.gender}
                  onValueChange={(value) => {
                    handleInputChange("gender", value);
                    setShowGenderPicker(false);
                  }}
                  style={styles.picker}
                >
                  <Picker.Item label="Select Gender" value="" />
                  <Picker.Item label="Male" value="male" />
                  <Picker.Item label="Female" value="female" />
                  <Picker.Item label="Other" value="other" />
                </Picker>
              </View>
            )}
          </View>

          {/* Physical Information */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Feather name="activity" size={20} color={Colors.BRAND} />
              <AppText font="Bold" style={styles.sectionTitle}>
                Physical Information
              </AppText>
            </View>

            <Input
              value={formData.height}
              onChangeText={(value) => handleInputChange("height", value)}
              placeholder="Height (cm)"
              iconName="trending-up"
              keyboardType="numeric"
              style={styles.input}
            />

            <Input
              value={formData.weight}
              onChangeText={(value) => handleInputChange("weight", value)}
              placeholder="Weight (kg)"
              iconName="activity"
              keyboardType="numeric"
              style={styles.input}
            />
          </View>

          {/* Fitness Goals */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Feather name="target" size={20} color={Colors.BRAND} />
              <AppText font="Bold" style={styles.sectionTitle}>
                Fitness Goals
              </AppText>
            </View>

            <AppText style={styles.sectionSubtitle}>
              Select your fitness goals (multiple allowed)
            </AppText>

            <View style={styles.goalsContainer}>
              {availableGoals.map((goal) => (
                <TouchableOpacity
                  key={goal}
                  style={[
                    styles.goalChip,
                    formData.goals.includes(goal) && styles.goalChipSelected,
                  ]}
                  onPress={() => toggleGoal(goal)}
                >
                  <AppText
                    style={[
                      styles.goalChipText,
                      formData.goals.includes(goal) &&
                        styles.goalChipTextSelected,
                    ]}
                  >
                    {goal}
                  </AppText>
                  {formData.goals.includes(goal) && (
                    <Feather name="check" size={16} color="black" />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.bottomSpacing} />
        </ScrollView>
      </KeyboardAvoidingView>
    </CustomScreen>
  );
};

export default EditProfileScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
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
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    color: Colors.TEXT,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: Colors.TEXT_SECONDARY,
    marginBottom: 16,
  },
  input: {
    marginBottom: 16,
  },
  pickerButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: Colors.CARD,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.BORDER,
    marginBottom: 16,
  },
  pickerButtonText: {
    flex: 1,
    fontSize: 16,
    color: Colors.TEXT,
  },
  pickerContainer: {
    backgroundColor: Colors.CARD,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.BORDER,
    marginBottom: 16,
  },
  picker: {
    color: Colors.TEXT,
  },
  goalsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  goalChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: Colors.CARD,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: Colors.BORDER,
  },
  goalChipSelected: {
    backgroundColor: Colors.BRAND,
    borderColor: Colors.BRAND,
  },
  goalChipText: {
    fontSize: 14,
    color: Colors.TEXT,
    fontWeight: "500",
  },
  goalChipTextSelected: {
    color: "black",
  },
  bottomSpacing: {
    height: 40,
  },
});
