import React from "react";
import { View, Text, ActivityIndicator, Pressable} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState, useEffect } from "react";
import { User } from "./_utils";
import { supabase } from "@/lib/supabase";
import { styles } from "@/app/_styles/globalStyles";

export default function ProfileDetails() {
    const { userId} = useLocalSearchParams<{ userId: string }>();
    const router = useRouter();
    
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUser = async () => {
            const { data, error } = await supabase
                .from("profiles")
                .select("*")
                .eq("id", userId)
                .single();
            
            if( error ) {
                console.error("Error fetching user:", error);
            } else {
                setUser(data);
            }
            setLoading(false);
        };

        if(userId) {
            fetchUser();
        }
    }, [userId])

    if(loading) {
        return <ActivityIndicator />
    }

    if(!user) {
        return <Text> User not Found.</Text>
    }
    
    return (
        <View style={styles.container}>
            <Pressable onPress={() => router.back()}>
                <Text style={{ color: "black", marginBottom: 16}}>{"\u2190"} Back</Text>
            </Pressable>
            <View style={styles.card}>
                <Text style={{ fontSize: 24, fontWeight: 600 }}>{user.first_name} {user.last_name}</Text>
                <Text style={styles.university}>{user.university} - {user.major}</Text>
                {user.bio && (
                    <View style={{ marginTop: 16}}>
                        <Text style={{ fontSize: 18, marginBottom: 8 }}>Bio:</Text>
                        <Text>{user.bio}</Text>
                    </View>
                )}
            </View>
        </View>
    )
}