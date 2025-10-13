import { View, StyleSheet } from 'react-native'
import React from 'react'
import AppText from '../ui/Text'

const Section = ({ children, title }) => {
  return (
    <View style={styles.container}>
      {title && <AppText font="SemiBold" style={styles.title}>{title}</AppText>}
      {children}
    </View>
  )
}

const styles = StyleSheet.create({
    container: {
        paddingTop: 20,
        flex: 1,
    },
    title: {
        fontSize: 16,
        marginBottom: 10,
    },
})

export default Section