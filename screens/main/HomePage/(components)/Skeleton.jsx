import React from 'react';
import { View, StyleSheet, Animated, Easing } from 'react-native';
import Card from '@/components/common/Card';
import Colors from '@/constants/Colors';

const Skeleton = () => {
  const shimmer = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    const animation = Animated.loop(
      Animated.timing(shimmer, {
        toValue: 1,
        duration: 1200,
        easing: Easing.linear,
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
    outputRange: [-150, 150],
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
    <Card>
      <View style={styles.row}>
        {renderPlaceholder(styles.avatar)}
        <View style={styles.textContainer}>
          {renderPlaceholder(styles.lineLarge)}
          {renderPlaceholder(styles.lineMedium)}
          {renderPlaceholder(styles.lineSmall)}
        </View>
      </View>
      <View style={styles.actions}>
        {renderPlaceholder(styles.button)}
      </View>
    </Card>
  );
};

export default Skeleton;

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  textContainer: {
    flex: 1,
    gap: 8,
  },
  actions: {
    marginTop: 20,
  },
  placeholder: {
    backgroundColor: Colors.BORDER,
    overflow: 'hidden',
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  lineLarge: {
    height: 18,
    borderRadius: 8,
    width: '60%',
  },
  lineMedium: {
    height: 16,
    borderRadius: 8,
    width: '45%',
  },
  lineSmall: {
    height: 12,
    borderRadius: 8,
    width: '35%',
  },
  button: {
    height: 40,
    borderRadius: 12,
    width: '100%',
  },
  shimmer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 80,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
});
