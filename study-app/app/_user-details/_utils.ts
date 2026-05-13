
export type User = {
    id: string,
    created_at: string,
    university: string,
    first_name: string,
    last_name: string,
    major: string[],
    email: string,
    classes?: string[],
    bio?: string,
    match_score?: number, // This is optional and will be added by the backend when fetching matches
}

export type FriendRequest = {
    id: string, // id of the friend request
    sender_id: string,
    receiver_id: string,
    status: "pending" | "accepted" | "rejected",
    profiles: {
        first_name: string;
        last_name: string;
        university: string;
        major: string[];
    } | null;
};

export type Friend = {
    id: string;
    first_name: string;
    last_name: string;
    university: string;
    major: string[];
}