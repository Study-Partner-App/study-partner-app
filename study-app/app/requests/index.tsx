import React, { useEffect, useState } from "react"
import { View, Text, Pressable, FlatList } from "react-native";
import { supabase } from "../../lib/supabase";
import { FriendRequest } from "../matching/_utils";

export default function FriendRequestsPage() {
    // State to hold incoming friend requests
    const [requests, setRequests] = useState<FriendRequest[]>([]);
    // Keep track of all friend requests
    const fetchRequests = async () => {
        const { data: {user} } = await supabase.auth.getUser();
        if(!user) return;
        // Fetch friend requests where the current user is the receiver and the status is pending
        // Also join with the profiles table to get sender's details for display
        const { data, error } = await supabase
            .from("friend_requests")
            .select(`
                id,
                sender_id,
                profiles!friend_requests_sender_id_fkey(
                    first_name,
                    last_name,
                    university,
                    major
                )
                `
            )
            .eq("receiver_id", user.id)
            .eq("status", "pending");
        if(!error) setRequests(data || []);
    };

    useEffect(() => {
        fetchRequests();
    }, []);

    const acceptRequest = async (requestId: string) => {
        const { error } = await supabase
            .from("friend_requests")
            .update({ status: "accepted"})
            .eq("id", requestId)

        if(!error) fetchRequests();
    }

    const rejectRequest = async (requestId: string) => {
        const { error } = await supabase
            .from("friend_requests")
            .update({ status: "rejected"})
            .eq("id", requestId)

        if(!error) fetchRequests();
    }

    return (
        <FlatList
            data={requests}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => {
                const user = item.profiles[0];
                if(!user) return null;

                return (
                    <View style={{ padding: 16, borderBottomWidth: 1 }}>
                        <Text style={{ fontSize: 18 }}>
                            {user.first_name} {user.last_name}
                        </Text>

                        <Text>
                            {user.university} - {user.major}
                        </Text>

                        <View style={{ flexDirection: "row", marginTop: 10 }}>
                            <Pressable
                                onPress={() => acceptRequest(item.id)}
                                style={{ marginRight: 10, backgroundColor: "#4CAF50", padding: 8}}
                            >
                                <Text style={{ color: "white" }}>Accept</Text>
                            </Pressable>

                            <Pressable
                                onPress={() => rejectRequest(item.id) }
                                style={{ backgroundColor: "#E53935", padding: 8}}
                            >
                                <Text style={{ color: "white" }}>Reject</Text>
                            </Pressable>
                        </View>
                    </View>
                );
            }}
        />
    );

}