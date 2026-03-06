import { User } from "./_ProfileCard";
import MatchCard from "./_ProfileCard";
import { FlatList, ActivityIndicator, Text } from "react-native";

export default function MatchingScreen({ currentUser, matches, loading, fetchMatchesFn } : { currentUser: User, matches: User[], loading: boolean, fetchMatchesFn: () => void }) {
    return (
        <FlatList<User>
            data = {matches}
            keyExtractor={(item) => item.id}
            renderItem={({item}) => <MatchCard user={item} />}
            contentContainerStyle={{ padding: 16}}
            ListFooterComponent={loading ? <ActivityIndicator /> : null}
            ListEmptyComponent={!loading ? <Text>No Matches Found.</Text> : null}
            onEndReached={fetchMatchesFn}
            onEndReachedThreshold={0.5}
        />
    )
}