import React, { useState } from 'react';
import { View, TextInput, Button, Text, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from "@/lib/supabase";
import { styles } from "@/app/_styles/globalStyles";
import { LinearGradient } from "expo-linear-gradient";
import { theme } from '@/lib/theme';

const SignUpPage = () => {
    const router = useRouter();

    //These following is a list of states to hold the user's sign up info.
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [university, setUniversity] = useState('');
    const [major, setMajor] = useState('');

    const [firstName, setFirstName] = useState('');             // Will be optional
    const [lastName, setLastName] = useState('');               // Will be optional

    //This is just an array that contains all of the required fields for later checks.
    let reqFields: string[] = ['email', 'pass', 'confirm', 'uni', 'major'];

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
    const handleUniversity = (text: string) => {
        setUniversity(text);
    }
    const handleMajor = (text: string) => {
        setMajor(text);
    }
    const handleFirstName = (text: string) => {
        setFirstName(text);
    }
    const handleLastName = (text: string) => {
        setLastName(text);
    }
    
    //This will handle submitting the user's sign up information to supabase.
    const handleSubmit = async () => {

        // Save all of the information the user has provided into a map, mapping the fields to the values
        let fieldMap = new Map<string, string>([
            ['email', email],               //0
            ['pass', password],             //1
            ['confirm', confirmPassword],   //2
            ['uni', university],            //3
            ['major', major],               //4
            ['first', firstName],           //5
            ['last', lastName]              //6
        ]) // These values will be read out from the map in this order.

        // This is the logic that handles required fields and checking presence of values
        for(const [key, value] of fieldMap){
            //Check requirement
            if(reqFields.includes(key)){
                //Now check that the required field contains a value
                if(value.trim() === ''){
                    alert('Required field is missing!')
                    return; // Because we don't want to make a user and profile until all necessary info is provided.
                } 
                // Otherwise, the field contained a value, and we can just move on.
            }
        }

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
            university: university,
            major: major,
            first_name: firstName, // These values are just left blank if the user chooses not to fill them in
            last_name: lastName    // meaning that the database will just hold an empty string as their first and last names.
        });

        if (profileError) {
            alert(profileError.message);
            return;
        }

        //Now that the user has been created and added to the database, head to the login page.
        router.push('/(auth)/login');
    };

    return (
        <LinearGradient
            colors={theme.gradients.background}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{ flex: 1 }}
        >

        <View style={styles.container}>
            <Text style={styles.hs_title}>Create Account</Text>
            <TextInput 
                style={styles.input}
                placeholder="Email"
                placeholderTextColor={theme.palette.subtext}
                value={email}
                onChangeText={handleEmail}
            />
            <TextInput
                style={styles.input}
                placeholder="Password"
                placeholderTextColor={theme.palette.subtext}
                value={password}
                onChangeText={handlePassword}
                secureTextEntry
            />
            <TextInput
                style={styles.input}
                placeholder="Confirm Password"
                placeholderTextColor={theme.palette.subtext}
                value={confirmPassword}
                onChangeText={handleConfirmPassword}
                secureTextEntry
            />
            <TextInput
                style={styles.input}
                placeholder="University"
                placeholderTextColor={theme.palette.subtext}
                value={university}
                onChangeText={handleUniversity}
            />
            <TextInput
                style={styles.input}
                placeholder="Major"
                placeholderTextColor={theme.palette.subtext}
                value={major}
                onChangeText={handleMajor}
            />
            <TextInput
                style={styles.input}
                placeholder="(Optional) First Name"
                placeholderTextColor={theme.palette.subtext}
                value={firstName}
                onChangeText={handleFirstName}
            />
            <TextInput
                style={styles.input}
                placeholder="(Optional) Last Name"
                placeholderTextColor={theme.palette.subtext}
                value={lastName}
                onChangeText={handleLastName}
            />

            <View style={{ marginTop: 10 }}>
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
            
        </View>
        </LinearGradient>
    )   
};

export default SignUpPage;
