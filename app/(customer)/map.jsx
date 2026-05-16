import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Shadows, Spacing, Radius } from '../../constants/theme';

const { width: W, height: H } = Dimensions.get('window');
const WORKERS = [
  { id: 'w1', name: 'Ali AC Services', category: 'AC Repair', emoji: '❄️', dist: '2.1', rating: '4.8', x: '48%', y: '44%' },
  { id: 'w2', name: 'Rehman Electric', category: 'Electrician', emoji: '⚡', dist: '3.4', rating: '4.6', x: '62%', y: '55%' },
  { id: 'w3', name: 'Sara Clean Pro', category: 'Cleaner', emoji: '🧹', dist: '1.8', rating: '4.9', x: '35%', y: '38%' },
  { id: 'w4', name: 'Tariq Plumber', category: 'Plumber', emoji: '🔧', dist: '4.2', rating: '4.3', x: '70%', y: '36%' },
  { id: 'w5', name: 'Bilal Carpenter', category: 'Carpenter', emoji: '🔨', dist: '5.1', rating: '4.5', x: '25%', y: '62%' },
];
const FILTERS = ['Sab', 'AC', 'Plumber', 'Electric', 'Cleaner'];

function MapBackground({ selectedPin, onPinTap }) {
  return (
    <View style={styles.mapBg}>
      {[20,40,60,80].map(p => <View key={`h${p}`} style={[styles.mapRoadH, { top: `${p}%` }]} />)}
      {[20,40,60,80].map(p => <View key={`v${p}`} style={[styles.mapRoadV, { left: `${p}%` }]} />)}
      <View style={styles.currentLocWrap}>
        <View style={styles.currentLocOuter} />
        <View style={styles.currentLocDot} />
      </View>
      {WORKERS.map(w => {
        const sel = selectedPin === w.id;
        return (
          <TouchableOpacity key={w.id} onPress={() => onPinTap(w.id)}
            style={[styles.pin, { top: w.y, left: w.x }, sel && styles.pinSel]} activeOpacity={0.8}>
            <Text style={{ fontSize: 20 }}>{w.emoji}</Text>
            {sel && (
              <View style={styles.pinLabel}>
                <Text style={styles.pinLabelText}>{w.name}</Text>
                <Text style={styles.pinLabelDist}>{w.dist}km</Text>
              </View>
            )}
          </TouchableOpacity>
        );
      })}
      <View style={styles.areaLabel}><Text style={styles.areaLabelText}>📍 G-13, Islamabad</Text></View>
    </View>
  );
}

export default function NearbyMapScreen() {
  const [selectedPin, setSelectedPin] = useState(null);
  const [activeFilter, setActiveFilter] = useState('Sab');
  const [sheetExpanded, setSheetExpanded] = useState(false);
  const filtered = activeFilter === 'Sab' ? WORKERS : WORKERS.filter(w =>
    w.category.toLowerCase().includes(activeFilter.toLowerCase()));

  return (
    <View style={{ flex: 1 }}>
      <MapBackground selectedPin={selectedPin} onPinTap={id => setSelectedPin(selectedPin === id ? null : id)} />
      <SafeAreaView style={styles.topOverlay} edges={['top']} pointerEvents="box-none">
        <View style={styles.topBar}>
          <View style={styles.searchBar}>
            <Text style={{ fontSize: 16 }}>🔍</Text>
            <Text style={styles.searchPlaceholder}>Karigar dhundhein...</Text>
          </View>
        </View>
      </SafeAreaView>
      <View style={[styles.sheet, sheetExpanded && styles.sheetExpanded]}>
        <TouchableOpacity style={styles.handleWrap} onPress={() => setSheetExpanded(!sheetExpanded)} activeOpacity={0.7}>
          <View style={styles.handle} />
        </TouchableOpacity>
        <View style={styles.sheetHeader}>
          <Text style={styles.sheetTitle}>Aas Paas ke Karigar</Text>
          <View style={styles.countBadge}><Text style={styles.countText}>{filtered.length}</Text></View>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow} style={{ flexShrink: 0 }}>
          {FILTERS.map(c => (
            <TouchableOpacity key={c} onPress={() => setActiveFilter(c)}
              style={[styles.filterChip, activeFilter === c && styles.filterChipActive]} activeOpacity={0.8}>
              <Text style={[styles.filterChipText, activeFilter === c && styles.filterChipTextActive]}>{c}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
        <ScrollView contentContainerStyle={styles.workerList} showsVerticalScrollIndicator={false}>
          {filtered.map(w => (
            <TouchableOpacity key={w.id} style={styles.workerCard} activeOpacity={0.85}>
              <View style={styles.workerAvatar}><Text style={{ fontSize: 20 }}>{w.emoji}</Text></View>
              <View style={{ flex: 1 }}>
                <Text style={styles.workerName}>{w.name}</Text>
                <View style={styles.workerMeta}>
                  <View style={styles.catTag}><Text style={styles.catTagText}>{w.category}</Text></View>
                  <Text style={styles.workerDist}>📍 {w.dist}km</Text>
                </View>
              </View>
              <View style={{ alignItems: 'flex-end', gap: 6 }}>
                <Text style={styles.workerRating}>⭐ {w.rating}</Text>
                <TouchableOpacity style={styles.bookBtn} activeOpacity={0.85}>
                  <Text style={styles.bookBtnText}>Book</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  mapBg: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: '#EDE8E0' },
  mapRoadH: { position: 'absolute', left: 0, right: 0, height: 8, backgroundColor: '#D8D0C4' },
  mapRoadV: { position: 'absolute', top: 0, bottom: 0, width: 8, backgroundColor: '#D8D0C4' },
  currentLocWrap: { position: 'absolute', top: '50%', left: '50%', transform: [{ translateX: -20 }, { translateY: -20 }], width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  currentLocOuter: { position: 'absolute', width: 40, height: 40, borderRadius: 20, backgroundColor: `${Colors.greenPrimary}30`, borderWidth: 2, borderColor: `${Colors.greenPrimary}60` },
  currentLocDot: { width: 14, height: 14, borderRadius: 7, backgroundColor: Colors.greenPrimary, borderWidth: 2.5, borderColor: '#fff' },
  pin: { position: 'absolute', width: 42, height: 42, borderRadius: 21, backgroundColor: Colors.grayMatte, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#fff', transform: [{ translateX: -21 }, { translateY: -21 }], ...Shadows.card },
  pinSel: { width: 50, height: 50, borderRadius: 25, backgroundColor: Colors.greenPrimary, transform: [{ translateX: -25 }, { translateY: -25 }], zIndex: 10 },
  pinLabel: { position: 'absolute', bottom: 54, left: '50%', transform: [{ translateX: -60 }], width: 120, backgroundColor: Colors.blackDeep, borderRadius: 10, padding: 8, alignItems: 'center' },
  pinLabelText: { color: '#fff', fontSize: 11, fontWeight: '700', textAlign: 'center' },
  pinLabelDist: { color: Colors.greenLight, fontSize: 10, marginTop: 2 },
  areaLabel: { position: 'absolute', bottom: '40%', left: 16, backgroundColor: Colors.blackDeep, paddingHorizontal: 12, paddingVertical: 6, borderRadius: Radius.full },
  areaLabelText: { color: '#fff', fontSize: 11, fontWeight: '600' },
  topOverlay: { position: 'absolute', top: 0, left: 0, right: 0 },
  topBar: { paddingHorizontal: 16, paddingVertical: 10 },
  searchBar: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: Colors.whitePure, borderRadius: 14, paddingHorizontal: 14, paddingVertical: 12, borderWidth: 1, borderColor: Colors.border, ...Shadows.card },
  searchPlaceholder: { color: Colors.textMuted, fontSize: 14 },
  sheet: { position: 'absolute', bottom: 0, left: 0, right: 0, height: H * 0.42, backgroundColor: Colors.whitePure, borderTopLeftRadius: 28, borderTopRightRadius: 28, ...Shadows.darkHeader },
  sheetExpanded: { height: H * 0.65 },
  handleWrap: { alignItems: 'center', paddingTop: 12, paddingBottom: 6 },
  handle: { width: 44, height: 4, borderRadius: 2, backgroundColor: Colors.border },
  sheetHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 20, paddingBottom: 10 },
  sheetTitle: { color: Colors.blackDeep, fontSize: 17, fontWeight: '800', flex: 1 },
  countBadge: { backgroundColor: Colors.blackDeep, paddingHorizontal: 10, paddingVertical: 4, borderRadius: Radius.full },
  countText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  filterRow: { paddingHorizontal: 16, paddingBottom: 12, gap: 8 },
  filterChip: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: Radius.full, backgroundColor: Colors.whiteSoft, borderWidth: 1, borderColor: Colors.border },
  filterChipActive: { backgroundColor: Colors.greenPrimary, borderColor: Colors.greenPrimary },
  filterChipText: { color: Colors.blackLight, fontSize: 12, fontWeight: '600' },
  filterChipTextActive: { color: Colors.whitePure },
  workerList: { paddingHorizontal: 16, gap: 10, paddingBottom: 20 },
  workerCard: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: Colors.whitePure, borderRadius: 16, padding: 12, borderWidth: 1, borderColor: Colors.border },
  workerAvatar: { width: 46, height: 46, borderRadius: 23, backgroundColor: Colors.grayMatte, alignItems: 'center', justifyContent: 'center' },
  workerName: { color: Colors.blackDeep, fontSize: 14, fontWeight: '700', marginBottom: 4 },
  workerMeta: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  catTag: { backgroundColor: `${Colors.greenPrimary}18`, paddingHorizontal: 8, paddingVertical: 2, borderRadius: Radius.full },
  catTagText: { color: Colors.grayMatte, fontSize: 10, fontWeight: '700' },
  workerDist: { color: Colors.greenPrimary, fontSize: 11, fontWeight: '600' },
  workerRating: { color: Colors.blackLight, fontSize: 12, fontWeight: '600' },
  bookBtn: { backgroundColor: Colors.greenPrimary, paddingHorizontal: 14, paddingVertical: 6, borderRadius: 10 },
  bookBtnText: { color: Colors.blackDeep, fontSize: 12, fontWeight: '800' },
});
