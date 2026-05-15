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
            <Ionicons name="shirt-outline" size={48} color={AppTheme.colors.accent} />
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
                    <Ionicons name="shirt" size={32} color={AppTheme.colors.borderMuted} />
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
                  <Ionicons name="image-outline" size={48} color={AppTheme.colors.borderMuted} />
                  <Text style={styles.previewText}>No Image Selected</Text>
                </View>
              )}
              <View style={styles.imageButtons}>
                <TouchableOpacity style={styles.imageBtn} onPress={() => pickImage(true)}>
                  <Ionicons name="camera" size={20} color={AppTheme.colors.primary} />
                  <Text style={styles.imageBtnText}>Camera</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.imageBtn} onPress={() => pickImage(false)}>
                  <Ionicons name="images" size={20} color={AppTheme.colors.primary} />
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
    paddingHorizontal: AppTheme.spacing.screen,
    paddingBottom: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: AppTheme.colors.surfaceWarm,
    borderBottomWidth: 1,
    borderBottomColor: AppTheme.colors.border,
  },
  kicker: {
    color: AppTheme.colors.accent,
    fontSize: 12,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 1.2,
    marginBottom: 4,
  },
  title: {
    fontSize: 32,
    fontWeight: "900",
    color: AppTheme.colors.primary,
  },
  addButtonHeader: {
    backgroundColor: AppTheme.colors.primary,
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  scrollContent: {
    padding: AppTheme.spacing.screen,
    flexGrow: 1,
  },
  emptyCard: {
    backgroundColor: AppTheme.colors.surface,
    borderRadius: AppTheme.radii.card,
    padding: 32,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: AppTheme.colors.borderMuted,
    marginTop: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "900",
    color: AppTheme.colors.primary,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: AppTheme.colors.bodyText,
    textAlign: "center",
    lineHeight: 21,
    marginBottom: 24,
  },
  emptyButton: {
    backgroundColor: AppTheme.colors.primary,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 999,
  },
  emptyButtonText: {
    color: AppTheme.colors.primaryTextOnDark,
    fontWeight: "900",
    fontSize: 15,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  itemCard: {
    width: "48%",
    backgroundColor: AppTheme.colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: AppTheme.colors.border,
    marginBottom: 16,
    overflow: "hidden",
  },
  itemImage: {
    width: "100%",
    aspectRatio: 4 / 5,
    backgroundColor: AppTheme.colors.surfaceMuted,
  },
  itemImagePlaceholder: {
    width: "100%",
    aspectRatio: 4 / 5,
    backgroundColor: AppTheme.colors.surfaceMuted,
    justifyContent: "center",
    alignItems: "center",
  },
  itemInfo: {
    padding: 12,
  },
  itemCategory: {
    fontSize: 12,
    fontWeight: "900",
    color: AppTheme.colors.accent,
    textTransform: "uppercase",
    marginBottom: 4,
  },
  itemDetails: {
    fontSize: 14,
    fontWeight: "700",
    color: AppTheme.colors.primary,
    textTransform: "capitalize",
  },
  deleteButton: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: AppTheme.colors.surface,
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: AppTheme.colors.background,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: AppTheme.colors.border,
    backgroundColor: AppTheme.colors.surface,
  },
  cancelText: {
    color: AppTheme.colors.bodyText,
    fontSize: 16,
    fontWeight: "600",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: AppTheme.colors.primary,
  },
  saveText: {
    color: AppTheme.colors.primary,
    fontSize: 16,
    fontWeight: "900",
  },
  modalScroll: {
    padding: 20,
  },
  imageSection: {
    alignItems: "center",
    marginBottom: 24,
  },
  previewImage: {
    width: 200,
    height: 250,
    borderRadius: 16,
    marginBottom: 16,
    backgroundColor: AppTheme.colors.surfaceMuted,
  },
  previewPlaceholder: {
    width: 200,
    height: 250,
    borderRadius: 16,
    backgroundColor: AppTheme.colors.surfaceMuted,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: AppTheme.colors.borderMuted,
  },
  previewText: {
    color: AppTheme.colors.mutedText,
    marginTop: 8,
    fontWeight: "600",
  },
  imageButtons: {
    flexDirection: "row",
    gap: 12,
  },
  imageBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: AppTheme.colors.surface,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: AppTheme.colors.border,
    gap: 6,
  },
  imageBtnText: {
    color: AppTheme.colors.primary,
    fontWeight: "700",
  },
  formSection: {
    paddingBottom: 40,
  },
  label: {
    fontSize: 14,
    fontWeight: "900",
    color: AppTheme.colors.primary,
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    backgroundColor: AppTheme.colors.surface,
    borderWidth: 1,
    borderColor: AppTheme.colors.border,
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    color: AppTheme.colors.primary,
  },
  textArea: {
    height: 100,
    textAlignVertical: "top",
  },
  chipRow: {
    flexDirection: "row",
    marginBottom: 8,
  },
  chip: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: AppTheme.colors.surface,
    borderWidth: 1,
    borderColor: AppTheme.colors.border,
    borderRadius: 999,
    marginRight: 8,
  },
  chipActive: {
    backgroundColor: AppTheme.colors.primary,
    borderColor: AppTheme.colors.primary,
  },
  chipText: {
    color: AppTheme.colors.bodyText,
    fontWeight: "700",
  },
  chipTextActive: {
    color: AppTheme.colors.primaryTextOnDark,
  },
});
