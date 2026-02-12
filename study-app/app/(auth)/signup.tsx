import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from "@/lib/supabase";

const SignUpPage = () => {
    const router = useRouter();

    //These following is a list of states to hold the user's sign up info.
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [university, setUniversity] = useState('');
    const [major, setMajor] = useState('');

    //Define functions for handling changes to the text inputs to update the state variables.
    const handleEmail = (text: string) => {
        setEmail(text);
    }
    const handlePassword = (text: string) => {
        setPassword(text);
    }
    const handleConfirmPassword = (text: string) => {
        setConfirmPassword(text);
    }
    const handleFirstName = (text: string) => {
        setFirstName(text);
    }
    const handleLastName = (text: string) => {
        setLastName(text);
    }
    const handleUniversity = (text: string) => {
        setUniversity(text);
    }
    const handleMajor = (text: string) => {
        setMajor(text);
    }
    
    //This will handle submitting the user's sign up information to supabase.
    const handleSubmit = async () => {
        //Check that the password and confirm password match.
        if (password !== confirmPassword) {
            alert("Passwords do not match!");
            return;
        }
        //Use the supabase.auth.signUp function to put the user into the database, then add that user to the profiles table with the additional info.
        const { data: { user }, error } = await supabase.auth.signUp({
            email: email,
            password: password,
        });

        if (error) {
            alert(error.message);
            return;
        }

        const { error: profileError } = await supabase.from('profiles').insert({
            id: user?.id,
            email: email,
            first_name: firstName,
            last_name: lastName,
            university: university,
            major: major,
        });

        if (profileError) {
            alert(profileError.message);
            return;
        }

        //Now that the user has been created and added to the database, head to the login page.
        router.push('/(auth)/login');
    };

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
            <TextInput
                style={styles.input}
                placeholder="Confirm Password"
                placeholderTextColor={'#000000'}
                value={confirmPassword}
                onChangeText={handleConfirmPassword}
                secureTextEntry
            />
            <TextInput
                style={styles.input}
                placeholder="First Name"
                placeholderTextColor={'#000000'}
                value={firstName}
                onChangeText={handleFirstName}
            />
            <TextInput
                style={styles.input}
                placeholder="Last Name"
                placeholderTextColor={'#000000'}
                value={lastName}
                onChangeText={handleLastName}
            />
            <TextInput
                style={styles.input}
                placeholder="University"
                placeholderTextColor={'#000000'}
                value={university}
                onChangeText={handleUniversity}
            />
            <TextInput
                style={styles.input}
                placeholder="Major"
                placeholderTextColor={'#000000'}
                value={major}
                onChangeText={handleMajor}
            />
            <Button title="Submit" onPress={handleSubmit} />
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

export default SignUpPage;
