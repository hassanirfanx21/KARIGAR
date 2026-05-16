import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Shadows, Spacing, Radius } from '../../constants/theme';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const DATES = [12, 13, 14, 15, 16, 17, 18];

const SCHEDULE = [
  { id: '1', time: '10:00 AM – 12:00 PM', service: 'Electrician Repair', customer: 'Ali Hassan', location: 'Gulberg III', status: 'confirmed', price: 1500 },
  { id: '2', time: '02:00 PM – 04:00 PM', service: 'AC Maintenance', customer: 'Sara Ahmed', location: 'DHA Phase 6', status: 'in_progress', price: 2500 },
  { id: '3', time: '05:30 PM – 07:00 PM', service: 'Plumbing Repair', customer: 'Usman Malik', location: 'MM Alam Road', status: 'pending', price: 1200 },
];

const STATUS_CFG = {
  confirmed: { label: 'Confirmed', color: Colors.successGreen, bg: Colors.confirmedBg },
  in_progress: { label: 'In Progress', color: Colors.greenPrimary, bg: Colors.inProgressBg },
  pending: { label: 'Pending', color: Colors.pendingOrange, bg: Colors.pendingBg },
};

export default function ScheduleScreen() {
  const [selectedDay, setSelectedDay] = useState(3);

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Schedule</Text>
        <Text style={styles.headerSub}>May 2025</Text>
      </View>

      {/* Day Selector */}
      <View style={styles.dayRow}>
        {DAYS.map((day, i) => (
          <TouchableOpacity key={i} style={[styles.dayItem, selectedDay === i && styles.dayItemActive]}
            onPress={() => setSelectedDay(i)} activeOpacity={0.8}>
            <Text style={[styles.dayLabel, selectedDay === i && styles.dayLabelActive]}>{day}</Text>
            <Text style={[styles.dayDate, selectedDay === i && styles.dayDateActive]}>{DATES[i]}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Schedule List */}
      <ScrollView contentContainerStyle={styles.listContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionLabel}>AAJ KE JOBS</Text>
        {SCHEDULE.map((job, i) => {
          const s = STATUS_CFG[job.status];
          return (
            <View key={job.id} style={styles.jobCard}>
              <View style={[styles.jobAccent, { backgroundColor: Colors.greenPrimary }]} />
              <View style={styles.jobBody}>
                <View style={styles.jobTopRow}>
                  <Text style={styles.jobTime}>{job.time}</Text>
                  <View style={[styles.badge, { backgroundColor: s.bg }]}>
                    <Text style={[styles.badgeText, { color: s.color }]}>{s.label}</Text>
                  </View>
                </View>
                <Text style={styles.jobService}>{job.service}</Text>
                <Text style={styles.jobCustomer}>👤 {job.customer}</Text>
                <Text style={styles.jobLocation}>📍 {job.location}</Text>
                <View style={styles.jobDivider} />
                <View style={styles.jobFooter}>
                  <Text style={styles.jobPrice}>PKR {job.price.toLocaleString()}</Text>
                  <TouchableOpacity style={styles.viewBtn}><Text style={styles.viewBtnText}>View →</Text></TouchableOpacity>
                </View>
              </View>
            </View>
          );
        })}

        {/* Summary */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Aaj ka Summary</Text>
          <View style={styles.summaryRow}>
            {[{ l: 'Jobs', v: '3' }, { l: 'Earnings', v: 'PKR 5,200' }, { l: 'Hours', v: '6.5' }].map(s => (
              <View key={s.l} style={styles.summaryItem}>
                <Text style={styles.summaryVal}>{s.v}</Text>
                <Text style={styles.summaryLbl}>{s.l}</Text>
              </View>
            ))}
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
  summaryVal: { color: Colors.greenPrimary, fontSize: 20, fontWeight: '800' },
  summaryLbl: { color: Colors.textMuted, fontSize: 11, marginTop: 4 },
});
