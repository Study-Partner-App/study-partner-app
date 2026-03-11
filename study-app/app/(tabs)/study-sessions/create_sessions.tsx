import { View, Text, Button } from 'react-native';
import { styles } from '@/lib/styles';
import { useRouter } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { useState } from 'react';

interface StudySession {
    // Required fields
    // TODO: For the time values, I would like to implement some sort of drop down menu or time selector in the future, but for now, these will just be text inputs with formatting requirements.
    startTime: string; // Format as HH:MM
    endTime: string; // Format as HH:MM
    date: string; // Format as YYYY-MM-DD

    subject: string;
    location: string;
    
    // Optional fields
    description?: string;
    course?: string;

    // TODO: For these two fields, I will need to add some different logic than is used for the other fields, since these values will not be stored as simple strings,
    // but for now I will just have them as strings until I finish the basic logic for the rest of the fields.
    announced?: string;
    maxParticipants?: string;
}

const CreateSessionsPage = () => {
    const router = useRouter();

    const [sessionInfo, setSessionInfo] = useState<StudySession>({
        startTime: '',
        endTime: '',
        subject: '',
        location: '',
        date: ''});

    // In this function, the field parameter ensures that only valid fields of the StudySession properties can be updated, and the value parameter is just the new value to set.
    const handleChange = (field: keyof StudySession, value: string) => {
        setSessionInfo(prev => ({ ...prev, [field]: value })); // This line ensures all data currently in sessionInfo is preserved,
                                                               // and only the field that is being updated is changed to the new value.
    }



    // Check formatting for the all fields to ensure the correct format is being used for each field. This will be called in the handleSubmit function before submitting to supabase.
    const checkFormatting = (field: keyof StudySession, value: string): boolean => {
        // Check time format for start and end time (HH:MM)
        if (field === 'startTime' || field === 'endTime') {
            const timeRegex = /^([0-1]\d|2[0-3]):([0-5]\d)$/; // Regular expression to match HH:MM format
            return timeRegex.test(value);
        }

        // Check date format (YYYY-MM-DD)
        if (field === 'date') {
            const dateRegex = /^\d{4}-\d{2}-\d{2}$/; // Regular expression to match YYYY-MM-DD format
            return dateRegex.test(value);
        }

        return true; // Default in the event that there are no specific formatting requirements for the field.
    }

    // Verify that all requred fields are present and of the appropiate format, then submit the session info to supabase.
    const handleSubmit = async () => {
        // Check for presence of required fields
        if (!sessionInfo.startTime || !sessionInfo.endTime || !sessionInfo.date || !sessionInfo.subject || !sessionInfo.location) {
            alert('Please fill in all required fields.');
            return;
        }

        // Check formatting of fields
        for (const field in sessionInfo) {
            // The checkFormatting function will return false if the formatting is incorrect for the field, and in that case, we will alert the user and stop the submission process.
            if (!checkFormatting(field as keyof StudySession, sessionInfo[field as keyof StudySession] || '')) {
                alert(`Please check the formatting of the ${field} field.`);
                return;
            }
        }

        // TODO: If all required fields are present and the formatting is correct, we can submit the session info to supabase, as long as the user is signed in.
        
    }

    return (
        <View style={styles.page}>
            <Text style={styles.title}>Create Study Session</Text>
        </View>
    );
};

export default CreateSessionsPage;