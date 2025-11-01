import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import AppText from '@/components/ui/Text';
import Colors from '@/constants/Colors';

const QuickActions = () => {
  return (
  <View style={styles.section}>
            <AppText style={styles.sectionTitle} font="Bold">
              Quick Actions
            </AppText>
            <View style={styles.quickActions}>
              <ActionButton
                title="Create New Plan"
                icon="plus"
                color={Colors.BRAND}
                onPress={() => {
                  // Check if profile is complete
                  // Default to false if undefined (for backward compatibility)
                  const hasAccess =
                    user?.trainerProfile?.hasAccessToCreatePlan === true;

                  if (!hasAccess) {
                    setShowIncompleteModal(true);
                  } else {
                    navigate("CreatePlan");
                  }
                }}
              />
              <ActionButton
                title="View All Plans"
                icon="list"
                color="white"
                onPress={() => navigate("Plans")}
              />
            </View>
          </View>
  )
}

export default QuickActions

const styles = StyleSheet.create({})