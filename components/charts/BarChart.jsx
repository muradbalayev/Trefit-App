import React from "react";
import { View, StyleSheet, Dimensions, ScrollView } from "react-native";
import Colors from "@/constants/Colors";
import AppText from "@/components/ui/Text";

const { width } = Dimensions.get("window");

const BarChart = ({ data, title, yAxisLabel, color = Colors.BRAND }) => {
  if (!data || data.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <AppText style={styles.emptyText}>No data available</AppText>
      </View>
    );
  }

  // Find max value for scaling
  const maxValue = Math.max(...data.map((item) => item.y || 0));
  const chartHeight = 180;

  return (
    <View style={styles.container}>
      {title && (
        <AppText font="SemiBold" style={styles.title}>
          {title}
        </AppText>
      )}
      
      {/* Simple bar visualization */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chartContainer}
      >
        {data.map((item, index) => {
          const barHeight = maxValue > 0 ? (item.y / maxValue) * chartHeight : 0;
          
          return (
            <View key={index} style={styles.barWrapper}>
              <View style={styles.barContainer}>
                <AppText style={styles.valueText}>${item.y}</AppText>
                <View 
                  style={[
                    styles.bar, 
                    { 
                      height: barHeight || 4,
                      backgroundColor: color,
                    }
                  ]} 
                />
              </View>
              <AppText style={styles.labelText}>{item.x}</AppText>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
};

export default BarChart;

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.CARD,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.BORDER,
  },
  title: {
    fontSize: 16,
    color: Colors.TEXT,
    marginBottom: 12,
  },
  chartContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 12,
    paddingVertical: 20,
    paddingHorizontal: 4,
  },
  barWrapper: {
    alignItems: "center",
    gap: 8,
  },
  barContainer: {
    alignItems: "center",
    justifyContent: "flex-end",
    height: 200,
    gap: 8,
  },
  bar: {
    width: 32,
    borderRadius: 4,
    minHeight: 4,
  },
  valueText: {
    fontSize: 11,
    color: Colors.TEXT,
    fontWeight: "600",
  },
  labelText: {
    fontSize: 10,
    color: Colors.TEXT_SECONDARY,
    maxWidth: 40,
    textAlign: "center",
  },
  emptyContainer: {
    backgroundColor: Colors.CARD,
    borderRadius: 12,
    padding: 40,
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.BORDER,
  },
  emptyText: {
    fontSize: 14,
    color: Colors.TEXT_SECONDARY,
  },
});
