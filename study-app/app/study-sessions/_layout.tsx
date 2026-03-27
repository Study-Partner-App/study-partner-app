import { Stack } from "expo-router";

export default function MatchingLayout() {
    return(
        <Stack>
            <Stack.Screen name="index" options={{ headerShown: false }} />
            <Stack.Screen name="create_sessions" options={{ headerShown: false }} />
        </Stack>
    )
}