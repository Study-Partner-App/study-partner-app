import { useEffect } from "react";
import { View, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { supabase } from "../lib/supabase";

export default function Index() {
    const router = useRouter();

    useEffect(() => {
        const checkSession = async () => {
            const { data } = await supabase.auth.getSession();
            if(data.session) {
                router.replace("/(tabs)");
            } else {
                router.replace("/(auth)/login");
            }
        };
        checkSession();
    }, []);

    // Loading indicator when checking session
    return (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center"}}>
            <ActivityIndicator size="large" />
        </View>
    );
}
