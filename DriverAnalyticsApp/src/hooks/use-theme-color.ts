/**
 * Learn more about light and dark modes:
 * https://docs.expo.dev/guides/color-schemes/
 */

import { colors } from '../theme';

export function useThemeColor(
  props: { light?: string; dark?: string },
  colorName: keyof typeof colors
) {
  // App does not support theme switching yet
  const theme = 'light';

  const overrideColor = props[theme];
  if (overrideColor) {
    return overrideColor;
  }

  return colors[colorName];
}

