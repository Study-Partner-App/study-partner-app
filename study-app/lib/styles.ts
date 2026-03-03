import { Button } from '@react-navigation/elements';
import { StyleSheet } from 'react-native';

//Some temporary styles, just to make things work for now.
const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#000000',
        padding: 16
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

export { styles };