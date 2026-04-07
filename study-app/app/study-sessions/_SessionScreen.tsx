import { StudySession } from "./_utils";
import SessionCard from "./_SessionCard";
import { FlatList, ActivityIndicator, Text } from "react-native";

export default function SessionScreen({ sessions, fetchLoading, creatorName, fetchSessions }: { sessions: StudySession[]; fetchLoading: boolean; creatorName: string; fetchSessions: () => void }) {
    return (
        <FlatList<StudySession>
            data = {sessions}
            keyExtractor={(item) => item.id}
            renderItem={({item}) => <SessionCard session={item} creatorName={creatorName} />}
            contentContainerStyle={{ padding: 12}}
            ListFooterComponent={null}
            ListEmptyComponent={!fetchLoading ? <Text>No Sessions Found.</Text> : null}
            onEndReached={fetchSessions}
            onEndReachedThreshold={0.5}
        />
    )
}