import React from 'react';
import { Stack } from 'expo-router';
import { DBProvider } from '../src/context/DatabaseContext';
import { SettingsProvider } from '../src/context/SettingsContext';

export default function RootLayout() {
  return (
    <DBProvider>
      <SettingsProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="login" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="settings" />
          <Stack.Screen name="settings/profile" />
          <Stack.Screen name="settings/security" />
          <Stack.Screen name="settings/print" />
          <Stack.Screen name="settings/backup" />
          <Stack.Screen name="settings/notifications" />
          <Stack.Screen name="settings/advanced" />
          <Stack.Screen name="settings/appearance" />
          <Stack.Screen name="ledger/accounts" />
          <Stack.Screen name="ledger/banks" />
          <Stack.Screen name="ledger/cash-boxes" />
          <Stack.Screen name="ledger/ewallets" />
          <Stack.Screen name="ledger/exchange-companies" />
          <Stack.Screen name="ledger/journal-entry" />
          <Stack.Screen name="ledger/cash-receipt" />
          <Stack.Screen name="ledger/cash-payment" />
          <Stack.Screen name="ledger/account-statement" />
          <Stack.Screen name="ledger/trial-balance" />
          <Stack.Screen name="ledger/general-ledger" />
          <Stack.Screen name="ledger/currencies" />
          <Stack.Screen name="ledger/account-groups" />
          <Stack.Screen name="ledger/account-details" />
          <Stack.Screen name="ledger/account-balances" />
          <Stack.Screen name="ledger/account-currencies" />
          <Stack.Screen name="ledger/account-settings" />
          <Stack.Screen name="ledger/vouchers" />
          <Stack.Screen name="ledger/recurring-journal" />
          <Stack.Screen name="ledger/currency-reports" />
          <Stack.Screen name="sales/customers" />
          <Stack.Screen name="sales/sales-invoice" />
          <Stack.Screen name="sales/sales-return" />
          <Stack.Screen name="sales/quotation" />
          <Stack.Screen name="sales/summary" />
          <Stack.Screen name="sales/reps" />
          <Stack.Screen name="sales/customer-groups" />
          <Stack.Screen name="sales/customer-sales" />
          <Stack.Screen name="sales/item-sales" />
          <Stack.Screen name="sales/rep-performance" />
          <Stack.Screen name="sales/rep-motivation" />
          <Stack.Screen name="inventory/items" />
          <Stack.Screen name="inventory/suppliers" />
          <Stack.Screen name="inventory/purchase-invoice" />
          <Stack.Screen name="inventory/purchase-return" />
          <Stack.Screen name="inventory/warehouses" />
          <Stack.Screen name="inventory/inventory-issue" />
          <Stack.Screen name="inventory/inventory-receipt" />
          <Stack.Screen name="inventory/stock-count" />
          <Stack.Screen name="inventory/stock-adjustment" />
          <Stack.Screen name="inventory/warehouse-transfer" />
          <Stack.Screen name="inventory/item-movement" />
          <Stack.Screen name="inventory/qty-report" />
          <Stack.Screen name="inventory/cost-report" />
          <Stack.Screen name="inventory/categories" />
          <Stack.Screen name="inventory/brands" />
          <Stack.Screen name="inventory/units" />
          <Stack.Screen name="inventory/supplier-movement" />
          <Stack.Screen name="inventory/slow-moving" />
          <Stack.Screen name="inventory/expired" />
          <Stack.Screen name="reports/index" />
          <Stack.Screen name="reports/balance-sheet" />
          <Stack.Screen name="reports/income-statement" />
          <Stack.Screen name="reports/cash-flow" />
          <Stack.Screen name="reports/stock-report" />
          <Stack.Screen name="reports/alerts" />
          <Stack.Screen name="about" />
          <Stack.Screen name="backup" />
          <Stack.Screen name="closing" />
          <Stack.Screen name="dashboard" />
          <Stack.Screen name="home" />
          <Stack.Screen name="owner" />
          <Stack.Screen name="voice" />
          <Stack.Screen name="voice-assistant" />
          <Stack.Screen name="+not-found" />
        </Stack>
      </SettingsProvider>
    </DBProvider>
  );
}
