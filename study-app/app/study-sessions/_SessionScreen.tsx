import { StudySession } from "../_utilities/globalUtils";
import SessionCard from "./_SessionCard";
import { FlatList, Text} from "react-native";
import { useFocusEffect } from "expo-router";
import { useCallback } from "react";

export default function SessionScreen({ sessions, fetchLoading, fetchSessions }: { sessions: StudySession[]; fetchLoading: boolean; fetchSessions: () => void }) {
    
    useFocusEffect(
        useCallback(() => {
            // This block of code runs when the screen is focused, so we want to fetch the sessions here in case there were any changes (new sessions created, sessions deleted, etc.) while the user was on a different screen.
            let isActive = true;

            // Reset the sessions to an empty array before fetching to avoid duplicates.
            sessions = [];

            fetchSessions();

            // This is for when the screen is unfocused, so we can do cleanup here.
            return () => {
                isActive = false;
            };
    }, [sessions]));

    return (
        <FlatList<StudySession>
            data = {sessions}
            keyExtractor={(item) => item.id}
            renderItem={({item}) => <SessionCard session={item} />}
            contentContainerStyle={{ padding: 12}}
            ListFooterComponent={null}
            ListEmptyComponent={!fetchLoading ? <Text>No Sessions Found.</Text> : null}
        />
    )

}