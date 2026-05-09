import React from "react";
import { FlatList, Text, View } from "react-native";
import { useFriendList } from "@/app/_hooks/friendList";
import { styles } from "@/app/_styles/globalStyles";
import { theme } from "@/lib/theme";
import { LinearGradient } from "expo-linear-gradient";

export default function FriendsPage() {
    const { friends, loading } = useFriendList();

    if(loading) { 
        return <Text> Loading...</Text>
    }

    if(friends.length === 0) {
        return <Text>Time to make some friends!</Text>
    }

    return (
         <LinearGradient
                            colors={theme.gradients.background}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={{ flex: 1 }}
                        >
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
        </LinearGradient>
    );
}