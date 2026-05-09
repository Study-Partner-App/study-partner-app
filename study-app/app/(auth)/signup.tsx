import React, { useState } from 'react';
import { View, TextInput, Button, Text, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from "@/lib/supabase";
import { styles } from "@/app/_styles/globalStyles";
import { LinearGradient } from "expo-linear-gradient";
import { theme } from '@/lib/theme';
import { MultiSelect, Dropdown } from 'react-native-element-dropdown';

const SignUpPage = () => {
    const router = useRouter();

    //These following is a list of states to hold the user's sign up info.
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [university, setUniversity] = useState('');
    const [majorArray, setMajorArray] = useState<string[]>([]);
    const [year, setYear] = useState('');

    const [firstName, setFirstName] = useState('');             // Will be optional
    const [lastName, setLastName] = useState('');               // Will be optional

    //This is just an array that contains all of the required fields for later checks.
    let reqFields: string[] = ['email', 'pass', 'confirm', 'uni', 'major'];

    // A list of majors for the user to select from a dropdown menu. This is just a hardcoded list of popular majors,
    // but it could be expanded in the future if we wanted to add more options.
    const majors = [
        { label: "Computer Science", value: "Computer Science" },
        { label: "Math", value: "Math" },
        { label: "Biology", value: "Biology" },
        { label: "Chemistry", value: "Chemistry" },
        { label: "Physics", value: "Physics" },
        { label: "Economics", value: "Economics" },
        { label: "Psychology", value: "Psychology" },
        { label: "Sociology", value: "Sociology" },
        { label: "Political Science", value: "Political Science" },
        { label: "History", value: "History" },
    ];

    // A list of the years a user could be in, such as freshman, sophomore, etc.
    const years = [
        { label: "Freshman", value: "Freshman" },
        { label: "Sophomore", value: "Sophomore" },
        { label: "Junior", value: "Junior" },
        { label: "Senior", value: "Senior" },
        { label: "Graduate Student", value: "Graduate Student" },
    ];

    
    //This will handle submitting the user's sign up information to supabase.
    const handleSubmit = async () => {

        // Save all of the mandatory information the user has provided into a map, mapping the fields to the values
        let fieldMap = new Map<string, string>([
            ['email', email],               //0
            ['pass', password],             //1
            ['confirm', confirmPassword],   //2
            ['uni', university],            //3
            ['first', firstName],           //4
            ['last', lastName],             //5
            ['year', year]                  //6
        ]) // These values will be read out from the map in this order.

        // The major field is a little different since it's an array of strings, so we will just check that separately.
        if(reqFields.includes('major')){
            if(majorArray.length === 0){
                alert('Please select a major!');
                return;
            }
        }

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
            year: year,
            major: majorArray,
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
            <View style={styles.loginTitleSpacing}>
                <Text style={styles.loginTitle}>Create Account</Text>
            </View>
            <TextInput 
                style={styles.input}
                placeholder="Email"
                placeholderTextColor={theme.palette.subtext}
                value={email}
                onChangeText={setEmail}
            />
            <TextInput
                style={styles.input}
                placeholder="Password"
                placeholderTextColor={theme.palette.subtext}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
            />
            <TextInput
                style={styles.input}
                placeholder="Confirm Password"
                placeholderTextColor={theme.palette.subtext}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
            />
            <TextInput
                style={styles.input}
                placeholder="University"
                placeholderTextColor={theme.palette.subtext}
                value={university}
                onChangeText={setUniversity}
            />

            <Dropdown
                style={styles.dropdownInput}
                placeholderStyle={styles.dropdownPlaceholder}
                placeholder="Select Year"
                data={years}
                value={year}
                labelField="label"
                valueField="value"
                onChange={function (item: any): void {
                    setYear(item.value);
                } }
            />

            <View style={styles.dropdownInput}>
                <MultiSelect
                    placeholderStyle={{ color: theme.palette.subtext }}
                    selectedTextStyle={{ color: theme.palette.text }}
                    data={majors}
                    value={majorArray}
                    labelField="label"
                    valueField="value"
                    onChange={ function(item: any): void {
                        setMajorArray(item);
                    } }
                    selectedStyle={{ borderRadius: 12 }}
                    placeholder="Select Major(s)"
                />
            </View>

            <TextInput
                style={styles.input}
                placeholder="(Optional) First Name"
                placeholderTextColor={theme.palette.subtext}
                value={firstName}
                onChangeText={setFirstName}
            />
            <TextInput
                style={styles.input}
                placeholder="(Optional) Last Name"
                placeholderTextColor={theme.palette.subtext}
                value={lastName}
                onChangeText={setLastName}
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
