import React from "react";
import { View, Text, Pressable, SafeAreaView, StyleSheet} from "react-native";
import { router } from "expo-router";
import {LinearGradient } from "expo-linear-gradient";
import { theme } from "@/lib/theme";
import { Href } from "expo-router";
import { styles } from "@/app/_styles/globalStyles";

export default function Features() {

    type Feature = {
        title: string,
        icon: string,
        route: Href
    }
    const features: Feature[] = [
        { title: "Announcement Board", icon: "📢", route: "../announcement"},
        { title: "Study Sessions", icon: "📚", route: "../study-sessions"},
        { title: "Matching", icon: "🤗", route: "../matching"},
        { title: "Friend Requests", icon: "👥", route: "../requests"},
        { title: "Time Filter", icon: "⏰", route: "../time-filter"},
        { title: "Friends", icon: "🤝", route: "../friends"},
    ];

    return (
    <LinearGradient
      colors={theme.gradients.background}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{ flex: 1 }}
    >
        <SafeAreaView style={styles.container}>
            <Text style={[styles.featureTitle, {marginTop: 20}]}>Features</Text>
            <View style={styles.featureGrid}>
                {features.map((f) => (
                    <Pressable
                        key={f.title}
                        onPress={() => router.push(f.route)}
                        style={{ marginBottom: 16, width: "48%"}}
                    >
                        <LinearGradient
                            colors= {["#67b3e9", "#f6eff3"]}
                            start= {{ x:0, y:0 }}
                            end= {{ x:1, y:1 }}
                            style={styles.featureCard}
                        >
                                <Text style={styles.featureIcon}>{f.icon}</Text>
                                <Text style={styles.featureText}>{f.title}</Text>
                        </LinearGradient>
                    </Pressable>
                ))}
            </View>
        </SafeAreaView>
    </LinearGradient>
    )
}
