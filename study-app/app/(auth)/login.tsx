import React, { useState } from 'react';
import { View, TextInput, Button } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from "@/lib/supabase";
import { styles } from '@/lib/styles';

const LoginPage = () => {
    const router = useRouter();

    //The following is a list of states to hold the user's login info.
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    //Define functions for handling changes to the text inputs to update the state variables.
    const handleEmail = (text: string) => {
        setEmail(text);
    }
    const handlePassword = (text: string) => {
        setPassword(text);
    }
    
    //This will handle submitting the user's login information to supabase for verification.
    const handleSubmit = async () => {
        //Use the supabase.auth.signIn function to verify.
        const { data: { user }, error } = await supabase.auth.signInWithPassword({
            email: email,
            password: password,
        });

        // A corresponding user was not found in the database, or the login info was incorrect.
        if (error) {
            alert(error.message);
            return;
        }

        //Now that the user is signed in, send them back to the landing page by popping until we reach the landing page.
        router.dismissTo('/');
    };

    const handleCreateAccount = () => {
        router.push('/signup')
    }

    return (
        <View style={styles.page}>
            <TextInput 
                style={styles.input}
                placeholder="Email"
                placeholderTextColor={styles.input.color}
                value={email}
                onChangeText={handleEmail}
            />
            <TextInput
                style={styles.input}
                placeholder="Password"
                placeholderTextColor={styles.input.color}
                value={password}
                onChangeText={handlePassword}
                secureTextEntry
            />
            <View style={styles.buttonContainer}>
                <View style={styles.buttonWrapper}>
                    <Button title="Submit" onPress={handleSubmit} />
                </View>
                <View style={styles.buttonWrapper}>
                    <Button title="Create Account" onPress={handleCreateAccount} />
                </View>
            </View>
        </View>
    )   
};

export default LoginPage;
