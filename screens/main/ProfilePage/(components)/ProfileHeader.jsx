import { StyleSheet, View, Image, TouchableOpacity, Alert } from 'react-native'
import React from 'react'
import AppText from '@/components/ui/Text'
import Colors from '@/constants/Colors'
import { Feather } from '@expo/vector-icons'
import { getAvatarUrl } from '@/constants/Paths'
import * as DocumentPicker from 'expo-document-picker'
import { useUploadAvatarMutation } from '@/store/redux/user/services/userAccountApi'

const ProfileHeader = ({ user, onEditProfile }) => {
  const [uploadAvatar, { isLoading: isUploadingAvatar }] = useUploadAvatarMutation()

  const handleAvatarUpload = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['image/*'],
        copyToCacheDirectory: true,
      })

      if (result.canceled) return

      const asset = result.assets[0]
      const formData = new FormData()
      formData.append('avatar', {
        uri: asset.uri,
        type: asset.mimeType,
        name: asset.name,
      })

      await uploadAvatar(formData).unwrap()
      Alert.alert('Success', 'Avatar updated successfully!')
    } catch (error) {
      console.error('Avatar upload error:', error)
      Alert.alert('Error', 'Failed to update avatar. Please try again.')
    }
  }

  return (
    <View style={styles.profileSection}>
      {/* Header Row: Avatar + Stats */}
      <View style={styles.profileHeader}>
        {/* Avatar */}
        <View style={styles.avatarWrapper}>
          <Image 
            source={{ 
              uri: user?.avatar 
                ? getAvatarUrl(user.avatar, 'webp') 
                : 'https://www.tenforums.com/attachments/user-accounts-family-safety/322690d1615743307-user-account-image-log-user.png' 
            }} 
            style={styles.avatar} 
          />
          <TouchableOpacity 
            style={styles.avatarEditBtn} 
            onPress={handleAvatarUpload}
            disabled={isUploadingAvatar}
          >
            <Feather 
              name={isUploadingAvatar ? "loader" : "camera"} 
              size={12} 
              color="black" 
            />
          </TouchableOpacity>
        </View>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <AppText font="Bold" style={styles.statValue}>
              {user?.streak ?? 0}
            </AppText>
            <AppText style={styles.statLabel}>Streak</AppText>
          </View>
          <View style={styles.statItem}>
            <AppText font="Bold" style={styles.statValue}>
              {user?.points ?? 0}
            </AppText>
            <AppText style={styles.statLabel}>Points</AppText>
          </View>
          <View style={styles.statItem}>
            <AppText font="Bold" style={styles.statValue}>
              {user?.joinedAt ? new Date(user.joinedAt).getFullYear() : '2024'}
            </AppText>
            <AppText style={styles.statLabel}>Joined</AppText>
          </View>
        </View>
      </View>

      {/* User Info */}
      <View style={styles.profileInfo}>
        <AppText font="SemiBold" style={styles.userName}>
          {user?.name || 'No Name'}
        </AppText>
        
        {user?.role && (
          <View style={styles.roleBadge}>
            <AppText style={styles.roleText}>{user.role.toUpperCase()}</AppText>
          </View>
        )}

        {/* User Meta - Age, Gender, Height, Weight (Card Style) */}
        {(user?.age || user?.gender || user?.height || user?.weight) && (
          <View style={styles.infoGrid}>
            {user?.age && (
              <View style={styles.infoCard}>
                <View style={styles.infoIcon}>
                  <Feather name="user" size={18} color={Colors.BRAND} />
                </View>
                <AppText style={styles.infoLabel}>Age</AppText>
                <AppText font="SemiBold" style={styles.infoValue}>{user.age} years</AppText>
              </View>
            )}
            {user?.gender && (
              <View style={styles.infoCard}>
                <View style={styles.infoIcon}>
                  <Feather name="users" size={18} color={Colors.BRAND} />
                </View>
                <AppText style={styles.infoLabel}>Gender</AppText>
                <AppText font="SemiBold" style={styles.infoValue}>{user.gender}</AppText>
              </View>
            )}
            {user?.height && (
              <View style={styles.infoCard}>
                <View style={styles.infoIcon}>
                  <Feather name="trending-up" size={18} color={Colors.BRAND} />
                </View>
                <AppText style={styles.infoLabel}>Height</AppText>
                <AppText font="SemiBold" style={styles.infoValue}>{user.height} cm</AppText>
              </View>
            )}
            {user?.weight && (
              <View style={styles.infoCard}>
                <View style={styles.infoIcon}>
                  <Feather name="activity" size={18} color={Colors.BRAND} />
                </View>
                <AppText style={styles.infoLabel}>Weight</AppText>
                <AppText font="SemiBold" style={styles.infoValue}>{user.weight} kg</AppText>
              </View>
            )}
          </View>
        )}

        {/* Goals */}
        {/* {user?.goals && user.goals.length > 0 && (
          <View style={styles.goalsContainer}>
            {user.goals.slice(0, 3).map((goal, index) => (
              <View key={index} style={styles.goalChip}>
                <AppText style={styles.goalText}>{goal}</AppText>
              </View>
            ))}
          </View>
        )} */}

        {/* Edit Profile Button - Instagram Style */}
        <TouchableOpacity style={styles.editProfileBtn} onPress={onEditProfile}>
          <AppText style={styles.editProfileText} font="SemiBold">Edit Profile</AppText>
        </TouchableOpacity>
      </View>
    </View>
  )
}

export default ProfileHeader

const styles = StyleSheet.create({
  profileSection: {
    marginBottom: 24,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarWrapper: {
    position: 'relative',
    marginRight: 20,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: Colors.BORDER,
  },
  avatarEditBtn: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: Colors.BRAND,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.BACKGROUND,
  },
  statsRow: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    color: Colors.TEXT,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.TEXT_SECONDARY,
    marginTop: 2,
  },
  profileInfo: {
    paddingHorizontal: 8,
  },
  userName: {
    fontSize: 16,
    color: Colors.TEXT,
    marginBottom: 4,
  },
  roleBadge: {
    backgroundColor: Colors.SECONDARY,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  roleText: {
    fontSize: 10,
    color: Colors.TEXT,
    fontWeight: '600',
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },
  infoCard: {
    width: '48%',
    backgroundColor: Colors.CARD,
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.BORDER,
  },
  infoIcon: {
    marginBottom: 6,
  },
  infoLabel: {
    fontSize: 10,
    color: Colors.TEXT_SECONDARY,
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 12,
    color: Colors.TEXT,
    textAlign: 'center',
  },
  goalsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 12,
  },
  goalChip: {
    backgroundColor: Colors.BRAND,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  goalText: {
    fontSize: 11,
    color: 'black',
    fontWeight: '600',
  },
  editProfileBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.BRAND,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginTop: 16,
    borderWidth: 1,
    borderColor: Colors.BORDER,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  editProfileText: {
    fontSize: 14,
    color: Colors.TEXT_BLACK,
  },
})