import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Shadows, Radius } from '../../constants/theme';
import { API_URL } from '../../constants/config';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const STATUS_CFG = {
  confirmed: { label: 'Confirmed', color: Colors.successGreen, bg: Colors.confirmedBg },
  in_progress: { label: 'In Progress', color: Colors.greenPrimary, bg: Colors.inProgressBg },
  pending: { label: 'Pending', color: Colors.pendingOrange, bg: Colors.pendingBg },
  completed: { label: 'Completed', color: Colors.done, bg: Colors.doneBg },
};

function formatMoney(amount) {
  if (!amount) return 'PKR --';
  return `PKR ${Number(amount).toLocaleString()}`;
}

export default function ScheduleScreen() {
  const [selectedDay, setSelectedDay] = useState(3);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadBookings() {
      try {
        const res = await fetch(`${API_URL}/api/bookings?limit=20`);
        const data = await res.json();
        if (data.success) {
          setBookings(data.bookings || []);
        }
      } catch (err) {
        console.warn('[WORKER SCHEDULE] load failed:', err.message);
        setBookings([]);
      } finally {
        setLoading(false);
      }
    }

    loadBookings();
  }, []);

  const grouped = useMemo(() => bookings.slice(0, 10), [bookings]);

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Schedule</Text>
        <Text style={styles.headerSub}>Live bookings</Text>
      </View>

      <View style={styles.dayRow}>
        {DAYS.map((day, i) => (
          <TouchableOpacity key={day} style={[styles.dayItem, selectedDay === i && styles.dayItemActive]} onPress={() => setSelectedDay(i)} activeOpacity={0.8}>
            <Text style={[styles.dayLabel, selectedDay === i && styles.dayLabelActive]}>{day}</Text>
            <Text style={[styles.dayDate, selectedDay === i && styles.dayDateActive]}>{i + 1}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView contentContainerStyle={styles.listContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionLabel}>LIVE JOBS</Text>
        {loading ? (
          <View style={styles.loadingWrap}><ActivityIndicator color={Colors.greenPrimary} /><Text style={styles.loadingText}>Schedule load ho rahi hai...</Text></View>
        ) : grouped.length === 0 ? (
          <View style={styles.emptyWrap}>
            <Text style={styles.emptyTitle}>No live schedule yet</Text>
            <Text style={styles.emptyText}>Backend bookings aayengi to yahan appear hongi.</Text>
          </View>
        ) : grouped.map((booking) => {
          const status = STATUS_CFG[booking.status] || STATUS_CFG.pending;
          return (
            <View key={booking.id || booking.booking_ref} style={styles.jobCard}>
              <View style={[styles.jobAccent, { backgroundColor: status.color }]} />
              <View style={styles.jobBody}>
                <View style={styles.jobTopRow}>
                  <Text style={styles.jobTime}>{booking.slot_time?.start || '--'} – {booking.slot_time?.end || '--'}</Text>
                  <View style={[styles.badge, { backgroundColor: status.bg }]}>
                    <Text style={[styles.badgeText, { color: status.color }]}>{status.label}</Text>
                  </View>
                </View>
                <Text style={styles.jobService}>{booking.service_display || booking.service_type || 'Service'}</Text>
                <Text style={styles.jobCustomer}>👤 {booking.worker_id || 'Worker not assigned'}</Text>
                <Text style={styles.jobLocation}>📍 {booking.location?.label || 'Location pending'}</Text>
                <View style={styles.jobDivider} />
                <View style={styles.jobFooter}>
                  <Text style={styles.jobPrice}>{formatMoney(booking.pricing?.final_price)}</Text>
                  <TouchableOpacity style={styles.viewBtn}><Text style={styles.viewBtnText}>View →</Text></TouchableOpacity>
                </View>
              </View>
            </View>
          );
        })}

        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Live Summary</Text>
          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}><Text style={styles.summaryVal}>{bookings.length}</Text><Text style={styles.summaryLbl}>Bookings</Text></View>
            <View style={styles.summaryItem}><Text style={styles.summaryVal}>{bookings.filter((booking) => booking.status === 'completed').length}</Text><Text style={styles.summaryLbl}>Completed</Text></View>
            <View style={styles.summaryItem}><Text style={styles.summaryVal}>{formatMoney(bookings.reduce((sum, booking) => sum + Number(booking.pricing?.final_price || 0), 0))}</Text><Text style={styles.summaryLbl}>Earnings</Text></View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.whiteSoft },
  header: { paddingHorizontal: 20, paddingTop: 18, paddingBottom: 14, backgroundColor: Colors.whitePure, borderBottomWidth: 1, borderBottomColor: Colors.border },
  headerTitle: { color: Colors.blackDeep, fontSize: 22, fontWeight: '800' },
  headerSub: { color: Colors.textMuted, fontSize: 13, marginTop: 2 },
  dayRow: { flexDirection: 'row', backgroundColor: Colors.whitePure, paddingHorizontal: 12, paddingVertical: 12, gap: 6, borderBottomWidth: 1, borderBottomColor: Colors.border },
  dayItem: { flex: 1, alignItems: 'center', paddingVertical: 10, borderRadius: Radius.md },
  dayItemActive: { backgroundColor: Colors.greenPrimary, borderRadius: Radius.md },
  dayLabel: { color: Colors.textMuted, fontSize: 11, fontWeight: '600', marginBottom: 4 },
  dayLabelActive: { color: Colors.blackDeep },
  dayDate: { color: Colors.blackDeep, fontSize: 16, fontWeight: '800' },
  dayDateActive: { color: Colors.blackDeep },
  listContent: { padding: 16, paddingBottom: 40 },
  sectionLabel: { color: Colors.greenPrimary, fontSize: 10, fontWeight: '800', letterSpacing: 1.5, marginBottom: 12 },
  loadingWrap: { alignItems: 'center', paddingVertical: 40 },
  loadingText: { color: Colors.textMuted, fontSize: 12, marginTop: 10 },
  jobCard: { backgroundColor: Colors.whitePure, borderRadius: Radius.lg, borderWidth: 1, borderColor: Colors.border, marginBottom: 12, flexDirection: 'row', overflow: 'hidden', ...Shadows.card },
  jobAccent: { width: 4 },
  jobBody: { flex: 1, padding: 16 },
  jobTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  jobTime: { fontSize: 14, fontWeight: '700', color: Colors.blackDeep },
  badge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: Radius.full },
  badgeText: { fontSize: 10, fontWeight: '700' },
  jobService: { fontSize: 16, fontWeight: '600', color: Colors.blackDeep, marginBottom: 6 },
  jobCustomer: { fontSize: 13, color: Colors.blackLight, marginBottom: 2 },
  jobLocation: { fontSize: 12, color: Colors.textMuted, marginBottom: 12 },
  jobDivider: { height: 1, backgroundColor: Colors.border, marginBottom: 12 },
  jobFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  jobPrice: { fontSize: 16, fontWeight: '700', color: Colors.greenPrimary },
  viewBtn: { backgroundColor: Colors.greenPrimary, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 10 },
  viewBtnText: { color: Colors.blackDeep, fontSize: 12, fontWeight: '800' },
  summaryCard: { backgroundColor: Colors.grayMatte, borderRadius: Radius.xl, padding: 20, marginTop: 8, ...Shadows.cardHeavy },
  summaryTitle: { color: Colors.textOnDark, fontSize: 16, fontWeight: '700', marginBottom: 16 },
  summaryRow: { flexDirection: 'row' },
  summaryItem: { flex: 1, alignItems: 'center' },
  summaryVal: { color: Colors.greenPrimary, fontSize: 18, fontWeight: '800', textAlign: 'center' },
  summaryLbl: { color: Colors.textMuted, fontSize: 11, marginTop: 4 },
  emptyWrap: { alignItems: 'center', paddingVertical: 40 },
  emptyTitle: { color: Colors.blackDeep, fontSize: 18, fontWeight: '700', marginTop: 12 },
  emptyText: { color: Colors.textMuted, fontSize: 12, marginTop: 6, textAlign: 'center' },
});