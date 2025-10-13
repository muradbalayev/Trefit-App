import React from 'react'
import { View, StyleSheet, Image, Pressable, ActivityIndicator } from 'react-native'
import AppText from '@/components/ui/Text'
import Colors from '@/constants/Colors'
import Section from '@/components/common/Section'
import Card from '@/components/common/Card'
import { useNavigation } from '@react-navigation/native'
import { useGetMyTrainerQuery } from '@/store/redux/user/services/userTrainerApi'
import { getAvatarUrl } from '@/constants/Paths'

export default function MyCoachSection() {
  const navigation = useNavigation()
  const { data: trainer, isLoading, error } = useGetMyTrainerQuery()

  const handleOpenChat = () => {
    if (trainer?._id) {
      navigation.navigate('ChatMessages', {
        recipientId: trainer._id,
        recipientName: trainer.name,
        recipientType: 'trainer'
      })
    }
  }

  // Don't show section if no trainer or error
  if (error || !trainer) {
    return null
  }

  // Show loading state
  if (isLoading) {
    return (
      <Section>
        <AppText font="Bold" style={styles.title}>Your Coach</AppText>
        <Card>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color={Colors.BRAND} />
          </View>
        </Card>
      </Section>
    )
  }

  return (
    <Section>
      <AppText font="Bold" style={styles.title}>Your Coach</AppText>
      <Card>
        <View style={styles.row}>
          {trainer.avatar ? (
            <Image
              source={{ uri: getAvatarUrl(trainer.avatar, 'webp') }}
              style={styles.avatar}
            />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <AppText font="Bold" style={styles.avatarText}>
                {trainer.name?.charAt(0) || 'T'}
              </AppText>
            </View>
          )}
          <View style={{ flex: 1 }}>
            <AppText font="SemiBold" style={styles.trainerName}>{trainer.name}</AppText>
            <AppText style={styles.trainerMeta}>@{trainer.username}</AppText>
            {trainer.specialty && (
              <AppText style={styles.planMeta}>{trainer.specialty}</AppText>
            )}
            {trainer.currentPlan?.title && (
              <AppText style={styles.planMeta}>Plan: {trainer.currentPlan.title}</AppText>
            )}
          </View>
        </View>

        <View style={styles.actions}>
          <Pressable style={[styles.btn, styles.brand]} onPress={handleOpenChat}>
            <AppText font="SemiBold" style={styles.brandText}>Open Chat</AppText>
          </Pressable>
        </View>
      </Card>
    </Section>
  )
}

const styles = StyleSheet.create({
  title: {
    fontSize: 20,
    color: Colors.TEXT_BRAND,
    marginBottom: 8,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  avatarPlaceholder: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.BRAND,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 20,
    color: '#000',
  },
  trainerName: {
    fontSize: 16,
  },
  trainerMeta: {
    color: Colors.TEXT_SECONDARY,
    fontSize: 12,
    marginTop: 2,
  },
  planMeta: {
    color: Colors.TEXT_SECONDARY,
    fontSize: 12,
    marginTop: 4,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
  },
  btn: {
    flex: 1,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.BORDER,
  },
  brand: {
    backgroundColor: Colors.BRAND,
    borderColor: Colors.BRAND,
  },
  brandText: {
    color: '#000',
    fontSize: 14,
  },
  ghost: {
    backgroundColor: Colors.CARD,
  },
  ghostText: {
    color: Colors.TEXT,
    fontSize: 14,
  },
})
