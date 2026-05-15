import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import { FullLookPreview } from "@/components/full-look-preview";
import { GENERATE_LOOK_PREVIEW_URL } from "@/constants/api";
import { AppTheme } from "@/constants/theme";
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
                    <Ionicons name="shirt" size={12} color="#735C00" />
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
  aiPreviewBox: {
    backgroundColor: "#FBF9F4",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#EEE4D4",
    overflow: "hidden",
    marginBottom: 12,
  },
  aiPreviewImage: {
    width: "100%",
    aspectRatio: 4 / 5,
    resizeMode: "cover",
  },
  aiPreviewCaption: {
    color: "#735C00",
    fontSize: 12,
    fontWeight: "900",
    paddingVertical: 8,
    paddingHorizontal: 12,
    textTransform: "uppercase",
  },
  aiPreviewButton: {
    backgroundColor: AppTheme.colors.primary,
    borderRadius: 16,
    paddingVertical: 13,
    alignItems: "center",
    marginBottom: 12,
  },
  disabledButton: {
    opacity: 0.75,
  },
  aiPreviewButtonText: {
    color: AppTheme.colors.primaryTextOnDark,
    fontSize: 14,
    fontWeight: "900",
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
  smallReason: {
    fontSize: 14,
    color: "#5F5548",
    marginTop: 8,
    lineHeight: 21,
  },
  wardrobeBadge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: "#FBF9F4",
    borderWidth: 1,
    borderColor: "#E7DCC8",
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
    marginBottom: 8,
    gap: 4,
  },
  wardrobeBadgeText: {
    fontSize: 11,
    color: "#735C00",
    fontWeight: "800",
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
    backgroundColor: AppTheme.colors.surfaceMuted,
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 4,
    alignItems: "center",
  },
  scoreLabel: {
    fontSize: 10,
    color: AppTheme.colors.mutedText,
    fontWeight: "800",
    textTransform: "uppercase",
    marginBottom: 2,
  },
  scoreValue: {
    fontSize: 14,
    color: AppTheme.colors.primary,
    fontWeight: "900",
  },
});
