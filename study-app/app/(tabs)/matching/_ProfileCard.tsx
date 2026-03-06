import { View, Text, StyleSheet } from "react-native";

export type User = {
    id: string,
    created_at: string,
    university: string,
    first_name: string,
    last_name: string,
    major: string,
    email: string,
    classes?: string[],
    bio?: string,
    match_score?: number, // This is optional and will be added by the backend when fetching matches
}

export default function MatchCard({ user }: { user: User }) {
    if(!user) {
        return null;
    }
    return (
        <View style={styles.card}>
            <Text style={styles.username}>{user.first_name}</Text>
            <Text style={styles.university}>{user.university}</Text>
            {/* {user.bio && (<Text style={styles.bio}>{user.bio}</Text>)} */}
        </View>
    )
}

const styles = StyleSheet.create({
    card: {
        padding: 16,
        borderRadius: 12,
        backgroundColor: "#fff",
        marginBottom: 12,
        elevation: 2,
    },

    username: {
        fontSize: 18,
        fontWeight: "600",
    },

    university: {
        marginTop: 4,
        color: "#666",
    },

    bio: {
        marginTop: 8,
        color: "#444",
    },

    major: {
        marginTop: 8,
        color: "#444",
    },

})


