import { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { supabase } from './lib/supabase';
import HomeScreen from './screens/HomeScreen';

export default function App() {
    const [loading, setLoading] = useState(true);
    const [session, setSession] = useState<any>(null);
    
    useEffect(() => {
        supabase.auth.getSession().then(({ data }) => {
            setSession(data.session);
            setLoading(false);
        });

        const { data: listener } = supabase.auth.onAuthStateChange(
            (_event, session) => {
                setSession(session);
            }
        );

        return () => {
            listener.subscription.unsubscribe();
        };
    }, []);

    if(loading) {
        return <ActivityIndicator size="large" />;
    }

    return session ? (
        <HomeScreen />
    ) : (
        <View>
            <Text>Please Log In</Text>
        </View>
    );

}