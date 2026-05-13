import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { User } from "./_utils";
import { styles } from "@/app/_styles/globalStyles";

export default function MatchCard({ user }: { user: User }) {
    const router = useRouter();
    if(!user) {
        return null;
    }
    
    return (
        <TouchableOpacity
            style={styles.card}
            onPress={() => 
                router.push({
                    pathname: "/_user-details/ProfileDetails",
                    params: {userId: user.id}
                })
            }
        >   
            <Text style={styles.username}>{user.first_name} {user.last_name}</Text>
            <Text style={styles.university}>{user.university}</Text>
            {/* {user.bio && (<Text style={styles.bio}>{user.bio}</Text>)} */}
        </TouchableOpacity>
    )
}



