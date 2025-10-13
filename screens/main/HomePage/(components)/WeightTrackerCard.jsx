import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, TextInput, Modal, Pressable, ActivityIndicator } from 'react-native';
import AppText from '@/components/ui/Text';
import Colors from '@/constants/Colors';
import { Feather } from '@expo/vector-icons';

const WeightTrackerCard = ({ currentWeight, onUpdateWeight, isLoading = false }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [newWeight, setNewWeight] = useState(currentWeight?.toString() || '');

  const handleUpdate = async () => {
    const weight = parseFloat(newWeight);
    if (weight && weight > 0 && weight < 300) {
      await onUpdateWeight(weight);
      setModalVisible(false);
    }
  };

  return (
    <>
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.titleRow}>
            <Feather name="activity" size={22} color={Colors.PRIMARY} />
            <AppText font="SemiBold" style={styles.title}>Weight Tracker</AppText>
          </View>
          <TouchableOpacity 
            style={styles.updateButton}
            onPress={() => {
              setNewWeight(currentWeight?.toString() || '');
              setModalVisible(true);
            }}
          >
            <Feather name="edit-2" size={18} color={Colors.PRIMARY} />
            <AppText font="Medium" style={styles.updateText}>Update</AppText>
          </TouchableOpacity>
        </View>

        <View style={styles.weightDisplay}>
          <AppText font="Bold" style={styles.weightValue}>
            {currentWeight || '--'}
          </AppText>
          <AppText style={styles.weightUnit}>kg</AppText>
        </View>

        <AppText style={styles.hint}>
          Track your weight regularly to monitor progress
        </AppText>
      </View>

      {/* Update Weight Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <Pressable 
          style={styles.modalOverlay}
          onPress={() => setModalVisible(false)}
        >
          <Pressable style={styles.modalContent} onPress={(e) => e.stopPropagation()}>
            <View style={styles.modalHeader}>
              <AppText font="SemiBold" style={styles.modalTitle}>Update Weight</AppText>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Feather name="x" size={24} color={Colors.TEXT} />
              </TouchableOpacity>
            </View>

            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                value={newWeight}
                onChangeText={setNewWeight}
                keyboardType="decimal-pad"
                placeholder="Enter weight"
                placeholderTextColor={Colors.TEXT_SECONDARY}
                autoFocus
              />
              <AppText style={styles.inputUnit}>kg</AppText>
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setModalVisible(false)}
              >
                <AppText font="Medium" style={styles.cancelButtonText}>Cancel</AppText>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.modalButton, styles.saveButton]}
                onPress={handleUpdate}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator size="small" color={Colors.WHITE} />
                ) : (
                  <AppText font="SemiBold" style={styles.saveButtonText}>Save</AppText>
                )}
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
};

export default WeightTrackerCard;

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.CARD_BG,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  title: {
    fontSize: 16,
    color: Colors.TEXT,
  },
  updateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: Colors.PRIMARY + '15',
  },
  updateText: {
    fontSize: 14,
    color: Colors.PRIMARY,
  },
  weightDisplay: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'center',
    marginBottom: 12,
  },
  weightValue: {
    fontSize: 48,
    color: Colors.TEXT,
    marginRight: 8,
  },
  weightUnit: {
    fontSize: 24,
    color: Colors.TEXT_SECONDARY,
  },
  hint: {
    fontSize: 13,
    color: Colors.TEXT_SECONDARY,
    textAlign: 'center',
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: Colors.BACKGROUND,
    borderRadius: 20,
    padding: 24,
    width: '85%',
    maxWidth: 400,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 20,
    color: Colors.TEXT,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.CARD_BG,
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: Colors.BORDER,
  },
  input: {
    flex: 1,
    fontSize: 24,
    color: Colors.TEXT,
    paddingVertical: 16,
    fontFamily: 'Poppins-SemiBold',
  },
  inputUnit: {
    fontSize: 18,
    color: Colors.TEXT_SECONDARY,
    marginLeft: 8,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: Colors.CARD_BG,
    borderWidth: 1,
    borderColor: Colors.BORDER,
  },
  cancelButtonText: {
    fontSize: 16,
    color: Colors.TEXT,
  },
  saveButton: {
    backgroundColor: Colors.PRIMARY,
  },
  saveButtonText: {
    fontSize: 16,
    color: Colors.WHITE,
  },
});
