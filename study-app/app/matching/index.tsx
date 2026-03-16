import React, { useEffect, useState, useRef } from "react";
import { View, ActivityIndicator } from "react-native";
import { supabase } from "../../lib/supabase";
import MatchingScreen from "./_MatchingScreen";
import { User } from "./_utils";
import { LinearGradient } from "expo-linear-gradient";
import { theme } from "../../lib/theme";

const PAGE_SIZE = 10;

export default function MatchingIndex() {
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [matches, setMatches] = useState<User[]>([]);
    const [fetchLoading, setFetchingLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [page, setPage] = useState(0);
    // Prevent Simultaneous Fetches
    const fetchingRef = useRef(false);

    useEffect(() => {
        const loadUser = async () => {
            const { data: {user} } = await supabase.auth.getUser();
            if(user) {
                const { data } = await supabase.from("profiles").select("*").eq("id", user.id).single();
                setCurrentUser(data);
            }
            setLoading(false);
        }
        loadUser();
    }, []);

    const fetchMatches = async () => {
        if(!currentUser?.id || fetchLoading || !hasMore || fetchingRef.current) return;
        
        fetchingRef.current = true;
        setFetchingLoading(true);
        const { data, error } = await supabase.rpc("get_ranked_matches", {
            current_user_id: currentUser.id,
            page_offset: page * PAGE_SIZE,
            page_limit: PAGE_SIZE,
        });

        if(!error && data) {
            setMatches(prev => [...prev, ...data]);
            setPage(prev => prev + 1);
            if(data.length < PAGE_SIZE) {
                setHasMore(false);
            }
        }
        setFetchingLoading(false);
    }

    useEffect(() => {
        fetchMatches();
    }, [currentUser?.id]);

    if(loading || !currentUser) {
        return (
            <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                <ActivityIndicator />
            </View>
        )
    }

    return (
        <LinearGradient
                    colors={theme.gradients.background}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={{ flex: 1 }}
                >
        <MatchingScreen currentUser={currentUser} matches={matches} loading={fetchLoading} fetchMatchesFn={fetchMatches} />
        </LinearGradient>
    );
}