import { Stack } from 'expo-router';

export default function AuthLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, animation: 'slide_from_bottom' }}>
      <Stack.Screen name="login" />
      <Stack.Screen name="role-selection" />
      <Stack.Screen name="customer-registration" />
      <Stack.Screen name="worker-registration" />
    </Stack>
  );
}
