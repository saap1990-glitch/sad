import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView, TextInput, Alert, Dimensions } from 'react-native';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// ✅ أنماط تقارير مختلفة
type ReportStyle = 'table' | 'voucher' | 'invoice' | 'ledger';

interface ReportViewerProps {
  visible: boolean;
  title: string;
  subtitle?: string;
  data: any[];
  columns: string[];
  columnLabels?: string[];
  style?: ReportStyle;
  totals?: { label: string; value: string }[];
  onClose: () => void;
  onShare: (format: 'pdf' | 'csv' | 'text') => void;
}

export const ReportViewer: React.FC<ReportViewerProps> = ({ 
  visible, title, subtitle, data, columns, columnLabels, style = 'table', totals, onClose, onShare 
}) => {
  const [companyName, setCompanyName] = useState('دفتر المحاسب الذكي');
  const [reportTitle, setReportTitle] = useState(title);
  const [showSettings, setShowSettings] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = style === 'invoice' ? 10 : style === 'voucher' ? 1 : 20;

  const labels = columnLabels || columns;
  const totalPages = Math.ceil(data.length / rowsPerPage);
  const startIdx = (currentPage - 1) * rowsPerPage;
  const pageData = data.slice(startIdx, startIdx + rowsPerPage);

  // ✅ تصميم HTML حسب النوع
  const getReportHTML = () => {
    let html = '';
    const now = new Date().toLocaleDateString('ar-SA');

    for (let page = 0; page < totalPages; page++) {
      const start = page * rowsPerPage;
      const pageRows = data.slice(start, start + rowsPerPage);

      // ✅ رأس التقرير
      html += `
        <div class="page">
          <div class="report-header">
            <div class="company-name">${companyName}</div>
            <div class="report-title">${reportTitle}</div>
            ${subtitle ? `<div class="report-subtitle">${subtitle}</div>` : ''}
            <div class="report-date">${now}</div>
          </div>
      `;

      if (style === 'voucher') {
        // ✅ تصميم السندات
        html += pageRows.map(row => `
          <div class="voucher-card">
            <div class="voucher-header">
              <div class="voucher-number">${row.number || row.رقم_السند || ''}</div>
              <div class="voucher-date">${row.date || row.التاريخ || ''}</div>
            </div>
            <div class="voucher-body">
              <div class="voucher-party">${row.sourceName || row.الجهة || ''}</div>
              <div class="voucher-account">${row.accountName || row.الحساب || ''}</div>
              <div class="voucher-amount">${(row.amount || row.المبلغ || 0).toLocaleString()} ﷼</div>
              <div class="voucher-desc">${row.description || row.البيان || ''}</div>
            </div>
          </div>
        `).join('');
      } else if (style === 'invoice') {
        // ✅ تصميم الفواتير
        html += pageRows.map(row => `
          <div class="invoice-card">
            <div class="invoice-header">
              <div class="invoice-number">${row.number || row.رقم_الفاتورة || ''}</div>
              <div class="invoice-date">${row.date || row.التاريخ || ''}</div>
            </div>
            <div class="invoice-party">${row.customerName || row.supplierName || row.العميل || ''}</div>
            <table class="invoice-table">
              <tr><td>الإجمالي</td><td>${(row.subtotal || row.الإجمالي || 0).toLocaleString()}</td></tr>
              <tr><td>الضريبة</td><td>${(row.tax || row.الضريبة || 0).toLocaleString()}</td></tr>
              <tr><td>الصافي</td><td><strong>${(row.total || row.الصافي || 0).toLocaleString()} ﷼</strong></td></tr>
            </table>
          </div>
        `).join('');
      } else {
        // ✅ تصميم الجدول (للتقارير)
        html += `
          <table class="data-table">
            <thead><tr>${labels.map(l => `<th>${l}</th>`).join('')}</tr></thead>
            <tbody>
              ${pageRows.map(row => `<tr>${columns.map(c => `<td>${row[c] || '-'}</td>`).join('')}</tr>`).join('')}
            </tbody>
          </table>
        `;

        // ✅ المجاميع
        if (totals && totals.length > 0) {
          html += `<div class="totals">${totals.map(t => `
            <div class="total-row"><span>${t.label}</span><span>${t.value}</span></div>
          `).join('')}</div>`;
        }
      }

      html += `
          <div class="page-number">صفحة ${page + 1} من ${totalPages}</div>
        </div>
        ${page < totalPages - 1 ? '<div class="page-break"></div>' : ''}
      `;
    }

    return `<!DOCTYPE html><html dir="rtl"><head><meta charset="utf-8"><style>
      * { margin: 0; padding: 0; box-sizing: border-box; }
      body { font-family: 'Cairo', 'Arial', sans-serif; padding: 20px; background: #fff; }
      .page { padding: 20px; margin-bottom: 15px; border: 2px solid #D4AF37; border-radius: 15px; background: linear-gradient(180deg, #fff 0%, #fafafa 100%); }
      .report-header { text-align: center; padding: 20px; margin-bottom: 25px; background: linear-gradient(135deg, #0A1128 0%, #1a2540 100%); border-radius: 12px; color: #fff; }
      .company-name { color: #D4AF37; font-size: 26px; font-weight: bold; margin-bottom: 8px; }
      .report-title { color: #fff; font-size: 20px; margin-bottom: 5px; }
      .report-subtitle { color: #94a3b8; font-size: 14px; }
      .report-date { color: #666; font-size: 12px; margin-top: 10px; }
      
      .voucher-card { background: #fff; border: 2px solid #16213E; border-radius: 15px; padding: 25px; margin-bottom: 20px; }
      .voucher-header { display: flex; justify-content: space-between; border-bottom: 2px solid #D4AF37; padding-bottom: 15px; margin-bottom: 20px; }
      .voucher-number { color: #D4AF37; font-size: 22px; font-weight: bold; }
      .voucher-date { color: #666; font-size: 14px; }
      .voucher-body { text-align: right; }
      .voucher-party { font-size: 18px; font-weight: bold; color: #0A1128; margin-bottom: 10px; }
      .voucher-account { font-size: 16px; color: #16213E; margin-bottom: 10px; }
      .voucher-amount { font-size: 28px; font-weight: bold; color: #D4AF37; text-align: center; margin: 20px 0; padding: 15px; background: rgba(212,175,55,0.1); border-radius: 10px; }
      .voucher-desc { font-size: 14px; color: #666; font-style: italic; }
      
      .invoice-card { background: #fff; border: 2px solid #16213E; border-radius: 15px; padding: 25px; margin-bottom: 20px; }
      .invoice-header { display: flex; justify-content: space-between; border-bottom: 2px solid #10B981; padding-bottom: 15px; margin-bottom: 20px; }
      .invoice-number { color: #10B981; font-size: 22px; font-weight: bold; }
      .invoice-party { font-size: 18px; font-weight: bold; color: #0A1128; margin-bottom: 20px; text-align: right; }
      .invoice-table { width: 60%; margin: 0 auto; border-collapse: collapse; }
      .invoice-table td { padding: 10px; border-bottom: 1px solid #ddd; }
      .invoice-table td:first-child { text-align: right; color: #666; }
      .invoice-table td:last-child { text-align: left; font-weight: bold; }
      
      .data-table { width: 100%; border-collapse: collapse; margin: 15px 0; }
      .data-table thead { background: linear-gradient(135deg, #D4AF37 0%, #F59E0B 100%); }
      .data-table th { color: #0A1128; padding: 12px; font-size: 13px; font-weight: bold; border: 1px solid #ddd; }
      .data-table td { padding: 10px; border: 1px solid #ddd; font-size: 12px; text-align: center; }
      .data-table tr:nth-child(even) td { background: #f9f9f9; }
      
      .totals { background: #16213E; padding: 15px; border-radius: 10px; margin-top: 15px; color: #fff; }
      .total-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid rgba(255,255,255,0.1); font-size: 14px; }
      
      .page-number { text-align: center; font-size: 11px; color: #666; margin-top: 20px; padding-top: 15px; border-top: 1px solid #eee; }
      .page-break { page-break-after: always; }
      @media print { body { padding: 0; } .page { border: none; margin: 0; } }
    </style></head><body>${html}</body></html>`;
  };

  const handlePrintPDF = async () => {
    try {
      const { uri } = await Print.printToFileAsync({ html: getReportHTML() });
      await Sharing.shareAsync(uri, { mimeType: 'application/pdf', dialogTitle: 'مشاركة التقرير' });
    } catch (e) { Alert.alert('خطأ', 'فشل إنشاء PDF'); }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={st.overlay}>
        <View style={st.container}>
          <View style={st.header}>
            <Text style={st.title}>{reportTitle}</Text>
            <TouchableOpacity onPress={onClose}><Text style={st.close}>✕</Text></TouchableOpacity>
          </View>

          <View style={st.info}>
            <Text style={st.infoText}>📊 {data.length} سجل | 📄 {totalPages} صفحات | 🎨 {style === 'voucher' ? 'سندات' : style === 'invoice' ? 'فواتير' : 'جدول'}</Text>
          </View>

          <View style={st.controls}>
            <TouchableOpacity style={st.ctrlBtn} onPress={() => setShowSettings(!showSettings)}>
              <Text style={st.ctrlIcon}>⚙️</Text><Text style={st.ctrlText}>تخصيص</Text>
            </TouchableOpacity>
            <TouchableOpacity style={st.ctrlBtn} onPress={handlePrintPDF}>
              <Text style={st.ctrlIcon}>📄</Text><Text style={st.ctrlText}>PDF</Text>
            </TouchableOpacity>
            <TouchableOpacity style={st.ctrlBtn} onPress={() => onShare('csv')}>
              <Text style={st.ctrlIcon}>📊</Text><Text style={st.ctrlText}>CSV</Text>
            </TouchableOpacity>
          </View>

          {showSettings && (
            <View style={st.settings}>
              <Text style={st.setLabel}>اسم الشركة</Text>
              <TextInput style={st.setInput} value={companyName} onChangeText={setCompanyName} />
              <Text style={st.setLabel}>عنوان التقرير</Text>
              <TextInput style={st.setInput} value={reportTitle} onChangeText={setReportTitle} />
            </View>
          )}

          {totalPages > 1 && (
            <View style={st.pagination}>
              <TouchableOpacity onPress={() => setCurrentPage(Math.max(1, currentPage - 1))}><Text style={st.pageBtn}>←</Text></TouchableOpacity>
              <Text style={st.pageInfo}>{currentPage}/{totalPages}</Text>
              <TouchableOpacity onPress={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}><Text style={st.pageBtn}>→</Text></TouchableOpacity>
            </View>
          )}

          <ScrollView style={st.preview}>
            {style === 'voucher' && pageData.map((row, i) => (
              <View key={i} style={st.voucherPreview}>
                <View style={st.vpHeader}><Text style={st.vpNum}>{row.number || row.رقم_السند}</Text><Text style={st.vpDate}>{row.date || row.التاريخ}</Text></View>
                <Text style={st.vpParty}>{row.sourceName || row.الجهة}</Text>
                <Text style={st.vpAcc}>{row.accountName || row.الحساب}</Text>
                <Text style={st.vpAmt}>{(row.amount || row.المبلغ || 0).toLocaleString()} ﷼</Text>
                <Text style={st.vpDesc}>{row.description || row.البيان}</Text>
              </View>
            ))}

            {style === 'invoice' && pageData.map((row, i) => (
              <View key={i} style={st.invPreview}>
                <View style={st.vpHeader}><Text style={st.vpNum}>{row.number || row.رقم_الفاتورة}</Text><Text style={st.vpDate}>{row.date || row.التاريخ}</Text></View>
                <Text style={st.vpParty}>{row.customerName || row.supplierName || row.العميل}</Text>
                <View style={st.invTotals}>
                  <View style={st.invRow}><Text>الإجمالي</Text><Text>{(row.subtotal || row.الإجمالي || 0).toLocaleString()}</Text></View>
                  <View style={st.invRow}><Text>الضريبة</Text><Text>{(row.tax || row.الضريبة || 0).toLocaleString()}</Text></View>
                  <View style={[st.invRow, { borderTopWidth: 2, borderTopColor: '#D4AF37' }]}><Text style={{ fontWeight: 'bold', color: '#D4AF37' }}>الصافي</Text><Text style={{ fontWeight: 'bold', color: '#D4AF37' }}>{(row.total || row.الصافي || 0).toLocaleString()} ﷼</Text></View>
                </View>
              </View>
            ))}

            {style === 'table' && (
              <View style={st.table}>
                <View style={st.tableHead}>{labels.map((l, i) => <Text key={i} style={st.th}>{l}</Text>)}</View>
                {pageData.map((row, i) => (
                  <View key={i} style={st.tableRow}>{columns.map((c, j) => <Text key={j} style={st.td}>{row[c] || '-'}</Text>)}</View>
                ))}
                {totals && totals.map((t, i) => (
                  <View key={i} style={[st.tableRow, { backgroundColor: '#16213E' }]}>
                    <Text style={[st.td, { fontWeight: 'bold', color: '#D4AF37' }]}>{t.label}</Text>
                    <Text style={[st.td, { fontWeight: 'bold', color: '#D4AF37' }]}>{t.value}</Text>
                  </View>
                ))}
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const st = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.9)' },
  container: { flex: 1, backgroundColor: '#0A1128', margin: 10, borderRadius: 20, borderWidth: 2, borderColor: '#D4AF37' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#D4AF37' },
  title: { color: '#D4AF37', fontSize: 20, fontWeight: 'bold', flex: 1, textAlign: 'center' },
  close: { color: '#EF4444', fontSize: 24, padding: 4 },
  info: { padding: 8, backgroundColor: '#16213E', alignItems: 'center' },
  infoText: { color: '#94a3b8', fontSize: 11 },
  controls: { flexDirection: 'row', justifyContent: 'space-around', padding: 10, backgroundColor: '#16213E' },
  ctrlBtn: { alignItems: 'center', padding: 8 }, ctrlIcon: { fontSize: 22 }, ctrlText: { color: '#D4AF37', fontSize: 10, marginTop: 2 },
  settings: { padding: 12, backgroundColor: '#16213E', margin: 8, borderRadius: 10 },
  setLabel: { color: '#94a3b8', fontSize: 11, marginBottom: 4 },
  setInput: { backgroundColor: '#0A1128', color: '#FFF', padding: 8, borderRadius: 6, marginBottom: 8, textAlign: 'right' },
  pagination: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 20, padding: 10, backgroundColor: '#16213E' },
  pageBtn: { color: '#D4AF37', fontSize: 20, padding: 5 }, pageInfo: { color: '#FFF', fontSize: 14 },
  preview: { flex: 1, padding: 12 },
  voucherPreview: { backgroundColor: '#16213E', borderRadius: 15, padding: 20, marginBottom: 12, borderWidth: 2, borderColor: '#2a3550' },
  vpHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15, borderBottomWidth: 1, borderBottomColor: '#D4AF37', paddingBottom: 10 },
  vpNum: { color: '#D4AF37', fontSize: 18, fontWeight: 'bold' }, vpDate: { color: '#94a3b8', fontSize: 12 },
  vpParty: { color: '#FFF', fontSize: 16, fontWeight: 'bold', textAlign: 'right', marginBottom: 8 },
  vpAcc: { color: '#94a3b8', fontSize: 14, textAlign: 'right', marginBottom: 12 },
  vpAmt: { color: '#D4AF37', fontSize: 26, fontWeight: 'bold', textAlign: 'center', padding: 12, backgroundColor: 'rgba(212,175,55,0.1)', borderRadius: 8, marginBottom: 8 },
  vpDesc: { color: '#666', fontSize: 12, textAlign: 'right', fontStyle: 'italic' },
  invPreview: { backgroundColor: '#16213E', borderRadius: 15, padding: 20, marginBottom: 12, borderWidth: 2, borderColor: '#10B981' },
  invTotals: { marginTop: 15 }, invRow: { flexDirection: 'row', justifyContent: 'space-between', padding: 8, borderBottomWidth: 1, borderBottomColor: '#2a3550' },
  table: { backgroundColor: '#16213E', borderRadius: 10, overflow: 'hidden' },
  tableHead: { flexDirection: 'row', backgroundColor: '#D4AF37', paddingVertical: 8 },
  th: { flex: 1, color: '#0A1128', fontSize: 10, fontWeight: 'bold', textAlign: 'center' },
  tableRow: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#2a3550' },
  td: { flex: 1, color: '#FFF', fontSize: 10, textAlign: 'center', padding: 8 },
});
