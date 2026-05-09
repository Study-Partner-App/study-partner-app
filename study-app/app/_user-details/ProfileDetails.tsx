import React from "react";
import { View, Text, ActivityIndicator, Pressable} from "react-native";
import { useLocalSearchParams, useRouter, Stack } from "expo-router";
import { useState, useEffect } from "react";
import { User } from '@/app/_user-details/_utils';
import { supabase } from "@/lib/supabase";
import { styles } from "@/app/_styles/globalStyles";
import {useFriendRequests } from "@/app/_hooks/friendRequests";
import { LinearGradient } from "expo-linear-gradient";
import { theme } from "@/lib/theme";

export default function ProfileDetails() {
    const { userId} = useLocalSearchParams<{ userId: string }>();
    const router = useRouter();
    
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [friendStatus, setFriendStatus] = useState<
        "none" | "pending_sent" | "pending_received" | "friends"
    >("none");

    const { requests, acceptRequest, rejectRequest } = useFriendRequests();

    // Check Friend Status
    const checkFriendStatus = async () => {
        const { data: { user: authUser } } = await supabase.auth.getUser();
        if(!authUser) return;
        if(!userId) return;

        const request = requests.find(
            (r) => 
            (r.sender_id === authUser.id && r.receiver_id === userId) ||
            (r.sender_id === userId && r.receiver_id === authUser.id)
        );

        if(!request) {
            setFriendStatus("none");
            return;
        }

        if(request.status === "accepted") {
            setFriendStatus("friends");
        } else if (request.sender_id == authUser.id) {
            setFriendStatus("pending_sent");
        } else {
            setFriendStatus("pending_received");
        }
    };

    // Fetch User Details
    const fetchUserDetails = async () => {
        if(!userId) return;
        const {data, error } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", userId)
            .maybeSingle();

        if(error) {
            console.error("Error fetching user details: ", error);
        } else {
            setUser(data);
        }
        setLoading(false);
    }

    useEffect(() => {
        fetchUserDetails();
    }, [userId]);

    useEffect(() => {
        checkFriendStatus();
    }, [requests, userId]);

    if(loading) {
        return <ActivityIndicator />
    }

    if(!user) {
        return <Text> User not Found.</Text>
    }

    const handleAddFriend = async () => {
        const { data: {user: authUser } } = await supabase.auth.getUser();
        if(!authUser) return;

        // Check if the request exists either way.
        const existingRequest = requests.find(
            (r) => 
            (r.sender_id === authUser.id && r.receiver_id === userId) ||
            (r.sender_id === userId && r.receiver_id === authUser.id)
        )

        if(existingRequest) {
            console.log("Request already exists.");
            return;
        }

        // Create a new friend request
        const { error } = await supabase
            .from("friend_requests")
            .insert({
                sender_id: authUser.id,
                receiver_id: user.id,
                status: "pending"
            });

        if(error) {
            console.error("Friend request failed: ", error);
        } else {
            console.log("Friend request sent!");
            setFriendStatus("pending_sent");
        }

    }
    
    const handleAcceptFriend = async () => {
        const request = requests.find(r => r.sender_id === userId);
        if(request) await acceptRequest(request.id);
    };

    const handleRejectFriend = async () => {
        const request = requests.find(r => r.sender_id === userId);
        if(request) await rejectRequest(request.id);
    }

    return (
        <LinearGradient
            colors={theme.gradients.background}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{ flex: 1 }}
        >
            <>
            <Stack.Screen
                options={{
                    title: "Profile",
                    headerBackTitle: "Back",
                }}
            />
            <View style={styles.container}>
                
                <View style={styles.card}>
                    <View style={styles.buttonInRow}>
                        <Text style={{ fontSize: 24, fontWeight: 600 }}>{user.first_name} {user.last_name}</Text>

                        {/* <Pressable style={styles.addFriendButton} onPress={handleAddFriend}>
                            <Text style={{ color: "white", fontWeight: "500" }}> Add Friend</Text>
                        </Pressable> */}

                        {friendStatus === "none" && (
                            <Pressable style={styles.addFriendButton} onPress={handleAddFriend}>
                                <Text style={{ color: "white" }}>Add Friend</Text>
                            </Pressable>
                        )}

                        {friendStatus === "pending_received" && (
                            <View style={styles.buttonsSameRow}>
                                <Pressable style={styles.addFriendButton} onPress={handleAcceptFriend}>
                                    <Text style={{ color: "white" }}>Accept</Text>
                                </Pressable>

                                <Pressable style={styles.rejectFriendButton} onPress={handleRejectFriend}>
                                    <Text style={{ color: "white" }}>Reject</Text>
                                </Pressable>
                            </View>
                        )}

                        {friendStatus === "pending_sent" && (
                            <Text style={{ color: "gray" }}>Request Sent</Text>
                        )}

                        {friendStatus === "friends" && (
                            <Text style={{ color: "green" }}>Friends ✓</Text>
                        )}
                    </View>

                    <Text style={styles.university}>{user.university} - {user.major}</Text>
                    {user.bio && (
                        <View style={{ marginTop: 16}}>
                            <Text style={{ fontSize: 18, marginBottom: 8 }}>Bio:</Text>
                            <Text>{user.bio}</Text>
                        </View>
                    )}
                </View>
            </View>
        </>   
    </LinearGradient> 
    )

    
}