import { User } from "./_utils";
import MatchCard from "./_ProfileCard";
import { FlatList, ActivityIndicator, Text } from "react-native";

/**
 * This component is responsible for displaying the list of matched users. 
 * It receives the current user, the list of matches, a loading state, and a function to fetch more matches as props.
 * It uses a FlatList to render the matches and handles infinite scrolling by calling the fetchMatchesFn when the end of the list 
 * is reached. If there are no matches, it displays a message indicating that no matches were found. 
 * If it's currently loading more matches, it shows an ActivityIndicator at the bottom of the list.
 */

export default function MatchingScreen({ currentUser, matches, loading, fetchMatchesFn } : { currentUser: User, matches: User[], loading: boolean, fetchMatchesFn: () => void }) {
    return (
        <FlatList<User>
            data = {matches}
            keyExtractor={(item) => item.id}
            renderItem={({item}) => <MatchCard user={item} />}
            contentContainerStyle={{ padding: 12}}
            ListFooterComponent={loading ? <ActivityIndicator /> : null}
            ListEmptyComponent={!loading ? <Text>No Matches Found.</Text> : null}
            onEndReached={fetchMatchesFn}
            onEndReachedThreshold={0.5}
        />
    )
}