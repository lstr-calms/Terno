import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import React from "react";

import { AppTheme } from "@/constants/theme";

type TabIconName = keyof typeof Ionicons.glyphMap;

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: AppTheme.colors.primary,
        tabBarInactiveTintColor: AppTheme.colors.tabInactive,
        tabBarStyle: {
          backgroundColor: AppTheme.colors.background,
          borderTopColor: AppTheme.colors.border,
        },
        tabBarLabelStyle: {
          fontWeight: "800",
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name={"home-outline" satisfies TabIconName} color={color} size={size} />
          ),
        }}
      />

      <Tabs.Screen
        name="saved"
        options={{
          title: "Saved",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name={"bookmark-outline" satisfies TabIconName} color={color} size={size} />
          ),
        }}
      />

      <Tabs.Screen
        name="wardrobe"
        options={{
          title: "Wardrobe",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name={"shirt-outline" satisfies TabIconName} color={color} size={size} />
          ),
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name={"person-outline" satisfies TabIconName} color={color} size={size} />
          ),
        }}
      />

      <Tabs.Screen
        name="explore"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}
