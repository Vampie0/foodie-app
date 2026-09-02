import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { Image, ImageProps, ImageStyle } from 'expo-image';
import { useAppTheme } from '../../providers/ThemeProvider';
import { radius } from '../../theme/radius';

interface AppImageProps extends Omit<ImageProps, 'style'> {
  width?: number | string;
  height?: number | string;
  borderRadius?: number;
  style?: ImageStyle;
  containerStyle?: ViewStyle;
  fallbackIcon?: React.ReactNode;
}

export function AppImage({
  width,
  height,
  borderRadius = 0,
  style,
  containerStyle,
  fallbackIcon,
  source,
  ...rest
}: AppImageProps) {
  const theme = useAppTheme();

  return (
    <View
      style={[
        {
          width: width as number,
          height: height as number,
          backgroundColor: theme.colors.surfaceSubtle,
          borderRadius,
          overflow: 'hidden',
        },
        containerStyle,
      ]}
    >
      <Image
        source={source}
        style={[
          {
            width: '100%',
            height: '100%',
          },
          style,
        ]}
        contentFit="cover"
        transition={200}
        cachePolicy="memory-disk"
        placeholder={{ blurhash: 'LGF5?xYk^6#M@-5c,1J5@[or[Q6.' }}
        {...rest}
      />
    </View>
  );
}

export function Avatar({
  size = 48,
  source,
  borderRadius,
  ...rest
}: AppImageProps & { size?: number }) {
  return (
    <AppImage
      source={source}
      width={size}
      height={size}
      borderRadius={borderRadius ?? size / 2}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({});
