import React from "react";
import { View, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import AppText from "@/components/ui/Text";
import Colors from "@/constants/Colors";

const WeekSelector = ({ currentWeek, selectedWeek, onSelectWeek }) => {
  const weeks = Array.from({ length: currentWeek }, (_, i) => i + 1);

  return (
    <View style={styles.container}>
      <AppText font="SemiBold" style={styles.title}>
        Select Week
      </AppText>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.weekSelector}
      >
        {weeks.map((week) => (
          <TouchableOpacity
            key={week}
            style={[
              styles.weekButton,
              selectedWeek === week && styles.weekButtonActive,
            ]}
            onPress={() => onSelectWeek(week)}
          >
            <AppText
              font={selectedWeek === week ? "SemiBold" : "Regular"}
              style={[
                styles.weekButtonText,
                selectedWeek === week && styles.weekButtonTextActive,
              ]}
            >
              Week {week}
            </AppText>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

export default WeekSelector;

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  title: {
    fontSize: 16,
    color: Colors.TEXT,
    marginBottom: 12,
  },
  weekSelector: {
    gap: 8,
  },
  weekButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: Colors.CARD,
    borderWidth: 1,
    borderColor: Colors.BORDER,
  },
  weekButtonActive: {
    backgroundColor: Colors.BRAND,
    borderColor: Colors.BRAND,
  },
  weekButtonText: {
    fontSize: 14,
    color: Colors.TEXT,
  },
  weekButtonTextActive: {
    color: Colors.TEXT_BLACK,
  },
});
