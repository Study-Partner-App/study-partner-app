// import { Stack, useRouter } from "expo-router";
// import { TouchableOpacity, Text, StyleSheet } from "react-native";
// import { Ionicons } from "@expo/vector-icons";

// export default function UserDetailsLayout() {
//     const router = useRouter();

//     return (
//         <Stack
//             screenOptions={{
//                 headerBackVisible: false,   // remove default
//                 headerBackTitle: "",
//             }}
//         >
//             <Stack.Screen
//                 name="ProfileDetails"
//                 options={{
//                     headerTitle: "Profile",
//                     headerLeft: () => (
//                         <TouchableOpacity 
//                             onPress={() => router.back()} 
//                             style={styles.backButton}
//                         >
//                             <Ionicons name="arrow-back" size={24} color="black" />
//                             <Text style={styles.backText}>Back</Text>
//                         </TouchableOpacity>
//                     ),
//                 }}
//             />
//         </Stack>
//     );
// }

// const styles = StyleSheet.create({
//     backButton: {
//         flexDirection: "row",
//         alignItems: "center",
//         paddingHorizontal: 10,
//     },
//     backText: {
//         marginLeft: 5,
//         fontSize: 16,
//     },
// });