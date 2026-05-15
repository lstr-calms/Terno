export type DetectedItem = {
  category: string;
  main_color: string;
  secondary_colors?: string[];
  pattern?: string;
  material?: string;
  fit?: string;
  style?: string;
  formality?: string;
  description?: string;
};

export type WardrobeItem = {
  id: string;
  imageUri: string | null;
  category: string;
  mainColor: string;
  style: string;
  formality?: string;
  notes?: string;
  createdAt: string;
};

export type Recommendation = {
  title: string;
  occasion?: string;
  use_uploaded_item_as?: string;
  top?: string;
  bottom?: string;
  shoes?: string;
  outerwear?: string;
  accessories?: string;
  compatibility_score?: number;
  color_score?: number;
  occasion_score?: number;
  style_score?: number;
  color_reasoning?: string;
  style_reasoning?: string;
  occasion_reasoning?: string;
  beginner_tip?: string;
  why_this_is_best?: string;
  avoid?: string;
  used_wardrobe_items?: string[];
};

export type AnalysisResponse = {
  status?: string;
  occasion?: string;
  detected_item?: DetectedItem;
  recommendations?: Recommendation[];
};

export type SavedTerno = {
  id: string;
  createdAt: string;
  occasion: string;
  imageUri: string | null;
  detectedItem?: DetectedItem;
  recommendation: Recommendation;
  lookNumber: number;
  usedWardrobeMode?: boolean;
};

export type TernoPreferences = {
  styles: string[];
  colors: string[];
  occasions: string[];
  fits: string[];
  updatedAt?: string;
};
