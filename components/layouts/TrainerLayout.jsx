import { StyleSheet, Text, View, Platform, Pressable } from "react-native";
import React, { useCallback, useMemo } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigate } from "@/hooks/useNavigation";
import Feather from "@expo/vector-icons/Feather";

import Colors from "@/constants/Colors";
import { BlurView } from "expo-blur";
import { FontAwesome5, Ionicons } from "@expo/vector-icons";

const routes = {
  home: ["Home", "Notifications"],
  plans: ["Plans", "CreatePlan", "PlanDetails"],
  clients: ["Clients", "ClientDetails", "Chat", "ChatMessages"],
  tasks: ["TrainerTasks", "CreateTask"],
  profile: ["Profile", "Account"],
};

const noBottomRoutes = [
  "Notifications",
  "CreatePlan",
  "PlanDetails",
  "ClientDetails",
  "ChatMessages",
];

const TrainerLayout = ({ route: routeName, children }) => {
  const insets = useSafeAreaInsets();
  const currentStack = useMemo(() => {
    return (
      Object.keys(routes).find((key) => routes[key].includes(routeName)) || ""
    );
  }, [routeName]);

  const noBottom = noBottomRoutes.includes(routeName);

  const { navigate } = useNavigate();

  const handleNavigateTo = useCallback(
    (screen) => {
      if (currentStack !== screen) {
        navigate(screen);
      }
    },
    [currentStack]
  );

  return (
    <View style={[styles.root]}>
      {children}
      {!noBottom && (
        <View style={[styles.mainContainer]}>
          <BlurView
            intensity={15}
            tint="default"
            experimentalBlurMethod="dimezisBlurView"
            style={[
              styles.bottomTabs,
              { backgroundColor: "transparent" },
              { marginBottom: insets.bottom },
            ]}
          >
            <TabItem
              isFeather={false}
              iconName="home"
              active={currentStack === "home"}
              onPress={() => handleNavigateTo("Home")}
            />
            <TabItem
              iconName="search"
              active={currentStack === "clients"}
              onPress={() => handleNavigateTo("Clients")}
            />
            <TabItem
              iconName="check-square"
              active={currentStack === "tasks"}
              onPress={() => handleNavigateTo("TrainerTasks")}
            />
            <TabItem
              iconName="dumbbell"
              isFeather={false}
              active={currentStack === "plans"}
              onPress={() => handleNavigateTo("Plans")}
            />
            <TabItem
              iconName="user"
              active={currentStack === "profile"}
              onPress={() => handleNavigateTo("Profile")}
            />
          </BlurView>
        </View>
      )}
    </View>
  );
};

const TabItem = ({ iconName, onPress, active, isFeather = true }) => {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.tab,
        pressed && { transform: [{ scale: 0.96 }], opacity: 0.95 },
      ]}
    >
      <View
        style={[
          styles.iconWrap,
          active
            ? { backgroundColor: Colors.BRAND, borderWidth: 0 }
            : {
                backgroundColor: Colors.CARD,
                borderWidth: 1,
                borderColor: Colors.BORDER,
              },
        ]}
      >
        {isFeather ? (
          <Feather name={iconName} size={22} color={active ? "black" : "white"} />
        ) : (
          <FontAwesome5 name={iconName} size={22} color={active ? "black" : "white"} />
        )}
      </View>
    </Pressable>
  );
};

export default TrainerLayout;

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.BACKGROUND,
  },
  mainContainer: {
    bottom: 0,
    width: "100%",
    position: "absolute",
    backgroundColor: "transparent",
    pointerEvents: "box-none",
    alignItems: "center",
    left: 0,
    right: 0,
  },
  bottomTabs: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "transparent",
    paddingVertical: 10,
    minHeight: 60,
    paddingHorizontal: 16,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: "hidden",
    // width: "90%",
    ...(Platform.OS === "ios"
      ? {
          shadowColor: "#000",
          shadowOpacity: 0.15,
          shadowRadius: 12,
          shadowOffset: { width: 0, height: -4 },
        }
      : { elevation: 12 }),
  },
  tab: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
});
