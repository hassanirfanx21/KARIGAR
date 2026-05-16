import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, CheckCircle2, Clock } from 'lucide-react-native';
import { Colors, Shadows, Radius } from '../constants/theme';
import { API_URL } from '../constants/config';

function normalizeTraceItem(item, index) {
  return {
    id: item.id || `${index}`,
    title: item.agent_name || item.agent || `Step ${index + 1}`,
    status: item.status || 'done',
    duration_ms: item.duration_ms || 0,
    reasoning: item.reasoning || item.output_summary || item.message || 'Completed',
    input: item.input_summary || item.input || null,
    output: item.output_summary || item.output || null,
  };
}

export default function AgentTraceScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const traceParam = params.trace;
  const bookingId = params.bookingId;
  const requestMessage = params.message || 'Live agent trace';

  const [trace, setTrace] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expanded, setExpanded] = useState(true);

  useEffect(() => {
    async function loadTrace() {
      try {
        setLoading(true);

        if (traceParam) {
          const parsed = JSON.parse(traceParam);
          setTrace(Array.isArray(parsed) ? parsed.map(normalizeTraceItem) : []);
          return;
        }

        if (bookingId) {
          const res = await fetch(`${API_URL}/api/bookings/${bookingId}`);
          const data = await res.json();
          if (data.success && Array.isArray(data.booking?.agent_trace)) {
            setTrace(data.booking.agent_trace.map(normalizeTraceItem));
            return;
          }
        }

        setTrace([]);
      } catch (err) {
        setError(err.message || 'Trace load nahi ho saki');
      } finally {
        setLoading(false);
      }
    }

    loadTrace();
  }, [bookingId, traceParam]);

  const totalDuration = useMemo(() => trace.reduce((sum, item) => sum + (item.duration_ms || 0), 0), [trace]);

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.8}>
          <ArrowLeft size={20} color={Colors.blackDeep} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>Agent Trace</Text>
          <Text style={styles.subTitle}>{requestMessage}</Text>
        </View>
        <View style={styles.headerBadge}>
          <Text style={styles.headerBadgeText}>{trace.length} steps</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {loading ? (
          <View style={styles.loadingWrap}>
            <ActivityIndicator color={Colors.greenPrimary} />
            <Text style={styles.loadingText}>Trace load ho rahi hai...</Text>
          </View>
        ) : error ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>Kuch masla hua</Text>
            <Text style={styles.emptyText}>{error}</Text>
          </View>
        ) : trace.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>No trace available</Text>
            <Text style={styles.emptyText}>Booking ya agent request se real reasoning yahan render hogi.</Text>
          </View>
        ) : (
          <View style={styles.traceCard}>
            <View style={styles.traceHeaderRow}>
              <Text style={styles.traceCardTitle}>KARIGAR Agent Decisions</Text>
              <TouchableOpacity onPress={() => setExpanded((value) => !value)}>
                <Text style={styles.toggleText}>{expanded ? 'Hide details' : 'Show details'}</Text>
              </TouchableOpacity>
            </View>

            {trace.map((item, index) => (
              <View key={item.id} style={styles.stepRow}>
                <View style={styles.stepIndexWrap}>
                  <View style={[styles.stepIndex, item.status === 'done' && styles.stepIndexDone]}>
                    {item.status === 'done' ? <CheckCircle2 size={14} color={Colors.blackDeep} /> : <Text style={styles.stepIndexText}>{index + 1}</Text>}
                  </View>
                  {index < trace.length - 1 && <View style={styles.stepLine} />}
                </View>

                <View style={styles.stepBody}>
                  <View style={styles.stepTopRow}>
                    <Text style={styles.stepTitle}>{item.title}</Text>
                    <View style={styles.durationPill}>
                      <Clock size={10} color={Colors.greenPrimary} />
                      <Text style={styles.durationText}>{item.duration_ms} ms</Text>
                    </View>
                  </View>
                  <Text style={styles.stepReason}>{item.reasoning}</Text>

                  {expanded && item.input ? (
                    <View style={styles.codeBox}>
                      <Text style={styles.codeLabel}>Input</Text>
                      <Text style={styles.codeText}>{typeof item.input === 'string' ? item.input : JSON.stringify(item.input, null, 2)}</Text>
                    </View>
                  ) : null}

                  {expanded && item.output ? (
                    <View style={[styles.codeBox, styles.outputBox]}>
                      <Text style={styles.codeLabel}>Output</Text>
                      <Text style={styles.codeText}>{typeof item.output === 'string' ? item.output : JSON.stringify(item.output, null, 2)}</Text>
                    </View>
                  ) : null}
                </View>
              </View>
            ))}

            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Total processing</Text>
              <Text style={styles.summaryValue}>{totalDuration} ms</Text>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.whiteSoft },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingVertical: 14, backgroundColor: Colors.whitePure, borderBottomWidth: 1, borderBottomColor: Colors.border },
  backBtn: { width: 38, height: 38, borderRadius: 19, backgroundColor: Colors.whiteSoft, alignItems: 'center', justifyContent: 'center' },
  title: { color: Colors.blackDeep, fontSize: 18, fontWeight: '800' },
  subTitle: { color: Colors.textMuted, fontSize: 12, marginTop: 2 },
  headerBadge: { backgroundColor: Colors.greenMuted, paddingHorizontal: 10, paddingVertical: 6, borderRadius: Radius.full },
  headerBadgeText: { color: Colors.greenPrimary, fontSize: 11, fontWeight: '700' },
  scroll: { padding: 16, paddingBottom: 40 },
  loadingWrap: { alignItems: 'center', paddingVertical: 40 },
  loadingText: { color: Colors.textMuted, fontSize: 12, marginTop: 10 },
  emptyCard: { backgroundColor: Colors.whitePure, borderRadius: 18, borderWidth: 1, borderColor: Colors.border, padding: 18 },
  emptyTitle: { color: Colors.blackDeep, fontSize: 16, fontWeight: '800', marginBottom: 4 },
  emptyText: { color: Colors.textMuted, fontSize: 12, lineHeight: 18 },
  traceCard: { backgroundColor: Colors.whitePure, borderRadius: 18, borderWidth: 1, borderColor: Colors.border, padding: 16, ...Shadows.card },
  traceHeaderRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  traceCardTitle: { color: Colors.blackDeep, fontSize: 16, fontWeight: '800' },
  toggleText: { color: Colors.greenPrimary, fontSize: 12, fontWeight: '700' },
  stepRow: { flexDirection: 'row', gap: 12 },
  stepIndexWrap: { width: 22, alignItems: 'center' },
  stepIndex: { width: 22, height: 22, borderRadius: 11, backgroundColor: Colors.whiteSoft, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: Colors.border },
  stepIndexDone: { backgroundColor: Colors.greenPrimary, borderColor: Colors.greenPrimary },
  stepIndexText: { color: Colors.blackDeep, fontSize: 11, fontWeight: '800' },
  stepLine: { width: 2, flex: 1, backgroundColor: Colors.border, marginTop: 6, borderRadius: 1 },
  stepBody: { flex: 1, paddingBottom: 18 },
  stepTopRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10, marginBottom: 6 },
  stepTitle: { color: Colors.blackDeep, fontSize: 14, fontWeight: '700', flex: 1 },
  durationPill: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: Colors.greenMuted, paddingHorizontal: 8, paddingVertical: 4, borderRadius: Radius.full },
  durationText: { color: Colors.greenPrimary, fontSize: 10, fontWeight: '700' },
  stepReason: { color: Colors.blackLight, fontSize: 12, lineHeight: 18, marginBottom: 8 },
  codeBox: { backgroundColor: Colors.whiteSoft, borderRadius: 12, borderWidth: 1, borderColor: Colors.border, padding: 12, marginBottom: 8 },
  outputBox: { backgroundColor: '#F7FCFA' },
  codeLabel: { color: Colors.greenPrimary, fontSize: 10, fontWeight: '800', marginBottom: 6, textTransform: 'uppercase' },
  codeText: { color: Colors.blackDeep, fontSize: 11, lineHeight: 16 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: Colors.border, paddingTop: 12, marginTop: 4 },
  summaryLabel: { color: Colors.textMuted, fontSize: 11, fontWeight: '700', letterSpacing: 0.4, textTransform: 'uppercase' },
  summaryValue: { color: Colors.blackDeep, fontSize: 13, fontWeight: '800' },
});