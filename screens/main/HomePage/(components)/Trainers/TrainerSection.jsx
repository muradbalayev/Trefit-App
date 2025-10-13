import {
  Image,
  Pressable,
  StyleSheet,
  View,
  TouchableOpacity,
} from "react-native";
import React from "react";
import AppText from "@/components/ui/Text";
import Section from "@/components/common/Section";
import Colors from "@/constants/Colors";
import Feather from "@expo/vector-icons/Feather";
import { useNavigation } from "@react-navigation/native";
import { useGetAllTrainersQuery } from "@/store/redux/user/services/userTrainerApi";
import { Loading } from "@/components/common";
import { getAvatarUrl } from "@/constants/Paths";

const TrainerSection = () => {
  const navigation = useNavigation();
  const { data: trainers, isLoading } = useGetAllTrainersQuery({
    page: 1,
    limit: 6,
  });
  console.log(trainers)

  if (isLoading) {
    return (
      <Section>
        <View style={styles.headerRow}>
          <AppText font="Bold" style={styles.title}>
            Find Your Trainer
          </AppText>
        </View>
        <Loading />
      </Section>
    );
  }

  if (trainers?.length === 0) {
    return null;
  }

  return (
    <Section>
      <View style={styles.headerRow}>
        <AppText font="Bold" style={styles.title}>
          Find Your Trainer
        </AppText>
        <TouchableOpacity
          style={styles.arrowBtn}
          onPress={() => navigation.navigate("Trainers")}
        >
          <Feather name="arrow-right" size={20} color={Colors.TEXT} />
        </TouchableOpacity>
      </View>

      <View style={styles.trainersList}>
        {trainers?.map((trainer) => (
          <TrainerCard
            key={trainer._id}
            trainer={trainer}
            onPress={() =>
              navigation.navigate("TrainerDetails", { trainerId: trainer._id })
            }
          />
        ))}
      </View>

      <TouchableOpacity
        style={styles.exploreButton}
        onPress={() => navigation.navigate("Trainers")}
      >
        <AppText font="SemiBold" style={styles.exploreButtonText}>
          Explore More Trainers
        </AppText>
        <Feather name="arrow-right" size={16} color={Colors.PRIMARY} />
      </TouchableOpacity>
    </Section>
  );
};

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    color: Colors.TEXT,
  },
  arrowBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.CARD,
    borderWidth: 1,
    borderColor: Colors.BORDER,
  },
  trainersList: {
    gap: 12,
  },
  trainerCard: {
    backgroundColor: Colors.CARD_BG,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.BORDER,
  },
  trainerContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: Colors.PRIMARY + "20",
  },
  avatarPlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.PRIMARY,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontSize: 20,
    color: Colors.WHITE,
    fontWeight: "bold",
  },
  trainerInfo: {
    flex: 1,
  },
  trainerName: {
    fontSize: 16,
    color: Colors.TEXT,
    marginBottom: 4,
  },
  trainerSpecialty: {
    fontSize: 13,
    color: Colors.PRIMARY,
    marginBottom: 8,
  },
  trainerMeta: {
    flexDirection: "row",
    gap: 12,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  metaText: {
    fontSize: 11,
    color: Colors.TEXT_SECONDARY,
  },
  chevronIcon: {
    marginLeft: "auto",
  },
  exploreButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: Colors.CARD_BG,
    borderRadius: 12,
    padding: 16,
    marginTop: 12,
    borderWidth: 1,
    borderColor: Colors.BORDER,
  },
  exploreButtonText: {
    fontSize: 14,
    color: Colors.PRIMARY,
  },
});

const TrainerCard = ({ trainer, onPress }) => (
  <TouchableOpacity
    style={styles.trainerCard}
    onPress={onPress}
    activeOpacity={0.7}
  >
    <View style={styles.trainerContent}>
      {trainer.avatar ? (
        <Image source={{ uri: getAvatarUrl(trainer.avatar, 'webp')}} style={styles.avatar} />

      ) : (
        <View style={styles.avatarPlaceholder}>
          <AppText style={styles.avatarText}>
            {trainer.name?.charAt(0) || "T"}
          </AppText>
        </View>
      )}

      <View style={styles.trainerInfo}>
        <AppText font="SemiBold" style={styles.trainerName} numberOfLines={1}>
          {trainer.name}
        </AppText>

        {trainer.specialty && (
          <AppText style={styles.trainerSpecialty} numberOfLines={1}>
            {trainer.specialty}
          </AppText>
        )}

        <View style={styles.trainerMeta}>
          {trainer.planCount > 0 && (
            <View style={styles.metaItem}>
              <Feather
                name="clipboard"
                size={11}
                color={Colors.TEXT_SECONDARY}
              />
              <AppText style={styles.metaText}>
                {trainer.planCount} plans
              </AppText>
            </View>
          )}

{trainer.experienceYears > 0 && (
  <View style={styles.metaItem}>
    <Feather
      name="briefcase"
      size={12}
      color={Colors.TEXT_SECONDARY}
    />
    <AppText style={styles.metaText}>
      {trainer.experienceYears}y exp.
    </AppText>
  </View>
)}
          {trainer.workPlace && (
            <View style={styles.metaItem}>
              <Feather name="map-pin" size={11} color={Colors.TEXT_SECONDARY} />
              <AppText style={styles.metaText} numberOfLines={1}>
                {trainer.workPlace}
              </AppText>
            </View>
          )}
        </View>
      </View>

      <Feather
        name="chevron-right"
        size={20}
        color={Colors.TEXT_SECONDARY}
        style={styles.chevronIcon}
      />
    </View>
  </TouchableOpacity>
);

export default TrainerSection;
