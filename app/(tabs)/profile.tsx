import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "expo-router";

import { AppTheme } from "@/constants/theme";
import type { TernoPreferences } from "@/types/terno";

const styleOptions = [
  "Casual",
  "Smart Casual",
  "Streetwear",
  "Minimalist",
  "Formal",
  "Preppy",
];

const colorOptions = [
  "Black",
  "White",
  "Beige",
  "Navy",
  "Brown",
  "Gray",
  "Earth Tones",
];

const occasionOptions = [
  "School",
  "Work",
  "Date",
  "Party",
  "Interview",
  "Everyday",
];

const fitOptions = ["Relaxed", "Regular", "Oversized", "Slim", "Comfort-first"];

export default function ProfileScreen() {
  const [selectedStyles, setSelectedStyles] = useState<string[]>(["Casual"]);
  const [selectedColors, setSelectedColors] = useState<string[]>([
    "Black",
    "White",
    "Beige",
  ]);
  const [selectedOccasions, setSelectedOccasions] = useState<string[]>([
    "Everyday",
  ]);
  const [selectedFits, setSelectedFits] = useState<string[]>(["Regular"]);

  const toggleItem = (
    item: string,
    selectedItems: string[],
    setSelectedItems: React.Dispatch<React.SetStateAction<string[]>>
  ) => {
    if (selectedItems.includes(item)) {
      setSelectedItems(selectedItems.filter((value) => value !== item));
    } else {
      setSelectedItems([...selectedItems, item]);
    }
  };

  const loadPreferences = async () => {
    try {
      const data = await AsyncStorage.getItem("terno_preferences");

      if (data) {
        const preferences: TernoPreferences = JSON.parse(data);

        setSelectedStyles(preferences.styles || ["Casual"]);
        setSelectedColors(preferences.colors || ["Black", "White", "Beige"]);
        setSelectedOccasions(preferences.occasions || ["Everyday"]);
        setSelectedFits(preferences.fits || ["Regular"]);
      }
    } catch (error) {
      console.error("Load preferences error:", error);
      Alert.alert("Error", "Could not load your preferences.");
    }
  };

  const handleSavePreferences = async () => {
    try {
      const preferences: TernoPreferences = {
        styles: selectedStyles,
        colors: selectedColors,
        occasions: selectedOccasions,
        fits: selectedFits,
        updatedAt: new Date().toISOString(),
      };

      await AsyncStorage.setItem(
        "terno_preferences",
        JSON.stringify(preferences)
      );

      Alert.alert(
        "Preferences Saved",
        "Terno will use these preferences for better outfit suggestions."
      );
    } catch (error) {
      console.error("Save preferences error:", error);
      Alert.alert("Error", "Could not save your preferences.");
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadPreferences();
    }, [])
  );

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.heroCard}>
        <Text style={styles.kicker}>Personal Style</Text>
        <Text style={styles.logo}>Profile</Text>
        <Text style={styles.subtitle}>
          Help Terno understand your style so it can recommend better outfit
          combinations.
        </Text>
      </View>

      <PreferenceCard
        title="Preferred Styles"
        description="Choose the styles you usually want to wear."
        options={styleOptions}
        selectedItems={selectedStyles}
        onToggle={(item) => toggleItem(item, selectedStyles, setSelectedStyles)}
      />

      <PreferenceCard
        title="Favorite Colors"
        description="Pick colors you like wearing most often."
        options={colorOptions}
        selectedItems={selectedColors}
        onToggle={(item) => toggleItem(item, selectedColors, setSelectedColors)}
      />

      <PreferenceCard
        title="Common Occasions"
        description="Select where you usually need outfit help."
        options={occasionOptions}
        selectedItems={selectedOccasions}
        onToggle={(item) =>
          toggleItem(item, selectedOccasions, setSelectedOccasions)
        }
      />

      <PreferenceCard
        title="Fit Preference"
        description="Choose the silhouettes you feel most comfortable wearing."
        options={fitOptions}
        selectedItems={selectedFits}
        onToggle={(item) => toggleItem(item, selectedFits, setSelectedFits)}
      />

      <View style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>Your Style Summary</Text>

        <Text style={styles.summaryText}>
          <Text style={styles.bold}>Styles: </Text>
          {selectedStyles.join(", ") || "None selected"}
        </Text>

        <Text style={styles.summaryText}>
          <Text style={styles.bold}>Colors: </Text>
          {selectedColors.join(", ") || "None selected"}
        </Text>

        <Text style={styles.summaryText}>
          <Text style={styles.bold}>Occasions: </Text>
          {selectedOccasions.join(", ") || "None selected"}
        </Text>

        <Text style={styles.summaryText}>
          <Text style={styles.bold}>Fits: </Text>
          {selectedFits.join(", ") || "None selected"}
        </Text>
      </View>

      <TouchableOpacity style={styles.saveButton} onPress={handleSavePreferences}>
        <Text style={styles.saveButtonText}>Save Preferences</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

function PreferenceCard({
  title,
  description,
  options,
  selectedItems,
  onToggle,
}: {
  title: string;
  description: string;
  options: string[];
  selectedItems: string[];
  onToggle: (item: string) => void;
}) {
  return (
    <View style={styles.card}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <Text style={styles.sectionDescription}>{description}</Text>

      <View style={styles.chipContainer}>
        {options.map((option) => {
          const selected = selectedItems.includes(option);

          return (
            <TouchableOpacity
              key={option}
              style={[styles.chip, selected && styles.selectedChip]}
              onPress={() => onToggle(option)}
            >
              <Text style={[styles.chipText, selected && styles.selectedChipText]}>
                {option}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: AppTheme.colors.background,
    padding: AppTheme.spacing['margin-mobile'],
  },

  heroCard: {
    width: "100%",
    backgroundColor: AppTheme.colors['secondary-container'],
    borderRadius: AppTheme.rounded.xl,
    padding: AppTheme.spacing.md,
    marginTop: 42,
    marginBottom: AppTheme.spacing.sm,
    borderWidth: 1,
    borderColor: AppTheme.colors['outline-variant'],
  },
  kicker: {
    ...AppTheme.typography['label-sm'],
    color: AppTheme.colors['on-tertiary-container'],
    textTransform: "uppercase",
    marginBottom: AppTheme.spacing.base,
  },
  logo: {
    ...AppTheme.typography['headline-xl-mobile'],
    color: AppTheme.colors['primary-container'],
  },
  subtitle: {
    ...AppTheme.typography['body-md'],
    color: AppTheme.colors['on-surface-variant'],
    marginTop: AppTheme.spacing.base,
  },

  card: {
    backgroundColor: AppTheme.colors.surface,
    borderRadius: AppTheme.rounded.lg,
    padding: AppTheme.spacing.md,
    borderWidth: 1,
    borderColor: AppTheme.colors['outline-variant'],
    marginBottom: AppTheme.spacing.sm,
  },
  sectionTitle: {
    ...AppTheme.typography['headline-md'],
    color: AppTheme.colors['primary-container'],
    marginBottom: 6,
  },
  sectionDescription: {
    ...AppTheme.typography['body-md'],
    color: AppTheme.colors['on-surface-variant'],
    marginBottom: AppTheme.spacing['margin-mobile'],
  },

  chipContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: AppTheme.spacing.sm,
  },
  chip: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: AppTheme.rounded.full,
    backgroundColor: AppTheme.colors.background,
    borderWidth: 1,
    borderColor: AppTheme.colors['outline-variant'],
  },
  selectedChip: {
    backgroundColor: AppTheme.colors['primary-container'],
    borderColor: AppTheme.colors['primary-container'],
  },
  chipText: {
    ...AppTheme.typography['label-md'],
    color: AppTheme.colors['on-surface-variant'],
  },
  selectedChipText: {
    color: AppTheme.colors['on-primary'],
  },

  summaryCard: {
    backgroundColor: AppTheme.colors['secondary-container'],
    borderRadius: AppTheme.rounded.xl,
    padding: AppTheme.spacing.md,
    borderWidth: 1,
    borderColor: AppTheme.colors['outline-variant'],
    marginBottom: AppTheme.spacing.sm,
  },
  summaryTitle: {
    ...AppTheme.typography['headline-md'],
    color: AppTheme.colors['primary-container'],
    marginBottom: AppTheme.spacing.sm,
  },
  summaryText: {
    ...AppTheme.typography['body-md'],
    color: AppTheme.colors['on-surface-variant'],
    marginBottom: AppTheme.spacing.base,
  },
  bold: {
    fontFamily: AppTheme.typography['headline-md'].fontFamily,
    color: AppTheme.colors['primary-container'],
  },

  saveButton: {
    backgroundColor: AppTheme.colors['primary-container'],
    paddingVertical: 16,
    borderRadius: AppTheme.rounded.DEFAULT,
    alignItems: "center",
    marginBottom: AppTheme.spacing.md,
  },
  saveButtonText: {
    ...AppTheme.typography['label-md'],
    color: AppTheme.colors['on-primary'],
  },
});
