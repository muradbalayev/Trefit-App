import React from 'react';
import { View, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import AppText from '@/components/ui/Text';
import Colors from '@/constants/Colors';
import { Feather } from '@expo/vector-icons';

const StreakCard = ({ streak = 0, points = 0, onCheckIn, isLoading = false }) => {
  const canCheckIn = !isLoading;

  return (
    <View style={styles.container}>
      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <View style={styles.iconContainer}>
            <Feather name="zap" size={24} color={Colors.PRIMARY} />
          </View>
          <View>
            <AppText font="Bold" style={styles.statValue}>{streak}</AppText>
            <AppText style={styles.statLabel}>Day Streak</AppText>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.statItem}>
          <View style={styles.iconContainer}>
            <Feather name="award" size={24} color={Colors.SUCCESS} />
          </View>
          <View>
            <AppText font="Bold" style={styles.statValue}>{points}</AppText>
            <AppText style={styles.statLabel}>Total Points</AppText>
          </View>
        </View>
      </View>

      <TouchableOpacity 
        style={[styles.checkInButton, !canCheckIn && styles.checkInButtonDisabled]}
        onPress={onCheckIn}
        disabled={!canCheckIn}
        activeOpacity={0.8}
      >
        {isLoading ? (
          <ActivityIndicator size="small" color={Colors.WHITE} />
        ) : (
          <>
            <Feather 
              name="check-circle" 
              size={20} 
              color={canCheckIn ? Colors.WHITE : Colors.TEXT_SECONDARY} 
            />
            <AppText 
              font="SemiBold" 
              style={[styles.checkInText, !canCheckIn && styles.checkInTextDisabled]}
            >
              {canCheckIn ? 'Check In Today' : 'Already Checked In'}
            </AppText>
          </>
        )}
      </TouchableOpacity>
    </View>
  );
};

export default StreakCard;

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.CARD_BG,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.PRIMARY + '15',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statValue: {
    fontSize: 24,
    color: Colors.TEXT,
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.TEXT_SECONDARY,
  },
  divider: {
    width: 1,
    height: 50,
    backgroundColor: Colors.BORDER,
    marginHorizontal: 16,
  },
  checkInButton: {
    backgroundColor: Colors.PRIMARY,
    borderRadius: 12,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  checkInButtonDisabled: {
    backgroundColor: Colors.BORDER,
  },
  checkInText: {
    fontSize: 16,
    color: Colors.WHITE,
  },
  checkInTextDisabled: {
    color: Colors.TEXT_SECONDARY,
  },
});
