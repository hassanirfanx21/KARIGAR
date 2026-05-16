import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ShieldAlert, ArrowLeft, CheckCircle2 } from 'lucide-react-native';
import { Colors, Shadows, Radius } from '../../constants/theme';
import { API_URL } from '../../constants/config';

export default function DisputeScreen() {
  const router = useRouter();
  const { bookingId } = useLocalSearchParams();
  const actualBookingId = bookingId || 'BK-20240913-0047';

  const [issue, setIssue] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleSubmit = async () => {
    if (!issue.trim()) return;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`${API_URL}/api/agent/dispute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          complaint_text: issue,
          booking: { booking_id: actualBookingId },
          language: 'roman_urdu'
        })
      });
      
      const data = await res.json();
      if (data.success) {
        setResult(data);
      } else {
        setError("Network error. Please try again.");
      }
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.7}>
            <ArrowLeft size={20} color={Colors.blackDeep} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Report an Issue</Text>
          <View style={{ width: 38 }} />
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          
          <View style={styles.heroCard}>
            <View style={styles.heroAvatar}>
              <ShieldAlert size={32} color={Colors.errorRed} />
            </View>
            <Text style={styles.heroName}>Masla Kya Hai?</Text>
            <Text style={styles.heroSub}>
              Booking ID: <Text style={{ fontFamily: 'monospace' }}>{actualBookingId}</Text>
            </Text>
          </View>

          {!result ? (
            <View style={styles.formCard}>
              <Text style={styles.label}>Tafseel Se Batayein</Text>
              <TextInput
                style={styles.textArea}
                multiline
                numberOfLines={5}
                placeholder="Karigar time par nahi aya ya kaam theek nahi hua? Roman Urdu mein likhein..."
                placeholderTextColor={Colors.textMuted}
                value={issue}
                onChangeText={setIssue}
                textAlignVertical="top"
              />
              
              {error && <Text style={styles.errorText}>{error}</Text>}

              <TouchableOpacity 
                style={[styles.submitBtn, !issue.trim() && styles.submitBtnDisabled]} 
                onPress={handleSubmit} 
                activeOpacity={0.8}
                disabled={!issue.trim() || loading}
              >
                {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitBtnText}>Masla Report Karein</Text>}
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.resultCard}>
              <View style={styles.resultHeader}>
                <CheckCircle2 size={24} color={Colors.successGreen} />
                <Text style={styles.resultTitle}>Agent Ne Analyze Kar Liya</Text>
              </View>
              
              <View style={styles.resultRow}>
                <Text style={styles.resultLabel}>ACTION:</Text>
                <View style={styles.classificationPill}>
                  <Text style={styles.classificationText}>{result.classification || 'Manual Review'}</Text>
                </View>
              </View>

              <View style={styles.resultRowCol}>
                <Text style={styles.resultLabel}>REASONING:</Text>
                <Text style={styles.resultValue}>{result.reasoning}</Text>
              </View>

              <View style={styles.resultRowCol}>
                <Text style={styles.resultLabel}>NEXT STEPS:</Text>
                <Text style={styles.resultValue}>{result.next_steps}</Text>
              </View>

              <TouchableOpacity style={styles.doneBtn} onPress={() => router.push('/')} activeOpacity={0.8}>
                <Text style={styles.doneBtnText}>Home Par Wapas Jayein</Text>
              </TouchableOpacity>
            </View>
          )}
          
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.whiteSoft },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 14, backgroundColor: Colors.whitePure, borderBottomWidth: 1, borderBottomColor: Colors.border },
  backBtn: { width: 38, height: 38, borderRadius: 19, backgroundColor: Colors.whiteSoft, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { flex: 1, textAlign: 'center', fontSize: 17, fontWeight: '700', color: Colors.blackDeep },
  scrollContent: { padding: 16 },
  
  heroCard: { alignItems: 'center', marginBottom: 24, marginTop: 10 },
  heroAvatar: { width: 72, height: 72, borderRadius: 36, backgroundColor: `${Colors.errorRed}15`, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  heroName: { color: Colors.blackDeep, fontSize: 22, fontWeight: '800', marginBottom: 6 },
  heroSub: { color: Colors.textMuted, fontSize: 14 },
  
  formCard: { backgroundColor: Colors.whitePure, borderRadius: 18, padding: 16, borderWidth: 1, borderColor: Colors.border, ...Shadows.card },
  label: { color: Colors.blackDeep, fontSize: 14, fontWeight: '700', marginBottom: 12 },
  textArea: { backgroundColor: Colors.whiteSoft, borderRadius: 12, padding: 16, minHeight: 120, fontSize: 15, color: Colors.blackDeep, borderWidth: 1, borderColor: Colors.border, marginBottom: 16 },
  errorText: { color: Colors.errorRed, fontSize: 13, marginBottom: 16, textAlign: 'center' },
  
  submitBtn: { backgroundColor: Colors.errorRed, paddingVertical: 16, borderRadius: 14, alignItems: 'center', ...Shadows.card },
  submitBtnDisabled: { opacity: 0.5 },
  submitBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  
  resultCard: { backgroundColor: Colors.whitePure, borderRadius: 18, padding: 20, borderWidth: 1, borderColor: Colors.border, ...Shadows.card },
  resultHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 20, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: Colors.border },
  resultTitle: { color: Colors.blackDeep, fontSize: 16, fontWeight: '800' },
  
  resultRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  resultRowCol: { marginBottom: 16 },
  resultLabel: { color: Colors.textMuted, fontSize: 11, fontWeight: '800', letterSpacing: 1, marginBottom: 4 },
  resultValue: { color: Colors.blackDeep, fontSize: 14, fontWeight: '500', lineHeight: 20 },
  
  classificationPill: { backgroundColor: `${Colors.errorRed}15`, paddingHorizontal: 12, paddingVertical: 6, borderRadius: Radius.full },
  classificationText: { color: Colors.errorRed, fontSize: 13, fontWeight: '700' },
  
  doneBtn: { backgroundColor: Colors.blackDeep, paddingVertical: 16, borderRadius: 14, alignItems: 'center', marginTop: 10 },
  doneBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
});
