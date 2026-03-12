
export type User = {
    id: string,
    created_at: string,
    university: string,
    first_name: string,
    last_name: string,
    major: string,
    email: string,
    classes?: string[],
    bio?: string,
    match_score?: number, // This is optional and will be added by the backend when fetching matches
}

export type FriendRequest = {
    id: string,
    sender_id: string,
    profiles: {
        first_name: string;
        last_name: string;
        university: string;
        major: string;
    }[];
};
