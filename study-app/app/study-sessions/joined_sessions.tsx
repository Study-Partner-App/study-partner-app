import { supabase } from "@/lib/supabase";
import { theme } from "@/lib/theme";
import { User } from "@supabase/supabase-js";
import { LinearGradient } from "expo-linear-gradient";
import { useState, useEffect, useCallback } from "react";
import { useFocusEffect } from "expo-router";
import { View, Text, ActivityIndicator } from "react-native";
import { styles } from "../_styles/globalStyles";
import SessionScreen from "./_SessionScreen";
import { StudySession } from "./_utils";

export default function JoinedSessionsPage() {
    
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [sessions, setSessions] = useState<StudySession[]>([]);
    const [fetchLoading, setFetchLoading] = useState(false);
    const [userName, setUserName] = useState("");
    const [loadedSessions, setLoadedSessions] = useState(false);

    // Load the current user in order to retrieve their sessions.
    useEffect(() => {
        const loadUser = async () => {
            setLoading(true);
            const { data: {user} } = await supabase.auth.getUser();
            if(user) {
                const { data, error } = await supabase.from("profiles").select("*").eq("id", user.id).single();
                if (error) {
                    console.error("Error fetching user profile:", error);
                } else {
                    setCurrentUser(data);
                    setUserName(data.first_name + " " + data.last_name);
                }
            }
            setLoading(false);
        }
        loadUser();
        }, []);

    const fetchSessions = async () => {
        if(!currentUser?.id || fetchLoading || loadedSessions) return;

        setFetchLoading(true);
        const { data, error } = await supabase.from('commitments').select("*").eq("user_id", currentUser.id);
        if (error) {
            console.error("Error fetching sessions:", error);
        } 
        else if (data) 
        {
            setSessions((prev: any) => [...prev, ...data]);
            setFetchLoading(false);
            setLoadedSessions(true);
        }
    };

    if(loading || fetchLoading) {
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

    if(sessions.length === 0 && !fetchLoading) {
        return (
            <LinearGradient
                colors={theme.gradients.background}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{ flex: 1 }}
            >
                <View style={styles.container}>
                    <Text style={styles.session_title}>You haven't joined any sessions yet.</Text>
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
            <SessionScreen sessions={sessions} fetchLoading={fetchLoading} creatorName={userName} fetchSessions={fetchSessions}/>
        </LinearGradient>
    );
}