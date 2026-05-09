import React, { useEffect, useState } from "react"
import { View, Text, Pressable, FlatList } from "react-native";
import { supabase } from "../../lib/supabase";
import { FriendRequest } from "../matching/_utils";
import { useFriendRequests } from "@/app/_hooks/friendRequests";
import UserCard from "./_UserCard";
import { LinearGradient } from "expo-linear-gradient";
import { theme } from "@/lib/theme";

export default function FriendRequestsPage() {
    // State to hold incoming friend requests
    const { requests, acceptRequest, rejectRequest , loading} = useFriendRequests();
    const [authUserId, setAuthUserId] = useState<string | null>(null);

    useEffect(() => {
        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if(user) setAuthUserId(user.id);
        }

        getUser();
    }, []);

    const incomingRequests = requests.filter(
        (r) =>
            r.status === "pending" && r.receiver_id === authUserId
    )

    if(loading) {
        return <Text>Loading...</Text>
    }

    return (
        <LinearGradient
            colors={theme.gradients.background}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{ flex: 1 }}
        >
            <FlatList
                data={incomingRequests}
                keyExtractor={(item) => item.id}
                ListEmptyComponent={
                    <Text style={{ textAlign: "center", marginTop: 40}}>
                        No friend requests right now 🙂
                    </Text>
                }
                renderItem={({ item }) => {
                    // const user = Array.isArray(item.profiles)
                    //     ? item.profiles[0]
                    //     : item.profiles;

                    if(!item) return null;
                    
                    return (
                        <UserCard
                            user={item}
                            onAccept={acceptRequest}
                            onReject={rejectRequest}
                        />
                    );
                }}
            />
        </LinearGradient>
    );

}