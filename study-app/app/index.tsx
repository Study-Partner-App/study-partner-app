import { View, Text, Button } from 'react-native';
import { styles } from '../lib/styles';
import { useRouter } from 'expo-router';
import { supabase } from '../lib/supabase';
import { useState } from 'react';

export default function IndexPage() {
    const router = useRouter();

    const [loginFlag, setLoginFlag] = useState(false);


    //Check if the user is already signed in.  
    supabase.auth.getUser().then(({ data: { user } }) => {
        //Since TS evaluates null values as false, then if there is no session,
        // the session flag will remain false, meaning the user must sign in.
        if (user === null) {
            setLoginFlag(false);
        } else {
            setLoginFlag(true);
        }})

    //A quick function to handle behavior for pressing login.
    const handleLogin = () => {
        //Remember, the navigation works in a stack. Push to go to a new page, pop to go back.
        router.push('/(auth)/login');
    };

    //This function will handle behaviour for pressing the profile button if a user is signed in. 
    // For now, it will just be a placeholder.
    const handleProfile = () => {
        //router.push('');
    }

    // Determine whether the user is signed in, and display the appropriate button.
    // If the login flag is true, display the profile button, otherwise, display the login button.
    const buttonTitle = loginFlag ? "Profile" : "Log In";
    const buttonAction = loginFlag ? handleProfile : handleLogin;

    return (
        <View style={styles.container}>
            <Text style={styles.text}>Landing Page</Text>
            <Button title={buttonTitle} onPress={buttonAction} />
        </View>
    );
}