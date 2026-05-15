import React from "react";
import {
  Image,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

import {
  getLookPreviewItems,
  type CatalogCategory,
  type LookPreviewItem,
} from "@/constants/look-catalog";
import { AppTheme } from "@/constants/theme";
import type { Recommendation } from "@/types/terno";

type IconName = React.ComponentProps<typeof Ionicons>["name"];

type FullLookPreviewProps = {
  imageUri?: string | null;
  recommendation: Recommendation;
};

const categoryIcons: Record<CatalogCategory, IconName> = {
  top: "shirt-outline",
  bottom: "body-outline",
  shoes: "footsteps-outline",
  outerwear: "albums-outline",
  accessories: "watch-outline",
};

export function FullLookPreview({
  imageUri,
  recommendation,
}: FullLookPreviewProps) {
  const { width } = useWindowDimensions();
  const isCompactPhone = width < 390;
  const previewItems = getLookPreviewItems(recommendation, imageUri);
  const uploadedItem =
    previewItems.find((item) => item.isUploadedItem) || previewItems[0];
  const catalogItems = previewItems.filter((item) => item !== uploadedItem);

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Full Look Preview</Text>

      <View
        style={[
          styles.collage,
          isCompactPhone && styles.collageCompact,
        ]}
      >
        <PreviewTile
          item={uploadedItem}
          large
          compact={isCompactPhone}
        />

        <View style={styles.catalogGrid}>
          {catalogItems.map((item) => (
            <PreviewTile key={item.category} item={item} compact={isCompactPhone} />
          ))}
        </View>
      </View>
    </View>
  );
}

function PreviewTile({
  item,
  large = false,
  compact = false,
}: {
  item: LookPreviewItem;
  large?: boolean;
  compact?: boolean;
}) {
  const iconName = categoryIcons[item.category];
  const title = item.isUploadedItem
    ? "Uploaded item"
    : item.catalogItem?.name || item.description;
  const showImage = Boolean(item.imageUri);

  return (
    <View
      style={[
        styles.tile,
        large && styles.largeTile,
        compact && large && styles.largeTileCompact,
      ]}
    >
      <View style={styles.imageFrame}>
        {showImage ? (
          <Image source={{ uri: item.imageUri }} style={styles.tileImage} />
        ) : (
          <View style={styles.placeholder}>
            <Ionicons
              name={item.isOptional ? "add-circle-outline" : iconName}
              size={large ? 34 : 24}
              color={AppTheme.colors.accent}
            />
            <Text style={styles.placeholderText}>
              {item.isOptional ? "Optional" : "No match"}
            </Text>
          </View>
        )}

        <View
          style={[
            styles.statusBadge,
            item.isUploadedItem && styles.uploadedBadge,
          ]}
        >
          <Text style={styles.statusBadgeText}>
            {item.isUploadedItem ? "Your item" : item.label}
          </Text>
        </View>
      </View>

      <View style={styles.tileCopy}>
        <Text style={styles.tileLabel}>{item.label}</Text>
        <Text style={styles.tileTitle} numberOfLines={large ? 2 : 1}>
          {title}
        </Text>
        {!large && (
          <Text style={styles.tileDescription} numberOfLines={2}>
            {item.description}
          </Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    backgroundColor: AppTheme.colors['secondary-container'],
    borderRadius: AppTheme.rounded.lg,
    borderWidth: 1,
    borderColor: AppTheme.colors['outline-variant'],
    padding: AppTheme.spacing.md,
    marginBottom: AppTheme.spacing.sm,
  },
  heading: {
    color: AppTheme.colors['primary-container'],
    ...AppTheme.typography['headline-md'],
    marginBottom: 10,
  },
  collage: {
    flexDirection: "row",
    gap: 10,
  },
  collageCompact: {
    flexDirection: "column",
  },
  catalogGrid: {
    flex: 1,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  tile: {
    backgroundColor: AppTheme.colors.surface,
    borderRadius: AppTheme.rounded.md,
    borderWidth: 1,
    borderColor: AppTheme.colors['outline-variant'],
    overflow: "hidden",
    flexBasis: "48%",
    flexGrow: 1,
    minWidth: 104,
  },
  largeTile: {
    width: 120,
    flexGrow: 0,
    flexBasis: 120,
  },
  largeTileCompact: {
    width: "100%",
    flexBasis: "auto",
  },
  imageFrame: {
    height: 92,
    backgroundColor: AppTheme.colors['surface-variant'],
    overflow: "hidden",
  },
  tileImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  placeholder: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 8,
  },
  placeholderText: {
    color: AppTheme.colors.outline,
    ...AppTheme.typography['label-sm'],
    marginTop: 4,
    textAlign: "center",
  },
  statusBadge: {
    position: "absolute",
    left: 6,
    bottom: 6,
    backgroundColor: AppTheme.colors['on-tertiary-container'],
    borderRadius: AppTheme.rounded.full,
    paddingVertical: 4,
    paddingHorizontal: 7,
  },
  uploadedBadge: {
    backgroundColor: AppTheme.colors['primary-container'],
  },
  statusBadgeText: {
    color: AppTheme.colors['on-primary'],
    ...AppTheme.typography['label-sm'],
  },
  tileCopy: {
    padding: 8,
  },
  tileLabel: {
    color: AppTheme.colors['on-tertiary-container'],
    ...AppTheme.typography['label-sm'],
    marginBottom: 2,
  },
  tileTitle: {
    color: AppTheme.colors['on-surface'],
    ...AppTheme.typography['label-md'],
  },
  tileDescription: {
    color: AppTheme.colors['on-surface-variant'],
    ...AppTheme.typography['body-md'],
    marginTop: 2,
  },
});
