import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Colors, Shadows, Spacing, Radius } from '../../constants/theme';

const FILTER_TABS = ['Sab', 'Active', 'Mukammal', 'Cancel'];
const BOOKINGS = [
  { id: 'bk1', worker: 'Ali AC Services', service: 'AC Repair', date: 'Aaj, 15 May', time: '2:00 PM – 4:00 PM', status: 'confirmed', amount: 'Rs. 1,500', bookingId: 'BK-0047', emoji: '❄️' },
  { id: 'bk2', worker: 'Sara Services', service: 'Home Cleaning', date: 'Kal, 16 May', time: '10:00 AM – 12:00 PM', status: 'pending', amount: 'Rs. 2,000', bookingId: 'BK-0048', emoji: '🧹' },
  { id: 'bk3', worker: 'Bilal Fixer', service: 'Plumbing', date: '10 May 2025', time: '11:00 AM', status: 'cancelled', amount: 'Rs. 800', bookingId: 'BK-0039', emoji: '🔧' },
  { id: 'bk4', worker: 'Tariq Electric', service: 'Electrician', date: '5 May 2025', time: '9:00 AM – 11:00 AM', status: 'completed', amount: 'Rs. 1,200', bookingId: 'BK-0031', emoji: '⚡' },
];
const STATUS_CFG = {
  confirmed: { label: 'Confirmed', color: Colors.successGreen, bg: Colors.confirmedBg, dot: '●' },
  pending: { label: 'Pending', color: Colors.pendingOrange, bg: Colors.pendingBg, dot: '●' },
  cancelled: { label: 'Cancelled', color: Colors.errorRed, bg: Colors.cancelledBg, dot: '●' },
  completed: { label: 'Mukammal', color: Colors.greenPrimary, bg: Colors.greenMuted, dot: '✓' },
};

function BookingCard({ booking, onView }) {
  const cfg = STATUS_CFG[booking.status];
  return (
    <View style={styles.card}>
      <View style={[styles.cardAccent, { backgroundColor: cfg.color }]} />
      <View style={styles.cardTopRow}>
        <View style={styles.workerAvatar}><Text style={{ fontSize: 24 }}>{booking.emoji}</Text></View>
        <View style={{ flex: 1 }}>
          <View style={styles.cardTitleRow}>
            <Text style={styles.workerName}>{booking.worker}</Text>
            <View style={[styles.statusBadge, { backgroundColor: cfg.bg }]}>
              <Text style={[styles.statusText, { color: cfg.color }]}>{cfg.dot} {cfg.label}</Text>
            </View>
          </View>
          <Text style={styles.serviceLabel}>{booking.service}</Text>
        </View>
      </View>
      <View style={styles.cardDivider} />
      <View style={styles.metaRow}>
        <Text style={styles.metaText}>📅 {booking.date}</Text>
        <View style={styles.metaDot} />
        <Text style={styles.metaText}>⏰ {booking.time}</Text>
      </View>
      <View style={styles.cardFooter}>
        <View>
          <Text style={styles.amountLabel}>Total</Text>
          <Text style={styles.amountValue}>{booking.amount}</Text>
        </View>
        {(booking.status === 'confirmed' || booking.status === 'completed') && (
          <TouchableOpacity style={styles.btnView} onPress={() => onView?.(booking)} activeOpacity={0.85}>
            <Text style={styles.btnViewText}>Detail Dekhein →</Text>
          </TouchableOpacity>
        )}
        {booking.status === 'cancelled' && <Text style={styles.cancelNote}>Booking cancel ho gayi</Text>}
      </View>
      <Text style={styles.bookingId}>{booking.bookingId}</Text>
    </View>
  );
}

export default function BookingsScreen() {
  const router = useRouter();
  const [activeFilter, setActiveFilter] = useState('Sab');
  const filterMap = { Sab: null, Active: ['confirmed', 'pending'], Mukammal: ['completed'], Cancel: ['cancelled'] };
  const filtered = filterMap[activeFilter] ? BOOKINGS.filter(b => filterMap[activeFilter].includes(b.status)) : BOOKINGS;

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Meri Bookings</Text>
          <Text style={styles.headerSub}>Apni service appointments manage karein</Text>
        </View>
      </View>
      <View style={styles.summaryRow}>
        {[
          { label: 'Active', count: BOOKINGS.filter(b => ['confirmed', 'pending'].includes(b.status)).length, color: Colors.successGreen },
          { label: 'Pending', count: BOOKINGS.filter(b => b.status === 'pending').length, color: Colors.pendingOrange },
          { label: 'Total', count: BOOKINGS.length, color: Colors.greenPrimary },
        ].map(p => (
          <View key={p.label} style={styles.summaryPill}>
            <Text style={[styles.summaryCount, { color: p.color }]}>{p.count}</Text>
            <Text style={styles.summaryLabel}>{p.label}</Text>
          </View>
        ))}
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow} style={{ flexGrow: 0 }}>
        {FILTER_TABS.map(tab => (
          <TouchableOpacity key={tab} onPress={() => setActiveFilter(tab)}
            style={[styles.filterChip, activeFilter === tab && styles.filterChipActive]} activeOpacity={0.8}>
            <Text style={[styles.filterChipText, activeFilter === tab && styles.filterChipTextActive]}>{tab}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      <ScrollView contentContainerStyle={styles.listContent} showsVerticalScrollIndicator={false}>
        {filtered.length === 0 ? (
          <View style={styles.emptyWrap}>
            <Text style={{ fontSize: 42 }}>📋</Text>
            <Text style={styles.emptyTitle}>Abhi tak koi booking nahi</Text>
          </View>
        ) : filtered.map(b => (
          <BookingCard key={b.id} booking={b} onView={() => router.push('/(customer)/booking-detail')} />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.whiteSoft },
  header: { paddingHorizontal: 20, paddingTop: 18, paddingBottom: 14, backgroundColor: Colors.whitePure, borderBottomWidth: 1, borderBottomColor: Colors.border },
  headerTitle: { color: Colors.blackDeep, fontSize: 22, fontWeight: '800' },
  headerSub: { color: Colors.textMuted, fontSize: 12, marginTop: 2 },
  summaryRow: { flexDirection: 'row', backgroundColor: Colors.whitePure, paddingHorizontal: 20, paddingBottom: 14, borderBottomWidth: 1, borderBottomColor: Colors.border },
  summaryPill: { flex: 1, alignItems: 'center', paddingVertical: 8, borderRightWidth: 1, borderRightColor: Colors.border },
  summaryCount: { fontSize: 22, fontWeight: '800' },
  summaryLabel: { color: Colors.textMuted, fontSize: 11, fontWeight: '600', marginTop: 2 },
  filterRow: { paddingHorizontal: 16, paddingVertical: 12, gap: 8, backgroundColor: Colors.whitePure },
  filterChip: { paddingHorizontal: 18, paddingVertical: 8, borderRadius: Radius.full, backgroundColor: Colors.whiteSoft, borderWidth: 1, borderColor: Colors.border },
  filterChipActive: { backgroundColor: Colors.greenPrimary, borderColor: Colors.greenPrimary },
  filterChipText: { color: Colors.blackLight, fontSize: 13, fontWeight: '600' },
  filterChipTextActive: { color: Colors.whitePure },
  listContent: { padding: 16, gap: 14 },
  card: { backgroundColor: Colors.whitePure, borderRadius: 20, borderWidth: 1, borderColor: Colors.border, overflow: 'hidden', ...Shadows.card },
  cardAccent: { height: 3, width: '100%' },
  cardTopRow: { flexDirection: 'row', alignItems: 'center', padding: 16, gap: 12 },
  workerAvatar: { width: 52, height: 52, borderRadius: 26, backgroundColor: Colors.grayMatte, alignItems: 'center', justifyContent: 'center' },
  cardTitleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginBottom: 4 },
  workerName: { color: Colors.blackDeep, fontSize: 15, fontWeight: '700', flex: 1 },
  statusBadge: { paddingHorizontal: 9, paddingVertical: 3, borderRadius: Radius.full },
  statusText: { fontSize: 10, fontWeight: '800' },
  serviceLabel: { color: Colors.blackLight, fontSize: 13 },
  cardDivider: { height: 1, backgroundColor: Colors.border, marginHorizontal: 16 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 16, paddingVertical: 12 },
  metaText: { color: Colors.blackLight, fontSize: 12, fontWeight: '500' },
  metaDot: { width: 4, height: 4, borderRadius: 2, backgroundColor: Colors.border },
  cardFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingBottom: 14, paddingTop: 4 },
  amountLabel: { color: Colors.textMuted, fontSize: 10, fontWeight: '600' },
  amountValue: { color: Colors.greenPrimary, fontSize: 16, fontWeight: '800' },
  btnView: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 10, backgroundColor: Colors.greenPrimary, ...Shadows.greenFloat },
  btnViewText: { color: Colors.blackDeep, fontSize: 12, fontWeight: '800' },
  cancelNote: { color: Colors.textMuted, fontSize: 12, fontStyle: 'italic' },
  bookingId: { color: Colors.textMuted, fontSize: 10, fontFamily: 'monospace', paddingHorizontal: 16, paddingBottom: 10 },
  emptyWrap: { alignItems: 'center', paddingTop: 60 },
  emptyTitle: { color: Colors.blackDeep, fontSize: 18, fontWeight: '700', marginTop: 12 },
});
