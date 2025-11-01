import React from "react";
import { View, StyleSheet, Animated, Easing } from "react-native";
import Colors from "@/constants/Colors";

const ClientCardSkeleton = () => {
  const shimmer = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    const animation = Animated.loop(
      Animated.timing(shimmer, {
        toValue: 1,
        duration: 1500,
        easing: Easing.ease,
        useNativeDriver: true,
      })
    );

    animation.start();

    return () => {
      animation.stop();
      shimmer.setValue(0);
    };
  }, [shimmer]);

  const translateX = shimmer.interpolate({
    inputRange: [0, 1],
    outputRange: [-200, 200],
  });

  const renderPlaceholder = (style) => (
    <View style={[styles.placeholder, style]}>
      <Animated.View
        pointerEvents="none"
        style={[
          styles.shimmer,
          {
            transform: [{ translateX }],
          },
        ]}
      />
    </View>
  );

  return (
    <View style={styles.card}>
      {/* Header */}
      <View style={styles.header}>
        {renderPlaceholder(styles.avatar)}
        <View style={styles.info}>
          {renderPlaceholder(styles.name)}
          {renderPlaceholder(styles.plan)}
        </View>
        {renderPlaceholder(styles.chevron)}
      </View>

      {/* Stats Grid */}
      <View style={styles.statsGrid}>
        {[1, 2, 3, 4].map((i) => (
          <View key={i} style={styles.statItem}>
            {renderPlaceholder(styles.statIcon)}
            {renderPlaceholder(styles.statValue)}
            {renderPlaceholder(styles.statLabel)}
          </View>
        ))}
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        {renderPlaceholder(styles.footerItem)}
        {renderPlaceholder(styles.footerItem)}
        {renderPlaceholder(styles.footerItem)}
      </View>
    </View>
  );
};

export default ClientCardSkeleton;

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.CARD,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.BORDER,
    gap: 12,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  info: {
    flex: 1,
    gap: 8,
  },
  name: {
    height: 16,
    width: "60%",
    borderRadius: 8,
  },
  plan: {
    height: 12,
    width: "45%",
    borderRadius: 6,
  },
  chevron: {
    width: 20,
    height: 20,
    borderRadius: 10,
  },
  statsGrid: {
    flexDirection: "row",
    gap: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: Colors.BORDER,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
    gap: 4,
  },
  statIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
  },
  statValue: {
    height: 14,
    width: "70%",
    borderRadius: 7,
  },
  statLabel: {
    height: 10,
    width: "50%",
    borderRadius: 5,
  },
  footer: {
    flexDirection: "row",
    gap: 12,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: Colors.BORDER,
  },
  footerItem: {
    height: 12,
    flex: 1,
    borderRadius: 6,
  },
  placeholder: {
    backgroundColor: Colors.BORDER,
    overflow: "hidden",
  },
  shimmer: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    width: 100,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
  },
});
