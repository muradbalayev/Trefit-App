import React from "react";
import { View, StyleSheet } from "react-native";
import Colors from "@/constants/Colors";
import LottieView from "lottie-react-native";
import Lotties from "@/constants/Lotties";

const Loading = () => {
  return (
    <View style={styles.container}>
      <LottieView
        source={Lotties.loadingLottie}
        autoPlay 
        loop 
        style={{ width: 200, height: 200 }} />
      {/* <ActivityIndicator size="large" color={Colors.PRIMARY} /> */}
    </View>
  );
};

export default Loading;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    height: "100%",
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.BACKGROUND,
  },
});
