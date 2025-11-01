import React from "react";
import { View, StyleSheet, ScrollView, Pressable } from "react-native";
import AppText from "@/components/ui/Text";
import Colors from "@/constants/Colors";

const TABS = ["Overview", "Tasks", "Progress", "Workout"];

const TabBar = ({ activeTab, onTabChange }) => {
  return (
    <View style={styles.tabsContainer}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.tabs}
      >
        {TABS.map((tab) => (
          <Pressable
            key={tab}
            style={[styles.tab, activeTab === tab && styles.tabActive]}
            onPress={() => onTabChange(tab)}
          >
            <AppText
              font={activeTab === tab ? "SemiBold" : "Regular"}
              style={[
                styles.tabText,
                activeTab === tab && styles.tabTextActive,
              ]}
            >
              {tab}
            </AppText>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
};

export default TabBar;

const styles = StyleSheet.create({
  tabsContainer: {
    marginBottom: 16,
  },
  tabs: {
    gap: 8,
  },
  tab: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: Colors.CARD,
  },
  tabActive: {
    backgroundColor: Colors.BRAND,
  },
  tabText: {
    fontSize: 14,
    color: Colors.TEXT,
  },
  tabTextActive: {
    color: Colors.TEXT_BLACK,
  },
});
