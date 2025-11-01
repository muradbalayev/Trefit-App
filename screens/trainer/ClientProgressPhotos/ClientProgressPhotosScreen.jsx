import React, { useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";
import { CustomScreen } from "@/components/common";
import ScreenHeader from "@/components/common/ScreenHeader";
import AppText from "@/components/ui/Text";
import Colors from "@/constants/Colors";
import { useGetClientProgressPhotosQuery } from "@/store/redux/trainer/services/trainerClientApi";
import { useNavigate } from "@/hooks/useNavigation";
import Section from "@/components/common/Section";

// Components
import WeekSelector from "./(components)/WeekSelector";
import PhotoGrid from "./(components)/PhotoGrid";
import TrainerNotes from "./(components)/TrainerNotes";
import WeekInfo from "./(components)/WeekInfo";

const ClientProgressPhotosScreen = ({ route }) => {
  const { goBack } = useNavigate();
  const { clientId, clientName } = route?.params || {};

  const {
    data: progressData,
    isLoading,
    refetch,
  } = useGetClientProgressPhotosQuery(clientId);

  const [selectedWeek, setSelectedWeek] = useState(null);
  const [weekNotes, setWeekNotes] = useState({});
  const [editingNote, setEditingNote] = useState(null);

  const currentWeek = progressData?.currentWeek || 1;
  const weeklyPhotos = progressData?.weeklyPhotos || [];

  // Set selected week to current week on load
  React.useEffect(() => {
    if (currentWeek && !selectedWeek) {
      setSelectedWeek(currentWeek);
    }
  }, [currentWeek]);

  const selectedWeekData = weeklyPhotos.find((w) => w.week === selectedWeek);

  const handleSaveNote = () => {
    // TODO: Backend API to save note
    setEditingNote(null);
    Alert.alert("Success", "Note saved successfully");
  };

  if (isLoading) {
    return (
      <CustomScreen>
        <ScreenHeader action={goBack} title="Progress Photos" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.BRAND} />
          <AppText style={styles.loadingText}>Loading photos...</AppText>
        </View>
      </CustomScreen>
    );
  }

  return (
    <CustomScreen>
      <ScreenHeader action={goBack} title={`${clientName}'s Progress`} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.container}>
        {/* Week Selector */}
        <WeekSelector
          currentWeek={currentWeek}
          selectedWeek={selectedWeek}
          onSelectWeek={setSelectedWeek}
        />

        {/* Photo Grid */}
        <View style={styles.photoSection}>
          <AppText font="SemiBold" style={styles.sectionTitle}>
            Week {selectedWeek} Photos
          </AppText>
          <PhotoGrid weekData={selectedWeekData} selectedWeek={selectedWeek} />
        </View>

        {/* Trainer Notes */}
        <Section>
          <TrainerNotes
            selectedWeek={selectedWeek}
            note={weekNotes[selectedWeek] || ""}
            isEditing={editingNote === selectedWeek}
            onEdit={() => setEditingNote(selectedWeek)}
            onCancel={() => setEditingNote(null)}
            onSave={handleSaveNote}
            onChangeNote={(text) =>
              setWeekNotes({ ...weekNotes, [selectedWeek]: text })
            }
          />
        </Section>

        {/* Week Info */}
        <WeekInfo weekData={selectedWeekData} />
      </ScrollView>
    </CustomScreen>
  );
};

export default ClientProgressPhotosScreen;

const styles = StyleSheet.create({
  container: {
    paddingBottom: 60,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    color: Colors.TEXT_SECONDARY,
  },
  photoSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    color: Colors.TEXT,
    marginBottom: 12,
  },
});
