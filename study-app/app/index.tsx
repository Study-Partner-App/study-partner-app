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
        // If there is no user, then the login flag remains false, and the user will be asked to login.
        if (user === null) {
            setLoginFlag(false);
        } else {
            setLoginFlag(true);
        }});

    //A quick function to handle behavior for pressing login.
    const handleLogin = () => {
        //Remember, the navigation works in a stack. Push to go to a new page, pop to go back.
        router.push('/(auth)/login');
    };

    //This function will handle behaviour for pressing the profile button if a user is signed in. 
    // For now, it will just be a placeholder.
    const handleProfile = () => {
        //router.push('');
    };

    //A function for handling the sign out behaviour.
    const handleSignOut = async () => {
        await supabase.auth.signOut();

        //Now, reset the navigation to restart the auth.
        router.dismissTo('/')
    };

    const handleStudyNav = () => {
        router.navigate('./(tabs)/study-sessions/');
    }

    // Determine whether the user is signed in, and display the appropriate button.
    // If the login flag is true, display the profile button, otherwise, display the login button.
    const buttonTitle = loginFlag ? "Sign Out" : "Log In";
    const buttonAction = loginFlag ? handleSignOut : handleLogin;

    return (
        <View style={styles.page}>
            <Text style={styles.title}>Landing Page</Text>
            <View style={styles.buttonContainer}>
                <Button title={buttonTitle} onPress={buttonAction} />
            </View>
            <View style={styles.buttonContainer}>
                <Button title='Study Sessions' onPress={handleStudyNav}/>
            </View>
        </View>
    );
}