import React from "react";
import { FlatList, Text, View } from "react-native";
import { useFriendList } from "@/app/_hooks/friendList";
import { styles } from "@/app/_styles/globalStyles";

export default function FriendsPage() {
    const { friends, loading } = useFriendList();

    if(loading) { 
        return <Text> Loading...</Text>
    }

    if(friends.length === 0) {
        return <Text>Time to make some friends!</Text>
    }

    return (
        <FlatList
            data={friends}
            keyExtractor={(item) => item.id}
            renderItem={({item}) => {
                return (
                    <View style={styles.listCard}>
                        <Text style={styles.listTitle}>
                            {item.first_name} {item.last_name}
                        </Text>

                        <Text>
                            {item.university} - {item.major?.join(", ") ?? ""}
                        </Text>
                    </View>
                );
            }}
        />
    );
}