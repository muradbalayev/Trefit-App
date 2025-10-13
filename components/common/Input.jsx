import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import Colors from '@/constants/Colors';

/**
 * Reusable Input component with icon support and password toggle
 * 
 * @param {Object} props - Component props
 * @param {string} props.value - Input value
 * @param {Function} props.onChangeText - Function to call on text change
 * @param {string} props.placeholder - Placeholder text
 * @param {string} props.iconName - Feather icon name for left icon
 * @param {boolean} props.isPassword - Whether this is a password input
 * @param {string} props.keyboardType - Keyboard type (email-address, numeric, etc.)
 * @param {boolean} props.autoCapitalize - Auto capitalize behavior
 * @param {Object} props.containerStyle - Additional style for container
 * @param {Object} props.inputStyle - Additional style for input
 * @param {Function} props.onFocus - Function to call on input focus
 * @param {Function} props.onBlur - Function to call on input blur
 * @param {boolean} props.disabled - Whether the input is disabled
 */
const Input = ({
  value,
  onChangeText,
  placeholder,
  iconName,
  isPassword = false,
  keyboardType = 'default',
  autoCapitalize = 'none',
  containerStyle,
  inputStyle,
  onFocus,
  onBlur,
  disabled = false,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleFocus = () => {
    setIsFocused(true);
    if (onFocus) onFocus();
  };

  const handleBlur = () => {
    setIsFocused(false);
    if (onBlur) onBlur();
  };

  return (
    <View
      style={[
        styles.container,
        isFocused && styles.containerFocused,
        containerStyle,
      ]}
    >
      {iconName && (
        <Feather
          name={iconName}
          size={20}
          color={isFocused ? Colors.BRAND : Colors.TEXT}
          style={styles.icon}
        />
      )}
      
      <TextInput
        style={[styles.input, inputStyle, !iconName && { paddingHorizontal: 10 }]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={Colors.TEXT_SECONDARY || '#666'}
        secureTextEntry={isPassword && !showPassword}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        onFocus={handleFocus}
        onBlur={handleBlur}
        selectionColor={Colors.BRAND}
        editable={!disabled}
      />
      
      {isPassword && (
        <TouchableOpacity
          style={styles.eyeIcon}
          onPress={() => setShowPassword(!showPassword)}
        >
          <Feather
            name={showPassword ? 'eye-off' : 'eye'}
            size={20}
            color={isFocused ? Colors.BRAND : Colors.TEXT}
          />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    height: 56,
  },
  containerFocused: {
    borderColor: Colors.BRAND,
    backgroundColor: 'rgba(199, 240, 0, 0.05)',
  },
  icon: {
    paddingHorizontal: 12,
  },
  input: {
    flex: 1,
    height: '100%',
    color: Colors.TEXT,
    fontSize: 16,
  },
  eyeIcon: {
    paddingHorizontal: 12,
    height: '100%',
    justifyContent: 'center',
  },
});

export default Input;
