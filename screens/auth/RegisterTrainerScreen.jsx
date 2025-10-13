import React, { useMemo, useState } from "react";
import {
  View,
  StyleSheet,
  Pressable,
  Alert,
  FlatList,
  ScrollView,
} from "react-native";
import * as DocumentPicker from "expo-document-picker";
import { CustomScreen, Input, SuccessModal } from "@/components/common";
import AppText from "@/components/ui/Text";
import Colors from "@/constants/Colors";
import { useRegisterTrainerMutation } from "@/store/redux/user/services/userAuthApi";

const RegisterTrainerScreen = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [specialty, setSpecialty] = useState("");
  const [experienceYears, setExperienceYears] = useState("");
  const [workPlace, setWorkPlace] = useState("");
  const [cvFile, setCvFile] = useState(null);
  const [certFiles, setCertFiles] = useState([]);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const [registerTrainer, { isLoading }] = useRegisterTrainerMutation();

  const canSubmit = useMemo(() => {
    return (
      name &&
      email &&
      password &&
      confirmPassword &&
      password === confirmPassword &&
      specialty &&
      experienceYears &&
      workPlace &&
      cvFile
    );
  }, [
    name,
    email,
    password,
    confirmPassword,
    specialty,
    experienceYears,
    workPlace,
    cvFile,
  ]);

  const pickCv = async () => {
    try {
      const res = await DocumentPicker.getDocumentAsync({
        type: [
          "application/pdf",
          "application/msword",
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        ],
        multiple: false,
      });

      if (res?.assets && res.assets[0]) {
        const file = res.assets[0];
        const validTypes = [
          "application/pdf",
          "application/msword",
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        ];

        if (!validTypes.includes(file.mimeType)) {
          Alert.alert("Invalid File", "Please select a PDF or DOC/DOCX file");
          return;
        }

        setCvFile(file);
      }
    } catch (error) {
      console.error("CV picker error:", error);
    }
  };

  const pickCertifications = async () => {
    try {
      const res = await DocumentPicker.getDocumentAsync({
        type: [
          "application/pdf",
          "application/msword",
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        ],
        multiple: true,
      });

      if (res?.assets && res.assets.length) {
        const validTypes = [
          "application/pdf",
          "application/msword",
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        ];
        const validFiles = res.assets.filter((file) =>
          validTypes.includes(file.mimeType)
        );

        if (validFiles.length !== res.assets.length) {
          Alert.alert(
            "Invalid Files",
            "Some files were skipped. Only PDF and DOC/DOCX files are allowed."
          );
        }

        if (validFiles.length > 0) {
          setCertFiles((prev) => [...prev, ...validFiles]);
        }
      }
    } catch (error) {
      console.error("Certifications picker error:", error);
    }
  };

  const removeCertAt = (idx) => {
    setCertFiles((prev) => prev.filter((_, i) => i !== idx));
  };

  const onSubmit = async () => {
    if (!canSubmit) {
      Alert.alert(
        "Incomplete",
        "Please fill all required fields and attach your CV."
      );
      return;
    }
    
    // Validate experienceYears
    const expYears = parseInt(experienceYears);
    if (isNaN(expYears) || expYears < 0) {
      Alert.alert("Invalid Input", "Please enter a valid number for years of experience.");
      return;
    }
    
    try {
      const fd = new FormData();
      fd.append("name", name);
      fd.append("email", email.toLowerCase().trim());
      fd.append("password", password);
      fd.append("specialty", specialty);
      fd.append("experienceYears", expYears.toString());
      fd.append("workPlace", workPlace);

      // React Native FormData file format (düzgün format)
      if (cvFile) {
        const cvFileName = cvFile.name || `cv_${Date.now()}.pdf`;
        const cvMimeType = cvFile.mimeType || cvFile.type || "application/pdf";
        
        fd.append("cv", {
          uri: cvFile.uri,
          name: cvFileName,
          type: cvMimeType,
        });
      }
      
      // Certifications
      certFiles.forEach((f, i) => {
        const certFileName = f.name || `cert_${i + 1}_${Date.now()}.pdf`;
        const certMimeType = f.mimeType || f.type || "application/pdf";
        
        fd.append("certifications", {
          uri: f.uri,
          name: certFileName,
          type: certMimeType,
        });
      });

      console.log("Submitting FormData with:", {
        name,
        email,
        specialty,
        experienceYears: expYears,
        workPlace,
        cvFile: cvFile?.name,
        certCount: certFiles.length
      });

      await registerTrainer(fd).unwrap();
      setShowSuccessModal(true);
    } catch (e) {
      console.error("Registration error:", e);
      const msg = e?.data?.message || e?.message || "Registration failed. Please try again.";
      Alert.alert("Error", msg);
    }
  };

  return (
    <CustomScreen>
      <ScrollView  showsVerticalScrollIndicator={false}>
        <View style={styles.container}>
        <View style={styles.header}>
          <AppText font="Bold" style={styles.title}>
            Trainer Registration
          </AppText>
          <AppText style={styles.subtitle}>
            Provide basic info and upload your CV (PDF or DOC/DOCX only).
          </AppText>
        </View>

        <View style={styles.form}>
          <Input
            value={name}
            onChangeText={setName}
            placeholder="Full Name"
            iconName="user"
          />
          <Input
            value={email}
            onChangeText={setEmail}
            placeholder="Email"
            iconName="mail"
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <Input
            value={password}
            onChangeText={setPassword}
            placeholder="Password"
            iconName="lock"
            isPassword
          />
          <Input
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholder="Confirm Password"
            iconName="lock"
            isPassword
          />

          <Input
            value={specialty}
            onChangeText={setSpecialty}
            placeholder="Primary Specialty"
            iconName="briefcase"
          />
          <Input
            value={experienceYears}
            onChangeText={(text) => {
              // Only allow numbers
              const numericText = text.replace(/[^0-9]/g, '');
              setExperienceYears(numericText);
            }}
            placeholder="Years of Experience"
            iconName="calendar"
            keyboardType="number-pad"
          />
          <Input
            value={workPlace}
            onChangeText={setWorkPlace}
            placeholder="Workplace"
            iconName="map-pin"
          />

          <View style={styles.files}>
            <AppText style={styles.label}>
              Curriculum Vitae (CV) — required
            </AppText>
            <Pressable onPress={pickCv} style={styles.buttonAlt}>
              <AppText font="SemiBold" style={styles.buttonAltText}>
                {cvFile ? "Replace CV" : "Pick CV"}
              </AppText>
            </Pressable>
            {cvFile ? (
              <AppText style={styles.fileName}>{cvFile.name}</AppText>
            ) : null}

            <View style={{ height: 16 }} />

            <AppText style={styles.label}>Certifications (optional)</AppText>
            <Pressable onPress={pickCertifications} style={styles.buttonAlt}>
              <AppText font="SemiBold" style={styles.buttonAltText}>
                Add Certifications
              </AppText>
            </Pressable>

            {certFiles.length ? (
              <FlatList
                style={{ marginTop: 8 }}
                data={certFiles}
                keyExtractor={(item, idx) => item.uri + idx}
                renderItem={({ item, index }) => (
                  <View style={styles.certRow}>
                    <AppText style={styles.fileName}>{item.name}</AppText>
                    <Pressable onPress={() => removeCertAt(index)}>
                      <AppText style={{ color: Colors.ERROR, fontSize: 12 }}>
                        Remove
                      </AppText>
                    </Pressable>
                  </View>
                )}
              />
            ) : null}
          </View>

          <Pressable
            onPress={onSubmit}
            disabled={!canSubmit || isLoading}
            style={[
              styles.submitBtn,
              (!canSubmit || isLoading) && { opacity: 0.6 },
            ]}
          >
            <AppText font="SemiBold" style={styles.submitText}>
              {isLoading ? "Submitting..." : "Submit Application"}
            </AppText>
          </Pressable>
        </View>
        </View>

      </ScrollView>

      {/* Success Modal */}
      <SuccessModal
        visible={showSuccessModal}
        title="Müraciətiniz Qəbul Edildi!"
        message="Müraciətiniz yoxlanılır. Təsdiqləndiyi zaman sizə email göndəriləcək."
        subMessage="Təşəkkürlər!"
        onClose={() => setShowSuccessModal(false)}
      />
    </CustomScreen>
  );
};

export default RegisterTrainerScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.BACKGROUND, paddingVertical: 40 },
  header: { alignItems: "center", marginBottom: 16 },
  title: { fontSize: 24, color: Colors.TEXT },
  subtitle: { fontSize: 13, color: Colors.TEXT_SECONDARY, marginTop: 6 },
  form: { marginTop: 12 },
  files: { marginTop: 12 },
  label: { color: Colors.TEXT_SECONDARY, fontSize: 12, marginBottom: 8 },
  fileName: { color: Colors.TEXT_SECONDARY, fontSize: 12, marginTop: 6 },
  buttonAlt: {
    height: 44,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.BORDER,
    backgroundColor: Colors.CARD,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonAltText: { color: Colors.TEXT, fontSize: 14 },
  certRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 6,
  },
  submitBtn: {
    marginTop: 18,
    height: 52,
    borderRadius: 12,
    backgroundColor: Colors.BRAND,
    alignItems: "center",
    justifyContent: "center",
  },
  submitText: { color: "black", fontSize: 16 },
});
