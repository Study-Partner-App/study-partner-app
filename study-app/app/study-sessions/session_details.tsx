import { View, Text, ActivityIndicator, Pressable, } from 'react-native';
import { useRouter, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { LinearGradient } from "expo-linear-gradient";
import { StudySession } from "./_utils";
import { theme } from "@/lib/theme";
import { useCallback, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { styles } from '../_styles/globalStyles';


export default function SessionDetails() {
    const { sessionId } = useLocalSearchParams<{ sessionId: string }>();
    const router = useRouter();

    const [loading, setLoading] = useState(true);
    const [session, setSession] = useState<StudySession | null>(null);
    
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

    return (
        <LinearGradient
            colors={theme.gradients.background}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{ flex: 1 }}
        >
            <View style={styles.container}>
                <View style={styles.input}>
                    <Text style={styles.session_title}>Title: {session.title}</Text>
                    <Text style={styles.session_subtitle}>Subject: {session.subject}</Text>
                    <Text style={styles.session_subtitle}>Date: {session.date}</Text>
                    <Text style={styles.session_subtitle}>Time: {session.start_time} - {session.end_time}</Text>
                    <Text style={styles.session_subtitle}>Location: {session.location}</Text>
                    <Text style={styles.session_text}>Description: {session.description}</Text>
                </View>
            </View>
            <View style={styles.container}>
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