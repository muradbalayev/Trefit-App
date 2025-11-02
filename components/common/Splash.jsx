import React from 'react';
import { View, Image, StyleSheet } from 'react-native';
import Images from '@/constants/Images';
import Colors from '@/constants/Colors';

const Splash = () => {
  return (
    <View style={styles.container}>
      <Image style={styles.logo} source={Images.splashIcon} />
    </View>
  );
};

export default Splash;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.BACKGROUND,
  },
  logo: {
    maxWidth: 200,
    resizeMode: 'contain',
  },
});
