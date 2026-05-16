import React, { useState, useRef, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, TouchableHighlight,
  Animated, StatusBar, Platform, Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Colors, Shadows, Spacing, Radius, FontSize } from '../../constants/theme';

const { width: W } = Dimensions.get('window');

const STATUS = {
  confirmed:   { label: 'CONFIRMED',   color: Colors.confirmed,  bg: Colors.confirmedBg  },
  in_progress: { label: 'IN PROGRESS', color: Colors.greenPrimary, bg: Colors.inProgressBg },
  completed:   { label: 'COMPLETED',   color: Colors.done,       bg: Colors.doneBg       },
  pending:     { label: 'PENDING',     color: Colors.pendingOrange, bg: Colors.pendingBg  },
};

const BOOKING_ALERT = { id: '1', service: 'Plumbing Repair', date: 'Today', time: '05:00 PM', location: 'Johar Town, Block A', distance: '2.1 km aap se' };

const TODAY_JOBS = [
  { id: '1', timeStart: '10:00 AM', timeEnd: '12:00 PM', service: 'Electrician Repair', customer: 'Ali Hassan', location: 'House 42, Street 5, Gulberg', status: 'confirmed', price: 1500 },
  { id: '2', timeStart: '02:00 PM', timeEnd: '04:00 PM', service: 'AC Service & Maintenance', customer: 'Sara Ahmed', location: 'DHA Phase 6, Block C', status: 'in_progress', price: 2500 },
  { id: '3', timeStart: '05:30 PM', timeEnd: '07:00 PM', service: 'Plumbing Repair', customer: 'Usman Malik', location: 'Gulberg III, MM Alam Road', status: 'pending', price: 1200 },
];

function AvailabilityToggle({ isOn, onToggle }) {
  const anim = useRef(new Animated.Value(isOn ? 1 : 0)).current;
  const handlePress = useCallback(() => {
    Animated.spring(anim, { toValue: isOn ? 0 : 1, useNativeDriver: false, tension: 70, friction: 9 }).start();
    onToggle();
  }, [isOn, onToggle, anim]);
  const trackBg = anim.interpolate({ inputRange: [0, 1], outputRange: ['rgba(255,255,255,0.10)', Colors.greenPrimary] });
  const thumbX = anim.interpolate({ inputRange: [0, 1], outputRange: [3, 30] });

  return (
    <TouchableOpacity onPress={handlePress} activeOpacity={0.9} style={styles.toggleRow}>
      <View style={styles.toggleTextWrap}>
        <Text style={[styles.toggleStatus, { color: isOn ? Colors.greenPrimary : 'rgba(240,237,232,0.45)' }]}>{isOn ? '● Online' : '○ Offline'}</Text>
        <Text style={styles.toggleSub}>{isOn ? 'Bookings chal rahi hain' : 'Bookings band hain'}</Text>
      </View>
      <Animated.View style={[styles.toggleTrack, { backgroundColor: trackBg }]}>
        <Animated.View style={[styles.toggleThumb, { transform: [{ translateX: thumbX }] }]} />
      </Animated.View>
    </TouchableOpacity>
  );
}

function StatsRow({ rating, jobsDone, monthlyEarning }) {
  return (
    <View style={styles.statsRow}>
      <View style={styles.statCell}><Text style={{ fontSize: 13 }}>⭐</Text><Text style={styles.statVal}>{rating.toFixed(1)}</Text><Text style={styles.statLbl}>Rating</Text></View>
      <View style={styles.statDiv} />
      <View style={styles.statCell}><Text style={styles.statVal}>{jobsDone}</Text><Text style={styles.statLbl}>Jobs Done</Text></View>
      <View style={styles.statDiv} />
      <View style={styles.statCell}><Text style={styles.statValSm}>PKR</Text><Text style={styles.statVal}>{monthlyEarning.toLocaleString()}</Text><Text style={styles.statLbl}>This Month</Text></View>
    </View>
  );
}

export default function WorkerDashboardScreen() {
  const router = useRouter();
  const [isOnline, setIsOnline] = useState(true);
  const [hasAlert, setHasAlert] = useState(true);

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.blackDeep} />
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
        {/* Dark Header */}
        <View style={styles.header}>
          <SafeAreaView>
            <View style={styles.headerInner}>
              <View style={styles.headerTopRow}>
                <View>
                  <Text style={styles.greeting}>Assalamualaikum,</Text>
                  <Text style={styles.workerName}>Ahmed Khan</Text>
                </View>
                <TouchableOpacity style={styles.notifBtn} onPress={() => router.push('/notifications')}>
                  <Text style={{ fontSize: 18 }}>🔔</Text>
                  <View style={styles.notifDot} />
                </TouchableOpacity>
              </View>
              <AvailabilityToggle isOn={isOnline} onToggle={() => setIsOnline(p => !p)} />
              <StatsRow rating={4.8} jobsDone={47} monthlyEarning={12400} />
            </View>
          </SafeAreaView>
        </View>

        {/* Body */}
        <View style={styles.body}>
          {/* Booking Alert */}
          {hasAlert && (
            <View style={styles.alertCard}>
              <View style={styles.alertTopRow}>
                <View style={styles.alertIconBg}><Text style={{ fontSize: 18 }}>🔔</Text></View>
                <Text style={styles.alertTitle}>Nai Booking!</Text>
                <View style={styles.alertLivePill}><Text style={styles.alertLiveText}>LIVE</Text></View>
              </View>
              <Text style={styles.alertService}>{BOOKING_ALERT.service}</Text>
              <View style={styles.alertDetails}>
                <View style={styles.alertDetailRow}><Text style={{ fontSize: 13 }}>⏰</Text><Text style={styles.alertDetailText}>{BOOKING_ALERT.date}, {BOOKING_ALERT.time}</Text></View>
                <View style={styles.alertDetailRow}><Text style={{ fontSize: 13 }}>📍</Text><Text style={styles.alertDetailText}>{BOOKING_ALERT.location}</Text></View>
              </View>
              <View style={styles.alertDistRow}><View style={styles.distDot} /><Text style={styles.alertDistText}>{BOOKING_ALERT.distance}</Text></View>
              <View style={styles.alertDivider} />
              <View style={styles.alertBtns}>
                <TouchableHighlight style={styles.acceptBtn} onPress={() => setHasAlert(false)} underlayColor="rgba(0,0,0,0.06)">
                  <Text style={styles.acceptBtnText}>✓ Qabool Karo</Text>
                </TouchableHighlight>
                <TouchableOpacity style={styles.declineBtn} onPress={() => setHasAlert(false)} activeOpacity={0.8}>
                  <Text style={styles.declineBtnText}>✕ Mana Karo</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Schedule */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionLabel}>AAJ KA SCHEDULE</Text>
            <TouchableOpacity onPress={() => router.push('/(worker)/schedule')}><Text style={styles.viewAll}>View All ›</Text></TouchableOpacity>
          </View>

          {TODAY_JOBS.map(job => {
            const s = STATUS[job.status];
            return (
              <View key={job.id} style={styles.jobCard}>
                <View style={[styles.jobAccent, { backgroundColor: job.status === 'completed' ? Colors.done : Colors.greenPrimary }]} />
                <View style={styles.jobBody}>
                  <View style={styles.jobRow}>
                    <Text style={styles.jobTime}>{job.timeStart} – {job.timeEnd}</Text>
                    <View style={[styles.statusBadge, { backgroundColor: s.bg }]}><Text style={[styles.statusText, { color: s.color }]}>{s.label}</Text></View>
                  </View>
                  <Text style={styles.jobService}>{job.service}</Text>
                  <Text style={styles.jobCustomer}>{job.customer}</Text>
                  <View style={styles.jobLocRow}><Text style={{ fontSize: 12 }}>📍</Text><Text style={styles.jobLocText}>{job.location}</Text></View>
                  <View style={styles.jobDivider} />
                  <View style={styles.jobFooter}>
                    <Text style={styles.jobPrice}>PKR {job.price.toLocaleString()}</Text>
                    <TouchableOpacity style={styles.detailsBtn}><Text style={styles.detailsBtnText}>Details ›</Text></TouchableOpacity>
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
  headerInner: { paddingHorizontal: Spacing.xxl, paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight ?? 24) + 12 : 20, paddingBottom: Spacing.xxl },
  headerTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
  greeting: { fontSize: 13, color: 'rgba(240,237,232,0.55)' },
  workerName: { fontSize: 28, color: Colors.textOnDark, fontWeight: '800', marginTop: 2 },
  notifBtn: { width: 42, height: 42, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.08)', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)' },
  notifDot: { position: 'absolute', top: 8, right: 8, width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.greenPrimary },
  toggleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: Radius.md, borderWidth: 1, borderColor: 'rgba(255,255,255,0.07)', paddingHorizontal: Spacing.lg, paddingVertical: 14, marginBottom: Spacing.lg },
  toggleTextWrap: { flex: 1, marginRight: 12 },
  toggleStatus: { fontSize: 14, fontWeight: '700', marginBottom: 2 },
  toggleSub: { fontSize: 12, color: 'rgba(240,237,232,0.45)' },
  toggleTrack: { width: 58, height: 30, borderRadius: 15, justifyContent: 'center' },
  toggleThumb: { width: 24, height: 24, borderRadius: 12, backgroundColor: Colors.whitePure, elevation: 3 },
  statsRow: { flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: Radius.md, borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)', overflow: 'hidden' },
  statCell: { flex: 1, alignItems: 'center', paddingVertical: 14 },
  statVal: { fontSize: 16, color: Colors.textOnDark, fontWeight: '700' },
  statValSm: { fontSize: 10, color: 'rgba(240,237,232,0.5)', fontWeight: '500', marginBottom: -2 },
  statLbl: { fontSize: 10, color: 'rgba(240,237,232,0.45)', marginTop: 3, textAlign: 'center' },
  statDiv: { width: 0.5, backgroundColor: 'rgba(255,255,255,0.1)', marginVertical: 12 },
  body: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.xl },
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
});
