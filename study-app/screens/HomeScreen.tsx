import { View, Text, Button} from 'react-native';
import { supabase } from '../lib/supabase';

export default function HomeScreen() {
    const signOut = async () => {
        await supabase.auth.signOut();
    }

    return (
        <View style={{ padding: 24 }}>
            <Text style={{ fontSize: 24, fontWeight: 'bold'}}>
                Study Partner
            </Text>

            <Text style={{ marginTop: 12 }}>
                You have successfully logged in!
            </Text>

            <Button title="Sign Out" onPress={signOut} />
        </View>
    );
}

