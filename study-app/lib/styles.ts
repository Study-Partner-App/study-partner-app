import { Button } from "@react-navigation/elements";
import { StyleSheet, Platform } from "react-native";

const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: "#F4F5F7" },

    page: {
        flex: 1,
        paddingHorizontal: 24,
        paddingTop: 16,
        backgroundColor: "#F4F5F7",
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

    inputContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        width: '50%',
        height: '30%',
    },

    input: {
        paddingHorizontal: 20,
        paddingVertical: 10,
        height: 20,
        width: '100%',
        borderColor: 'gray',
        borderWidth: 1,
        marginBottom: 10,
        backgroundColor: '#ffffff',
        color: '#0000004b',
    },

    buttonContainer: {
        flex: 1, // Ensures the main container takes all available space
        justifyContent: 'center',
        paddingHorizontal: 20, // Add some padding so the button isn't edge-to-edge
        paddingVertical: 10, // Add vertical padding for spacing between buttons
        width: '20%', // Make the container take the only 20% the width of its parent
    },

    buttonWrapper: {
        width: '100%', // Makes the wrapper take the full width of its parent (container padding considered)
        // You can also add margin or other styles here
    },

});

export { styles };