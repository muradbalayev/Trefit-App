import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import Section from '@/components/common/Section'
import Card from '@/components/common/Card'
import AppText from '@/components/ui/Text'
import Colors from '@/constants/Colors'

const ProgressSection = () => {
  return (
    <Section>
    <Card>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 8,
        }}
      >
        <View>
          <AppText font="SemiBold" style={{ fontSize: 16 }}>Progress</AppText>
          <AppText style={{ fontSize: 12, color: Colors.TEXT_SECONDARY }}>2 Meals Left</AppText>
        </View>
        <AppText font="Bold" style={{ fontSize: 16, color: Colors.TEXT_BRAND }}>75%</AppText>
      </View>
      <View style={{ height: 8, backgroundColor: Colors.BORDER, borderRadius: 5, marginTop: 8 }}>
        <View style={{ height: 8, backgroundColor: Colors.TEXT_BRAND, width: "75%", borderRadius: 5 }} />
      </View>
    </Card>
  </Section>
  )
}

export default ProgressSection

const styles = StyleSheet.create({})