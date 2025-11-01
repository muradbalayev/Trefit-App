import { StyleSheet, Text, View, Image, TouchableOpacity } from 'react-native'
import React from 'react'
import Feather from '@expo/vector-icons/Feather';
import AppText from '@/components/ui/Text';
import Colors from '@/constants/Colors';
import { useNavigation } from '@react-navigation/native';
import Images from '@/constants/Images';

const Header = ({user}) => {

  const navigation = useNavigation()
  const avatar = user?.avatar || 'https://i.pravatar.cc/100?img=12'
  const name = user?.name || 'Welcome'

  return (
    <View style={styles.container}>
      <View style={styles.logo}>
  <Image source={Images?.logo} style={styles.logo} />  
      </View>
      {/* <View>

    <Image
      source={{ uri: avatar }}
      style={{ width: 56, height: 56, borderRadius: 28 }}
      />
    <View style={styles.titleContainer}>
      <AppText style={styles.welcomeTitle}>Welcome back</AppText>
      <AppText font="SemiBold" style={styles.nameTitle}>{name}</AppText>
    </View>
      </View> */}
    <View style={styles.iconContainer}>
      <TouchableOpacity style={styles.icon} onPress={() => navigation.navigate('Notifications')}>
        <Feather name="bell" size={24} color="white" />
      </TouchableOpacity>
      <TouchableOpacity style={styles.icon} onPress={() => navigation.navigate('Chat')}>
        <Feather name="message-circle" size={24} color="white" />
      </TouchableOpacity>
    </View>
  </View>
  )
}

export default Header

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 12,
        position: 'sticky',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
    },
    logo: {
      width:50,
      height: 50,
    },
    titleContainer: {
        flex: 1,
    },
    welcomeTitle: {
        fontSize: 12,
        marginBottom: 2,
    },
    nameTitle: {
        fontSize: 16,
    },
    iconContainer: {
        flexDirection: 'row',
        gap: 8,
    },
    icon: {
      width: 44,
      height: 44,
      borderRadius: 12,
      backgroundColor: Colors.CARD,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1,
      borderColor: Colors.BORDER,
    },
})