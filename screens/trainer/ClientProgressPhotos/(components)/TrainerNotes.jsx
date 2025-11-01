import React from "react";
import { View, StyleSheet, TextInput, Pressable } from "react-native";
import AppText from "@/components/ui/Text";
import Colors from "@/constants/Colors";
import { Feather } from "@expo/vector-icons";

const TrainerNotes = ({
  selectedWeek,
  note,
  isEditing,
  onEdit,
  onCancel,
  onSave,
  onChangeNote,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <AppText font="SemiBold" style={styles.title}>
          Trainer Notes (Optional)
        </AppText>
        {!isEditing && (
          <Pressable onPress={onEdit}>
            <Feather name="edit-2" size={18} color={Colors.BRAND} />
          </Pressable>
        )}
      </View>

      {isEditing ? (
        <View style={styles.editContainer}>
          <TextInput
            style={styles.input}
            placeholder="Add notes for this week (e.g., Increase shoulder sets next week)"
            placeholderTextColor={Colors.TEXT_SECONDARY}
            value={note}
            onChangeText={onChangeNote}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
          <View style={styles.actions}>
            <Pressable
              style={[styles.button, styles.cancelButton]}
              onPress={onCancel}
            >
              <AppText style={styles.cancelButtonText}>Cancel</AppText>
            </Pressable>
            <Pressable
              style={[styles.button, styles.saveButton]}
              onPress={onSave}
            >
              <AppText style={styles.saveButtonText}>Save Note</AppText>
            </Pressable>
          </View>
        </View>
      ) : (
        <View style={styles.display}>
          {note ? (
            <AppText style={styles.noteText}>{note}</AppText>
          ) : (
            <AppText style={styles.emptyText}>
              No notes added for this week
            </AppText>
          )}
        </View>
      )}
    </View>
  );
};

export default TrainerNotes;

const styles = StyleSheet.create({
  container: {
    // No marginBottom here - will be handled by parent
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  title: {
    fontSize: 16,
    color: Colors.TEXT,
  },
  editContainer: {
    gap: 12,
  },
  input: {
    backgroundColor: Colors.CARD,
    borderRadius: 12,
    padding: 16,
    fontSize: 14,
    color: Colors.TEXT,
    borderWidth: 1,
    borderColor: Colors.BORDER,
    minHeight: 100,
  },
  actions: {
    flexDirection: "row",
    gap: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: Colors.CARD,
    borderWidth: 1,
    borderColor: Colors.BORDER,
  },
  saveButton: {
    backgroundColor: Colors.BRAND,
  },
  cancelButtonText: {
    fontSize: 14,
    color: Colors.TEXT,
    fontWeight: "600",
  },
  saveButtonText: {
    fontSize: 14,
    color: Colors.TEXT_BLACK,
    fontWeight: "600",
  },
  display: {
    backgroundColor: Colors.CARD,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.BORDER,
    minHeight: 80,
  },
  noteText: {
    fontSize: 14,
    color: Colors.TEXT,
    lineHeight: 20,
  },
  emptyText: {
    fontSize: 14,
    color: Colors.TEXT_SECONDARY,
    fontStyle: "italic",
  },
});
