import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { FullLookPreview } from "@/components/full-look-preview";
import { GENERATE_LOOK_PREVIEW_URL } from "@/constants/api";
import { AppTheme } from "@/constants/theme";
import { TernoIcon } from "@/components/TernoIcon";
import type { Recommendation, SavedTerno } from "@/types/terno";

export default function SavedTernosScreen() {
  const [savedTernos, setSavedTernos] = useState<SavedTerno[]>([]);
  const [aiPreviewImages, setAiPreviewImages] = useState<Record<string, string>>({});
  const [aiPreviewLoading, setAiPreviewLoading] = useState<Record<string, boolean>>({});

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

  const generateLookPreview = async (
    savedId: string,
    imageUri: string | null,
    recommendation: Recommendation
  ) => {
    if (!imageUri) {
      Alert.alert("No image found", "This saved Terno does not have an uploaded item image.");
      return;
    }

    try {
      setAiPreviewLoading((current) => ({ ...current, [savedId]: true }));

      const formData = new FormData();
      formData.append("image", {
        uri: imageUri,
        name: "clothing.jpg",
        type: "image/jpeg",
      } as any);
      formData.append("recommendation", JSON.stringify(recommendation));

      const response = await fetch(GENERATE_LOOK_PREVIEW_URL, {
        method: "POST",
        body: formData,
      });
      const text = await response.text();

      if (!response.ok) {
        console.error("Saved AI preview error:", response.status, text);
        Alert.alert(
          "Preview failed",
          "Terno could not generate this AI look preview right now."
        );
        return;
      }

      const data = JSON.parse(text);
      if (!data.image_data_uri) {
        Alert.alert("Preview failed", "The backend did not return an image.");
        return;
      }

      setAiPreviewImages((current) => ({
        ...current,
        [savedId]: data.image_data_uri,
      }));
    } catch (error) {
      console.error("Generate saved AI preview error:", error);
      Alert.alert(
        "Connection error",
        "Could not connect to the Terno backend for AI preview generation."
      );
    } finally {
      setAiPreviewLoading((current) => ({ ...current, [savedId]: false }));
    }
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
          <TernoIcon source={require('@/assets/icons/tabs/saved-inactive.png')} size={48} color={AppTheme.colors.accent} />
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

                {item.usedWardrobeMode && (
                  <View style={styles.wardrobeBadge}>
                    <TernoIcon source={require('@/assets/icons/tabs/wardrobe-inactive.png')} size={14} color="#735C00" />
                    <Text style={styles.wardrobeBadgeText}>Used My Wardrobe</Text>
                  </View>
                )}

                <FullLookPreview
                  imageUri={item.imageUri}
                  recommendation={recommendation}
                />

                {aiPreviewImages[item.id] && (
                  <View style={styles.aiPreviewBox}>
                    <Image
                      source={{ uri: aiPreviewImages[item.id] }}
                      style={styles.aiPreviewImage}
                    />
                    <Text style={styles.aiPreviewCaption}>AI generated preview</Text>
                  </View>
                )}

                <TouchableOpacity
                  style={[
                    styles.aiPreviewButton,
                    aiPreviewLoading[item.id] && styles.disabledButton,
                  ]}
                  onPress={() =>
                    generateLookPreview(item.id, item.imageUri, recommendation)
                  }
                  disabled={aiPreviewLoading[item.id]}
                >
                  {aiPreviewLoading[item.id] ? (
                    <ActivityIndicator color={AppTheme.colors.primaryTextOnDark} />
                  ) : (
                    <Text style={styles.aiPreviewButtonText}>
                      {aiPreviewImages[item.id]
                        ? "Regenerate AI Preview"
                        : "Generate AI Preview"}
                    </Text>
                  )}
                </TouchableOpacity>

                <View style={styles.outfitBox}>
                  <OutfitRow label="Top" value={recommendation.top} />
                  <OutfitRow label="Bottom" value={recommendation.bottom} />
                  <OutfitRow label="Shoes" value={recommendation.shoes} />
                  <OutfitRow label="Outerwear" value={recommendation.outerwear} />
                  <OutfitRow label="Accessories" value={recommendation.accessories} />
                </View>

                <View style={styles.scoresGrid}>
                  {recommendation.compatibility_score !== undefined && <ScorePill label="Match" score={recommendation.compatibility_score} />}
                  {recommendation.color_score !== undefined && <ScorePill label="Color" score={recommendation.color_score} />}
                  {recommendation.style_score !== undefined && <ScorePill label="Style" score={recommendation.style_score} />}
                  {recommendation.occasion_score !== undefined && <ScorePill label="Occasion" score={recommendation.occasion_score} />}
                </View>

                <View style={styles.reasonBox}>
                  <Text style={styles.reasonTitle}>Why this works</Text>
                  <Text style={styles.reasonText}>
                    {recommendation.why_this_is_best ||
                      recommendation.style_reasoning ||
                      "This outfit matches your uploaded item."}
                  </Text>
                </View>

                {recommendation.occasion_reasoning && (
                  <Text style={styles.smallReason}>
                    <Text style={styles.bold}>Occasion: </Text>
                    {recommendation.occasion_reasoning}
                  </Text>
                )}
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

function ScorePill({ label, score }: { label: string; score: number }) {
  return (
    <View style={styles.scorePill}>
      <Text style={styles.scoreLabel}>{label}</Text>
      <Text style={styles.scoreValue}>{score}%</Text>
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

  clearButton: {
    alignSelf: "flex-end",
    backgroundColor: AppTheme.colors['error-container'],
    borderRadius: AppTheme.rounded.full,
    paddingVertical: 9,
    paddingHorizontal: 15,
    marginBottom: 14,
  },
  clearButtonText: {
    ...AppTheme.typography['label-md'],
    color: AppTheme.colors.error,
  },

  emptyCard: {
    backgroundColor: AppTheme.colors['secondary-container'],
    borderRadius: AppTheme.rounded.lg,
    padding: 28,
    borderWidth: 1,
    borderColor: AppTheme.colors['outline-variant'],
    alignItems: "center",
    marginTop: 18,
  },
  emptyTitle: {
    ...AppTheme.typography['headline-md'],
    color: AppTheme.colors['primary-container'],
    marginBottom: AppTheme.spacing.base,
    textAlign: "center",
  },
  emptyText: {
    ...AppTheme.typography['body-md'],
    color: AppTheme.colors['on-surface-variant'],
    textAlign: "center",
  },

  savedCard: {
    backgroundColor: AppTheme.colors.surface,
    borderRadius: AppTheme.rounded.lg,
    borderWidth: 1,
    borderColor: AppTheme.colors['outline-variant'],
    marginBottom: AppTheme.spacing.sm,
    overflow: "hidden",
  },
  cardContent: {
    padding: AppTheme.spacing.md,
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 12,
  },
  lookBadge: {
    ...AppTheme.typography['label-sm'],
    color: AppTheme.colors['on-tertiary-container'],
    textTransform: "uppercase",
    marginBottom: 4,
  },
  cardTitle: {
    ...AppTheme.typography['headline-md'],
    color: AppTheme.colors['primary-container'],
    flexShrink: 1,
  },
  deleteButton: {
    backgroundColor: AppTheme.colors['error-container'],
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: AppTheme.rounded.full,
    alignSelf: "flex-start",
  },
  deleteButtonText: {
    ...AppTheme.typography['label-sm'],
    color: AppTheme.colors.error,
  },
  itemText: {
    ...AppTheme.typography['body-md'],
    color: AppTheme.colors['on-surface-variant'],
    marginBottom: 6,
  },
  bold: {
    fontFamily: AppTheme.typography['headline-md'].fontFamily,
    color: AppTheme.colors['primary-container'],
  },

  outfitBox: {
    backgroundColor: AppTheme.colors.background,
    borderRadius: AppTheme.rounded.lg,
    padding: 14,
    borderWidth: 1,
    borderColor: AppTheme.colors['surface-container'],
    marginTop: 12,
  },
  aiPreviewBox: {
    backgroundColor: AppTheme.colors.background,
    borderRadius: AppTheme.rounded.lg,
    borderWidth: 1,
    borderColor: AppTheme.colors['surface-container'],
    overflow: "hidden",
    marginBottom: 12,
  },
  aiPreviewImage: {
    width: "100%",
    aspectRatio: 4 / 5,
    resizeMode: "cover",
  },
  aiPreviewCaption: {
    ...AppTheme.typography['label-sm'],
    color: AppTheme.colors['on-tertiary-container'],
    paddingVertical: 8,
    paddingHorizontal: 12,
    textTransform: "uppercase",
  },
  aiPreviewButton: {
    backgroundColor: AppTheme.colors['primary-container'],
    borderRadius: AppTheme.rounded.DEFAULT,
    paddingVertical: 13,
    alignItems: "center",
    marginBottom: 12,
  },
  disabledButton: {
    opacity: 0.75,
  },
  aiPreviewButtonText: {
    ...AppTheme.typography['label-md'],
    color: AppTheme.colors['on-primary'],
  },
  outfitRow: {
    marginBottom: 10,
  },
  outfitLabel: {
    ...AppTheme.typography['label-sm'],
    color: AppTheme.colors['on-tertiary-container'],
    textTransform: "uppercase",
    marginBottom: 2,
  },
  outfitValue: {
    ...AppTheme.typography['body-md'],
    color: AppTheme.colors['on-surface'],
  },

  reasonBox: {
    backgroundColor: AppTheme.colors['secondary-container'],
    borderRadius: AppTheme.rounded.lg,
    padding: 14,
    marginTop: 14,
    borderLeftWidth: 4,
    borderLeftColor: AppTheme.colors['on-tertiary-container'],
  },
  reasonTitle: {
    ...AppTheme.typography['label-md'],
    color: AppTheme.colors['primary-container'],
    marginBottom: 6,
  },
  reasonText: {
    ...AppTheme.typography['body-md'],
    color: AppTheme.colors['on-surface-variant'],
  },
  smallReason: {
    ...AppTheme.typography['body-md'],
    color: AppTheme.colors['on-surface-variant'],
    marginTop: 8,
  },
  wardrobeBadge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: AppTheme.colors.background,
    borderWidth: 1,
    borderColor: AppTheme.colors['outline-variant'],
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: AppTheme.rounded.DEFAULT,
    marginBottom: 8,
    gap: 4,
  },
  wardrobeBadgeText: {
    ...AppTheme.typography['label-sm'],
    color: AppTheme.colors['on-tertiary-container'],
  },
  scoresGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 12,
  },
  scorePill: {
    flex: 1,
    minWidth: "22%",
    backgroundColor: AppTheme.colors['surface-variant'],
    borderRadius: AppTheme.rounded.md,
    paddingVertical: 8,
    paddingHorizontal: 4,
    alignItems: "center",
  },
  scoreLabel: {
    ...AppTheme.typography['label-sm'],
    color: AppTheme.colors.outline,
    textTransform: "uppercase",
    marginBottom: 2,
  },
  scoreValue: {
    ...AppTheme.typography['label-md'],
    color: AppTheme.colors['primary-container'],
  },
});
