import React from 'react';
import { View, StyleSheet, Modal, Pressable, TouchableOpacity, ScrollView } from 'react-native';
import AppText from '@/components/ui/Text';
import Colors from '@/constants/Colors';
import { Feather } from '@expo/vector-icons';

/**
 * Reusable Select Modal Component
 * @param {boolean} visible - Modal visibility
 * @param {function} onClose - Function to close modal
 * @param {string} title - Modal title
 * @param {Array} options - Array of options [{value: string, label: string}]
 * @param {string} selectedValue - Currently selected value
 * @param {function} onSelect - Function called when option is selected
 */
const SelectModal = ({ 
  visible, 
  onClose, 
  title, 
  options = [], 
  selectedValue, 
  onSelect 
}) => {
  const handleSelect = (value) => {
    onSelect(value);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable
        style={styles.modalOverlay}
        onPress={onClose}
      >
        <Pressable style={styles.modalContent} onPress={(e) => e.stopPropagation()}>
          <AppText font="Bold" style={styles.modalTitle}>{title}</AppText>
          
          <ScrollView 
            style={styles.optionsContainer}
            showsVerticalScrollIndicator={false}
          >
            {options.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.modalOption,
                  selectedValue === option.value && styles.modalOptionSelected,
                ]}
                onPress={() => handleSelect(option.value)}
              >
                <AppText
                  style={[
                    styles.modalOptionText,
                    selectedValue === option.value && styles.modalOptionTextSelected,
                  ]}
                >
                  {option.label}
                </AppText>
                {selectedValue === option.value && (
                  <Feather name="check" size={20} color={Colors.BRAND} />
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: Colors.BACKGROUND,
    borderColor: Colors.BORDER,
    borderWidth: 1,
    borderRadius: 16,
    padding: 20,
    width: '85%',
    maxWidth: 400,
    maxHeight: '70%',
  },
  modalTitle: {
    fontSize: 18,
    color: Colors.TEXT,
    marginBottom: 16,
    textAlign: 'center',
  },
  optionsContainer: {
    maxHeight: 400,
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 8,
    backgroundColor: Colors.SECONDARY,
  },
  modalOptionSelected: {
    backgroundColor: Colors.BRAND + '20',
    borderWidth: 1,
    borderColor: Colors.BRAND,
  },
  modalOptionText: {
    fontSize: 16,
    color: Colors.TEXT,
  },
  modalOptionTextSelected: {
    color: Colors.BRAND,
    fontWeight: '600',
  },
});

export default SelectModal;
