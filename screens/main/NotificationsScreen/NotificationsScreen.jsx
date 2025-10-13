import { FlatList, Pressable, StyleSheet, View } from "react-native";
import React from "react";
import ScreenHeader from "@/components/common/ScreenHeader";
import { CustomScreen } from "@/components/common";
import { useNavigate } from "@/hooks/useNavigation";
import AppText from "@/components/ui/Text";
import Section from "@/components/common/Section";
import Colors from "@/constants/Colors";
import Feather from "@expo/vector-icons/Feather";

const NotificationsScreen = () => {
  const { goBack, navigate } = useNavigate();

  const notifications = [
    {
      id: "n1",
      title: "Your new workout added by your trainer",
      description: "Leg day plan is ready. Start when you’re set.",
      time: "Just now",
      type: "dumbbell",
      unread: true,
    },
    {
      id: "n2",
      title: "Last 1 hour to finish task",
      description: "Complete today’s cardio session before 22:00.",
      time: "10m ago",
      type: "clock",
      unread: true,
    },
    {
      id: "n3",
      title: "Diet plan updated",
      description: "Your trainer adjusted macros for this week.",
      time: "1h ago",
      type: "list",
    },
    {
      id: "n4",
      title: "New message from trainer",
      description: "“Great progress! Keep it up.”",
      time: "2h ago",
      type: "message-circle",
    },
    {
      id: "n5",
      title: "Streak reached 7 days",
      description: "You earned +50 points.",
      time: "Yesterday",
      type: "award",
    },
    {
      id: "n6",
      title: "We scheduled a check-in",
      description: "Trainer set a call for Friday 17:00.",
      time: "2 days ago",
      type: "calendar",
    },
    {
      id: "n7",
      title: "We scheduled a check-in",
      description: "Trainer set a call for Friday 17:00.",
      time: "2 days ago",
      type: "calendar",
    },
    {
      id: "n8",
      title: "We scheduled a check-in",
      description: "Trainer set a call for Friday 17:00.",
      time: "2 days ago",
      type: "calendar",
    },
    {
      id: "n9",
      title: "We scheduled a check-in",
      description: "Trainer set a call for Friday 17:00.",
      time: "2 days ago",
      type: "calendar",
    },
    {
      id: "n10",
      title: "We scheduled a check-in",
      description: "Trainer set a call for Friday 17:00.",
      time: "2 days ago",
      type: "calendar",
    },
  ];

  const renderIcon = (type) => {
    const map = {
      dumbbell: "activity",
      clock: "clock",
      list: "list",
      "message-circle": "message-circle",
      award: "award",
      calendar: "calendar",
    };
    return map[type] || "bell";
  };

  const NotificationItem = ({ item }) => (
    <Pressable style={styles.item} android_ripple={{ color: "#222" }}>
      <View style={styles.left}>
        <View style={styles.iconWrap}>
          <Feather name={renderIcon(item.type)} size={18} color={"black"} />
        </View>
      </View>
      <View style={styles.center}>
        <AppText font="SemiBold" style={styles.title}>
          {item.title}
        </AppText>
        {item.description ? (
          <AppText style={styles.desc} numberOfLines={2}>
            {item.description}
          </AppText>
        ) : null}
        <AppText style={styles.time}>{item.time}</AppText>
      </View>
      <View style={styles.right}>
        {item.unread ? <View style={styles.dot} /> : null}
      </View>
    </Pressable>
  );

  return (
    <CustomScreen>
      <FlatList
        data={notifications}
        keyExtractor={(it) => it.id}
        renderItem={({ item }) => <NotificationItem item={item} />}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        contentContainerStyle={{ paddingVertical: 6 }}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View style={{ paddingBottom: 10 }}>
            <ScreenHeader title="Notifications" action={goBack} />
            <View style={{ height: 10 }} />
          </View>
        }
      />
    </CustomScreen>
  );
};

export default NotificationsScreen;

const styles = StyleSheet.create({
  item: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingVertical: 12,
  },
  left: {
    width: 42,
    alignItems: "center",
    paddingTop: 2,
  },
  iconWrap: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.BRAND,
    alignItems: "center",
    justifyContent: "center",
  },
  center: {
    flex: 1,
    paddingRight: 10,
  },
  title: {
    color: Colors.TEXT,
    fontSize: 14,
  },
  desc: {
    color: Colors.TEXT_SECONDARY,
    fontSize: 12,
    marginTop: 4,
  },
  time: {
    color: Colors.TEXT_SECONDARY,
    fontSize: 11,
    marginTop: 6,
  },
  right: {
    width: 20,
    alignItems: "flex-end",
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.PRIMARY,
    marginTop: 6,
  },
  separator: {
    height: 1,
    backgroundColor: Colors.BORDER,
  },
});
