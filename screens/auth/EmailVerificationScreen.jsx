import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  StyleSheet,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
} from 'react-native';
import { CustomScreen, SuccessModal } from '@/components/common';
import AppText from '@/components/ui/Text';
import Colors from '@/constants/Colors';
import Lotties from '@/constants/Lotties';
import { Feather } from '@expo/vector-icons';
import { useVerifyEmailMutation, useResendVerificationMutation } from '@/store/redux/user/services/userAuthApi';

const EmailVerificationScreen = ({ route, navigation }) => {
  const { email } = route.params || {};
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [verifyEmail, { isLoading }] = useVerifyEmailMutation();
  const [resendVerification, { isLoading: isResending }] = useResendVerificationMutation();
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showResendSuccess, setShowResendSuccess] = useState(false);
  
  const inputRefs = useRef([]);

  useEffect(() => {
    // Focus first input on mount
    inputRefs.current[0]?.focus();
  }, []);

  const handleCodeChange = (text, index) => {
    // Only allow numbers
    if (text && !/^\d+$/.test(text)) return;

    const newCode = [...code];
    newCode[index] = text;
    setCode(newCode);

    // Auto-focus next input
    if (text && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all 6 digits are entered
    if (text && index === 5 && newCode.every(digit => digit !== '')) {
      handleVerify(newCode.join(''));
    }
  };

  const handleKeyPress = (e, index) => {
    if (e.nativeEvent.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async (verificationCode = code.join('')) => {
    if (verificationCode.length !== 6) {
      Alert.alert('Error', 'Please enter all 6 digits');
      return;
    }

    try {
      await verifyEmail({ code: verificationCode }).unwrap();
      setShowSuccessModal(true);
    } catch (error) {
      Alert.alert(
        'Error',
        error?.data?.message || 'Invalid or expired verification code'
      );
      setCode(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    }
  };

  const handleResend = async () => {
    try {
      await resendVerification({ email }).unwrap();
      setShowResendSuccess(true);
      setCode(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } catch (error) {
      Alert.alert(
        'Error',
        error?.data?.message || 'Failed to resend verification code'
      );
    }
  };

  return (
    <CustomScreen>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <Feather name="mail" size={48} color={Colors.BRAND} />
            </View>
            <AppText font="Bold" style={styles.title}>
              Verify Your Email
            </AppText>
            <AppText style={styles.subtitle}>
              We've sent a 6-digit code to
            </AppText>
            <AppText font="SemiBold" style={styles.email}>
              {email}
            </AppText>
          </View>

          {/* OTP Input */}
          <View style={styles.otpContainer}>
            {code.map((digit, index) => (
              <TextInput
                key={index}
                ref={(ref) => (inputRefs.current[index] = ref)}
                style={[
                  styles.otpInput,
                  digit && styles.otpInputFilled,
                ]}
                value={digit}
                onChangeText={(text) => handleCodeChange(text, index)}
                onKeyPress={(e) => handleKeyPress(e, index)}
                keyboardType="number-pad"
                maxLength={1}
                selectTextOnFocus
                editable={!isLoading}
              />
            ))}
          </View>

          {/* Verify Button */}
          <Pressable
            style={[styles.verifyButton, isLoading && styles.buttonDisabled]}
            onPress={() => handleVerify()}
            disabled={isLoading || code.some(digit => !digit)}
          >
            <AppText font="SemiBold" style={styles.verifyButtonText}>
              {isLoading ? 'Verifying...' : 'Verify Email'}
            </AppText>
          </Pressable>

          {/* Resend */}
          <View style={styles.resendContainer}>
            <AppText style={styles.resendText}>
              Didn't receive the code?
            </AppText>
            <Pressable
              onPress={handleResend}
              disabled={isResending}
              style={styles.resendButton}
            >
              <AppText font="SemiBold" style={styles.resendButtonText}>
                {isResending ? 'Sending...' : 'Resend Code'}
              </AppText>
            </Pressable>
          </View>

          {/* Back to Login */}
          <Pressable
            style={styles.backButton}
            onPress={() => navigation.navigate('Login')}
          >
            <Feather name="arrow-left" size={20} color={Colors.TEXT_SECONDARY} />
            <AppText style={styles.backButtonText}>
              Back to Login
            </AppText>
          </Pressable>
        </View>
      </KeyboardAvoidingView>

      {/* Success Modal - Email Verified */}
      <SuccessModal
        visible={showSuccessModal}
        title="Email Verified!"
        message="Your email has been verified successfully."
        subMessage="You can now login to your account."
        buttonText="Go to Login"
        onClose={() => {
          setShowSuccessModal(false);
          navigation.navigate('Login');
        }}
        animationSource={Lotties.success}
        animationLoop={false}
        animationAutoPlay={true}
      />

      {/* Success Modal - Code Resent */}
      <SuccessModal
        visible={showResendSuccess}
        title="Code Sent!"
        message="A new verification code has been sent to your email."
        subMessage="Please check your inbox and enter the code."
        buttonText="Got it"
        onClose={() => setShowResendSuccess(false)}
        animationSource={Lotties.success}
        animationLoop={false}
        animationAutoPlay={true}
      />
    </CustomScreen>
  );
};

export default EmailVerificationScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: `${Colors.BRAND}20`,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    color: Colors.TEXT,
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 15,
    color: Colors.TEXT_SECONDARY,
    marginBottom: 8,
  },
  email: {
    fontSize: 16,
    color: Colors.BRAND,
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 32,
    gap: 8,
  },
  otpInput: {
    flex: 1,
    height: 56,
    borderWidth: 2,
    borderColor: Colors.BORDER,
    borderRadius: 12,
    textAlign: 'center',
    fontSize: 24,
    fontWeight: '600',
    color: Colors.TEXT,
    backgroundColor: Colors.CARD,
  },
  otpInputFilled: {
    borderColor: Colors.BRAND,
    backgroundColor: `${Colors.BRAND}10`,
  },
  verifyButton: {
    backgroundColor: Colors.BRAND,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 24,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  verifyButtonText: {
    fontSize: 16,
    color: Colors.TEXT_BLACK,
  },
  resendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 32,
  },
  resendText: {
    fontSize: 14,
    color: Colors.TEXT_SECONDARY,
  },
  resendButton: {
    paddingVertical: 4,
  },
  resendButtonText: {
    fontSize: 14,
    color: Colors.BRAND,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
  },
  backButtonText: {
    fontSize: 14,
    color: Colors.TEXT_SECONDARY,
  },
});
