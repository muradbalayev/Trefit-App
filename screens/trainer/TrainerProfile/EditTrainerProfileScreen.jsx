import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert, Modal, Pressable } from 'react-native';
import { CustomScreen, Loading } from '@/components/common';
import ScreenHeader from '@/components/common/ScreenHeader';
import AppText from '@/components/ui/Text';
import Colors from '@/constants/Colors';
import { useGetAccountQuery, useUpdateTrainerProfileMutation } from '@/store/redux/user/services/userAccountApi';
import { Feather } from '@expo/vector-icons';

const EditTrainerProfileScreen = ({ navigation }) => {
  const { data: user, isLoading: isFetchingUser, refetch } = useGetAccountQuery();
  const [updateProfile, { isLoading: isUpdating }] = useUpdateTrainerProfileMutation();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    age: '',
    gender: '',
    height: '',
    weight: '',
    specialty: '',
    bio: '',
    experienceYears: '',
    workPlace: '',
    locationCountry: '',
    locationCity: '',
    instagram: '',
    youtube: '',
    tiktok: '',
    website: '',
  });

  const [showGenderPicker, setShowGenderPicker] = useState(false);
  const genderOptions = [
    { label: 'Male', value: 'male' },
    { label: 'Female', value: 'female' },
    { label: 'Other', value: 'other' },
  ];

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        age: user.age?.toString() || '',
        gender: user.gender || '',
        height: user.height?.toString() || '',
        weight: user.weight?.toString() || '',
        specialty: user.trainerProfile?.specialty || '',
        bio: user.trainerProfile?.bio || '',
        experienceYears: user.trainerProfile?.experienceYears?.toString() || '',
        workPlace: user.trainerProfile?.workPlace || '',
        locationCountry: user.trainerProfile?.location?.country || '',
        locationCity: user.trainerProfile?.location?.city || '',
        instagram: user.trainerProfile?.social?.instagram || '',
        youtube: user.trainerProfile?.social?.youtube || '',
        tiktok: user.trainerProfile?.social?.tiktok || '',
        website: user.trainerProfile?.social?.website || '',
      });
    }
  }, [user]);

  const handleUpdate = async () => {
    try {
      const payload = {
        name: formData.name,
        age: formData.age ? parseInt(formData.age) : undefined,
        gender: formData.gender || undefined,
        height: formData.height ? parseFloat(formData.height) : undefined,
        weight: formData.weight ? parseFloat(formData.weight) : undefined,
        specialty: formData.specialty,
        bio: formData.bio,
        experienceYears: formData.experienceYears ? parseInt(formData.experienceYears) : undefined,
        workPlace: formData.workPlace,
        location: {
          country: formData.locationCountry,
          city: formData.locationCity,
        },
        social: {
          instagram: formData.instagram,
          youtube: formData.youtube,
          tiktok: formData.tiktok,
          website: formData.website,
        },
      };

      const result = await updateProfile(payload).unwrap();
      // Refetch to get updated hasAccessToCreatePlan
      await refetch();
      Alert.alert('Success', 'Profile updated successfully!');
      navigation.goBack();
    } catch (error) {
      console.error('Update error:', error);
      Alert.alert('Error', error?.data?.message || 'Failed to update profile');
    }
  };

  if (isFetchingUser) return <Loading />;

  return (
    <CustomScreen>
      <ScreenHeader title="Edit Profile" action={() => navigation.goBack()} />
      
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Basic Info Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Feather name="user" size={20} color={Colors.BRAND} />
            <AppText font="Bold" style={styles.sectionTitle}>Basic Information</AppText>
          </View>
          
          <View style={styles.card}>
            <InputField
              icon="user"
              label="Full Name"
              value={formData.name}
              onChangeText={(text) => setFormData({ ...formData, name: text })}
              placeholder="Enter your name"
            />
            <InputField
              icon="mail"
              label="Email"
              value={formData.email}
              onChangeText={(text) => setFormData({ ...formData, email: text })}
              editable={false}
              disabled={true}
            />
            
            <View style={styles.row}>
              <View style={styles.halfWidth}>
                <InputField
                  icon="calendar"
                  label="Age"
                  value={formData.age}
                  onChangeText={(text) => setFormData({ ...formData, age: text })}
                  placeholder="Age"
                  keyboardType="numeric"
                />
              </View>
              <View style={styles.halfWidth}>
                <View style={styles.inputGroup}>
                  <View style={styles.labelRow}>
                    <Feather name="users" size={16} color={Colors.BRAND} />
                    <AppText style={styles.label}>Gender</AppText>
                  </View>
                  <TouchableOpacity
                    style={styles.input}
                    onPress={() => setShowGenderPicker(true)}
                  >
                    <AppText style={formData.gender ? styles.selectedText : styles.placeholderText}>
                      {formData.gender ? formData.gender.charAt(0).toUpperCase() + formData.gender.slice(1) : 'Select gender'}
                    </AppText>
                    <Feather name="chevron-down" size={16} color={Colors.TEXT_SECONDARY} />
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            <View style={styles.row}>
              <View style={styles.halfWidth}>
                <InputField
                  icon="trending-up"
                  label="Height (cm)"
                  value={formData.height}
                  onChangeText={(text) => setFormData({ ...formData, height: text })}
                  placeholder="Height"
                  keyboardType="numeric"
                />
              </View>
              <View style={styles.halfWidth}>
                <InputField
                  icon="activity"
                  label="Weight (kg)"
                  value={formData.weight}
                  onChangeText={(text) => setFormData({ ...formData, weight: text })}
                  placeholder="Weight"
                  keyboardType="numeric"
                />
              </View>
            </View>
          </View>
        </View>

        {/* Professional Info Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Feather name="briefcase" size={20} color={Colors.BRAND} />
            <AppText font="Bold" style={styles.sectionTitle}>Professional Information</AppText>
          </View>
          
          <View style={styles.card}>
            <InputField
              icon="award"
              label="Specialty"
              value={formData.specialty}
              onChangeText={(text) => setFormData({ ...formData, specialty: text })}
              placeholder="e.g., Strength Training"
            />

            <View style={styles.inputGroup}>
              <View style={styles.labelRow}>
                <Feather name="file-text" size={16} color={Colors.BRAND} />
                <AppText style={styles.label}>Bio</AppText>
              </View>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={formData.bio}
                onChangeText={(text) => setFormData({ ...formData, bio: text })}
                placeholder="Tell us about yourself..."
                placeholderTextColor={Colors.TEXT_SECONDARY}
                multiline
                numberOfLines={4}
              />
            </View>

            <View style={styles.row}>
              <View style={styles.halfWidth}>
                <InputField
                  icon="clock"
                  label="Experience (years)"
                  value={formData.experienceYears}
                  onChangeText={(text) => setFormData({ ...formData, experienceYears: text })}
                  placeholder="Years"
                  keyboardType="numeric"
                />
              </View>
              <View style={styles.halfWidth}>
                <InputField
                  icon="map-pin"
                  label="Work Place"
                  value={formData.workPlace}
                  onChangeText={(text) => setFormData({ ...formData, workPlace: text })}
                  placeholder="Gym name"
                />
              </View>
            </View>
          </View>
        </View>

        {/* Location Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Feather name="map" size={20} color={Colors.BRAND} />
            <AppText font="Bold" style={styles.sectionTitle}>Location</AppText>
          </View>
          
          <View style={styles.card}>
            <View style={styles.row}>
              <View style={styles.halfWidth}>
                <InputField
                  icon="globe"
                  label="Country"
                  value={formData.locationCountry}
                  onChangeText={(text) => setFormData({ ...formData, locationCountry: text })}
                  placeholder="Country"
                />
              </View>
              <View style={styles.halfWidth}>
                <InputField
                  icon="map-pin"
                  label="City"
                  value={formData.locationCity}
                  onChangeText={(text) => setFormData({ ...formData, locationCity: text })}
                  placeholder="City"
                />
              </View>
            </View>
          </View>
        </View>

        {/* Social Media Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Feather name="share-2" size={20} color={Colors.BRAND} />
            <AppText font="Bold" style={styles.sectionTitle}>Social Media</AppText>
          </View>
          
          <View style={styles.card}>
            <InputField
              icon="instagram"
              label="Instagram"
              value={formData.instagram}
              onChangeText={(text) => setFormData({ ...formData, instagram: text })}
              placeholder="@username"
            />

            <InputField
              icon="youtube"
              label="YouTube"
              value={formData.youtube}
              onChangeText={(text) => setFormData({ ...formData, youtube: text })}
              placeholder="Channel URL"
            />

            <InputField
              icon="music"
              label="TikTok"
              value={formData.tiktok}
              onChangeText={(text) => setFormData({ ...formData, tiktok: text })}
              placeholder="@username"
            />

            <InputField
              icon="globe"
              label="Website"
              value={formData.website}
              onChangeText={(text) => setFormData({ ...formData, website: text })}
              placeholder="https://..."
            />
          </View>
        </View>

        {/* Save Button */}
        <TouchableOpacity
          style={[styles.saveButton, isUpdating && styles.saveButtonDisabled]}
          onPress={handleUpdate}
          disabled={isUpdating}
        >
          {isUpdating ? (
            <AppText font="SemiBold" style={styles.saveButtonText}>Updating...</AppText>
          ) : (
            <>
              <Feather name="check-circle" size={20} color="black" />
              <AppText font="SemiBold" style={styles.saveButtonText}>Save Changes</AppText>
            </>
          )}
        </TouchableOpacity>

        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Gender Picker Modal */}
      <Modal
        visible={showGenderPicker}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowGenderPicker(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setShowGenderPicker(false)}
        >
          <View style={styles.modalContent}>
            <AppText font="Bold" style={styles.modalTitle}>Select Gender</AppText>
            {genderOptions.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.modalOption,
                  formData.gender === option.value && styles.modalOptionSelected,
                ]}
                onPress={() => {
                  setFormData({ ...formData, gender: option.value });
                  setShowGenderPicker(false);
                }}
              >
                <AppText
                  style={[
                    styles.modalOptionText,
                    formData.gender === option.value && styles.modalOptionTextSelected,
                  ]}
                >
                  {option.label}
                </AppText>
                {formData.gender === option.value && (
                  <Feather name="check" size={20} color={Colors.BRAND} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </Pressable>
      </Modal>
    </CustomScreen>
  );
};

// Input Field Component
const InputField = ({ icon, label, value, onChangeText, placeholder, keyboardType = 'default' }) => (
  <View style={styles.inputGroup}>
    <View style={styles.labelRow}>
      <Feather name={icon} size={16} color={Colors.BRAND} />
      <AppText style={styles.label}>{label}</AppText>
    </View>
    <TextInput
      style={styles.input}
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor={Colors.TEXT_SECONDARY}
      keyboardType={keyboardType}
    />
  </View>
);


export default EditTrainerProfileScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 20,
  },
  section: {
    marginBottom: 24,
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
  card: {
    backgroundColor: Colors.CARD,
    borderRadius: 16,
    padding: 20,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 12,
    color: Colors.TEXT_SECONDARY,
    marginLeft: 4,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  input: {
    backgroundColor: Colors.SECONDARY,
    borderRadius: 12,
    padding: 14,
    fontSize: 14,
    color: Colors.TEXT,
    borderWidth: 1,
    borderColor: Colors.BORDER,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfWidth: {
    flex: 1,
  },
  saveButton: {
    backgroundColor: Colors.BRAND,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    fontSize: 16,
    color: Colors.BACKGROUND,
  },
  bottomSpacing: {
    height: 100,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: Colors.BACKGROUND,
    borderWidth: 1,
    borderColor: Colors.BORDER,
    borderRadius: 16,
    padding: 20,
    width: '80%',
    maxWidth: 300,
  },
  modalTitle: {
    fontSize: 18,
    color: Colors.TEXT,
    marginBottom: 16,
    textAlign: 'center',
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 8,
    backgroundColor: Colors.CARD_BG,
  },
  modalOptionSelected: {
    backgroundColor: Colors.BRAND + '20',
    borderWidth: 1,
    borderColor: Colors.BRAND,
  },
  modalOptionText: {
    fontSize: 16,
    color: Colors.TEXT,
  },
  modalOptionTextSelected: {
    color: Colors.BRAND,
    fontWeight: '600',
  },
});
