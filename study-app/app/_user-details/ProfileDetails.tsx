import React from "react";
import { View, Text, ActivityIndicator, Pressable} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState, useEffect } from "react";
import { User } from '@/app/_user-details/_utils';
import { supabase } from "@/lib/supabase";
import { styles } from "@/app/_styles/globalStyles";

export default function ProfileDetails() {
    const { userId} = useLocalSearchParams<{ userId: string }>();
    const router = useRouter();
    
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [friendStatus, setFriendStatus] = useState<
        "none" | "pending_sent" | "pending_received" | "friends"
    >("none");

    // Check Friend Status
    const checkFriendStatus = async () => {
        const { data: { user: authUser } } = await supabase.auth.getUser();
        console.log("Checking friend status for userId:", userId);
        console.log("Authenticated user:", authUser);
        if(!authUser) return;
        // Check if there's a friend request between the current user and the profile user
        const { data, error } = await supabase
            .from("friend_requests")
            .select("*")
            .or(
                `and(sender_id.eq.${authUser.id},receiver_id.eq.${userId}),and(sender_id.eq.${userId},receiver_id.eq.${authUser.id})`
            )
            .limit(1);

        if(data && data.length > 0) {
            const req = data[0];
            if(req.status === "accepted") {
                setFriendStatus("friends");
            } else if(req.status === "pending") {
                if(req.sender_id === authUser.id) {
                    setFriendStatus("pending_sent");
                } else {
                    setFriendStatus("pending_received");
                }
            } 
        } else {
            setFriendStatus("none");
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
        checkFriendStatus();
    }, [userId]);

    useEffect(() => {
        let channel: any;
        const setupRealtime = async () => {
            const { data: { user: authUser } } = await supabase.auth.getUser();
            if(!authUser) return;

            channel = supabase
                .channel("friend_requests_updates")
                .on("postgres_changes", {
                    event: "*",
                    schema: "public",
                    table: "friend_requests",
                    filter: `or(receiver_id.eq.${authUser.id},sender_id.eq.${authUser.id})`
                }, () => {
                    checkFriendStatus();
                })
                .subscribe();
            
            
        };
        setupRealtime();
        return () => {
            if(channel){
                supabase.removeChannel(channel);
            }
            
        };
    }, []);

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
        const { data: existingRequest } = await supabase
            .from("friend_requests")
            .select("*")
            .or(
                `and(sender_id.eq.${authUser.id},receiver_id.eq.${user.id}),and(sender_id.eq.${user.id},receiver_id.eq.${authUser.id})`
            )
            .limit(1) // We only need to know if there's at least one request, so we limit to 1 for efficiency
            .maybeSingle()

        if(existingRequest) {
            console.log("Request already exists.");
            
            if(existingRequest.receiver_id == authUser.id) {
                // If you are receiver, show Accept/Reject button.
                setFriendStatus("pending_received");
            } else if(existingRequest.sender_id == authUser.id) {
                setFriendStatus("pending_sent");
            } else if(existingRequest.status === "accepted") {
                setFriendStatus("friends");
            }

            return;
        }

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
        const { data: {user: authUser }} = await supabase.auth.getUser();
        if(!authUser) return;

        const { error } = await supabase
            .from("friend_requests")
            .update({ status: "accepted" })
            .eq("receiver_id", authUser.id) // current user
            .eq("sender_id", user.id); // person who sent request

        if(error) {
            console.error("Accepting Friend Request Failed:", error);
        } else {
            console.log("Friend Request Accepted!");
            await checkFriendStatus();
        }
    };

    const handleRejectFriend = async () => {
        const { data: {user: authUser }} = await supabase.auth.getUser();
        if(!authUser) return;

        const { error } = await supabase
            .from("friend_requests")
            .delete()
            .eq("receiver_id", authUser.id) // current User
            .eq("sender_id", user.id); // sender of the request
        
        if(error) {
            console.error("rejecting Friend Request Failed:", error);
        } else {
            console.log("Friend Request Rejected!");
            await checkFriendStatus();
        }
    }

    return (
        <View style={styles.container}>
            <Pressable onPress={() => router.back()}>
                <Text style={{ color: "black", marginBottom: 16}}>{"\u2190"} Back</Text>
            </Pressable>
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
        
    )

    
}