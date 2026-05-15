import Constants from "expo-constants";

const DEFAULT_API_BASE_URL = "http://192.168.100.7:8000";

const configuredApiBaseUrl =
  process.env.EXPO_PUBLIC_API_BASE_URL ||
  Constants.expoConfig?.extra?.apiBaseUrl;

export const API_BASE_URL = (configuredApiBaseUrl || DEFAULT_API_BASE_URL).replace(
  /\/$/,
  ""
);

export const ANALYZE_CLOTHING_URL = `${API_BASE_URL}/analyze-clothing`;
export const GENERATE_LOOK_PREVIEW_URL = `${API_BASE_URL}/generate-look-preview`;
