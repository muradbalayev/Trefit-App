import React from 'react';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import Colors from '@/constants/Colors';

const Loading = () => {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={Colors.PRIMARY} />
    </View>
  );
};

export default Loading;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.BACKGROUND,
  },
});
