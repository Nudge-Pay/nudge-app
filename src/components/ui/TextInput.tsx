import {
  TextInput as RNTextInput,
  StyleSheet,
  type TextInputProps as RNTextInputProps,
} from 'react-native';

import { Fonts, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export type TextInputProps = RNTextInputProps;

export const TextInput = ({ style, placeholderTextColor, ...props }: TextInputProps) => {
  const theme = useTheme();

  return (
    <RNTextInput
      accessibilityRole="text"
      placeholderTextColor={placeholderTextColor ?? theme.textSecondary}
      style={[
        styles.input,
        {
          backgroundColor: theme.surface,
          borderColor: theme.border,
          color: theme.text,
        },
        style,
      ]}
      {...props}
    />
  );
};

const styles = StyleSheet.create({
  input: {
    minHeight: 52,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderWidth: 1,
    borderRadius: Radius.input,
    fontSize: 16,
    fontFamily: Fonts?.sans,
  },
});
