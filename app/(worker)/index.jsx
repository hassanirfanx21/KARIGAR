import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Switch, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Colors, Shadows, Spacing, Radius } from '../../constants/theme';
import { API_URL } from '../../constants/config';

const STATUS = {
  confirmed: { label: 'CONFIRMED', color: Colors.confirmed, bg: Colors.confirmedBg },
  in_progress: { label: 'IN PROGRESS', color: Colors.greenPrimary, bg: Colors.inProgressBg },
  completed: { label: 'COMPLETED', color: Colors.done, bg: Colors.doneBg },
  pending: { label: 'PENDING', color: Colors.pendingOrange, bg: Colors.pendingBg },
};

function formatMoney(amount) {
  return amount ? `PKR ${Number(amount).toLocaleString()}` : 'PKR --';
}

export default function WorkerDashboardScreen() {
  const router = useRouter();
  const [isOnline, setIsOnline] = useState(true);
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
        console.warn('[WORKER DASHBOARD] load failed:', err.message);
        setBookings([]);
      } finally {
        setLoading(false);
      }
    }

    loadBookings();
  }, []);

  const liveAlert = useMemo(() => bookings.find((booking) => ['confirmed', 'pending', 'in_progress'].includes(booking.status)), [bookings]);
  const stats = useMemo(() => {
    const jobsDone = bookings.filter((booking) => booking.status === 'completed').length;
    const monthlyEarning = bookings.reduce((sum, booking) => sum + Number(booking.pricing?.final_price || 0), 0);
    return { jobsDone, monthlyEarning };
  }, [bookings]);

  return (
    <View style={styles.root}>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <SafeAreaView>
            <View style={styles.headerInner}>
              <View style={styles.headerTopRow}>
                <View>
                  <Text style={styles.greeting}>Assalamualaikum,</Text>
                  <Text style={styles.workerName}>Worker</Text>
                </View>
                <TouchableOpacity style={styles.notifBtn} onPress={() => router.push('/notifications')}>
                  <Text style={{ fontSize: 18 }}>🔔</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.toggleRow}>
                <View style={styles.toggleTextWrap}>
                  <Text style={[styles.toggleStatus, { color: isOnline ? Colors.greenPrimary : 'rgba(240,237,232,0.45)' }]}>{isOnline ? '● Online' : '○ Offline'}</Text>
                  <Text style={styles.toggleSub}>{isOnline ? 'Bookings chal rahi hain' : 'Bookings band hain'}</Text>
                </View>
                <Switch value={isOnline} onValueChange={setIsOnline} trackColor={{ false: Colors.darkBorder, true: Colors.greenPrimary }} thumbColor={isOnline ? Colors.blackDeep : Colors.textMuted} />
              </View>
              <View style={styles.statsRow}>
                <View style={styles.statCell}><Text style={styles.statVal}>{loading ? '…' : stats.jobsDone}</Text><Text style={styles.statLbl}>Jobs Done</Text></View>
                <View style={styles.statDiv} />
                <View style={styles.statCell}><Text style={styles.statValSm}>PKR</Text><Text style={styles.statVal}>{loading ? '…' : Number(stats.monthlyEarning).toLocaleString()}</Text><Text style={styles.statLbl}>This Month</Text></View>
                <View style={styles.statDiv} />
                <View style={styles.statCell}><Text style={styles.statVal}>{bookings.length ? '—' : '0.0'}</Text><Text style={styles.statLbl}>Rating</Text></View>
              </View>
            </View>
          </SafeAreaView>
        </View>

        <View style={styles.body}>
          {loading ? (
            <View style={styles.loadingCard}><ActivityIndicator color={Colors.greenPrimary} /><Text style={styles.loadingText}>Live bookings load ho rahi hain...</Text></View>
          ) : liveAlert ? (
            <View style={styles.alertCard}>
              <View style={styles.alertTopRow}>
                <View style={styles.alertIconBg}><Text style={{ fontSize: 18 }}>🔔</Text></View>
                <Text style={styles.alertTitle}>Live Booking</Text>
                <View style={styles.alertLivePill}><Text style={styles.alertLiveText}>LIVE</Text></View>
              </View>
              <Text style={styles.alertService}>{liveAlert.service_display || liveAlert.service_type || 'Service'}</Text>
              <View style={styles.alertDetails}>
                <View style={styles.alertDetailRow}><Text style={{ fontSize: 13 }}>⏰</Text><Text style={styles.alertDetailText}>{liveAlert.slot_date || 'TBD'}, {liveAlert.slot_time?.start || '--'} - {liveAlert.slot_time?.end || '--'}</Text></View>
                <View style={styles.alertDetailRow}><Text style={{ fontSize: 13 }}>📍</Text><Text style={styles.alertDetailText}>{liveAlert.location?.label || 'Location pending'}</Text></View>
              </View>
              <View style={styles.alertDistRow}><View style={styles.distDot} /><Text style={styles.alertDistText}>{formatMoney(liveAlert.pricing?.final_price)}</Text></View>
              <View style={styles.alertDivider} />
              <View style={styles.alertBtns}>
                <TouchableOpacity style={styles.acceptBtn} onPress={() => router.push({ pathname: '/(customer)/booking-detail', params: { bookingId: liveAlert.booking_ref || liveAlert.id } })} activeOpacity={0.85}>
                  <Text style={styles.acceptBtnText}>Detail</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.declineBtn} onPress={() => router.push('/(worker)/schedule')} activeOpacity={0.8}>
                  <Text style={styles.declineBtnText}>Schedule</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View style={styles.alertCard}>
              <Text style={styles.alertTitle}>No live bookings right now</Text>
              <Text style={styles.alertDetailText}>Backend data se booking aayegi to yahan appear hogi.</Text>
            </View>
          )}

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionLabel}>TODAY / RECENT BOOKINGS</Text>
            <TouchableOpacity onPress={() => router.push('/(worker)/schedule')}><Text style={styles.viewAll}>View All ›</Text></TouchableOpacity>
          </View>

          {bookings.length === 0 ? (
            <View style={styles.emptyCard}><Text style={styles.emptyText}>No bookings available</Text></View>
          ) : bookings.slice(0, 5).map((booking) => {
            const status = STATUS[booking.status] || STATUS.pending;
            return (
              <View key={booking.id || booking.booking_ref} style={styles.jobCard}>
                <View style={[styles.jobAccent, { backgroundColor: status.color }]} />
                <View style={styles.jobBody}>
                  <View style={styles.jobRow}>
                    <Text style={styles.jobTime}>{booking.slot_time?.start || '--'} – {booking.slot_time?.end || '--'}</Text>
                    <View style={[styles.statusBadge, { backgroundColor: status.bg }]}><Text style={[styles.statusText, { color: status.color }]}>{status.label}</Text></View>
                  </View>
                  <Text style={styles.jobService}>{booking.service_display || booking.service_type || 'Service'}</Text>
                  <Text style={styles.jobCustomer}>{booking.worker_id || 'Worker not assigned'}</Text>
                  <View style={styles.jobLocRow}><Text style={{ fontSize: 12 }}>📍</Text><Text style={styles.jobLocText}>{booking.location?.label || 'Location pending'}</Text></View>
                  <View style={styles.jobDivider} />
                  <View style={styles.jobFooter}>
                    <Text style={styles.jobPrice}>{formatMoney(booking.pricing?.final_price)}</Text>
                    <TouchableOpacity style={styles.detailsBtn} onPress={() => router.push({ pathname: '/(customer)/booking-detail', params: { bookingId: booking.booking_ref || booking.id } })}><Text style={styles.detailsBtnText}>Details ›</Text></TouchableOpacity>
                  </View>
                </View>
              </View>
            );
          })}
          <View style={{ height: 40 }} />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.whiteSoft },
  header: { backgroundColor: Colors.blackDeep, borderBottomLeftRadius: Radius.header, borderBottomRightRadius: Radius.header, ...Shadows.darkHeader },
  headerInner: { paddingHorizontal: Spacing.xxl, paddingTop: 20, paddingBottom: Spacing.xxl },
  headerTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
  greeting: { fontSize: 13, color: 'rgba(240,237,232,0.55)' },
  workerName: { fontSize: 28, color: Colors.textOnDark, fontWeight: '800', marginTop: 2 },
  notifBtn: { width: 42, height: 42, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.08)', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)' },
  toggleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: Radius.md, borderWidth: 1, borderColor: 'rgba(255,255,255,0.07)', paddingHorizontal: Spacing.lg, paddingVertical: 14, marginBottom: Spacing.lg },
  toggleTextWrap: { flex: 1, marginRight: 12 },
  toggleStatus: { fontSize: 14, fontWeight: '700', marginBottom: 2 },
  toggleSub: { fontSize: 12, color: 'rgba(240,237,232,0.45)' },
  statsRow: { flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: Radius.md, borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)', overflow: 'hidden' },
  statCell: { flex: 1, alignItems: 'center', paddingVertical: 14 },
  statVal: { fontSize: 16, color: Colors.textOnDark, fontWeight: '700' },
  statValSm: { fontSize: 10, color: 'rgba(240,237,232,0.5)', fontWeight: '500', marginBottom: -2 },
  statLbl: { fontSize: 10, color: 'rgba(240,237,232,0.45)', marginTop: 3, textAlign: 'center' },
  statDiv: { width: 0.5, backgroundColor: 'rgba(255,255,255,0.1)', marginVertical: 12 },
  body: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.xl },
  loadingCard: { backgroundColor: Colors.whitePure, borderRadius: Radius.xl, padding: 20, alignItems: 'center', marginBottom: Spacing.xxl, ...Shadows.card },
  loadingText: { marginTop: 10, color: Colors.textMuted, fontSize: 12 },
  alertCard: { backgroundColor: Colors.greenPrimary, borderRadius: Radius.xl, padding: Spacing.xl, marginBottom: Spacing.xxl, ...Shadows.greenFloat },
  alertTopRow: { flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.sm },
  alertIconBg: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(26,24,20,0.12)', alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  alertTitle: { fontSize: 20, fontWeight: '700', color: Colors.blackDeep, flex: 1 },
  alertLivePill: { backgroundColor: Colors.blackDeep, borderRadius: Radius.full, paddingHorizontal: 8, paddingVertical: 3 },
  alertLiveText: { fontSize: 10, color: Colors.greenPrimary, fontWeight: '700', letterSpacing: 1 },
  alertService: { fontSize: 17, fontWeight: '600', color: Colors.blackDeep, marginBottom: Spacing.md },
  alertDetails: { marginBottom: Spacing.sm },
  alertDetailRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 5 },
  alertDetailText: { fontSize: 13, color: Colors.blackMid },
  alertDistRow: { flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.lg },
  distDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.blackDeep, marginRight: 8 },
  alertDistText: { fontSize: 13, color: Colors.blackMid, fontWeight: '500' },
  alertDivider: { height: 1, backgroundColor: 'rgba(26,24,20,0.12)', marginBottom: Spacing.lg },
  alertBtns: { flexDirection: 'row', gap: 10 },
  acceptBtn: { flex: 1, backgroundColor: Colors.whitePure, borderRadius: Radius.md, height: 46, alignItems: 'center', justifyContent: 'center', elevation: 2 },
  acceptBtnText: { fontSize: 14, fontWeight: '700', color: Colors.blackDeep },
  declineBtn: { flex: 1, borderWidth: 1.5, borderColor: Colors.blackDeep, borderRadius: Radius.md, height: 46, alignItems: 'center', justifyContent: 'center' },
  declineBtnText: { fontSize: 14, fontWeight: '700', color: Colors.blackDeep },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: Spacing.md },
  sectionLabel: { fontSize: 11, fontWeight: '700', color: Colors.greenPrimary, letterSpacing: 1.5 },
  viewAll: { fontSize: 13, color: Colors.greenPrimary, fontWeight: '500' },
  jobCard: { backgroundColor: Colors.whitePure, borderRadius: Radius.lg, borderWidth: 1, borderColor: Colors.borderLight, marginBottom: 12, flexDirection: 'row', overflow: 'hidden', ...Shadows.card },
  jobAccent: { width: 4 },
  jobBody: { flex: 1, padding: Spacing.lg },
  jobRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 },
  jobTime: { fontSize: 17, fontWeight: '700', color: Colors.textDark },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: Radius.full },
  statusText: { fontSize: 10, fontWeight: '700', letterSpacing: 0.6 },
  jobService: { fontSize: 16, fontWeight: '600', color: Colors.textDark, marginBottom: 2 },
  jobCustomer: { fontSize: 13, color: Colors.textMedium, marginBottom: Spacing.sm },
  jobLocRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 6, marginBottom: Spacing.md },
  jobLocText: { fontSize: 12, color: Colors.textMuted, flex: 1, lineHeight: 18 },
  jobDivider: { height: 1, backgroundColor: Colors.borderLight, marginBottom: Spacing.md },
  jobFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  jobPrice: { fontSize: 16, fontWeight: '700', color: Colors.greenPrimary },
  detailsBtn: { borderWidth: 1.5, borderColor: Colors.borderLight, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 7 },
  detailsBtnText: { fontSize: 12, fontWeight: '700', color: Colors.textDark },
  emptyCard: { backgroundColor: Colors.whitePure, borderRadius: Radius.lg, padding: 20, alignItems: 'center', ...Shadows.card },
  emptyText: { color: Colors.textMuted, fontSize: 13 },
});