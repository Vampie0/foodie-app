import React from 'react';
import { Text, TextProps, TextStyle } from 'react-native';
import { useAppTheme } from '../../providers/ThemeProvider';
import { TypographyVariant, typographyVariants } from '../../theme/typography';

interface AppTextProps extends TextProps {
  variant?: TypographyVariant;
  color?: string;
  align?: TextStyle['textAlign'];
  weight?: '400' | '500' | '600' | '700' | '800';
  children?: React.ReactNode;
}

export function AppText({
  variant = 'body',
  color,
  align,
  weight,
  style,
  children,
  ...rest
}: AppTextProps) {
  const theme = useAppTheme();
  const variantStyle = typographyVariants[variant];

  return (
    <Text
      style={[
        {
          fontSize: variantStyle.fontSize,
          fontWeight: weight ?? variantStyle.fontWeight,
          lineHeight: variantStyle.lineHeight,
          letterSpacing: variantStyle.letterSpacing,
          color: color ?? theme.colors.text,
          textAlign: align,
        },
        style,
      ]}
      {...rest}
    >
      {children}
    </Text>
  );
}
