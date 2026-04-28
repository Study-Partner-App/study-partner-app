import { View, Text, ActivityIndicator, Pressable, } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from "expo-linear-gradient";
import { StudySession } from "./_utils";
import { theme } from "@/lib/theme";
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { styles } from '../_styles/globalStyles';


export default function SessionDetails() {
    const { sessionId } = useLocalSearchParams<{ sessionId: string }>();
    const router = useRouter();

    const [loading, setLoading] = useState(true);
    const [session, setSession] = useState<StudySession | null>(null);

    useEffect(() => {   

        // Fetch session details using sessionId
        const fetchSessionDetails = async () =>{
            const { data,error } = await supabase.from("study_sessions").select("*").eq("id", sessionId).single();
            if(error) {
                console.error("Error fetching session details:", error);
            }
            else if(data) {
                setSession(data);
                setLoading(false);
            }
        };

        if(sessionId) {
            fetchSessionDetails();
        }
    }, [sessionId]);

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
                <Text style={styles.session_title}>Title: {session.title}</Text>
                <Text style={styles.session_subtitle}>Subject: {session.subject}</Text>
                <Text style={styles.session_subtitle}>Date: {session.date}</Text>
                <Text style={styles.session_subtitle}>Time: {session.start_time} - {session.end_time}</Text>
                <Text style={styles.session_subtitle}>Location: {session.location}</Text>
                <Text style={styles.session_text}>Description: {session.description}</Text>
            </View>
            <View style={{ marginTop: 20 }}>
                    <Pressable onPress={() => 
                        router.push({
                            pathname: "/study-sessions/edit",
                            params: { sessionId:sessionId }
                        })
                    }>
                        <LinearGradient
                            colors={theme.gradients.submitButton}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={styles.loginButton}
                        >    
                            <Text style={styles.loginButtonText}>Edit</Text>
                        </LinearGradient>
                    </Pressable>
                </View>
        </LinearGradient>
    )
}