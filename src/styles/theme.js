import { colors } from './colors';
import { typography } from './typography';
import { spacing } from './spacing';

export const theme = {
  colors,
  typography,
  spacing,
  
  // Shadows
  shadow: {
    small: {
      shadowColor: colors.black,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
      elevation: 2,
    },
    medium: {
      shadowColor: colors.black,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.15,
      shadowRadius: 4,
      elevation: 4,
    },
    large: {
      shadowColor: colors.black,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 8,
      elevation: 8,
    },
  },
  
  // Animation durations
  animation: {
    fast: 150,
    normal: 300,
    slow: 500,
  },
  
  // Common component styles
  components: {
    button: {
      borderRadius: spacing.borderRadius.base,
      paddingVertical: spacing.buttonPadding.vertical,
      paddingHorizontal: spacing.buttonPadding.horizontal,
      minHeight: 48,
    },
    
    input: {
      borderRadius: spacing.borderRadius.base,
      paddingVertical: spacing.inputPadding.vertical,
      paddingHorizontal: spacing.inputPadding.horizontal,
      minHeight: 48,
      borderWidth: 1,
    },
    
    card: {
      borderRadius: spacing.borderRadius.lg,
      padding: spacing.cardPadding.vertical,
      backgroundColor: colors.surface,
      ...this?.shadow?.medium,
    },
  },
};