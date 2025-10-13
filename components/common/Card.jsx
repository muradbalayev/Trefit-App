import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import Colors from '@/constants/Colors'

const Card = ({ children, mode = "glass", style }) => {
  return (
    <View style={[styles[mode], style]}>
      {children}
    </View>
  )
}

export default Card

const styles = StyleSheet.create({
    brand: {
        backgroundColor: Colors.BRAND,
        borderWidth: 1,
        borderRadius: 16,
        padding: 16,
    },
    glass: {
        backgroundColor: Colors.CARD,
        borderColor: Colors.BORDER,
        borderWidth: 1,
        borderRadius: 16,
        padding: 16,
    },
})