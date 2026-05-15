import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Alert,
  TextInput,
  Modal,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import { AppTheme } from "@/constants/theme";
import { TernoIcon } from "@/components/TernoIcon";
import type { WardrobeItem } from "@/types/terno";

const CATEGORIES = ["Top", "Bottom", "Shoes", "Outerwear", "Accessories", "Dress"];

export default function WardrobeScreen() {
  const [wardrobe, setWardrobe] = useState<WardrobeItem[]>([]);
  const [modalVisible, setModalVisible] = useState(false);

  // Form State
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [category, setCategory] = useState("Top");
  const [mainColor, setMainColor] = useState("");
  const [style, setStyle] = useState("");
  const [formality, setFormality] = useState("");
  const [notes, setNotes] = useState("");

  const loadWardrobe = async () => {
    try {
      const data = await AsyncStorage.getItem("terno_wardrobe");
      if (data) {
        setWardrobe(JSON.parse(data));
      }
    } catch (error) {
      console.error("Failed to load wardrobe:", error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadWardrobe();
    }, [])
  );

  const saveWardrobeItem = async () => {
    if (!imageUri) {
      Alert.alert("Missing Image", "Please take a photo or upload an image of the item.");
      return;
    }
    if (!mainColor || !style) {
      Alert.alert("Missing Details", "Please provide at least a color and style.");
      return;
    }

    const newItem: WardrobeItem = {
      id: Date.now().toString(),
      imageUri,
      category,
      mainColor,
      style,
      formality,
      notes,
      createdAt: new Date().toISOString(),
    };

    try {
      const updatedWardrobe = [newItem, ...wardrobe];
      await AsyncStorage.setItem("terno_wardrobe", JSON.stringify(updatedWardrobe));
      setWardrobe(updatedWardrobe);
      resetForm();
      setModalVisible(false);
    } catch (error) {
      console.error("Failed to save item:", error);
      Alert.alert("Error", "Could not save your wardrobe item.");
    }
  };

  const deleteItem = async (id: string) => {
    Alert.alert("Delete Item", "Are you sure you want to remove this item from your wardrobe?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            const updated = wardrobe.filter((item) => item.id !== id);
            await AsyncStorage.setItem("terno_wardrobe", JSON.stringify(updated));
            setWardrobe(updated);
          } catch (error) {
            console.error("Failed to delete item:", error);
          }
        },
      },
    ]);
  };

  const resetForm = () => {
    setImageUri(null);
    setCategory("Top");
    setMainColor("");
    setStyle("");
    setFormality("");
    setNotes("");
  };

  const pickImage = async (useCamera: boolean) => {
    let result;
    if (useCamera) {
      const permission = await ImagePicker.requestCameraPermissionsAsync();
      if (!permission.granted) {
        Alert.alert("Permission Required", "Please allow camera access.");
        return;
      }
      result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 5],
        quality: 0.8,
      });
    } else {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert("Permission Required", "Please allow gallery access.");
        return;
      }
      result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [4, 5],
        quality: 0.8,
      });
    }

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.kicker}>My Closet</Text>
          <Text style={styles.title}>Wardrobe</Text>
        </View>
        <TouchableOpacity
          style={styles.addButtonHeader}
          onPress={() => {
            resetForm();
            setModalVisible(true);
          }}
        >
          <Ionicons name="add" size={24} color={AppTheme.colors.primaryTextOnDark} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {wardrobe.length === 0 ? (
          <View style={styles.emptyCard}>
            <TernoIcon source={require('@/assets/icons/tabs/wardrobe-inactive.png')} size={48} color={AppTheme.colors.accent} />
            <Text style={styles.emptyTitle}>Your wardrobe is empty</Text>
            <Text style={styles.emptyText}>
              Add your clothing items here so Terno can recommend outfits using what you already own.
            </Text>
            <TouchableOpacity
              style={styles.emptyButton}
              onPress={() => {
                resetForm();
                setModalVisible(true);
              }}
            >
              <Text style={styles.emptyButtonText}>Add First Item</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.grid}>
            {wardrobe.map((item) => (
              <View key={item.id} style={styles.itemCard}>
                {item.imageUri ? (
                  <Image source={{ uri: item.imageUri }} style={styles.itemImage} />
                ) : (
                  <View style={styles.itemImagePlaceholder}>
                    <TernoIcon source={require('@/assets/icons/tabs/wardrobe-inactive.png')} size={32} color={AppTheme.colors.borderMuted} />
                  </View>
                )}
                <View style={styles.itemInfo}>
                  <Text style={styles.itemCategory}>{item.category}</Text>
                  <Text style={styles.itemDetails} numberOfLines={1}>
                    {item.mainColor} • {item.style}
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => deleteItem(item.id)}
                >
                  <Ionicons name="trash-outline" size={16} color={AppTheme.colors.danger} />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      <Modal visible={modalVisible} animationType="slide" presentationStyle="pageSheet">
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Add Item</Text>
            <TouchableOpacity onPress={saveWardrobeItem}>
              <Text style={styles.saveText}>Save</Text>
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.modalScroll}>
            <View style={styles.imageSection}>
              {imageUri ? (
                <Image source={{ uri: imageUri }} style={styles.previewImage} />
              ) : (
                <View style={styles.previewPlaceholder}>
                  <TernoIcon source={require('@/assets/icons/features/style-this-item.png')} size={48} color={AppTheme.colors.borderMuted} />
                  <Text style={styles.previewText}>No Image Selected</Text>
                </View>
              )}
              <View style={styles.imageButtons}>
                <TouchableOpacity style={styles.imageBtn} onPress={() => pickImage(true)}>
                  <TernoIcon source={require('@/assets/icons/features/take-photo.png')} size={20} color={AppTheme.colors.primary} />
                  <Text style={styles.imageBtnText}>Camera</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.imageBtn} onPress={() => pickImage(false)}>
                  <TernoIcon source={require('@/assets/icons/features/style-this-item.png')} size={20} color={AppTheme.colors.primary} />
                  <Text style={styles.imageBtnText}>Gallery</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.formSection}>
              <Text style={styles.label}>Category</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipRow}>
                {CATEGORIES.map((cat) => (
                  <TouchableOpacity
                    key={cat}
                    style={[styles.chip, category === cat && styles.chipActive]}
                    onPress={() => setCategory(cat)}
                  >
                    {cat === "Top" && (
                      <TernoIcon 
                        source={require('@/assets/icons/categories/top.png')}
                        size={16}
                        color={category === cat ? AppTheme.colors.primaryTextOnDark : AppTheme.colors.bodyText}
                        style={{ marginRight: 6 }}
                      />
                    )}
                    <Text style={[styles.chipText, category === cat && styles.chipTextActive]}>
                      {cat}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <Text style={styles.label}>Main Color</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. Navy Blue, White"
                value={mainColor}
                onChangeText={setMainColor}
                placeholderTextColor={AppTheme.colors.mutedText}
              />

              <Text style={styles.label}>Style</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. Casual, Streetwear, Minimalist"
                value={style}
                onChangeText={setStyle}
                placeholderTextColor={AppTheme.colors.mutedText}
              />

              <Text style={styles.label}>Formality (Optional)</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. Casual, Smart Casual, Formal"
                value={formality}
                onChangeText={setFormality}
                placeholderTextColor={AppTheme.colors.mutedText}
              />

              <Text style={styles.label}>Notes (Optional)</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="e.g. Favorite shirt, fits slightly loose"
                value={notes}
                onChangeText={setNotes}
                multiline
                numberOfLines={3}
                placeholderTextColor={AppTheme.colors.mutedText}
              />
            </View>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AppTheme.colors.background,
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: AppTheme.spacing['margin-mobile'],
    paddingBottom: AppTheme.spacing.md,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: AppTheme.colors.background,
    borderBottomWidth: 1,
    borderBottomColor: AppTheme.colors['outline-variant'],
  },
  kicker: {
    ...AppTheme.typography['label-sm'],
    color: AppTheme.colors['on-tertiary-container'],
    textTransform: "uppercase",
    marginBottom: AppTheme.spacing.xs,
  },
  title: {
    ...AppTheme.typography['headline-lg-mobile'],
    color: AppTheme.colors['primary-container'],
  },
  addButtonHeader: {
    backgroundColor: AppTheme.colors['primary-container'],
    width: 48,
    height: 48,
    borderRadius: AppTheme.rounded.full,
    justifyContent: "center",
    alignItems: "center",
  },
  scrollContent: {
    padding: AppTheme.spacing['margin-mobile'],
    flexGrow: 1,
  },
  emptyCard: {
    backgroundColor: AppTheme.colors['secondary-container'],
    borderRadius: AppTheme.rounded.xl,
    padding: 32,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: AppTheme.colors['outline-variant'],
    marginTop: AppTheme.spacing.lg,
  },
  emptyTitle: {
    ...AppTheme.typography['headline-md'],
    color: AppTheme.colors['primary-container'],
    marginTop: AppTheme.spacing['margin-mobile'],
    marginBottom: AppTheme.spacing.base,
  },
  emptyText: {
    ...AppTheme.typography['body-md'],
    color: AppTheme.colors['on-surface-variant'],
    textAlign: "center",
    marginBottom: AppTheme.spacing.md,
  },
  emptyButton: {
    backgroundColor: AppTheme.colors['primary-container'],
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: AppTheme.rounded.DEFAULT,
  },
  emptyButtonText: {
    ...AppTheme.typography['label-md'],
    color: AppTheme.colors['on-primary'],
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  itemCard: {
    width: "48%",
    backgroundColor: AppTheme.colors.surface,
    borderRadius: AppTheme.rounded.lg,
    borderWidth: 1,
    borderColor: AppTheme.colors['outline-variant'],
    marginBottom: AppTheme.spacing['margin-mobile'],
    overflow: "hidden",
  },
  itemImage: {
    width: "100%",
    aspectRatio: 4 / 5,
    backgroundColor: AppTheme.colors['surface-variant'],
  },
  itemImagePlaceholder: {
    width: "100%",
    aspectRatio: 4 / 5,
    backgroundColor: AppTheme.colors['surface-variant'],
    justifyContent: "center",
    alignItems: "center",
  },
  itemInfo: {
    padding: AppTheme.spacing.sm,
  },
  itemCategory: {
    ...AppTheme.typography['label-sm'],
    color: AppTheme.colors['on-tertiary-container'],
    textTransform: "uppercase",
    marginBottom: AppTheme.spacing.xs,
  },
  itemDetails: {
    ...AppTheme.typography['label-md'],
    color: AppTheme.colors['on-surface'],
    textTransform: "capitalize",
  },
  deleteButton: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: AppTheme.colors.surface,
    width: 28,
    height: 28,
    borderRadius: AppTheme.rounded.full,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: AppTheme.colors['outline-variant'],
  },
  modalContainer: {
    flex: 1,
    backgroundColor: AppTheme.colors.background,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: AppTheme.spacing.gutter,
    borderBottomWidth: 1,
    borderBottomColor: AppTheme.colors['outline-variant'],
    backgroundColor: AppTheme.colors.background,
  },
  cancelText: {
    ...AppTheme.typography['label-md'],
    color: AppTheme.colors['on-surface-variant'],
  },
  modalTitle: {
    ...AppTheme.typography['headline-md'],
    color: AppTheme.colors['primary-container'],
  },
  saveText: {
    ...AppTheme.typography['label-md'],
    color: AppTheme.colors['primary-container'],
  },
  modalScroll: {
    padding: AppTheme.spacing.gutter,
  },
  imageSection: {
    alignItems: "center",
    marginBottom: AppTheme.spacing.md,
  },
  previewImage: {
    width: 200,
    height: 250,
    borderRadius: AppTheme.rounded.lg,
    marginBottom: AppTheme.spacing['margin-mobile'],
    backgroundColor: AppTheme.colors['surface-variant'],
  },
  previewPlaceholder: {
    width: 200,
    height: 250,
    borderRadius: AppTheme.rounded.lg,
    backgroundColor: AppTheme.colors['surface-variant'],
    justifyContent: "center",
    alignItems: "center",
    marginBottom: AppTheme.spacing['margin-mobile'],
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: AppTheme.colors['outline-variant'],
  },
  previewText: {
    ...AppTheme.typography['body-md'],
    color: AppTheme.colors.outline,
    marginTop: AppTheme.spacing.base,
  },
  imageButtons: {
    flexDirection: "row",
    gap: AppTheme.spacing.sm,
  },
  imageBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: AppTheme.colors.surface,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: AppTheme.rounded.full,
    borderWidth: 1,
    borderColor: AppTheme.colors['outline-variant'],
    gap: 6,
  },
  imageBtnText: {
    ...AppTheme.typography['label-md'],
    color: AppTheme.colors['primary-container'],
  },
  formSection: {
    paddingBottom: AppTheme.spacing.xl,
  },
  label: {
    ...AppTheme.typography['label-md'],
    color: AppTheme.colors['primary-container'],
    marginBottom: AppTheme.spacing.base,
    marginTop: AppTheme.spacing['margin-mobile'],
  },
  input: {
    backgroundColor: "transparent",
    borderBottomWidth: 1,
    borderBottomColor: AppTheme.colors['outline-variant'],
    paddingVertical: AppTheme.spacing.sm,
    paddingHorizontal: 0,
    ...AppTheme.typography['body-md'],
    color: AppTheme.colors['on-surface'],
  },
  textArea: {
    borderWidth: 1,
    borderColor: AppTheme.colors['outline-variant'],
    borderRadius: AppTheme.rounded.md,
    paddingHorizontal: AppTheme.spacing.sm,
    height: 100,
    textAlignVertical: "top",
  },
  chipRow: {
    flexDirection: "row",
    marginBottom: AppTheme.spacing.base,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: AppTheme.colors.surface,
    borderWidth: 1,
    borderColor: AppTheme.colors['outline-variant'],
    borderRadius: AppTheme.rounded.full,
    marginRight: AppTheme.spacing.base,
  },
  chipActive: {
    backgroundColor: AppTheme.colors['primary-container'],
    borderColor: AppTheme.colors['primary-container'],
  },
  chipText: {
    ...AppTheme.typography['label-md'],
    color: AppTheme.colors['on-surface-variant'],
  },
  chipTextActive: {
    color: AppTheme.colors['on-primary'],
  },
});
