import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../../theme/colors';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'danger' | 'warning' | 'info' | 'purple' | 'gold';
  size?: 'sm' | 'md' | 'lg';
}

export const Badge: React.FC<BadgeProps> = ({ 
  children, 
  variant = 'default',
  size = 'md'
}) => {
  const variantStyles = {
    default: styles.default,
    success: styles.success,
    danger: styles.danger,
    warning: styles.warning,
    info: styles.info,
    purple: styles.purple,
    gold: styles.gold,
  };

  const sizeStyles = {
    sm: styles.sm,
    md: styles.md,
    lg: styles.lg,
  };

  return (
    <View style={[styles.badge, variantStyles[variant], sizeStyles[size]]}>
      <Text style={[styles.text, variantStyles[variant]]}>{children}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  sm: {
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  md: {
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  lg: {
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  text: {
    fontSize: 12,
    fontWeight: '600',
  },
  default: {
    backgroundColor: Colors.backgroundDark,
    color: Colors.textSecondary,
  },
  success: {
    backgroundColor: Colors.successLight,
    color: Colors.success,
  },
  danger: {
    backgroundColor: Colors.dangerLight,
    color: Colors.danger,
  },
  warning: {
    backgroundColor: Colors.warningLight,
    color: Colors.warning,
  },
  info: {
    backgroundColor: Colors.infoLight,
    color: Colors.info,
  },
  purple: {
    backgroundColor: Colors.purpleLight,
    color: Colors.purple,
  },
  gold: {
    backgroundColor: Colors.primaryLight,
    color: Colors.primary,
  },
});
