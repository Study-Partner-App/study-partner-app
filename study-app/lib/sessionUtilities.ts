import { supabase } from "@/lib/supabase";

/**
 * Joins a user to a study session by inserting a row into the commitments table.
 * Returns true on success, false on failure.
 */
export async function JoinSession(joinerId: string, sessionId: string): Promise<boolean> {
    const { error: insertError } = await supabase.from("commitments").insert({
        user_id: joinerId,
        session_id: sessionId,
    });

    if (insertError) {
        alert("Error joining study session.");
        return false;
    }
    return true;
}

/**
 * Removes a user's commitment to a study session by deleting the commitment row.
 * Returns true on success, false on failure.
 */
export async function LeaveSession(commitmentId: string): Promise<boolean> {
    const { error: deleteError } = await supabase
        .from("commitments")
        .delete()
        .eq("id", commitmentId);

    if (deleteError) {
        alert("Error deleting session commitment.");
        return false;
    }
    return true;
}
