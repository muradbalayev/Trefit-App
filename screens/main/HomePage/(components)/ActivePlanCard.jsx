import React from 'react';
import { View, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AppText from '@/components/ui/Text';
import Colors from '@/constants/Colors';
import { Feather } from '@expo/vector-icons';

const ActivePlanCard = ({ plan }) => {
  const navigation = useNavigation();

  if (!plan || !plan?.planId) {
    return null;
  }

  const enrolledDate = plan?.enrolledAt ? new Date(plan.enrolledAt) : null;
  const daysEnrolled = enrolledDate 
    ? Math.floor((new Date() - enrolledDate) / (1000 * 60 * 60 * 24))
    : 0;

  const weightProgress = plan?.startWeight && plan?.currentWeight
    ? (plan.startWeight - plan.currentWeight).toFixed(1)
    : null;

  return (
    <TouchableOpacity 
      style={styles.container}
      onPress={() => navigation.navigate('PlanDetails', { planId: plan?.planId })}
      activeOpacity={0.8}
    >
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Feather name="target" size={24} color={Colors.PRIMARY} />
          <View style={styles.titleContainer}>
            <AppText font="SemiBold" style={styles.title}>
              {plan.title || 'Active Plan'}
            </AppText>
            <AppText style={styles.subtitle}>
              Day {daysEnrolled + 1} • Tap to view details
            </AppText>
          </View>
        </View>
        <Feather name="chevron-right" size={24} color={Colors.TEXT_SECONDARY} />
      </View>

      {weightProgress !== null && (
        <View style={styles.progressContainer}>
          <View style={styles.progressItem}>
            <AppText style={styles.progressLabel}>Start Weight</AppText>
            <AppText font="SemiBold" style={styles.progressValue}>
              {plan?.startWeight} kg
            </AppText>
          </View>
          
          <View style={styles.progressDivider} />
          
          <View style={styles.progressItem}>
            <AppText style={styles.progressLabel}>Current Weight</AppText>
            <AppText font="SemiBold" style={styles.progressValue}>
              {plan?.currentWeight} kg
            </AppText>
          </View>
          
          <View style={styles.progressDivider} />
          
          <View style={styles.progressItem}>
            <AppText style={styles.progressLabel}>Progress</AppText>
            <AppText 
              font="Bold" 
              style={[
                styles.progressValue, 
                { color: parseFloat(weightProgress) > 0 ? Colors.SUCCESS : Colors.WARNING }
              ]}
            >
              {weightProgress > 0 ? '-' : '+'}{Math.abs(weightProgress)} kg
            </AppText>
          </View>
        </View>
      )}
    </TouchableOpacity>
  );
};

export default ActivePlanCard;

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.CARD_BG,
    borderRadius: 16,
    paddingVertical: 24,
    paddingHorizontal: 16,
    marginTop: 16,
    // marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.BORDER,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
    flex: 1,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    color: Colors.TEXT,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
    color: Colors.TEXT_SECONDARY,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.BORDER,
  },
  progressItem: {
    flex: 1,
    alignItems: 'center',
  },
  progressLabel: {
    fontSize: 12,
    color: Colors.TEXT_SECONDARY,
    marginBottom: 4,
  },
  progressValue: {
    fontSize: 16,
    color: Colors.TEXT,
  },
  progressDivider: {
    width: 1,
    height: 40,
    backgroundColor: Colors.BORDER,
  },
});
