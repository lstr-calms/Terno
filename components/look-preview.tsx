import React from "react";
import {
  Image,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
  type ImageSourcePropType,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { AppTheme } from "@/constants/theme";
import type { Recommendation } from "@/types/terno";

type IconName = React.ComponentProps<typeof Ionicons>["name"];

type PreviewPiece = {
  key: keyof Recommendation;
  label: string;
  fallback: string;
  icon: IconName;
};

type LookPreviewProps = {
  imageUri?: string | null;
  recommendation: Recommendation;
};

const previewPieces: PreviewPiece[] = [
  {
    key: "top",
    label: "Top",
    fallback: "Uploaded item",
    icon: "shirt-outline",
  },
  {
    key: "bottom",
    label: "Bottom",
    fallback: "Not needed",
    icon: "body-outline",
  },
  {
    key: "shoes",
    label: "Shoes",
    fallback: "Not specified",
    icon: "footsteps-outline",
  },
  {
    key: "outerwear",
    label: "Layer",
    fallback: "Optional",
    icon: "albums-outline",
  },
  {
    key: "accessories",
    label: "Extras",
    fallback: "Optional",
    icon: "watch-outline",
  },
];

const colorMatches: { pattern: RegExp; color: string }[] = [
  { pattern: /\bblack\b/i, color: "#1E252B" },
  { pattern: /\bwhite\b/i, color: "#F7F4EC" },
  { pattern: /\bcream|ivory|beige|khaki|tan\b/i, color: "#D7BE93" },
  { pattern: /\bbrown|leather\b/i, color: "#7A4B2A" },
  { pattern: /\bdenim|jeans|blue|navy\b/i, color: "#2F5F89" },
  { pattern: /\bgray|grey|silver\b/i, color: "#9A9A94" },
  { pattern: /\bgreen|olive\b/i, color: "#667647" },
  { pattern: /\bred|burgundy|maroon\b/i, color: "#8F2F2F" },
  { pattern: /\bpink|rose\b/i, color: "#D8909D" },
  { pattern: /\byellow|gold\b/i, color: "#C99B2E" },
];

function inferAccentColor(value?: string) {
  const matchedColor = colorMatches.find(({ pattern }) =>
    pattern.test(value || "")
  );

  return matchedColor?.color || AppTheme.colors.accent;
}

function previewValue(value: Recommendation[keyof Recommendation], fallback: string) {
  if (typeof value !== "string" || value.trim().length === 0) {
    return fallback;
  }

  return value.trim();
}

export function LookPreview({ imageUri, recommendation }: LookPreviewProps) {
  const { width } = useWindowDimensions();
  const isCompactPhone = width < 390;
  const imageSource: ImageSourcePropType | undefined = imageUri
    ? { uri: imageUri }
    : undefined;

  return (
    <View
      style={[
        styles.previewCard,
        isCompactPhone && styles.previewCardCompact,
      ]}
    >
      <View
        style={[
          styles.photoPanel,
          isCompactPhone && styles.photoPanelCompact,
        ]}
      >
        {imageSource ? (
          <Image source={imageSource} style={styles.photo} />
        ) : (
          <View style={styles.photoPlaceholder}>
            <Ionicons
              name="image-outline"
              size={28}
              color={AppTheme.colors.accent}
            />
            <Text style={styles.photoPlaceholderText}>No photo</Text>
          </View>
        )}

        <View style={styles.uploadedBadge}>
          <Text style={styles.uploadedBadgeText}>
            {recommendation.use_uploaded_item_as || "Uploaded item"}
          </Text>
        </View>
      </View>

      <View style={styles.pieceGrid}>
        {previewPieces.map((piece) => {
          const value = previewValue(recommendation[piece.key], piece.fallback);
          const accentColor = inferAccentColor(value);

          return (
            <View key={piece.key} style={styles.pieceTile}>
              <View
                style={[
                  styles.iconCircle,
                  { borderColor: accentColor, backgroundColor: `${accentColor}18` },
                ]}
              >
                <Ionicons name={piece.icon} size={18} color={accentColor} />
              </View>
              <View style={styles.pieceTextColumn}>
                <Text style={styles.pieceLabel}>{piece.label}</Text>
                <Text style={styles.pieceValue} numberOfLines={2}>
                  {value}
                </Text>
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  previewCard: {
    width: "100%",
    backgroundColor: AppTheme.colors['secondary-container'],
    borderRadius: AppTheme.rounded.lg,
    borderWidth: 1,
    borderColor: AppTheme.colors['outline-variant'],
    padding: AppTheme.spacing.md,
    marginBottom: AppTheme.spacing.sm,
    flexDirection: "row",
    gap: 12,
  },
  previewCardCompact: {
    flexDirection: "column",
    padding: AppTheme.spacing.sm,
  },
  photoPanel: {
    width: 108,
    height: 156,
    borderRadius: AppTheme.rounded.md,
    backgroundColor: AppTheme.colors['surface-variant'],
    overflow: "hidden",
    borderWidth: 1,
    borderColor: AppTheme.colors['outline-variant'],
  },
  photoPanelCompact: {
    width: "100%",
    height: 150,
  },
  photo: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  photoPlaceholder: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
  },
  photoPlaceholderText: {
    color: AppTheme.colors.outline,
    ...AppTheme.typography['label-sm'],
    marginTop: 6,
    textAlign: "center",
  },
  uploadedBadge: {
    position: "absolute",
    left: 8,
    right: 8,
    bottom: 8,
    backgroundColor: AppTheme.colors['primary-container'],
    borderRadius: AppTheme.rounded.full,
    paddingVertical: 5,
    paddingHorizontal: 8,
  },
  uploadedBadgeText: {
    color: AppTheme.colors['on-primary'],
    ...AppTheme.typography['label-sm'],
    textAlign: "center",
  },
  pieceGrid: {
    flex: 1,
    gap: 8,
  },
  pieceTile: {
    minHeight: 44,
    backgroundColor: AppTheme.colors.surface,
    borderRadius: AppTheme.rounded.md,
    borderWidth: 1,
    borderColor: AppTheme.colors['outline-variant'],
    paddingVertical: 7,
    paddingHorizontal: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  iconCircle: {
    width: 32,
    height: 32,
    borderRadius: AppTheme.rounded.full,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  pieceTextColumn: {
    flex: 1,
    minWidth: 0,
  },
  pieceLabel: {
    color: AppTheme.colors['on-tertiary-container'],
    ...AppTheme.typography['label-sm'],
    marginBottom: 1,
  },
  pieceValue: {
    color: AppTheme.colors['primary-container'],
    ...AppTheme.typography['label-md'],
  },
});
