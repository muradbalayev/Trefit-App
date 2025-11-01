import React from "react";
import { View, StyleSheet, Image, Pressable } from "react-native";
import { Feather } from "@expo/vector-icons";
import AppText from "@/components/ui/Text";
import Colors from "@/constants/Colors";
import { getAvatarUrl } from "@/constants/Paths";

const ClientHeader = ({ clientBasic, clientStats, onAction }) => {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <View style={styles.headerCard}>
      {/* Client Info */}
      <View style={styles.clientHeader}>
        {clientStats?.clientAvatar ? (
          <Image
            source={{ uri: getAvatarUrl(clientStats.clientAvatar, "webp") }}
            style={styles.avatar}
          />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <AppText style={styles.avatarText}>
              {clientBasic?.name?.charAt(0) || "C"}
            </AppText>
          </View>
        )}

        <View style={styles.clientInfo}>
          <AppText font="Bold" style={styles.clientName}>
            {clientBasic?.name}
          </AppText>
          <AppText style={styles.clientEmail}>{clientBasic?.email}</AppText>
          <AppText style={styles.joinedDate}>
            Joined {formatDate(clientBasic?.joinedAt)}
          </AppText>
        </View>
      </View>

      {/* Quick Stats */}
      {clientStats && (
        <View style={styles.quickStats}>
          <View style={styles.statBox}>
            <AppText font="Bold" style={styles.statValue}>
              {clientStats.daysEnrolled}
            </AppText>
            <AppText style={styles.statLabel}>Days</AppText>
          </View>
          <View style={styles.statBox}>
            <AppText font="Bold" style={styles.statValue}>
              {clientStats.streak}
            </AppText>
            <AppText style={styles.statLabel}>Streak</AppText>
          </View>
          <View style={styles.statBox}>
            <AppText font="Bold" style={styles.statValue}>
              {clientStats.currentWeek}
            </AppText>
            <AppText style={styles.statLabel}>Week</AppText>
          </View>
          <View style={styles.statBox}>
            <AppText font="Bold" style={styles.statValue}>
              {clientStats.tasksCompleted}/{clientStats.totalTasks}
            </AppText>
            <AppText style={styles.statLabel}>Tasks</AppText>
          </View>
        </View>
      )}

      {/* Quick Actions */}
      <View style={styles.quickActions}>
        <Pressable
          style={styles.actionBtn}
          onPress={() => onAction?.("chat")}
        >
          <Feather name="message-circle" size={20} color={Colors.PRIMARY} />
          <AppText style={styles.actionText}>Chat</AppText>
        </Pressable>
        <Pressable
          style={styles.actionBtn}
          onPress={() => onAction?.("task")}
        >
          <Feather name="plus-circle" size={20} color={Colors.SUCCESS} />
          <AppText style={styles.actionText}>Task</AppText>
        </Pressable>
        <Pressable
          style={styles.actionBtn}
          onPress={() => onAction?.("workout")}
        >
          <Feather name="file-text" size={20} color={Colors.WARNING} />
          <AppText style={styles.actionText}>PDF</AppText>
        </Pressable>
        <Pressable
          style={styles.actionBtn}
          onPress={() => onAction?.("email")}
        >
          <Feather name="mail" size={20} color={Colors.BRAND} />
          <AppText style={styles.actionText}>Email</AppText>
        </Pressable>
      </View>
    </View>
  );
};

export default ClientHeader;

const styles = StyleSheet.create({
  headerCard: {
    backgroundColor: Colors.CARD,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    gap: 16,
  },
  clientHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  avatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
  },
  avatarPlaceholder: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: Colors.PRIMARY,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontSize: 28,
    color: Colors.TEXT_BLACK,
    fontWeight: "600",
  },
  clientInfo: {
    flex: 1,
    gap: 4,
  },
  clientName: {
    fontSize: 20,
    color: Colors.TEXT,
  },
  clientEmail: {
    fontSize: 14,
    color: Colors.TEXT_SECONDARY,
  },
  joinedDate: {
    fontSize: 12,
    color: Colors.TEXT_SECONDARY,
  },
  quickStats: {
    flexDirection: "row",
    gap: 12,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.BORDER,
  },
  statBox: {
    flex: 1,
    alignItems: "center",
    gap: 4,
  },
  statValue: {
    fontSize: 18,
    color: Colors.TEXT,
  },
  statLabel: {
    fontSize: 11,
    color: Colors.TEXT_SECONDARY,
  },
  quickActions: {
    flexDirection: "row",
    gap: 12,
  },
  actionBtn: {
    flex: 1,
    alignItems: "center",
    gap: 8,
    padding: 12,
    backgroundColor: Colors.SECONDARY,
    borderRadius: 12,
  },
  actionText: {
    fontSize: 12,
    color: Colors.TEXT,
  },
});
