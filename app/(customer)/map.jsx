import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Dimensions, ActivityIndicator, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Colors, Shadows, Radius } from '../../constants/theme';
import { API_URL, GOOGLE_MAPS_API_KEY } from '../../constants/config';

const { height: H } = Dimensions.get('window');

const DEFAULT_CENTER = { lat: 33.6844, lng: 73.0479, label: 'Islamabad' };
const FILTERS = [
  { label: 'Sab', value: null },
  { label: 'AC', value: 'hvac' },
  { label: 'Plumber', value: 'plumbing' },
  { label: 'Electric', value: 'electrical' },
  { label: 'Cleaner', value: 'cleaning' },
  { label: 'Painter', value: 'painting' },
];

function buildStaticMapUrl(center, workers) {
  if (!GOOGLE_MAPS_API_KEY) return null;

  const markers = [
    `markers=color:red|label:U|${center.lat},${center.lng}`,
    ...workers.slice(0, 8).map((worker, index) => {
      const label = String.fromCharCode(65 + index);
      return `markers=color:green|label:${label}|${worker.lat},${worker.lng}`;
    }),
  ];

  return `https://maps.googleapis.com/maps/api/staticmap?center=${center.lat},${center.lng}&zoom=12&size=900x500&scale=2&maptype=roadmap&${markers.join('&')}&key=${GOOGLE_MAPS_API_KEY}`;
}

export default function NearbyMapScreen() {
  const router = useRouter();
  const [selectedFilter, setSelectedFilter] = useState(null);
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadWorkers() {
      try {
        setLoading(true);
        setError(null);
        const category = selectedFilter ? `&category=${encodeURIComponent(selectedFilter)}` : '';
        const res = await fetch(`${API_URL}/api/workers/nearby?lat=${DEFAULT_CENTER.lat}&lng=${DEFAULT_CENTER.lng}&radius=10${category}`);
        const data = await res.json();

        if (!data.success) {
          throw new Error(data.error || 'Nearby workers unavailable');
        }

        setWorkers(data.workers || []);
      } catch (err) {
        setWorkers([]);
        setError(err.message || 'Nearby workers load nahi ho paye');
      } finally {
        setLoading(false);
      }
    }

    loadWorkers();
  }, [selectedFilter]);

  const mapUrl = useMemo(() => buildStaticMapUrl(DEFAULT_CENTER, workers), [workers]);

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Nearby Karigars</Text>
        <Text style={styles.headerSub}>{DEFAULT_CENTER.label}</Text>
      </View>

      <View style={styles.mapCard}>
        {mapUrl ? (
          <Image source={{ uri: mapUrl }} style={styles.mapImage} resizeMode="cover" />
        ) : (
          <View style={styles.mapFallback}>
            <Text style={styles.mapFallbackTitle}>Google Maps preview</Text>
            <Text style={styles.mapFallbackText}>EXPO_PUBLIC_GOOGLE_MAPS_API_KEY set karne par yahan live map render hoga.</Text>
          </View>
        )}
        <View style={styles.mapOverlay}>
          <Text style={styles.mapOverlayTitle}>{workers.length} live karigar nearby</Text>
          <Text style={styles.mapOverlayText}>Distance aur travel time backend se aa rahe hain.</Text>
        </View>
      </View>

      <View style={styles.filterRow}>
        {FILTERS.map((filter) => (
          <TouchableOpacity
            key={filter.label}
            onPress={() => setSelectedFilter(filter.value)}
            style={[styles.filterChip, selectedFilter === filter.value && styles.filterChipActive]}
            activeOpacity={0.85}
          >
            <Text style={[styles.filterChipText, selectedFilter === filter.value && styles.filterChipTextActive]}>{filter.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator color={Colors.greenPrimary} />
          <Text style={styles.loadingText}>Nearby providers load ho rahe hain...</Text>
        </View>
      ) : error ? (
        <View style={styles.emptyWrap}>
          <Text style={styles.emptyTitle}>Kuch masla hua</Text>
          <Text style={styles.emptyText}>{error}</Text>
        </View>
      ) : workers.length === 0 ? (
        <View style={styles.emptyWrap}>
          <Text style={styles.emptyTitle}>Koi karigar nahi mila</Text>
          <Text style={styles.emptyText}>Is area mein abhi live nearby workers available nahi hain.</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.workerList} showsVerticalScrollIndicator={false}>
          {workers.map((worker) => (
            <View key={worker.id} style={styles.workerCard}>
              <View style={styles.workerAvatar}>
                <Text style={{ fontSize: 18 }}>{worker.name?.charAt(0) || 'K'}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.workerName}>{worker.name}</Text>
                <View style={styles.metaRow}>
                  <View style={styles.catTag}><Text style={styles.catTagText}>{worker.category || 'Service'}</Text></View>
                  <Text style={styles.workerMeta}>📍 {Number(worker.distance_km || 0).toFixed(1)} km</Text>
                  <Text style={styles.workerMeta}>⏱ {worker.travel_time_min || '—'} min</Text>
                </View>
                <Text style={styles.workerMeta}>⭐ {worker.rating || 'New'} | ⛔ {worker.cancellation_rate || 0}% cancel</Text>
              </View>
              <TouchableOpacity
                style={styles.bookBtn}
                activeOpacity={0.85}
                onPress={() => router.push({ pathname: '/(customer)/agent-working', params: { message: `${worker.category || 'service'} chahiye ${DEFAULT_CENTER.label} mein` } })}
              >
                <Text style={styles.bookBtnText}>Book</Text>
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.whiteSoft },
  header: { paddingHorizontal: 20, paddingTop: 18, paddingBottom: 14, backgroundColor: Colors.whitePure, borderBottomWidth: 1, borderBottomColor: Colors.border },
  headerTitle: { color: Colors.blackDeep, fontSize: 22, fontWeight: '800' },
  headerSub: { color: Colors.textMuted, fontSize: 12, marginTop: 2 },
  mapCard: { margin: 16, borderRadius: 20, overflow: 'hidden', backgroundColor: Colors.whitePure, borderWidth: 1, borderColor: Colors.border, ...Shadows.cardHeavy },
  mapImage: { width: '100%', height: 220 },
  mapFallback: { height: 220, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24, backgroundColor: '#ECECEC' },
  mapFallbackTitle: { color: Colors.blackDeep, fontSize: 16, fontWeight: '800', marginBottom: 6 },
  mapFallbackText: { color: Colors.textMuted, fontSize: 12, textAlign: 'center', lineHeight: 18 },
  mapOverlay: { position: 'absolute', left: 12, bottom: 12, right: 12, backgroundColor: 'rgba(17,24,39,0.90)', borderRadius: 14, padding: 12 },
  mapOverlayTitle: { color: Colors.textOnDark, fontSize: 14, fontWeight: '700' },
  mapOverlayText: { color: 'rgba(249,250,251,0.7)', fontSize: 11, marginTop: 2 },
  filterRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, paddingHorizontal: 16, marginBottom: 8 },
  filterChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: Radius.full, backgroundColor: Colors.whitePure, borderWidth: 1, borderColor: Colors.border },
  filterChipActive: { backgroundColor: Colors.greenPrimary, borderColor: Colors.greenPrimary },
  filterChipText: { color: Colors.blackLight, fontSize: 12, fontWeight: '600' },
  filterChipTextActive: { color: Colors.whitePure },
  loadingWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24 },
  loadingText: { color: Colors.textMuted, marginTop: 10, fontSize: 12 },
  emptyWrap: { paddingHorizontal: 24, paddingVertical: 28, alignItems: 'center' },
  emptyTitle: { color: Colors.blackDeep, fontSize: 16, fontWeight: '800', marginBottom: 6 },
  emptyText: { color: Colors.textMuted, fontSize: 12, textAlign: 'center', lineHeight: 18 },
  workerList: { paddingHorizontal: 16, paddingBottom: 20, gap: 10 },
  workerCard: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: Colors.whitePure, borderRadius: 16, padding: 12, borderWidth: 1, borderColor: Colors.border, ...Shadows.card },
  workerAvatar: { width: 46, height: 46, borderRadius: 23, backgroundColor: Colors.grayMatte, alignItems: 'center', justifyContent: 'center' },
  workerName: { color: Colors.blackDeep, fontSize: 14, fontWeight: '700', marginBottom: 4 },
  metaRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 6, marginBottom: 2 },
  catTag: { backgroundColor: `${Colors.greenPrimary}18`, paddingHorizontal: 8, paddingVertical: 2, borderRadius: Radius.full },
  catTagText: { color: Colors.greenPrimary, fontSize: 10, fontWeight: '700' },
  workerMeta: { color: Colors.blackLight, fontSize: 11, fontWeight: '600' },
  bookBtn: { backgroundColor: Colors.greenPrimary, paddingHorizontal: 14, paddingVertical: 6, borderRadius: 10 },
  bookBtnText: { color: Colors.blackDeep, fontSize: 12, fontWeight: '800' },
});