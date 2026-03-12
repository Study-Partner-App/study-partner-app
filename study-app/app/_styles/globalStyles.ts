import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
    // Profile Card
    card: {
        padding: 16,
        borderRadius: 12,
        backgroundColor: "#fff",
        marginBottom: 16,
        marginTop: 16,
        marginHorizontal: 16,
        elevation: 2,
    },

    container: {
        flex: 1,
        padding: 20,
    },

    username: {
        fontSize: 18,
        fontWeight: "600",
    },

    university: {
        marginTop: 4,
        color: "#666",
    },

    bio: {
        marginTop: 8,
        color: "#444",
    },

    major: {
        marginTop: 8,
        color: "#444",
    },
    // When putting buttons in the same row as text.
    buttonInRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center"
    },
    
    addFriendButton: {
        backgroundColor: "#4CAF50",
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 6,
    }, 

    // HOME SCREEN STYLES
    hs_container: {
        padding: 20,
        gap: 20,
        flex: 1,
    },

    hs_card: {
        flex: 1,
        backgroundColor: "white",
        borderRadius: 16,
        padding: 20,
        marginBottom: 16,
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 3,
    },

    hs_topCard: {
        backgroundColor: "white",
        borderRadius: 12,
        padding: 20,
        marginBottom: 16,
        marginTop: 50,
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 3,
    },

    hs_title: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        marginBottom: 10,
        fontWeight: "600",
        fontSize: 18,
    },

    hs_matchName: {
        fontSize: 16,
        fontWeight: "600",
        color: "#30678f",
    },

    hs_matchMajor: {
        fontSize: 13,
        color: "#191970",
    },

    hs_number: {
        fontSize: 36,
        fontWeight: "bold",
        marginTop: 8,
    },

    hs_subtitle: {
        color: "gray",
        marginTop: 4,
    },

    hs_previewRow: {
        flexDirection: "row",
        marginTop: 10,
        gap: 10,
    },

    hs_previewCard: {
        width: 80,
        height: 80,
        borderRadius: 10,
        backgroundColor: "#f1f1f1",
        justifyContent: "center",
        alignItems: "center",
    },

    hs_fade: {
        opacity: 0.5,
    },

    hs_matchRow: {
        marginTop: 10
    },

})