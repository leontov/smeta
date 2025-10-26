import React from 'react';
import { ActivityIndicator, GestureResponderEvent, StyleSheet, Text, TouchableOpacity } from 'react-native';

type ButtonVariant = 'primary' | 'outline' | 'danger';

type Props = {
  label: string;
  onPress: (event: GestureResponderEvent) => void;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  disabled?: boolean;
  loading?: boolean;
  variant?: ButtonVariant;
};

export const PrimaryButton = ({
  label,
  onPress,
  accessibilityLabel,
  accessibilityHint,
  disabled,
  loading,
  variant = 'primary'
}: Props) => {
  const buttonStyles = [styles.baseButton];
  const labelStyles = [styles.baseLabel];

  switch (variant) {
    case 'outline':
      buttonStyles.push(styles.outlineButton);
      labelStyles.push(styles.outlineLabel);
      break;
    case 'danger':
      buttonStyles.push(styles.dangerButton);
      labelStyles.push(styles.dangerLabel);
      break;
    case 'primary':
    default:
      buttonStyles.push(styles.primaryButton);
      labelStyles.push(styles.primaryLabel);
      break;
  }

  if (disabled || loading) {
    buttonStyles.push(styles.buttonDisabled);
  }

  const spinnerColor = variant === 'outline' ? '#1B263B' : '#FFFFFF';

  return (
    <TouchableOpacity
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityRole="button"
      accessibilityHint={accessibilityHint}
      disabled={disabled || loading}
      onPress={onPress}
      style={buttonStyles}
    >
      {loading ? <ActivityIndicator color={spinnerColor} /> : <Text style={labelStyles}>{label}</Text>}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  baseButton: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'transparent'
  },
  baseLabel: {
    fontSize: 18,
    fontWeight: '600'
  },
  primaryButton: {
    backgroundColor: '#1B263B'
  },
  primaryLabel: {
    color: '#FFFFFF'
  },
  outlineButton: {
    backgroundColor: '#FFFFFF',
    borderColor: '#1B263B'
  },
  outlineLabel: {
    color: '#1B263B'
  },
  dangerButton: {
    backgroundColor: '#9E2B25',
    borderColor: '#9E2B25'
  },
  dangerLabel: {
    color: '#FFFFFF'
  },
  buttonDisabled: {
    opacity: 0.6
  }
});
