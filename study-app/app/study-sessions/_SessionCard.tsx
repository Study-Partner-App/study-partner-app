import { Text, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { StudySession } from "./_utils";
import { styles } from "@/app/_styles/globalStyles";4

export default function SessionCard({ session }: { session: StudySession }) {
    const router = useRouter();
    if(!session) {
        return null;
    }

    return (
        <TouchableOpacity
            style={styles.card}
            onPress={() => 
                router.push({
                    pathname: "/study-sessions/session_details",
                    params: { sessionId: session.id }
                })
            }   
        >
            <Text style={styles.subject}>{session.subject}</Text>
            <Text style={styles.datetime}>{session.date.getDate()}</Text>
            <Text style={styles.datetime}>{session.start_time} - {session.end_time}</Text>

        </TouchableOpacity>
    )
}