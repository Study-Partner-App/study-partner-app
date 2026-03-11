import { View, Text, Button } from 'react-native';
import { styles } from '@/lib/styles';
import { useRouter } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { useState } from 'react';

export default function IndexPage() {
    const router = useRouter();
    
    const handleCreate = () =>{
        router.push('./study-sessions/create_sessions');
    }

    return (
        <View style={styles.page}>
            <View style={styles.button}>
                <Button title='Create Study Session' onPress={handleCreate} />
            </View>
            
        </View>
    );
}