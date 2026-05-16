import React, { useState, useEffect, useRef } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Animated, Easing } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Colors, Shadows, Spacing, Radius } from '../../constants/theme';

const STEPS = [
  { id: 1, labelActive: 'Samajh raha hoon...', labelDone: 'Request samajh li ✓', delay: 0, duration: 1200 },
  { id: 2, labelActive: 'Karigar dhundh raha hoon...', labelDone: '4 Karigar mile ✓', delay: 1400, duration: 1400 },
  { id: 3, labelActive: 'Best match select kar raha hoon...', labelDone: 'Match mil gaya! ✓', delay: 3000, duration: 1200 },
  { id: 4, labelActive: 'Booking confirm kar raha hoon...', labelDone: 'Booking ho gayi! ✓', delay: 4400, duration: 900 },
  { id: 5, labelActive: 'Reminders schedule kar raha hoon...', labelDone: '3 reminders set ✓', delay: 5500, duration: 700 },
];

function SpinnerRing({ size = 18 }) {
  const spin = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(Animated.timing(spin, { toValue: 1, duration: 900, easing: Easing.linear, useNativeDriver: true })).start();
  }, []);
  const rotate = spin.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });
  return <Animated.View style={{ width: size, height: size, borderRadius: size/2, borderWidth: 2, borderColor: `${Colors.goldPrimary}40`, borderTopColor: Colors.goldPrimary, transform: [{ rotate }] }} />;
}

export default function AgentWorkingScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const userMessage = params.message || 'AC Technician chahiye kal subah G-13 mein';
  
  const [statuses, setStatuses] = useState(STEPS.map(() => 'idle'));
  const [allDone, setAllDone] = useState(false);
  const [agentResult, setAgentResult] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    // 1. Trigger actual backend call
    fetch('http://YOUR_SERVER_IP:3000/api/agent/request', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: userMessage, language: 'roman_urdu' })
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) setAgentResult(data);
        else setError(true);
      })
      .catch(() => setError(true));

    // 2. Handle UI animations sequentially
    const timers = [];
    STEPS.forEach((step, i) => {
      timers.push(setTimeout(() => setStatuses(p => { const n=[...p]; n[i]='active'; return n; }), step.delay));
      timers.push(setTimeout(() => {
        setStatuses(p => { const n=[...p]; n[i]='done'; return n; });
        if (i === STEPS.length - 1) setAllDone(true);
      }, step.delay + step.duration));
    });
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* User bubble */}
        <View style={styles.bubbleWrap}>
          <View style={styles.bubble}>
            <Text style={styles.bubbleText}>{userMessage}</Text>
            <Text style={styles.bubbleTime}>Abhi</Text>
          </View>
        </View>

        {/* Trace block */}
        <View style={styles.traceBlock}>
          <View style={styles.traceHeader}>
            <View style={styles.kMark}><Text style={{ color: Colors.charcoalDeep, fontWeight: '900', fontSize: 16 }}>K</Text></View>
            <Text style={styles.traceTitle}>KARIGAR Agent</Text>
            {statuses.some(s => s === 'active') && <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}><SpinnerRing size={14} /><Text style={{ color: Colors.goldPrimary, fontSize: 11, fontWeight: '600' }}>Processing...</Text></View>}
            {allDone && <Text style={{ color: Colors.successGreen, fontSize: 11, fontWeight: '700' }}>Mukammal ✓</Text>}
          </View>
          {STEPS.map((step, i) => {
            if (statuses[i] === 'idle') return null;
            const isDone = statuses[i] === 'done';
            return (
              <View key={step.id} style={styles.stepRow}>
                <View style={styles.stepLeft}>
                  {statuses[i] === 'active' ? <SpinnerRing /> : (
                    <View style={styles.doneCircle}><Text style={{ color: '#fff', fontSize: 10, fontWeight: '800' }}>✓</Text></View>
                  )}
                  <View style={styles.connector} />
                </View>
                <View style={{ flex: 1, paddingLeft: 10, paddingBottom: 12 }}>
                  <Text style={[styles.stepLabel, isDone && styles.stepLabelDone]}>{isDone ? step.labelDone : step.labelActive}</Text>
                </View>
              </View>
            );
          })}
        </View>

        {/* Error State */}
        {allDone && error && (
          <View style={styles.confirmCard}>
            <Text style={[styles.confirmTitle, { color: Colors.errorRed }]}>❌ Kuch Masla Hua</Text>
            <Text style={{ color: Colors.textOnDark, marginBottom: 15 }}>Hum aapka request process nahi kar sake. Dobara koshish karein.</Text>
            <TouchableOpacity style={styles.ctaGhost} onPress={() => router.back()} activeOpacity={0.7}>
              <Text style={styles.ctaGhostText}>Peechay Jayein</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Confirm card */}
        {allDone && agentResult && !error && (
          <View style={styles.confirmCard}>
            <Text style={styles.confirmTitle}>✅ Booking Confirm Ho Gayi!</Text>
            <View style={styles.confirmDivider} />
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View style={styles.workerAvatar}><Text style={{ fontSize: 22 }}>👷</Text></View>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={styles.workerName}>{agentResult.worker?.name || 'Karigar'}</Text>
                <Text style={styles.workerRating}>{agentResult.worker?.rating || 'New'} ★ Excellent</Text>
              </View>
            </View>
            <View style={styles.confirmDivider} />
            {[
              { icon: '📅', text: \`Booking ID: \${agentResult.booking_id}\` },
              { icon: '🔑', text: \`Code: \${agentResult.confirmation_code}\` },
              { icon: '📍', text: agentResult?.worker?._raw_worker?.sector || 'Islamabad' },
              { icon: '💰', text: \`PKR \${agentResult.pricing?.final_price || 0}\` },
            ].map(r => (
              <View key={r.text} style={styles.confirmRow}>
                <Text style={{ fontSize: 16, width: 26 }}>{r.icon}</Text>
                <Text style={styles.confirmRowText}>{r.text}</Text>
              </View>
            ))}
            <TouchableOpacity 
              style={styles.ctaPrimary} 
              onPress={() => router.push({ 
                pathname: '/(customer)/booking-detail', 
                params: { 
                  bookingId: agentResult?.booking_id, 
                  workerName: agentResult?.worker?.name,
                  slot: agentResult?.booking?.slot_date || 'Kal 10:00 AM',
                  location: agentResult?.worker?._raw_worker?.sector || 'G-13, Islamabad',
                  confirmCode: agentResult?.confirmation_code
                } 
              })} 
              activeOpacity={0.85}
            >
              <Text style={styles.ctaPrimaryText}>Booking Detail Dekhein →</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.ctaGhost} onPress={() => router.back()} activeOpacity={0.7}>
              <Text style={styles.ctaGhostText}>Naya Request Karein</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.whitePure },
  scroll: { padding: 20, paddingBottom: 80 },
  bubbleWrap: { alignItems: 'flex-end', marginBottom: 20 },
  bubble: { backgroundColor: Colors.charcoalDeep, borderRadius: 18, borderBottomRightRadius: 4, padding: 14, maxWidth: '78%' },
  bubbleText: { color: Colors.textOnDark, fontSize: 15, lineHeight: 22 },
  bubbleTime: { color: Colors.textMuted, fontSize: 10, marginTop: 6, textAlign: 'right' },
  traceBlock: { backgroundColor: Colors.whiteSoft, borderRadius: 20, padding: 16, borderWidth: 1, borderColor: Colors.border, marginBottom: 20, ...Shadows.card },
  traceHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 },
  kMark: { width: 32, height: 32, borderRadius: 16, backgroundColor: Colors.goldPrimary, alignItems: 'center', justifyContent: 'center' },
  traceTitle: { color: Colors.charcoalLight, fontSize: 11, fontWeight: '700', letterSpacing: 1, flex: 1 },
  stepRow: { flexDirection: 'row', minHeight: 48, marginBottom: 4 },
  stepLeft: { width: 32, alignItems: 'center' },
  doneCircle: { width: 20, height: 20, borderRadius: 10, backgroundColor: Colors.successGreen, alignItems: 'center', justifyContent: 'center' },
  connector: { width: 2, flex: 1, backgroundColor: Colors.border, marginTop: 4 },
  stepLabel: { color: Colors.charcoalLight, fontSize: 13, fontWeight: '500' },
  stepLabelDone: { color: Colors.charcoalDeep, fontWeight: '600' },
  confirmCard: { backgroundColor: Colors.brownMatte, borderRadius: 20, padding: 20, ...Shadows.cardHeavy },
  confirmTitle: { color: Colors.textOnDark, fontSize: 17, fontWeight: '800', marginBottom: 14 },
  confirmDivider: { height: 1, backgroundColor: `${Colors.goldPrimary}50`, marginVertical: 12 },
  workerAvatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: `${Colors.goldPrimary}25`, alignItems: 'center', justifyContent: 'center' },
  workerName: { color: Colors.textOnDark, fontSize: 16, fontWeight: '700' },
  workerRating: { color: Colors.goldLight, fontSize: 12, marginTop: 2 },
  confirmRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 5 },
  confirmRowText: { color: Colors.textOnDark, fontSize: 14, opacity: 0.9 },
  ctaPrimary: { marginTop: 16, backgroundColor: Colors.goldPrimary, borderRadius: 14, paddingVertical: 15, alignItems: 'center', ...Shadows.goldFloat },
  ctaPrimaryText: { color: Colors.charcoalDeep, fontSize: 15, fontWeight: '800' },
  ctaGhost: { marginTop: 10, alignItems: 'center', paddingVertical: 10 },
  ctaGhostText: { color: Colors.goldLight, fontSize: 14, fontWeight: '600' },
});
