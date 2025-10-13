import { Provider } from "react-redux";
import store from "@/store/redux/store";
import { SocketProvider } from "@/contexts/SocketContext";
import { NotificationProvider } from "@/contexts/NotificationContext";

export default function Providers({ children }) {
    return (
        <Provider store={store}>
            <SocketProvider>
                <NotificationProvider>
                    {children}
                </NotificationProvider>
            </SocketProvider>
        </Provider>
    );
}