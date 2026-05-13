import { View, Text, ActivityIndicator, Pressable, ScrollView } from 'react-native';
import { useRouter, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { LinearGradient } from "expo-linear-gradient";
import { StudySession, LeaveSessionByUserAndSessionId } from '../_utilities/globalUtils';
import { theme } from "@/lib/theme";
import { useCallback, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { styles } from '../_styles/globalStyles';


export default function SessionDetails() {
    const { sessionId } = useLocalSearchParams<{ sessionId: string }>();
    const router = useRouter();

    const [loading, setLoading] = useState(true);
    const [session, setSession] = useState<StudySession | null>(null);

    const [isCreator, setIsCreator] = useState(false);
    
    // Fetch session details using sessionId
    const fetchSessionDetails = async () =>{
        const { data,error } = await supabase.from("study_sessions").select("*").eq("id", sessionId).single();
        if(error) {
            console.error("Error fetching session details:", error);
            setSession(null);
            setLoading(false);
        }
        else if(data) {
            setSession(data);
            setLoading(false);
        }
    };

    // Check if the current user is the creator of the session to determine whether to show edit/delete options.
    const checkIfCreator = async () => {
        const { data, error } = await supabase.from("study_sessions").select("creator_id").eq("id", sessionId).single();
        if (error) {
            console.error("Error checking session creator:", error);
        } else if (data) {
            // Assuming you have a way to get the current user's ID, e.g., from authentication
            const { data: { user }, error: userError } = await supabase.auth.getUser();
            if (userError) {
                console.error("Error getting user:", userError);
            } else if (user?.id === session?.creator_id) {
                setIsCreator(true);
            }
        }
    };

    const onDeleteSession = async () => {
        // First, delete all commitments associated with this session to avoid foreign key constraint errors.
        const { error: commitmentsError } = await supabase.from("commitments").delete().eq("session_id", sessionId);

        if(commitmentsError) {
            console.error("Error deleting commitments:", commitmentsError);
        } else {
            // Then, delete the session itself.
            const { error: sessionError } = await supabase.from("study_sessions").delete().eq("id", sessionId);

            if(sessionError) {
                console.error("Error deleting session:", sessionError);
            } else {
                // If deletion is successful, navigate back to the sessions list.
                router.back();
            }
        }
    };

    const onLeaveSession = async () => {

        const {data: {user}, error} = await supabase.auth.getUser();
        if(error) {
            console.error("Error getting user:", error);
            return;
        }
        else if(user) {
            await LeaveSessionByUserAndSessionId(user?.id, sessionId);
        }

        router.back();
    };

    // Fetch the sessions for the current user and place them into the sessions array.
    useFocusEffect(
        useCallback(() => {
            // This block of code runs when the screen is focused, so we want to fetch the sessions here in case there were any changes (new sessions created, sessions deleted, etc.) while the user was on a different screen.
            let isActive = true;

            fetchSessionDetails();

            // This is for when the screen is unfocused, so we can do cleanup here.
            return () => {
                isActive = false;
            };
    }, [sessionId]));

    useFocusEffect(
        useCallback(() => {
            let isActive = true;

            checkIfCreator();

            return () => {
                isActive = false;
            };
    }, [session]));

    if(loading) {
        return (
            <LinearGradient
                colors={theme.gradients.background}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{ flex: 1 }}
            >
                <ActivityIndicator />
            </LinearGradient>
        )
    }

    if(!sessionId || !session) {
        return (
            <LinearGradient
                colors={theme.gradients.background}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{ flex: 1 }}
            >
                <View style={styles.container}>
                    <Text style={styles.session_title}>Session not found.</Text>
                </View>
            </LinearGradient>
        )
    }

    if(!isCreator) {
        return (
            <LinearGradient
                colors={theme.gradients.background}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{ flex: 1 }}
            >
                <View style={styles.container}>
                    <ScrollView style={styles.input}>
                        <Text style={styles.session_title}>Title: {session.title}</Text>
                        <Text style={styles.session_subtitle}>Subject: {session.subject}</Text>
                        <Text style={styles.session_subtitle}>Course: {session.course}</Text>
                        <Text style={styles.session_subtitle}>Date: {session.date}</Text>
                        <Text style={styles.session_subtitle}>Time: {session.start_time} - {session.end_time}</Text>
                        <Text style={styles.session_subtitle}>Location: {session.location}</Text>
                        <Text style={styles.session_text}>Description: {session.description}</Text>
                    </ScrollView>
                </View>

                <View style={styles.footer}>   
                    <Pressable
                        style={styles.button} 
                        onPress={onLeaveSession}
                        accessibilityRole="button"
                        accessibilityLabel="Leave Session"
                    >
                        <Text style={styles.loginButtonText}>Leave Session</Text>
                    </Pressable>

                </View>

            </LinearGradient>
        )
    }
    else {
        return (
            <LinearGradient
                colors={theme.gradients.background}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{ flex: 1 }}
            >
                <View style={styles.container}>
                    <ScrollView style={styles.input}>
                        <Text style={styles.session_title}>Title: {session.title}</Text>
                        <Text style={styles.session_subtitle}>Subject: {session.subject}</Text>
                        <Text style={styles.session_subtitle}>Course: {session.course}</Text>
                        <Text style={styles.session_subtitle}>Date: {session.date}</Text>
                        <Text style={styles.session_subtitle}>Time: {session.start_time} - {session.end_time}</Text>
                        <Text style={styles.session_subtitle}>Location: {session.location}</Text>
                        <Text style={styles.session_text}>Description: {session.description}</Text>
                    </ScrollView>
                </View>
                <View style={styles.footer}>
                    <Pressable
                        style={styles.button} 
                        onPress={() => 
                            router.push({
                                pathname: "/study-sessions/edit",
                                params: { sessionId:sessionId }
                            })
                        }
                        accessibilityRole="button"
                        accessibilityLabel="Edit"
                    >
                        <Text style={styles.loginButtonText}>Edit</Text>
                    </Pressable>
                    
                    <Pressable
                        style={styles.button} 
                        onPress={onDeleteSession}
                        accessibilityRole="button"
                        accessibilityLabel="Delete"
                    >
                        <Text style={styles.loginButtonText}>Delete</Text>
                    </Pressable>

                </View>
            </LinearGradient>
        )
    }
}