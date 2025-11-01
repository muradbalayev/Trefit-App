import React from "react";
import { View, StyleSheet } from "react-native";
import AppText from "@/components/ui/Text";
import Colors from "@/constants/Colors";
import { Feather } from "@expo/vector-icons";

const WeekInfo = ({ weekData }) => {
  if (!weekData) return null;

  return (
    <View style={styles.card}>
      <View style={styles.row}>
        <Feather name="calendar" size={16} color={Colors.TEXT_SECONDARY} />
        <AppText style={styles.text}>
          {weekData.photos.length} photo(s) uploaded
        </AppText>
      </View>
      {weekData.weekStartDate && (
        <View style={styles.row}>
          <Feather name="clock" size={16} color={Colors.TEXT_SECONDARY} />
          <AppText style={styles.text}>
            Started: {new Date(weekData.weekStartDate).toLocaleDateString()}
          </AppText>
        </View>
      )}
    </View>
  );
};

export default WeekInfo;

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.CARD,
    borderRadius: 12,
    padding: 16,
    gap: 12,
    marginBottom: 20,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  text: {
    fontSize: 13,
    color: Colors.TEXT_SECONDARY,
  },
});
