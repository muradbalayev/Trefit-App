import React from "react";
import { View, StyleSheet, Pressable } from "react-native";
import { useNavigate } from "@/hooks/useNavigation";
import Colors from "@/constants/Colors";
import Feather from "@expo/vector-icons/Feather";
import AppText from "@/components/ui/Text";
import { useGetMyTasksQuery } from "@/store/redux/user/services/userTaskApi";

const QuickLinksWidget = () => {
  const { navigate } = useNavigate();
  
  const { data: tasksData } = useGetMyTasksQuery({
    status: 'all',
    page: 1,
    limit: 50,
  });

  const tasks = tasksData?.tasks || [];
  const pendingCount = tasks.filter(t => t.status === 'pending' || t.status === 'in_progress').length;
  const urgentCount = tasks.filter(t => {
    const hoursRemaining = (new Date(t.deadlineDate) - new Date()) / (1000 * 60 * 60);
    return (t.status === 'pending' || t.status === 'in_progress') && hoursRemaining < 24;
  }).length;

  return (
    <View style={styles.container}>
      {/* <AppText style={styles.title}>Quick Access</AppText> */}
      
      <View style={styles.grid}>
        <Pressable 
          style={styles.linkCard}
          onPress={() => navigate('WorkoutProgram')}
        >
          <View style={[styles.iconContainer, { backgroundColor: Colors.PRIMARY + "20" }]}>
            <Feather name="file-text" size={28} color={Colors.PRIMARY} />
          </View>
          <AppText style={styles.linkTitle}>Workout</AppText>
          <AppText style={styles.linkSubtitle}>See your workout program</AppText>
        </Pressable>

        <Pressable 
          style={styles.linkCard}
          onPress={() => navigate('ClientTasks')}
        >
          <View style={[styles.iconContainer, { backgroundColor: Colors.SUCCESS + "20" }]}>
            <Feather name="check-square" size={28} color={Colors.SUCCESS} />
            {(pendingCount > 0 || urgentCount > 0) && (
              <View style={styles.badge}>
                <AppText style={styles.badgeText}>
                  {urgentCount > 0 ? urgentCount : pendingCount}
                </AppText>
              </View>
            )}
          </View>
          <AppText style={styles.linkTitle}>Tasks</AppText>
          <AppText style={styles.linkSubtitle}>
            {pendingCount > 0 ? `${pendingCount} pending` : 'All done'}
          </AppText>
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.TEXT,
    marginBottom: 16,
  },
  grid: {
    flexDirection: "row",
    gap: 12,
  },
  linkCard: {
    flex: 1,
    backgroundColor: Colors.CARD,
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.BORDER,
    gap: 12,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  badge: {
    position: "absolute",
    top: -4,
    right: -4,
    backgroundColor: Colors.BRAND  + '30',
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 6,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "700",
    color: Colors.TEXT_BRAND,
  },
  linkTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.TEXT,
  },
  linkSubtitle: {
    fontSize: 12,
    color: Colors.TEXT_SECONDARY,
    textAlign: "center",
  },
});

export default QuickLinksWidget;
