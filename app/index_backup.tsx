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
} from "react-native";
import * as ImagePicker from "expo-image-picker";

const occasions = ["Casual", "School", "Work", "Date", "Party", "Interview"];

export default function HomeScreen() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedOccasion, setSelectedOccasion] = useState("Casual");
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const API_URL = "http://192.168.100.7:8000/analyze-clothing";

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

  const handleAnalyze = async () => {
    if (!selectedImage) {
      Alert.alert("No image selected", "Please upload or take a clothing photo.");
      return;
    }

    try {
      setLoading(true);
      setAnalysisResult(null);

      const formData = new FormData();

      formData.append("image", {
        uri: selectedImage,
        name: "clothing.jpg",
        type: "image/jpeg",
      } as any);

      formData.append("occasion", selectedOccasion);

      const response = await fetch(API_URL, {
        method: "POST",
        body: formData,
      });

      const text = await response.text();

      if (!response.ok) {
        Alert.alert("Backend Error", `Status: ${response.status}\n\n${text}`);
        return;
      }

      const data = JSON.parse(text);
      setAnalysisResult(data);
    } catch (error: any) {
      console.error("Analyze error:", error);
      Alert.alert(
        "Connection Error",
        error.message || "Could not connect to backend."
      );
    } finally {
      setLoading(false);
    }
  };

  const detectedItem = analysisResult?.detected_item;
  const recommendations = analysisResult?.recommendations || [];

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.logo}>Terno</Text>
      <Text style={styles.subtitle}>
        Upload a clothing item and let Terno find the best outfit combinations.
      </Text>

      <View style={styles.imageContainer}>
        {selectedImage ? (
          <Image source={{ uri: selectedImage }} style={styles.imagePreview} />
        ) : (
          <View style={styles.placeholder}>
            <Text style={styles.placeholderText}>
              No clothing image selected
            </Text>
          </View>
        )}
      </View>

      <View style={styles.buttonRow}>
        <TouchableOpacity style={styles.secondaryButton} onPress={takePhoto}>
          <Text style={styles.secondaryButtonText}>Take Photo</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={pickImageFromGallery}
        >
          <Text style={styles.secondaryButtonText}>Upload Image</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionTitle}>Choose Occasion</Text>

      <View style={styles.occasionContainer}>
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
      </View>

      <TouchableOpacity
        style={[styles.analyzeButton, loading && styles.disabledButton]}
        onPress={handleAnalyze}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text style={styles.analyzeButtonText}>Style This Item</Text>
        )}
      </TouchableOpacity>

      {loading && (
        <Text style={styles.loadingText}>
          Analyzing your clothing and building outfit combinations...
        </Text>
      )}

      {detectedItem && (
        <View style={styles.resultContainer}>
          <Text style={styles.resultHeader}>Detected Item</Text>

          <View style={styles.detectedCard}>
            <Text style={styles.detectedTitle}>
              {detectedItem.main_color} {detectedItem.category}
            </Text>

            <Text style={styles.resultText}>
              <Text style={styles.bold}>Description: </Text>
              {detectedItem.description || "Not specified"}
            </Text>

            <Text style={styles.resultText}>
              <Text style={styles.bold}>Pattern: </Text>
              {detectedItem.pattern || "Not specified"}
            </Text>

            <Text style={styles.resultText}>
              <Text style={styles.bold}>Material: </Text>
              {detectedItem.material || "Not specified"}
            </Text>

            <Text style={styles.resultText}>
              <Text style={styles.bold}>Fit: </Text>
              {detectedItem.fit || "Not specified"}
            </Text>

            <Text style={styles.resultText}>
              <Text style={styles.bold}>Style: </Text>
              {detectedItem.style || "Not specified"}
            </Text>

            <Text style={styles.resultText}>
              <Text style={styles.bold}>Formality: </Text>
              {detectedItem.formality || "Not specified"}
            </Text>
          </View>

          <Text style={styles.resultHeader}>Best Outfit Combinations</Text>

          {recommendations.map((rec: any, index: number) => (
            <View key={index} style={styles.recommendationCard}>
              <Text style={styles.cardNumber}>Look {index + 1}</Text>
              <Text style={styles.recommendationTitle}>{rec.title}</Text>

              <Text style={styles.resultText}>
                <Text style={styles.bold}>Use uploaded item as: </Text>
                {rec.use_uploaded_item_as || "Main clothing piece"}
              </Text>

              <Text style={styles.resultText}>
                <Text style={styles.bold}>Top: </Text>
                {rec.top || "Use uploaded item if applicable"}
              </Text>

              <Text style={styles.resultText}>
                <Text style={styles.bold}>Bottom: </Text>
                {rec.bottom || "Not needed"}
              </Text>

              <Text style={styles.resultText}>
                <Text style={styles.bold}>Shoes: </Text>
                {rec.shoes || "Not specified"}
              </Text>

              <Text style={styles.resultText}>
                <Text style={styles.bold}>Outerwear: </Text>
                {rec.outerwear || "Optional"}
              </Text>

              <Text style={styles.resultText}>
                <Text style={styles.bold}>Accessories: </Text>
                {rec.accessories || "Optional"}
              </Text>

              <View style={styles.reasonBox}>
                <Text style={styles.reasonTitle}>Why this works</Text>
                <Text style={styles.resultText}>
                  {rec.why_this_is_best ||
                    rec.style_reasoning ||
                    "This combination matches the uploaded item."}
                </Text>
              </View>

              <Text style={styles.resultText}>
                <Text style={styles.bold}>Color reasoning: </Text>
                {rec.color_reasoning || "Not specified"}
              </Text>

              <Text style={styles.resultText}>
                <Text style={styles.bold}>Style reasoning: </Text>
                {rec.style_reasoning || "Not specified"}
              </Text>

              <Text style={styles.avoidText}>
                <Text style={styles.bold}>Avoid: </Text>
                {rec.avoid || "Avoid overly clashing colors or mismatched formality."}
              </Text>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "#F8F7F4",
    padding: 24,
    alignItems: "center",
  },
  logo: {
    fontSize: 32,
    fontWeight: "800",
    color: "#222",
    marginTop: 48,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginTop: 8,
    marginBottom: 28,
  },
  imageContainer: {
    width: "100%",
    height: 360,
    borderRadius: 24,
    overflow: "hidden",
    backgroundColor: "#EDEAE4",
    marginBottom: 20,
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
    padding: 20,
  },
  placeholderText: {
    color: "#888",
    fontSize: 16,
    textAlign: "center",
  },
  buttonRow: {
    flexDirection: "row",
    gap: 12,
    width: "100%",
    marginBottom: 28,
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#DDD",
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: "center",
  },
  secondaryButtonText: {
    color: "#222",
    fontWeight: "700",
  },
  sectionTitle: {
    alignSelf: "flex-start",
    fontSize: 18,
    fontWeight: "700",
    color: "#222",
    marginBottom: 12,
  },
  occasionContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    width: "100%",
    marginBottom: 28,
  },
  occasionChip: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 999,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#DDD",
  },
  selectedOccasionChip: {
    backgroundColor: "#222",
    borderColor: "#222",
  },
  occasionText: {
    color: "#333",
    fontWeight: "600",
  },
  selectedOccasionText: {
    color: "#FFFFFF",
  },
  analyzeButton: {
    width: "100%",
    backgroundColor: "#222",
    paddingVertical: 18,
    borderRadius: 18,
    alignItems: "center",
    marginTop: 8,
  },
  disabledButton: {
    opacity: 0.7,
  },
  analyzeButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "800",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 14,
    color: "#666",
    textAlign: "center",
  },
  resultContainer: {
    width: "100%",
    marginTop: 28,
  },
  resultHeader: {
    fontSize: 22,
    fontWeight: "800",
    color: "#222",
    marginBottom: 12,
    marginTop: 8,
  },
  detectedCard: {
    width: "100%",
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: "#E5E5E5",
    marginBottom: 22,
  },
  detectedTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#222",
    marginBottom: 12,
    textTransform: "capitalize",
  },
  recommendationCard: {
    width: "100%",
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: "#E5E5E5",
    marginBottom: 18,
  },
  cardNumber: {
    fontSize: 13,
    fontWeight: "800",
    color: "#777",
    marginBottom: 4,
    textTransform: "uppercase",
  },
  recommendationTitle: {
    fontSize: 19,
    fontWeight: "800",
    color: "#222",
    marginBottom: 14,
  },
  resultText: {
    fontSize: 14,
    color: "#444",
    marginBottom: 8,
    lineHeight: 21,
  },
  bold: {
    fontWeight: "800",
    color: "#222",
  },
  reasonBox: {
    backgroundColor: "#F8F7F4",
    borderRadius: 14,
    padding: 14,
    marginVertical: 10,
  },
  reasonTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: "#222",
    marginBottom: 6,
  },
  avoidText: {
    fontSize: 14,
    color: "#7A3E3E",
    marginTop: 6,
    lineHeight: 21,
  },
});