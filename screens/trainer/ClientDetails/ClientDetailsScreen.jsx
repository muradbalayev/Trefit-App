import React, { useState } from "react";
import { View, StyleSheet, ScrollView, Linking, Alert, Pressable } from "react-native";
import { useNavigate } from "@/hooks/useNavigation";
import { CustomScreen, Loading } from "@/components/common";
import ScreenHeader from "@/components/common/ScreenHeader";
import AppText from "@/components/ui/Text";
import Colors from "@/constants/Colors";
import { Feather } from "@expo/vector-icons";
import { useGetClientDetailsQuery } from "@/store/redux/trainer/services/trainerClientApi";
import { useGetDashboardClientsQuery } from "@/store/redux/trainer/services/trainerStatsApi";

// Import components
import ClientHeader from "./(components)/ClientHeader";
import TabBar from "./(components)/TabBar";
import OverviewTab from "./(components)/OverviewTab";
import TasksTab from "./(components)/TasksTab";
import ProgressTab from "./(components)/ProgressTab";
import WorkoutTab from "./(components)/WorkoutTab";

const ClientDetailsScreen = ({ route }) => {
  const { navigate, goBack } = useNavigate();
  const { clientId, enrollmentId } = route?.params || {};
  const [activeTab, setActiveTab] = useState("Overview");

  // Fetch client basic details
  const {
    data: clientBasic,
    isLoading: isLoadingBasic,
    error: errorBasic,
    refetch: refetchBasic,
  } = useGetClientDetailsQuery(clientId, {
    skip: !clientId,
  });

  // Fetch detailed client stats from dashboard API
  const { data: clientsData } = useGetDashboardClientsQuery({
    status: "active",
    limit: 100,
  });

  // Find the specific client from dashboard data
  const clientStats = clientsData?.find(
    (c) => c.clientId === clientId || c.enrollmentId === enrollmentId
  );

  // Handle actions
  const handleAction = (action) => {
    switch (action) {
      case "chat":
        if (clientBasic?._id) {
          navigate("ChatMessages", {
            recipientId: clientBasic._id,
            recipientName: clientBasic.name,
            recipientType: "client",
          });
        }
        break;
      case "task":
        navigate("CreateTask", {
          clientId: clientBasic._id,
          clientName: clientBasic.name,
          enrollmentId: clientBasic.enrollmentId,
        });
        break;
      case "workout":
        if (!clientBasic?.planId || !clientBasic?.enrollmentId) {
          Alert.alert("Error", "Plan information not found. Please refresh.");
          return;
        }
        navigate("UploadWorkoutProgram", {
          planId: clientBasic.planId,
          enrollmentId: clientBasic.enrollmentId,
          clientName: clientBasic.name,
        });
        break;
      case "email":
        if (clientBasic?.email) {
          Linking.openURL(`mailto:${clientBasic.email}`);
        }
        break;
    }
  };

  const handleTaskPress = (task) => {
    // Navigate to task details if needed
    console.log("Task pressed:", task);
  };

  const handleViewAllPhotos = (week) => {
    // Navigate to full progress photos screen
    navigate("ClientProgressPhotos", {
      clientId,
      clientName: clientBasic?.name || "Client",
    });
  };

  // Loading state
  if (isLoadingBasic) return <Loading />;

  // Error state
  if (errorBasic || !clientBasic) {
    return (
      <CustomScreen>
        <ScreenHeader action={goBack} title="Client Details" />
        <View style={styles.errorContainer}>
          <Feather name="alert-circle" size={48} color={Colors.ERROR} />
          <AppText style={styles.errorText}>
            {errorBasic?.data?.message || "Failed to load client details"}
          </AppText>
          <Pressable style={styles.retryBtn} onPress={refetchBasic}>
            <AppText style={styles.retryText}>Retry</AppText>
          </Pressable>
        </View>
      </CustomScreen>
    );
  }

  return (
    <CustomScreen>
      <ScreenHeader action={goBack} title="Client Details" />

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Client Header Card */}
        <ClientHeader
          clientBasic={clientBasic}
          clientStats={clientStats}
          onAction={handleAction}
        />

        {/* Tabs */}
        <TabBar activeTab={activeTab} onTabChange={setActiveTab} />

        {/* Tab Content */}
        <View style={styles.tabContent}>
          {activeTab === "Overview" && (
            <OverviewTab clientBasic={clientBasic} clientStats={clientStats} />
          )}
          {activeTab === "Tasks" && (
            <TasksTab
              clientId={clientId}
              enrollmentId={enrollmentId}
              onTaskPress={handleTaskPress}
            />
          )}
          {activeTab === "Progress" && (
            <ProgressTab
              clientId={clientId}
              enrollmentId={enrollmentId}
              onViewAllPhotos={handleViewAllPhotos}
            />
          )}
          {activeTab === "Workout" && (
            <WorkoutTab
              clientStats={clientStats}
              onUpload={() => handleAction("workout")}
            />
          )}
        </View>
      </ScrollView>
    </CustomScreen>
  );
};

export default ClientDetailsScreen;

const styles = StyleSheet.create({
  tabContent: {
    flex: 1,
  },
  errorContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
    padding: 40,
  },
  errorText: {
    fontSize: 16,
    color: Colors.ERROR,
    textAlign: "center",
  },
  retryBtn: {
    backgroundColor: Colors.BRAND,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryText: {
    color: "black",
    fontWeight: "600",
  },
});
