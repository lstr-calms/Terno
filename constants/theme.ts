/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { Platform } from 'react-native';

const tintColorLight = '#0a7ea4';
const tintColorDark = '#fff';

export const Colors = {
  light: {
    text: '#11181C',
    background: '#fff',
    tint: tintColorLight,
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: '#ECEDEE',
    background: '#151718',
    tint: tintColorDark,
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: tintColorDark,
  },
};

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});

export const AppTheme = {
  colors: {
    surface: '#fbf9fa',
    'surface-dim': '#dbd9db',
    'surface-bright': '#fbf9fa',
    'surface-container-lowest': '#ffffff',
    'surface-container-low': '#f5f3f4',
    'surface-container': '#efedef',
    'surface-container-high': '#e9e7e9',
    'surface-container-highest': '#e4e2e3',
    'on-surface': '#1b1c1d',
    'on-surface-variant': '#43474c',
    'inverse-surface': '#303032',
    'inverse-on-surface': '#f2f0f2',
    outline: '#74777d',
    'outline-variant': '#c4c6cd',
    'surface-tint': '#4e6073',
    primary: '#011323',
    'on-primary': '#ffffff',
    'primary-container': '#162839',
    'on-primary-container': '#7d8fa4',
    'inverse-primary': '#b6c8df',
    secondary: '#615e56',
    'on-secondary': '#ffffff',
    'secondary-container': '#e7e2d7',
    'on-secondary-container': '#67645c',
    tertiary: '#1e0f00',
    'on-tertiary': '#ffffff',
    'tertiary-container': '#362309',
    'on-tertiary-container': '#a68967',
    error: '#ba1a1a',
    'on-error': '#ffffff',
    'error-container': '#ffdad6',
    'on-error-container': '#93000a',
    'primary-fixed': '#d2e4fb',
    'primary-fixed-dim': '#b6c8df',
    'on-primary-fixed': '#0a1d2d',
    'on-primary-fixed-variant': '#37485b',
    'secondary-fixed': '#e7e2d7',
    'secondary-fixed-dim': '#cac6bc',
    'on-secondary-fixed': '#1d1c15',
    'on-secondary-fixed-variant': '#49473f',
    'tertiary-fixed': '#ffddb7',
    'tertiary-fixed-dim': '#e2c19b',
    'on-tertiary-fixed': '#291802',
    'on-tertiary-fixed-variant': '#594226',
    background: '#fbf9fa',
    'on-background': '#1b1c1d',
    'surface-variant': '#e4e2e3',

    // Legacy Aliases for backwards compatibility
    surfaceWarm: '#e7e2d7',
    surfaceMuted: '#e4e2e3',
    border: '#c4c6cd',
    borderMuted: '#e4e2e3',
    borderSoft: '#efedef',
    primaryTextOnDark: '#ffffff',
    accent: '#a68967',
    bodyText: '#43474c',
    mutedText: '#74777d',
    tabInactive: '#74777d',
    danger: '#ba1a1a',
    dangerSurface: '#ffdad6',
  },
  typography: {
    'headline-xl': {
      fontFamily: 'HankenGrotesk_700Bold',
      fontSize: 40,
      lineHeight: 48,
      letterSpacing: -0.8,
    },
    'headline-lg': {
      fontFamily: 'HankenGrotesk_600SemiBold',
      fontSize: 32,
      lineHeight: 40,
      letterSpacing: -0.32,
    },
    'headline-md': {
      fontFamily: 'HankenGrotesk_600SemiBold',
      fontSize: 24,
      lineHeight: 32,
    },
    'body-lg': {
      fontFamily: 'BeVietnamPro_400Regular',
      fontSize: 18,
      lineHeight: 28,
    },
    'body-md': {
      fontFamily: 'BeVietnamPro_400Regular',
      fontSize: 16,
      lineHeight: 24,
    },
    'label-md': {
      fontFamily: 'BeVietnamPro_500Medium',
      fontSize: 14,
      lineHeight: 20,
      letterSpacing: 0.28,
    },
    'label-sm': {
      fontFamily: 'BeVietnamPro_600SemiBold',
      fontSize: 12,
      lineHeight: 16,
      letterSpacing: 0.6,
    },
    'headline-xl-mobile': {
      fontFamily: 'HankenGrotesk_700Bold',
      fontSize: 32,
      lineHeight: 40,
    },
    'headline-lg-mobile': {
      fontFamily: 'HankenGrotesk_600SemiBold',
      fontSize: 26,
      lineHeight: 32,
    },
  },
  rounded: {
    sm: 4,
    DEFAULT: 8,
    md: 12,
    lg: 16,
    xl: 24,
    full: 9999,
    
    // Legacy aliases
    chip: 9999,
    small: 16,
    medium: 18,
    large: 20,
    card: 16,
    hero: 24,
  },
  spacing: {
    base: 8,
    xs: 4,
    sm: 12,
    md: 24,
    lg: 48,
    xl: 80,
    gutter: 20,
    'margin-mobile': 16,
    'margin-desktop': 64,
    
    // Legacy aliases
    screen: 16,
    card: 12,
    hero: 24,
  },
};
