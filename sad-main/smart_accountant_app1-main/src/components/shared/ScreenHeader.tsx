import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors, FontSize } from '../../theme/colors';

interface ScreenHeaderProps {
  title: string;
  subtitle?: string;
  count?: number;
  onAdd?: () => void;
  onRefresh?: () => void;
  addColor?: string;
}

export function ScreenHeader({ title, subtitle, count, onAdd, onRefresh, addColor = Colors.primary }: ScreenHeaderProps) {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
        <Text style={styles.backText}>←</Text>
      </TouchableOpacity>
      
      <View style={styles.center}>
        <Text style={styles.title}>{title}</Text>
        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
        {count !== undefined && (
          <View style={styles.countBadge}>
            <Text style={styles.countText}>{count}</Text>
          </View>
        )}
      </View>

      <View style={styles.actions}>
        {onRefresh && (
          <TouchableOpacity onPress={onRefresh} style={styles.actionBtn}>
            <Text style={styles.actionIcon}>🔄</Text>
          </TouchableOpacity>
        )}
        {onAdd && (
          <TouchableOpacity onPress={onAdd} style={[styles.addBtn, { backgroundColor: addColor }]}>
            <Text style={styles.addText}>+</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backText: {
    color: Colors.primary,
    fontSize: 20,
    fontWeight: 'bold',
  },
  center: {
    alignItems: 'center',
  },
  title: {
    color: Colors.primary,
    fontSize: FontSize.lg,
    fontWeight: 'bold',
  },
  subtitle: {
    color: Colors.textMuted,
    fontSize: FontSize.xs,
    marginTop: 2,
  },
  countBadge: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    marginTop: 4,
  },
  countText: {
    color: Colors.background,
    fontSize: FontSize.xs,
    fontWeight: 'bold',
  },
  actions: {
    flexDirection: 'row',
    gap: 6,
  },
  actionBtn: {
    padding: 6,
  },
  actionIcon: {
    fontSize: 18,
  },
  addBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addText: {
    color: Colors.background,
    fontSize: 22,
    fontWeight: 'bold',
  },
});
