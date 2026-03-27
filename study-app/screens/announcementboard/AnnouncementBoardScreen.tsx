import React, { useEffect, useMemo, useState } from "react";
import {theme} from "@/lib/theme";
import { LinearGradient } from "expo-linear-gradient";

import {
    SafeAreaView,
    View,
    Text,
    Pressable,
    StyleSheet,
    Platform,
    FlatList,
    Alert,
    ActivityIndicator,
} from "react-native";

import { supabase } from "../../lib/supabase";

type Filter = "All" | "Starts soon" | "Quiet" | "Academic" | "Social";

type Announcement = {
    id: string;
    title: string;
    startMinutesFromNow: number;
    timeLabel: string;
    location: string;
    distanceMiles?: number;
    tags: string[];
    category: "Academic" | "Social";
};

// ---------- DB row shape (matches your Supabase table) ----------
type StudySessionRow = {
    id: number;
    created_at: string;
    start_time: string | null;
    end_time: string | null;
    subject: string | null;
    course: string | null;
    location: string | null;
    date: string | null;
    max_people: number | null;
    is_announced: boolean | null;
    user_id: string | null;
    descriptions: string | null;
};

// ---------- helpers ----------
function computeMinutesFromNow(date: string | null, time: string | null): number {
    if (!date || !time) return 9999;
    // date = "2026-03-06", time = "17:00:00"
    const dt = new Date(`${date}T${time}`);
    const now = new Date();
    return Math.round((dt.getTime() - now.getTime()) / 60000);
}

function formatTimeLabel(start: string | null, end: string | null): string {
    if (!start && !end) return "Time TBD";
    const s = start ? start.slice(0, 5) : "??:??";
    const e = end ? end.slice(0, 5) : "??:??";
    return `${s} – ${e}`;
}

function mapRowToAnnouncement(row: StudySessionRow): Announcement {
    const minsFromNow = computeMinutesFromNow(row.date, row.start_time);

    return {
        id: String(row.id),
        title: row.course
            ? `${row.course}${row.subject ? " — " + row.subject : ""}`
            : row.subject ?? "Study session",
        startMinutesFromNow: minsFromNow,
        timeLabel: formatTimeLabel(row.start_time, row.end_time),
        location: row.location ?? "TBD",
        distanceMiles: undefined,
        tags: [],
        category: "Academic",
    };
}

// ---------- screen ----------
export default function AnnouncementBoardScreen() {
    const [activeFilter, setActiveFilter] = useState<Filter>("All");
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [loading, setLoading] = useState(true);

    const filters: Filter[] = ["All", "Starts soon", "Quiet", "Academic", "Social"];

    // ---- fetch from Supabase ----
    const loadAnnouncements = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from("study_sessions")
                .select("*")
                .eq("is_announced", true)
                .order("date", { ascending: true });

            if (error) throw error;

            const rows = (data ?? []) as StudySessionRow[];
            setAnnouncements(rows.map(mapRowToAnnouncement));

            console.log(`Loaded ${rows.length} announced sessions from Supabase`);
        } catch (e: any) {
            console.log("Supabase error:", e);
            Alert.alert("Supabase error", e?.message ?? "Failed to load sessions");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadAnnouncements();
    }, []);

    // ---- filtering ----
    const filteredAnnouncements = useMemo(() => {
        switch (activeFilter) {
            case "All":
                return announcements;
            case "Starts soon":
                return announcements.filter(
                    (a) => a.startMinutesFromNow >= 0 && a.startMinutesFromNow <= 45
                );
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

    // ---- actions ----
    const handleSkip = (id: string) => {
        setAnnouncements((prev) => prev.filter((a) => a.id !== id));
    };

    const handleJoin = (a: Announcement) => {
        Alert.alert("Joined!", `You joined: ${a.title}`);
    };

    // ---- render ----
    return (
        <LinearGradient
                    colors={theme.gradients.background}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={{ flex: 1 }}
                >
        <SafeAreaView style={styles.safe}>
            <View style={styles.page}>
                <Text style={styles.heading}>Today's Announcement Board</Text>

                {/* Filter chips */}
                <FlatList
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    data={filters}
                    keyExtractor={(item) => item}
                    contentContainerStyle={styles.chipRow}
                    style={{ flexGrow: 0 }}
                    renderItem={({ item }) => {
                        const active = item === activeFilter;
                        return (
                            <Pressable
                                key={item}
                                onPress={() => setActiveFilter(item)}
                                style={[styles.chip, active && styles.chipActive]}
                            >
                                <Text style={[styles.chipText, active && styles.chipTextActive]}>
                                    {item}
                                </Text>
                            </Pressable>
                        );
                    }}
                />

                {/* List */}
                {loading ? (
                    <ActivityIndicator size="large" style={{ marginTop: 40 }} />
                ) : (
                    <FlatList
                        data={filteredAnnouncements}
                        keyExtractor={(item) => item.id}
                        contentContainerStyle={{ paddingBottom: 100 }}
                        refreshing={loading}
                        onRefresh={loadAnnouncements}
                        renderItem={({ item }) => (
                            <View style={styles.card}>
                                <Text style={styles.cardTitle}>{item.title}</Text>
                                <Text style={styles.cardSub}>
                                    🕐 {item.timeLabel}  📍 {item.location}
                                </Text>
                                {item.startMinutesFromNow >= 0 &&
                                    item.startMinutesFromNow <= 60 && (
                                        <Text style={styles.cardSoon}>
                                            Starts in {item.startMinutesFromNow} min
                                        </Text>
                                    )}
                                <View style={styles.cardActions}>
                                    <Pressable
                                        onPress={() => handleSkip(item.id)}
                                        style={styles.btnSkip}
                                    >
                                        <Text style={styles.btnSkipText}>Skip</Text>
                                    </Pressable>
                                    <Pressable
                                        onPress={() => handleJoin(item)}
                                        style={styles.btnJoin}
                                    >
                                        <Text style={styles.btnJoinText}>Join</Text>
                                    </Pressable>
                                </View>
                            </View>
                        )}
                        ListEmptyComponent={
                            <View style={{ paddingTop: 40, alignItems: "center" }}>
                                <Text style={{ fontSize: 16, fontWeight: "700", color: "#111" }}>
                                    No announced sessions
                                </Text>
                                <Text style={{ marginTop: 8, color: "#6B7280" }}>
                                    Add rows in Supabase → study_sessions (is_announced = true),
                                    then pull to refresh.
                                </Text>
                            </View>
                        }
                        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
                    />
                )}
            </View>
        </SafeAreaView>
        </LinearGradient>
    );
}

// ---------- styles ----------
const styles = StyleSheet.create({
    safe: { flex: 1},
    page: { flex: 1, paddingHorizontal: 16, paddingTop: Platform.OS === "android" ? 40 : 16 },
    heading: { fontSize: 22, fontWeight: "800", color: "#111827", marginBottom: 12, textAlign: "center" },
    chipRow: { paddingVertical: 6, gap: 6, alignItems: "center"},
    chip: {
        paddingHorizontal: 14,
        paddingVertical: 7,
        borderRadius: 20,
        backgroundColor: "#E5E7EB",
        marginBottom: 12
    },
    chipActive: { backgroundColor: "#2563EB" },
    chipText: { fontSize: 13, fontWeight: "600", color: "#374151" },
    chipTextActive: { color: "#FFFFFF" },
    card: {
        backgroundColor: "#FFFFFF",
        borderRadius: 12,
        padding: 16,
        shadowColor: "#000",
        shadowOpacity: 0.06,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 2 },
        elevation: 4,
    },
    cardTitle: { fontSize: 16, fontWeight: "700", color: "#111827", marginBottom: 4 },
    cardSub: { fontSize: 13, color: "#6B7280", marginBottom: 6 },
    cardSoon: { fontSize: 12, fontWeight: "700", color: "#DC2626", marginBottom: 8 },
    cardActions: { flexDirection: "row", gap: 10, marginTop: 4 },
    btnSkip: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 8,
        backgroundColor: "#F3F4F6",
    },
    btnSkipText: { fontSize: 13, fontWeight: "600", color: "#6B7280" },
    btnJoin: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 8,
        backgroundColor: "#2563EB",
    },
    btnJoinText: { fontSize: 13, fontWeight: "600", color: "#FFFFFF" },
});