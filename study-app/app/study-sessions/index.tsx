import { View, Text, Button, Pressable } from 'react-native';
import { styles } from "@/app/_styles/globalStyles";
import { Href, useRouter } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { useState, useEffect } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '@/lib/theme';
import { StudySession, User } from './_utils';

export default function SessionPage() {
    type CardNav = {
        title: string,
        icon: string,
        route: Href
    }
    const create: CardNav = { title: "Create Study Session", icon: "➕", route: '/study-sessions/create_sessions' };

    const router = useRouter();

    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [sessions, setSessions] = useState<StudySession[]>([]);
    const [fetchLoading, setFetchLoading] = useState(false);

    // Load the current user in order to retrieve their sessions.
    useEffect(() => {
        const loadUser = async () => {
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

    // Fetch the sessions for the current user and place them into the sessions array.
    useEffect(() => {
        const fetchSessions = async () => {
            if(!currentUser?.id) return;

            setFetchLoading(true);
            const { data, error } = await supabase.from("study_sessions").select("*").eq("creator_id", currentUser.id);
            if (error) {
                console.error("Error fetching sessions:", error);
            } else {
                // This is intended to place each of the individual session objects into the sessions array, but I'm not sure if setSessions does that on its own.
                // TODO: Implement a way to append each session to the sessions array.
                setSessions(data);
            }
            setFetchLoading(false);
        };
        fetchSessions();
    }, [currentUser?.id]);

    return (
        <LinearGradient
                    colors={theme.gradients.background}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={{ flex: 1 }}
                >

            <View style={styles.container}>
            <Text style={styles.hs_title}>Study Sessions</Text>
                <Text>Here is where you view and create your study sessions.</Text>
                
                <Pressable
                    key={create.title}
                    onPress={() => router.push(create.route)}
                    style={{ marginBottom: 16, width: "48%"}}
                >
                    <LinearGradient
                        colors= {["#67b3e9", "#f6eff3"]}
                        start= {{ x:0, y:0 }}
                        end= {{ x:1, y:1 }}
                        style={styles.featureCard}
                    >
                            <Text style={styles.featureIcon}>{create.icon}</Text>
                            <Text style={styles.featureText}>{create.title}</Text>
                    </LinearGradient>
                </Pressable>

            </View>

        </LinearGradient>
    );
}