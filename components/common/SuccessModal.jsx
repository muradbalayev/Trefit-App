import React from 'react';
import { View, StyleSheet, Modal, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import LottieView from 'lottie-react-native';
import AppText from '@/components/ui/Text';
import Colors from '@/constants/Colors';

/**
 * Success Modal Component
 * @param {boolean} visible - Modal visibility
 * @param {string} title - Modal title
 * @param {string} message - Main message
 * @param {string} subMessage - Optional sub message
 * @param {string} buttonText - Button text (default: "Bağla")
 * @param {Function} onClose - Function to call when modal is closed
 * @param {string} secondaryButtonText - Secondary button text (optional)
 * @param {Function} onSecondaryPress - Secondary button action (optional)
 * @param {string} iconName - Feather icon name (default: "check-circle")
 * @param {string} iconColor - Icon color (default: Colors.SUCCESS)
 * @param {object} animationSource - Optional Lottie animation source
 * @param {boolean} animationLoop - Whether the Lottie animation should loop (default: true)
 * @param {boolean} animationAutoPlay - Whether the animation should auto play (default: true)
 * @param {object} animationStyle - Optional style overrides for the animation
 */
const SuccessModal = ({
  visible,
  title,
  message,
  subMessage,
  buttonText = 'Close',
  onClose,
  secondaryButtonText,
  onSecondaryPress,
  iconName = 'check-circle',
  iconColor = Colors.SUCCESS,
  animationSource,
  animationLoop = true,
  animationAutoPlay = true,
  animationStyle,
}) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalIconContainer}>
            {animationSource ? (
              <LottieView
                source={animationSource}
                autoPlay={animationAutoPlay}
                loop={animationLoop}
                style={[styles.animation, animationStyle]}
              />
            ) : (
              <Feather name={iconName} size={64} color={iconColor} />
            )}
          </View>
          
          {title && (
            <AppText font="Bold" style={styles.modalTitle}>
              {title}
            </AppText>
          )}
          
          {message && (
            <AppText style={styles.modalMessage}>
              {message}
            </AppText>
          )}
          
          {subMessage && (
            <AppText style={styles.modalSubMessage}>
              {subMessage}
            </AppText>
          )}
          
          <View style={styles.buttonContainer}>
            {secondaryButtonText && onSecondaryPress && (
              <TouchableOpacity
                style={[styles.modalButton, styles.secondaryButton]}
                onPress={onSecondaryPress}
              >
                <Feather name="upload" size={18} color={Colors.PRIMARY} />
                <AppText font="SemiBold" style={styles.secondaryButtonText}>
                  {secondaryButtonText}
                </AppText>
              </TouchableOpacity>
            )}
            
            <TouchableOpacity
              style={[
                styles.modalButton, 
                secondaryButtonText ? styles.primaryButton : styles.fullButton
              ]}
              onPress={onClose}
            >
              <AppText font="SemiBold" style={styles.modalButtonText}>
                {buttonText}
              </AppText>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default SuccessModal;

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: Colors.CARD,
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    width: '100%',
    maxWidth: 400,
  },
  modalIconContainer: {
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 24,
    color: Colors.TEXT,
    marginBottom: 16,
    textAlign: 'center',
  },
  modalMessage: {
    fontSize: 16,
    color: Colors.TEXT,
    textAlign: 'center',
    marginBottom: 12,
    lineHeight: 24,
  },
  modalSubMessage: {
    fontSize: 14,
    color: Colors.TEXT_SECONDARY,
    textAlign: 'center',
    marginBottom: 24,
  },
  buttonContainer: {
    width: '100%',
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  fullButton: {
    backgroundColor: Colors.BRAND,
    width: '100%',
  },
  primaryButton: {
    backgroundColor: Colors.BRAND,
    flex: 1,
  },
  secondaryButton: {
    backgroundColor: Colors.PRIMARY + '20',
    borderWidth: 2,
    borderColor: Colors.PRIMARY,
    flex: 1,
  },
  modalButtonText: {
    color: 'black',
    fontSize: 16,
  },
  secondaryButtonText: {
    color: Colors.PRIMARY,
    fontSize: 16,
  },
});
