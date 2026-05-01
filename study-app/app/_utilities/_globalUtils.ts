import { supabase } from "@/lib/supabase";

//An async function that takes a user id and session id string as parameters and then tries to add them to the 
//commitments table in the database. If insert is successful, returns true, else returns false
export async function JoinSession(joinerId:string, sessionId:string): Promise<boolean> {
    const { error:insertError } = await supabase.from('commitments').insert({
        user_id: joinerId,
        session_id: sessionId
    });
    
    if(insertError){
        alert('Error joining study session.');
        return false;
    }
    else{
        return true;
    }
}

//An async function that takes a commitment id as a parameter and then deletes the corresponding commitment from the database.
//Returns true if deletion is successful, else returns false.
export async function LeaveSession(commitmentId:string): Promise<boolean> {
    const {error:deleteError} = await supabase.from('commitments').delete().eq('id',commitmentId);

    if(deleteError){
        alert('Error deleting session commitment.');
        return false;
    }
    else{
        return true;
    }
}