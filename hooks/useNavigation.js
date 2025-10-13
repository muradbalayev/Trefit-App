// React Native Navigation
import { useNavigation } from "@react-navigation/native";
import { CommonActions } from '@react-navigation/native';

// Constants Types

export const useNavigate = () => {
    const navigation = useNavigation();

    // Navigasyon fonksiyonu
    const navigate = (screen, params) => {
        navigation.navigate(screen, params);
    };

    // Geri gitme fonksiyonu
    const goBack = () => {
        navigation.goBack();
    };

    // Reset fonksiyonu
    const reset = (screen, params) => {
        navigation.dispatch(
            CommonActions.reset({
                index: 0,
                routes: [{ name: screen, params }],
            })
        );
    };

    return { navigate, goBack, reset };
};
