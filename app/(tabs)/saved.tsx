import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import { AppTheme } from "@/constants/theme";
import type { SavedTerno } from "@/types/terno";

export default function SavedTernosScreen() {
  const [savedTernos, setSavedTernos] = useState<SavedTerno[]>([]);

  const loadSavedTernos = async () => {
    try {
      const data = await AsyncStorage.getItem("saved_ternos");
      const parsed: SavedTerno[] = data ? JSON.parse(data) : [];
      setSavedTernos(parsed);
    } catch (error) {
      console.error("Load saved ternos error:", error);
      Alert.alert("Error", "Could not load saved Ternos.");
    }
  };

  const deleteSavedTerno = async (id: string) => {
    try {
      const updated = savedTernos.filter((item) => item.id !== id);
      setSavedTernos(updated);
      await AsyncStorage.setItem("saved_ternos", JSON.stringify(updated));
    } catch (error) {
      console.error("Delete saved terno error:", error);
      Alert.alert("Error", "Could not delete this Terno.");
    }
  };

  const clearAllSaved = async () => {
    Alert.alert(
      "Clear Saved Ternos",
      "Are you sure you want to remove all saved outfits?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Clear All",
          style: "destructive",
          onPress: async () => {
            await AsyncStorage.removeItem("saved_ternos");
            setSavedTernos([]);
          },
        },
      ]
    );
  };

  useFocusEffect(
    useCallback(() => {
      loadSavedTernos();
    }, [])
  );

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.heroCard}>
        <Text style={styles.kicker}>Saved Looks</Text>
        <Text style={styles.logo}>My Ternos</Text>
        <Text style={styles.subtitle}>
          Your saved outfit combinations will appear here.
        </Text>
      </View>

      {savedTernos.length > 0 && (
        <TouchableOpacity style={styles.clearButton} onPress={clearAllSaved}>
          <Text style={styles.clearButtonText}>Clear All</Text>
        </TouchableOpacity>
      )}

      {savedTernos.length === 0 ? (
        <View style={styles.emptyCard}>
          <Ionicons name="bookmark-outline" size={48} color={AppTheme.colors.accent} />
          <Text style={styles.emptyTitle}>No saved Ternos yet</Text>
          <Text style={styles.emptyText}>
            Save an outfit recommendation from the Home screen to see it here.
          </Text>
        </View>
      ) : (
        savedTernos.map((item) => {
          const detectedItem = item.detectedItem;
          const recommendation = item.recommendation;

          return (
            <View key={item.id} style={styles.savedCard}>
              {item.imageUri && (
                <Image source={{ uri: item.imageUri }} style={styles.savedImage} />
              )}

              <View style={styles.cardContent}>
                <View style={styles.topRow}>
                  <View>
                    <Text style={styles.lookBadge}>
                      Look {item.lookNumber || ""}
                    </Text>
                    <Text style={styles.cardTitle}>
                      {recommendation.title || "Saved Terno"}
                    </Text>
                  </View>

                  <TouchableOpacity
                    onPress={() => deleteSavedTerno(item.id)}
                    style={styles.deleteButton}
                  >
                    <Text style={styles.deleteButtonText}>Delete</Text>
                  </TouchableOpacity>
                </View>

                <Text style={styles.itemText}>
                  <Text style={styles.bold}>Item: </Text>
                  {detectedItem?.main_color || ""} {detectedItem?.category || ""}
                </Text>

                <Text style={styles.itemText}>
                  <Text style={styles.bold}>Occasion: </Text>
                  {item.occasion || "Not specified"}
                </Text>

                <View style={styles.outfitBox}>
                  <OutfitRow label="Top" value={recommendation.top} />
                  <OutfitRow label="Bottom" value={recommendation.bottom} />
                  <OutfitRow label="Shoes" value={recommendation.shoes} />
                  <OutfitRow label="Outerwear" value={recommendation.outerwear} />
                  <OutfitRow label="Accessories" value={recommendation.accessories} />
                </View>

                <View style={styles.reasonBox}>
                  <Text style={styles.reasonTitle}>Why this works</Text>
                  <Text style={styles.reasonText}>
                    {recommendation.why_this_is_best ||
                      recommendation.style_reasoning ||
                      "This outfit matches your uploaded item."}
                  </Text>
                </View>
              </View>
            </View>
          );
        })
      )}
    </ScrollView>
  );
}

function OutfitRow({ label, value }: { label: string; value?: string }) {
  return (
    <View style={styles.outfitRow}>
      <Text style={styles.outfitLabel}>{label}</Text>
      <Text style={styles.outfitValue}>{value || "Not specified"}</Text>
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

  clearButton: {
    alignSelf: "flex-end",
    backgroundColor: AppTheme.colors.dangerSurface,
    borderRadius: 999,
    paddingVertical: 9,
    paddingHorizontal: 15,
    marginBottom: 14,
  },
  clearButtonText: {
    color: AppTheme.colors.danger,
    fontWeight: "900",
    fontSize: 13,
  },

  emptyCard: {
    backgroundColor: AppTheme.colors.surface,
    borderRadius: AppTheme.radii.card,
    padding: 28,
    borderWidth: 1,
    borderColor: AppTheme.colors.border,
    alignItems: "center",
    marginTop: 18,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: "900",
    color: AppTheme.colors.primary,
    marginBottom: 8,
    textAlign: "center",
  },
  emptyText: {
    fontSize: 14,
    color: AppTheme.colors.bodyText,
    textAlign: "center",
    lineHeight: 21,
  },

  savedCard: {
    backgroundColor: AppTheme.colors.surface,
    borderRadius: AppTheme.radii.card,
    borderWidth: 1,
    borderColor: AppTheme.colors.border,
    marginBottom: 18,
    overflow: "hidden",
  },
  savedImage: {
    width: "100%",
    height: 230,
    resizeMode: "cover",
  },
  cardContent: {
    padding: 18,
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 12,
  },
  lookBadge: {
    color: "#735C00",
    fontSize: 12,
    fontWeight: "900",
    textTransform: "uppercase",
    marginBottom: 4,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: "900",
    color: "#162839",
    flexShrink: 1,
  },
  deleteButton: {
    backgroundColor: "#FFF3EF",
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 999,
    alignSelf: "flex-start",
  },
  deleteButtonText: {
    color: "#721E12",
    fontSize: 12,
    fontWeight: "900",
  },
  itemText: {
    fontSize: 14,
    color: "#5F5548",
    marginBottom: 6,
    lineHeight: 20,
  },
  bold: {
    color: "#162839",
    fontWeight: "900",
  },

  outfitBox: {
    backgroundColor: "#FBF9F4",
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: "#EEE4D4",
    marginTop: 12,
  },
  outfitRow: {
    marginBottom: 10,
  },
  outfitLabel: {
    fontSize: 11,
    color: "#735C00",
    fontWeight: "900",
    textTransform: "uppercase",
    marginBottom: 2,
  },
  outfitValue: {
    fontSize: 14,
    color: "#162839",
    fontWeight: "700",
    lineHeight: 20,
  },

  reasonBox: {
    backgroundColor: "#F4EFE4",
    borderRadius: 18,
    padding: 14,
    marginTop: 14,
    borderLeftWidth: 4,
    borderLeftColor: "#735C00",
  },
  reasonTitle: {
    fontSize: 15,
    fontWeight: "900",
    color: "#162839",
    marginBottom: 6,
  },
  reasonText: {
    fontSize: 14,
    color: "#5F5548",
    lineHeight: 21,
  },
});
