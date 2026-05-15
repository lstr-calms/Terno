import { Tabs } from "expo-router";
import React from "react";

import { TernoIcon } from "@/components/TernoIcon";

import { AppTheme } from "@/constants/theme";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: AppTheme.colors['primary-container'],
        tabBarInactiveTintColor: AppTheme.colors.outline,
        tabBarStyle: {
          backgroundColor: AppTheme.colors.background,
          borderTopColor: AppTheme.colors['outline-variant'],
        },
        tabBarLabelStyle: {
          fontFamily: AppTheme.typography['label-sm'].fontFamily,
          fontWeight: "600",
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ size, focused }) => (
            <TernoIcon
              source={focused ? require('@/assets/icons/tabs/home-active.png') : require('@/assets/icons/tabs/home-inactive.png')}
              size={size}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="saved"
        options={{
          title: "Saved",
          tabBarIcon: ({ size, focused }) => (
            <TernoIcon
              source={focused ? require('@/assets/icons/tabs/saved-active.png') : require('@/assets/icons/tabs/saved-inactive.png')}
              size={size}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="wardrobe"
        options={{
          title: "Wardrobe",
          tabBarIcon: ({ size, focused }) => (
            <TernoIcon
              source={focused ? require('@/assets/icons/tabs/wardrobe-active.png') : require('@/assets/icons/tabs/wardrobe-inactive.png')}
              size={size}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ size, focused }) => (
            <TernoIcon
              source={focused ? require('@/assets/icons/tabs/profile-active.png') : require('@/assets/icons/tabs/profile-inactive.png')}
              size={size}
            />
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
