import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Colors, Shadows, Spacing, Radius } from '../../constants/theme';

export default function CustomerRegistrationScreen() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    name: '', email: '', city: '', area: '', address: '',
  });

  const update = (key, val) => setForm(p => ({ ...p, [key]: val }));

  const handleFinish = () => {
    router.replace('/(customer)');
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => step > 1 ? setStep(step - 1) : router.back()}>
            <Text style={styles.backText}>← Wapas</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Customer Registration</Text>
          <Text style={styles.stepLabel}>Step {step}/2</Text>
        </View>

        {/* Progress */}
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${step * 50}%` }]} />
        </View>

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {step === 1 ? (
            <>
              <Text style={styles.stepTitle}>Apni Maloomat</Text>
              <Text style={styles.stepSubtitle}>Basic profile information darj karein</Text>

              <Text style={styles.inputLabel}>Poora Naam</Text>
              <TextInput
                style={styles.input}
                placeholder="Ahmed Khan"
                placeholderTextColor={Colors.textMuted}
                value={form.name}
                onChangeText={v => update('name', v)}
              />

              <Text style={styles.inputLabel}>Email (Optional)</Text>
              <TextInput
                style={styles.input}
                placeholder="ahmed@example.com"
                placeholderTextColor={Colors.textMuted}
                keyboardType="email-address"
                value={form.email}
                onChangeText={v => update('email', v)}
              />

              <TouchableOpacity
                style={[styles.nextBtn, !form.name && styles.btnDisabled]}
                onPress={() => setStep(2)}
                disabled={!form.name}
                activeOpacity={0.85}
              >
                <Text style={styles.nextBtnText}>Agay →</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <Text style={styles.stepTitle}>Address Details</Text>
              <Text style={styles.stepSubtitle}>Apna pata darj karein — service ke liye</Text>

              <Text style={styles.inputLabel}>Sheher</Text>
              <TextInput
                style={styles.input}
                placeholder="Islamabad"
                placeholderTextColor={Colors.textMuted}
                value={form.city}
                onChangeText={v => update('city', v)}
              />

              <Text style={styles.inputLabel}>Ilaaqa</Text>
              <TextInput
                style={styles.input}
                placeholder="G-13"
                placeholderTextColor={Colors.textMuted}
                value={form.area}
                onChangeText={v => update('area', v)}
              />

              <Text style={styles.inputLabel}>Mukammal Pata</Text>
              <TextInput
                style={[styles.input, { height: 80, textAlignVertical: 'top' }]}
                placeholder="House #, Street, Block"
                placeholderTextColor={Colors.textMuted}
                multiline
                value={form.address}
                onChangeText={v => update('address', v)}
              />

              <TouchableOpacity
                style={[styles.nextBtn, (!form.city || !form.area) && styles.btnDisabled]}
                onPress={handleFinish}
                disabled={!form.city || !form.area}
                activeOpacity={0.85}
              >
                <Text style={styles.nextBtnText}>Account Banayein ✓</Text>
              </TouchableOpacity>
            </>
          )}
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
  headerTitle: { color: Colors.blackDeep, fontSize: 16, fontWeight: '700' },
  stepLabel: { color: Colors.greenPrimary, fontSize: 12, fontWeight: '700' },

  progressBar: {
    height: 3, backgroundColor: Colors.border, marginHorizontal: Spacing.xl, marginTop: 12,
    borderRadius: 2, overflow: 'hidden',
  },
  progressFill: { height: 3, backgroundColor: Colors.greenPrimary, borderRadius: 2 },

  content: { paddingHorizontal: Spacing.xl, paddingTop: 28, paddingBottom: 40 },
  stepTitle: { color: Colors.blackDeep, fontSize: 22, fontWeight: '800', marginBottom: 6 },
  stepSubtitle: { color: Colors.textMuted, fontSize: 14, marginBottom: 28 },

  inputLabel: {
    color: Colors.blackLight, fontSize: 12, fontWeight: '700',
    letterSpacing: 0.5, marginBottom: 6, marginTop: 14,
  },
  input: {
    backgroundColor: Colors.whitePure, borderRadius: Radius.md,
    paddingHorizontal: 16, paddingVertical: 14,
    borderWidth: 1, borderColor: Colors.border,
    fontSize: 15, color: Colors.blackDeep,
  },

  nextBtn: {
    backgroundColor: Colors.greenPrimary, borderRadius: Radius.md,
    paddingVertical: 16, alignItems: 'center', marginTop: 32,
    ...Shadows.greenFloat,
  },
  btnDisabled: { opacity: 0.3, shadowOpacity: 0 },
  nextBtnText: { color: Colors.blackDeep, fontSize: 16, fontWeight: '800' },
});
