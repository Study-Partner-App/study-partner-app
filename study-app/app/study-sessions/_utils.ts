export type StudySession = {
    id: string,
    creator_id: string,
    subject: string,
    location: string,
    date: Date,
    start_time: string,
    end_time: string,
    is_announced: boolean,
    created_at: Date,
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