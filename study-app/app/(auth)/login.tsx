import React, { useState } from 'react';
import { View, TextInput, Button, Text, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from "@/lib/supabase";
import { styles } from "@/app/_styles/globalStyles";
import { LinearGradient } from "expo-linear-gradient";
import { theme } from '@/lib/theme';

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
        <LinearGradient
            colors={theme.gradients.background}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{ flex: 1 }}
        >
        <View style={styles.container}>

            <View style={styles.loginTitleSpacing}>
                <Text style={styles.loginTitle}>Welcome!</Text>
            </View>

            <Text style={{fontSize: 16, fontWeight: 'bold', marginBottom: 8}}>Email:</Text>
            <TextInput 
                style={styles.input}
                placeholder="Email"
                placeholderTextColor={theme.palette.subtext}
                value={email}
                onChangeText={handleEmail}
            />
            <Text style={{fontSize: 16, fontWeight: 'bold', marginBottom: 8}}>Password:</Text>
            <TextInput
                style={styles.input}
                placeholder="Password"
                placeholderTextColor={theme.palette.subtext}
                value={password}
                onChangeText={handlePassword}
                secureTextEntry
            />

            <View style={{ marginTop: 20 }}>
                <Pressable onPress={handleSubmit}>
                    <LinearGradient
                        colors={theme.gradients.loginButton}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.loginButton}
                    >    
                        <Text style={styles.loginButtonText}>Submit</Text>
                    </LinearGradient>
                </Pressable>
            </View>

            <View style={{ marginTop: 10 }}>
                <Pressable onPress={handleCreateAccount}>
                    <LinearGradient
                        colors={theme.gradients.loginButton}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.loginButton}
                    >    
                        <Text style={styles.loginButtonText}>Create Account</Text>
                    </LinearGradient>
                </Pressable>
            </View>
        </View>
        </LinearGradient>
    )   
};

export default LoginPage;
