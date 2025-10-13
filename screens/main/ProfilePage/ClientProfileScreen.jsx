import { StyleSheet, View, Image, Pressable, Alert, ScrollView, RefreshControl, TouchableOpacity } from 'react-native'
import React from 'react'
import { CustomScreen, Loading } from '@/components/common'
import AppText from '@/components/ui/Text'
import Colors from '@/constants/Colors'
import { useGetAccountQuery, useUpdateProfileMutation } from '@/store/redux/user/services/userAccountApi'
import { useLogoutMutation } from '@/store/redux/user/services/userAuthApi'
import { useGetProgressPhotosQuery } from '@/store/redux/user/services/userProgressApi'
import { useSelector } from 'react-redux'
import { Feather } from '@expo/vector-icons'
import ProfileHeader from './(components)/ProfileHeader'
import { getProgressPhotoUrl } from '@/constants/Paths'

const ClientProfileScreen = ({ navigation }) => {
  const { data: user, isFetching, isError, refetch } = useGetAccountQuery()
  const { haveTrainer } = useSelector((state) => state.userAuth)
  const { data: progressData } = useGetProgressPhotosQuery()
  const [logout, { isLoading: isLoggingOut }] = useLogoutMutation()
  const [updateProfile, { isLoading: isUpdatingProfile }] = useUpdateProfileMutation()
  
  const isPremium = !!haveTrainer
  const maxPhotosPerWeek = isPremium ? 4 : 2
  
  const onLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              await logout().unwrap()
            } catch (e) {
              Alert.alert('Logout failed', 'Please try again.')
            }
          }
        }
      ]
    )
  }

  const navigateToEditProfile = () => {
    navigation.navigate('EditProfile')
  }

  const navigateToChangePassword = () => {
    navigation.navigate('ChangePassword')
  }

  const navigateToNotifications = () => {
    navigation.navigate('Notifications')
  }

  if (isFetching) return <Loading />
  if (isError) {
    return (
      <CustomScreen>
        <View style={styles.errorContainer}>
          <Feather name="alert-circle" size={48} color={Colors.ERROR} />
          <AppText style={styles.errorText}>Failed to load profile</AppText>
          <TouchableOpacity style={styles.retryBtn} onPress={refetch}>
            <AppText style={styles.retryText}>Retry</AppText>
          </TouchableOpacity>
        </View>
      </CustomScreen>
    )
  }

  return (
    <CustomScreen>
      <View style={styles.topBar}>
        <AppText font="Bold" style={styles.headerTitle}>@{user?.username}</AppText>
       
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={isFetching}
            onRefresh={refetch}
            tintColor={Colors.BRAND}
            colors={[Colors.BRAND]}
            progressBackgroundColor={Colors.SECONDARY}
          />
        }
      >
        {/* Profile Header - Instagram Style */}
        <ProfileHeader user={user} onEditProfile={navigateToEditProfile}/>
   {/* Goals Section */}
   {user?.goals && user.goals.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Feather name="target" size={20} color={Colors.BRAND} />
              <AppText font="Bold" style={styles.sectionTitle}>Fitness Goals</AppText>
            </View>
            <View style={styles.goalsContainer}>
              {user.goals.map((goal, index) => (
                <View key={index} style={styles.goalChip}>
                  <AppText style={styles.goalText}>{goal}</AppText>
                </View>
              ))}
            </View>
          </View>
        )}
        {/* Progress Photos Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Feather name="image" size={20} color={Colors.BRAND} />
            <AppText font="Bold" style={styles.sectionTitle}>Body Progress</AppText>
            {!isPremium && (
              <View style={styles.freeBadge}>
                <AppText style={styles.freeBadgeText}>FREE</AppText>
              </View>
            )}
          </View>
          
          {progressData?.weeklyPhotos && progressData.weeklyPhotos.length > 0 ? (
            <>
              {/* Last 2 weeks preview */}
              <View style={styles.progressPreview}>
                {progressData.weeklyPhotos.slice(-2).reverse().map((weekData) => (
                  <View key={weekData.week} style={styles.weekPreview}>
                    <AppText style={styles.weekLabel}>Week {weekData.week}</AppText>
                    <View style={styles.photoGrid}>
                      {weekData.photos.slice(0, 2).map((photo, idx) => (
                        <View key={idx} style={styles.photoThumb}>
                          <Image 
                            source={{ uri: getProgressPhotoUrl(photo.filename) }}
                            style={styles.thumbImage}
                          />
                          <AppText style={styles.photoType}>{photo.type}</AppText>
                        </View>
                      ))}
                      {weekData.photos.length > 2 && (
                        <View style={[styles.photoThumb, styles.morePhotos]}>
                          <AppText style={styles.moreText}>+{weekData.photos.length - 2}</AppText>
                        </View>
                      )}
                    </View>
                  </View>
                ))}
              </View>
              
              <TouchableOpacity 
                style={styles.seeAllBtn}
                onPress={() => navigation.navigate('BodyProgress')}
              >
                <AppText style={styles.seeAllText}>See All Progress</AppText>
                <Feather name="arrow-right" size={16} color={Colors.BRAND} />
              </TouchableOpacity>
            </>
          ) : (
            <View style={styles.emptyProgress}>
              <Feather name="camera" size={48} color={Colors.TEXT_SECONDARY} />
              <AppText style={styles.emptyText}>No progress photos yet</AppText>
              <AppText style={styles.emptySubtext}>
                Track your transformation with {maxPhotosPerWeek} photos per week
              </AppText>
              <TouchableOpacity 
                style={styles.startBtn}
                onPress={() => navigation.navigate('BodyProgress')}
              >
                <AppText style={styles.startBtnText}>Start Tracking</AppText>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Settings Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Feather name="settings" size={20} color={Colors.BRAND} />
            <AppText font="Bold" style={styles.sectionTitle}>Settings</AppText>
          </View>
          
          <TouchableOpacity style={styles.settingItem} onPress={navigateToChangePassword}>
            <View style={styles.settingLeft}>
              <Feather name="lock" size={20} color={Colors.TEXT_SECONDARY} />
              <AppText style={styles.settingText}>Change Password</AppText>
            </View>
            <Feather name="chevron-right" size={20} color={Colors.TEXT_SECONDARY} />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.settingItem} onPress={navigateToNotifications}>
            <View style={styles.settingLeft}>
              <Feather name="bell" size={20} color={Colors.TEXT_SECONDARY} />
              <AppText style={styles.settingText}>Notifications</AppText>
            </View>
            <Feather name="chevron-right" size={20} color={Colors.TEXT_SECONDARY} />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Feather name="shield" size={20} color={Colors.TEXT_SECONDARY} />
              <AppText style={styles.settingText}>Privacy</AppText>
            </View>
            <Feather name="chevron-right" size={20} color={Colors.TEXT_SECONDARY} />
          </TouchableOpacity>
          <TouchableOpacity onPress={onLogout} style={styles.logoutBtn} disabled={isLoggingOut}>
          <View style={styles.settingLeft}>

          <Feather name="log-out" size={20} color="white" />
          <AppText font="Medium" style={styles.settingText}>
            {isLoggingOut ? 'Logging out...' : 'Logout'}
          </AppText>
          </View>
          
        </TouchableOpacity>
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>
    </CustomScreen>
  )
}

export default ClientProfileScreen

const styles = StyleSheet.create({
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
    paddingTop: 10,
  },
  headerTitle: {
    fontSize: 24,
    color: Colors.TEXT,
  },
    goalsContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 6,
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
  logoutBtn: {
    backgroundColor: Colors.ERROR,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginBottom: 8,
  },
  logoutText: {
    color: 'white',
    fontSize: 12,
  },
  scrollContent: {
    paddingBottom: 24,
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
    flex: 1,
    fontSize: 16,
    color: Colors.TEXT,
  },
  editBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: Colors.SECONDARY,
    borderRadius: 8,
  },
  editBtnText: {
    fontSize: 12,
    color: Colors.BRAND,
    fontWeight: '600',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: Colors.CARD,
    borderRadius: 12,
    marginBottom: 8,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  settingText: {
    fontSize: 14,
    color: Colors.TEXT,
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
    color: 'white',
    fontWeight: '600',
  },
  bottomSpacing: {
    height: 20,
  },
  freeBadge: {
    backgroundColor: Colors.SUCCESS,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  freeBadgeText: {
    fontSize: 10,
    color: 'white',
    fontWeight: '600',
  },
  progressPreview: {
    gap: 16,
    marginBottom: 12,
  },
  weekPreview: {
    backgroundColor: Colors.CARD,
    padding: 16,
    borderRadius: 12,
  },
  weekLabel: {
    fontSize: 14,
    color: Colors.TEXT_SECONDARY,
    marginBottom: 12,
    fontWeight: '600',
  },
  photoGrid: {
    flexDirection: 'row',
    gap: 8,
  },
  photoThumb: {
    width: 80,
    height: 80,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: Colors.SECONDARY,
  },
  thumbImage: {
    width: '100%',
    height: '100%',
  },
  photoType: {
    position: 'absolute',
    bottom: 4,
    left: 4,
    fontSize: 8,
    color: 'white',
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 4,
    textTransform: 'capitalize',
  },
  morePhotos: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  moreText: {
    fontSize: 16,
    color: Colors.TEXT,
    fontWeight: '600',
  },
  seeAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    backgroundColor: Colors.SECONDARY,
    borderRadius: 8,
  },
  seeAllText: {
    fontSize: 14,
    color: Colors.BRAND,
    fontWeight: '600',
  },
  emptyProgress: {
    alignItems: 'center',
    paddingVertical: 40,
    backgroundColor: Colors.CARD,
    borderRadius: 12,
  },
  emptyText: {
    fontSize: 16,
    color: Colors.TEXT,
    marginTop: 16,
    fontWeight: '600',
  },
  emptySubtext: {
    fontSize: 12,
    color: Colors.TEXT_SECONDARY,
    marginTop: 4,
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  startBtn: {
    marginTop: 16,
    backgroundColor: Colors.BRAND,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  startBtnText: {
    color: 'black',
    fontWeight: '600',
  },
})
