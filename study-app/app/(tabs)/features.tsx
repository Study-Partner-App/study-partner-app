import React from "react";
import { View, Text, Pressable, SafeAreaView, StyleSheet} from "react-native";
import { router } from "expo-router";
import {LinearGradient } from "expo-linear-gradient";
import { theme } from "@/lib/theme";
import { Href } from "expo-router";
import { styles } from "@/app/_styles/globalStyles";
import { Ionicons } from '@expo/vector-icons';

export default function Features() {

    type Feature = {
        title: string,
        icon: keyof typeof Ionicons.glyphMap,
        route: Href
    }
    const features: Feature[] = [
        { title: "Announcement Board", icon: "megaphone", route: "../announcement"},
        { title: "Study Sessions", icon: "book", route: "../study-sessions"},
        { title: "Matching", icon: "sparkles", route: "../matching"},
        { title: "Friend Requests", icon: "person-add", route: "../requests"},
        { title: "Time Filter", icon: "time", route: "../time-filter"},
        { title: "Friends", icon: "people", route: "../friends"},
    ];

    return (
    <LinearGradient
      colors={theme.gradients.background}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{ flex: 1 }}
    >
        <SafeAreaView style={styles.container}>
            <Text style={[styles.featureTitle, {marginTop: 60}]}>CONNECT</Text>
            <View style={styles.featureGrid}>
                {features.map((f) => (
                    <Pressable
                        key={f.title}
                        onPress={() => router.push(f.route)}
                        style={{ marginBottom: 16, width: "48%"}}
                    >
                        <LinearGradient
                            colors= {["#67b3e9", "#67b3e9"]}
                            start= {{ x:0, y:0 }}
                            end= {{ x:1, y:1 }}
                            style={styles.featureCard}
                        >
                                <Ionicons name={f.icon} size={28} color="black" style={styles.featureIcon} />
                                <Text style={styles.featureText}>{f.title}</Text>
                        </LinearGradient>
                    </Pressable>
                ))}
            </View>
        </SafeAreaView>
    </LinearGradient>
    )
}
