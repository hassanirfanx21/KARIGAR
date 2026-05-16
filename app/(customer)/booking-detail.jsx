import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Calendar, MapPin, Wrench, Tag, Key, CheckCircle2, User } from 'lucide-react-native';
import { Colors, Shadows, Spacing, Radius } from '../../constants/theme';

export default function BookingDetailScreen() {
  const router = useRouter();
  const { bookingId, workerName, slot, location, confirmCode, pricing: pricingStr } = useLocalSearchParams();
  const pricing = JSON.parse(pricingStr || '{}');
  const [agentExpanded, setAgentExpanded] = useState(false);
  const status = 'confirmed';
  const isConfirmed = status === 'confirmed';

  const detailRows = [
    { icon: <Calendar size={18} color={Colors.textMuted} />, label: 'Tarikh', value: slot || 'Jumarat, 13 September 2024' },
    { icon: <MapPin size={18} color={Colors.textMuted} />, label: 'Jagah', value: location || 'G-13, Islamabad' },
    { icon: <Wrench size={18} color={Colors.textMuted} />, label: 'Service', value: 'AC Technician' },
    { icon: <Tag size={18} color={Colors.textMuted} />, label: 'Booking ID', value: bookingId || 'BK-20240913-0047', mono: true },
    { icon: <Key size={18} color={Colors.greenPrimary} />, label: 'Confirm Code', value: confirmCode || 'KRG-4751', gold: true },
    { icon: <CheckCircle2 size={18} color={Colors.successGreen} />, label: 'Status', value: 'Confirmed', statusColor: Colors.successGreen },
  ];

  const agentSteps = [
    { label: 'Intent Parser', done: 'Request samajh li ✓' },
    { label: 'Provider Discovery', done: '4 Karigar mile ✓' },
    { label: 'Matching & Ranking', done: 'Match mil gaya! ✓' },
    { label: 'Booking Execution', done: 'Booking ho gayi! ✓' },
    { label: 'Follow-Up', done: '3 reminders set ✓' },
  ];

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}><Text style={styles.backArrow}>←</Text></TouchableOpacity>
        <Text style={styles.headerTitle}>Booking Detail</Text>
        <View style={{ width: 38 }} />
      </View>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Hero */}
        <View style={styles.heroCard}>
          <View style={styles.heroAvatar}>
            <User size={36} color={Colors.greenPrimary} />
          </View>
          <Text style={styles.heroName}>{workerName || 'Ali AC Services'}</Text>
          <View style={styles.heroCatRow}>
            <View style={styles.catChip}><Text style={styles.catChipText}>AC Technician</Text></View>
            <Text style={styles.heroRating}>⭐ 4.8</Text>
          </View>
          <View style={[styles.statusLarge, { backgroundColor: `${Colors.successGreen}20` }]}>
            <Text style={[styles.statusLargeText, { color: Colors.successGreen }]}>● Confirmed</Text>
          </View>
          <View style={styles.heroAccent} />
        </View>

        {/* Details */}
        <Text style={styles.sectionLabel}>BOOKING DETAILS</Text>
        <View style={styles.detailsCard}>
          {detailRows.map((row, i) => (
            <View key={row.label}>
              <View style={styles.detailRow}>
                <View style={styles.detailIcon}>{row.icon}</View>
                <Text style={styles.detailLabel}>{row.label}</Text>
                <Text style={[styles.detailValue, row.mono && styles.detailMono, row.gold && styles.detailGold, row.statusColor && { color: row.statusColor, fontWeight: '700' }]}>{row.value}</Text>
              </View>
              {i < detailRows.length - 1 && <View style={styles.rowDivider} />}
            </View>
          ))}
        </View>

        {/* Pricing */}
        <Text style={styles.sectionLabel}>QEEMAT KA HISAAB</Text>
        <View style={styles.detailsCard}>
          {pricing.breakdown ? pricing.breakdown.map((item, i) => {
            const isTotal = i === pricing.breakdown.length - 1;
            return (
              <View key={item.label} style={[styles.pricingRow, isTotal && styles.pricingRowTotal]}>
                <Text style={[styles.pricingLabel, item.bold && styles.pricingLabelBold, isTotal && styles.pricingTotalText]}>{item.label}</Text>
                <Text style={[styles.pricingValue, item.bold && styles.pricingValueBold, isTotal && styles.pricingTotalText]}>
                  {item.amount ? `PKR ${item.amount}` : item.multiplier}
                </Text>
              </View>
            );
          }) : (
            <View style={styles.pricingRow}>
              <Text style={styles.pricingLabel}>Estimated Price</Text>
              <Text style={styles.pricingValue}>PKR — (calculating)</Text>
            </View>
          )}
        </View>

        {/* Agent Reasoning */}
        <Text style={styles.sectionLabel}>AI KA FAISLA</Text>
        <View style={styles.agentCard}>
          <View style={styles.agentHeader}>
            <View style={styles.kMark}><Text style={{ color: Colors.blackDeep, fontWeight: '900', fontSize: 14 }}>K</Text></View>
            <Text style={styles.agentTitle}>KARIGAR Agent — Reasoning</Text>
            <TouchableOpacity onPress={() => setAgentExpanded(!agentExpanded)}>
              <Text style={styles.toggleBtn}>{agentExpanded ? 'Band karo ▲' : 'Dekhein ▼'}</Text>
            </TouchableOpacity>
          </View>
          {agentExpanded && (
            <View style={styles.agentSteps}>
              {agentSteps.map(s => (
                <View key={s.label} style={styles.agentStepItem}>
                  <View style={styles.agentDot} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.agentStepLabel}>{s.label}</Text>
                    <Text style={styles.agentStepDone}>{s.done}</Text>
                  </View>
                </View>
              ))}
              <View style={styles.agentTotalRow}>
                <Text style={styles.agentTotal}>Total Processing: 3.2 seconds</Text>
              </View>
            </View>
          )}
        </View>

        {/* Map */}
        <Text style={styles.sectionLabel}>JAGAH</Text>
        <View style={styles.mapPreview}>
          <View style={styles.mapGrid}>
            {Array.from({ length: 48 }).map((_, i) => (
              <View key={i} style={[styles.mapCell, i % 2 === 0 && styles.mapCellAlt]} />
            ))}
          </View>
          <View style={styles.mapPin}>
            <MapPin size={32} color={Colors.errorRed} />
          </View>
          <View style={styles.mapLabel}><Text style={styles.mapLabelText}>📍 {location || 'G-13, Islamabad'}</Text></View>
        </View>
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Bottom Actions */}
      <View style={styles.bottomActions}>
        <View style={styles.actionRow}>
          <TouchableOpacity style={styles.cancelBtn} activeOpacity={0.8}
            onPress={() => Alert.alert('Cancel', 'Booking cancel karna chahte hain?')}>
            <Text style={styles.cancelBtnText}>✕ Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.contactBtn} activeOpacity={0.85}>
            <Text style={styles.contactBtnText}>📞 Worker se Contact</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.whiteSoft },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 14, backgroundColor: Colors.whitePure, borderBottomWidth: 1, borderBottomColor: Colors.border },
  backBtn: { width: 38, height: 38, borderRadius: 19, backgroundColor: Colors.whiteSoft, alignItems: 'center', justifyContent: 'center' },
  backArrow: { fontSize: 20, color: Colors.blackDeep },
  headerTitle: { flex: 1, textAlign: 'center', fontSize: 17, fontWeight: '700', color: Colors.blackDeep },
  scrollContent: { padding: 16 },
  heroCard: { backgroundColor: Colors.grayMatte, borderRadius: 22, padding: 24, alignItems: 'center', marginBottom: 20, ...Shadows.cardHeavy },
  heroAvatar: { width: 88, height: 88, borderRadius: 44, backgroundColor: `${Colors.greenPrimary}30`, alignItems: 'center', justifyContent: 'center', borderWidth: 3, borderColor: Colors.greenPrimary, marginBottom: 14 },
  heroName: { color: Colors.textOnDark, fontSize: 20, fontWeight: '800', marginBottom: 8, textAlign: 'center' },
  heroCatRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
  catChip: { backgroundColor: `${Colors.greenPrimary}30`, paddingHorizontal: 12, paddingVertical: 4, borderRadius: Radius.full },
  catChipText: { color: Colors.greenLight, fontSize: 12, fontWeight: '700' },
  heroRating: { color: Colors.greenLight, fontSize: 14, fontWeight: '600' },
  statusLarge: { paddingHorizontal: 16, paddingVertical: 6, borderRadius: Radius.full },
  statusLargeText: { fontSize: 13, fontWeight: '700' },
  heroAccent: { width: 60, height: 3, backgroundColor: `${Colors.greenPrimary}60`, borderRadius: 2, marginTop: 16 },
  sectionLabel: { color: Colors.greenPrimary, fontSize: 11, fontWeight: '800', letterSpacing: 1.5, marginBottom: 10, marginTop: 4, paddingHorizontal: 4 },
  detailsCard: { backgroundColor: Colors.whitePure, borderRadius: 18, borderWidth: 1, borderColor: Colors.border, marginBottom: 20, overflow: 'hidden', ...Shadows.card },
  detailRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, gap: 10 },
  detailIcon: { width: 26, alignItems: 'center' },
  detailLabel: { color: Colors.textMuted, fontSize: 13, width: 90 },
  detailValue: { color: Colors.blackDeep, fontSize: 13, fontWeight: '600', textAlign: 'right', flex: 1 },
  detailMono: { fontFamily: 'monospace', fontSize: 12 },
  detailGold: { color: Colors.greenPrimary, fontWeight: '800', fontSize: 16 },
  rowDivider: { height: 1, backgroundColor: Colors.border, marginHorizontal: 16 },
  
  // PRICING STYLES
  pricingRow: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: Colors.border },
  pricingRowTotal: { backgroundColor: `${Colors.greenPrimary}20`, borderBottomWidth: 0 },
  pricingLabel: { color: Colors.textMuted, fontSize: 14 },
  pricingLabelBold: { color: Colors.greenPrimary, fontWeight: '800', fontSize: 15 },
  pricingValue: { color: Colors.blackDeep, fontSize: 14, fontWeight: '600', textAlign: 'right' },
  pricingValueBold: { color: Colors.greenPrimary, fontWeight: '800', fontSize: 15 },
  pricingTotalText: { color: Colors.blackDeep, fontWeight: '800', fontSize: 16 },
  
  agentCard: { backgroundColor: Colors.whitePure, borderRadius: 18, borderWidth: 1, borderColor: Colors.border, padding: 16, marginBottom: 20, ...Shadows.card },
  agentHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  kMark: { width: 28, height: 28, borderRadius: 14, backgroundColor: Colors.greenPrimary, alignItems: 'center', justifyContent: 'center' },
  agentTitle: { flex: 1, color: Colors.blackLight, fontSize: 11, fontWeight: '700', letterSpacing: 0.8 },
  toggleBtn: { color: Colors.greenPrimary, fontSize: 11, fontWeight: '700' },
  agentSteps: { marginTop: 14, gap: 10 },
  agentStepItem: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  agentDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.successGreen, marginTop: 5 },
  agentStepLabel: { color: Colors.blackLight, fontSize: 11, fontWeight: '600' },
  agentStepDone: { color: Colors.blackDeep, fontSize: 12, fontWeight: '700', marginTop: 1 },
  agentTotalRow: { borderTopWidth: 1, borderTopColor: Colors.border, marginTop: 8, paddingTop: 8 },
  agentTotal: { color: Colors.textMuted, fontSize: 10, textAlign: 'right' },
  mapPreview: { height: 180, borderRadius: 18, overflow: 'hidden', marginBottom: 20, backgroundColor: '#EEE8E0', position: 'relative', borderWidth: 1, borderColor: Colors.border },
  mapGrid: { flexDirection: 'row', flexWrap: 'wrap', position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  mapCell: { width: '12.5%', aspectRatio: 1, backgroundColor: '#F0EAE0' },
  mapCellAlt: { backgroundColor: '#E8E0D4' },
  mapPin: { position: 'absolute', top: '25%', left: '45%' },
  mapLabel: { position: 'absolute', bottom: 12, left: 12, backgroundColor: Colors.blackDeep, paddingHorizontal: 12, paddingVertical: 6, borderRadius: Radius.full },
  mapLabelText: { color: '#fff', fontSize: 11, fontWeight: '600' },
  bottomActions: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: Colors.whitePure, paddingHorizontal: 16, paddingVertical: 12, borderTopWidth: 1, borderTopColor: Colors.border, ...Shadows.darkHeader },
  actionRow: { flexDirection: 'row', gap: 10 },
  cancelBtn: { flex: 1, paddingVertical: 14, borderRadius: 14, borderWidth: 1.5, borderColor: Colors.errorRed, alignItems: 'center' },
  cancelBtnText: { color: Colors.errorRed, fontSize: 14, fontWeight: '700' },
  contactBtn: { flex: 2, paddingVertical: 14, borderRadius: 14, backgroundColor: Colors.greenPrimary, alignItems: 'center', ...Shadows.greenFloat },
  contactBtnText: { color: Colors.blackDeep, fontSize: 14, fontWeight: '800' },
});
