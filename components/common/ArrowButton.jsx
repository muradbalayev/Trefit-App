import { Pressable, StyleSheet, Text, View } from 'react-native'
import React from 'react'
import Colors from '@/constants/Colors'
import { Feather } from '@expo/vector-icons'

const ArrowButton = ({ onPress }) => {
  return (
    <Pressable style={styles.arrowButton} onPress={onPress}>
            <Feather name="arrow-right" size={16} color={Colors.TEXT_BLACK} />
    </Pressable>
  )
}

export default ArrowButton

const styles = StyleSheet.create({
    arrowButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: Colors.BRAND,
        gap: 8,
        padding: 10,
        transform: [{ rotate: '-45deg' }],
        borderRadius: 100,
    }
})