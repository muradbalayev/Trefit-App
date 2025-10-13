import {
  StyleSheet,
  View,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import React, { useState } from "react";
import { CustomScreen, Input } from "@/components/common";
import AppText from "@/components/ui/Text";
import Colors from "@/constants/Colors";
import { useChangePasswordMutation } from "@/store/redux/user/services/userAccountApi";
import { Feather } from "@expo/vector-icons";
import ScreenHeader from "@/components/common/ScreenHeader";
import { useNavigate } from "@/hooks/useNavigation";

const ChangePasswordScreen = ({ navigation }) => {
  const [changePassword, { isLoading }] = useChangePasswordMutation();
  const { goBack } = useNavigate();
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  const validateForm = () => {
    if (!formData.currentPassword.trim()) {
      Alert.alert("Error", "Please enter your current password");
      return false;
    }

    if (!formData.newPassword.trim()) {
      Alert.alert("Error", "Please enter a new password");
      return false;
    }

    if (formData.newPassword.length < 6) {
      Alert.alert("Error", "New password must be at least 6 characters long");
      return false;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      Alert.alert("Error", "New passwords do not match");
      return false;
    }

    if (formData.currentPassword === formData.newPassword) {
      Alert.alert(
        "Error",
        "New password must be different from current password"
      );
      return false;
    }

    return true;
  };

  const handleChangePassword = async () => {
    if (!validateForm()) return;

    try {
      await changePassword({
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
      }).unwrap();

      Alert.alert(
        "Success",
        "Password changed successfully! You will be logged out for security reasons.",
        [
          {
            text: "OK",
            onPress: () => {
              // Navigate back to profile or logout
              navigation.goBack();
            },
          },
        ]
      );
    } catch (error) {
      console.error("Change password error:", error);
      Alert.alert(
        "Error",
        error?.data?.message || "Failed to change password. Please try again."
      );
    }
  };

  const getPasswordStrength = (password) => {
    if (!password)
      return { strength: 0, text: "", color: Colors.TEXT_SECONDARY };

    let score = 0;
    let feedback = [];

    // Length check
    if (password.length >= 8) {
      score += 25;
    } else {
      feedback.push("8+ characters");
    }

    // Uppercase check
    if (/[A-Z]/.test(password)) {
      score += 25;
    } else {
      feedback.push("uppercase letter");
    }

    // Lowercase check
    if (/[a-z]/.test(password)) {
      score += 25;
    } else {
      feedback.push("lowercase letter");
    }

    // Number or special char check
    if (/[\d\W]/.test(password)) {
      score += 25;
    } else {
      feedback.push("number or symbol");
    }

    let strengthText = "";
    let color = Colors.ERROR;

    if (score === 100) {
      strengthText = "Strong";
      color = Colors.SUCCESS;
    } else if (score >= 75) {
      strengthText = "Good";
      color = Colors.WARNING;
    } else if (score >= 50) {
      strengthText = "Fair";
      color = Colors.WARNING;
    } else {
      strengthText = "Weak";
      color = Colors.ERROR;
    }

    return { strength: score, text: strengthText, color, feedback };
  };

  const passwordStrength = getPasswordStrength(formData.newPassword);

  return (
    <CustomScreen>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
      >

        <ScreenHeader title="Change Password" action={goBack} />

        <View style={styles.content}>
          {/* Security Notice */}
          <View style={styles.securityNotice}>
            <Feather name="shield" size={24} color={Colors.BRAND} />
            <View style={styles.noticeText}>
              <AppText font="SemiBold" style={styles.noticeTitle}>
                Security Notice
              </AppText>
              <AppText style={styles.noticeDescription}>
                For your security, you'll be logged out after changing your
                password.
              </AppText>
            </View>
          </View>

          {/* Current Password */}
          <View style={styles.section}>
            <AppText font="SemiBold" style={styles.sectionTitle}>
              Current Password
            </AppText>
            <View style={styles.passwordContainer}>
              <Input
                value={formData.currentPassword}
                onChangeText={(value) =>
                  handleInputChange("currentPassword", value)
                }
                placeholder="Enter current password"
                iconName="lock"
                secureTextEntry={!showPasswords.current}
                style={styles.input}
              />
              <TouchableOpacity
                style={styles.eyeIcon}
                onPress={() => togglePasswordVisibility("current")}
              >
                <Feather
                  name={showPasswords.current ? "eye-off" : "eye"}
                  size={20}
                  color={Colors.TEXT_SECONDARY}
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* New Password */}
          <View style={styles.section}>
            <AppText font="SemiBold" style={styles.sectionTitle}>
              New Password
            </AppText>
            <View style={styles.passwordContainer}>
              <Input
                value={formData.newPassword}
                onChangeText={(value) =>
                  handleInputChange("newPassword", value)
                }
                placeholder="Enter new password"
                iconName="lock"
                secureTextEntry={!showPasswords.new}
                style={styles.input}
              />
              <TouchableOpacity
                style={styles.eyeIcon}
                onPress={() => togglePasswordVisibility("new")}
              >
                <Feather
                  name={showPasswords.new ? "eye-off" : "eye"}
                  size={20}
                  color={Colors.TEXT_SECONDARY}
                />
              </TouchableOpacity>
            </View>

            {/* Password Strength */}
            {formData.newPassword.length > 0 && (
              <View style={styles.passwordStrength}>
                <View style={styles.strengthHeader}>
                  <AppText style={styles.strengthLabel}>
                    Password Strength:{" "}
                  </AppText>
                  <AppText
                    style={[
                      styles.strengthText,
                      { color: passwordStrength.color },
                    ]}
                  >
                    {passwordStrength.text}
                  </AppText>
                </View>
                <View style={styles.strengthBar}>
                  <View
                    style={[
                      styles.strengthFill,
                      {
                        width: `${passwordStrength.strength}%`,
                        backgroundColor: passwordStrength.color,
                      },
                    ]}
                  />
                </View>
                {passwordStrength.feedback.length > 0 && (
                  <AppText style={styles.strengthFeedback}>
                    Add: {passwordStrength.feedback.join(", ")}
                  </AppText>
                )}
              </View>
            )}
          </View>

          {/* Confirm Password */}
          <View style={styles.section}>
            <AppText font="SemiBold" style={styles.sectionTitle}>
              Confirm New Password
            </AppText>
            <View style={styles.passwordContainer}>
              <Input
                value={formData.confirmPassword}
                onChangeText={(value) =>
                  handleInputChange("confirmPassword", value)
                }
                placeholder="Confirm new password"
                iconName="lock"
                secureTextEntry={!showPasswords.confirm}
                style={styles.input}
              />
              <TouchableOpacity
                style={styles.eyeIcon}
                onPress={() => togglePasswordVisibility("confirm")}
              >
                <Feather
                  name={showPasswords.confirm ? "eye-off" : "eye"}
                  size={20}
                  color={Colors.TEXT_SECONDARY}
                />
              </TouchableOpacity>
            </View>

            {/* Password Match Indicator */}
            {formData.confirmPassword.length > 0 && (
              <View style={styles.passwordMatch}>
                <Feather
                  name={
                    formData.newPassword === formData.confirmPassword
                      ? "check-circle"
                      : "x-circle"
                  }
                  size={16}
                  color={
                    formData.newPassword === formData.confirmPassword
                      ? Colors.SUCCESS
                      : Colors.ERROR
                  }
                />
                <AppText
                  style={[
                    styles.matchText,
                    {
                      color:
                        formData.newPassword === formData.confirmPassword
                          ? Colors.SUCCESS
                          : Colors.ERROR,
                    },
                  ]}
                >
                  {formData.newPassword === formData.confirmPassword
                    ? "Passwords match"
                    : "Passwords do not match"}
                </AppText>
              </View>
            )}
          </View>

          {/* Change Password Button */}
          <TouchableOpacity
            style={[styles.changeBtn, isLoading && styles.changeBtnDisabled]}
            onPress={handleChangePassword}
            disabled={isLoading}
          >
            <Feather name="shield" size={20} color="black" />
            <AppText font="SemiBold" style={styles.changeBtnText}>
              {isLoading ? "Changing Password..." : "Change Password"}
            </AppText>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </CustomScreen>
  );
};

export default ChangePasswordScreen;

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
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingVertical: 20,
  },
  securityNotice: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: Colors.CARD,
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: Colors.BRAND,
    marginBottom: 32,
  },
  noticeText: {
    flex: 1,
  },
  noticeTitle: {
    fontSize: 14,
    color: Colors.TEXT,
    marginBottom: 4,
  },
  noticeDescription: {
    fontSize: 12,
    color: Colors.TEXT_SECONDARY,
    lineHeight: 18,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    color: Colors.TEXT,
    marginBottom: 8,
  },
  passwordContainer: {
    position: "relative",
  },
  input: {
    marginBottom: 0,
  },
  eyeIcon: {
    position: "absolute",
    right: 16,
    top: 16,
    padding: 4,
  },
  passwordStrength: {
    marginTop: 12,
  },
  strengthHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  strengthLabel: {
    fontSize: 12,
    color: Colors.TEXT_SECONDARY,
  },
  strengthText: {
    fontSize: 12,
    fontWeight: "600",
  },
  strengthBar: {
    height: 4,
    backgroundColor: Colors.BORDER,
    borderRadius: 2,
    marginBottom: 8,
  },
  strengthFill: {
    height: "100%",
    borderRadius: 2,
  },
  strengthFeedback: {
    fontSize: 12,
    color: Colors.TEXT_SECONDARY,
  },
  passwordMatch: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 8,
  },
  matchText: {
    fontSize: 12,
    fontWeight: "500",
  },
  changeBtn: {
    backgroundColor: Colors.BRAND,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 16,
  },
  changeBtnDisabled: {
    opacity: 0.6,
  },
  changeBtnText: {
    color: Colors.TEXT_BLACK,
    fontSize: 16,
  },
});
