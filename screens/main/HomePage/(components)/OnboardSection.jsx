import React from 'react'
import { View, StyleSheet, Pressable, ActivityIndicator, Image } from 'react-native'
import AppText from '@/components/ui/Text'
import Colors from '@/constants/Colors'
import Section from '@/components/common/Section'
import { useNavigation } from '@react-navigation/native'
import heroImage from '@/assets/images/bg/fit2.png'

export default function OnboardSection() {
  const navigation = useNavigation()

 
  return (
    <Section>
      <View style={styles.wrap}>
        <View style={styles.artWrap}>
          <Image source={heroImage} style={styles.hero} resizeMode="contain" />
        </View>
        <AppText font="Bold" style={styles.title}>Find your coach, start your journey</AppText>
        <AppText style={styles.subtitle}>Browse trainers, pick a plan, chat instantly, and begin guided sessions tailored to your goals.</AppText>
        <Pressable style={styles.cta} onPress={() => navigation.navigate('Trainers')}>
          <AppText font="SemiBold" style={styles.ctaText}>Explore Trainers</AppText>
        </Pressable>
      </View>
    </Section>
  )
}

const styles = StyleSheet.create({
  wrap: {
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  artWrap: {
    width: '100%',
    height:200,
    marginBottom: 12,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  hero: {
    width: '100%',
    height: '100%',
  },
  title: {
    fontSize: 22,
    color: Colors.TEXT_BRAND,
    textAlign: 'center',
  },
  subtitle: {
    color: Colors.TEXT_SECONDARY,
    fontSize: 14,
    textAlign: 'center',
    marginTop: 6,
    marginBottom: 12,
  },
  cta: {
    backgroundColor: Colors.BRAND,
    paddingHorizontal: 16,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaText: {
    color: '#000',
    fontSize: 14,
  }
})
