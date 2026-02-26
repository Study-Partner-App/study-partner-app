import { View, Text, Button } from 'react-native';
import { styles } from '@/lib/styles';
import { useRouter } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { useState } from 'react';

const CreateSessionsPage = () => {

    return (
        <View style={styles.container}>
            <Text style={styles.text}>This is where you create study sessions.</Text>
        </View>
    );
};

export default CreateSessionsPage