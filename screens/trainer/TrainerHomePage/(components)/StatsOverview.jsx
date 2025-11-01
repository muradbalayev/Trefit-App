import React, { useMemo, useCallback } from "react";
import { View, StyleSheet, Pressable } from "react-native";
import Feather from "@expo/vector-icons/Feather";
import AppText from "@/components/ui/Text";
import Colors from "@/constants/Colors";

const formatNumber = (value) => {
  const amount = Number(value ?? 0);
  if (Number.isNaN(amount)) {
    return "0";
  }

  return amount.toLocaleString();
};

const formatCurrency = (value) => {
  const amount = Number(value ?? 0);
  if (Number.isNaN(amount)) {
    return "$0";
  }

  return `$${amount.toLocaleString()}`;
};

const StatsOverview = ({ stats = {}, onNavigate }) => {
  const goTo = useCallback(
    (route) => {
      if (route && typeof onNavigate === "function") {
        onNavigate(route);
      }
    },
    [onNavigate]
  );

  const cards = useMemo(
    () => [
      {
        key: "totalPlans",
        label: "Total Plans",
        value: formatNumber(stats?.totalPlans),
        icon: "clipboard",
        iconColor: Colors.BRAND,
        iconBackground: `${Colors.BRAND}1A`,
        borderColor: `${Colors.BRAND}33`,
        caption: onNavigate ? "Tap to manage plans" : "Lifetime total",
        captionColor: Colors.BRAND,
        captionIcon: onNavigate ? "arrow-up-right" : undefined,
        onPress: onNavigate ? () => goTo("Plans") : undefined,
      },
      {
        key: "activeClients",
        label: "Active Clients",
        value: formatNumber(stats?.activeClients),
        icon: "users",
        iconColor: Colors.SUCCESS,
        iconBackground: `${Colors.SUCCESS}1A`,
        borderColor: `${Colors.SUCCESS}33`,
        caption: onNavigate ? "Tap to view clients" : "Currently engaged",
        captionColor: Colors.SUCCESS,
        captionIcon: onNavigate ? "user" : undefined,
        onPress: onNavigate ? () => goTo("Clients") : undefined,
      },
      {
        key: "totalRevenue",
        label: "Total Revenue",
        value: formatCurrency(stats?.totalRevenue),
        icon: "dollar-sign",
        iconColor: "#8B5CF6",
        iconBackground: "#8B5CF61A",
        borderColor: "#8B5CF640",
        caption: "Lifetime earnings",
        captionColor: Colors.TEXT_SECONDARY,
      },
      {
        key: "thisMonthRevenue",
        label: "This Month",
        value: formatCurrency(stats?.thisMonthRevenue),
        icon: "trending-up",
        iconColor: Colors.WARNING,
        iconBackground: `${Colors.WARNING}1A`,
        borderColor: `${Colors.WARNING}33`,
        caption: "Month-to-date",
        captionColor: Colors.TEXT_SECONDARY,
      },
    ],
    [goTo, onNavigate, stats]
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        {/* <AppText font="Bold" style={styles.title}>
          Performance Snapshot
        </AppText> */}
        <AppText style={styles.title} font="Bold">
          Monitor your business
        </AppText>
      </View>

      <View style={styles.grid}>
        {cards.map((card) => (
          <Pressable
            key={card.key}
            style={[
              styles.card,
              { borderColor: card.borderColor },
              !card.onPress && styles.cardDisabled,
            ]}
            onPress={card.onPress}
            disabled={!card.onPress}
          >
            <View style={[styles.iconBadge, { backgroundColor: card.iconBackground }]}>
              <Feather name={card.icon} size={18} color={card.iconColor} />
            </View>
            <AppText font="Bold" style={styles.value}>
              {card.value}
            </AppText>
            <AppText style={styles.label}>{card.label}</AppText>

            {/* {card.caption ? (
              <View style={styles.captionRow}>
                {card.captionIcon ? (
                  <Feather
                    name={card.captionIcon}
                    size={12}
                    color={card.captionColor}
                  />
                ) : null}
                <AppText style={[styles.caption, { color: card.captionColor }]}>
                  {card.caption}
                </AppText>
              </View>
            ) : null} */}
          </Pressable>
        ))}
      </View>
    </View>
  );
};

export default StatsOverview;

const styles = StyleSheet.create({
  container: {
    // backgroundColor: Colors.CARD,
    // borderRadius: 24,
    // padding: 20,
    marginBottom: 28,
    // borderWidth: 1,
    // borderColor: Colors.BORDER,
    gap: 20,
  },
  header: {
    gap: 6,
  },
  title: {
    fontSize: 18,
    color: Colors.TEXT,
  },
  description: {
    fontSize: 13,
    color: Colors.TEXT_SECONDARY,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    rowGap: 12,
  },
  card: {
    // backgroundColor: "rgba(255,255,255,0.02)",
    borderWidth: 1,
    borderColor: Colors.BORDER,
    borderRadius: 18,
    padding: 16,
    gap: 8,
    width: "48%",
    maxWidth: "48%",
  },
  cardDisabled: {
    opacity: 0.86,
  },
  iconBadge: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  value: {
    fontSize: 24,
    color: Colors.TEXT,
  },
  label: {
    fontSize: 12,
    color: Colors.TEXT_SECONDARY,
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  captionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 6,
  },
  caption: {
    fontSize: 11,
  },
});
