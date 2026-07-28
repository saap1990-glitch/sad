import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors } from '../../theme/colors';

interface EmptyStateProps {
  icon?: string;
  title?: string;
  message?: string;
  buttonText?: string;
  onPress?: () => void;
}

export function EmptyState({ 
  icon = '📭', 
  title = 'لا توجد بيانات', 
  message = '',
  buttonText,
  onPress 
}: EmptyStateProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.icon}>{icon}</Text>
      <Text style={styles.title}>{title}</Text>
      {message ? <Text style={styles.message}>{message}</Text> : null}
      {buttonText && onPress && (
        <TouchableOpacity style={styles.button} onPress={onPress}>
          <Text style={styles.buttonText}>{buttonText}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: 50,
    paddingHorizontal: 20,
  },
  icon: {
    fontSize: 60,
    marginBottom: 16,
  },
  title: {
    color: Colors.textSecondary,
    fontSize: 16,
    marginBottom: 8,
  },
  message: {
    color: Colors.textMuted,
    fontSize: 13,
    textAlign: 'center',
    marginBottom: 16,
  },
  button: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 10,
  },
  buttonText: {
    color: Colors.background,
    fontWeight: 'bold',
    fontSize: 14,
  },
});
