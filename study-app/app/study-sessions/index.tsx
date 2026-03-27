import { View, Text, Button, Pressable } from 'react-native';
import { styles } from "@/app/_styles/globalStyles";
import { Href, useRouter } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { useState } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '@/lib/theme';

export default function IndexPage() {
    type CardNav = {
        title: string,
        icon: string,
        route: Href
    }
    const create: CardNav = { title: "Create Study Session", icon: "➕", route: '/study-sessions/create_sessions' };

    const router = useRouter();

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