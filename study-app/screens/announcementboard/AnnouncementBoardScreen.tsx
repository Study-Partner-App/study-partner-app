import React, { useMemo, useState } from "react";

import {
    SafeAreaView,
    View,
    Text,
    Pressable,
    StyleSheet,
    Platform,
    FlatList,
    Alert,
} from "react-native";

type Filter = "All" | "Starts soon" | "Quiet" | "Academic" | "Social";

type Announcement = {
    id: string;
    title: string;
    startMinutesFromNow: number; // simple mock for "Starts soon"
    timeLabel: string;
    location: string;
    distanceMiles?: number;
    tags: string[];
    category: "Academic" | "Social";
};

const MOCK_ANNOUNCEMENTS: Announcement[] = [
    {
        id: "a1",
        title: "Calc II — Integration practice",
        startMinutesFromNow: 30,
        timeLabel: "6:00–7:30 PM",
        location: "McFarlin Library 2nd floor",
        distanceMiles: 0.4,
        tags: ["Quiet", "Homework", "Whiteboard"],
        category: "Academic",
    },
    {
        id: "a2",
        title: "CS Study Jam — LeetCode + coffee",
        startMinutesFromNow: 10,
        timeLabel: "5:10–6:20 PM",
        location: "Student Union — Atrium",
        distanceMiles: 0.7,
        tags: ["Social"],
        category: "Social",
    },
    {
        id: "a3",
        title: "BIO 101 — flashcards session",
        startMinutesFromNow: 120,
        timeLabel: "8:00–9:00 PM",
        location: "Science Building Room 210",
        distanceMiles: 1.2,
        tags: ["Quiet"],
        category: "Academic",
    },
];

export default function AnnouncementBoardScreen() {
    const [activeFilter, setActiveFilter] = useState<Filter>("All");
    const [announcements, setAnnouncements] = useState<Announcement[]>(MOCK_ANNOUNCEMENTS);

    const filters = useMemo<Filter[]>(
        () => ["All", "Starts soon", "Quiet", "Academic", "Social"],
        []
    );

    const filteredAnnouncements = useMemo(() => {
        switch (activeFilter) {
            case "All":
                return announcements;
            case "Starts soon":
                // starts within 45 minutes (mock logic)
                return announcements.filter((a) => a.startMinutesFromNow <= 45);
            case "Quiet":
                return announcements.filter((a) => a.tags.includes("Quiet"));
            case "Academic":
                return announcements.filter((a) => a.category === "Academic");
            case "Social":
                return announcements.filter((a) => a.category === "Social");
            default:
                return announcements;
        }
    }, [announcements, activeFilter]);

    const handleSkip = (id: string) => {
        setAnnouncements((prev) => prev.filter((a) => a.id !== id));
    };

    const handleJoin = (a: Announcement) => {
        Alert.alert("Joined", `You joined: ${a.title}`);
    };

    const handleAdd = () => {
        // simple mock: add a new announcement at the top
        const next: Announcement = {
            id: `new-${Date.now()}`,
            title: "New announcement (mock)",
            startMinutesFromNow: 20,
            timeLabel: "Today — 30 min",
            location: "TBD",
            distanceMiles: 0.0,
            tags: ["Quiet"],
            category: "Academic",
        };

        setAnnouncements((prev) => [next, ...prev]);
        setActiveFilter("All");
    };

    return (
        <SafeAreaView style={styles.safe}>
            <View style={styles.page}>
                {/* Header */}
                <Text style={styles.title}>Today's Announcement Board</Text>

                {/* Filter chips */}
                <View style={styles.chipRow}>
                    {filters.map((label) => {
                        const isActive = label === activeFilter;
                        return (
                            <Pressable
                                key={label}
                                onPress={() => setActiveFilter(label)}
                                style={[styles.chip, isActive && styles.chipActive]}
                            >
                                <Text style={[styles.chipText, isActive && styles.chipTextActive]}>
                                    {label}
                                </Text>
                            </Pressable>
                        );
                    })}
                </View>

                {/* Content area */}
                <View style={styles.content}>
                    <FlatList
                        data={filteredAnnouncements}
                        keyExtractor={(item) => item.id}
                        contentContainerStyle={{ width: "100%", maxWidth: 560 }}
                        renderItem={({ item }) => (
                            <AnnouncementCard
                                announcement={item}
                                onSkip={() => handleSkip(item.id)}
                                onJoin={() => handleJoin(item)}
                            />
                        )}
                        ListEmptyComponent={
                            <View style={{ paddingTop: 24, alignItems: "center" }}>
                                <Text style={{ fontWeight: "800", color: "#111827", fontSize: 16 }}>
                                    No announcements
                                </Text>
                                <Text style={{ marginTop: 6, color: "#6B7280", fontWeight: "600" }}>
                                    Try a different filter or tap + to add a mock item.
                                </Text>
                            </View>
                        }
                        ItemSeparatorComponent={() => <View style={{ height: 14 }} />}
                        showsVerticalScrollIndicator={false}
                    />
                </View>

                {/* Floating action button */}
                <Pressable style={styles.fab} onPress={handleAdd}>
                    <Text style={styles.fabText}>+</Text>
                </Pressable>
            </View>
        </SafeAreaView>
    );
}

/** One card layout (now driven by props) */
function AnnouncementCard({
    announcement,
    onSkip,
    onJoin,
}: {
    announcement: Announcement;
    onSkip: () => void;
    onJoin: () => void;
}) {
    return (
        <View style={styles.cardShadowWrap}>
            <View style={styles.card}>
                <Text style={styles.cardTitle}>{announcement.title}</Text>

                <View style={styles.metaRow}>
                    <Text style={styles.metaIcon}>🕒</Text>
                    <Text style={styles.metaText}>{announcement.timeLabel}</Text>
                </View>

                <View style={styles.metaRow}>
                    <Text style={styles.metaIcon}>📍</Text>
                    <Text style={styles.metaText}>
                        {announcement.location}{" "}
                        {typeof announcement.distanceMiles === "number" && (
                            <Text style={styles.metaMuted}>• {announcement.distanceMiles.toFixed(1)} mi</Text>
                        )}
                    </Text>
                </View>

                {/* Tags */}
                <View style={styles.tagRow}>
                    {announcement.tags.map((t) => (
                        <View key={t} style={styles.tag}>
                            <Text style={styles.tagText}>{t}</Text>
                        </View>
                    ))}
                </View>

                {/* Bottom buttons */}
                <View style={styles.actionRow}>
                    <Pressable style={[styles.actionBtn, styles.actionSecondary]} onPress={onSkip}>
                        <Text style={styles.actionSecondaryText}>Skip</Text>
                    </Pressable>

                    <Pressable style={[styles.actionBtn, styles.actionPrimary]} onPress={onJoin}>
                        <Text style={styles.actionPrimaryText}>Join</Text>
                    </Pressable>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: "#F4F5F7" },

    page: {
        flex: 1,
        paddingHorizontal: 24,
        paddingTop: 16,
    },

    title: {
        fontSize: 36,
        fontWeight: "800",
        color: "#111827",
        marginBottom: 16,
    },

    chipRow: {
        flexDirection: "row",
        flexWrap: "wrap",
        marginBottom: 24,
    },

    chip: {
        borderWidth: 1,
        borderColor: "#D1D5DB",
        backgroundColor: "#FFFFFF",
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 999,
        marginRight: 10,
        marginBottom: 10,
    },
    chipActive: {
        backgroundColor: "#111827",
        borderColor: "#111827",
    },
    chipText: {
        fontWeight: "700",
        color: "#111827",
    },
    chipTextActive: {
        color: "#FFFFFF",
    },

    content: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        paddingBottom: 80, // room for FAB
    },

    cardShadowWrap: {
        width: "100%",
        borderRadius: 28,
        ...Platform.select({
            ios: {
                shadowColor: "#000",
                shadowOpacity: 0.15,
                shadowRadius: 18,
                shadowOffset: { width: 0, height: 12 },
            },
            android: { elevation: 8 },
            default: {},
        }),
    },

    card: {
        backgroundColor: "#FFFFFF",
        borderRadius: 28,
        padding: 24,
        borderWidth: 1,
        borderColor: "#E5E7EB",
    },

    cardTitle: {
        fontSize: 26,
        fontWeight: "800",
        color: "#111827",
        marginBottom: 16,
    },

    metaRow: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 10,
    },
    metaIcon: { fontSize: 16, marginRight: 10 },
    metaText: { fontSize: 16, color: "#374151", fontWeight: "600" },
    metaMuted: { color: "#9CA3AF", fontWeight: "600" },

    tagRow: {
        flexDirection: "row",
        flexWrap: "wrap",
        marginTop: 12,
        marginBottom: 26,
    },
    tag: {
        paddingVertical: 8,
        paddingHorizontal: 14,
        borderRadius: 999,
        backgroundColor: "#F3F4F6",
        borderWidth: 1,
        borderColor: "#E5E7EB",
        marginRight: 10,
        marginBottom: 10,
    },
    tagText: { fontWeight: "700", color: "#374151" },

    actionRow: {
        flexDirection: "row",
    },
    actionBtn: {
        flex: 1,
        paddingVertical: 16,
        borderRadius: 18,
        alignItems: "center",
        justifyContent: "center",
    },
    actionSecondary: {
        backgroundColor: "#F3F4F6",
        borderWidth: 1,
        borderColor: "#E5E7EB",
        marginRight: 14,
    },
    actionSecondaryText: {
        fontWeight: "800",
        color: "#111827",
        fontSize: 16,
    },
    actionPrimary: {
        backgroundColor: "#1677FF",
    },
    actionPrimaryText: {
        fontWeight: "800",
        color: "#FFFFFF",
        fontSize: 16,
    },

    fab: {
        position: "absolute",
        right: 24,
        bottom: 24,
        width: 58,
        height: 58,
        borderRadius: 999,
        backgroundColor: "#111827",
        alignItems: "center",
        justifyContent: "center",
        ...Platform.select({
            ios: {
                shadowColor: "#000",
                shadowOpacity: 0.25,
                shadowRadius: 12,
                shadowOffset: { width: 0, height: 8 },
            },
            android: { elevation: 10 },
            default: {},
        }),
    },
    fabText: {
        color: "#FFFFFF",
        fontSize: 30,
        fontWeight: "900",
        marginTop: -2,
    },
});