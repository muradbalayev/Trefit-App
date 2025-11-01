import React from "react";
import {
  View,
  StyleSheet,
  Modal,
  Pressable,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import AppText from "@/components/ui/Text";
import Colors from "@/constants/Colors";
import { Feather } from "@expo/vector-icons";

/**
 * Filter Modal Component
 * @param {boolean} visible - Modal visibility
 * @param {function} onClose - Function to close modal
 * @param {string} title - Modal title
 * @param {Array} filterGroups - Array of filter groups
 * @param {function} onApply - Function called when filters are applied
 * @param {function} onReset - Function to reset filters
 */
const FilterModal = ({
  visible,
  onClose,
  title = "Filters",
  filterGroups = [],
  onApply,
  onReset,
}) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable style={styles.modalOverlay} onPress={onClose}>
        <Pressable
          style={styles.modalContent}
          onPress={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <View style={styles.header}>
            <AppText font="Bold" style={styles.modalTitle}>
              {title}
            </AppText>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Feather name="x" size={24} color={Colors.TEXT} />
            </TouchableOpacity>
          </View>

          {/* Filter Groups */}
          <ScrollView
            style={styles.filtersContainer}
            showsVerticalScrollIndicator={false}
          >
            {filterGroups.map((group, groupIndex) => (
              <View key={groupIndex} style={styles.filterGroup}>
                <AppText font="SemiBold" style={styles.groupLabel}>
                  {group.label}
                </AppText>
                <View style={styles.optionsRow}>
                  {group.options.map((option) => (
                    <TouchableOpacity
                      key={option.value}
                      style={[
                        styles.filterChip,
                        option.active && styles.filterChipActive,
                      ]}
                      onPress={() => option.onPress(option.value)}
                    >
                      <AppText
                        font={option.active ? "SemiBold" : "Regular"}
                        style={[
                          styles.filterChipText,
                          option.active && styles.filterChipTextActive,
                        ]}
                      >
                        {option.label}
                      </AppText>
                      {option.active && (
                        <Feather name="check" size={14} color={Colors.TEXT_BLACK} />
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            ))}
          </ScrollView>

          {/* Actions */}
          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.button, styles.resetBtn]}
              onPress={onReset}
            >
              <Feather name="rotate-ccw" size={18} color={Colors.TEXT} />
              <AppText font="SemiBold" style={styles.resetText}>
                Reset
              </AppText>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.applyBtn]}
              onPress={() => {
                onApply?.();
                onClose();
              }}
            >
              <AppText font="SemiBold" style={styles.applyText}>
                Apply Filters
              </AppText>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

export default FilterModal;

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: Colors.BACKGROUND,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 20,
    paddingBottom: 40,
    paddingHorizontal: 20,
    maxHeight: "80%",
    borderTopWidth: 1,
    borderColor: Colors.BORDER,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    color: Colors.TEXT,
  },
  closeButton: {
    padding: 4,
  },
  filtersContainer: {
    marginBottom: 20,
  },
  filterGroup: {
    marginBottom: 24,
  },
  groupLabel: {
    fontSize: 14,
    color: Colors.TEXT,
    marginBottom: 12,
  },
  optionsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  filterChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: Colors.CARD,
    borderWidth: 1,
    borderColor: Colors.BORDER,
  },
  filterChipActive: {
    backgroundColor: Colors.BRAND,
    borderColor: Colors.BRAND,
  },
  filterChipText: {
    fontSize: 13,
    color: Colors.TEXT,
  },
  filterChipTextActive: {
    color: Colors.TEXT_BLACK,
  },
  actions: {
    flexDirection: "row",
    gap: 12,
  },
  button: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  resetBtn: {
    backgroundColor: Colors.CARD,
    borderColor: Colors.BORDER,
  },
  applyBtn: {
    backgroundColor: Colors.BRAND,
    borderColor: Colors.BRAND,
  },
  resetText: {
    color: Colors.TEXT,
    fontSize: 15,
  },
  applyText: {
    color: Colors.TEXT_BLACK,
    fontSize: 15,
  },
});
