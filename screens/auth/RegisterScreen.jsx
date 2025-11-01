import { StyleSheet, View, TouchableOpacity, ActivityIndicator, ScrollView, Alert, KeyboardAvoidingView, Platform } from 'react-native'
import React, { useState } from 'react'
import { useNavigation } from '@react-navigation/native'
import Colors from '@/constants/Colors'
import { CustomScreen, Input } from '@/components/common'
import AppText from '@/components/ui/Text'
import { useRegisterMutation } from '@/store/redux/user/services/userAuthApi'

const RegisterScreen = () => {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [register, { isLoading }] = useRegisterMutation()
  const [errorMsg, setErrorMsg] = useState('')
  const navigation = useNavigation()

  const handleRegister = async (role = 'client') => {
    setErrorMsg('')
    if (!name || !email || !password || !confirmPassword) {
      setErrorMsg('All fields are required')
      return
    }
    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match')
      return
    }
    try {
      const res = await register({ name, email, password, role }).unwrap()
      // Navigate to email verification screen
      navigation.navigate('EmailVerification', { email })
    } catch (e) {
      const msg = e?.data?.message || 'Registration failed. Please try again.'
      setErrorMsg(msg)
    }
  }

  return (
    <CustomScreen>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardContainer}
      >
        <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <AppText style={styles.title}>Create Account</AppText>
          <AppText style={styles.subtitle}>Sign up to get started</AppText>
        </View>

        <View style={styles.form}>
          {/* Name Input */}
          <Input
            value={name}
            onChangeText={setName}
            placeholder="Full Name"
            iconName="user"
            autoCapitalize="words"
          />

          {/* Email Input */}
          <Input
            value={email}
            onChangeText={setEmail}
            placeholder="Email Address"
            iconName="mail"
            keyboardType="email-address"
            autoCapitalize="none"
          />

          {/* Password Input */}
          <Input
            value={password}
            onChangeText={setPassword}
            placeholder="Password"
            iconName="lock"
            isPassword
          />

          {/* Confirm Password Input */}
          <Input
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholder="Confirm Password"
            iconName="lock"
            isPassword
          />

          {/* Register Button */}
          <TouchableOpacity 
            style={styles.registerButton} 
            onPress={() => handleRegister('client')}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="black" />
            ) : (
              <AppText style={styles.registerButtonText}>Create Account</AppText>
            )}
          </TouchableOpacity>

          {/* Error message */}
          {errorMsg ? (
            <View style={{ marginBottom: 10 }}>
              <AppText style={{ color: Colors.ERROR, fontSize: 12 }}>{errorMsg}</AppText>
            </View>
          ) : null}

          {/* Sign up as Trainer */}
          <TouchableOpacity 
            style={styles.trainerButton}
            onPress={() => navigation.navigate('RegisterAsTrainer')}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color={Colors.TEXT} />
            ) : (
              <AppText style={styles.trainerButtonText}>Sign up as a Trainer</AppText>
            )}
          </TouchableOpacity>

          {/* Login Link */}
          <View style={styles.loginContainer}>
            <AppText style={styles.loginText}>Already have an account? </AppText>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <AppText style={styles.loginLink}>Sign in</AppText>
            </TouchableOpacity>
          </View>
        </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </CustomScreen>
  )
}

const styles = StyleSheet.create({
  keyboardContainer: {
    flex: 1,
  },
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.TEXT,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.TEXT_SECONDARY,
  },
  form: {
    width: '100%',
  },
  registerButton: {
    backgroundColor: Colors.PRIMARY,
    borderRadius: 8,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  registerButtonText: {
    color: 'black',
    fontSize: 16,
    fontWeight: 'bold',
  },
  trainerButton: {
    backgroundColor: Colors.CARD,
    borderColor: Colors.BORDER,
    borderWidth: 1,
    borderRadius: 8,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  trainerButtonText: {
    color: Colors.TEXT,
    fontSize: 14,
    fontWeight: '600',
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  loginText: {
    color: Colors.TEXT_SECONDARY,
    fontSize: 14,
  },
  loginLink: {
    color: Colors.PRIMARY,
    fontSize: 14,
    fontWeight: 'bold',
  },
})

export default RegisterScreen