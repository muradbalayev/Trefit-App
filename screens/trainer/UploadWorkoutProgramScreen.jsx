import React, { useState } from "react";
import { View, StyleSheet, ScrollView, Alert, Pressable } from "react-native";
import * as DocumentPicker from 'expo-document-picker';
import { useNavigate } from "@/hooks/useNavigation";
import Colors from "@/constants/Colors";
import Feather from "@expo/vector-icons/Feather";
import { CustomScreen, Input, Loading, SuccessModal } from "@/components/common";
import ScreenHeader from "@/components/common/ScreenHeader";
import AppText from "@/components/ui/Text";
import { useUploadWorkoutProgramMutation, useUploadPersonalizedWorkoutProgramMutation } from "@/store/redux/trainer/services/trainerWorkoutProgramApi";

const UploadWorkoutProgramScreen = ({ route }) => {
  const { navigate, goBack } = useNavigate();
  const { planId, enrollmentId, clientName } = route?.params || {};
  const isPersonalized = !!enrollmentId;
  
  const [uploadDefault] = useUploadWorkoutProgramMutation();
  const [uploadPersonalized] = useUploadPersonalizedWorkoutProgramMutation();
  
  const [formData, setFormData] = useState({
    title: "",
    description: "",
  });
  
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: [
          'application/pdf',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        ],
        copyToCacheDirectory: true,
      });
      
      if (result.type === 'cancel') return;
      
      if (result.assets && result.assets[0]) {
        const file = result.assets[0];
        
        // Check file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
          Alert.alert("Xəta", "Fayl həcmi 5MB-dan çox ola bilməz");
          return;
        }
        
        setSelectedFile(file);
      }
    } catch (error) {
      console.error('Document picker error:', error);
      Alert.alert("Xəta", "Fayl seçilmədi");
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      Alert.alert("Xəta", "Zəhmət olmasa PDF fayl seçin");
      return;
    }
    
    if (!formData.title.trim()) {
      Alert.alert("Xəta", "Proqram adı tələb olunur");
      return;
    }

    try {
      setIsUploading(true);
      
      const formDataToSend = new FormData();
      formDataToSend.append('file', {
        uri: selectedFile.uri,
        name: selectedFile.name,
        type: selectedFile.mimeType || 'application/pdf',
      });
      formDataToSend.append('title', formData.title.trim());
      if (formData.description.trim()) {
        formDataToSend.append('description', formData.description.trim());
      }

      if (isPersonalized) {
        await uploadPersonalized({ 
          planId, 
          enrollmentId, 
          formData: formDataToSend 
        }).unwrap();
      } else {
        await uploadDefault({ 
          planId, 
          formData: formDataToSend 
        }).unwrap();
      }
      
      setIsUploading(false);
      setShowSuccessModal(true);
    } catch (error) {
      console.error('Upload error:', error);
      Alert.alert("Xəta", error?.data?.message || "Yükləmə uğursuz oldu");
      setIsUploading(false);
    }
  };

  const handleCloseSuccessModal = () => {
    setShowSuccessModal(false);
    goBack();
  };

  if (isUploading) {
    return (
      <CustomScreen>
        <Loading message="PDF yüklənir..." />
      </CustomScreen>
    );
  }

  return (
    <CustomScreen>
      <ScreenHeader 
        title={isPersonalized ? "Fərdi Proqram" : "Workout Proqramı"} 
        action={goBack} 
      />
      
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header Info Card */}
        <View style={styles.headerCard}>
          <View style={styles.headerIcon}>
            <Feather 
              name={isPersonalized ? "user-check" : "file-text"} 
              size={32} 
              color={Colors.PRIMARY} 
            />
          </View>
          <View style={styles.headerInfo}>
            <AppText style={styles.headerTitle}>
              {isPersonalized ? "Fərdi Workout Proqramı" : "Ümumi Workout Proqramı"}
            </AppText>
            <AppText style={styles.headerSubtitle}>
              {isPersonalized 
                ? `${clientName} üçün xüsusi proqram` 
                : "Planın əsas workout proqramı"}
            </AppText>
          </View>
        </View>

        {/* Info Box */}
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Feather name="info" size={20} color={Colors.BRAND} />
            <View style={styles.infoTextContainer}>
              <AppText style={styles.infoTitle}>Qeyd:</AppText>
              <AppText style={styles.infoDescription}>
                {isPersonalized
                  ? "Bu proqram yalnız seçilmiş client üçün görünəcək"
                  : "Bu proqram yüklənəndə plan avtomatik aktivləşəcək və bütün client-lər görə biləcək"}
              </AppText>
            </View>
          </View>
        </View>
        
        {/* Form Section */}
        <View style={styles.formSection}>
          <AppText style={styles.sectionTitle}>Proqram Məlumatları</AppText>
          <Input
            label="Proqram Adı *"
            placeholder="8 Həftəlik Transformasiya"
            value={formData.title}
            onChangeText={(text) => setFormData(prev => ({ ...prev, title: text }))}
            maxLength={100}
          />
          
          <Input
            label="Açıqlama"
            placeholder="Tam bədən workout planı..."
            value={formData.description}
            onChangeText={(text) => setFormData(prev => ({ ...prev, description: text }))}
            multiline
            numberOfLines={3}
            maxLength={500}
          />
        </View>

        {/* File Upload Section */}
        <View style={styles.formSection}>
          <AppText style={styles.sectionTitle}>PDF Fayl Yüklə</AppText>
          <Pressable 
            style={[
              styles.filePickerCard,
              selectedFile && styles.filePickerCardActive
            ]} 
            onPress={pickDocument}
          >
            {selectedFile ? (
              <>
                <View style={styles.fileIconSuccess}>
                  <Feather name="check-circle" size={32} color={Colors.SUCCESS} />
                </View>
                <View style={styles.fileDetails}>
                  <AppText style={styles.fileName}>{selectedFile.name}</AppText>
                  <AppText style={styles.fileSize}>
                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                  </AppText>
                </View>
                <Pressable 
                  style={styles.changeFileButton}
                  onPress={pickDocument}
                >
                  <Feather name="refresh-cw" size={20} color={Colors.PRIMARY} />
                  <AppText style={styles.changeFileText}>Dəyiş</AppText>
                </Pressable>
              </>
            ) : (
              <>
                <View style={styles.fileIconEmpty}>
                  <Feather name="upload-cloud" size={48} color={Colors.PRIMARY} />
                </View>
                <AppText style={styles.filePickerTitle}>PDF Fayl Seç</AppText>
                <AppText style={styles.filePickerHint}>
                  Faylı seçmək üçün toxunun
                </AppText>
              </>
            )}
          </Pressable>
          
          <View style={styles.hintContainer}>
            <Feather name="alert-circle" size={14} color={Colors.TEXT_SECONDARY} />
            <AppText style={styles.hint}>
              Maksimum fayl həcmi: 5MB • PDF, DOC, DOCX
            </AppText>
          </View>
        </View>

        {/* Upload Button */}
        <View style={styles.uploadSection}>
          <Pressable 
            style={[
              styles.uploadButton, 
              (!selectedFile || !formData.title.trim()) && styles.uploadButtonDisabled
            ]} 
            onPress={handleUpload}
            disabled={!selectedFile || !formData.title.trim()}
          >
            <Feather 
              name="upload" 
              size={22} 
              color={(!selectedFile || !formData.title.trim()) ? Colors.TEXT_SECONDARY : Colors.WHITE} 
            />
            <AppText style={[
              styles.uploadButtonText,
              (!selectedFile || !formData.title.trim()) && styles.uploadButtonTextDisabled
            ]}>
              {isPersonalized ? "Fərdi Proqramı Yüklə" : "Proqramı Yayınla"}
            </AppText>
          </Pressable>
          
          {!selectedFile && (
            <View style={styles.warningBox}>
              <Feather name="alert-triangle" size={16} color={Colors.WARNING} />
              <AppText style={styles.warningText}>
                PDF fayl seçin və proqram adını daxil edin
              </AppText>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Success Modal */}
      <SuccessModal
        visible={showSuccessModal}
        title={isPersonalized ? "Fərdi Proqram Yükləndi! ✅" : "Plan Yayınlandı! 🚀"}
        message={
          isPersonalized 
            ? `${clientName} üçün fərdi workout proqramı uğurla yükləndi`
            : "Workout proqramı yükləndi və plan avtomatik aktivləşdi"
        }
        subMessage={
          isPersonalized 
            ? "Client öz fərdi proqramını indi görə bilər"
            : "İndi client-lər planı görüb satın ala bilərlər və workout proqramına çıxış əldə edərlər"
        }
        iconName="check-circle"
        iconColor={Colors.SUCCESS}
        buttonText="Bağla"
        onClose={handleCloseSuccessModal}
      />
    </CustomScreen>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  headerCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.CARD,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: Colors.BORDER,
    gap: 16,
  },
  headerIcon: {
    width: 64,
    height: 64,
    borderRadius: 16,
    backgroundColor: Colors.PRIMARY + "20",
    alignItems: "center",
    justifyContent: "center",
  },
  headerInfo: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.TEXT,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: Colors.TEXT_SECONDARY,
  },
  formSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.TEXT,
    marginBottom: 16,
  },
  infoCard: {
    backgroundColor: Colors.BRAND + "15",
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderLeftWidth: 4,
    borderLeftColor: Colors.BRAND,
  },
  infoRow: {
    flexDirection: "row",
    gap: 12,
  },
  infoTextContainer: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: Colors.TEXT,
    marginBottom: 4,
  },
  infoDescription: {
    fontSize: 13,
    color: Colors.TEXT_SECONDARY,
    lineHeight: 20,
  },
  filePickerCard: {
    backgroundColor: Colors.CARD,
    borderRadius: 16,
    padding: 32,
    alignItems: "center",
    borderWidth: 2,
    borderColor: Colors.BORDER,
    borderStyle: "dashed",
    minHeight: 180,
    justifyContent: "center",
  },
  filePickerCardActive: {
    borderStyle: "solid",
    borderColor: Colors.SUCCESS,
    backgroundColor: Colors.SUCCESS + "10",
  },
  fileIconEmpty: {
    marginBottom: 16,
    opacity: 0.6,
  },
  fileIconSuccess: {
    marginBottom: 12,
  },
  filePickerTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.TEXT,
    marginBottom: 6,
  },
  filePickerHint: {
    fontSize: 13,
    color: Colors.TEXT_SECONDARY,
  },
  fileDetails: {
    flex: 1,
    alignItems: "center",
    marginBottom: 16,
  },
  fileName: {
    fontSize: 15,
    fontWeight: "600",
    color: Colors.TEXT,
    marginBottom: 4,
    textAlign: "center",
  },
  fileSize: {
    fontSize: 13,
    color: Colors.TEXT_SECONDARY,
  },
  changeFileButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: Colors.PRIMARY + "20",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  changeFileText: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.PRIMARY,
  },
  hintContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 12,
  },
  hint: {
    fontSize: 12,
    color: Colors.TEXT_SECONDARY,
  },
  uploadSection: {
    marginTop: 32,
    marginBottom: 100,
  },
  uploadButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.PRIMARY,
    paddingVertical: 18,
    borderRadius: 16,
    gap: 10,
    elevation: 4,
    shadowColor: Colors.PRIMARY,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  uploadButtonDisabled: {
    backgroundColor: Colors.CARD,
    borderWidth: 1,
    borderColor: Colors.BORDER,
    elevation: 0,
    shadowOpacity: 0,
  },
  uploadButtonText: {
    fontSize: 17,
    fontWeight: "700",
    color: Colors.WHITE,
  },
  uploadButtonTextDisabled: {
    color: Colors.TEXT_SECONDARY,
  },
  warningBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: Colors.WARNING + "15",
    padding: 12,
    borderRadius: 10,
    marginTop: 12,
    borderLeftWidth: 3,
    borderLeftColor: Colors.WARNING,
  },
  warningText: {
    fontSize: 13,
    color: Colors.TEXT_SECONDARY,
    flex: 1,
  },
});

export default UploadWorkoutProgramScreen;
