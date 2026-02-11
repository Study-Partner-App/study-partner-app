import { View, Text, Button } from 'react-native';
import { useRouter } from 'expo-router';

export default function IndexPage() {
    const router = useRouter();

    //A quick function to handle behavior for the button press.
    const handlePress = () => {
        //Remember, the navigation works in a stack. Push to go to a new page, pop to go back.
        router.push('/(auth)/signup')
    };

    return (
        <View>
            <Text>Landing Page</Text>
            <Button title="Sign Up" onPress={handlePress} />
        </View>
    );
}