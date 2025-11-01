import React, { useState, useMemo } from 'react'
import { View, StyleSheet, Pressable, Alert } from 'react-native'
import { CustomScreen, Input, SuccessModal } from '@/components/common'
import AppText from '@/components/ui/Text'
import Colors from '@/constants/Colors'
import Lotties from '@/constants/Lotties'
import { useSetUsernameMutation } from '@/store/redux/user/services/userAccountApi'

const SetUsernameScreen = () => {
  const [username, setUsername] = useState('')
  const [touched, setTouched] = useState(false)
  const [setUsernameReq, { isLoading }] = useSetUsernameMutation()
  const [showSuccessModal, setShowSuccessModal] = useState(false)

  const error = useMemo(() => {
    if (!touched) return ''
    if (!username) return 'Username is required'
    // Only lowercase letters, numbers, dot and underscore (no dash)
    if (!/^[a-z0-9_.]{3,20}$/.test(username)) {
      return 'Username must be 3-20 characters: lowercase letters, numbers, dot (.) and underscore (_) only'
    }
    // Cannot start or end with dot or underscore
    if (/^[._]|[._]$/.test(username)) {
      return 'Username cannot start or end with dot or underscore'
    }
    // Cannot have consecutive dots or underscores
    if (/[._]{2,}/.test(username)) {
      return 'Username cannot have consecutive dots or underscores'
    }
    return ''
  }, [username, touched])

  const canSubmit = username.length >= 3 && !error

  const onSubmit = async () => {
    setTouched(true)
    if (!canSubmit) return
    try {
      await setUsernameReq({ username }).unwrap()
      // After success, AppNavigator will re-render (account invalidated) and route to UserNavigator
      setShowSuccessModal(true)
    } catch (e) {
      const msg = e?.data?.message || 'Failed to set username. Try a different one.'
      Alert.alert('Error', msg)
    }
  }

  return (
    <CustomScreen>
      <View style={styles.container}>
        <AppText font="Bold" style={styles.title}>Choose your username</AppText>
        <AppText style={styles.subtitle}>This will be your unique identity.</AppText>

        <View style={styles.field}>
          <Input
            value={username}
            onChangeText={(text) => {
              // Convert to lowercase and remove invalid characters
              const cleaned = text.toLowerCase().replace(/[^a-z0-9_.]/g, '');
              setUsername(cleaned);
            }}
            placeholder="e.g. murad.balazada"
            autoCapitalize="none"
            autoCorrect={false}
            onBlur={() => setTouched(true)}
          />
          {error ? <AppText style={styles.error}>{error}</AppText> : null}
        </View>

        <Pressable onPress={onSubmit} disabled={!canSubmit || isLoading} style={[
          styles.button,
          (!canSubmit || isLoading) && { opacity: 0.6 }
        ]}>
          <AppText font="SemiBold" style={styles.buttonText}>{isLoading ? 'Saving...' : 'Continue'}</AppText>
        </Pressable>
      </View>

      {/* Success Modal */}
      <SuccessModal
        visible={showSuccessModal}
        title="Username Set!"
        message={`Your username @${username} has been set successfully.`}
        subMessage="You can now start using the app."
        buttonText="Let's Go"
        onClose={() => setShowSuccessModal(false)}
        animationSource={Lotties.success}
        animationLoop={false}
        animationAutoPlay={true}
      />
    </CustomScreen>
  )
}

export default SetUsernameScreen

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: 22,
    color: Colors.TEXT,
  },
  subtitle: {
    marginTop: 6,
    color: Colors.TEXT_SECONDARY,
    fontSize: 13,
  },
  field: {
    marginTop: 20,
  },
  error: {
    marginTop: 6,
    color: Colors.ERROR,
    fontSize: 12,
  },
  button: {
    marginTop: 16,
    height: 48,
    borderRadius: 12,
    backgroundColor: Colors.BRAND,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: 'black',
    fontSize: 16,
  }
})
