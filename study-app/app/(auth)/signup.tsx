import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from "@/lib/supabase";
import { styles } from '@/lib/styles';

const SignUpPage = () => {
    const router = useRouter();

    //These following is a list of states to hold the user's sign up info.
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const [firstName, setFirstName] = useState('');             // Will be optional
    const [lastName, setLastName] = useState('');               // Will be optional

    const [university, setUniversity] = useState('');
    const [major, setMajor] = useState('');

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
            <TextInput
                style={styles.input}
                placeholder="(Optional) First Name"
                placeholderTextColor={'#000000'}
                value={firstName}
                onChangeText={handleFirstName}
            />
            <TextInput
                style={styles.input}
                placeholder="(Optional) Last Name"
                placeholderTextColor={'#000000'}
                value={lastName}
                onChangeText={handleLastName}
            />
            <Button title="Submit" onPress={handleSubmit} />
        </View>
    )   
};

export default SignUpPage;
