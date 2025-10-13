// React Native
import { View } from "react-native";
// Safe Area
import { SafeAreaView } from "react-native-safe-area-context";
// Colors
import Colors from "@/constants/Colors";

const CustomScreen = ({ safeArea = true, isPaddingHorizontal = true, isPaddingVertical = true, children }) => {
    const element = <View style={{ flex: 1, paddingHorizontal: isPaddingHorizontal ? 20 : 0, paddingVertical: isPaddingVertical ? 16 : 0, }}>
        {children}
    </View>

    if (!safeArea) {
        return element;
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: Colors.BACKGROUND }}>
            {element}
        </SafeAreaView>
    )

};

export { CustomScreen };