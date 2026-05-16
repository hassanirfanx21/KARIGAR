import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  Animated, Dimensions, KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Colors, Shadows, Spacing, Radius, FontSize } from '../../constants/theme';

const { height: H } = Dimensions.get('window');

export default function LoginScreen() {
  const router = useRouter();
  const [phone, setPhone] = useState('');
  const [step, setStep] = useState('phone'); // 'phone' | 'otp'
  const [otp, setOtp] = useState(['', '', '', '']);
  const [countdown, setCountdown] = useState(30);
  const [canResend, setCanResend] = useState(false);
  const slideAnim = useRef(new Animated.Value(H)).current;
  const otpRefs = [useRef(null), useRef(null), useRef(null), useRef(null)];

  useEffect(() => {
    Animated.spring(slideAnim, {
      toValue: 0, tension: 50, friction: 10, useNativeDriver: true,
    }).start();
  }, []);

  useEffect(() => {
    if (step === 'otp' && countdown > 0) {
      const timer = setTimeout(() => setCountdown(c => c - 1), 1000);
      return () => clearTimeout(timer);
    }
    if (countdown === 0) setCanResend(true);
  }, [step, countdown]);

  const handleSendOtp = () => {
    if (phone.length >= 10) {
      setStep('otp');
      setCountdown(30);
      setCanResend(false);
    }
  };

  const handleOtpChange = (val, idx) => {
    const newOtp = [...otp];
    newOtp[idx] = val;
    setOtp(newOtp);
    if (val && idx < 3) otpRefs[idx + 1].current?.focus();
  };

  const handleVerify = () => {
    const code = otp.join('');
    if (code.length === 4) {
      router.push('/auth/role-selection');
    }
  };

  return (
    <View style={styles.container}>
      {/* Dark backdrop */}
      <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={() => router.back()}>
        <SafeAreaView edges={['top']}>
          <View style={styles.topBar}>
            <View style={styles.logoRow}>
              <View style={styles.logoMark}>
                <Text style={{ color: Colors.blackDeep, fontWeight: '900', fontSize: 14 }}>K</Text>
              </View>
              <Text style={styles.logoText}>KARIGAR</Text>
            </View>
          </View>
        </SafeAreaView>
      </TouchableOpacity>

      {/* Bottom sheet */}
      <Animated.View style={[styles.sheet, { transform: [{ translateY: slideAnim }] }]}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View style={styles.handleWrap}>
            <View style={styles.handle} />
          </View>

          {step === 'phone' ? (
            <View style={styles.sheetContent}>
              <Text style={styles.sheetTitle}>Assalamualaikum! 👋</Text>
              <Text style={styles.sheetSubtitle}>Apna phone number darj karein</Text>

              <View style={styles.phoneInputRow}>
                <View style={styles.countryCode}>
                  <Text style={styles.countryFlag}>🇵🇰</Text>
                  <Text style={styles.countryText}>+92</Text>
                </View>
                <TextInput
                  style={styles.phoneInput}
                  placeholder="3XX XXXXXXX"
                  placeholderTextColor={Colors.textMuted}
                  keyboardType="phone-pad"
                  value={phone}
                  onChangeText={setPhone}
                  maxLength={10}
                />
              </View>

              <TouchableOpacity
                style={[styles.ctaBtn, phone.length < 10 && styles.ctaBtnDisabled]}
                activeOpacity={0.85}
                onPress={handleSendOtp}
                disabled={phone.length < 10}
              >
                <Text style={styles.ctaBtnText}>OTP Bhejein →</Text>
              </TouchableOpacity>

              <Text style={styles.termsText}>
                Continue karke aap hamare Terms aur Privacy Policy se mutafiq hain
              </Text>
            </View>
          ) : (
            <View style={styles.sheetContent}>
              <Text style={styles.sheetTitle}>OTP Darj Karein 🔐</Text>
              <Text style={styles.sheetSubtitle}>
                +92 {phone} par bheja gaya 4-digit code
              </Text>

              <View style={styles.otpRow}>
                {otp.map((digit, i) => (
                  <TextInput
                    key={i}
                    ref={otpRefs[i]}
                    style={[styles.otpBox, digit && styles.otpBoxFilled]}
                    keyboardType="number-pad"
                    maxLength={1}
                    value={digit}
                    onChangeText={val => handleOtpChange(val, i)}
                    onKeyPress={({ nativeEvent }) => {
                      if (nativeEvent.key === 'Backspace' && !digit && i > 0) {
                        otpRefs[i - 1].current?.focus();
                      }
                    }}
                  />
                ))}
              </View>

              <TouchableOpacity
                style={[styles.ctaBtn, otp.join('').length < 4 && styles.ctaBtnDisabled]}
                activeOpacity={0.85}
                onPress={handleVerify}
                disabled={otp.join('').length < 4}
              >
                <Text style={styles.ctaBtnText}>Verify Karein ✓</Text>
              </TouchableOpacity>

              <View style={styles.resendRow}>
                {canResend ? (
                  <TouchableOpacity onPress={() => { setCountdown(30); setCanResend(false); }}>
                    <Text style={styles.resendActive}>Dobara Bhejein</Text>
                  </TouchableOpacity>
                ) : (
                  <Text style={styles.resendTimer}>Dobara bhejein {countdown}s mein</Text>
                )}
              </View>

              <TouchableOpacity onPress={() => { setStep('phone'); setOtp(['', '', '', '']); }}>
                <Text style={styles.changeNumber}>← Number badlein</Text>
              </TouchableOpacity>
            </View>
          )}
        </KeyboardAvoidingView>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.blackDeep },
  backdrop: { flex: 1 },
  topBar: { paddingHorizontal: Spacing.xl, paddingTop: 16 },
  logoRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  logoMark: {
    width: 32, height: 32, borderRadius: 10,
    backgroundColor: Colors.greenPrimary,
    alignItems: 'center', justifyContent: 'center',
  },
  logoText: { color: Colors.textOnDark, fontSize: 16, fontWeight: '800', letterSpacing: 2 },

  sheet: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: Colors.whitePure,
    borderTopLeftRadius: Radius.header, borderTopRightRadius: Radius.header,
    ...Shadows.darkHeader,
  },
  handleWrap: { alignItems: 'center', paddingTop: 12, paddingBottom: 4 },
  handle: { width: 44, height: 4, borderRadius: 2, backgroundColor: Colors.border },

  sheetContent: { paddingHorizontal: Spacing.xxl, paddingBottom: 40, paddingTop: 16 },
  sheetTitle: { color: Colors.blackDeep, fontSize: 24, fontWeight: '800', marginBottom: 6 },
  sheetSubtitle: { color: Colors.textMuted, fontSize: 14, marginBottom: 28 },

  phoneInputRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  countryCode: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: Colors.whiteSoft, borderRadius: Radius.md,
    paddingHorizontal: 14, paddingVertical: 14,
    borderWidth: 1, borderColor: Colors.border,
  },
  countryFlag: { fontSize: 18 },
  countryText: { color: Colors.blackDeep, fontSize: 15, fontWeight: '700' },
  phoneInput: {
    flex: 1, backgroundColor: Colors.whiteSoft, borderRadius: Radius.md,
    paddingHorizontal: 16, paddingVertical: 14,
    borderWidth: 1, borderColor: Colors.border,
    fontSize: 16, fontWeight: '600', color: Colors.blackDeep,
    letterSpacing: 1,
  },

  ctaBtn: {
    backgroundColor: Colors.greenPrimary, borderRadius: Radius.md,
    paddingVertical: 16, alignItems: 'center',
    ...Shadows.greenFloat,
  },
  ctaBtnDisabled: { opacity: 0.4, ...{ shadowOpacity: 0 } },
  ctaBtnText: { color: Colors.blackDeep, fontSize: 16, fontWeight: '800' },

  termsText: {
    color: Colors.textMuted, fontSize: 11, textAlign: 'center',
    marginTop: 20, lineHeight: 18,
  },

  otpRow: { flexDirection: 'row', justifyContent: 'center', gap: 12, marginBottom: 24 },
  otpBox: {
    width: 56, height: 64, borderRadius: Radius.md,
    borderWidth: 1.5, borderColor: Colors.border,
    backgroundColor: Colors.whiteSoft,
    textAlign: 'center', fontSize: 24, fontWeight: '800',
    color: Colors.blackDeep,
  },
  otpBoxFilled: { borderColor: Colors.greenPrimary, backgroundColor: `${Colors.greenPrimary}10` },

  resendRow: { alignItems: 'center', marginTop: 20 },
  resendTimer: { color: Colors.textMuted, fontSize: 13 },
  resendActive: { color: Colors.greenPrimary, fontSize: 14, fontWeight: '700' },
  changeNumber: { color: Colors.textMuted, fontSize: 13, textAlign: 'center', marginTop: 12 },
});
