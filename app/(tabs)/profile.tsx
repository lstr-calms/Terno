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
    padding: AppTheme.spacing.screen,
  },

  heroCard: {
    width: "100%",
    backgroundColor: AppTheme.colors.surfaceWarm,
    borderRadius: AppTheme.radii.hero,
    padding: AppTheme.spacing.hero,
    marginTop: 42,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: AppTheme.colors.border,
  },
  kicker: {
    color: AppTheme.colors.accent,
    fontSize: 12,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 1.2,
    marginBottom: 8,
  },
  logo: {
    fontSize: 38,
    fontWeight: "900",
    color: AppTheme.colors.primary,
  },
  subtitle: {
    fontSize: 15,
    color: AppTheme.colors.bodyText,
    marginTop: 8,
    lineHeight: 22,
  },

  card: {
    backgroundColor: AppTheme.colors.surface,
    borderRadius: AppTheme.radii.card,
    padding: AppTheme.spacing.card,
    borderWidth: 1,
    borderColor: AppTheme.colors.border,
    marginBottom: 18,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "900",
    color: "#162839",
    marginBottom: 6,
  },
  sectionDescription: {
    fontSize: 14,
    color: "#5F5548",
    lineHeight: 21,
    marginBottom: 16,
  },

  chipContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  chip: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 999,
    backgroundColor: "#FBF9F4",
    borderWidth: 1,
    borderColor: "#DED3C1",
  },
  selectedChip: {
    backgroundColor: "#162839",
    borderColor: "#162839",
  },
  chipText: {
    color: "#5F5548",
    fontWeight: "800",
  },
  selectedChipText: {
    color: "#FFF8E7",
  },

  summaryCard: {
    backgroundColor: "#F4EFE4",
    borderRadius: 24,
    padding: 18,
    borderWidth: 1,
    borderColor: "#E7DCC8",
    marginBottom: 18,
  },
  summaryTitle: {
    fontSize: 20,
    fontWeight: "900",
    color: "#162839",
    marginBottom: 12,
  },
  summaryText: {
    fontSize: 14,
    color: "#5F5548",
    lineHeight: 22,
    marginBottom: 8,
  },
  bold: {
    color: "#162839",
    fontWeight: "900",
  },

  saveButton: {
    backgroundColor: "#162839",
    paddingVertical: 18,
    borderRadius: 20,
    alignItems: "center",
    marginBottom: 28,
  },
  saveButtonText: {
    color: "#FFF8E7",
    fontSize: 16,
    fontWeight: "900",
  },
});
