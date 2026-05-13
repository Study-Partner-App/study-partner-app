import { supabase } from "@/lib/supabase";
import { theme } from "@/lib/theme";
import { User } from "@supabase/supabase-js";
import { LinearGradient } from "expo-linear-gradient";
import { useState, useEffect, useCallback } from "react";
import { View, Text, ActivityIndicator } from "react-native";
import { styles } from "../_styles/globalStyles";
import SessionScreen from "./_SessionScreen";
import { Commitment, StudySession } from "../_utilities/globalUtils";
import { useFocusEffect } from 'expo-router';

export default function JoinedSessionsPage() {
    
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [sessions, setSessions] = useState<StudySession[]>([]);
    const [commitments, setCommitments] = useState<Commitment[]>([]);
    const [fetchLoading, setFetchLoading] = useState(false);
    const [loadedCommitments, setLoadedCommitments] = useState(false);
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
                }
            }
            setLoading(false);
        }
        loadUser();
        }, []);

    //TODO: There is definitely a more efficient way to do this through query logic using joins, but I don't particularly want to mess with this too much right now.

    // First we fetch the commitments for the current user.
    const fetchCommitments = async () => {
        if(!currentUser?.id || fetchLoading || loadedCommitments) return;

        setFetchLoading(true);
        const { data, error } = await supabase.from('commitments').select("*").eq("user_id", currentUser.id);
        if (error) {
            console.error("Error fetching commitments:", error);
        } 
        else if (data) 
        {
            setCommitments((prev: Commitment[]) => [...prev, ...data]);
            setFetchLoading(false);
            setLoadedCommitments(true);
        }
    };

    // Then extract the session ids from the commitments and fetch the session details for each session id.
    const getSessionIdArray = () => {
        return commitments.map((commitment) => commitment.session_id);
    }

    // And here we actually fetch the session details using the array of session ids we got from the commitments.
    const fetchSessions = async () => {
        if(!currentUser?.id || fetchLoading || loadedSessions) return;

        setFetchLoading(true);

        const sessionIds = getSessionIdArray();

        if(sessionIds.length === 0) {
            setFetchLoading(false);
            setLoadedSessions(true);
            return;
        }

        const sessionsArray: StudySession[] = [];

        for(const sessionId of sessionIds) {
            const { data, error } = await supabase.from('study_sessions').select("*").eq("id", sessionId).single();
            if (error) {
                console.error(`Error fetching session with id ${sessionId}:`, error);
            } 
            else if (data) 
            {
                sessionsArray.push(data);
            }
        }
        setSessions(sessionsArray);
        setFetchLoading(false);
        setLoadedSessions(true);
    };

    useFocusEffect(
        useCallback(() => {
            // This block of code runs when the screen is focused, so we want to fetch the commitments and sessions here in case there were any changes (new sessions joined, sessions left, etc.) while the user was on a different screen.
            let isActive = true;

            fetchCommitments();

            // This is for when the screen is unfocused, so we can do cleanup here.
            return () => {
                isActive = false;
            };

        }, [currentUser]));


    useFocusEffect(
        useCallback(() => {
            let isActive = true;

            if(commitments.length > 0) {
                fetchSessions();
            }

            return () => {
                isActive = false;
            };
    }, [commitments]));

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
            <SessionScreen sessions={sessions} fetchLoading={fetchLoading} fetchSessions={fetchSessions}/>
        </LinearGradient>
    );
}