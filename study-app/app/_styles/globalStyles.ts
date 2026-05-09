import { StyleSheet } from "react-native";
import { theme } from "@/lib/theme";

export const styles = StyleSheet.create({
    loginTitleSpacing: {
        flex: 0.4,
        justifyContent: "center",
        alignItems: "center",
        /*top padding*/
        paddingTop: 90,
    },

    loginTitle: {
        fontSize: 38,
    },
    
    // Friend Request List
    listCard: {
        backgroundColor: "#fff",
        padding: 16, 
        borderRadius: 12,
        marginBottom: 12,
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowRadius: 4,
        shadowOffset: {width: 0, height: 2},
        elevation: 3,
        marginHorizontal: 16,
        marginTop: 12,
    },

    listTitle: {
        fontSize: 18,
        fontWeight: "600",
        marginBottom: 4,
    },
    
    // Profile Card
    card: {
        padding: 16,
        borderRadius: 12,
        backgroundColor: "#fff",
        marginBottom: 2,
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

    buttonsSameRow: {
        flexDirection: "row",
        gap: 10,
    },
    
    addFriendButton: {
        backgroundColor: "#4CAF50",
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 6,
    }, 

    rejectFriendButton: {
        backgroundColor: "#f44336",
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
        elevation: 6,
    },

    hs_title: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        marginBottom: 10,
        fontWeight: "900",
        fontSize: 22,
    },

    hs_matchName: {
        fontSize: 16,
        fontWeight: "700",
        color: "#0b2b9d",
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

    //  LOGIN SCREEN STYLES
    loginButton: {
      paddingVertical: 14,
      borderRadius: 12,
      alignItems: "center",  
      marginBottom: 12,
    },

    loginButtonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "bold",
    },

    // GENERAL INPUT STYLES
    input: {
        borderWidth: 1,
        borderColor: theme.palette.border,
        borderRadius: 10,
        padding: 10,
        marginBottom: 12,
        backgroundColor: '#fff',
        color: theme.palette.text,
    },

    dropdownInput: {
        borderWidth: 1,
        borderColor: theme.palette.border,
        borderRadius: 10,
        padding: 10,
        marginBottom: 12,
        backgroundColor: '#fff',
        color: theme.palette.text,
    },

    dropdownPlaceholder: {
        color: theme.palette.subtext,
    },

    // STUDY SESSIONS STYLES
    session_container: {
        flex: 1,
        padding: 20,
        margin: 2,
    },

    session_title: {
        fontSize: 28,
        fontWeight: "800",
        color: theme.palette.text,
        marginBottom: 8,
    },

    session_subtitle: {
        fontSize: 22,
        fontWeight: "800",
        color: theme.palette.text,
        marginBottom: 20,
    },

    session_text: {
        fontSize: 16,
        color: theme.palette.text,
        marginBottom: 12,
    },

    session_card_title: {
        fontSize: 20,
        fontWeight: "700",
        color: theme.palette.text,
    },

    subject: {
        fontSize: 18,
        fontWeight: "600",
        color: theme.palette.text,
    },

    datetime: {
        fontSize: 16,
        color: theme.palette.subtext,
        marginTop: 4,
    },

    description: {
        fontSize: 12,
        color: theme.palette.text,
        marginBottom: 12,
    },

    content : {
        flex: 1,
        padding: 20,
    },

    footer : {
        backgroundColor: theme.palette.border,
    },

    button: {
        marginTop: 10,
        marginBottom: 10,
        backgroundColor: "#1D4ED8",
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: "center",
        shadowColor: "#000",
        shadowOpacity: 0.15,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 4 },
    },

    // FEATURE STYLES
    featureTitle: {
        fontSize: 24,
        fontWeight: "800",
        textAlign: "center",
        marginBottom: 24,
        color: "#111827",
    },

    featureGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "space-between",
    },

    featureCard: {
        height: 120,
        borderRadius: 16,
        backgroundColor: "#ffffff",
        justifyContent: "center",
        alignItems: "center",
        shadowColor: "#000",
        shadowOpacity: 0.08,
        shadowRadius: 6,
        shadowOffset: {width: 0, height: 3},
        elevation: 4,
    }, 

    featureIcon: {
        fontSize: 28,
        marginBottom: 6,
    },

    featureText: {
        fontSize: 16,
        fontWeight: "600",
        color: "#111827",
    },

})