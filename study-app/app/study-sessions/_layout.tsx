import { Stack } from "expo-router";

export default function SessionsLayout() {

    return(
        <Stack screenOptions={{
            headerShown: false,
            headerTintColor: "#000",
            headerStyle: { backgroundColor: "#b6deed"},
        }}>
            <Stack.Screen name="index" options={{ headerShown: true, headerTitle: "Study Sessions" }} />
            <Stack.Screen name="create_sessions" options={{ headerShown: true, headerTitle: "Create Session" }} />
            <Stack.Screen name="joined_sessions" options={{ headerShown: true, headerTitle: "Joined Sessions"}}/>
            <Stack.Screen name="session_details" options={{ headerShown: true, headerTitle: "Session Details" }} />
            <Stack.Screen name="edit" options={{ headerShown: true, headerTitle: "Edit Session" }} />
        </Stack>
    )
}
