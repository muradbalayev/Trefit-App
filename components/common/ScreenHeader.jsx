 // React Native Components
import React from 'react';
import { Pressable, StyleSheet, View, Text, ViewStyle, TouchableOpacity } from 'react-native';
// Constants
import Colors from '@/constants/Colors';

import Feather from '@expo/vector-icons/Feather';
import AppText from '../ui/Text';


const ScreenHeader = ({ action, title, children, position = 'relative', actionButton }) => {
  return (
    <View style={[styles.container, { position }]}>
      <View style={{ flex: 1 }} >
      <TouchableOpacity style={styles.backButton} onPress={action}>
          <Feather name="arrow-left" size={24} color={Colors.TEXT} />
        </TouchableOpacity>
      </View>
      <View style={{ alignItems: 'center', maxWidth: '80%' }}>
        {title && <AppText style={styles.title} font="Medium">{title}</AppText>}
      </View>
      <View style={{ flex: 1, alignItems: 'flex-end' }}>
        {children || actionButton}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  title: {
    fontSize: 22,
    lineHeight: 33,
    color: Colors.TEXT,
    textAlign: 'center',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: Colors.CARD,
    alignItems: "center",
    justifyContent: "center",
  },
});

export default ScreenHeader;
