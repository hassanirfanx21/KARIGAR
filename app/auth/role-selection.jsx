import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, Animated, Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Colors, Shadows, Spacing, Radius } from '../../constants/theme';

const { width: W } = Dimensions.get('window');

export default function RoleSelectionScreen() {
  const router = useRouter();
  const [role, setRole] = useState(null); // 'customer' | 'worker'
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }).start();
  }, []);

  const handleContinue = () => {
    if (role === 'customer') router.push('/auth/customer-registration');
    else if (role === 'worker') router.push('/auth/worker-registration');
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Text style={styles.backText}>← Wapas</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.title}>Aap Kaun Hain?</Text>
        <Text style={styles.subtitle}>Apna role chunein — aap baad mein badal bhi sakte hain</Text>

        {/* Role Cards */}
        <View style={styles.cardsRow}>
          {/* Customer Card */}
          <TouchableOpacity
            style={[styles.roleCard, role === 'customer' && styles.roleCardActive]}
            activeOpacity={0.85}
            onPress={() => setRole('customer')}
          >
            <View style={[styles.roleIconWrap, role === 'customer' && styles.roleIconActive]}>
              <Text style={{ fontSize: 36 }}>🏠</Text>
            </View>
            <Text style={[styles.roleName, role === 'customer' && styles.roleNameActive]}>Customer</Text>
            <Text style={styles.roleDesc}>Service mangwana hai</Text>
            {role === 'customer' && (
              <View style={styles.checkBadge}>
                <Text style={styles.checkText}>✓</Text>
              </View>
            )}
          </TouchableOpacity>

          {/* Worker Card */}
          <TouchableOpacity
            style={[styles.roleCard, role === 'worker' && styles.roleCardActive]}
            activeOpacity={0.85}
            onPress={() => setRole('worker')}
          >
            <View style={[styles.roleIconWrap, role === 'worker' && styles.roleIconActive]}>
              <Text style={{ fontSize: 36 }}>👷</Text>
            </View>
            <Text style={[styles.roleName, role === 'worker' && styles.roleNameActive]}>Karigar</Text>
            <Text style={styles.roleDesc}>Service dena hai</Text>
            {role === 'worker' && (
              <View style={styles.checkBadge}>
                <Text style={styles.checkText}>✓</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Continue */}
        <TouchableOpacity
          style={[styles.continueBtn, !role && styles.continueBtnDisabled]}
          activeOpacity={0.85}
          onPress={handleContinue}
          disabled={!role}
        >
          <Text style={styles.continueBtnText}>Agay Barho →</Text>
        </TouchableOpacity>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.whiteSoft },
  content: { flex: 1, paddingHorizontal: Spacing.xl },
  header: { paddingVertical: 16 },
  backBtn: { paddingVertical: 8 },
  backText: { color: Colors.textMuted, fontSize: 14, fontWeight: '600' },

  title: { color: Colors.blackDeep, fontSize: 28, fontWeight: '800', marginBottom: 8 },
  subtitle: { color: Colors.textMuted, fontSize: 14, marginBottom: 36, lineHeight: 22 },

  cardsRow: { flexDirection: 'row', gap: 14, marginBottom: 36 },
  roleCard: {
    flex: 1, backgroundColor: Colors.whitePure, borderRadius: Radius.xl,
    padding: 24, alignItems: 'center',
    borderWidth: 2, borderColor: Colors.border,
    ...Shadows.card,
  },
  roleCardActive: {
    borderColor: Colors.greenPrimary,
    backgroundColor: `${Colors.greenPrimary}08`,
    ...Shadows.greenFloat,
  },
  roleIconWrap: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: Colors.whiteSoft,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 16,
    borderWidth: 2, borderColor: Colors.border,
  },
  roleIconActive: { borderColor: Colors.greenPrimary, backgroundColor: `${Colors.greenPrimary}15` },
  roleName: { color: Colors.blackDeep, fontSize: 18, fontWeight: '800', marginBottom: 4 },
  roleNameActive: { color: Colors.greenPrimary },
  roleDesc: { color: Colors.textMuted, fontSize: 12 },
  checkBadge: {
    position: 'absolute', top: 12, right: 12,
    width: 26, height: 26, borderRadius: 13,
    backgroundColor: Colors.greenPrimary,
    alignItems: 'center', justifyContent: 'center',
  },
  checkText: { color: Colors.blackDeep, fontWeight: '900', fontSize: 14 },

  continueBtn: {
    backgroundColor: Colors.greenPrimary, borderRadius: Radius.md,
    paddingVertical: 16, alignItems: 'center',
    ...Shadows.greenFloat,
  },
  continueBtnDisabled: { opacity: 0.3, shadowOpacity: 0 },
  continueBtnText: { color: Colors.blackDeep, fontSize: 16, fontWeight: '800' },
});
