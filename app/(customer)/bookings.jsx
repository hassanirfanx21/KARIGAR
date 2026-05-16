import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Colors, Shadows, Spacing, Radius } from '../../constants/theme';
import { API_URL } from '../../constants/config';

const FILTER_TABS = ['Sab', 'Active', 'Mukammal', 'Cancel'];
const USER_ID = 'anonymous';
const STATUS_CFG = {
  confirmed: { label: 'Confirmed', color: Colors.successGreen, bg: Colors.confirmedBg, dot: '●' },
  pending: { label: 'Pending', color: Colors.pendingOrange, bg: Colors.pendingBg, dot: '●' },
  cancelled: { label: 'Cancelled', color: Colors.errorRed, bg: Colors.cancelledBg, dot: '●' },
  completed: { label: 'Mukammal', color: Colors.greenPrimary, bg: Colors.greenMuted, dot: '✓' },
};

function formatSlot(booking) {
  const date = booking?.slot_date || booking?.slot?.date || 'TBD';
  const start = booking?.slot_time?.start || booking?.slot?.start || '--';
  const end = booking?.slot_time?.end || booking?.slot?.end || '--';
  return { date, time: `${start} – ${end}` };
}

function BookingCard({ booking, onView }) {
  const cfg = STATUS_CFG[booking.status] || STATUS_CFG.pending;
  const slot = formatSlot(booking);
  return (
    <View style={styles.card}>
      <View style={[styles.cardAccent, { backgroundColor: cfg.color }]} />
      <View style={styles.cardTopRow}>
        <View style={styles.workerAvatar}><Text style={{ fontSize: 18 }}>👷</Text></View>
        <View style={{ flex: 1 }}>
          <View style={styles.cardTitleRow}>
            <Text style={styles.workerName}>{booking.service_display || booking.service_type || 'Service'}</Text>
            <View style={[styles.statusBadge, { backgroundColor: cfg.bg }]}>
              <Text style={[styles.statusText, { color: cfg.color }]}>{cfg.dot} {cfg.label}</Text>
            </View>
          </View>
          <Text style={styles.serviceLabel}>{booking.worker_id || 'Worker not assigned'}</Text>
        </View>
      </View>
      <View style={styles.cardDivider} />
      <View style={styles.metaRow}>
        <Text style={styles.metaText}>📅 {slot.date}</Text>
        <View style={styles.metaDot} />
        <Text style={styles.metaText}>⏰ {slot.time}</Text>
      </View>
      <View style={styles.cardFooter}>
        <View>
          <Text style={styles.amountLabel}>Total</Text>
          <Text style={styles.amountValue}>PKR {booking?.pricing?.final_price || '--'}</Text>
        </View>
        {(booking.status === 'confirmed' || booking.status === 'completed') && (
          <TouchableOpacity style={styles.btnView} onPress={() => onView?.(booking)} activeOpacity={0.85}>
            <Text style={styles.btnViewText}>Detail Dekhein →</Text>
          </TouchableOpacity>
        )}
        {booking.status === 'cancelled' && <Text style={styles.cancelNote}>Booking cancel ho gayi</Text>}
      </View>
      <Text style={styles.bookingId}>{booking.booking_ref || booking.id}</Text>
    </View>
  );
}

export default function BookingsScreen() {
  const router = useRouter();
  const [activeFilter, setActiveFilter] = useState('Sab');
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const filterMap = { Sab: null, Active: ['confirmed', 'pending', 'in_progress'], Mukammal: ['completed'], Cancel: ['cancelled'] };
  const filtered = filterMap[activeFilter] ? bookings.filter(b => filterMap[activeFilter].includes(b.status)) : bookings;

  useEffect(() => {
    async function loadBookings() {
      try {
        const res = await fetch(`${API_URL}/api/bookings?user_id=${USER_ID}`);
        const data = await res.json();
        setBookings(data.bookings || []);
      } catch {
        setBookings([]);
      } finally {
        setLoading(false);
      }
    }

    loadBookings();
  }, []);

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
          { label: 'Active', count: bookings.filter(b => ['confirmed', 'pending', 'in_progress'].includes(b.status)).length, color: Colors.successGreen },
          { label: 'Pending', count: bookings.filter(b => b.status === 'pending').length, color: Colors.pendingOrange },
          { label: 'Total', count: bookings.length, color: Colors.greenPrimary },
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
        {loading ? (
          <View style={styles.loadingWrap}>
            <ActivityIndicator color={Colors.greenPrimary} />
            <Text style={styles.loadingText}>Bookings load ho rahi hain...</Text>
          </View>
        ) : filtered.length === 0 ? (
          <View style={styles.emptyWrap}>
            <Text style={{ fontSize: 42 }}>📋</Text>
            <Text style={styles.emptyTitle}>Abhi tak koi booking nahi</Text>
          </View>
        ) : filtered.map(b => (
          <BookingCard
            key={b.id}
            booking={b}
            onView={() => router.push({ pathname: '/(customer)/booking-detail', params: { bookingId: b.booking_ref || b.id } })}
          />
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
  loadingWrap: { alignItems: 'center', paddingTop: 40 },
  loadingText: { color: Colors.textMuted, fontSize: 12, marginTop: 10 },
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
