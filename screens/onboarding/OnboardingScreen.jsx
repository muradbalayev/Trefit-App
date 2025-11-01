import React, { useState, useRef } from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  Pressable,
  Animated,
  StatusBar,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LottieView from 'lottie-react-native';
import AppText from '@/components/ui/Text';
import Colors from '@/constants/Colors';
import Lotties from '@/constants/Lotties';

const { width, height } = Dimensions.get('window');

const ONBOARDING_DATA = [
  {
    id: 0,
    title: 'Welcome to Trefit',
    subtitle: 'Your fitness journey starts here.',
    animation: Lotties.welcome,
  },
  {
    id: 1,
    title: 'Find the right trainer for your goals',
    subtitle: 'Choose certified trainers across fitness, pilates, and strength — all in one app.',
    animation: Lotties.onboarding2,
  },
  {
    id: 2,
    title: 'Turn effort into progress',
    subtitle: 'Complete daily tasks, earn points, and track your body progress visually.',
    animation: Lotties.onboarding1,
  },
//   {
//     id: 3,
//     title: 'Fitness, made simple',
//     subtitle: 'Chat with your trainer, follow custom plans, and see real results.',
//     animation: Lotties.onboarding1,
//   },
];

const OnboardingScreen = () => {
  const navigation = useNavigation();
  const [currentIndex, setCurrentIndex] = useState(0);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;

  const handleNext = () => {
    if (currentIndex < ONBOARDING_DATA.length - 1) {
      // Fade out and slide
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: -50,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setCurrentIndex(currentIndex + 1);
        slideAnim.setValue(50);
        // Fade in and slide back
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(slideAnim, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
        ]).start();
      });
    } else {
      handleGetStarted();
    }
  };

//   const handleSkip = async () => {
//     await AsyncStorage.setItem('hasSeenOnboarding', 'true');
//     // AppNavigator will automatically detect the change and navigate to Auth
//   };

  const handleGetStarted = async () => {
    await AsyncStorage.setItem('hasSeenOnboarding', 'true');
    // AppNavigator will automatically detect the change and navigate to Auth
  };

  const currentData = ONBOARDING_DATA[currentIndex];
  const isLastScreen = currentIndex === ONBOARDING_DATA.length - 1;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.BACKGROUND} />
      
      {/* Skip Button */}
      {/* {!isLastScreen && (
        <Pressable style={styles.skipButton} onPress={handleSkip}>
          <AppText style={styles.skipText}>Skip</AppText>
        </Pressable>
      )} */}

      {/* Content */}
      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ translateX: slideAnim }],
          },
        ]}
      >
        {/* Lottie Animation */}
        <View style={styles.animationContainer}>
          <LottieView
            source={currentData.animation}
            autoPlay
            loop
            style={styles.animation}
          />
        </View>

        {/* Text Content */}
        <View style={styles.textContainer}>
          <AppText font="Bold" style={styles.title}>
            {currentData.title}
          </AppText>
          <AppText style={styles.subtitle}>
            {currentData.subtitle}
          </AppText>
        </View>
      </Animated.View>

      {/* Bottom Section */}
      <View style={styles.bottomSection}>
        {/* Pagination Dots */}
        <View style={styles.pagination}>
          {ONBOARDING_DATA.map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                index === currentIndex && styles.activeDot,
              ]}
            />
          ))}
        </View>

        {/* Next/Get Started Button */}
        <Pressable
          style={styles.nextButton}
          onPress={handleNext}
          android_ripple={{ color: 'rgba(0,0,0,0.2)' }}
        >
          <AppText font="Bold" style={styles.nextButtonText}>
            {isLastScreen ? 'Get Started' : 'Next'}
          </AppText>
        </Pressable>
      </View>
    </View>
  );
};

export default OnboardingScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.BACKGROUND,
  },
  skipButton: {
    position: 'absolute',
    top: 50,
    right: 24,
    zIndex: 10,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  skipText: {
    color: Colors.TEXT_SECONDARY,
    fontSize: 16,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  animationContainer: {
    width: width * 0.8,
    height: height * 0.4,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
  },
  animation: {
    width: '100%',
    height: '100%',
  },
  textContainer: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 28,
    color: Colors.TEXT,
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 36,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.TEXT_SECONDARY,
    textAlign: 'center',
    lineHeight: 24,
  },
  bottomSection: {
    paddingHorizontal: 24,
    paddingBottom: 50,
    alignItems: 'center',
  },
  pagination: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 32,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.BORDER,
    marginHorizontal: 4,
  },
  activeDot: {
    width: 24,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.BRAND,
  },
  nextButton: {
    width: '100%',
    height: 56,
    backgroundColor: Colors.BRAND,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.BRAND,
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  nextButtonText: {
    fontSize: 18,
    color: '#000000',
    letterSpacing: 0.5,
  },
});
