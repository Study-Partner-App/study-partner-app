import { View, Text, Button } from 'react-native';
import { styles } from '@/lib/styles';
import { useRouter } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { useState } from 'react';

export default function IndexPage() {
    const router = useRouter();
    
    const handleCreate = () =>{
        router.push('/study-sessions/create_sessions');
    }

    return (
        <View style={styles.page}>
            <Text style={styles.title}>Study Sessions</Text>
            <Text>Here is where you view your study sessions.</Text>       
        </View>
    );
}