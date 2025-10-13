import { StyleSheet, View, Image } from "react-native";
import React, { useEffect, useRef } from "react";
import { useNavigation } from "@react-navigation/native";
import { useSelector } from "react-redux";
import Images from "@/constants/Images";
import Colors from "@/constants/Colors";
import { useLoadFonts } from "@/hooks/useLoadFonts";
import { CustomScreen } from "@/components/common";

const SplashScreen = () => {
  const fontsLoaded = useLoadFonts();
  const navigation = useNavigation();
  const { isAuthenticated } = useSelector(state => state.userAuth);
  const hasNavigated = useRef(false);

  useEffect(() => {
    // Only navigate once and only if not authenticated
    if (fontsLoaded && !isAuthenticated && !hasNavigated.current) {
      hasNavigated.current = true;
      const timer = setTimeout(() => {
        navigation.replace('Login');
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [fontsLoaded, isAuthenticated, navigation]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <CustomScreen>
      <View style={styles.root}>
        <Image style={styles.logo} source={Images.logo} />
      </View>
    </CustomScreen>
  );
};

export default SplashScreen;

const styles = StyleSheet.create({
  root: {
    flex: 1,
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.BACKGROUND,
  },
  logo: {
    maxWidth: 200,
    resizeMode: "contain",
  },
});
