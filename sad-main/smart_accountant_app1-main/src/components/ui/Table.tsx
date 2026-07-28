import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Colors } from '../../theme/colors';

interface TableProps {
  headers: string[];
  data: any[];
  renderRow: (item: any, index: number) => React.ReactNode;
  emptyMessage?: string;
  rowKey?: string;
  footer?: React.ReactNode;
}

export const Table: React.FC<TableProps> = ({
  headers,
  data,
  renderRow,
  emptyMessage = 'لا توجد بيانات',
  rowKey = 'id',
  footer,
}) => {
  if (data.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>{emptyMessage}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View>
          {/* Header */}
          <View style={styles.headerRow}>
            {headers.map((header, index) => (
              <Text key={index} style={[styles.headerCell, { flex: 1 }]}>
                {header}
              </Text>
            ))}
          </View>
          {/* Body */}
          {data.map((item, index) => (
            <View key={item[rowKey] || index} style={[
              styles.row,
              index % 2 === 0 ? styles.rowEven : styles.rowOdd
            ]}>
              {renderRow(item, index)}
            </View>
          ))}
          {/* Footer */}
          {footer && (
            <View style={styles.footerRow}>
              {footer}
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
    marginHorizontal: 16,
  },
  headerRow: {
    flexDirection: 'row',
    backgroundColor: Colors.backgroundDark,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerCell: {
    color: Colors.textSecondary,
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'right',
    paddingHorizontal: 8,
  },
  row: {
    flexDirection: 'row',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.border,
  },
  rowEven: {
    backgroundColor: Colors.card,
  },
  rowOdd: {
    backgroundColor: Colors.backgroundDark,
  },
  footerRow: {
    flexDirection: 'row',
    backgroundColor: Colors.backgroundDark,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  emptyContainer: {
    padding: 30,
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    marginHorizontal: 16,
  },
  emptyText: {
    color: Colors.textMuted,
    fontSize: 14,
  },
});

export const TableCell: React.FC<{
  children: React.ReactNode;
  flex?: number;
  align?: 'left' | 'center' | 'right';
  mono?: boolean;
  bold?: boolean;
  color?: string;
}> = ({ children, flex = 1, align = 'right', mono = false, bold = false, color }) => {
  return (
    <Text style={[
      styles.cell,
      { flex, textAlign: align },
      mono && styles.mono,
      bold && styles.bold,
      color && { color }
    ]}>
      {children}
    </Text>
  );
};

const stylesCell = StyleSheet.create({
  cell: {
    fontSize: 13,
    color: Colors.text,
    paddingHorizontal: 8,
  },
  mono: {
    fontFamily: 'monospace',
    fontSize: 12,
  },
  bold: {
    fontWeight: 'bold',
  },
});
