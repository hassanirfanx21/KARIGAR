import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, TextInput,
  StyleSheet, Dimensions, StatusBar, KeyboardAvoidingView, Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Bell, MapPin } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { Colors, Shadows, Spacing, Radius } from '../../constants/theme';

const { width: W } = Dimensions.get('window');

const SERVICES = [
  { id: 'ac', emoji: '❄️', label: 'AC Repair' },
  { id: 'plumber', emoji: '🔧', label: 'Plumber' },
  { id: 'electric', emoji: '⚡', label: 'Electrician' },
  { id: 'clean', emoji: '🧹', label: 'Cleaning' },
  { id: 'paint', emoji: '🎨', label: 'Painter' },
  { id: 'carpenter', emoji: '🔨', label: 'Carpenter' },
];

const ACTIVE_BOOKING = {
  worker: 'Ali AC Services',
  service: 'AC Repair',
  date: 'Aaj, 3:00 PM',
  status: 'confirmed',
};

export default function CustomerHomeScreen() {
  const router = useRouter();
  const [message, setMessage] = useState('');
  const [activeChip, setActiveChip] = useState(null);

  const handleSend = () => {
    if (message.trim()) {
      router.push({ pathname: '/(customer)/agent-working', params: { message: message.trim() } });
      setMessage('');
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <StatusBar barStyle="light-content" backgroundColor={Colors.blackDeep} />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

        {/* ═══ DARK HEADER ═══ */}
        <View style={styles.headerSection}>
          <SafeAreaView edges={['top']}>
            <View style={styles.headerInner}>
              <View style={styles.topRow}>
                <View>
                  <Text style={styles.greeting}>Assalamualaikum,</Text>
                  <Text style={styles.userName}>Ahmed Khan 👋</Text>
                </View>
                <TouchableOpacity style={styles.notifBtn} onPress={() => router.push('/notifications')}>
                  <Bell size={20} color={Colors.textOnDark} />
                  <View style={styles.notifDot} />
                </TouchableOpacity>
              </View>

              {/* Location */}
              <View style={styles.locationRow}>
                <MapPin size={14} color={Colors.textMuted} />
                <Text style={styles.locationText}>G-13, Islamabad</Text>
                <Text style={styles.locationChange}>Badlein</Text>
              </View>
            </View>
          </SafeAreaView>
        </View>

        {/* ═══ SERVICE SHORTCUTS ═══ */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>SERVICES</Text>
          <Text style={styles.sectionTitle}>Kya chahiye aaj?</Text>

          <ScrollView horizontal showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.serviceRow}>
            {SERVICES.map(s => (
              <TouchableOpacity key={s.id}
                style={[styles.serviceChip, activeChip === s.id && styles.serviceChipActive]}
                onPress={() => {
                  setActiveChip(s.id);
                  setMessage(`${s.label} chahiye`);
                }}
                activeOpacity={0.8}>
                <View style={[styles.serviceEmoji, activeChip === s.id && styles.serviceEmojiActive]}>
                  <Text style={{ fontSize: 22 }}>{s.emoji}</Text>
                </View>
                <Text style={[styles.serviceLabel, activeChip === s.id && styles.serviceLabelActive]}>
                  {s.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* ═══ ACTIVE BOOKING ═══ */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>ACTIVE BOOKING</Text>
          <TouchableOpacity style={styles.bookingCard} activeOpacity={0.9}
            onPress={() => router.push('/(customer)/booking-detail')}>
            <View style={styles.bookingTopRow}>
              <View style={styles.bookingAvatar}>
                <Text style={{ fontSize: 22 }}>👷</Text>
              </View>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={styles.bookingWorker}>{ACTIVE_BOOKING.worker}</Text>
                <Text style={styles.bookingService}>{ACTIVE_BOOKING.service}</Text>
              </View>
              <View style={styles.statusBadge}>
                <Text style={styles.statusText}>● Confirmed</Text>
              </View>
            </View>
            <View style={styles.bookingDivider} />
            <View style={styles.bookingBottomRow}>
              <Text style={styles.bookingDate}>📅 {ACTIVE_BOOKING.date}</Text>
              <Text style={styles.bookingCta}>Detail →</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* ═══ NEARBY KARIGAR ═══ */}
        <View style={styles.section}>
          <TouchableOpacity style={styles.nearbyCard} activeOpacity={0.9}
            onPress={() => router.push('/(customer)/map')}>
            <View style={styles.nearbyInner}>
              <Text style={{ fontSize: 28, marginBottom: 8 }}>📍</Text>
              <Text style={styles.nearbyTitle}>Aas Paas ke Karigar</Text>
              <Text style={styles.nearbySub}>5 karigar qareeb mein available</Text>
            </View>
            <Text style={styles.nearbyArrow}>→</Text>
          </TouchableOpacity>
        </View>

        {/* ═══ HOW IT WORKS ═══ */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>KAISE KAAM KARTA HAI</Text>
          <View style={styles.stepsRow}>
            {[
              { n: '1', t: 'Bolo', d: 'Zaroorat batayen' },
              { n: '2', t: 'Match', d: 'AI dhundhega' },
              { n: '3', t: 'Done', d: 'Booking hogayi' },
            ].map((s, i) => (
              <View key={i} style={styles.stepCard}>
                <View style={styles.stepNum}><Text style={styles.stepNumText}>{s.n}</Text></View>
                <Text style={styles.stepTitle}>{s.t}</Text>
                <Text style={styles.stepDesc}>{s.d}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* ═══ STICKY AI INPUT ═══ */}
      <View style={styles.inputBar}>
        <View style={styles.inputRow}>
          <View style={styles.kMark}>
            <Text style={{ color: Colors.blackDeep, fontWeight: '900', fontSize: 10 }}>K</Text>
          </View>
          <TextInput
            style={styles.textInput}
            placeholder="Bolo kya chahiye..."
            placeholderTextColor={Colors.textMuted}
            value={message}
            onChangeText={setMessage}
            onSubmitEditing={handleSend}
          />
          <TouchableOpacity style={[styles.sendBtn, !message.trim() && { opacity: 0.3 }]}
            onPress={handleSend} disabled={!message.trim()} activeOpacity={0.85}>
            <Text style={styles.sendBtnText}>→</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.whiteSoft },
  scroll: { flexGrow: 1 },

  headerSection: {
    backgroundColor: Colors.blackDeep,
    borderBottomLeftRadius: Radius.header, borderBottomRightRadius: Radius.header,
    ...Shadows.darkHeader,
  },
  headerInner: { paddingHorizontal: Spacing.xl, paddingBottom: Spacing.xxl, paddingTop: 8 },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
  greeting: { color: 'rgba(240,237,232,0.5)', fontSize: 13 },
  userName: { color: Colors.textOnDark, fontSize: 22, fontWeight: '800', marginTop: 2 },
  notifBtn: {
    width: 42, height: 42, borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)',
  },
  notifDot: {
    position: 'absolute', top: 8, right: 8,
    width: 8, height: 8, borderRadius: 4,
    backgroundColor: Colors.greenPrimary,
  },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  locationText: { color: Colors.textOnDark, fontSize: 13, fontWeight: '600', flex: 1 },
  locationChange: { color: Colors.greenPrimary, fontSize: 12, fontWeight: '700' },

  section: { paddingHorizontal: Spacing.xl, marginTop: 24 },
  sectionLabel: { color: Colors.greenPrimary, fontSize: 10, fontWeight: '800', letterSpacing: 1.5, marginBottom: 6 },
  sectionTitle: { color: Colors.blackDeep, fontSize: 20, fontWeight: '800', marginBottom: 16 },

  serviceRow: { gap: 12, paddingRight: 20 },
  serviceChip: { alignItems: 'center', width: 76 },
  serviceChipActive: {},
  serviceEmoji: {
    width: 56, height: 56, borderRadius: 18,
    backgroundColor: Colors.whitePure, alignItems: 'center', justifyContent: 'center',
    borderWidth: 1.5, borderColor: Colors.border, marginBottom: 6,
    ...Shadows.card,
  },
  serviceEmojiActive: { borderColor: Colors.greenPrimary, backgroundColor: `${Colors.greenPrimary}12` },
  serviceLabel: { color: Colors.blackLight, fontSize: 11, fontWeight: '600', textAlign: 'center' },
  serviceLabelActive: { color: Colors.greenPrimary, fontWeight: '700' },

  bookingCard: {
    backgroundColor: Colors.grayMatte, borderRadius: Radius.xl, padding: 18,
    ...Shadows.cardHeavy,
  },
  bookingTopRow: { flexDirection: 'row', alignItems: 'center' },
  bookingAvatar: {
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: `${Colors.greenPrimary}25`,
    alignItems: 'center', justifyContent: 'center',
  },
  bookingWorker: { color: Colors.textOnDark, fontSize: 16, fontWeight: '700' },
  bookingService: { color: Colors.greenLight, fontSize: 12, marginTop: 2 },
  statusBadge: { backgroundColor: `${Colors.successGreen}20`, paddingHorizontal: 10, paddingVertical: 4, borderRadius: Radius.full },
  statusText: { color: Colors.successGreen, fontSize: 10, fontWeight: '700' },
  bookingDivider: { height: 1, backgroundColor: `${Colors.greenPrimary}30`, marginVertical: 14 },
  bookingBottomRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  bookingDate: { color: Colors.textOnDark, fontSize: 13, opacity: 0.8 },
  bookingCta: { color: Colors.greenPrimary, fontSize: 13, fontWeight: '700' },

  nearbyCard: {
    backgroundColor: Colors.whitePure, borderRadius: Radius.xl, padding: 20,
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 1, borderColor: Colors.border, ...Shadows.card,
  },
  nearbyInner: { flex: 1 },
  nearbyTitle: { color: Colors.blackDeep, fontSize: 16, fontWeight: '700', marginBottom: 4 },
  nearbySub: { color: Colors.textMuted, fontSize: 12 },
  nearbyArrow: { color: Colors.greenPrimary, fontSize: 24, fontWeight: '700' },

  stepsRow: { flexDirection: 'row', gap: 10 },
  stepCard: {
    flex: 1, backgroundColor: Colors.whitePure, borderRadius: Radius.lg, padding: 14,
    alignItems: 'center', borderWidth: 1, borderColor: Colors.border,
  },
  stepNum: {
    width: 30, height: 30, borderRadius: 15, backgroundColor: Colors.greenPrimary,
    alignItems: 'center', justifyContent: 'center', marginBottom: 8,
  },
  stepNumText: { color: Colors.blackDeep, fontWeight: '900', fontSize: 14 },
  stepTitle: { color: Colors.blackDeep, fontSize: 13, fontWeight: '700', marginBottom: 2 },
  stepDesc: { color: Colors.textMuted, fontSize: 10, textAlign: 'center' },

  inputBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: Colors.whitePure, paddingHorizontal: 16, paddingVertical: 12,
    borderTopWidth: 1, borderTopColor: Colors.border,
    ...Shadows.darkHeader,
  },
  inputRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  kMark: {
    width: 30, height: 30, borderRadius: 10,
    backgroundColor: Colors.greenPrimary,
    alignItems: 'center', justifyContent: 'center',
  },
  textInput: {
    flex: 1, backgroundColor: Colors.whiteSoft, borderRadius: Radius.md,
    paddingHorizontal: 14, paddingVertical: 12,
    borderWidth: 1, borderColor: Colors.border,
    fontSize: 14, color: Colors.blackDeep,
  },
  sendBtn: {
    width: 42, height: 42, borderRadius: 14,
    backgroundColor: Colors.greenPrimary,
    alignItems: 'center', justifyContent: 'center',
  },
  sendBtnText: { color: Colors.blackDeep, fontSize: 18, fontWeight: '900' },
});
