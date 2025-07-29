import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { useTheme } from "../../contexts/ThemeContext";

export default function TabsLayout() {
  const { theme } = useTheme();
  
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textSecondary,
        headerShown: false,
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopWidth: 1,
          borderTopColor: theme.colors.border,
          height: 70,
          paddingTop: 10,
          paddingBottom: 10,
          shadowColor: theme.isDark ? "#FFFFFF" : "#000000",
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