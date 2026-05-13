import { View, Text, Button, TextInput, Pressable, ActivityIndicator, ScrollView } from 'react-native';
import { Dropdown} from 'react-native-element-dropdown';
import { styles } from "@/app/_styles/globalStyles";
import { router, useLocalSearchParams, useRouter } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { useEffect, useState } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '@/lib/theme';
import { Checkbox } from 'expo-checkbox';
import { StudySession, getCoursesBySubject, getSubjects, getTimes } from '../_utilities/globalUtils';

// IStudySession is an interface to contain data received in string format from the input fields,
// while the StudySession type from _utils is the exact data type that we retrieve from Supabase.
interface IStudySession {
    // Required fields
    // TODO: For the time values, I would like to implement some sort of drop down menu or time selector in the future, but for now, these will just be text inputs with formatting requirements.
    title: string;
    startTime: string; // Format as HH:MM
    endTime: string; // Format as HH:MM
    date: string; // Format as YYYY-MM-DD

    subject: string;
    location: string;
    
    // Optional fields
    description?: string;
    course?: string;
}

export default function EditSessionPage() {
    const router = useRouter();

    const { sessionId } = useLocalSearchParams<{ sessionId: string }>();

    const [sessionInfo, setSessionInfo] = useState<IStudySession>({
        title: '',
        startTime: '',
        endTime: '',
        subject: '',
        location: '',
        date: ''
    });

    // The subjects that the user may choose from.
    const subjects = getSubjects().map(subject => ({ label: subject, value: subject })); // This will convert the array of subjects into an array of objects with label and value properties, which is the format that the dropdown component expects.

    // The courses the user may choose from. Will be narrowed by the subject chosen, so the courses array will be different based on the subject selected.
    const allCourses = getCoursesBySubject();

    const times = getTimes();

    const [announced, setAnnouncedState] = useState(false); // State to manage the checkbox input for the announced property.
    const [maxParticipants, setMaxParticipants] = useState<string>(''); // State to manage the input for the maxParticipants property.

    const [loading, setLoading] = useState(true); // True by default, as loading begins as soon as the page is rendered.
    const [session, setSession] = useState<StudySession | null>(null); // State to hold the session details that we retrieve from supabase, which we will then use to pre-populate the input fields with the current session details.

    // Fetch session details using sessionId
    const fetchSessionDetails = async () =>{
        const { data,error } = await supabase.from("study_sessions").select("*").eq("id", sessionId).single();
        if(error) {
            console.error("Error fetching session details:", error);
        }
        else if(data) {
            setSession(data);
            setLoading(false);
        }
    };

    useEffect(() => {
        if(sessionId) {
            fetchSessionDetails();
        }
    }, [sessionId]);

    // Now set all of the session details that we retrieved from supabase into the sessionInfo state, which will pre-populate the input fields with the current session details so that the user can see the current details and make changes to them.
    useEffect(() => {
        if(session) {
            setSessionInfo({
                title: session.title,
                startTime: session.start_time.slice(0, -3), // We slice off the seconds from the time string since our input fields are only in HH:MM format.
                endTime: session.end_time.slice(0, -3),
                date: session.date,
                subject: session.subject,
                location: session.location,
                description: session.description,
                course: session.course
            });
        }
    }, [session]);

    const getCoursesForSelectedSubject = (): { label: string; value: string }[] => {
        const coursesForSubject = allCourses[sessionInfo.subject as keyof typeof allCourses] || [];
        return coursesForSubject.map(course => ({ label: course, value: course }));
    };


    // Check formatting for the all fields to ensure the correct format is being used for each field. This will be called in the handleSubmit function before submitting to supabase.
    const checkFormatting = (field: keyof IStudySession, value: string): boolean => {
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

    // In this function, the field parameter ensures that only valid fields of the IStudySession properties can be updated, and the value parameter is just the new value to set.
    const handleChange = (field: keyof IStudySession, value: string) => {
        setSessionInfo(prev => ({ ...prev, [field]: value })); // This line ensures all data currently in sessionInfo is preserved,
                                                               // and only the field that is being updated is changed to the new value.
    }

    const handleSubmit = async () => {
        // Check for presence of required fields
        if (!sessionInfo.title || !sessionInfo.startTime || !sessionInfo.endTime || !sessionInfo.date || !sessionInfo.subject || !sessionInfo.location) {
            alert('Please fill in all required fields.');
            return;
        }

        // Check formatting of fields
        for (const field in sessionInfo) {
            // The checkFormatting function will return false if the formatting is incorrect for the field, and in that case, we will alert the user and stop the submission process.
            if (!checkFormatting(field as keyof IStudySession, sessionInfo[field as keyof IStudySession] || '')) {
                alert(`Please check the formatting of the ${field} field.`);
                return;
            }
        }

        // If all required fields are present and the formatting is correct, we can submit the session info to supabase, as long as the user is signed in.

        const {error: getUserError, data: user} = await supabase.auth.getUserIdentities(); // Get the user's id from the profiles table to associate with the study session.
        
        // This particular check should never actually be hit, since the option to create a study session should only be available to signed in users, 
        // but this is just an extra precaution while we are doing testing to ensure that only signed in users can create study sessions.
        if (getUserError) {
            alert('You must be signed in to create a study session.');
            return;
        }

        const { error: updateSessionError } = await supabase.from('study_sessions').update({
            title: sessionInfo.title,
            start_time: sessionInfo.startTime,
            end_time: sessionInfo.endTime,
            date: sessionInfo.date,
            subject: sessionInfo.subject,
            location: sessionInfo.location,
            description: sessionInfo.description,
            course: sessionInfo.course,
            is_announced: announced,
            max_people: maxParticipants ? parseInt(maxParticipants) : null, // Convert the maxParticipants value to a number before submitting to supabase. If the value is an empty string, submit null to supabase.
        }).eq('id', sessionId);

        if (updateSessionError) {
            alert('Error updating study session.');
            return;
        }

        //Finally, if no errors were detected, the update was successful, so just navigate back.
        router.back();
    }

    if(loading) {
        return (
            <LinearGradient
                colors={theme.gradients.background}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{ flex: 1 }}
            >
                <ActivityIndicator />
            </LinearGradient>
        )
    }

    return (
        <LinearGradient
            colors={theme.gradients.background}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{ flex: 1 }}
        >

            <ScrollView style={styles.container}>
                <Text style={styles.hs_title}>Create Study Session</Text>

                <View style={styles.input}>
                    <TextInput
                        style={styles.input}
                        placeholder="Title"
                        placeholderTextColor={theme.palette.subtext}
                        value={sessionInfo.title}
                        onChangeText={(value) => handleChange('title', value)}
                    />

                    <Dropdown
                        style={styles.dropdownInput}
                        placeholderStyle={styles.dropdownPlaceholder}
                        placeholder="Select Start Time"
                        data={times}
                        value={sessionInfo.startTime} 
                        labelField="label"
                        valueField="value"
                        onChange={function (item: any): void {
                            handleChange('startTime', item.value);
                        }}
                    />
                    <Dropdown
                        style={styles.dropdownInput}
                        placeholderStyle={styles.dropdownPlaceholder}
                        placeholder="Select End Time"
                        data={times}
                        value={sessionInfo.endTime} 
                        labelField="label"
                        valueField="value"
                        onChange={function (item: any): void {
                            handleChange('endTime', item.value);
                        }}
                    />
                    <TextInput
                        style={styles.input}
                        placeholder="Date (YYYY-MM-DD)"
                        placeholderTextColor={theme.palette.subtext}
                        value={sessionInfo.date}
                        onChangeText={(value) => handleChange('date', value)}
                    />

                    <Dropdown
                        style={styles.dropdownInput}
                        placeholderStyle={styles.dropdownPlaceholder}
                        placeholder="Select Subject"
                        data={subjects}
                        value={sessionInfo.subject} 
                        labelField="label"
                        valueField="value"
                        onChange={function (item: any): void {
                            handleChange('subject', item.value);
                        }}
                    />

                    <TextInput
                        style={styles.input}
                        placeholder="Location"
                        placeholderTextColor={theme.palette.subtext}
                        value={sessionInfo.location}
                        onChangeText={(value) => handleChange('location', value)}
                    />

                    <TextInput
                        style={styles.input}
                        placeholder="Description (Optional)"
                        placeholderTextColor={theme.palette.subtext}
                        value={sessionInfo.description}
                        onChangeText={(value) => handleChange('description', value)}
                    />
                    <Dropdown
                        style={styles.dropdownInput}
                        placeholderStyle={styles.dropdownPlaceholder}
                        placeholder="Select Course (Optional)"
                        data={getCoursesForSelectedSubject()}
                        value={sessionInfo.course}
                        labelField="label"
                        valueField="value"
                        onChange={function (item: any): void {
                            handleChange('course', item.value);
                        }}
                    />

                    <TextInput
                        style={styles.input}
                        placeholder="Max Participants (Optional)"
                        placeholderTextColor={theme.palette.subtext}
                        value={maxParticipants}
                        onChangeText={(value) => setMaxParticipants(value)}
                        keyboardType="numeric" // This will bring up the numeric keyboard on mobile devices to make it easier for the user to input a number.
                    />

                    <View style={styles.input}>
                        <Text>Announce Study Session</Text>
                        <Checkbox
                            value={announced}
                            onValueChange={(value) => {
                                setAnnouncedState(value);
                            }}
                        />
                    </View>
                    
                    <View style={styles.container}>
                        <Pressable 
                            style={styles.button}
                            onPress={handleSubmit}
                        >  
                            <Text style={styles.loginButtonText}>Submit</Text>
                        </Pressable>
                    </View>
                </View>
            </ScrollView>
        </LinearGradient>
    );
}