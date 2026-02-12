import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from "@/lib/supabase";

const LoginPage = () => {
    const router = useRouter();

    //These following is a list of states to hold the user's login info.
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

        //Now that the user is signed in, send them back to the landing page.
        router.push('./app/index');
    };

    const handleCreateAccount = () => {
        router.push('/signup')
    }

    return (
        <View style={styles.container}>
            <TextInput 
                style={styles.input}
                placeholder="Email"
                placeholderTextColor={'#000000'}
                value={email}
                onChangeText={handleEmail}
            />
            <TextInput
                style={styles.input}
                placeholder="Password"
                placeholderTextColor={'#000000'}
                value={password}
                onChangeText={handlePassword}
                secureTextEntry
            />
            <Button title="Submit" onPress={handleSubmit} />
            <Button title="Create Account" onPress={handleCreateAccount} />
        </View>
    )   
};

//Some temporary styles, just to make things work for now.
const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#000000',
    },
    text: {
        color: '#ffffff',
    },
    input: {
        height: 40,
        width: '60%',
        borderColor: 'gray',
        borderWidth: 1,
        marginBottom: 10,
        paddingHorizontal: 10,
        backgroundColor: '#ffffff',
    }
});

export default LoginPage;
