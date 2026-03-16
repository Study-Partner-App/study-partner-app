import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { User } from './_utils';

const PAGE_SIZE = 10;

export function matchUsers(currentUser: User) {
    const [matches, setMatches] = useState<User[]>([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    
    const fetchMatches = async () => {
        if(loading || !hasMore || !currentUser?.id) return;

        setLoading(true);

        const { data, error } = await supabase.rpc("get_ranked_matches", {
            current_user_id: currentUser.id,
            page_offset: page * PAGE_SIZE,
            page_limit: PAGE_SIZE,
        });

        if(!error && data) {
            console.log("Fetched Matches:", data);
            setMatches(prev => {
                console.log("Previous Data:", prev);
                const newMatches = [...prev, ...data];
                console.log("New Matches:", newMatches);
                console.log("Same Data?", prev.length === newMatches.length);
                return newMatches;
            });
            console.log("Outside setMatches, Matches state:", matches);
            setPage(prev => prev + 1);
            if(data.length < PAGE_SIZE) {
                setHasMore(false);
            }
        }
        setLoading(false);
    };

    useEffect(() => {
        if(currentUser?.id) {
            fetchMatches();
        }
    }, [currentUser?.id]);
    console.log("Matches in hook:", matches);
    return { matches, fetchMatches, loading };
}
