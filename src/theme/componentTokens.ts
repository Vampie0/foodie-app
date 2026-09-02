import { radius } from './radius';
import { spacing } from './spacing';
import { dimensions } from './dimensions';
import { duration } from './motion';

export const componentTokens = {
  button: {
    radiusSm: radius.sm,
    radiusMd: radius.md,
    radiusLg: radius.lg,
    heightSm: dimensions.buttonSmall,
    heightMd: dimensions.buttonMedium,
    heightLg: dimensions.buttonLarge,
    paddingHorizontalSm: spacing[3],
    paddingHorizontalMd: spacing[4],
    paddingHorizontalLg: spacing[6],
    pressOpacity: 0.82,
    pressScale: 0.97,
    pressDuration: duration.fast,
  },
  input: {
    radius: radius.md,
    height: dimensions.inputHeight,
    paddingHorizontal: spacing[4],
    borderWidth: 1.5,
    focusBorderWidth: 2,
  },
  card: {
    radius: radius.lg,
    paddingSm: spacing[3],
    paddingMd: spacing[4],
    paddingLg: spacing[5],
  },
  badge: {
    radiusSm: radius.xs,
    radiusMd: radius.sm,
    radiusLg: radius.full,
    paddingHorizontal: spacing[2],
    paddingVertical: 3,
  },
  chip: {
    radius: radius.sm,
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
    height: 36,
  },
  avatar: {
    radiusXs: radius.sm,
    radiusMd: radius.lg,
    radiusFull: radius.full,
  },
  bottomSheet: {
    radius: radius['3xl'],
    handleWidth: dimensions.bottomSheetHandleWidth,
    handleHeight: dimensions.bottomSheetHandleHeight,
    handleRadius: radius.full,
  },
} as const;
