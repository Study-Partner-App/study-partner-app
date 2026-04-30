import { Text, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { getCreatorUsername, StudySession } from "../_utilities/globalUtils";
import { styles } from "@/app/_styles/globalStyles";
import { useEffect, useState } from "react";

export default function SessionCard({ session }: { session: StudySession }) {
    const router = useRouter();
    if(!session) {
        return null;
    }

    let sessionId : string = session.id;
    
    //console.log("SessionCard received sessionId:", sessionId);

    const [creatorName, setCreatorName] = useState("");

    useEffect(() => {
        const fetchCreatorName = async () => {
            const name = await getCreatorUsername(session);
            setCreatorName(name || "Unknown Creator");
        };
        fetchCreatorName();
    }, [session]);  

    return (
        <TouchableOpacity
            style={styles.card}
            onPress={() => 
                router.push({
                    pathname: "/study-sessions/session_details",
                    params: { sessionId: sessionId }
                })
            }   
        >
            <Text style={styles.session_card_title}>{session.title}</Text>
            <Text style={styles.username}>Created by: {creatorName}</Text>
            <Text style={styles.subject}>{session.subject}</Text>
            <Text style={styles.datetime}>{session.date}</Text>
            <Text style={styles.datetime}>{session.start_time} - {session.end_time}</Text>

        </TouchableOpacity>
    )
}