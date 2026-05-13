import { View, Text, StyleSheet, TouchableOpacity, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { FriendRequest } from '@/app/_user-details/_utils';
import { styles } from "@/app/_styles/globalStyles";

type UserCardProps = {
    user: FriendRequest;
    onAccept: (id: string) => void;
    onReject: (id: string) => void;
}

export default function UserCard({ user, onAccept, onReject }: UserCardProps) {
    const router = useRouter();
    if(!user) { 
        return null;
    }

    const profile = Array.isArray(user.profiles)
        ? user.profiles[0]
        : user.profiles;
      
    if(!profile) {
        return null;
    }

    console.log("UserCard profile: ", profile);
    return (
        <TouchableOpacity
            style={styles.listCard}
            onPress={() => 
                router.push({
                    pathname: "/_user-details/ProfileDetails",
                    params: {userId: user.sender_id}
                })
            }
        >
            <Text style={styles.listTitle}>
                {profile?.first_name} {profile?.last_name}
            </Text>

            <Text>
                {profile?.university} - {profile?.major?.join(",") ?? ""}
            </Text>

            <View style={{ flexDirection: "row", marginTop: 10 }}>
                <Pressable
                    onPress={() => onAccept(user.id)}
                    style={{ marginRight: 10, backgroundColor: "#4CAF50", padding: 8}}
                >
                    <Text style={{ color: "white" }}>Accept</Text>
                </Pressable>

                <Pressable
                    onPress={() => onReject(user.id) }
                    style={{ backgroundColor: "#E53935", padding: 8}}
                >
                    <Text style={{ color: "white" }}>Reject</Text>
                </Pressable>
            </View>
        </TouchableOpacity>
    )
}