import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#2196F3",
        tabBarInactiveTintColor: "#6b7280",
        headerShown: false,
        tabBarStyle: {
          backgroundColor: "#ffffff",
          borderTopWidth: 1,
          borderTopColor: "#e5e7eb",
          height: 70,
          paddingTop: 10,
          paddingBottom: 10,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 8,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "600",
          marginTop: 4,
        },
        tabBarIconStyle: {
          marginTop: 2,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Dashboard",
          tabBarIcon: ({ color }) => (
            <Ionicons name="home" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="projects/index"
        options={{
          title: "Projects",
          tabBarIcon: ({ color }) => (
            <Ionicons name="folder" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="tasks/index"
        options={{
          title: "Tasks",
          tabBarIcon: ({ color }) => (
            <Ionicons name="list" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color }) => (
            <Ionicons name="person" size={24} color={color} />
          ),
        }}
      />

      {/* Hide unused and detail routes from tab navigation */}
      <Tabs.Screen name="dashboard" options={{ href: null }} />
      <Tabs.Screen name="layout" options={{ href: null }} />
      <Tabs.Screen name="projects/[id]" options={{ href: null }} />
      <Tabs.Screen name="projects/create" options={{ href: null }} />
      <Tabs.Screen name="tasks/[id]" options={{ href: null }} />
      <Tabs.Screen name="tasks/create" options={{ href: null }} />
    </Tabs>
  );
}