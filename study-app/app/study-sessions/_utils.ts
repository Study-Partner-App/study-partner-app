import { supabase } from "@/lib/supabase";

export type StudySession = {
    id: string,
    creator_id: string,
    title: string,
    subject: string,
    location: string,
    date: string,
    start_time: string,
    end_time: string,
    is_announced: boolean,
    created_at: string,
    max_people?: number,
    course?: string,
    description?: string,
}


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
}

/* 
// Utility function to fetch the creator's username based on the creator_id field in the session object.
export const getCreatorUsername = async (session: StudySession) => {
        const { data, error } = await supabase.from('profiles').select('first_name, last_name').eq('id', session.creator_id).single();
        if (error) {
            console.error("Error fetching creator username:", error);
            return;
        }
        const fullName = data.first_name + " " + data.last_name;
        return fullName;
    } 
*/