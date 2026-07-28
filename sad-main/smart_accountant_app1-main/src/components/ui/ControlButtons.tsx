import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors } from '../../theme/colors';

export const ControlButtons: React.FC<{
  onAdd?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onRefresh?: () => void;
  showAdd?: boolean;
  showEdit?: boolean;
  showDelete?: boolean;
  showRefresh?: boolean;
}> = ({ onAdd, onEdit, onDelete, onRefresh, showAdd = true, showEdit = false, showDelete = false, showRefresh = true }) => {
  return (
    <View style={styles.container}>
      {showRefresh && (
        <TouchableOpacity style={styles.btn} onPress={onRefresh}>
          <Text style={styles.btnIcon}>🔄</Text>
          <Text style={styles.btnLabel}>تحديث</Text>
        </TouchableOpacity>
      )}
      {showAdd && (
        <TouchableOpacity style={[styles.btn, styles.btnPrimary]} onPress={onAdd}>
          <Text style={styles.btnIcon}>➕</Text>
          <Text style={styles.btnLabel}>إضافة</Text>
        </TouchableOpacity>
      )}
      {showEdit && (
        <TouchableOpacity style={[styles.btn, styles.btnWarning]} onPress={onEdit}>
          <Text style={styles.btnIcon}>✏️</Text>
          <Text style={styles.btnLabel}>تعديل</Text>
        </TouchableOpacity>
      )}
      {showDelete && (
        <TouchableOpacity style={[styles.btn, styles.btnDanger]} onPress={onDelete}>
          <Text style={styles.btnIcon}>🗑️</Text>
          <Text style={styles.btnLabel}>حذف</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

export const ControlHeader: React.FC<{
  title: string;
  count?: number;
  onBack: () => void;
  onAdd?: () => void;
  onRefresh?: () => void;
}> = ({ title, count, onBack, onAdd, onRefresh }) => {
  return (
    <View style={headerStyles.header}>
      <TouchableOpacity onPress={onBack} style={headerStyles.backBtn}>
        <Text style={headerStyles.backText}>←</Text>
      </TouchableOpacity>
      <View style={headerStyles.titleContainer}>
        <Text style={headerStyles.title}>{title}</Text>
        {count !== undefined && (
          <View style={headerStyles.countBadge}>
            <Text style={headerStyles.countText}>{count}</Text>
          </View>
        )}
      </View>
      <View style={headerStyles.rightContainer}>
        {onRefresh && (
          <TouchableOpacity onPress={onRefresh} style={headerStyles.iconBtn}>
            <Text style={headerStyles.iconText}>🔄</Text>
          </TouchableOpacity>
        )}
        {onAdd && (
          <TouchableOpacity onPress={onAdd} style={headerStyles.addBtn}>
            <Text style={headerStyles.addText}>+</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginHorizontal: 16,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 6,
  },
  btnPrimary: { backgroundColor: '#D4AF37', borderColor: '#D4AF37' },
  btnWarning: { backgroundColor: '#F59E0B', borderColor: '#F59E0B' },
  btnDanger: { backgroundColor: '#EF4444', borderColor: '#EF4444' },
  btnIcon: { fontSize: 16 },
  btnLabel: { color: '#FFFFFF', fontSize: 12, fontWeight: '600' },
});

const headerStyles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  backText: { fontSize: 20, color: '#D4AF37', fontWeight: 'bold' },
  titleContainer: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  title: { fontSize: 18, fontWeight: 'bold', color: '#1E293B', textAlign: 'center' },
  countBadge: { backgroundColor: '#D4AF37', borderRadius: 12, paddingHorizontal: 8, paddingVertical: 2, minWidth: 20, alignItems: 'center' },
  countText: { color: '#FFFFFF', fontSize: 12, fontWeight: 'bold' },
  rightContainer: { flexDirection: 'row', gap: 8, width: 80, justifyContent: 'flex-end' },
  iconBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#F1F5F9', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#E2E8F0' },
  iconText: { fontSize: 16 },
  addBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#D4AF37', justifyContent: 'center', alignItems: 'center' },
  addText: { fontSize: 20, color: '#FFFFFF', fontWeight: 'bold' },
});
