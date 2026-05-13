import React, { useCallback, useEffect, useMemo, useState } from "react";
import { theme } from "@/lib/theme";
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
    Modal,
    ScrollView,
    TextInput,
    KeyboardAvoidingView,
} from "react-native";

import { supabase } from "@/lib/supabase";
import { JoinSession } from "@/lib/sessionUtilities";

type Filter = "All" | "Starts soon" | "Quiet" | "Academic" | "Social";

type Announcement = {
    id: string;
    title: string;
    /** Raw start time string from DB (e.g. "19:37:00"). Recompute minutes on demand. */
    startTime: string | null;
    timeLabel: string;
    location: string;
    /** YYYY-MM-DD from study_sessions.date — used to allow joins only for today */
    sessionDate: string | null;
    distanceMiles?: number;
    tags: string[];
    category: "Academic" | "Social";
};

// ---------- DB row shape (Supabase study_sessions) ----------
type StudySessionRow = {
    id: number | string;
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
    creator_id?: string | null;
    descriptions: string | null;
    description?: string | null;
    title?: string | null;
    category?: string | null;
};

function getTodayLocalYMD(): string {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
}

function formatTodayReadable(ymd: string): string {
    const [y, mo, da] = ymd.split("-").map(Number);
    const d = new Date(y, mo - 1, da);
    return d.toLocaleDateString(undefined, {
        weekday: "long",
        month: "short",
        day: "numeric",
        year: "numeric",
    });
}

const TIME_RE = /^([0-1]\d|2[0-3]):([0-5]\d)$/;

/** Shows a message on web (Alert is easy to miss) and native. */
function notify(title: string, message?: string) {
    if (Platform.OS === "web" && typeof window !== "undefined") {
        window.alert(message ? `${title}\n\n${message}` : title);
    } else {
        Alert.alert(title, message ?? "");
    }
}

/** Accepts 24h "14:30" or 12h "12:00 AM" / "1:00 PM". Returns HH:MM for Postgres. */
function parseTimeTo24h(input: string): string | null {
    const s = input.trim().replace(/\s+/g, " ");
    if (TIME_RE.test(s)) return s;

    const m = s.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
    if (!m) return null;
    let h = parseInt(m[1], 10);
    const min = m[2];
    const ap = m[3].toUpperCase();
    if (h < 1 || h > 12) return null;
    const mi = parseInt(min, 10);
    if (Number.isNaN(mi) || mi > 59) return null;

    if (ap === "AM") {
        if (h === 12) h = 0;
    } else {
        if (h !== 12) h += 12;
    }
    return `${String(h).padStart(2, "0")}:${min}`;
}

/** Postgres time columns expect HH:MM:SS */
function toPgTime(hhmm: string): string {
    const t = hhmm.trim();
    if (t.length === 5) return `${t}:00`;
    if (t.length === 8 && t.includes(":")) return t;
    return `${t.slice(0, 5)}:00`;
}

const SUBJECTS = [
    "Artificial Intelligence",
    "Chemical Engineering",
    "Computer and Electrical Engineering",
    "Computer Science",
    "Computer Simulation and Gaming",
    "Cybersecurity",
    "Physics",
    "Mathematics",
    "Mechanical Engineering",
    "Petroleum Engineering",
];

// ---------- helpers ----------
/**
 * Computes minutes from now using today's LOCAL date + the raw time string from
 * the DB. Using the local date avoids UTC-date mismatches (Supabase stores dates
 * in UTC, which can be a different calendar day than the user's local time).
 */
function computeMinutesFromNow(_date: string | null, time: string | null): number {
    if (!time) return 9999;
    // Strip any timezone suffix (e.g. "19:37:00+00" → "19:37:00")
    const cleanTime = time.replace(/[+-]\d{2}(:\d{2})?$/, "").slice(0, 8);
    const paddedTime = cleanTime.length === 5 ? `${cleanTime}:00` : cleanTime;
    // Always use today's local date so the badge is accurate regardless of
    // how the date was stored in the DB (UTC vs local).
    const dt = new Date(`${getTodayLocalYMD()}T${paddedTime}`);
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
    const fallbackTitle = row.course
        ? `${row.course}${row.subject ? " — " + row.subject : ""}`
        : row.subject ?? "Study session";

    const dbCategory = row.category ?? "Academic";
    const category: "Academic" | "Social" =
        dbCategory === "Social" ? "Social" : "Academic";
    const tags = dbCategory === "Quiet" ? ["Quiet"] : [];

    return {
        id: String(row.id),
        title: row.title?.trim() ? row.title : fallbackTitle,
        startTime: row.start_time ?? null,
        timeLabel: formatTimeLabel(row.start_time, row.end_time),
        location: row.location ?? "TBD",
        sessionDate: row.date,
        distanceMiles: undefined,
        tags,
        category,
    };
}

// ---------- screen ----------
export default function AnnouncementBoardScreen() {
    const [activeFilter, setActiveFilter] = useState<Filter>("All");
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [loading, setLoading] = useState(true);

    const sessionDateYMD = useMemo(() => getTodayLocalYMD(), []);
    const sessionDateReadable = useMemo(
        () => formatTodayReadable(sessionDateYMD),
        [sessionDateYMD]
    );

    const [addOpen, setAddOpen] = useState(false);
    const [formTitle, setFormTitle] = useState("");
    const [formSubject, setFormSubject] = useState("");
    const [formCourse, setFormCourse] = useState("");
    const [formLocation, setFormLocation] = useState("");
    const [formDescription, setFormDescription] = useState("");
    const [formStart, setFormStart] = useState("");
    const [formEnd, setFormEnd] = useState("");
    const [formMaxPeople, setFormMaxPeople] = useState("");
    const [formCategory, setFormCategory] = useState<"Academic" | "Social" | "Quiet">("Academic");
    const [showSubjectPicker, setShowSubjectPicker] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);


    const filters: Filter[] = ["All", "Starts soon", "Quiet", "Academic", "Social"];

    const resetAddForm = useCallback(() => {
        setFormTitle("");
        setFormSubject("");
        setShowSubjectPicker(false);
        setFormCourse("");
        setFormLocation("");
        setFormDescription("");
        setFormStart("");
        setFormEnd("");
        setFormMaxPeople("");
        setFormCategory("Academic");
    }, []);

    const closeAdd = useCallback(() => {
        setAddOpen(false);
        setFormError(null);
        resetAddForm();
    }, [resetAddForm]);

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
            const mapped = rows.map(mapRowToAnnouncement);
            setAnnouncements(mapped);

            console.log(`Loaded ${rows.length} announced sessions from Supabase`);
        } catch (e: unknown) {
            const msg = e instanceof Error ? e.message : "Failed to load sessions";
            console.log("Supabase error:", e);
            notify("Supabase error", msg);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadAnnouncements();
    }, []);

    const handleAddSubmit = async () => {
        setFormError(null);

        if (!formTitle.trim() || !formSubject.trim() || !formLocation.trim()) {
            const msg = "Please fill title, subject, and location.";
            setFormError(msg);
            notify("Missing fields", msg);
            return;
        }
        if (!formStart.trim() || !formEnd.trim()) {
            const msg = "Enter start and end time (e.g. 14:30 or 2:30 PM).";
            setFormError(msg);
            notify("Missing times", msg);
            return;
        }

        const start24 = parseTimeTo24h(formStart.trim());
        const end24 = parseTimeTo24h(formEnd.trim());
        if (!start24 || !end24) {
            const msg = "Use 24-hour (14:30) or 12-hour with AM/PM (12:00 AM, 1:00 PM).";
            setFormError(msg);
            notify("Invalid time", msg);
            return;
        }

        const max = parseInt(formMaxPeople.trim(), 10);
        if (!formMaxPeople.trim() || Number.isNaN(max) || max < 1) {
            const msg = "Enter a positive number for max participants.";
            setFormError(msg);
            notify("Max people", msg);
            return;
        }

        setSubmitting(true);
        try {
            // Same flow as CreateSessionsPage: getUserIdentities + session user. creator_id must be the auth user
            // uuid that exists in profiles.id (not identity.id — use user_id on each identity if you only have identities).
            const { data: authData } = await supabase.auth.getUser();
            const user = authData?.user;
            const { data: identData } = await supabase.auth.getUserIdentities();

            const creatorId =
                user?.id ??
                identData?.identities?.[0]?.user_id ??
                identData?.identities?.[0]?.id;

            if (!creatorId) {
                const msg = "Log in to create a study session.";
                setFormError(msg);
                notify("Sign in required", msg);
                return;
            }

            // Payload shape aligned with CreateSessionsPage insert (study_sessions).
            const row = {
                creator_id: creatorId,
                title: formTitle.trim(),
                start_time: toPgTime(start24),
                end_time: toPgTime(end24),
                date: sessionDateYMD,
                subject: formSubject.trim(),
                location: formLocation.trim(),
                description: formDescription.trim() || null,
                course: formCourse.trim() || null,
                is_announced: true,
                max_people: max,
                category: formCategory,
            };

            const { data: inserted, error: insertErr } = await supabase
                .from("study_sessions")
                .insert(row)
                .select("id")
                .single();

            if (insertErr) {
                let display = insertErr.message;
                if (
                    display.includes("foreign key") ||
                    display.includes("user_id_fkey")
                ) {
                    display =
                        `creator_id must match a row in profiles.id (FK on creator_id).\n\nYour logged-in user id is:\n${creatorId}\n\nIn Supabase: Table Editor → profiles → insert a row whose id is EXACTLY that UUID (copy from Authentication → Users for this account). Until that row exists, every save will fail with the same error.`;
                }
                setFormError(display);
                notify("Could not save", display);
                return;
            }

            notify("Saved", "Your study session was added.");
            closeAdd();
            await loadAnnouncements();
        } finally {
            setSubmitting(false);
        }
    };

    // ---- filtering ----
    const filteredAnnouncements = useMemo(() => {
        switch (activeFilter) {
            case "All":
                return announcements;
            case "Starts soon":
                return announcements.filter((a) => {
                    const mins = computeMinutesFromNow(a.sessionDate, a.startTime);
                    return mins >= -30 && mins <= 60;
                });
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

    const confirmJoinSession = useCallback(async (a: Announcement) => {
        const {
            data: { user },
            error: userErr,
        } = await supabase.auth.getUser();
        if (userErr || !user) {
            Alert.alert("Sign in required", "Log in to join a study session.");
            return;
        }

        // Prevent double-joining
        const { count, error: countErr } = await supabase
            .from("commitments")
            .select("*", { count: "exact", head: true })
            .eq("session_id", a.id)
            .eq("user_id", user.id);

        if (countErr) {
            Alert.alert("Could not check signup", countErr.message);
            return;
        }
        if ((count ?? 0) > 0) {
            Alert.alert("Already joined", "You are already signed up for this session.");
            return;
        }

        const success = await JoinSession(user.id, a.id);
        if (!success) return;

        // Remove card from the board immediately
        setAnnouncements((prev) => prev.filter((s) => s.id !== a.id));
        notify("You're in!", `You've joined "${a.title}". See you there!`);
    }, []);

    const handleJoin = useCallback(
        (a: Announcement) => {
            if (Platform.OS === "web") {
                // Alert.alert button callbacks don't fire on web
                const confirmed = window.confirm(`Join "${a.title}"?`);
                if (confirmed) void confirmJoinSession(a);
            } else {
                Alert.alert(
                    "Join this session?",
                    `Add yourself to "${a.title}" for today?`,
                    [
                        { text: "Cancel", style: "cancel" },
                        { text: "Yes", onPress: () => void confirmJoinSession(a) },
                    ]
                );
            }
        },
        [confirmJoinSession]
    );

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
                    <View style={styles.stickyHeader}>
                        <Text style={styles.heading}>Today's Announcement Board</Text>

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
                                        <Text
                                            style={[styles.chipText, active && styles.chipTextActive]}
                                        >
                                            {item}
                                        </Text>
                                    </Pressable>
                                );
                            }}
                        />
                    </View>

                    {loading ? (
                        <ActivityIndicator size="large" style={{ marginTop: 40 }} />
                    ) : (
                        <FlatList
                            data={filteredAnnouncements}
                            keyExtractor={(item) => item.id}
                            contentContainerStyle={styles.listContent}
                            refreshing={loading}
                            onRefresh={loadAnnouncements}
                            renderItem={({ item }) => (
                                <View style={styles.card}>
                                    <Text style={styles.cardTitle}>{item.title}</Text>
                                    <Text style={styles.cardSub}>
                                        🕐 {item.timeLabel} 📍 {item.location}
                                    </Text>
                                    {(() => {
                                        const mins = computeMinutesFromNow(item.sessionDate, item.startTime);
                                        if (mins < -30 || mins > 60) return null;
                                        return (
                                            <View style={styles.cardSoonBadge}>
                                                <View style={styles.cardSoonDot} />
                                                <Text style={styles.cardSoon}>
                                                    {mins <= 0
                                                        ? "Started · in progress"
                                                        : `Starts in ${mins} min`}
                                                </Text>
                                            </View>
                                        );
                                    })()}
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
                                    <Text
                                        style={{ fontSize: 16, fontWeight: "700", color: "#111" }}
                                    >
                                        No announced sessions
                                    </Text>
                                    <Text style={{ marginTop: 8, color: "#6B7280" }}>
                                        Tap “Add study session” or add rows in Supabase, then pull
                                        to refresh.
                                    </Text>
                                </View>
                            }
                            ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
                        />
                    )}

                    <Pressable
                        style={styles.fab}
                        onPress={() => {
                            setFormError(null);
                            setAddOpen(true);
                        }}
                        accessibilityRole="button"
                        accessibilityLabel="Add study session"
                    >
                        <Text style={styles.fabText}>+</Text>
                    </Pressable>
                </View>
            </SafeAreaView>

            <Modal
                visible={addOpen}
                animationType="slide"
                transparent
                onRequestClose={closeAdd}
            >
                <KeyboardAvoidingView
                    style={styles.modalRoot}
                    behavior={Platform.OS === "ios" ? "padding" : undefined}
                    pointerEvents="box-none"
                >
                    <Pressable style={styles.modalBackdrop} onPress={closeAdd} />
                    <View style={styles.modalCard}>
                        <Text style={styles.modalTitle}>New study session</Text>
                        <View style={styles.todayBanner}>
                            <Text style={styles.todayBannerLabel}>Session date</Text>
                            <Text style={styles.todayBannerValue}>{sessionDateReadable}</Text>
                            <Text style={styles.todayBannerHint}>
                                Sessions created here are always scheduled for today.
                            </Text>
                        </View>

                        <ScrollView
                            style={styles.modalScroll}
                            keyboardShouldPersistTaps="handled"
                            showsVerticalScrollIndicator={false}
                        >
                            <Text style={styles.fieldLabel}>Title *</Text>
                            <TextInput
                                style={styles.input}
                                value={formTitle}
                                onChangeText={setFormTitle}
                                placeholder="e.g. Algorithms review"
                                placeholderTextColor="#9CA3AF"
                            />

                            <Text style={styles.fieldLabel}>Subject *</Text>
                            <Pressable
                                style={[styles.input, styles.dropdownTrigger]}
                                onPress={() => setShowSubjectPicker((v) => !v)}
                            >
                                <Text
                                    style={
                                        formSubject
                                            ? styles.dropdownValueText
                                            : styles.dropdownPlaceholderText
                                    }
                                >
                                    {formSubject || "e.g. Computer Science"}
                                </Text>
                                <Text style={styles.dropdownChevron}>
                                    {showSubjectPicker ? "▲" : "▼"}
                                </Text>
                            </Pressable>
                            {showSubjectPicker && (
                                <View style={styles.dropdownList}>
                                    {SUBJECTS.map((subject) => (
                                        <Pressable
                                            key={subject}
                                            style={[
                                                styles.dropdownItem,
                                                formSubject === subject &&
                                                styles.dropdownItemActive,
                                            ]}
                                            onPress={() => {
                                                setFormSubject(subject);
                                                setShowSubjectPicker(false);
                                            }}
                                        >
                                            <Text
                                                style={[
                                                    styles.dropdownItemText,
                                                    formSubject === subject &&
                                                    styles.dropdownItemTextActive,
                                                ]}
                                            >
                                                {subject}
                                            </Text>
                                        </Pressable>
                                    ))}
                                </View>
                            )}

                            <Text style={styles.fieldLabel}>Course</Text>
                            <TextInput
                                style={styles.input}
                                value={formCourse}
                                onChangeText={setFormCourse}
                                placeholder="e.g. CSI 3303"
                                placeholderTextColor="#9CA3AF"
                            />

                            <Text style={styles.fieldLabel}>Location *</Text>
                            <TextInput
                                style={styles.input}
                                value={formLocation}
                                onChangeText={setFormLocation}
                                placeholder="e.g. McFarlin Library"
                                placeholderTextColor="#9CA3AF"
                            />

                            <Text style={styles.fieldLabel}>Type</Text>
                            <View style={styles.categoryRow}>
                                {(["Academic", "Social", "Quiet"] as const).map((cat) => {
                                    const active = formCategory === cat;
                                    return (
                                        <Pressable
                                            key={cat}
                                            onPress={() => setFormCategory(cat)}
                                            style={[
                                                styles.categoryChip,
                                                active && styles.categoryChipActive,
                                            ]}
                                        >
                                            <Text
                                                style={[
                                                    styles.categoryChipText,
                                                    active && styles.categoryChipTextActive,
                                                ]}
                                            >
                                                {cat === "Academic"
                                                    ? "📚 Academic"
                                                    : cat === "Social"
                                                        ? "🤝 Social"
                                                        : "🔇 Quiet"}
                                            </Text>
                                        </Pressable>
                                    );
                                })}
                            </View>

                            <Text style={styles.fieldLabel}>Description</Text>
                            <TextInput
                                style={[styles.input, styles.inputMultiline]}
                                value={formDescription}
                                onChangeText={setFormDescription}
                                placeholder="Optional details"
                                placeholderTextColor="#9CA3AF"
                                multiline
                            />

                            <View style={styles.rowTwo}>
                                <View style={styles.rowTwoItem}>
                                    <Text style={styles.fieldLabel}>Start *</Text>
                                    <TextInput
                                        style={styles.input}
                                        value={formStart}
                                        onChangeText={setFormStart}
                                        placeholder="14:00 or 2:00 PM"
                                        placeholderTextColor="#9CA3AF"
                                        keyboardType="default"
                                    />
                                </View>
                                <View style={styles.rowTwoItem}>
                                    <Text style={styles.fieldLabel}>End *</Text>
                                    <TextInput
                                        style={styles.input}
                                        value={formEnd}
                                        onChangeText={setFormEnd}
                                        placeholder="15:30 or 3:30 PM"
                                        placeholderTextColor="#9CA3AF"
                                        keyboardType="default"
                                    />
                                </View>
                            </View>

                            <Text style={styles.fieldLabel}>Max people *</Text>
                            <TextInput
                                style={styles.input}
                                value={formMaxPeople}
                                onChangeText={setFormMaxPeople}
                                placeholder="4"
                                placeholderTextColor="#9CA3AF"
                                keyboardType="number-pad"
                            />
                        </ScrollView>

                        {formError ? (
                            <Text style={styles.modalErrorText}>{formError}</Text>
                        ) : null}

                        <View style={styles.modalActions}>
                            <Pressable
                                style={styles.modalBtnSecondary}
                                onPress={closeAdd}
                                disabled={submitting}
                            >
                                <Text style={styles.modalBtnSecondaryText}>Cancel</Text>
                            </Pressable>
                            <Pressable
                                style={[styles.modalBtnPrimary, submitting && styles.btnDisabled]}
                                onPress={() => void handleAddSubmit()}
                                disabled={submitting}
                            >
                                {submitting ? (
                                    <ActivityIndicator color="#fff" />
                                ) : (
                                    <Text style={styles.modalBtnPrimaryText}>Create session</Text>
                                )}
                            </Pressable>
                        </View>
                    </View>
                </KeyboardAvoidingView>
            </Modal>
        </LinearGradient>
    );
}

// ---------- styles ----------
const styles = StyleSheet.create({
    safe: { flex: 1 },
    page: { flex: 1, paddingHorizontal: 16, paddingTop: Platform.OS === "android" ? 40 : 16 },
    stickyHeader: {
        backgroundColor: "transparent",
        zIndex: 10,
        paddingBottom: 4,
    },
    heading: {
        fontSize: 22,
        fontWeight: "800",
        color: "#111827",
        marginBottom: 12,
        textAlign: "center",
    },
    chipRow: { paddingVertical: 6, gap: 6, alignItems: "center" },
    chip: {
        paddingHorizontal: 14,
        paddingVertical: 7,
        borderRadius: 20,
        backgroundColor: "#E5E7EB",
        marginBottom: 12,
    },
    chipActive: { backgroundColor: "#2563EB" },
    chipText: { fontSize: 13, fontWeight: "600", color: "#374151" },
    chipTextActive: { color: "#FFFFFF" },
    listContent: { paddingBottom: 90 },
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
    cardSoonBadge: {
        flexDirection: "row",
        alignItems: "center",
        alignSelf: "flex-start",
        backgroundColor: "#FEE2E2",
        borderRadius: 20,
        paddingHorizontal: 10,
        paddingVertical: 4,
        marginBottom: 8,
        gap: 6,
    },
    cardSoonDot: {
        width: 7,
        height: 7,
        borderRadius: 4,
        backgroundColor: "#DC2626",
    },
    cardSoon: { fontSize: 12, fontWeight: "700", color: "#DC2626" },
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
    fab: {
        position: "absolute",
        right: 40,
        bottom: 28,
        backgroundColor: "#1D4ED8",
        width: 72,
        height: 72,
        borderRadius: 36,
        alignItems: "center",
        justifyContent: "center",
        shadowColor: "#000",
        shadowOpacity: 0.25,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 4 },
        elevation: 6,
    },
    fabText: { color: "#FFFFFF", fontSize: 36, fontWeight: "300", lineHeight: 42 },
    modalRoot: { flex: 1, justifyContent: "flex-end" },
    modalBackdrop: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: "rgba(0,0,0,0.4)",
        zIndex: 0,
    },
    modalCard: {
        backgroundColor: "#FFFFFF",
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        paddingHorizontal: 20,
        paddingTop: 20,
        maxHeight: "88%",
        width: "100%",
        zIndex: 2,
        elevation: 24,
        ...(Platform.OS === "web"
            ? ({ boxShadow: "0 -4px 24px rgba(0,0,0,0.12)" } as Record<string, string>)
            : {}),
    },
    modalErrorText: {
        color: "#B91C1C",
        fontSize: 14,
        fontWeight: "600",
        marginBottom: 8,
        paddingHorizontal: 4,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: "800",
        color: "#111827",
        marginBottom: 12,
        textAlign: "center",
    },
    todayBanner: {
        backgroundColor: "#EFF6FF",
        borderRadius: 12,
        padding: 12,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: "#BFDBFE",
    },
    todayBannerLabel: { fontSize: 12, fontWeight: "600", color: "#1D4ED8" },
    todayBannerValue: { fontSize: 16, fontWeight: "700", color: "#111827", marginTop: 4 },
    todayBannerHint: { fontSize: 12, color: "#6B7280", marginTop: 6 },
    modalScroll: { maxHeight: 360 },
    fieldLabel: {
        fontSize: 13,
        fontWeight: "600",
        color: "#374151",
        marginBottom: 6,
        marginTop: 4,
    },
    input: {
        borderWidth: 1,
        borderColor: "#D1D5DB",
        borderRadius: 10,
        paddingHorizontal: 12,
        paddingVertical: Platform.OS === "ios" ? 12 : 8,
        fontSize: 16,
        color: "#111827",
        backgroundColor: "#F9FAFB",
    },
    inputMultiline: { minHeight: 72, textAlignVertical: "top" },
    categoryRow: {
        flexDirection: "row",
        gap: 8,
        marginBottom: 4,
    },
    categoryChip: {
        flex: 1,
        paddingVertical: 9,
        borderRadius: 10,
        borderWidth: 1.5,
        borderColor: "#D1D5DB",
        backgroundColor: "#F9FAFB",
        alignItems: "center",
    },
    categoryChipActive: {
        borderColor: "#2563EB",
        backgroundColor: "#EFF6FF",
    },
    categoryChipText: {
        fontSize: 13,
        fontWeight: "600",
        color: "#6B7280",
    },
    categoryChipTextActive: {
        color: "#1D4ED8",
    },
    rowTwo: { flexDirection: "row", gap: 12 },
    rowTwoItem: { flex: 1 },
    modalActions: {
        flexDirection: "row",
        gap: 12,
        paddingVertical: 16,
        borderTopWidth: 1,
        borderTopColor: "#E5E7EB",
    },
    modalBtnSecondary: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 10,
        backgroundColor: "#F3F4F6",
        alignItems: "center",
    },
    modalBtnSecondaryText: { fontSize: 16, fontWeight: "600", color: "#374151" },
    modalBtnPrimary: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 10,
        backgroundColor: "#2563EB",
        alignItems: "center",
        justifyContent: "center",
        ...(Platform.OS === "web" ? ({ cursor: "pointer" } as Record<string, string>) : {}),
    },
    modalBtnPrimaryText: { fontSize: 16, fontWeight: "700", color: "#FFFFFF" },
    btnDisabled: { opacity: 0.7 },
    dropdownTrigger: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    dropdownPlaceholderText: {
        fontSize: 16,
        color: "#9CA3AF",
        flex: 1,
    },
    dropdownValueText: {
        fontSize: 16,
        color: "#111827",
        flex: 1,
    },
    dropdownChevron: {
        fontSize: 12,
        color: "#6B7280",
        marginLeft: 8,
    },
    dropdownList: {
        borderWidth: 1,
        borderColor: "#D1D5DB",
        borderRadius: 10,
        backgroundColor: "#FFFFFF",
        marginTop: 4,
        marginBottom: 4,
        overflow: "hidden",
        shadowColor: "#000",
        shadowOpacity: 0.08,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 2 },
        elevation: 4,
    },
    dropdownItem: {
        paddingHorizontal: 14,
        paddingVertical: 11,
        borderBottomWidth: 1,
        borderBottomColor: "#F3F4F6",
    },
    dropdownItemActive: {
        backgroundColor: "#EFF6FF",
    },
    dropdownItemText: {
        fontSize: 15,
        color: "#374151",
    },
    dropdownItemTextActive: {
        color: "#1D4ED8",
        fontWeight: "600",
    },
});
