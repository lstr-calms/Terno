import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  Switch,
  Share,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import { FullLookPreview } from "@/components/full-look-preview";
import { TernoIcon } from "@/components/TernoIcon";
import { ANALYZE_CLOTHING_URL, GENERATE_LOOK_PREVIEW_URL } from "@/constants/api";
import { AppTheme } from "@/constants/theme";
import type { AnalysisResponse, Recommendation, SavedTerno } from "@/types/terno";

const occasions = [
  "Pasyal", "School", "Work", "Date", "Party", "Interview", 
  "Family Gathering", "Church", "Graduation", "Fiesta", "Rainy Day", "Commute"
];

export default function HomeScreen() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedOccasion, setSelectedOccasion] = useState("Pasyal");
  const [useWardrobe, setUseWardrobe] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [aiPreviewImages, setAiPreviewImages] = useState<Record<number, string>>({});
  const [aiPreviewLoading, setAiPreviewLoading] = useState<Record<number, boolean>>({});

  const handleSaveTerno = async (recommendation: Recommendation, index: number) => {
    try {
      const savedItem: SavedTerno = {
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
        occasion: selectedOccasion,
        imageUri: selectedImage,
        detectedItem: detectedItem,
        recommendation : recommendation,
        lookNumber: index + 1,
        usedWardrobeMode: useWardrobe,
      };

      const existingData = await AsyncStorage.getItem("saved_ternos");
      const existingTernos: SavedTerno[] = existingData ? JSON.parse(existingData) : [];
      const updatedTernos = [savedItem, ...existingTernos];
      await AsyncStorage.setItem("saved_ternos", JSON.stringify(updatedTernos));

      Alert.alert("Saved!", "This terno has been saved to your collection. ");
    } catch (error) {
      console.error("Save error:", error);
      Alert.alert("Error", "Could not save this item. Please try again.");
    }
  };

  const pickImageFromGallery = async () => {
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permissionResult.granted) {
      Alert.alert(
        "Permission required",
        "Please allow access to your photo library."
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [4, 5],
      quality: 0.8,
    });

    if (!result.canceled) {
      setSelectedImage(result.assets[0].uri);
      setAnalysisResult(null);
    }
  };

  const takePhoto = async () => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();

    if (!permissionResult.granted) {
      Alert.alert("Permission required", "Please allow camera access.");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 5],
      quality: 0.8,
    });

    if (!result.canceled) {
      setSelectedImage(result.assets[0].uri);
      setAnalysisResult(null);
    }
  };

  const handleAnalyze = async (regenerate: boolean = false) => {
    if (!selectedImage) {
      Alert.alert("No image selected", "Please upload or take a clothing photo.");
      return;
    }

    try {
      setLoading(true);
      if (!regenerate) {
        setAnalysisResult(null);
        setAiPreviewImages({});
        setAiPreviewLoading({});
      }

      const formData = new FormData();

      formData.append("image", {
        uri: selectedImage,
        name: "clothing.jpg",
        type: "image/jpeg",
      } as any);

      formData.append("occasion", selectedOccasion);

      if (regenerate) {
        formData.append("regenerate", "true");
      }

      if (useWardrobe) {
        const wardrobeData = await AsyncStorage.getItem("terno_wardrobe");
        if (wardrobeData) {
          formData.append("wardrobe", wardrobeData);
        }
      }

      const savedPreferences = await AsyncStorage.getItem("terno_preferences");
      if (savedPreferences) {
        formData.append("preferences", savedPreferences);
      }
      
      const response = await fetch(ANALYZE_CLOTHING_URL, {
        method: "POST",
        body: formData,
      });

      const text = await response.text();

      if (!response.ok) {
        console.error("Backend error:", response.status, text);
        Alert.alert(
          "Analysis failed",
          "Terno could not analyze this image right now. Please try again in a moment."
        );
        return;
      }

      let data: AnalysisResponse;
      try {
        data = JSON.parse(text);
      } catch (parseError) {
        console.error("Invalid analysis response:", parseError, text);
        Alert.alert(
          "Unexpected response",
          "The backend returned a response Terno could not read. Please try again."
        );
        return;
      }

      setAnalysisResult(data);
    } catch (error: any) {
      console.error("Analyze error:", error);
      Alert.alert(
        "Connection error",
        "Could not connect to the Terno backend. Check that the backend is running and your phone is on the same network."
      );
    } finally {
      setLoading(false);
    }
  };

  const shareOutfit = async (rec: Recommendation) => {
    try {
      const message = `Check out this outfit from Terno!\n\n` +
        `Theme: ${rec.title}\n` +
        `Top: ${rec.top || "N/A"}\n` +
        `Bottom: ${rec.bottom || "N/A"}\n` +
        `Shoes: ${rec.shoes || "N/A"}\n\n` +
        `Why it works: ${rec.why_this_is_best || rec.style_reasoning || "It looks great!"}`;
      
      await Share.share({ message });
    } catch (error) {
      console.error("Share error:", error);
    }
  };

  const handleReset = () => {
    setSelectedImage(null);
    setSelectedOccasion("Casual");
    setAnalysisResult(null);
    setAiPreviewImages({});
    setAiPreviewLoading({});
  };

  const handleGenerateLookPreview = async (
    recommendation: Recommendation,
    index: number
  ) => {
    if (!selectedImage) {
      Alert.alert("No image selected", "Please upload or take a clothing photo first.");
      return;
    }

    try {
      setAiPreviewLoading((current) => ({ ...current, [index]: true }));

      const formData = new FormData();
      formData.append("image", {
        uri: selectedImage,
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
        console.error("AI preview error:", response.status, text);
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
        [index]: data.image_data_uri,
      }));
    } catch (error) {
      console.error("Generate AI preview error:", error);
      Alert.alert(
        "Connection error",
        "Could not connect to the Terno backend for AI preview generation."
      );
    } finally {
      setAiPreviewLoading((current) => ({ ...current, [index]: false }));
    }
  };

  const detectedItem = analysisResult?.detected_item;
  const recommendations = analysisResult?.recommendations || [];

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.heroCard}>
        <Text style={styles.logo}>Terno</Text>
        <Text style={styles.subtitle}>
          Style your clothes with confidence.
        </Text>
      </View>

      <View style={styles.imageContainer}>
        {selectedImage ? (
          <Image source={{ uri: selectedImage }} style={styles.imagePreview} />
        ) : (
          <View style={styles.placeholder}>
            <TernoIcon source={require('@/assets/icons/features/style-this-item.png')} size={48} color={AppTheme.colors.accent} style={{marginBottom: 16}} />
            <Text style={styles.placeholderTitle}>Upload your clothing item</Text>
            <Text style={styles.placeholderText}>
              Take a photo or choose from your gallery.
            </Text>
          </View>
        )}
      </View>

      <View style={styles.buttonRow}>
        <TouchableOpacity style={styles.secondaryButton} onPress={takePhoto}>
          <TernoIcon source={require('@/assets/icons/features/take-photo.png')} size={20} color={AppTheme.colors.primary} />
          <Text style={styles.secondaryButtonText}>Take Photo</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={pickImageFromGallery}
        >
          <TernoIcon source={require('@/assets/icons/features/style-this-item.png')} size={20} color={AppTheme.colors.primary} />
          <Text style={styles.secondaryButtonText}>Upload Image</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionTitle}>Choose Occasion</Text>
        <Text style={styles.sectionHint}>Swipe for more</Text>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.occasionScroll}>
        {occasions.map((occasion) => (
          <TouchableOpacity
            key={occasion}
            style={[
              styles.occasionChip,
              selectedOccasion === occasion && styles.selectedOccasionChip,
            ]}
            onPress={() => {
              setSelectedOccasion(occasion);
              setAnalysisResult(null);
            }}
          >
            {occasion === "Fiesta" && (
              <TernoIcon 
                source={require('@/assets/icons/occasions/fiesta.png')} 
                size={16} 
                color={selectedOccasion === occasion ? AppTheme.colors.primaryTextOnDark : AppTheme.colors.bodyText}
                style={{ marginRight: 6 }}
              />
            )}
            <Text
              style={[
                styles.occasionText,
                selectedOccasion === occasion && styles.selectedOccasionText,
              ]}
            >
              {occasion}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View style={styles.wardrobeToggleContainer}>
        <Text style={styles.wardrobeToggleLabel}>Use My Wardrobe</Text>
        <Switch
          value={useWardrobe}
          onValueChange={(val) => {
            setUseWardrobe(val);
            setAnalysisResult(null);
          }}
          trackColor={{ false: AppTheme.colors.borderMuted, true: AppTheme.colors.primary }}
          thumbColor={AppTheme.colors.surface}
        />
      </View>

      <TouchableOpacity
        style={[styles.analyzeButton, loading && styles.disabledButton]}
        onPress={() => handleAnalyze(false)}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#FFF8E7" />
        ) : (
          <Text style={styles.analyzeButtonText}>Style This Item</Text>
        )}
      </TouchableOpacity>

      {loading && (
        <View style={styles.loadingCard}>
          <ActivityIndicator color="#162839" />
          <Text style={styles.loadingText}>
            Finding your best terno...
          </Text>
        </View>
      )}

      {detectedItem && (
        <View style={styles.resultContainer}>
          <View style={styles.resultTopRow}>
            <Text style={styles.resultHeader}>Detected Item</Text>
            <TouchableOpacity onPress={handleReset}>
              <Text style={styles.resetText}>Try another</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.detectedCard}>
            <View style={styles.cardAccent} />

            <Text style={styles.detectedTitle}>
              {detectedItem.main_color} {detectedItem.category}
            </Text>

            <Text style={styles.detectedDescription}>
              {detectedItem.description || "A clothing item ready to be styled."}
            </Text>

            <View style={styles.detailsGrid}>
              <Detail label="Pattern" value={detectedItem.pattern} />
              <Detail label="Material" value={detectedItem.material} />
              <Detail label="Fit" value={detectedItem.fit} />
              <Detail label="Style" value={detectedItem.style} />
              <Detail label="Formality" value={detectedItem.formality} />
            </View>
          </View>

          <Text style={styles.resultHeader}>Best Outfit Combinations</Text>

          {recommendations.map((rec: Recommendation, index: number) => (
            <View key={index} style={styles.recommendationCard}>
              <View style={styles.lookBadge}>
                <Text style={styles.lookBadgeText}>Look {index + 1}</Text>
              </View>

              <Text style={styles.recommendationTitle}>{rec.title}</Text>

              <FullLookPreview imageUri={selectedImage} recommendation={rec} />

              {aiPreviewImages[index] && (
                <View style={styles.aiPreviewBox}>
                  <Image
                    source={{ uri: aiPreviewImages[index] }}
                    style={styles.aiPreviewImage}
                  />
                  <Text style={styles.aiPreviewCaption}>AI generated preview</Text>
                </View>
              )}

              <TouchableOpacity
                style={[
                  styles.aiPreviewButton,
                  aiPreviewLoading[index] && styles.disabledButton,
                ]}
                onPress={() => handleGenerateLookPreview(rec, index)}
                disabled={aiPreviewLoading[index]}
              >
                {aiPreviewLoading[index] ? (
                  <ActivityIndicator color={AppTheme.colors.primaryTextOnDark} />
                ) : (
                  <Text style={styles.aiPreviewButtonText}>
                    {aiPreviewImages[index] ? "Regenerate AI Preview" : "Generate AI Preview"}
                  </Text>
                )}
              </TouchableOpacity>

              <View style={styles.outfitList}>
                <OutfitRow label="Top" value={rec.top || "Use uploaded item if applicable"} />
                <OutfitRow label="Bottom" value={rec.bottom || "Not needed"} />
                <OutfitRow label="Shoes" value={rec.shoes || "Not specified"} />
                <OutfitRow label="Outerwear" value={rec.outerwear || "Optional"} />
                <OutfitRow label="Accessories" value={rec.accessories || "Optional"} />
              </View>

              <View style={styles.scoresGrid}>
                {rec.compatibility_score !== undefined && <ScorePill label="Match" score={rec.compatibility_score} />}
                {rec.color_score !== undefined && <ScorePill label="Color" score={rec.color_score} />}
                {rec.style_score !== undefined && <ScorePill label="Style" score={rec.style_score} />}
                {rec.occasion_score !== undefined && <ScorePill label="Occasion" score={rec.occasion_score} />}
              </View>

              <View style={styles.reasonBox}>
                <Text style={styles.reasonTitle}>Why this works</Text>
                <Text style={styles.reasonText}>
                  {rec.why_this_is_best ||
                    rec.style_reasoning ||
                    "This combination matches the uploaded item."}
                </Text>
              </View>

              <Text style={styles.smallReason}>
                <Text style={styles.bold}>Color: </Text>
                {rec.color_reasoning || "The colors are balanced and easy to wear."}
              </Text>

              <Text style={styles.smallReason}>
                <Text style={styles.bold}>Style: </Text>
                {rec.style_reasoning || "The pieces work well together for the occasion."}
              </Text>

              {rec.occasion_reasoning && (
                <Text style={styles.smallReason}>
                  <Text style={styles.bold}>Occasion: </Text>
                  {rec.occasion_reasoning}
                </Text>
              )}

              {rec.beginner_tip && (
                <View style={styles.tipBox}>
                  <Text style={styles.tipText}>
                    <Text style={styles.boldTip}>Tip: </Text>
                    {rec.beginner_tip}
                  </Text>
                </View>
              )}

              <View style={styles.avoidBox}>
                <Text style={styles.avoidText}>
                  <Text style={styles.boldAvoid}>Avoid: </Text>
                  {rec.avoid ||
                    "Avoid overly clashing colors or mismatched formality."}
                </Text>
              </View>

              <View style={styles.actionButtonsRow}>
                <TouchableOpacity 
                  style={styles.saveButtonHalf}
                  onPress={() => handleSaveTerno(rec, index)}
                >
                  <Text style={styles.saveButtonText}>Save</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.shareButtonHalf}
                  onPress={() => shareOutfit(rec)}
                >
                  <Ionicons name="share-outline" size={18} color="#735C00" />
                  <Text style={styles.shareButtonText}>Share</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}

          <TouchableOpacity
            style={[styles.regenerateButton, loading && styles.disabledButton]}
            onPress={() => handleAnalyze(true)}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={AppTheme.colors.primary} />
            ) : (
              <>
                <TernoIcon source={require('@/assets/icons/features/generate-more-looks.png')} size={20} color={AppTheme.colors.primary} />
                <Text style={styles.regenerateButtonText}>Generate More Looks</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
}

function Detail({ label, value }: { label: string; value?: string }) {
  return (
    <View style={styles.detailPill}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value || "Not specified"}</Text>
    </View>
  );
}

function OutfitRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.outfitRow}>
      <Text style={styles.outfitLabel}>{label}</Text>
      <Text style={styles.outfitValue}>{value}</Text>
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
    alignItems: "center",
  },

  heroCard: {
    width: "100%",
    backgroundColor: AppTheme.colors.surfaceWarm,
    borderRadius: AppTheme.radii.hero,
    padding: AppTheme.spacing.hero,
    marginTop: 42,
    marginBottom: 24,
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
    fontSize: 42,
    fontWeight: "900",
    color: AppTheme.colors.primary,
  },
  subtitle: {
    fontSize: 16,
    color: AppTheme.colors.bodyText,
    marginTop: 8,
    lineHeight: 23,
  },

  imageContainer: {
    width: "100%",
    height: 360,
    borderRadius: AppTheme.radii.hero,
    overflow: "hidden",
    backgroundColor: AppTheme.colors.surfaceMuted,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: AppTheme.colors.borderMuted,
  },
  imagePreview: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  placeholder: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 28,
  },
  placeholderTitle: {
    color: AppTheme.colors.primary,
    fontSize: 20,
    fontWeight: "900",
    textAlign: "center",
    marginBottom: 8,
  },
  placeholderText: {
    color: AppTheme.colors.mutedText,
    fontSize: 14,
    textAlign: "center",
    lineHeight: 21,
  },

  buttonRow: {
    flexDirection: "row",
    gap: 12,
    width: "100%",
    marginBottom: 28,
  },
  secondaryButton: {
    flex: 1,
    flexDirection: "row",
    gap: 8,
    justifyContent: "center",
    backgroundColor: AppTheme.colors.surface,
    borderWidth: 1,
    borderColor: AppTheme.colors.borderMuted,
    paddingVertical: 15,
    borderRadius: 18,
    alignItems: "center",
  },
  secondaryButtonText: {
    color: AppTheme.colors.primary,
    fontWeight: "800",
  },

  sectionHeaderRow: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: AppTheme.colors.primary,
  },
  sectionHint: {
    fontSize: 13,
    color: AppTheme.colors.accent,
    fontWeight: "700",
  },

  occasionScroll: {
    paddingRight: AppTheme.spacing.screen,
    gap: 10,
    marginBottom: 20,
  },
  occasionChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 999,
    backgroundColor: AppTheme.colors.surface,
    borderWidth: 1,
    borderColor: AppTheme.colors.borderMuted,
  },
  selectedOccasionChip: {
    backgroundColor: AppTheme.colors.primary,
    borderColor: AppTheme.colors.primary,
  },
  occasionText: {
    color: AppTheme.colors.bodyText,
    fontWeight: "800",
  },
  selectedOccasionText: {
    color: AppTheme.colors.primaryTextOnDark,
  },

  wardrobeToggleContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: AppTheme.colors.surface,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: AppTheme.colors.borderMuted,
    marginBottom: 20,
    width: "100%",
  },
  wardrobeToggleLabel: {
    fontSize: 15,
    fontWeight: "800",
    color: AppTheme.colors.primary,
  },

  analyzeButton: {
    width: "100%",
    backgroundColor: AppTheme.colors.primary,
    paddingVertical: 18,
    borderRadius: 20,
    alignItems: "center",
    marginTop: 2,
  },
  disabledButton: {
    opacity: 0.75,
  },
  analyzeButtonText: {
    color: AppTheme.colors.primaryTextOnDark,
    fontSize: 16,
    fontWeight: "900",
  },

  loadingCard: {
    marginTop: 18,
    width: "100%",
    backgroundColor: "#F4EFE4",
    borderRadius: 20,
    padding: 18,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E7DCC8",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 14,
    color: "#5F5548",
    textAlign: "center",
    fontWeight: "700",
  },

  resultContainer: {
    width: "100%",
    marginTop: 28,
  },
  resultTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  resultHeader: {
    fontSize: 23,
    fontWeight: "900",
    color: "#162839",
    marginBottom: 12,
    marginTop: 8,
  },
  resetText: {
    color: "#735C00",
    fontWeight: "900",
    fontSize: 14,
  },

  detectedCard: {
    width: "100%",
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 18,
    borderWidth: 1,
    borderColor: "#E7DCC8",
    marginBottom: 24,
    overflow: "hidden",
  },
  cardAccent: {
    height: 6,
    backgroundColor: "#735C00",
    borderRadius: 999,
    marginBottom: 16,
  },
  detectedTitle: {
    fontSize: 22,
    fontWeight: "900",
    color: "#162839",
    marginBottom: 8,
    textTransform: "capitalize",
  },
  detectedDescription: {
    fontSize: 14,
    color: "#5F5548",
    lineHeight: 21,
    marginBottom: 16,
  },

  detailsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  detailPill: {
    backgroundColor: "#FBF9F4",
    borderRadius: 16,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: "#EEE4D4",
    minWidth: "45%",
    flex: 1,
  },
  detailLabel: {
    fontSize: 11,
    color: "#735C00",
    fontWeight: "900",
    textTransform: "uppercase",
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 13,
    color: "#162839",
    fontWeight: "700",
    textTransform: "capitalize",
  },

  recommendationCard: {
    width: "100%",
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 18,
    borderWidth: 1,
    borderColor: "#E7DCC8",
    marginBottom: 18,
  },
  lookBadge: {
    alignSelf: "flex-start",
    backgroundColor: "#F4EFE4",
    borderRadius: 999,
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginBottom: 10,
  },
  lookBadgeText: {
    fontSize: 12,
    fontWeight: "900",
    color: "#735C00",
    textTransform: "uppercase",
  },
  recommendationTitle: {
    fontSize: 20,
    fontWeight: "900",
    color: "#162839",
    marginBottom: 16,
  },

  outfitList: {
    backgroundColor: "#FBF9F4",
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: "#EEE4D4",
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
  aiPreviewButtonText: {
    color: AppTheme.colors.primaryTextOnDark,
    fontSize: 14,
    fontWeight: "900",
  },
  outfitRow: {
    marginBottom: 10,
  },
  outfitLabel: {
    fontSize: 12,
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
    marginBottom: 12,
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
    marginBottom: 8,
    lineHeight: 21,
  },
  bold: {
    fontWeight: "900",
    color: "#162839",
  },

  avoidBox: {
    backgroundColor: "#FFF3EF",
    borderRadius: 16,
    padding: 13,
    marginTop: 8,
  },
  avoidText: {
    fontSize: 14,
    color: "#721E12",
    lineHeight: 21,
  },
  boldAvoid: {
    fontWeight: "900",
    color: "#721E12",
  },
  tipBox: {
    backgroundColor: "#E8F4F8",
    borderRadius: 16,
    padding: 13,
    marginTop: 8,
  },
  tipText: {
    fontSize: 14,
    color: "#1A4C5E",
    lineHeight: 21,
  },
  boldTip: {
    fontWeight: "900",
    color: "#1A4C5E",
  },

  actionButtonsRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 14,
  },
  saveButtonHalf: {
    flex: 1,
    backgroundColor: "#735C00",
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: "center",
  },
  saveButtonText: {
    color: "#FFF8E7",
    fontSize: 14,
    fontWeight: "900",
  },
  shareButtonHalf: {
    flex: 1,
    backgroundColor: "#FBF9F4",
    borderWidth: 1,
    borderColor: "#E7DCC8",
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 6,
  },
  shareButtonText: {
    color: "#735C00",
    fontSize: 14,
    fontWeight: "900",
  },
  regenerateButton: {
    width: "100%",
    flexDirection: "row",
    gap: 8,
    justifyContent: "center",
    backgroundColor: AppTheme.colors.surface,
    borderWidth: 1,
    borderColor: AppTheme.colors.borderMuted,
    paddingVertical: 16,
    borderRadius: 20,
    alignItems: "center",
    marginTop: 10,
    marginBottom: 20,
  },
  regenerateButtonText: {
    color: AppTheme.colors.primary,
    fontSize: 15,
    fontWeight: "900",
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
