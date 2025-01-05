import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

export default function Layout() {
  return (
    <>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: '#4CAF50',
          },
          headerTintColor: '#fff',
        }}
      >
        <Stack.Screen
          name="index"
          options={{
            title: 'Emoji 连连看',
          }}
        />
        <Stack.Screen
          name="game"
          options={{
            title: '游戏',
          }}
        />
        <Stack.Screen
          name="leaderboard"
          options={{
            title: '排行榜',
          }}
        />
        <Stack.Screen
          name="settings"
          options={{
            title: '设置',
          }}
        />
      </Stack>
    </>
  );
} 