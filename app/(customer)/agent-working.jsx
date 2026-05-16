import React, { useState, useEffect, useRef } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Animated, Easing } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Calendar, Tag, Key, MapPin, User, CheckCircle2, AlertCircle } from 'lucide-react-native';
import { Colors, Shadows, Spacing, Radius } from '../../constants/theme';
import { API_URL } from '../../constants/config';

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
  return <Animated.View style={{ width: size, height: size, borderRadius: size/2, borderWidth: 2, borderColor: `${Colors.greenPrimary}40`, borderTopColor: Colors.greenPrimary, transform: [{ rotate }] }} />;
}

export default function AgentWorkingScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const userMessage = params.message || 'AC Technician chahiye kal subah G-13 mein';
  const lat = params.lat;
  const lng = params.lng;
  
  const [isProcessing, setIsProcessing] = useState(true);
  const [agentResult, setAgentResult] = useState(null);
  const [error, setError] = useState(null);
  const [bookingWorkerId, setBookingWorkerId] = useState(null);

  useEffect(() => {
    // Trigger actual backend call
    fetch(`${API_URL}/api/agent/request`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: userMessage, language: 'roman_urdu', lat, lng })
    })
      .then(res => res.json())
      .then(data => {
        setIsProcessing(false);
        if (data.success) {
          setAgentResult(data);
        } else {
          setError(data.message || 'Error parsing intent');
        }
      })
      .catch((err) => {
        setIsProcessing(false);
        setError('Network error: ' + err.message);
      });
  }, []);

  const handleBookWorker = async (worker) => {
    setBookingWorkerId(worker.worker_id || worker.id);
    try {
      const res = await fetch(`${API_URL}/api/agent/book`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: 'anonymous',
          worker_id: worker.worker_id || worker.id,
          intent: agentResult.intent,
          pricing: worker.pricing,
          worker_name: worker.name
        })
      });
      const data = await res.json();
      if (data.success) {
        router.replace({ 
          pathname: '/(customer)/booking-detail', 
          params: { 
            bookingId: data.booking?.booking_id, 
            workerName: worker.name,
            slot: agentResult?.intent?.date || 'Kal',
            location: agentResult?.intent?.location?.label || 'Islamabad',
            confirmCode: data.booking?.confirmation_code,
            pricing: JSON.stringify(worker.pricing || {})
          } 
        });
      } else {
        alert('Booking failed');
        setBookingWorkerId(null);
      }
    } catch(err) {
      alert('Booking request failed');
      setBookingWorkerId(null);
    }
  };

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

        {/* Trace block (Processing) */}
        {isProcessing && (
          <View style={styles.traceBlock}>
            <View style={styles.traceHeader}>
              <View style={styles.kMark}><Text style={{ color: Colors.blackDeep, fontWeight: '900', fontSize: 16 }}>K</Text></View>
              <Text style={styles.traceTitle}>KARIGAR Agent</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}><SpinnerRing size={14} /><Text style={{ color: Colors.greenPrimary, fontSize: 11, fontWeight: '600' }}>Processing...</Text></View>
            </View>
            <View style={styles.stepRow}>
              <View style={styles.stepLeft}>
                <SpinnerRing />
              </View>
              <View style={{ flex: 1, paddingLeft: 10, paddingBottom: 12 }}>
                <Text style={styles.stepLabel}>Aapki request samajh raha hoon...</Text>
              </View>
            </View>
          </View>
        )}

        {/* Error State */}
        {!isProcessing && error && (
          <View style={styles.confirmCard}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10, gap: 8 }}>
              <AlertCircle size={22} color={Colors.errorRed} />
              <Text style={[styles.confirmTitle, { color: Colors.errorRed, marginBottom: 0 }]}>Kuch Masla Hua</Text>
            </View>
            <Text style={{ color: Colors.textOnDark, marginBottom: 15 }}>{error}</Text>
            <TouchableOpacity style={styles.ctaGhost} onPress={() => router.back()} activeOpacity={0.7}>
              <Text style={styles.ctaGhostText}>Peechay Jayein</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Success State - Display AI Reply & Candidates */}
        {!isProcessing && agentResult && !error && (
          <View style={{ gap: 16 }}>
            {/* AI Reply Bubble */}
            <View style={{ alignSelf: 'flex-start', maxWidth: '85%', backgroundColor: Colors.whiteSoft, borderRadius: 18, borderBottomLeftRadius: 4, padding: 14, borderWidth: 1, borderColor: Colors.border, ...Shadows.card }}>
               <Text style={{ color: Colors.blackDeep, fontSize: 15, lineHeight: 22 }}>
                 {agentResult.reply}
               </Text>
            </View>

            <Text style={{ color: Colors.blackDeep, fontSize: 16, fontWeight: '800', marginTop: 10 }}>Available Karigars</Text>
            
            {agentResult.workers?.map((worker, idx) => (
              <View key={idx} style={styles.confirmCard}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <View style={styles.workerAvatar}>
                    <User size={26} color={Colors.greenPrimary} />
                  </View>
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={styles.workerName}>{worker.name}</Text>
                    <Text style={styles.workerRating}>{worker.rating || 'New'} ★ | {worker.distance_km?.toFixed(1) || '?'} km away</Text>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={{ color: Colors.greenPrimary, fontWeight: 'bold', fontSize: 16 }}>PKR {worker.pricing?.final_price}</Text>
                  </View>
                </View>
                
                {worker.reasoning && (
                  <View style={{ marginTop: 12, padding: 10, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 8 }}>
                    <Text style={{ color: Colors.textMuted, fontSize: 12 }}>{worker.reasoning}</Text>
                  </View>
                )}

                <TouchableOpacity 
                  style={[styles.ctaPrimary, bookingWorkerId === (worker.worker_id || worker.id) && { opacity: 0.7 }]} 
                  onPress={() => handleBookWorker(worker)} 
                  activeOpacity={0.85}
                  disabled={bookingWorkerId !== null}
                >
                  <Text style={styles.ctaPrimaryText}>
                    {bookingWorkerId === (worker.worker_id || worker.id) ? 'Booking...' : 'Book This Worker'}
                  </Text>
                </TouchableOpacity>
              </View>
            ))}
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
  bubble: { backgroundColor: Colors.blackDeep, borderRadius: 18, borderBottomRightRadius: 4, padding: 14, maxWidth: '78%' },
  bubbleText: { color: Colors.textOnDark, fontSize: 15, lineHeight: 22 },
  bubbleTime: { color: Colors.textMuted, fontSize: 10, marginTop: 6, textAlign: 'right' },
  traceBlock: { backgroundColor: Colors.whiteSoft, borderRadius: 20, padding: 16, borderWidth: 1, borderColor: Colors.border, marginBottom: 20, ...Shadows.card },
  traceHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 },
  kMark: { width: 32, height: 32, borderRadius: 16, backgroundColor: Colors.greenPrimary, alignItems: 'center', justifyContent: 'center' },
  traceTitle: { color: Colors.blackLight, fontSize: 11, fontWeight: '700', letterSpacing: 1, flex: 1 },
  stepRow: { flexDirection: 'row', minHeight: 48, marginBottom: 4 },
  stepLeft: { width: 32, alignItems: 'center' },
  doneCircle: { width: 20, height: 20, borderRadius: 10, backgroundColor: Colors.successGreen, alignItems: 'center', justifyContent: 'center' },
  connector: { width: 2, flex: 1, backgroundColor: Colors.border, marginTop: 4 },
  stepLabel: { color: Colors.blackLight, fontSize: 13, fontWeight: '500' },
  stepLabelDone: { color: Colors.blackDeep, fontWeight: '600' },
  confirmCard: { backgroundColor: Colors.grayMatte, borderRadius: 20, padding: 20, ...Shadows.cardHeavy },
  confirmTitle: { color: Colors.textOnDark, fontSize: 17, fontWeight: '800', marginBottom: 14 },
  confirmDivider: { height: 1, backgroundColor: `${Colors.greenPrimary}50`, marginVertical: 12 },
  workerAvatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: `${Colors.greenPrimary}25`, alignItems: 'center', justifyContent: 'center' },
  workerName: { color: Colors.textOnDark, fontSize: 16, fontWeight: '700' },
  workerRating: { color: Colors.greenLight, fontSize: 12, marginTop: 2 },
  confirmRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 5 },
  confirmRowText: { color: Colors.textOnDark, fontSize: 14, opacity: 0.9 },
  ctaPrimary: { marginTop: 16, backgroundColor: Colors.greenPrimary, borderRadius: 14, paddingVertical: 15, alignItems: 'center', ...Shadows.greenFloat },
  ctaPrimaryText: { color: Colors.blackDeep, fontSize: 15, fontWeight: '800' },
  ctaGhost: { marginTop: 10, alignItems: 'center', paddingVertical: 10 },
  ctaGhostText: { color: Colors.greenLight, fontSize: 14, fontWeight: '600' },
});
