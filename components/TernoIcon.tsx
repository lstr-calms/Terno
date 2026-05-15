import React from 'react';
import { Image, ImageStyle, StyleProp, ImageSourcePropType } from 'react-native';

interface TernoIconProps {
  source: ImageSourcePropType;
  size?: number;
  color?: string;
  style?: StyleProp<ImageStyle>;
}

export function TernoIcon({ source, size = 24, color, style }: TernoIconProps) {
  return (
    <Image
      source={source}
      style={[
        { width: size, height: size },
        color ? { tintColor: color } : null,
        style,
      ]}
      resizeMode="contain"
    />
  );
}
