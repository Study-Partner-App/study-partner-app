import { Text, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { StudySession } from "./_utils";
import { styles } from "@/app/_styles/globalStyles";4
import {supabase } from "@/lib/supabase";

export default function SessionCard({ session, creatorName }: { session: StudySession; creatorName: string }) {
    const router = useRouter();
    if(!session) {
        return null;
    }

    /*
    // Query the database for the creator's username using the creator_id field in the session object.
    const creatorUsername = async () => {
        const { data, error } = await supabase.from('profiles').select('first_name, last_name').eq('id', session.creator_id).single();
        if (error) {
            console.error("Error fetching creator username:", error);
            return;
        }
        const fullName = data.first_name + " " + data.last_name;
        return fullName;
    }
    */

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
            <Text style={styles.title}>{session.title}</Text>
            <Text style={styles.username}>Created by: {creatorName}</Text>
            <Text style={styles.subject}>{session.subject}</Text>
            <Text style={styles.datetime}>{session.date.getDate()}</Text>
            <Text style={styles.datetime}>{session.start_time} - {session.end_time}</Text>

        </TouchableOpacity>
    )
}