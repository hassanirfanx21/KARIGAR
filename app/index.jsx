import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Colors, Shadows, Spacing, Radius, FontSize } from '../constants/theme';

const { width: W, height: H } = Dimensions.get('window');

/* ─── Animated Gold Line ─── */
function GoldTraceLine() {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(anim, { toValue: 1, duration: 2500, useNativeDriver: true }),
        Animated.timing(anim, { toValue: 0, duration: 2500, useNativeDriver: true }),
      ])
    ).start();
  }, []);
  const translateY = anim.interpolate({ inputRange: [0, 1], outputRange: [-100, H + 100] });
  return (
    <Animated.View
      style={{
        position: 'absolute', left: 32, width: 2, height: 80,
        backgroundColor: Colors.greenPrimary, opacity: 0.3,
        borderRadius: 1, transform: [{ translateY }],
      }}
    />
  );
}

/* ─── Feature Card ─── */
function FeatureCard({ emoji, title, desc, delay }) {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(anim, { toValue: 1, duration: 600, delay, useNativeDriver: true }).start();
  }, []);
  return (
    <Animated.View style={[styles.featureCard, {
      opacity: anim,
      transform: [{ translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [30, 0] }) }],
    }]}>
      <View style={styles.featureIcon}>
        <Text style={{ fontSize: 24 }}>{emoji}</Text>
      </View>
      <Text style={styles.featureTitle}>{title}</Text>
      <Text style={styles.featureDesc}>{desc}</Text>
    </Animated.View>
  );
}

/* ─── Step Item ─── */
function StepItem({ number, title, desc, delay }) {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(anim, { toValue: 1, duration: 500, delay, useNativeDriver: true }).start();
  }, []);
  return (
    <Animated.View style={[styles.stepItem, {
      opacity: anim,
      transform: [{ translateX: anim.interpolate({ inputRange: [0, 1], outputRange: [-20, 0] }) }],
    }]}>
      <View style={styles.stepNumber}>
        <Text style={styles.stepNumberText}>{number}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.stepTitle}>{title}</Text>
        <Text style={styles.stepDesc}>{desc}</Text>
      </View>
    </Animated.View>
  );
}

/* ─── Trust Pill ─── */
function TrustPill({ emoji, label }) {
  return (
    <View style={styles.trustPill}>
      <Text style={{ fontSize: 14 }}>{emoji}</Text>
      <Text style={styles.trustText}>{label}</Text>
    </View>
  );
}

/* ─── Main Landing Screen ─── */
export default function LandingScreen() {
  const router = useRouter();
  const heroAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(heroAnim, { toValue: 1, tension: 40, friction: 8, useNativeDriver: true }).start();
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.blackDeep} />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* ═══ HERO ═══ */}
        <View style={styles.heroSection}>
          <GoldTraceLine />
          <SafeAreaView edges={['top']}>
            <Animated.View style={{
              opacity: heroAnim,
              transform: [{ scale: heroAnim.interpolate({ inputRange: [0, 1], outputRange: [0.9, 1] }) }],
            }}>
              {/* Logo */}
              <View style={styles.logoRow}>
                <View style={styles.logoMark}>
                  <Text style={styles.logoMarkText}>K</Text>
                </View>
                <Text style={styles.logoText}>KARIGAR</Text>
              </View>

              {/* Tagline */}
              <Text style={styles.heroTagline}>
                Aapka Apna{'\n'}
                <Text style={styles.heroHighlight}>AI Karigar</Text> Agent
              </Text>
              <Text style={styles.heroSub}>
                Bolo kya chahiye — AI samjhega, karigar dhundhega,{'\n'}booking ho jayegi. Itna simple.
              </Text>

              {/* CTA */}
              <TouchableOpacity
                style={styles.ctaButton}
                activeOpacity={0.85}
                onPress={() => router.push('/auth/login')}
              >
                <Text style={styles.ctaText}>Shuru Karein →</Text>
              </TouchableOpacity>

              {/* Agent trace preview */}
              <View style={styles.tracePreview}>
                <View style={styles.traceHeader}>
                  <View style={styles.traceKMark}>
                    <Text style={{ color: Colors.blackDeep, fontWeight: '900', fontSize: 10 }}>K</Text>
                  </View>
                  <Text style={styles.traceHeaderLabel}>KARIGAR Agent</Text>
                  <Text style={styles.traceHeaderDone}>Mukammal ✓</Text>
                </View>
                {[
                  'Request samajh li ✓',
                  '4 Karigar mile ✓',
                  'Match mil gaya! ✓',
                  'Booking ho gayi! ✓',
                ].map((step, i) => (
                  <View key={i} style={styles.traceStep}>
                    <View style={styles.traceDot} />
                    <Text style={styles.traceStepText}>{step}</Text>
                  </View>
                ))}
              </View>
            </Animated.View>
          </SafeAreaView>
        </View>

        {/* ═══ FEATURES ═══ */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>KYA MILEGA</Text>
          <Text style={styles.sectionTitle}>AI + Karigar = Magic</Text>
          <View style={styles.featureGrid}>
            <FeatureCard emoji="🤖" title="AI Agent" desc="Baat karo, booking ho" delay={100} />
            <FeatureCard emoji="📍" title="Qareeb Karigar" desc="Aas paas ke verified" delay={200} />
            <FeatureCard emoji="⚡" title="3 Sec Booking" desc="Agent sab karega" delay={300} />
            <FeatureCard emoji="🛡️" title="Trust Score" desc="Rating based ranking" delay={400} />
          </View>
        </View>

        {/* ═══ HOW IT WORKS ═══ */}
        <View style={[styles.section, { backgroundColor: Colors.blackDeep }]}>
          <Text style={[styles.sectionLabel, { color: Colors.greenPrimary }]}>KAISE KAAM KARTA HAI</Text>
          <Text style={[styles.sectionTitle, { color: Colors.textOnDark }]}>3 Simple Steps</Text>
          <StepItem number="1" title="Bolo ya Likho" desc="Apni zaroorat batayen — AI samajh jayega" delay={100} />
          <StepItem number="2" title="Agent Dhundhega" desc="Best karigar match karega automatically" delay={200} />
          <StepItem number="3" title="Booking Done!" desc="Confirm karo, karigar aa jayega" delay={300} />
        </View>

        {/* ═══ TRUST ═══ */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>BHAROSA</Text>
          <Text style={styles.sectionTitle}>Verified Karigars</Text>
          <View style={styles.trustRow}>
            <TrustPill emoji="✅" label="ID Verified" />
            <TrustPill emoji="⭐" label="4.5+ Rating" />
            <TrustPill emoji="🔒" label="Secure Payments" />
          </View>
          <View style={styles.trustRow}>
            <TrustPill emoji="📞" label="24/7 Support" />
            <TrustPill emoji="🛡️" label="Insured Work" />
          </View>
        </View>

        {/* ═══ FOOTER ═══ */}
        <View style={styles.footer}>
          <View style={styles.footerLogoRow}>
            <View style={styles.footerMark}>
              <Text style={{ color: Colors.blackDeep, fontWeight: '900', fontSize: 14 }}>K</Text>
            </View>
            <Text style={styles.footerLogo}>KARIGAR</Text>
          </View>
          <Text style={styles.footerCopy}>AI-Powered Service Orchestration Platform</Text>
          <Text style={styles.footerVersion}>v1.0.0 • Made in Pakistan 🇵🇰</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.whiteSoft },
  scroll: { flexGrow: 1 },

  // Hero
  heroSection: {
    backgroundColor: Colors.blackDeep,
    paddingHorizontal: Spacing.xl,
    paddingBottom: 40,
    borderBottomLeftRadius: Radius.header,
    borderBottomRightRadius: Radius.header,
    overflow: 'hidden',
  },
  logoRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 32, marginTop: 16 },
  logoMark: {
    width: 36, height: 36, borderRadius: 12,
    backgroundColor: Colors.greenPrimary,
    alignItems: 'center', justifyContent: 'center',
  },
  logoMarkText: { color: Colors.blackDeep, fontWeight: '900', fontSize: 18 },
  logoText: { color: Colors.textOnDark, fontSize: 18, fontWeight: '800', letterSpacing: 2 },

  heroTagline: { color: Colors.textOnDark, fontSize: 32, fontWeight: '800', lineHeight: 40, marginBottom: 14 },
  heroHighlight: { color: Colors.greenPrimary },
  heroSub: { color: Colors.textMuted, fontSize: 14, lineHeight: 22, marginBottom: 28 },

  ctaButton: {
    backgroundColor: Colors.greenPrimary, borderRadius: Radius.md,
    paddingVertical: 16, alignItems: 'center', marginBottom: 28,
    ...Shadows.greenFloat,
  },
  ctaText: { color: Colors.blackDeep, fontSize: 16, fontWeight: '800' },

  // Trace preview
  tracePreview: {
    backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: Radius.lg,
    padding: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
  },
  traceHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  traceKMark: {
    width: 22, height: 22, borderRadius: 11,
    backgroundColor: Colors.greenPrimary,
    alignItems: 'center', justifyContent: 'center',
  },
  traceHeaderLabel: { flex: 1, color: Colors.textMuted, fontSize: 10, fontWeight: '700', letterSpacing: 1 },
  traceHeaderDone: { color: Colors.successGreen, fontSize: 10, fontWeight: '700' },
  traceStep: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 4 },
  traceDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.successGreen },
  traceStepText: { color: Colors.textOnDark, fontSize: 12, fontWeight: '600' },

  // Sections
  section: { paddingHorizontal: Spacing.xl, paddingVertical: 36 },
  sectionLabel: {
    color: Colors.greenPrimary, fontSize: 10, fontWeight: '800',
    letterSpacing: 1.5, marginBottom: 6,
  },
  sectionTitle: { color: Colors.blackDeep, fontSize: 24, fontWeight: '800', marginBottom: 20 },

  // Features
  featureGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  featureCard: {
    width: (W - 52) / 2, backgroundColor: Colors.whitePure,
    borderRadius: Radius.lg, padding: 18,
    borderWidth: 1, borderColor: Colors.border,
    ...Shadows.card,
  },
  featureIcon: {
    width: 44, height: 44, borderRadius: 14,
    backgroundColor: `${Colors.greenPrimary}15`,
    alignItems: 'center', justifyContent: 'center', marginBottom: 12,
  },
  featureTitle: { color: Colors.blackDeep, fontSize: 15, fontWeight: '700', marginBottom: 4 },
  featureDesc: { color: Colors.textMuted, fontSize: 12 },

  // Steps
  stepItem: { flexDirection: 'row', alignItems: 'flex-start', gap: 14, marginBottom: 20 },
  stepNumber: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: Colors.greenPrimary,
    alignItems: 'center', justifyContent: 'center',
  },
  stepNumberText: { color: Colors.blackDeep, fontSize: 16, fontWeight: '900' },
  stepTitle: { color: Colors.textOnDark, fontSize: 16, fontWeight: '700', marginBottom: 3 },
  stepDesc: { color: 'rgba(240,237,232,0.5)', fontSize: 13 },

  // Trust
  trustRow: { flexDirection: 'row', gap: 10, marginBottom: 10, flexWrap: 'wrap' },
  trustPill: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: Colors.whitePure, borderRadius: Radius.full,
    paddingHorizontal: 14, paddingVertical: 8,
    borderWidth: 1, borderColor: Colors.border,
  },
  trustText: { color: Colors.blackDeep, fontSize: 12, fontWeight: '600' },

  // Footer
  footer: {
    backgroundColor: Colors.blackDeep,
    paddingHorizontal: Spacing.xl, paddingVertical: 36,
    alignItems: 'center',
  },
  footerLogoRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  footerMark: {
    width: 28, height: 28, borderRadius: 10,
    backgroundColor: Colors.greenPrimary,
    alignItems: 'center', justifyContent: 'center',
  },
  footerLogo: { color: Colors.textOnDark, fontSize: 16, fontWeight: '800', letterSpacing: 2 },
  footerCopy: { color: Colors.textMuted, fontSize: 12, marginBottom: 4 },
  footerVersion: { color: 'rgba(255,255,255,0.2)', fontSize: 11 },
});
