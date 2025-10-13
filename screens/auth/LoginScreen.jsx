import { StyleSheet, View, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, Alert } from 'react-native'
import React, { useState } from 'react'
import { useNavigation } from '@react-navigation/native'
import { useLoginMutation, checkApiConnection } from '@/store/redux/user/services/userAuthApi'
import { saveTokens } from '@/store/redux/user/services/userAuthApi'
import Colors from '@/constants/Colors'
import { CustomScreen, Input, SuccessModal } from '@/components/common'
import AppText from '@/components/ui/Text'

const LoginScreen = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [isTestingConnection, setIsTestingConnection] = useState(false)
  const [showPendingModal, setShowPendingModal] = useState(false)
  const [pendingMessage, setPendingMessage] = useState('')
  const navigation = useNavigation()
  const [login, { isLoading, error }] = useLoginMutation()

  // Test server connectivity
  const testServerConnection = async () => {
    setIsTestingConnection(true)
    setErrorMessage('')
    
    try {
      const result = await checkApiConnection()
      
      if (result.success) {
        Alert.alert(
          'Server Connection Test',
          `Success! Server is accessible.\n\nServer message: ${result.data.message}\nTimestamp: ${result.data.timestamp}`,
          [{ text: 'OK' }]
        )
      } else {
        setErrorMessage(`Server connection failed: ${result.error}. Make sure the server is running and accessible.`)
      }
    } catch (error) {
      console.error('Connection test error:', error)
      setErrorMessage(`Server connection failed: ${error.message}. Make sure the server is running and accessible.`)
    } finally {
      setIsTestingConnection(false)
    }
  }

  const handleLogin = async () => {
    setErrorMessage('')
    
    if (!email || !password) {
      setErrorMessage('Please enter both email and password')
      return
    }

    try {
      const result = await login({ email, password }).unwrap()
      console.log(result)
      
      // The token will be saved in secure storage and Redux state will be updated by the API
      if (result?.accessToken && result?.refreshToken) {
        await saveTokens(result.accessToken, result.refreshToken)
      }
    } catch (err) {
      console.error('Login error:', err)
      
      // Check if trainer account is pending or rejected
      if (err.data?.isPending) {
        setPendingMessage(err.data.message)
        setShowPendingModal(true)
        return
      }
      
      if (err.data?.isRejected) {
        setErrorMessage(err.data.message)
        return
      }
      
      if (err.error === 'TypeError: Network request failed') {
        setErrorMessage('Network error: Cannot connect to server. Please check your internet connection and make sure the server is running.')
      } else if (err.data?.message) {
        setErrorMessage(err.data.message)
      } else {
        setErrorMessage('Login failed. Please try again.')
      }
    }
  }

  return (
    <CustomScreen>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <View style={styles.header}>
            <AppText style={styles.title}>Welcome Back</AppText>
            <AppText style={styles.subtitle}>Sign in to continue</AppText>
          </View>

          <View style={styles.form}>
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

            {/* Forgot Password */}
            <TouchableOpacity 
              style={styles.forgotPasswordContainer}
              onPress={() => navigation.navigate('ForgotPassword')}
            >
              <AppText style={styles.forgotPasswordText}>Forgot password?</AppText>
            </TouchableOpacity>

            {/* Error Message */}
            {(error || errorMessage) && (
              <View style={styles.errorContainer}>
                <AppText style={styles.errorText}>
                  {errorMessage || error?.data?.message || 'Login failed. Please try again.'}
                </AppText>
              </View>
            )}

            {/* Login Button */}
            <TouchableOpacity 
              style={styles.loginButton} 
              onPress={handleLogin}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="black" />
              ) : (
                <AppText style={styles.loginButtonText}>Login</AppText>
              )}
            </TouchableOpacity>

            {/* Register Link */}
            <View style={styles.registerContainer}>
              <AppText style={styles.registerText}>Don't have an account? </AppText>
              <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                <AppText style={styles.registerLink}>Sign up</AppText>
              </TouchableOpacity>
            </View>
            
            {/* Test Connection Button */}
            <TouchableOpacity 
              style={styles.testButton} 
              onPress={testServerConnection}
              disabled={isTestingConnection}
            >
              {isTestingConnection ? (
                <ActivityIndicator color="black" size="small" />
              ) : (
                <AppText style={styles.testButtonText}>Test Server Connection</AppText>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Pending Approval Modal */}
      <SuccessModal
        visible={showPendingModal}
        title="Hesabınız Yoxlanılır"
        message={pendingMessage}
        subMessage="Zəhmət olmasa gözləyin."
        buttonText="Bağla"
        onClose={() => setShowPendingModal(false)}
        iconName="clock"
        iconColor={Colors.WARNING}
      />
    </CustomScreen>
  )
}

export default LoginScreen

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
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
  forgotPasswordContainer: {
    alignItems: 'flex-end',
    marginBottom: 20,
  },
  forgotPasswordText: {
    color: Colors.PRIMARY,
    fontSize: 14,
  },
  errorContainer: {
    backgroundColor: 'rgba(255, 0, 0, 0.1)',
    padding: 10,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorText: {
    color: '#ff3b30',
    fontSize: 14,
    textAlign: 'center',
  },
  loginButton: {
    backgroundColor: Colors.PRIMARY,
    borderRadius: 8,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  loginButtonText: {
    color: 'black',
    fontSize: 16,
    fontWeight: 'bold',
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  registerText: {
    color: Colors.TEXT_SECONDARY,
    fontSize: 14,
  },
  registerLink: {
    color: Colors.PRIMARY,
    fontSize: 14,
    fontWeight: 'bold',
  },
  testButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    borderWidth: 1,
    borderColor: Colors.BORDER,
  },
  testButtonText: {
    color: Colors.TEXT_SECONDARY,
    fontSize: 14,
  },
})