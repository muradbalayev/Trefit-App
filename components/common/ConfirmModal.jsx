import React from 'react';
import { View, StyleSheet, Modal, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import AppText from '@/components/ui/Text';
import Colors from '@/constants/Colors';

/**
 * Confirm Modal Component (two-button)
 * Props:
 * - visible: boolean
 * - title?: string
 * - message: string
 * - confirmText?: string (default: "Confirm")
 * - cancelText?: string (default: "Cancel")
 * - iconName?: Feather name (default: "help-circle")
 * - iconColor?: string (default: Colors.BRAND)
 * - onConfirm: () => void
 * - onCancel: () => void
 */
const ConfirmModal = ({
  visible,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  iconName = 'help-circle',
  iconColor = Colors.BRAND,
  onConfirm,
  onCancel,
}) => {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalIconContainer}>
            <Feather name={iconName} size={56} color={iconColor} />
          </View>

          {title ? (
            <AppText font="Bold" style={styles.modalTitle}>
              {title}
            </AppText>
          ) : null}

          <AppText style={styles.modalMessage}>{message}</AppText>

          <View style={styles.actions}>
            <TouchableOpacity style={[styles.button, styles.cancelBtn]} onPress={onCancel}>
              <AppText font="SemiBold" style={styles.cancelText}>{cancelText}</AppText>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.button, styles.confirmBtn]} onPress={onConfirm}>
              <AppText font="SemiBold" style={styles.confirmText}>{confirmText}</AppText>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default ConfirmModal;

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: Colors.BACKGROUND,
    borderWidth: 1,
    borderColor: Colors.BORDER,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    width: '100%',
    maxWidth: 400,
  },
  modalIconContainer: {
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    color: Colors.TEXT,
    marginBottom: 10,
    textAlign: 'center',
  },
  modalMessage: {
    fontSize: 16,
    color: Colors.TEXT,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 22,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
  },
  cancelBtn: {
    backgroundColor: Colors.CARD,
    borderColor: Colors.BORDER,
  },
  confirmBtn: {
    backgroundColor: Colors.BRAND,
    borderColor: Colors.BRAND,
  },
  cancelText: {
    color: Colors.TEXT,
    fontSize: 16,
  },
  confirmText: {
    color: 'black',
    fontSize: 16,
  },
});
