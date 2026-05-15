import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Colors, Shadows, Spacing, Radius } from '../../constants/theme';

const SERVICE_CATEGORIES = [
  { id: 'ac', label: 'AC Repair', emoji: '❄️' },
  { id: 'plumber', label: 'Plumbing', emoji: '🔧' },
  { id: 'electric', label: 'Electrician', emoji: '⚡' },
  { id: 'clean', label: 'Cleaning', emoji: '🧹' },
  { id: 'paint', label: 'Painting', emoji: '🎨' },
  { id: 'carpenter', label: 'Carpenter', emoji: '🔨' },
  { id: 'mechanic', label: 'Mechanic', emoji: '🔩' },
  { id: 'cook', label: 'Cook', emoji: '👨‍🍳' },
];

export default function WorkerRegistrationScreen() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    name: '', cnic: '', city: '', area: '',
    selectedServices: [],
    experience: '', rate: '',
    startTime: '09:00 AM', endTime: '06:00 PM',
    range: '10',
  });

  const update = (key, val) => setForm(p => ({ ...p, [key]: val }));

  const toggleService = (id) => {
    setForm(p => ({
      ...p,
      selectedServices: p.selectedServices.includes(id)
        ? p.selectedServices.filter(s => s !== id)
        : [...p.selectedServices, id],
    }));
  };

  const handleFinish = () => {
    router.replace('/(worker)');
  };

  const goNext = () => setStep(s => s + 1);
  const goBack = () => step > 1 ? setStep(s => s - 1) : router.back();

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <>
            <Text style={styles.stepTitle}>Apni Pehchaan</Text>
            <Text style={styles.stepSub}>Identity verification ke liye</Text>

            <Text style={styles.label}>Poora Naam</Text>
            <TextInput style={styles.input} placeholder="Ali Khan" placeholderTextColor={Colors.textMuted}
              value={form.name} onChangeText={v => update('name', v)} />

            <Text style={styles.label}>CNIC Number</Text>
            <TextInput style={styles.input} placeholder="35201-1234567-1" placeholderTextColor={Colors.textMuted}
              keyboardType="numeric" value={form.cnic} onChangeText={v => update('cnic', v)} maxLength={15} />

            <Text style={styles.label}>Sheher</Text>
            <TextInput style={styles.input} placeholder="Islamabad" placeholderTextColor={Colors.textMuted}
              value={form.city} onChangeText={v => update('city', v)} />

            <Text style={styles.label}>Ilaaqa</Text>
            <TextInput style={styles.input} placeholder="G-13" placeholderTextColor={Colors.textMuted}
              value={form.area} onChangeText={v => update('area', v)} />

            <TouchableOpacity style={[styles.btn, (!form.name || !form.cnic) && styles.btnOff]}
              onPress={goNext} disabled={!form.name || !form.cnic} activeOpacity={0.85}>
              <Text style={styles.btnText}>Agay →</Text>
            </TouchableOpacity>
          </>
        );

      case 2:
        return (
          <>
            <Text style={styles.stepTitle}>Services Chunein</Text>
            <Text style={styles.stepSub}>Aap kaun si services dete hain?</Text>

            <View style={styles.tagsGrid}>
              {SERVICE_CATEGORIES.map(cat => {
                const selected = form.selectedServices.includes(cat.id);
                return (
                  <TouchableOpacity key={cat.id}
                    style={[styles.tag, selected && styles.tagSelected]}
                    onPress={() => toggleService(cat.id)} activeOpacity={0.8}>
                    <Text style={{ fontSize: 18 }}>{cat.emoji}</Text>
                    <Text style={[styles.tagText, selected && styles.tagTextSelected]}>{cat.label}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <Text style={styles.label}>Experience (Years)</Text>
            <TextInput style={styles.input} placeholder="3" placeholderTextColor={Colors.textMuted}
              keyboardType="numeric" value={form.experience} onChangeText={v => update('experience', v)} />

            <Text style={styles.label}>Hourly Rate (PKR)</Text>
            <TextInput style={styles.input} placeholder="500" placeholderTextColor={Colors.textMuted}
              keyboardType="numeric" value={form.rate} onChangeText={v => update('rate', v)} />

            <TouchableOpacity style={[styles.btn, form.selectedServices.length === 0 && styles.btnOff]}
              onPress={goNext} disabled={form.selectedServices.length === 0} activeOpacity={0.85}>
              <Text style={styles.btnText}>Agay →</Text>
            </TouchableOpacity>
          </>
        );

      case 3:
        return (
          <>
            <Text style={styles.stepTitle}>Availability</Text>
            <Text style={styles.stepSub}>Aapka kaam ka waqt aur range</Text>

            <View style={styles.timeRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>Start Time</Text>
                <View style={styles.timeBox}>
                  <Text style={styles.timeText}>{form.startTime}</Text>
                </View>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>End Time</Text>
                <View style={styles.timeBox}>
                  <Text style={styles.timeText}>{form.endTime}</Text>
                </View>
              </View>
            </View>

            <Text style={styles.label}>Service Range (km)</Text>
            <View style={styles.rangeRow}>
              {['5', '10', '15', '25'].map(r => (
                <TouchableOpacity key={r}
                  style={[styles.rangeChip, form.range === r && styles.rangeChipActive]}
                  onPress={() => update('range', r)} activeOpacity={0.8}>
                  <Text style={[styles.rangeText, form.range === r && styles.rangeTextActive]}>{r} km</Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity style={styles.btn} onPress={goNext} activeOpacity={0.85}>
              <Text style={styles.btnText}>Agay →</Text>
            </TouchableOpacity>
          </>
        );

      case 4:
        return (
          <>
            <Text style={styles.stepTitle}>Review & Submit</Text>
            <Text style={styles.stepSub}>Apni details check karein</Text>

            <View style={styles.reviewCard}>
              {[
                { l: 'Naam', v: form.name },
                { l: 'CNIC', v: form.cnic },
                { l: 'City', v: `${form.area}, ${form.city}` },
                { l: 'Services', v: form.selectedServices.join(', ') },
                { l: 'Experience', v: `${form.experience} years` },
                { l: 'Rate', v: `PKR ${form.rate}/hr` },
                { l: 'Timing', v: `${form.startTime} – ${form.endTime}` },
                { l: 'Range', v: `${form.range} km` },
              ].map((row, i) => (
                <View key={i} style={styles.reviewRow}>
                  <Text style={styles.reviewLabel}>{row.l}</Text>
                  <Text style={styles.reviewValue}>{row.v || '—'}</Text>
                </View>
              ))}
            </View>

            <TouchableOpacity style={styles.btn} onPress={handleFinish} activeOpacity={0.85}>
              <Text style={styles.btnText}>Profile Banayein ✓</Text>
            </TouchableOpacity>
          </>
        );
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.header}>
          <TouchableOpacity onPress={goBack}>
            <Text style={styles.backText}>← Wapas</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Worker Registration</Text>
          <Text style={styles.stepNum}>Step {step}/4</Text>
        </View>

        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${step * 25}%` }]} />
        </View>

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {renderStep()}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.whiteSoft },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: Spacing.xl, paddingVertical: 14,
    backgroundColor: Colors.whitePure, borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  backText: { color: Colors.textMuted, fontSize: 13, fontWeight: '600' },
  headerTitle: { color: Colors.charcoalDeep, fontSize: 16, fontWeight: '700' },
  stepNum: { color: Colors.goldPrimary, fontSize: 12, fontWeight: '700' },

  progressBar: {
    height: 3, backgroundColor: Colors.border, marginHorizontal: Spacing.xl, marginTop: 12,
    borderRadius: 2, overflow: 'hidden',
  },
  progressFill: { height: 3, backgroundColor: Colors.goldPrimary, borderRadius: 2 },

  content: { paddingHorizontal: Spacing.xl, paddingTop: 28, paddingBottom: 40 },
  stepTitle: { color: Colors.charcoalDeep, fontSize: 22, fontWeight: '800', marginBottom: 6 },
  stepSub: { color: Colors.textMuted, fontSize: 14, marginBottom: 24 },

  label: {
    color: Colors.charcoalLight, fontSize: 12, fontWeight: '700',
    letterSpacing: 0.5, marginBottom: 6, marginTop: 14,
  },
  input: {
    backgroundColor: Colors.whitePure, borderRadius: Radius.md,
    paddingHorizontal: 16, paddingVertical: 14,
    borderWidth: 1, borderColor: Colors.border,
    fontSize: 15, color: Colors.charcoalDeep,
  },

  tagsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 16 },
  tag: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 14, paddingVertical: 10, borderRadius: Radius.full,
    backgroundColor: Colors.whitePure, borderWidth: 1.5, borderColor: Colors.border,
  },
  tagSelected: { backgroundColor: `${Colors.goldPrimary}15`, borderColor: Colors.goldPrimary },
  tagText: { color: Colors.charcoalLight, fontSize: 13, fontWeight: '600' },
  tagTextSelected: { color: Colors.goldPrimary, fontWeight: '700' },

  timeRow: { flexDirection: 'row', gap: 12, marginBottom: 8 },
  timeBox: {
    backgroundColor: Colors.whitePure, borderRadius: Radius.md, padding: 14,
    borderWidth: 1, borderColor: Colors.border, alignItems: 'center',
  },
  timeText: { color: Colors.charcoalDeep, fontSize: 15, fontWeight: '700' },

  rangeRow: { flexDirection: 'row', gap: 10, marginTop: 8, marginBottom: 20 },
  rangeChip: {
    flex: 1, paddingVertical: 12, borderRadius: Radius.md, alignItems: 'center',
    backgroundColor: Colors.whitePure, borderWidth: 1.5, borderColor: Colors.border,
  },
  rangeChipActive: { backgroundColor: Colors.goldPrimary, borderColor: Colors.goldPrimary },
  rangeText: { color: Colors.charcoalLight, fontSize: 13, fontWeight: '700' },
  rangeTextActive: { color: Colors.charcoalDeep },

  reviewCard: {
    backgroundColor: Colors.whitePure, borderRadius: Radius.lg, padding: 16,
    borderWidth: 1, borderColor: Colors.border, marginBottom: 24,
  },
  reviewRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: `${Colors.border}80`,
  },
  reviewLabel: { color: Colors.textMuted, fontSize: 12, fontWeight: '600' },
  reviewValue: { color: Colors.charcoalDeep, fontSize: 13, fontWeight: '700', textAlign: 'right', flex: 1, marginLeft: 12 },

  btn: {
    backgroundColor: Colors.goldPrimary, borderRadius: Radius.md,
    paddingVertical: 16, alignItems: 'center', marginTop: 24,
    ...Shadows.goldFloat,
  },
  btnOff: { opacity: 0.3, shadowOpacity: 0 },
  btnText: { color: Colors.charcoalDeep, fontSize: 16, fontWeight: '800' },
});
