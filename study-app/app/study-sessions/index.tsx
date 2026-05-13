import { View, Text, Pressable, ActivityIndicator, } from 'react-native';
import { styles } from "@/app/_styles/globalStyles";
import { Href, useRouter, useFocusEffect } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { useState, useEffect, useCallback } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '@/lib/theme';
import SessionScreen from './_SessionScreen';
import { StudySession, User } from './_utils';

export default function SessionPage() {
    type CardNav = {
        title: string,
        icon: string,
        route: Href
    }

    const cards: CardNav[] = [
        { title: "Create Study Session", icon: "➕", route: '/study-sessions/create_sessions' }, 
        { title: "View Joined Sessions", icon: "📚", route: '/study-sessions/joined_sessions'}
    ];

    const router = useRouter();

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
        const { data, error } = await supabase.from("study_sessions").select("*").eq("creator_id", currentUser.id);
        if (error) {
            console.error("Error fetching sessions:", error);
        } 
        else if (data) 
        {
            setSessions((prev: any) => [...prev, ...data]);
            setLoadedSessions(true);
        }
    };

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

    return (
        <LinearGradient
                    colors={theme.gradients.background}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={{ flex: 1 }}
                >

            <View style={styles.session_container}>
                <Text style={styles.session_title}>Study Sessions</Text>

                <View style={styles.featureGrid}>
                    {cards.map((c) => (
                        <Pressable
                            key={c.title}
                            onPress={() => router.push(c.route)}
                            style={{ marginBottom: 16, width: "48%"}}
                        >
                            <LinearGradient
                                colors= {["#67b3e9", "#f6eff3"]}
                                start= {{ x:0, y:0 }}
                                end= {{ x:1, y:1 }}
                                style={styles.featureCard}
                            >
                                    <Text style={styles.featureIcon}>{c.icon}</Text>
                                    <Text style={styles.featureText}>{c.title}</Text>
                            </LinearGradient>
                        </Pressable>
                    ))}
                </View>

                <Text style={styles.session_subtitle}>My Sessions</Text>
                <SessionScreen sessions={sessions} fetchLoading={fetchLoading} creatorName={userName} fetchSessions={fetchSessions}/>
            </View>

        </LinearGradient>
    );
}