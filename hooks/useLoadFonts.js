import { useEffect, useState } from "react";
import * as Font from "expo-font";

export const useLoadFonts = () => {
    const [fontsLoaded, setFontsLoaded] = useState(false);

    useEffect(() => {
        const loadFonts = async () => {
            await Font.loadAsync({
                "Geist-Thin": require("@assets/fonts/Geist-Thin.ttf"),
                "Geist-Bold": require("@assets/fonts/Geist-Bold.ttf"),
                "Geist-Black": require("@assets/fonts/Geist-Black.ttf"),
                "Geist-Light": require("@assets/fonts/Geist-Light.ttf"),
                "Geist-Medium": require("@assets/fonts/Geist-Medium.ttf"),
                "Geist-Regular": require("@assets/fonts/Geist-Regular.ttf"),
                "Geist-SemiBold": require("@assets/fonts/Geist-SemiBold.ttf"),
            });
            setFontsLoaded(true);
        };

        loadFonts();
    }, []);

    return fontsLoaded;
};
