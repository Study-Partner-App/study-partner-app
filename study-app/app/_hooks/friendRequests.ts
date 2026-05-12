import { useEffect, useRef, useState } from "react"
import { supabase } from "../../lib/supabase";
import { FriendRequest } from '@/app/_user-details/_utils';


export function useFriendRequests() {
    /**
     * Custom hook to manage friend requests, including fetching, accepting, and rejecting requests.
     * It also sets up a real-time subscription to listen for changes in friend requests.
     */

    // State to hold incoming friend requests
    const [requests, setRequests] = useState<FriendRequest[]>([]);
    // Pagination states
    const [loading, setLoading] = useState(true);
    // Prevent Overalapping Fetches
    const fetchingRef = useRef(false); 
    // Check if mounted to avoid state updates on unmounted component
    const isMountedRef = useRef(true);

    useEffect(() => {
        return () => {
            isMountedRef.current = false;
        }
    }, []);

    // Keep track of all friend requests
    const fetchRequests = async () => {
        if(fetchingRef.current) return;
        fetchingRef.current = true;
        
        // Fetch friend requests where the current user is the receiver and the status is pending
        // Also join with the profiles table to get sender's details for display
        try{
            const { data: {user} } = await supabase.auth.getUser();
            if(!user) return;

            const { data, error } = await supabase
                .from("friend_requests")
                .select(`
                    id,
                    sender_id,
                    receiver_id,
                    status,
                    profiles!friend_requests_sender_id_fkey(
                        first_name,
                        last_name,
                        university,
                        major
                    )
                    `
                )
                .or(`receiver_id.eq.${user.id},sender_id.eq.${user.id}`)

            if(!error) {
                const formattedData = (data ?? []).map((item: any) => ({
                    ...item,
                    profiles: Array.isArray(item.profiles)
                        ? item.profiles[0] ?? null
                        : item.profiles
                }));
                if(isMountedRef.current) {
                    setRequests(formattedData);
                }
                
            } else {
                console.error("Error fetching friend requests: ", error);
            }
        } catch (error) {
            console.error("Error fetching friend requests: ", error);
        } finally {
            if (isMountedRef.current) {
                setLoading(false);
            }
            fetchingRef.current = false;
        }
    };

    const acceptRequest = async (requestId: string) => {
        // Obtain request info
        const { data: request, error: requestError } = await supabase
            .from("friend_requests")
            .select("sender_id, receiver_id")
            .eq("id", requestId)
            .single();
        
        if(requestError || !request) return;
        // Insert accepted friend into user's friends table
        const { error: insertError } = await supabase
            .from("friends")
            .insert([
                { user_id: request.sender_id, friend_id: request.receiver_id },
                { user_id: request.receiver_id, friend_id: request.sender_id}
            ]);
        
        if(insertError) return;

        // Delete request from friend_requests table
        const { error: deleteError } = await supabase
            .from("friend_requests")
            .delete()
            .eq("id", requestId);
        
        if(!deleteError) fetchRequests();

    }

    const rejectRequest = async (requestId: string) => {
        const { error } = await supabase
            .from("friend_requests")
            .delete()
            .eq("id", requestId)

        if(!error) fetchRequests();
    }

    // Initial Fetch
    useEffect(() => {
        fetchRequests();
    }, []);

    useEffect(() => {
        let channel: any;
        const setUpRealtime = async () => {
            const { data: {user: authUser} } = await supabase.auth.getUser();
            if(!authUser) return;

            channel = supabase
                .channel("friend_requests_updates")
                .on(
                    "postgres_changes",
                    {
                        event: "*",
                        schema: "public",
                        table: "friend_requests",
                        filter: `receiver_id=eq.${authUser.id}`
                    },
                    () => {
                        fetchRequests();
                    }
                )
                .subscribe();
        };

        setUpRealtime();

        return () => {
            if(channel) {
                supabase.removeChannel(channel);
            }
        }

    }, []);

    return {
        requests,
        setRequests,
        loading,
        acceptRequest,
        rejectRequest
    };

}