import React from "react";
import { View, StyleSheet, ScrollView, Pressable } from "react-native";
import Colors from "@/constants/Colors";
import Feather from "@expo/vector-icons/Feather";
import AppText from "@/components/ui/Text";

/**
 * Reusable horizontal filter component
 * @param {Array} filters - Array of filter objects with { value, label, icon? }
 * @param {string} selectedValue - Currently selected filter value
 * @param {function} onSelect - Callback when filter is selected
 */
const HorizontalFilter = ({ filters, selectedValue, onSelect }) => {
  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        contentContainerStyle={styles.content}
        showsHorizontalScrollIndicator={false}
      >
        {filters.map((filter) => (
          <Pressable
            key={filter.value}
            style={[
              styles.filterButton,
              selectedValue === filter.value && styles.filterButtonActive,
            ]}
            onPress={() => onSelect(filter.value)}
          >
            {filter.icon && (
              <Feather
                name={filter.icon}
                size={16}
                color={
                  selectedValue === filter.value
                    ? Colors.WHITE
                    : Colors.TEXT_SECONDARY
                }
              />
            )}
            <AppText
              style={[
                styles.filterText,
                selectedValue === filter.value && styles.filterTextActive,
              ]}
            >
              {filter.label}
            </AppText>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.BORDER,
  },
  content: {
    paddingHorizontal: 10,
    paddingVertical: 12,
    gap: 8,
    flexDirection: "row",
    alignItems: "center",
  },
  filterButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: Colors.CARD,
    borderWidth: 1,
    borderColor: Colors.BORDER,
    gap: 6,
  },
  filterButtonActive: {
    backgroundColor: Colors.PRIMARY,
  },
  filterText: {
    fontSize: 13,
    color: Colors.TEXT_SECONDARY,
  },
  filterTextActive: {
    color: Colors.TEXT_BLACK,
    fontWeight: "600",
  },
});

export default HorizontalFilter;
