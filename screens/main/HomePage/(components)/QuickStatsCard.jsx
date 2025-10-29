import React from 'react';
import { View, StyleSheet } from 'react-native';
import AppText from '@/components/ui/Text';
import Colors from '@/constants/Colors';
import { Feather } from '@expo/vector-icons';

const QuickStatsCard = ({ plan }) => {
  if (!plan || !plan?.planId) return null;

  const enrolledDate = plan?.enrolledAt ? new Date(plan.enrolledAt) : null;
  const daysActive = enrolledDate 
    ? Math.floor((new Date() - enrolledDate) / (1000 * 60 * 60 * 24))
    : 0;

  const stats = [
    {
      icon: 'calendar',
      label: 'Days Active',
      value: daysActive,
      color: Colors.PRIMARY,
    },
    {
      icon: 'trending-down',
      label: 'Weight Change',
      value: plan?.startWeight && plan?.currentWeight 
        ? `${(plan.startWeight - plan.currentWeight).toFixed(1)} kg`
        : '--',
      color: Colors.SUCCESS,
    },
    // {
    //   icon: 'clock',
    //   label: 'Started',
    //   value: enrolledDate 
    //     ? enrolledDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    //     : '--',
    //   color: Colors.WARNING,
    // },
  ];

  return (
    <View style={styles.container}>
      <AppText font="SemiBold" style={styles.title}>Quick Stats</AppText>
      
      <View style={styles.statsGrid}>
        {stats.map((stat, index) => (
          <View key={index} style={styles.statCard}>
            <View style={[styles.iconContainer, { backgroundColor: stat.color + '15' }]}>
              <Feather name={stat.icon} size={20} color={stat.color} />
            </View>
            <AppText font="Bold" style={styles.statValue}>{stat.value}</AppText>
            <AppText style={styles.statLabel}>{stat.label}</AppText>
          </View>
        ))}
      </View>
    </View>
  );
};

export default QuickStatsCard;

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.CARD_BG,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  title: {
    fontSize: 16,
    color: Colors.TEXT,
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.BACKGROUND,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.BORDER,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  statValue: {
    fontSize: 18,
    color: Colors.TEXT,
    textAlign: 'center',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 11,
    color: Colors.TEXT_SECONDARY,
    textAlign: 'center',
  },
});
