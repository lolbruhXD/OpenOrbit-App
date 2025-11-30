import React from 'react';
import { Tabs } from 'expo-router';
import { FontAwesome5, Ionicons } from '@expo/vector-icons';

// Define our theme colors for the tab bar
const colors = {
  inactive: '#a0a0a0',
  active: '#f0f0f0',
  background: '#000000',
  border: '#3a3a3c',
};

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        // --- Style the Tab Bar ---
        tabBarActiveTintColor: colors.active,
        tabBarInactiveTintColor: colors.inactive,
        tabBarStyle: {
          backgroundColor: colors.background,
          borderTopColor: colors.border,
        },
        // --- Hide the default header ---
        // We do this because each screen will have its own custom header
        headerShown: false,
      }}>
      <Tabs.Screen
        name="index" // This links to app/(tabs)/index.tsx
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <FontAwesome5 name="home" size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="feed" // This links to app/(tabs)/feed.tsx
        options={{
          title: 'Feed',
          tabBarIcon: ({ color }) => <FontAwesome5 name="stream" size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="quickies" // This links to app/(tabs)/quickies.tsx
        options={{
          title: 'Quickies',
          tabBarIcon: ({ color }) => <FontAwesome5 name="video" size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile" // This links to app/(tabs)/profile.tsx
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <FontAwesome5 name="user" size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="chat" // This links to app/(tabs)/chat.tsx
        options={{
          title: 'Chat',
          tabBarIcon: ({ color }) => <Ionicons name="chatbubble-ellipses-outline" size={24} color={color} />,
        }}
      />
    </Tabs>
  );
}