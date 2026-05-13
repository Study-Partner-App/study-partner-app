import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, Tabs } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';

// export const unstable_settings = {
//   anchor: '(tabs)',
// };

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack
        screenOptions={{
          headerTintColor: "#000",
          headerStyle: { backgroundColor: "#b6deed"},
        }}>
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
        <Stack.Screen name="index" options={{ title: 'Home', headerShown: false }} />
        <Stack.Screen name="matching" options={{ title: 'Matching', headerShown: true }} />
        <Stack.Screen name="requests/index" options={{ title: 'Requests', headerShown: true }} />
        <Stack.Screen name="announcement" options={{ title: 'Announcements', headerShown: true }} />
        <Stack.Screen name="friends/index" options={{ title: 'Friends', headerShown: true }} />
        <Stack.Screen name="time-filter/index" options={{ title: 'Time Filter', headerShown: true }} />
        <Stack.Screen name="study-sessions" options={{ title: 'Study Sessions', headerShown: false }} />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>

  );
}
