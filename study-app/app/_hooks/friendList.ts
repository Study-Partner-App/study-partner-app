import { useEffect, useState, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { Friend } from "@/app/_user-details/_utils";

export function useFriendList() {
    const [friends, setFriends] = useState<Friend[]>([]);
    const [loading, setLoading] = useState(true);
    const fetchingRef = useRef(false);

    const fetch = async () => {
        if (fetchingRef.current) return;
        fetchingRef.current = true;

        try{
            const { data: {user }} = await supabase.auth.getUser();
            if(!user) {
                return;
            }

            const  { data, error } = await supabase
                .rpc("get_friends", { current_user_id: user.id })
            console.log("Fetched friends: ", data, error);
            if(!error && data) {
                setFriends(data);
            }
        } catch(error) {
            console.error("Error fetching friends: ", error);
        } finally {
            setLoading(false);
            fetchingRef.current = false;
        }
    };

    useEffect(() => {
        fetch();
        let channel: any;

        const setupRealtime = async () => {
            const { data: {user }} = await supabase.auth.getUser();
            if(!user) return;

            // Subscribe to real-time updates
            channel = supabase
                .channel("friends-realtime")
                .on(
                    "postgres_changes",
                    {
                        event: "*",
                        schema: "public",
                        table: "friends",
                        filter: `user_id=eq.${user.id}`
                    },
                    () => {
                        fetch();
                    }
                )
                .subscribe();
        };

        setupRealtime();

        return () => {
            if(channel) {
                supabase.removeChannel(channel);
            }
        }
    }, []);

    return { friends, loading };
}